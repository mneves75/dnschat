# API Reference

**DNSChat Service APIs and Interfaces**

This document provides API reference for DNSChat's core services. For protocol details, see [DNS Protocol Specification](./technical/DNS-PROTOCOL-SPEC.md).

## Table of Contents

- [DNS Service API](#dns-service-api)
- [Storage Service API](#storage-service-api)
- [DNS Log Service API](#dns-log-service-api)
- [Native DNS Module](#native-dns-module)
- [Share Service API](#share-service-api)
- [Clipboard Service API](#clipboard-service-api)

---

## DNS Service API

**Location**: `src/services/dnsService.ts`

### DNSService Class

Main service for performing DNS TXT queries via multiple transport methods.

#### Query Methods

##### `query(message: string, dnsServer?: string): Promise<string>`

Performs DNS TXT query with automatic fallback chain.

**Parameters**:
- `message` (string): Message to encode in DNS query (max 255 chars, sanitized)
- `dnsServer` (string, optional): Custom DNS server (defaults to `ch.at`)

**Returns**: `Promise<string>` - Decoded TXT record response

**Throws**: `DNSError` with specific error types

**Fallback Chain**:
1. Native DNS (iOS/Android optimized)
2. UDP DNS (react-native-udp)
3. TCP DNS (react-native-tcp-socket)
4. Mock service (development only)

**Example**:
```typescript
import { DNSService } from '@/services/dnsService';

const dnsService = new DNSService();

try {
  const response = await dnsService.query('Hello DNS');
  console.log('Response:', response);
} catch (error) {
  if (error instanceof DNSError) {
    console.error('DNS Error:', error.type, error.message);
  }
}
```

##### `cleanup(): Promise<void>`

Cleans up active connections and timers. Call when component unmounts.

**Example**:
```typescript
useEffect(() => {
  const service = new DNSService();
  return () => {
    service.cleanup();
  };
}, []);
```

### Utility Functions

#### `composeDNSQueryName(label: string, dnsServer: string): string`

Composes full DNS query name from label and server.

**Parameters**:
- `label` (string): Message label
- `dnsServer` (string): DNS server hostname or IP

**Returns**: `string` - Fully qualified DNS name (e.g., `hello.ch.at`)

**Example**:
```typescript
const queryName = composeDNSQueryName('test', 'ch.at');
// Returns: "test.ch.at"
```

#### `validateDNSMessage(message: string): void`

Validates DNS message against security constraints.

**Parameters**:
- `message` (string): Message to validate

**Throws**: `Error` if validation fails

**Validation Rules**:
- Length: 1-255 characters
- Allowed characters: `[a-zA-Z0-9._-]`
- No consecutive dots
- No leading/trailing dots
- No null bytes or control characters

**Example**:
```typescript
try {
  validateDNSMessage('Hello DNS!');
  // Throws: Invalid characters
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

#### `sanitizeDNSMessage(message: string): string`

Sanitizes message for safe DNS usage.

**Parameters**:
- `message` (string): Message to sanitize

**Returns**: `string` - Sanitized message (alphanumeric, hyphens, dots, underscores)

**Behavior**:
- Removes invalid characters
- Replaces spaces with hyphens
- Truncates to 255 chars
- Returns empty string if result is invalid

**Example**:
```typescript
const safe = sanitizeDNSMessage('Hello, DNS! 🚀');
// Returns: "Hello-DNS"
```

#### `validateDNSServer(server: string): void`

Validates DNS server hostname or IP address.

**Parameters**:
- `server` (string): Server hostname or IP

**Throws**: `Error` if validation fails

**Validation Rules**:
- Valid hostname or IPv4 address
- Allowed characters: `[a-z0-9.-]`
- No port numbers (validated separately)
- Prevents DNS injection attacks

**Example**:
```typescript
validateDNSServer('8.8.8.8');        // OK
validateDNSServer('dns.google.com'); // OK
validateDNSServer('evil@dns.com');   // Throws
```

#### `parseTXTResponse(txtRecords: string[]): string`

Parses TXT record array into single response string.

**Parameters**:
- `txtRecords` (string[]): Array of TXT record segments

**Returns**: `string` - Concatenated response

**Example**:
```typescript
const records = ['Hello ', 'World'];
const response = parseTXTResponse(records);
// Returns: "Hello World"
```

### Error Types

#### `DNSError`

Extended error class with DNS-specific error types.

**Properties**:
- `type` (DNSErrorType): Error category
- `message` (string): Human-readable error message
- `details?` (any): Additional error context

**Error Types**:
```typescript
enum DNSErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  MALFORMED_RESPONSE = 'MALFORMED_RESPONSE',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

**Example**:
```typescript
import { DNSError, DNSErrorType } from '@/services/dnsService';

try {
  await dnsService.query('...');
} catch (error) {
  if (error instanceof DNSError) {
    switch (error.type) {
      case DNSErrorType.TIMEOUT_ERROR:
        // Handle timeout
        break;
      case DNSErrorType.NETWORK_ERROR:
        // Handle network issue
        break;
      default:
        // Handle other errors
    }
  }
}
```

---

## Storage Service API

**Location**: `src/services/storageService.ts`

### StorageService Class

Manages persistent storage using AsyncStorage with type safety.

#### Methods

##### `saveMessages(messages: Message[]): Promise<void>`

Persists message array to storage.

**Parameters**:
- `messages` (Message[]): Array of message objects

**Example**:
```typescript
const storage = new StorageService();
await storage.saveMessages([
  { id: '1', text: 'Hello', sender: 'user', timestamp: Date.now() }
]);
```

##### `loadMessages(): Promise<Message[]>`

Loads messages from storage.

**Returns**: `Promise<Message[]>` - Array of messages (empty array if none)

**Example**:
```typescript
const messages = await storage.loadMessages();
```

##### `clearMessages(): Promise<void>`

Clears all messages from storage.

**Example**:
```typescript
await storage.clearMessages();
```

---

## DNS Log Service API

**Location**: `src/services/dnsLogService.ts`

### Interfaces

#### `DNSLogEntry`

Single DNS query log entry.

```typescript
interface DNSLogEntry {
  timestamp: number;
  message: string;
  dnsServer: string;
  method: string;
  responseTime: number;
  success: boolean;
  error?: string;
}
```

#### `DNSQueryLog`

Complete query log with metadata.

```typescript
interface DNSQueryLog {
  id: string;
  timestamp: number;
  originalMessage: string;
  queryName: string;
  dnsServer: string;
  method: string;
  responseTime: number;
  success: boolean;
  response?: string;
  error?: string;
  attemptNumber: number;
  fallbackChain: string[];
}
```

### DNSLogService Class

Tracks and persists DNS query logs.

#### Methods

##### `logQuery(log: DNSQueryLog): Promise<void>`

Logs a DNS query with full metadata.

##### `getLogs(): Promise<DNSQueryLog[]>`

Retrieves all logged queries.

##### `clearLogs(): Promise<void>`

Clears all query logs.

##### `exportLogs(): Promise<string>`

Exports logs as JSON string for debugging.

---

## Native DNS Module

**Location**: `modules/dns-native/`

### Platform-Specific Implementations

#### iOS (Swift)
- Uses `Network.framework` for native DNS queries
- iOS 14.0+ compatible
- Optimized for performance

#### Android (Java)
- Uses `DnsResolver` API (API 29+)
- Falls back to dnsjava for API 21-28
- Handles network changes gracefully

### Module API

#### `query(options: DNSQueryOptions): Promise<DNSQueryResult>`

**Parameters**:
```typescript
interface DNSQueryOptions {
  message: string;
  dnsServer?: string;
  timeout?: number;
}
```

**Returns**:
```typescript
interface DNSQueryResult {
  answer: string[];
  responseTime: number;
}
```

**Example** (React Native):
```typescript
import { nativeDNS } from '../../modules/dns-native';

const result = await nativeDNS.query({
  message: 'test',
  dnsServer: 'ch.at',
  timeout: 5000
});

console.log('Response:', result.answer.join(''));
```

For detailed native module documentation, see:
- [Native Module Specification](./technical/NATIVE-SPEC.md)
- [Native Module (Claude Version)](./technical/NATIVE-SPEC-CLAUDE.md)

---

## Share Service API

**Location**: `src/services/ShareService.ts`

### ShareService Class

Handles cross-platform sharing functionality.

#### Methods

##### `shareMessage(message: string): Promise<void>`

Shares message via platform share dialog.

**Example**:
```typescript
import { ShareService } from '@/services/ShareService';

await ShareService.shareMessage('Hello from DNSChat');
```

---

## Clipboard Service API

**Location**: `src/services/ClipboardService.ts`

### ClipboardService Class

Cross-platform clipboard operations.

#### Methods

##### `copyToClipboard(text: string): Promise<void>`

Copies text to clipboard with user feedback.

**Example**:
```typescript
import { ClipboardService } from '@/services/ClipboardService';

await ClipboardService.copyToClipboard('Copied text');
```

---

## Constants

### DNS Constants

**Location**: `modules/dns-native/constants.ts`

```typescript
const DNS_CONSTANTS = {
  DEFAULT_DNS_SERVER: 'ch.at',
  DEFAULT_PORT: 53,
  DEFAULT_TIMEOUT: 5000,
  MAX_MESSAGE_LENGTH: 255,
  MAX_RETRIES: 3
};
```

### Error Messages

**Location**: `src/constants/appConstants.ts`

Application-wide error message constants.

---

## Type Definitions

### Message

```typescript
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: number;
  error?: boolean;
  dnsServer?: string;
  responseTime?: number;
}
```

### ChatContext

Global chat state managed via React Context.

```typescript
interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string, server?: string) => Promise<void>;
  clearMessages: () => Promise<void>;
}
```

---

## Testing

### DNS Service Testing

**Quick Test**:
```bash
node test-dns-simple.js "test message"
```

**Comprehensive Harness**:
```bash
npm run dns:harness -- --message "test" --verbose
```

**Unit Tests**:
```bash
npm test src/services/dnsService.test.ts
```

### Integration Testing

See [Testing Documentation](./guides/QUICKSTART.md#testing) for end-to-end testing procedures.

---

## Performance Considerations

### Query Optimization

1. **Native DNS First**: Always tries native module first (fastest)
2. **Connection Reuse**: UDP/TCP sockets reused when possible
3. **Timeout Management**: Configurable timeouts per method
4. **Fallback Strategy**: Quick failover to next method

### Best Practices

- Use `cleanup()` on component unmount
- Handle `DNSError` types specifically
- Monitor response times via logs
- Cache responses when appropriate
- Validate input before queries

### Rate Limiting

No built-in rate limiting. Implement application-level throttling:

```typescript
import { debounce } from 'lodash';

const debouncedQuery = debounce(
  (msg: string) => dnsService.query(msg),
  300
);
```

---

## Security

### Input Validation

All user input is validated and sanitized:
- `validateDNSMessage()` - Strict validation
- `sanitizeDNSMessage()` - Automatic sanitization
- `validateDNSServer()` - Server validation

### DNS Injection Prevention

- Whitelist of allowed characters
- Server hostname validation
- Query name length limits
- No shell command injection possible

For security details, see [Security Audit](./troubleshooting/SECURITY-AUDIT.md).

---

## Migration Guide

### From v2.x to v3.x

**Breaking Changes**:
- DNSService now requires explicit instantiation
- Error types renamed (see DNSErrorType enum)
- Native module registration changed

**Migration**:
```typescript
// Old (v2.x)
import { queryDNS } from './dnsService';
const result = await queryDNS('message');

// New (v3.x)
import { DNSService } from '@/services/dnsService';
const service = new DNSService();
const result = await service.query('message');
```

---

## Related Documentation

- **[DNS Protocol Spec](./technical/DNS-PROTOCOL-SPEC.md)** - Protocol implementation details
- **[System Architecture](./architecture/SYSTEM-ARCHITECTURE.md)** - Component design
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues
- **[Contributing](../CONTRIBUTING.md)** - Development guidelines

---

**Last Updated**: 2025-11-02
**Version**: 3.0.6
**Maintainer**: See [MAINTAINERS.md](./MAINTAINERS.md)
