/**
 * Shared DNS constants for cross-platform consistency
 * These values MUST be synchronized across iOS, Android, and TypeScript implementations
 */

/**
 * DNS Server Configuration
 * Defines server-specific settings including non-standard ports
 */
export interface DNSServerConfig {
  host: string;
  port: number;
  priority: number;  // Lower = higher priority (1 = primary)
  isDefault?: boolean;
  description?: string;
}

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

/**
 * DNS Server Registry
 * Ordered by priority (lower number = higher priority)
 * Primary: llm.pieter.com (port 53) - @levelsio's LLM-over-DNS service
 * Fallback: ch.at (port 53) - Original ChatDNS server (currently offline, may return)
 *
 * NOTE: llm.pieter.com also supports port 9000, but port 53 is more firewall-friendly
 */
export const DNS_SERVERS: DNSServerConfig[] = [
  // Port 53 confirmed working via dig test (2026-01-05) - more firewall-friendly than port 9000
  // See: https://x.com/levelsio/status/1953063231347458220
  { host: 'llm.pieter.com', port: 53, priority: 1, isDefault: true, description: 'LLM-over-DNS by @levelsio' },
  { host: 'ch.at', port: 53, priority: 2, description: 'Original ChatDNS server' },
  { host: '8.8.8.8', port: 53, priority: 10, description: 'Google DNS' },
  { host: '8.8.4.4', port: 53, priority: 10, description: 'Google DNS secondary' },
  { host: '1.1.1.1', port: 53, priority: 10, description: 'Cloudflare DNS' },
  { host: '1.0.0.1', port: 53, priority: 10, description: 'Cloudflare DNS secondary' },
];

/**
 * Get server configuration by hostname
 */
export function getServerConfig(host: string): DNSServerConfig | undefined {
  const normalized = host.toLowerCase().trim().replace(/\.+$/, '');
  return DNS_SERVERS.find(s => s.host.toLowerCase() === normalized);
}

/**
 * Get port for a specific server (defaults to 53 if not found)
 */
export function getServerPort(host: string): number {
  const config = getServerConfig(host);
  return config?.port ?? 53;
}

/**
 * Get the default DNS server configuration
 */
export function getDefaultServer(): DNSServerConfig {
  const defaultServer = DNS_SERVERS.find(s => s.isDefault);
  if (!defaultServer) {
    throw new Error('No default DNS server configured');
  }
  return defaultServer;
}

/**
 * Get servers sorted by priority (for fallback chain)
 */
export function getServersByPriority(): DNSServerConfig[] {
  return [...DNS_SERVERS].sort((a, b) => a.priority - b.priority);
}

/**
 * Get LLM-capable servers (servers that understand natural language queries)
 * These are the only servers that can process chat messages
 */
export function getLLMServers(): DNSServerConfig[] {
  return DNS_SERVERS.filter(s => s.priority <= 2);  // Priority 1-2 are LLM servers
}

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
    'enforce_label_limit', // Reject if it exceeds 63 characters (no silent truncation)
  ],

  // DNS server whitelist (derived from DNS_SERVERS for backward compatibility)
  ALLOWED_DNS_SERVERS: DNS_SERVERS.map(s => s.host),

  // Network configuration
  // IMPORTANT: DEFAULT_DNS_SERVER is now llm.pieter.com (port 53)
  // ch.at is offline, llm.pieter.com is the new primary server
  DEFAULT_DNS_SERVER: getDefaultServer().host,
  DEFAULT_DNS_PORT: getDefaultServer().port,  // Matches the current default DNS server port
  DNS_PORT: 53,                 // Standard DNS port (for fallback servers)
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
