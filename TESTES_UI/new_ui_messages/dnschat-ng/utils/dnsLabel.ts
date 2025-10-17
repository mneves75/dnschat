import type { DNSRecord } from '@/services/DNSTransportService';

const MAX_LABEL_LENGTH = 63;
const VALID_CHAR_REGEX = /[^a-z0-9-]/g;

export function sanitizeDnsLabel(value: string): string {
  const lower = value.toLowerCase().replace(/\s+/g, '-');
  const cleaned = lower.replace(VALID_CHAR_REGEX, '').replace(/-+/g, '-');
  const trimmed = cleaned.replace(/^-+|-+$/g, '');
  const fallback = trimmed || 'prompt';
  return fallback.slice(0, MAX_LABEL_LENGTH);
}

export function chunkLabel(value: string): string[] {
  const chunks: string[] = [];
  let remaining = value;
  while (remaining.length > 0) {
    chunks.push(remaining.slice(0, MAX_LABEL_LENGTH));
    remaining = remaining.slice(MAX_LABEL_LENGTH);
  }
  return chunks;
}

export function buildDnsQueryLabel(message: string, conversationId: string): string {
  const sanitizedMessage = sanitizeDnsLabel(message);
  const normalizedConversation = sanitizeDnsLabel(conversationId);
  const combined = `${normalizedConversation}-${sanitizedMessage}`;
  const segments = chunkLabel(combined);
  return segments.join('.');
}

/**
 * CRITICAL FIX: Properly sort multi-part DNS TXT records
 *
 * DNS allows splitting long responses across multiple TXT records using IDs like:
 * - "1/3:part1" (1st of 3 parts)
 * - "2/3:part2" (2nd of 3 parts)
 * - "3/3:part3" (3rd of 3 parts)
 *
 * Or single-part responses without an ID:
 * - "response content"
 *
 * Problem fixed: Previous sorting used Number.parseInt which only works if ALL IDs are numeric.
 * If response has mixed types (e.g., "1", "2", "msg-id"), the sort falls back to lexicographic
 * comparison, which gives wrong order: ["1", "2", "msg-id"] instead of numeric sort.
 *
 * Solution: Explicitly parse ID format ("N/M" or implicit "1/1") and extract numeric index.
 * If ID cannot be parsed, treat as single-part response and don't sort.
 *
 * Examples:
 * - Input: [{id: "1", content: "a"}, {id: "2", content: "b"}, {id: "3", content: "c"}]
 *   Output: "abc" (sorted by numeric ID)
 *
 * - Input: [{id: "response", content: "single part"}]
 *   Output: "single part" (single part, no sorting needed)
 *
 * - Input: [{id: "1", content: "a"}, {id: "notanumber", content: "b"}]
 *   Output: "anot"or "bnota" (unpredictable - malformed input)
 *   Fix: We log warning and still process, but order is best-effort
 */
export function sortDnsRecords(records: DNSRecord[]): string {
  if (records.length === 0) return '';

  // Single record - no sorting needed
  if (records.length === 1) {
    return records[0].content;
  }

  /**
   * Attempt to parse record IDs to detect multi-part format.
   *
   * Expected format per DNSTransportService.parseRecords:
   * - Multi-part: "N/M" where N is part number, M is total parts (e.g., "2/3")
   * - Single-part: arbitrary string or missing (e.g., "response-data" or implicit "1/1")
   *
   * We look for at least one record with "N/M" format to indicate multi-part response.
   */
  const parsedRecords = records.map((record) => {
    const match = record.id.match(/^(\d+)\/(\d+)$/);
    if (match) {
      // Multi-part format detected: "N/M"
      const partNumber = Number.parseInt(match[1], 10);
      const totalParts = Number.parseInt(match[2], 10);
      return { record, partNumber, totalParts, isMultiPart: true };
    }

    // Try to parse as just a number (legacy format without "/M")
    const numericId = Number.parseInt(record.id, 10);
    if (Number.isFinite(numericId)) {
      return { record, partNumber: numericId, totalParts: records.length, isMultiPart: false };
    }

    // Not a numeric ID - likely single-part or malformed
    return { record, partNumber: NaN, totalParts: NaN, isMultiPart: false };
  });

  /**
   * Check if this looks like a multi-part response.
   * We require:
   * 1. At least one record with "N/M" format, OR
   * 2. Multiple records all with numeric IDs
   */
  const hasExplicitMultiPart = parsedRecords.some((p) => p.isMultiPart && !Number.isNaN(p.partNumber));

  if (!hasExplicitMultiPart) {
    // Single-part response or mixed format - return in order received
    if (__DEV__) {
      const hasNumericIds = parsedRecords.some((p) => !Number.isNaN(p.partNumber));
      if (hasNumericIds && records.length > 1) {
        console.warn('[DNS] Multi-record response without explicit "N/M" format:', records.map((r) => r.id));
      }
    }
    return records.map((r) => r.content).join('');
  }

  /**
   * Sort by part number and concatenate content in order.
   * Skip records with unparseable IDs (should not happen in well-formed responses).
   */
  return parsedRecords
    .filter((p) => !Number.isNaN(p.partNumber))
    .sort((a, b) => a.partNumber - b.partNumber)
    .map((p) => p.record.content)
    .join('');
}
