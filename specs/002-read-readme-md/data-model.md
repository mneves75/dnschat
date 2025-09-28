# Data Model: DNSChat

**Date**: 2025-09-28
**Feature**: DNS-Based AI Communication App

## Core Entities

### Chat Message
**Purpose**: Represents user input and AI responses with metadata for delivery tracking

```typescript
interface ChatMessage {
  id: string                    // UUID for unique identification
  content: string              // Message text content (sanitized)
  timestamp: Date              // When message was created
  type: 'user' | 'assistant'   // Message originator
  status: MessageStatus        // Delivery/processing status
  conversationId: string       // Groups messages into conversations
  retryCount?: number          // Number of retry attempts (for failed messages)
  errorMessage?: string        // Error details if delivery failed
}

enum MessageStatus {
  PENDING = 'pending',         // Queued for sending
  SENDING = 'sending',         // DNS query in progress
  SENT = 'sent',              // Successfully delivered
  RECEIVED = 'received',       // AI response received
  FAILED = 'failed',          // Delivery failed after retries
  QUEUED = 'queued'           // Offline, queued for retry
}
```

**Validation Rules**:
- `content`: Must be non-empty, max 2000 characters, DNS-safe after sanitization
- `id`: Must be valid UUID v4
- `timestamp`: Must be valid date, not future
- `conversationId`: Must exist in conversation history

**State Transitions**:
```
PENDING → SENDING → SENT → RECEIVED (success path)
PENDING → SENDING → FAILED (error path)
FAILED → PENDING (retry path)
Any → QUEUED (offline mode)
```

### DNS Query Log
**Purpose**: Records detailed DNS query information for debugging and analytics

```typescript
interface DNSQueryLog {
  id: string                   // UUID for unique identification
  messageId: string           // References ChatMessage.id
  method: DNSMethod           // Which DNS method was used
  server: string              // DNS server that processed query
  query: string               // The actual DNS query sent (sanitized)
  response?: string           // DNS response received
  startTime: Date             // When query started
  endTime?: Date              // When query completed/failed
  responseTime?: number       // Duration in milliseconds
  status: QueryStatus         // Success/failure status
  errorCode?: string          // Error classification if failed
  errorMessage?: string       // Detailed error message
  retryAttempt: number        // Which retry attempt this was (0 = first)
}

enum DNSMethod {
  NATIVE_IOS = 'native_ios',       // iOS Network Framework
  NATIVE_ANDROID = 'native_android', // Android DnsResolver
  UDP = 'udp',                     // react-native-udp
  TCP = 'tcp',                     // react-native-tcp-socket
  HTTPS = 'https',                 // DNS-over-HTTPS (Cloudflare)
  MOCK = 'mock'                    // Development/testing
}

enum QueryStatus {
  SUCCESS = 'success',         // Query completed successfully
  TIMEOUT = 'timeout',         // Query timed out
  NETWORK_ERROR = 'network_error', // Network connectivity issue
  DNS_ERROR = 'dns_error',     // DNS protocol error
  SERVER_ERROR = 'server_error', // Server returned error
  CANCELLED = 'cancelled'      // Query was cancelled
}
```

**Validation Rules**:
- `responseTime`: Must be positive number if endTime exists
- `retryAttempt`: Must be >= 0, max 5
- `server`: Must be whitelisted DNS server
- Auto-deletion after 30 days (retention policy)

### User Settings
**Purpose**: Stores user preferences for DNS servers, behavior, and app configuration

```typescript
interface UserSettings {
  version: number              // Settings schema version for migrations
  dnsServerPreferences: DNSServerConfig[]  // Ordered list of preferred servers
  transportMethodPriority: DNSMethod[]     // User's preferred method order
  theme: 'light' | 'dark' | 'auto'        // Theme preference
  enableVerboseLogging: boolean            // Developer logs enabled
  enableNotifications: boolean             // Push notification preference
  rateLimit: RateLimitConfig              // Rate limiting configuration
  retryPolicy: RetryPolicyConfig          // Retry behavior settings
  accessibility: AccessibilityConfig      // Accessibility preferences
  lastUpdated: Date                       // When settings were last modified
}

interface DNSServerConfig {
  hostname: string             // DNS server hostname (e.g., "1.1.1.1")
  port: number                 // DNS server port (usually 53)
  enabled: boolean            // Whether this server is active
  priority: number            // Order preference (lower = higher priority)
  isCustom: boolean           // Whether user added (always false per FR-015)
}

interface RateLimitConfig {
  messagesPerMinute: number   // Max messages per minute (60 per clarification)
  burstAllowed: number        // Allow burst of messages
  cooldownSeconds: number     // Cooldown after hitting limit
}

interface RetryPolicyConfig {
  maxRetries: number          // Maximum retry attempts (default: 3)
  retryDelayMs: number        // Base delay between retries
  exponentialBackoff: boolean // Whether to use exponential backoff
}

interface AccessibilityConfig {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  highContrast: boolean       // High contrast mode
  reduceMotion: boolean       // Reduced motion preference
  screenReader: boolean       // Screen reader optimizations
}
```

**Validation Rules**:
- `dnsServerPreferences`: Only whitelisted servers allowed (FR-015)
- `rateLimit.messagesPerMinute`: Must be <= 60 (per clarification)
- `version`: Must match current schema version
- All hostnames must be valid DNS names

### Conversation History
**Purpose**: Maintains persistent record of chat sessions with encryption for privacy

```typescript
interface ConversationHistory {
  id: string                  // UUID for conversation
  title: string               // User-defined or auto-generated title
  createdAt: Date            // When conversation started
  lastMessageAt: Date        // When last message was sent/received
  messageCount: number       // Total messages in conversation
  isEncrypted: boolean       // Whether content is encrypted at rest
  encryptionKeyId?: string   // Reference to encryption key (if encrypted)
  metadata: ConversationMetadata
}

interface ConversationMetadata {
  totalQueries: number       // Total DNS queries made
  averageResponseTime: number // Average query response time
  failureCount: number       // Number of failed queries
  preferredServer?: string   // Most successful DNS server for this conversation
  tags: string[]            // User-defined tags for organization
}
```

**Validation Rules**:
- `title`: Max 100 characters, non-empty
- `messageCount`: Must match actual message count
- `lastMessageAt`: Must be >= `createdAt`
- Indefinite retention until user manually deletes (per clarification)

## Data Relationships

```
ConversationHistory (1) ←→ (N) ChatMessage
    ↓
ChatMessage (1) ←→ (N) DNSQueryLog
    ↓
UserSettings (global singleton)
```

## Storage Implementation

### AsyncStorage Keys
```typescript
const STORAGE_KEYS = {
  CONVERSATIONS: 'chat_conversations',      // ConversationHistory[]
  MESSAGES: 'chat_messages',               // ChatMessage[]
  DNS_LOGS: 'dns_query_logs',             // DNSQueryLog[]
  USER_SETTINGS: 'user_settings',          // UserSettings
  ENCRYPTION_KEYS: 'encryption_keys'       // Encryption key storage
}
```

### Encryption Strategy
- **Conversation content**: AES-256 encryption for message content
- **DNS logs**: Sanitized before storage, no sensitive data encryption needed
- **Settings**: No encryption (preferences only)
- **Keys**: Stored in secure keychain (iOS) / encrypted preferences (Android)

## Performance Considerations

### Data Access Patterns
- **Messages**: Paginated loading (50 messages per page)
- **Logs**: Rolling window of last 1000 entries in memory
- **Settings**: Cached in memory, persist on change
- **Conversations**: Lazy loading of message content

### Storage Limits
- **Messages**: No limit (user-controlled deletion)
- **DNS Logs**: Auto-deletion after 30 days
- **Total storage**: Monitor and warn at 100MB usage

## Migration Strategy

### Settings Schema Versioning
```typescript
const SETTINGS_MIGRATIONS = {
  1: (oldSettings: any) => { /* Initial schema */ },
  2: (oldSettings: any) => { /* Add new fields */ },
  // Future migrations...
}
```

### Data Cleanup
- DNS logs: Automatic cleanup job runs daily
- Failed messages: Cleanup after 7 days
- Orphaned data: Validate relationships on app start