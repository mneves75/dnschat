/**
 * Shared DNS constants for cross-platform consistency
 * These values MUST be synchronized across iOS, Android, and TypeScript implementations
 */

/**
 * Serializable regex descriptor that can be rehydrated on native platforms without
 * losing the original pattern, flags, or ordering. Keep this limited to JSON-friendly
 * primitives so it crosses the React Native bridge intact.
 */
type RegexDescriptor = {
  pattern: string;
  flags?: string;
};

/**
 * Canonical sanitization contract shared with the native bridges. Every field must remain
 * JSON-serialisable and backwards compatible; add new keys rather than repurposing existing
 * ones so older native binaries can continue to parse earlier shapes safely.
 */
export type NativeSanitizerConfig = {
  unicodeNormalization: 'NFKD';
  spaceReplacement: string;
  maxLabelLength: number;
  whitespace: RegexDescriptor;
  invalidChars: RegexDescriptor;
  dashCollapse: RegexDescriptor;
  edgeDashes: RegexDescriptor;
  combiningMarks: RegexDescriptor;
};

export const DNS_CONSTANTS = {
  // Message limits
  MAX_MESSAGE_LENGTH: 120,      // Enforce limit before sanitization to avoid silent truncation
  MAX_DNS_LABEL_LENGTH: 63,     // DNS RFC 1035 single label limit

  // Character replacements
  SPACE_REPLACEMENT: '-',       // Replace spaces with dashes

  // Validation patterns
  ALLOWED_CHARS_PATTERN: /^[a-z0-9-]+$/,  // Only lowercase alphanumeric and dash
  DANGEROUS_CHARS_PATTERN: /[\x00-\x1F\x7F-\x9F<>'"&`@:()]/,  // Control chars and injection risks

  // Sanitization rules (must be applied in order)
  SANITIZATION_STEPS: [
    'normalize_unicode',  // Decompose & remove combining marks
    'lowercase',          // Convert to lowercase
    'trim',               // Remove leading/trailing whitespace
    'spaces_to_dashes',   // Replace spaces with dashes
    'remove_invalid',     // Remove non-alphanumeric except dash
    'collapse_dashes',    // Replace multiple dashes with single
    'remove_edge_dashes', // Remove leading/trailing dashes
    'truncate',           // Limit to 63 characters
  ],

  // DNS server whitelist
  ALLOWED_DNS_SERVERS: [
    'ch.at',      // Primary chat DNS server
    'llm.pieter.com', // Secondary ChatDNS endpoint
    '8.8.8.8',    // Google DNS
    '8.8.4.4',    // Google DNS secondary
    '1.1.1.1',    // Cloudflare DNS
    '1.0.0.1',    // Cloudflare DNS secondary
  ],

  // Network configuration (merged from appConstants.ts)
  DEFAULT_DNS_SERVER: 'ch.at',  // Default DNS server for queries
  DNS_PORT: 53,                 // Standard DNS port
  QUERY_TIMEOUT_MS: 10000,      // 10 seconds
  MAX_RETRIES: 3,               // Maximum retry attempts
  RETRY_DELAY_MS: 200,          // 200ms between retries (exponential backoff applied natively)

  // Thread pool configuration (Android)
  THREAD_POOL_CORE_SIZE: 2,     // Minimum threads
  THREAD_POOL_MAX_SIZE: 4,      // Maximum threads
  THREAD_POOL_QUEUE_SIZE: 10,   // Maximum queued tasks

  // Rate limiting (merged from appConstants.ts)
  RATE_LIMIT_WINDOW_MS: 60000,  // 1 minute
  MAX_REQUESTS_PER_WINDOW: 60,  // 60 requests per minute (updated to match app logic)
};

export const DNS_SANITIZER_CONFIG: NativeSanitizerConfig = {
  unicodeNormalization: 'NFKD',
  spaceReplacement: DNS_CONSTANTS.SPACE_REPLACEMENT,
  maxLabelLength: DNS_CONSTANTS.MAX_DNS_LABEL_LENGTH,
  whitespace: {
    pattern: '\\s+',
    flags: 'g',
  },
  invalidChars: {
    pattern: '[^a-z0-9-]',
    flags: 'g',
  },
  dashCollapse: {
    pattern: '-{2,}',
    flags: 'g',
  },
  edgeDashes: {
    pattern: '^-+|-+$',
    flags: 'g',
  },
  combiningMarks: {
    pattern: '\\p{M}+',
    flags: 'gu',
  },
};

const createRegExp = ({ pattern, flags }: RegexDescriptor): RegExp => new RegExp(pattern, flags);

const WHITESPACE_REGEX = createRegExp(DNS_SANITIZER_CONFIG.whitespace);
const INVALID_CHARS_REGEX = createRegExp(DNS_SANITIZER_CONFIG.invalidChars);
const DASH_COLLAPSE_REGEX = createRegExp(DNS_SANITIZER_CONFIG.dashCollapse);
const EDGE_DASHES_REGEX = createRegExp(DNS_SANITIZER_CONFIG.edgeDashes);
const COMBINING_MARKS_REGEX = createRegExp(DNS_SANITIZER_CONFIG.combiningMarks);

/**
 * Sanitize a message according to shared rules
 * This TypeScript implementation serves as the reference
 */
export function sanitizeDNSMessageReference(message: string): string {
  if (message.length > DNS_CONSTANTS.MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Message too long (maximum ${DNS_CONSTANTS.MAX_MESSAGE_LENGTH} characters before sanitization)`,
    );
  }

  let result = message;

  // Step 1: Normalize and strip combining marks so á/ç map to ASCII
  try {
    result = result.normalize(DNS_SANITIZER_CONFIG.unicodeNormalization);
  } catch {
    // Some environments (very old JS runtimes) may not support normalize; fallback silently
  }
  result = result.replace(COMBINING_MARKS_REGEX, '');

  // Step 2: Lowercase
  result = result.toLowerCase();

  // Step 3: Trim
  result = result.trim();

  // Step 4: Spaces to dashes
  result = result.replace(WHITESPACE_REGEX, DNS_SANITIZER_CONFIG.spaceReplacement);

  // Step 5: Remove invalid characters (keep only alphanumeric and dash)
  result = result.replace(INVALID_CHARS_REGEX, '');

  // Step 6: Collapse multiple dashes
  result = result.replace(DASH_COLLAPSE_REGEX, DNS_SANITIZER_CONFIG.spaceReplacement);

  // Step 7: Remove edge dashes
  result = result.replace(EDGE_DASHES_REGEX, '');

  // Step 8: Enforce DNS label limit
  if (result.length > DNS_SANITIZER_CONFIG.maxLabelLength) {
    throw new Error(
      `Message exceeds DNS label limit of ${DNS_SANITIZER_CONFIG.maxLabelLength} characters after sanitization`,
    );
  }

  return result;
}

export const getNativeSanitizerConfig = (): NativeSanitizerConfig => ({
  unicodeNormalization: DNS_SANITIZER_CONFIG.unicodeNormalization,
  spaceReplacement: DNS_SANITIZER_CONFIG.spaceReplacement,
  maxLabelLength: DNS_SANITIZER_CONFIG.maxLabelLength,
  whitespace: { ...DNS_SANITIZER_CONFIG.whitespace },
  invalidChars: { ...DNS_SANITIZER_CONFIG.invalidChars },
  dashCollapse: { ...DNS_SANITIZER_CONFIG.dashCollapse },
  edgeDashes: { ...DNS_SANITIZER_CONFIG.edgeDashes },
  combiningMarks: { ...DNS_SANITIZER_CONFIG.combiningMarks },
});
