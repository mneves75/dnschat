import { DNS_CONSTANTS } from "./constants";

export enum DNSErrorType {
  PLATFORM_UNSUPPORTED = "PLATFORM_UNSUPPORTED",
  NETWORK_UNAVAILABLE = "NETWORK_UNAVAILABLE",
  DNS_SERVER_UNREACHABLE = "DNS_SERVER_UNREACHABLE",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  TIMEOUT = "TIMEOUT",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  DNS_QUERY_FAILED = "DNS_QUERY_FAILED",
}

export class DNSError extends Error {
  constructor(
    public readonly type: DNSErrorType,
    message: string,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = "DNSError";
  }
}

// SECURITY: Inbound response sanitization.
// Strips C0/C1 control characters (keeping \n and \t) and Unicode bidirectional
// control characters (U+202A-U+202E, U+2066-U+2069) that could be used for
// terminal-escape or display-spoofing tricks in TXT responses from untrusted
// DNS servers. Applied at the multipart-parse choke point below and again on
// the final response in DNSService.queryLLM so every transport is covered.
const UNSAFE_RESPONSE_CHARS_REGEX =
  // eslint-disable-next-line no-control-regex
  /[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g;

export function sanitizeLLMResponseText(text: string): string {
  return text.replace(UNSAFE_RESPONSE_CHARS_REGEX, "");
}

/**
 * Parse multi-part TXT responses (format: "1/3:", "2/3:", etc.).
 *
 * Single canonical implementation shared by the native transport
 * (NativeDNS.parseMultiPartResponse) and the JS UDP/TCP transports
 * (dnsService.parseTXTResponse, which wraps DNSError into plain Error at the
 * boundary).
 *
 * Behavior:
 * - If all non-empty records are plain (no "n/N:" prefix), concatenate them in order
 * - If all non-empty records are multipart, require a complete set [1..N] and join in order
 * - Reject responses that mix plain and multipart records
 * - Reject multipart sets declaring more than DNS_CONSTANTS.MAX_TXT_PARTS parts
 * - Throw DNSError(INVALID_RESPONSE) on empty input or incomplete/inconsistent sets
 * - Sanitize the assembled text (control/bidi characters) before returning
 */
export function parseMultiPartTXTResponse(txtRecords: string[]): string {
  if (txtRecords.length === 0) {
    throw new DNSError(
      DNSErrorType.INVALID_RESPONSE,
      "No TXT records to parse",
    );
  }
  if (txtRecords.length === 1) {
    const rawValue = String(txtRecords[0] ?? "");
    const first = rawValue.charCodeAt(0);
    const sanitizedResponse = sanitizeLLMResponseText(rawValue);
    if ((first < 48 || first > 57) && first > 32) {
      if (!sanitizedResponse.trim()) {
        throw new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          "Received empty response",
        );
      }
      return sanitizedResponse;
    }
    if (!rawValue.trim()) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        "Received empty response",
      );
    }
    if (!/^\s*\d+\/\d+:/.test(rawValue)) {
      if (!sanitizedResponse.trim()) {
        throw new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          "Received empty response",
        );
      }
      return sanitizedResponse;
    }
  }

  type Part = { partNumber: number; totalParts: number; content: string };
  const parts: Part[] = [];
  let plainResponse = "";
  let hasPlainResponse = false;

  for (const record of txtRecords) {
    const rawValue = String(record ?? "");
    const first = rawValue.charCodeAt(0);
    if ((first < 48 || first > 57) && first > 32) {
      plainResponse += rawValue;
      hasPlainResponse = true;
      continue;
    }
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) {
      continue;
    }

    const match = rawValue.match(/^\s*(\d+)\/(\d+):(.*)$/s);
    if (match && match[1] && match[2] && match[3] !== undefined) {
      parts.push({
        partNumber: parseInt(match[1], 10),
        totalParts: parseInt(match[2], 10),
        content: match[3],
      });
    } else {
      plainResponse += rawValue;
      hasPlainResponse = true;
    }
  }

  if (hasPlainResponse) {
    if (parts.length > 0) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        "Mixed plain and multipart TXT records",
      );
    }
    const sanitizedResponse = sanitizeLLMResponseText(plainResponse);
    if (!sanitizedResponse.trim()) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        "Received empty response",
      );
    }
    return sanitizedResponse;
  }

  if (parts.length === 0) {
    throw new DNSError(
      DNSErrorType.INVALID_RESPONSE,
      "No TXT records to parse",
    );
  }

  const firstPart = parts[0];
  if (!firstPart) {
    throw new DNSError(
      DNSErrorType.INVALID_RESPONSE,
      "No TXT records to parse",
    );
  }
  const expectedTotal = firstPart.totalParts;

  // SECURITY: Explicit cap on declared part counts. Without this, a record like
  // "1/999999999999999:" previously relied on an incidental RangeError from a
  // huge array allocation instead of a deliberate validation failure.
  if (expectedTotal > DNS_CONSTANTS.MAX_TXT_PARTS) {
    throw new DNSError(
      DNSErrorType.INVALID_RESPONSE,
      `Multi-part response declares ${expectedTotal} parts, exceeding the maximum of ${DNS_CONSTANTS.MAX_TXT_PARTS}`,
    );
  }

  const byPart = Array.from<string | undefined>({ length: expectedTotal });
  let receivedParts = 0;

  for (const part of parts) {
    if (part.totalParts !== expectedTotal) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        `Inconsistent multi-part response: expected ${expectedTotal} total parts but received ${part.totalParts} for part ${part.partNumber}`,
      );
    }

    const index = part.partNumber - 1;
    const existing = byPart[index];
    if (existing !== undefined) {
      if (existing === part.content) {
        // Harmless retransmission; skip duplicates with identical payloads
        continue;
      }
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        `Conflicting content for part ${part.partNumber}: duplicate part payload differs`,
      );
    }
    byPart[index] = part.content;
    receivedParts++;
  }

  if (expectedTotal <= 0 || receivedParts !== expectedTotal) {
    throw new DNSError(
      DNSErrorType.INVALID_RESPONSE,
      `Incomplete multi-part response: got ${receivedParts} parts, expected ${expectedTotal}`,
    );
  }

  let fullResponse = "";
  for (let i = 1; i <= expectedTotal; i++) {
    const content = byPart[i - 1];
    if (typeof content !== "string") {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        `Incomplete multi-part response: missing part ${i}`,
      );
    }
    fullResponse += content;
  }

  const sanitizedResponse = sanitizeLLMResponseText(fullResponse);
  if (!sanitizedResponse.trim()) {
    throw new DNSError(
      DNSErrorType.INVALID_RESPONSE,
      "Received empty response",
    );
  }
  return sanitizedResponse;
}
