/**
 * Application Constants
 * 
 * Centralized constants to avoid magic numbers and improve maintainability
 */

// DNS Configuration
export const DNS_CONSTANTS = {
  DEFAULT_DNS_SERVER: 'ch.at',
  DNS_PORT: 53,
  QUERY_TIMEOUT_MS: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 200,
  RATE_LIMIT_WINDOW_MS: 60000,
  MAX_REQUESTS_PER_WINDOW: 60,
} as const;

// Encryption Configuration
export const ENCRYPTION_CONSTANTS = {
  SALT_LENGTH: 32,
  KEY_LENGTH: 32, // 256 bits for AES-256
  IV_LENGTH: 12, // 96 bits for GCM
  PBKDF2_ITERATIONS: 100000,
  MAX_DATA_SIZE_BYTES: 10 * 1024 * 1024, // 10MB limit
  CHUNK_SIZE: 8192, // 8KB chunks for base64 encoding
} as const;

// Logging Configuration
export const LOGGING_CONSTANTS = {
  MAX_LOGS: 100,
  LOG_RETENTION_DAYS: 30,
  STORAGE_SIZE_WARNING_MB: 100,
  CLEANUP_INTERVAL_MS: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// UI Configuration
export const UI_CONSTANTS = {
  ANIMATION_DURATION_MS: 300,
  HAPTIC_FEEDBACK_DELAY_MS: 50,
  REFRESH_THROTTLE_MS: 1000,
  DEBOUNCE_DELAY_MS: 500,
} as const;

// Message Limits
export const MESSAGE_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 120,
  MAX_DNS_LABEL_LENGTH: 63,
  PREVIEW_LENGTH: 60,
  TITLE_MAX_LENGTH: 50,
} as const;

// Network Configuration
export const NETWORK_CONSTANTS = {
  CONNECTION_TIMEOUT_MS: 10000,
  READ_TIMEOUT_MS: 30000,
  MAX_CONCURRENT_REQUESTS: 5,
  RETRY_BACKOFF_MULTIPLIER: 2,
} as const;

// Storage Configuration
export const STORAGE_CONSTANTS = {
  CHATS_KEY: '@chat_dns_chats',
  SETTINGS_KEY: '@chat_dns_settings',
  LOGS_KEY: '@dns_query_logs',
  ENCRYPTION_VERSION_KEY: '@chat_dns_encryption_version',
  CHAT_BACKUP_KEY: '@chat_dns_chats_backup',
  LOGS_BACKUP_KEY: '@dns_query_logs_backup',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  DNS_SERVER_INVALID: 'DNS server must be a valid allowlisted hostname or IP address',
  DNS_SERVER_NOT_ALLOWED: 'DNS server not allowed',
  MESSAGE_EMPTY: 'Message cannot be empty',
  MESSAGE_TOO_LONG: 'Message too long',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT_ERROR: 'Request timed out',
  PERMISSION_DENIED: 'Permission denied',
  DATA_TOO_LARGE: 'Data too large for processing',
} as const;
