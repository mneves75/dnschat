/**
 * Shared DNS constants for cross-platform consistency
 * These values MUST be synchronized across iOS, Android, and TypeScript implementations
 */

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
    'lowercase',           // Convert to lowercase
    'trim',               // Remove leading/trailing whitespace
    'spaces_to_dashes',   // Replace spaces with dashes
    'remove_invalid',     // Remove non-alphanumeric except dash
    'collapse_dashes',    // Replace multiple dashes with single
    'remove_edge_dashes', // Remove leading/trailing dashes
    'truncate',          // Limit to 63 characters
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
  
  // Step 1: Lowercase
  result = result.toLowerCase();
  
  // Step 2: Trim
  result = result.trim();
  
  // Step 3: Spaces to dashes
  result = result.replace(/\s+/g, DNS_CONSTANTS.SPACE_REPLACEMENT);
  
  // Step 4: Remove invalid characters (keep only alphanumeric and dash)
  result = result.replace(/[^a-z0-9-]/g, '');
  
  // Step 5: Collapse multiple dashes
  result = result.replace(/-{2,}/g, '-');
  
  // Step 6: Remove edge dashes
  result = result.replace(/^-+|-+$/g, '');
  
  // Step 7: Enforce DNS label limit
  if (result.length > DNS_CONSTANTS.MAX_DNS_LABEL_LENGTH) {
    throw new Error(
      `Message exceeds DNS label limit of ${DNS_CONSTANTS.MAX_DNS_LABEL_LENGTH} characters after sanitization`,
    );
  }
  
  return result;
}
