# DNS Service API Reference

Complete API documentation for DNSChat's native DNS implementation and fallback services.

## 🔍 Overview

DNSChat uses a sophisticated multi-layer DNS communication system with platform-specific optimizations and comprehensive fallback strategies.

### Communication Flow

```
User Message → DNSService → Native DNS Module → ch.at Server → LLM → Response
```

### Fallback Chain

1. **Native DNS** (iOS Network Framework / Android DnsResolver)
2. **UDP DNS** (Direct socket communication)
3. **TCP DNS** (For UDP-blocked networks)
4. **DNS-over-HTTPS** (Cloudflare API)
5. **Mock Service** (Development/testing)

## 📱 Native DNS Modules

### iOS Native DNS (Swift)

#### `DNSResolver` Class

**Location**: `ios/DNSNative/DNSResolver.swift`

**Methods**:

```swift
static func isAvailable() -> Bool
```

Returns whether native DNS is available on the current iOS version (16.0+).

```swift
func queryTXT(
    domain: String,
    message: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
)
```

Performs DNS TXT query using Apple Network Framework.

**Parameters**:

- `domain`: DNS server (typically "ch.at")
- `message`: User message to send via DNS
- `resolver`: Success callback with TXT records array
- `rejecter`: Error callback with DNS error

**Thread Safety**: Uses `@MainActor` for query deduplication and NSLock for continuation safety.

#### React Native Bridge

**Module**: `RNDNSModule`

```typescript
// Check availability
const capabilities = await nativeDNS.isAvailable();
// Returns: { available: boolean, platform: "ios", ... }

// Perform query
const txtRecords = await nativeDNS.queryTXT("ch.at", "Hello world");
// Returns: ["LLM response text"]
```

### Android Native DNS (Java)

#### `DNSResolver` Class

**Location**: `modules/dns-native/android/DNSResolver.java`

**Methods**:

```java
public static boolean isAvailable()
```

Returns whether native DNS is available (API 29+ or dnsjava present).

```java
public CompletableFuture<List<String>> queryTXT(String domain, String message)
```

Performs DNS TXT query with 3-tier fallback strategy.

**Fallback Strategy**:

1. **Modern DNS** (API 29+): Android DnsResolver API
2. **DNS-over-HTTPS**: Cloudflare API
3. **Legacy DNS**: dnsjava library

**Thread Safety**: Uses `ConcurrentHashMap` for query deduplication.

## 🌐 DNS Communication Protocol

### DNS Query Format

**Domain**: User message treated as single DNS label
**Type**: TXT (16)
**Class**: IN (1)

**Example CLI equivalent**:

```bash
dig @ch.at "What is the meaning of life?" TXT +short
```

### Message Processing

#### Input Sanitization

```typescript
function sanitizeMessage(message: string): string {
  return message
    .trim() // Remove whitespace
    .substring(0, 200) // Limit to 200 characters
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .toLowerCase(); // Convert to lowercase
}
```

#### DNS Packet Construction

**Header** (12 bytes):

- Transaction ID: Random 16-bit value
- Flags: 0x0100 (standard query, recursion desired)
- Question Count: 1
- Answer/Authority/Additional: 0

**Question Section**:

- QNAME: Length-prefixed message + null terminator
- QTYPE: 16 (TXT)
- QCLASS: 1 (IN)

### Response Parsing

#### TXT Record Format

DNS TXT records use length-prefixed strings:

```
[length][string_data][length][string_data]...
```

#### Multi-part Responses

For long responses, the service may return multiple TXT records:

```
"1/3: First part of response"
"2/3: Second part of response"
"3/3: Final part of response"
```

## 🔄 Fallback Services

### DNS-over-HTTPS (Cloudflare)

**Endpoint**: `https://cloudflare-dns.com/dns-query`

**Parameters**:

- `name`: Sanitized message
- `type`: TXT

**Request**:

```typescript
const url = `https://cloudflare-dns.com/dns-query?name=${encodedMessage}&type=TXT`;
const response = await fetch(url, {
  headers: { Accept: "application/dns-json" },
});
```

**Response Format**:

```json
{
  "Answer": [
    {
      "type": 16,
      "data": "\"LLM response text\""
    }
  ]
}
```

### UDP/TCP DNS

**Direct socket communication** using:

- **iOS**: Network Framework (NWConnection)
- **Android**: DatagramSocket / Socket
- **React Native**: react-native-udp / react-native-tcp-socket

**Server**: ch.at:53
**Protocol**: Standard DNS over UDP/TCP

## 🎛️ Configuration Options

### DNS Method Preferences

Users can configure DNS behavior via Settings:

#### Available Methods

1. **Native First** (default): Prioritize platform-native implementations
2. **Automatic**: Balanced fallback chain
3. **Prefer HTTPS**: Privacy-focused with DNS-over-HTTPS first
4. **UDP Only**: Direct UDP queries only
5. **Never HTTPS**: Exclude DNS-over-HTTPS from chain

#### Implementation

```typescript
enum DNSMethodPreference {
  NATIVE_FIRST = "native-first",
  AUTOMATIC = "automatic",
  PREFER_HTTPS = "prefer-https",
  UDP_ONLY = "udp-only",
  NEVER_HTTPS = "never-https",
}
```

### Timeout Configuration

**Default Timeouts**:

- Native DNS: 10 seconds
- UDP/TCP DNS: 10 seconds
- DNS-over-HTTPS: 10 seconds
- Total query timeout: 30 seconds (with fallbacks)

## 📊 Error Handling

### Error Types

#### iOS DNSError

```swift
enum DNSError: LocalizedError {
    case resolverFailed(String)
    case queryFailed(String)
    case noRecordsFound
    case timeout
    case cancelled
}
```

#### Android DNSError

```java
public enum Type {
    RESOLVER_FAILED,
    QUERY_FAILED,
    NO_RECORDS_FOUND,
    TIMEOUT,
    CANCELLED
}
```

### Common Error Scenarios

| Error              | Cause                       | Solution                     |
| ------------------ | --------------------------- | ---------------------------- |
| `RESOLVER_FAILED`  | Network connectivity issues | Switch networks or use HTTPS |
| `NO_RECORDS_FOUND` | DNS server has no response  | Check message format         |
| `TIMEOUT`          | Network too slow            | Try different DNS method     |
| `CANCELLED`        | User cancelled query        | Normal operation             |

## 🔍 Debugging & Monitoring

### DNS Query Logging

All DNS operations are logged to:

- **Console**: Development debugging
- **AsyncStorage**: Persistent query history (100 queries max)
- **Logs Tab**: Real-time user interface

**Log Entry Format**:

```typescript
interface DNSLogEntry {
  id: string;
  timestamp: Date;
  message: string;
  method: string; // 'native', 'udp', 'tcp', 'https'
  success: boolean;
  duration: number; // milliseconds
  error?: string;
  response?: string[];
}
```

### Performance Monitoring

**Key Metrics**:

- Query response time by method
- Success rate by network type
- Fallback trigger frequency
- Query deduplication effectiveness

## 🧪 Testing

### CLI Testing

```bash
# Test DNS connectivity
node test-dns-simple.js "Hello world"

# Test specific message
node test-dns-simple.js "What is 2+2?"
```

### Integration Testing

```typescript
// Test native module availability
const capabilities = await nativeDNS.isAvailable();
expect(capabilities.available).toBe(true);

// Test query functionality
const response = await dnsService.queryLLM("test message");
expect(response).toBeDefined();
```

### Network Testing

**Test different network conditions**:

1. **Open WiFi**: All methods should work
2. **Corporate WiFi**: May block UDP, fallback to HTTPS
3. **Cellular**: Usually allows all methods
4. **VPN**: May affect routing, test all fallbacks

## 📚 Advanced Usage

### Custom DNS Servers

While ch.at is the default, the system supports custom DNS servers:

```typescript
// Configure custom server (advanced users)
const customResolver = new DNSResolver();
const response = await customResolver.queryTXT("custom.dns.server", "message");
```

### Query Deduplication

The system prevents duplicate queries to improve performance:

**iOS**: Uses `@MainActor` protected dictionary
**Android**: Uses `ConcurrentHashMap`

**Key Format**: `${domain}-${sanitizedMessage}`

### Concurrent Query Management

**iOS**: Maximum concurrent queries managed by MainActor
**Android**: Unlimited with deduplication and cleanup

## 🔐 Security Considerations

### Input Validation

- Message length limited to 200 characters
- Special characters replaced or removed
- No executable code in DNS queries

### Network Security

- DNS-over-HTTPS for encrypted communication
- No sensitive data in DNS queries
- Automatic fallback to secure methods

### Privacy

- No persistent user identification
- Local storage only (no cloud sync)
- Optional DNS-over-HTTPS for enhanced privacy

---

_This API reference is for DNSChat v1.7.7. For implementation details, see the source code._
