import { NativeModules, Platform } from "react-native";
import { getNativeSanitizerConfig, getServerPort, DNS_CONSTANTS } from "./constants";
import type { NativeSanitizerConfig } from "./constants";

const isJestRuntime = (): boolean => {
  try {
    return (
      typeof process !== "undefined" &&
      typeof process.env === "object" &&
      process.env !== null &&
      typeof process.env["JEST_WORKER_ID"] === "string"
    );
  } catch {
    return false;
  }
};

const isExplicitDebugEnabled = (): boolean => {
  try {
    const globalRecord = globalThis as Record<string, unknown>;
    if (globalRecord["__DNSCHAT_NATIVE_DEBUG__"] === true) return true;
  } catch {}
  try {
    if (typeof process !== "undefined" && process.env?.["DNSCHAT_NATIVE_DEBUG"] === "1") {
      return true;
    }
  } catch {}
  return false;
};

const isNativeDebugEnabled = (): boolean => {
  const dev = typeof __DEV__ !== "undefined" ? Boolean(__DEV__) : false;
  const explicit = isExplicitDebugEnabled();

  if (isJestRuntime()) {
    return explicit;
  }

  if (!dev) return false;
  return explicit;
};
const debugLog = (...args: unknown[]) => {
  if (isNativeDebugEnabled()) {
    console.log(...args);
  }
};
const debugWarn = (...args: unknown[]) => {
  if (isNativeDebugEnabled()) {
    console.warn(...args);
  }
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record["message"] === "string") return record["message"];
  }
  return "Unknown DNS error occurred";
};

const getErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") return undefined;
  const record = error as Record<string, unknown>;
  return typeof record["code"] === "string" ? record["code"] : undefined;
};

const getErrorDetails = (error: unknown): { message: string; code?: string } => {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  return code ? { message, code } : { message };
};

export interface DNSCapabilities {
  available: boolean;
  platform: "ios" | "android" | "web";
  supportsCustomServer: boolean;
  supportsAsyncQuery: boolean;
  apiLevel?: number; // Android only
}

export interface NativeDNSModule {
  /**
   * Query TXT records from a DNS server
   * @param domain - DNS server hostname (e.g., 'llm.pieter.com', 'ch.at')
   * @param message - Fully qualified domain name to query (already sanitized)
   * @param port - DNS port (53 for the allowlisted resolvers)
   * @returns Promise resolving to array of TXT record strings
   */
  queryTXT(domain: string, message: string, port: number): Promise<string[]>;
  queryTXTUDP?(domain: string, message: string, port: number): Promise<string[]>;
  queryTXTTCP?(domain: string, message: string, port: number): Promise<string[]>;

  /**
   * Check if native DNS functionality is available on this platform
   * @returns Promise resolving to platform capabilities
   */
  isAvailable(): Promise<DNSCapabilities>;
  configureSanitizer?(config: NativeSanitizerConfig): void | Promise<boolean>;
  debugSanitizeLabel?(label: string): Promise<string>;
}

type NativeDNSQueryMethod = "queryTXT" | "queryTXTUDP" | "queryTXTTCP";

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
 * - If any record is plain (no "n/N:" prefix), concatenate plain records in order
 * - If multipart records are present, require a complete set [1..N] and join in order
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
    if ((first < 48 || first > 57) && first > 32) return sanitizeLLMResponseText(rawValue);
    if (!rawValue.trim()) {
      throw new DNSError(DNSErrorType.INVALID_RESPONSE, "Received empty response");
    }
    if (!/^\s*\d+\/\d+:/.test(rawValue)) return sanitizeLLMResponseText(rawValue);
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

    const match = rawValue.match(/^\s*(\d+)\/(\d+):(.*)$/);
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
    if (!plainResponse.trim()) {
      throw new DNSError(DNSErrorType.INVALID_RESPONSE, "Received empty response");
    }
    return sanitizeLLMResponseText(plainResponse);
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

  const byPart = new Array<string | undefined>(expectedTotal);
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

  if (!fullResponse.trim()) {
    throw new DNSError(DNSErrorType.INVALID_RESPONSE, "Received empty response");
  }
  return sanitizeLLMResponseText(fullResponse);
}

export class NativeDNS implements NativeDNSModule {
  private readonly nativeModule: NativeDNSModule | null;
  private capabilities: DNSCapabilities | null = null;
  private capabilitiesTimestamp = 0;
  private sanitizerConfigurationPromise: Promise<void> | null = null;
  private sanitizerConfigurationError: Error | null = null;
  // RACE CONDITION FIX: Promise lock to prevent concurrent isAvailable() calls
  // from all bypassing the cache and making redundant native module calls.
  private capabilitiesPromise: Promise<DNSCapabilities> | null = null;
  // SECURITY: TTL prevents stale network configuration from persisting forever.
  // 30 seconds is long enough to avoid repeated native calls but short enough
  // to detect network changes (e.g., WiFi to cellular, VPN connection).
  private static readonly CAPABILITIES_TTL_MS = 30000;

  private configureSanitizerIfNeeded(): void {
    if (!this.nativeModule) return;
    debugLog("[NativeDNS] RNDNSModule methods:", Object.keys(this.nativeModule));
    if (typeof this.nativeModule.configureSanitizer !== "function") {
      this.sanitizerConfigurationError = new Error(
        "Native DNS module does not expose sanitizer configuration",
      );
      debugWarn("[NativeDNS] Failed to configure sanitizer:", this.sanitizerConfigurationError);
      return;
    }

    try {
      const maybeResult = this.nativeModule.configureSanitizer(
        getNativeSanitizerConfig(),
      );

      if (maybeResult && typeof (maybeResult as Promise<unknown>).then === "function") {
        this.sanitizerConfigurationPromise = (maybeResult as Promise<boolean>)
          .then((didUpdate) => {
            if (didUpdate) {
              debugLog("[NativeDNS] Sanitizer configured via shared constants");
            } else {
              debugLog("[NativeDNS] Sanitizer already up to date; skipped reconfiguration");
            }
            this.sanitizerConfigurationError = null;
          })
          .catch((error: unknown) => {
            this.sanitizerConfigurationError =
              error instanceof Error ? error : new Error(String(error));
            debugWarn("[NativeDNS] Failed to configure sanitizer:", error);
          })
          .then(() => {
            this.sanitizerConfigurationPromise = null;
          });
      } else if (maybeResult !== undefined) {
        this.sanitizerConfigurationError = null;
        debugLog("[NativeDNS] Sanitizer configured via shared constants");
      } else {
        this.sanitizerConfigurationError = null;
      }
    } catch (error) {
      this.sanitizerConfigurationError =
        error instanceof Error ? error : new Error(String(error));
      debugWarn("[NativeDNS] Failed to configure sanitizer:", error);
    }
  }

  private async ensureSanitizerConfigured(): Promise<void> {
    if (this.sanitizerConfigurationPromise) {
      await this.sanitizerConfigurationPromise;
    }

    if (this.sanitizerConfigurationError) {
      throw new DNSError(
        DNSErrorType.PLATFORM_UNSUPPORTED,
        "Native DNS sanitizer configuration failed",
        this.sanitizerConfigurationError,
      );
    }
  }

  constructor(nativeModuleOverride?: NativeDNSModule | null) {
    // Try to get the native module, but don't crash if it's not available
    debugLog("[NativeDNS] constructor called");
    debugLog("[NativeDNS] Available NativeModules keys:", Object.keys(NativeModules));
    debugLog("[NativeDNS] Looking for RNDNSModule...");

    if (nativeModuleOverride !== undefined) {
      this.nativeModule = nativeModuleOverride;
      this.configureSanitizerIfNeeded();
      return;
    }

    try {
      this.nativeModule = NativeModules["RNDNSModule"] as NativeDNSModule;
      debugLog("[NativeDNS] RNDNSModule found:", !!this.nativeModule);
      this.configureSanitizerIfNeeded();
    } catch (error) {
      debugWarn("[NativeDNS] Native DNS module not available:", error);
      this.nativeModule = null;
    }
  }

  private async queryWithNativeMethod(
    method: NativeDNSQueryMethod,
    domain: string,
    message: string,
    port?: number,
  ): Promise<string[]> {
    if (!this.nativeModule) {
      throw new DNSError(
        DNSErrorType.PLATFORM_UNSUPPORTED,
        "Native DNS module is not available on this platform",
      );
    }

    await this.ensureSanitizerConfigured();

    const trimmedMessage = message?.trim();
    if (!trimmedMessage) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        "Message cannot be empty",
      );
    }

    // Use provided port, or look up from server config, or default to 53
    const dnsPort = port ?? getServerPort(domain) ?? DNS_CONSTANTS.DNS_PORT;

    // SECURITY: Validate port is in valid range (1-65535)
    // Ports 0 and negative values are invalid; ports > 65535 don't exist
    if (dnsPort < 1 || dnsPort > 65535) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        `Invalid DNS port: ${dnsPort}. Must be between 1 and 65535.`,
      );
    }

    debugLog(`[NativeDNS] ${method}: ${domain}:${dnsPort}`, {
      queryNameLength: trimmedMessage.length,
    });

    try {
      const nativeQuery = this.nativeModule[method];
      if (typeof nativeQuery !== "function") {
        throw new DNSError(
          DNSErrorType.PLATFORM_UNSUPPORTED,
          `Native DNS module does not expose ${method}`,
        );
      }
      const result = await nativeQuery(domain, trimmedMessage, dnsPort);

      if (!Array.isArray(result) || result.length === 0) {
        throw new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          "No TXT records received from DNS server",
        );
      }

      return result;
    } catch (error: unknown) {
      // Preserve already-classified DNSError types
      if (error instanceof DNSError) {
        throw error;
      }

      const details = getErrorDetails(error);
      const messageLower = details.message.toLowerCase();
      const cause = error instanceof Error ? error : undefined;

      // Map native errors to our error types
      if (details.code === "DNS_QUERY_FAILED") {
        throw new DNSError(
          DNSErrorType.DNS_QUERY_FAILED,
          details.message || "DNS query failed",
          cause,
        );
      }

      if (
        messageLower.includes("timeout") ||
        messageLower.includes("timed out")
      ) {
        throw new DNSError(DNSErrorType.TIMEOUT, "DNS query timed out", cause);
      }

      if (
        messageLower.includes("network") ||
        messageLower.includes("connectivity")
      ) {
        throw new DNSError(
          DNSErrorType.NETWORK_UNAVAILABLE,
          "Network unavailable for DNS query",
          cause,
        );
      }

      if (
        messageLower.includes("permission") ||
        messageLower.includes("denied")
      ) {
        throw new DNSError(
          DNSErrorType.PERMISSION_DENIED,
          "DNS query permission denied",
          cause,
        );
      }

      // Default to DNS query failed
      throw new DNSError(
        DNSErrorType.DNS_QUERY_FAILED,
        details.message || "Unknown DNS error occurred",
        cause,
      );
    }
  }

  async queryTXT(domain: string, message: string, port?: number): Promise<string[]> {
    return this.queryWithNativeMethod("queryTXT", domain, message, port);
  }

  async queryTXTUDP(domain: string, message: string, port?: number): Promise<string[]> {
    return this.queryWithNativeMethod("queryTXTUDP", domain, message, port);
  }

  async queryTXTTCP(domain: string, message: string, port?: number): Promise<string[]> {
    return this.queryWithNativeMethod("queryTXTTCP", domain, message, port);
  }

  async isAvailable(): Promise<DNSCapabilities> {
    const now = Date.now();

    // Return cached capabilities if still valid
    if (
      this.capabilities &&
      now - this.capabilitiesTimestamp < NativeDNS.CAPABILITIES_TTL_MS
    ) {
      return this.capabilities;
    }

    // RACE CONDITION FIX: If there's already a pending request, wait for it
    // instead of making a redundant native call. Multiple concurrent calls
    // would all bypass the cache check above simultaneously without this lock.
    if (this.capabilitiesPromise) {
      return this.capabilitiesPromise;
    }

    if (!this.nativeModule) {
      this.capabilities = {
        available: false,
        platform: "web",
        supportsCustomServer: false,
        supportsAsyncQuery: false,
      };
      this.capabilitiesTimestamp = now;
      return this.capabilities;
    }

    try {
      await this.ensureSanitizerConfigured();
    } catch (error) {
      debugWarn("Failed to check DNS availability:", error);
      const unavailableCapabilities: DNSCapabilities = {
        available: false,
        platform:
          Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : "web",
        supportsCustomServer: false,
        supportsAsyncQuery: false,
      };
      this.capabilities = unavailableCapabilities;
      this.capabilitiesTimestamp = now;
      return unavailableCapabilities;
    }

    // RACE CONDITION FIX: Create promise lock before async operation
    this.capabilitiesPromise = (async () => {
      try {
        this.capabilities = await this.nativeModule!.isAvailable();
        this.capabilitiesTimestamp = Date.now();
        return this.capabilities;
      } catch (error) {
      debugWarn("Failed to check DNS availability:", error);
      this.capabilities = {
          available: false,
          platform: "web",
          supportsCustomServer: false,
          supportsAsyncQuery: false,
        };
        this.capabilitiesTimestamp = Date.now();
        return this.capabilities;
      } finally {
        // Clear the promise lock after completion
        this.capabilitiesPromise = null;
      }
    })();

    return this.capabilitiesPromise;
  }

  /**
   * Force refresh of capabilities on next isAvailable() call.
   * Call this when network conditions change (e.g., WiFi <-> cellular).
   */
  invalidateCapabilities(): void {
    this.capabilities = null;
    this.capabilitiesTimestamp = 0;
  }

  /**
   * Parse multi-part TXT responses (format: "1/3:", "2/3:", etc.).
   * Delegates to the shared parseMultiPartTXTResponse implementation.
   */
  parseMultiPartResponse(txtRecords: string[]): string {
    return parseMultiPartTXTResponse(txtRecords);
  }

  /**
   * Reset cached capabilities (useful for testing)
   */
  resetCapabilities(): void {
    this.capabilities = null;
  }
}

// Export singleton instance
export const nativeDNS = new NativeDNS();
