# Native DNS Module for React Native

A high-performance, cross-platform native DNS TXT query module for React Native applications. This module enables direct communication with DNS servers using platform-optimized implementations: Apple's Network Framework on iOS and Android's DnsResolver API with dnsjava fallback, completely bypassing the limitations of JavaScript-based DNS implementations.

## Features

- 🚀 **Native Performance**: Uses platform-optimized DNS APIs
- 🔒 **Secure**: Works within platform security models
- 🌐 **Cross-Platform**: iOS, Android, and web fallback support
- ⚡ **Async/Await**: Modern Promise-based API
- 🛡️ **Type Safe**: Full TypeScript support
- 🔄 **Multi-part Responses**: Automatic parsing of segmented DNS responses
- 📱 **Mobile Optimized**: Handles network changes and app lifecycle

## Installation

This module is integrated into the ChatDNS app via an Expo config plugin. For standalone usage:

```bash
npm install @dnschat/dns-native
```

## Quick Start

```typescript
import { nativeDNS, DNSError, DNSErrorType } from '@dnschat/dns-native';

// Check platform capabilities
const capabilities = await nativeDNS.isAvailable();
console.log('DNS available:', capabilities.available);
console.log('Platform:', capabilities.platform);

// Query TXT records
try {
  const txtRecords = await nativeDNS.queryTXT('ch.at', 'Hello AI');
  const response = nativeDNS.parseMultiPartResponse(txtRecords);
  console.log('AI Response:', response);
} catch (error) {
  if (error instanceof DNSError) {
    console.error('DNS Error:', error.type, error.message);
  }
}
```

## API Reference

### `nativeDNS.isAvailable()`

Returns platform capabilities and availability status.

```typescript
interface DNSCapabilities {
  available: boolean;
  platform: 'ios' | 'android' | 'web';
  supportsCustomServer: boolean;
  supportsAsyncQuery: boolean;
  apiLevel?: number; // Android only
}
```

### `nativeDNS.queryTXT(domain, message)`

Queries TXT records from a DNS server.

**Parameters:**
- `domain` (string): DNS server domain (e.g., 'ch.at')
- `message` (string): Query message to send

**Returns:** Promise<string[]> - Array of TXT record strings

### `nativeDNS.parseMultiPartResponse(txtRecords)`

Parses multi-part TXT responses with format "1/3:", "2/3:", etc.

**Parameters:**
- `txtRecords` (string[]): Array of TXT record strings

**Returns:** string - Concatenated response content

## Error Handling

The module provides structured error handling with specific error types:

```typescript
enum DNSErrorType {
  PLATFORM_UNSUPPORTED = 'PLATFORM_UNSUPPORTED',
  NETWORK_UNAVAILABLE = 'NETWORK_UNAVAILABLE',
  DNS_SERVER_UNREACHABLE = 'DNS_SERVER_UNREACHABLE',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  TIMEOUT = 'TIMEOUT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DNS_QUERY_FAILED = 'DNS_QUERY_FAILED'
}

try {
  await nativeDNS.queryTXT('example.com', 'test');
} catch (error) {
  if (error instanceof DNSError) {
    switch (error.type) {
      case DNSErrorType.TIMEOUT:
        console.log('Query timed out, try again');
        break;
      case DNSErrorType.NETWORK_UNAVAILABLE:
        console.log('Check internet connection');
        break;
      default:
        console.log('DNS error:', error.message);
    }
  }
}
```

## Platform Implementation Details

### iOS (Network Framework) ✅ COMPLETE

Uses Apple's Network Framework for DNS queries:
- **API**: `nw_resolver_t` with custom endpoint configuration
- **Status**: ✅ Compiled and tested successfully on iOS simulator
- **Requirements**: iOS 12.0+
- **Implementation**: Modern Swift with async/await patterns
- **Features**: Custom DNS server support, bypasses port 53 restrictions, proper error handling

### Android (DnsResolver + dnsjava) ✅ COMPLETE

Dual implementation strategy for maximum compatibility:
- **Modern (API 29+)**: Android's `DnsResolver` API with proper async handling
- **Legacy (API <29)**: dnsjava library for older Android versions  
- **Status**: ✅ Complete implementation with automatic API level detection
- **Features**: Full DNS control, custom servers, async operations, seamless fallback

### Web Fallback

Graceful degradation for web platforms:
- Reports unavailable capabilities
- Allows app to use alternative DNS methods
- No native module crash on web

## Testing

```bash
# Run unit tests
npm test

# Run integration tests (requires device/simulator)
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Manual Testing

For interactive testing on device:

```typescript
import { runManualTests } from '@dnschat/dns-native/__tests__/integration.test';

// Run in your app
await runManualTests();
```

## Performance Characteristics

- **Query Time**: <2 seconds average for successful queries on both platforms
- **Timeout**: 10 seconds maximum per query with proper cancellation
- **Memory**: Minimal heap growth with query deduplication and connection pooling
- **Concurrency**: Handles multiple simultaneous queries efficiently on both iOS and Android
- **Platform Optimization**: Uses native APIs for maximum performance and battery efficiency

## Troubleshooting

### iOS Issues

**"ERR_SOCKET_BAD_PORT"**: This module bypasses port restrictions using Network Framework.

**Network permissions**: App Transport Security is pre-configured with exceptions for `ch.at`.

**Background suspension**: Module automatically handles app backgrounding and connection recovery.

### Android Issues

**API Level <29**: Module automatically falls back to dnsjava library.

**Network permissions**: `INTERNET` permission is automatically added via Expo plugin.

**Background suspension**: Queries are suspended when app goes to background and resumed on foreground.

### Network Resilience

**UDP Port 53 Blocking**: Automatically detected and handled with TCP fallback in the main DNS service.

**Corporate/Public Wi-Fi**: DNS-over-TCP and DNS-over-HTTPS fallbacks handle restrictive networks.

**Cellular Network Issues**: Multiple fallback layers ensure connectivity across carriers.

### Common Issues

**Module not found**: 
1. Run `cd ios && pod install && cd ..` for iOS
2. Clean and rebuild with `expo run:android` for Android
3. Verify with `nativeDNS.isAvailable()`

**Timeout errors**: 
1. Check network connectivity
2. Verify DNS server availability with `node test-dns.js`
3. App automatically tries multiple connection methods

**Background failures**:
1. Normal behavior - queries suspend in background
2. App automatically resumes queries when returning to foreground
3. Error messages indicate background suspension for debugging

## Integration with ChatDNS

This module is specifically designed for the ChatDNS application but can be used standalone. When integrated with ChatDNS:

1. **Automatic fallback**: Falls back to DNS-over-HTTPS and mock service
2. **Chat integration**: Seamlessly works with existing chat context
3. **Error handling**: Provides user-friendly error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT © ChatDNS Team

## Acknowledgments

- Built following John Carmack's technical standards
- Implements modern Swift and Android best practices
- Uses platform-native APIs exclusively