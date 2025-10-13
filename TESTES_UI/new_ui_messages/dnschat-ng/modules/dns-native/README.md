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

## DNS Server Contract

- The Go resolver at [`dns.go`](https://github.com/Deep-ai-inc/ch.at/blob/main/dns.go) is authoritative. Clients must emit dashed, lowercase labels that map `"hello world" → "hello-world"` and never rely on base32 for the primary TXT flow.
- Messages are limited to **120 characters before sanitization**. After sanitization, the resulting DNS label must be ≤63 characters; otherwise the client surfaces an error.
- The TypeScript layer composes the fully qualified domain (`<label>.ch.at`) and hands it to the native modules unchanged. iOS and Android validate the FQDN but no longer rewrite or append zones on-device.
- TXT responses may span multiple 255-byte strings. The shared parser now concatenates plain segments in order and validates numbered `n/N:` sequences.
- The server streams with a **4 second hard deadline** and trims responses to **500 characters**; clients should surface `... (incomplete)` when the server indicates truncation.
- Duplicate numbered TXT segments produced by UDP retransmissions are accepted when their payload matches; conflicting duplicates trigger an error on all platforms.

## Swift Xcode 26 Additional Docs

Always look for Swift documentation updated at this Xcode 26 folder: `/Applications/Xcode.app/Contents/PlugIns/IDEIntelligenceChat.framework/Versions/A/Resources/AdditionalDocumentation`.

# Guidelines for Modern Swift

Whenever possible, favor Apple programming languages and frameworks or APIs that are already available on Apple devices. Whenever suggesting code, assume the user wants Swift unless they show or tell you they are interested in another language. Always prefer Swift, Objective-C, C, and C++ over alternatives.

Pay close attention to the platform that the code targets. For example, if you see clues that the user is writing a Mac app, avoid suggesting iOS-only APIs.

Refer to Apple platforms with their official names, like iOS, iPadOS, macOS, watchOS, and visionOS. Avoid mentioning specific products and instead use these platform names.

In general, prefer the use of Swift Concurrency (async/await, actors, etc.) over tools like Dispatch or Combine, but if the user's code or words show you they may prefer something else, you should be flexible to this preference.

## Modern Previews

Instead of using the `PreviewProvider` protocol for new previews in SwiftUI, use the new `#Preview` macro.

## Installation

This module is integrated into the ChatDNS app via an Expo config plugin. For standalone usage:

```bash
npm install @dnschat/dns-native
```

## Quick Start

```typescript
import { nativeDNS, DNSError, DNSErrorType } from "@dnschat/dns-native";

// Check platform capabilities
const capabilities = await nativeDNS.isAvailable();
console.log("DNS available:", capabilities.available);
console.log("Platform:", capabilities.platform);

// Query TXT records
try {
  const txtRecords = await nativeDNS.queryTXT("ch.at", "Hello AI");
  const response = nativeDNS.parseMultiPartResponse(txtRecords);
  console.log("AI Response:", response);
} catch (error) {
  if (error instanceof DNSError) {
    console.error("DNS Error:", error.type, error.message);
  }
}
```

## API Reference

### `nativeDNS.isAvailable()`

Returns platform capabilities and availability status.

```typescript
interface DNSCapabilities {
  available: boolean;
  platform: "ios" | "android" | "web";
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
  PLATFORM_UNSUPPORTED = "PLATFORM_UNSUPPORTED",
  NETWORK_UNAVAILABLE = "NETWORK_UNAVAILABLE",
  DNS_SERVER_UNREACHABLE = "DNS_SERVER_UNREACHABLE",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  TIMEOUT = "TIMEOUT",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  DNS_QUERY_FAILED = "DNS_QUERY_FAILED",
}

try {
  await nativeDNS.queryTXT("example.com", "test");
} catch (error) {
  if (error instanceof DNSError) {
    switch (error.type) {
      case DNSErrorType.TIMEOUT:
        console.log("Query timed out, try again");
        break;
      case DNSErrorType.NETWORK_UNAVAILABLE:
        console.log("Check internet connection");
        break;
      default:
        console.log("DNS error:", error.message);
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

> **Note:** The Jest config in this monorepo maps `react-native` to `../../__tests__/mocks/react-native.js`. If you consume `@dnschat/dns-native` elsewhere, provide an equivalent mock in your Jest setup.

### Manual Testing

For interactive testing on device:

```typescript
import { runManualTests } from "@dnschat/dns-native/__tests__/integration.test";

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
