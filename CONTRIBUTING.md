# Contributing to DNSChat

Thank you for your interest in contributing to DNSChat! This guide will help you get started with contributing to our React Native DNS-based AI chat application.

## 🎯 Project Philosophy

**Enterprise-Grade Quality**: All contributions should meet production standards that John Carmack would approve of.

**Core Principles**:

- **Reliability First**: DNS communication must be bulletproof
- **Cross-Platform Parity**: iOS and Android feature parity is essential
- **Performance**: Native implementations over JavaScript when possible
- **Security**: No shortcuts on security or input validation
- **Documentation**: Code quality includes comprehensive documentation

## 🚀 Quick Start for Contributors

### Prerequisites

- Follow [docs/INSTALL.md](./docs/INSTALL.md) for complete setup
- **Java 17** for Android (required - other versions fail)
- **iOS 16+** for iOS development and testing
- **Xcode 15+** for iOS native development

### Development Setup

```bash
# Fork and clone your fork
git clone https://github.com/YOUR_USERNAME/dnschat.git
cd dnschat

# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Start development
npm start
```

## 📋 Types of Contributions

### 🐛 Bug Fixes

- **DNS connection issues**: Network resilience improvements
- **Platform-specific crashes**: iOS/Android native module fixes
- **UI/UX issues**: React Native component improvements
- **Build system issues**: Expo, Xcode, Gradle configurations

### ✨ Feature Enhancements

- **DNS protocol improvements**: Better fallback strategies
- **Native module enhancements**: Performance optimizations
- **UI improvements**: Better user experience
- **Network resilience**: New fallback methods

### 📚 Documentation

- **API documentation**: DNS service reference
- **Troubleshooting guides**: Common issue solutions
- **Architecture docs**: System design explanations
- **Code comments**: Inline documentation improvements

### 🧪 Testing

- **Unit tests**: DNS service testing
- **Integration tests**: Cross-platform compatibility
- **Network testing**: Various network condition testing
- **Performance testing**: DNS query benchmarking

## 🔧 Development Guidelines

### Code Standards

#### TypeScript

- **Strict mode enabled**: No `any` types
- **Interface definitions**: All data structures typed
- **JSDoc comments**: For public APIs
- **ESLint compliance**: Follow project ESLint config

#### Swift (iOS Native)

- **iOS 16+ compatibility**: Use @available for newer APIs
- **Thread safety**: MainActor for UI-related operations
- **Error handling**: Comprehensive error types and handling
- **Memory safety**: Proper resource cleanup

#### Java (Android Native)

- **Java 17 compatibility**: Latest language features
- **Thread safety**: ConcurrentHashMap for concurrent operations
- **Exception handling**: Structured error types
- **Resource management**: Proper cleanup in finally blocks

### Architecture Principles

#### DNS Service Layer

```typescript
// ✅ Good - Abstracted service interface
interface DNSService {
  queryLLM(message: string): Promise<string>;
  isAvailable(): Promise<boolean>;
}

// ❌ Bad - Direct implementation coupling
const response = await nativeDNS.queryTXT("ch.at", message);
```

#### Error Handling

```typescript
// ✅ Good - Structured error handling
try {
  const response = await dnsService.queryLLM(message);
  return response;
} catch (error) {
  if (error instanceof DNSError) {
    // Handle DNS-specific errors
  }
  throw error;
}

// ❌ Bad - Generic error swallowing
try {
  return await dnsService.queryLLM(message);
} catch {
  return "Error occurred";
}
```

#### Cross-Platform Consistency

```typescript
// ✅ Good - Platform abstraction
const capabilities = await nativeDNS.isAvailable();
if (capabilities.available) {
  // Use native implementation
}

// ❌ Bad - Platform-specific code in business logic
if (Platform.OS === "ios") {
  // iOS-specific implementation
} else {
  // Android-specific implementation
}
```

## 🧪 Testing Requirements

### Before Submitting

1. **All platforms tested**: iOS, Android, Web
2. **Multiple networks**: WiFi, cellular, restricted networks
3. **DNS methods**: Test all fallback methods work
4. **Version sync**: Ensure all platforms use same version
5. **Documentation updated**: Relevant docs reflect changes

### Testing Commands

```bash
# DNS connectivity test
node test-dns-simple.js "Hello world"

# Platform builds
npm run ios
npm run android
npm run web

# Version synchronization
npm run sync-versions
```

### Network Testing Checklist

- [ ] **Open WiFi**: All DNS methods work
- [ ] **Corporate WiFi**: Fallback to HTTPS works
- [ ] **Cellular**: Native and UDP methods work
- [ ] **VPN**: All fallback methods tested
- [ ] **Airplane mode**: Graceful error handling

## 📝 Pull Request Process

### 1. Branch Naming

```bash
# Feature branches
git checkout -b feature/dns-over-quic-support

# Bug fix branches
git checkout -b fix/ios-dns-timeout-handling

# Documentation branches
git checkout -b docs/api-reference-updates
```

### 2. Commit Messages

Follow conventional commits format:

```bash
# Feature
feat(dns): add DNS-over-QUIC fallback method

# Bug fix
fix(ios): resolve CheckedContinuation double resume crash

# Documentation
docs(api): update DNS service reference with new methods

# Build system
build(android): update Gradle to 8.10.2 for React Native compatibility
```

### 3. Pull Request Template

**Title**: Clear, descriptive summary
**Description**: Include:

- **Problem**: What issue does this solve?
- **Solution**: How does this change fix it?
- **Testing**: What testing was performed?
- **Platforms**: iOS/Android/Web compatibility confirmed
- **Breaking changes**: Any API changes?

### 4. Code Review Process

**All PRs require**:

- [ ] **Code review**: At least one maintainer approval
- [ ] **Platform testing**: iOS and Android builds successful
- [ ] **DNS testing**: All DNS methods tested
- [ ] **Documentation**: Updated if API changes
- [ ] **Version compatibility**: No breaking changes without major version bump

## 🏗️ Architecture Guidelines

### Native Module Development

#### iOS Native Module

```swift
// File: ios/DNSNative/DNSResolver.swift

@objc(DNSResolver)
final class DNSResolver: NSObject, @unchecked Sendable {
    // Thread-safe implementation required
    @MainActor private var activeQueries: [String: Task<[String], Error>] = [:]

    // Enterprise-grade error handling
    private func performQuery() async throws -> [String] {
        // Proper timeout handling with NSLock protection
    }
}
```

#### Android Native Module

```java
// File: modules/dns-native/android/DNSResolver.java

public class DNSResolver {
    // Thread-safe query deduplication
    private static final Map<String, CompletableFuture<List<String>>> activeQueries =
        new ConcurrentHashMap<>();

    // Structured error handling
    public CompletableFuture<List<String>> queryTXT(String domain, String message) {
        // Three-tier fallback implementation
    }
}
```

### React Native Integration

#### Service Layer Pattern

```typescript
// File: src/services/dnsService.ts

export class DNSService {
  async queryLLM(message: string): Promise<string> {
    // Abstract interface for all DNS methods
    const methods = this.getDNSMethods();

    for (const method of methods) {
      try {
        return await method.query(message);
      } catch (error) {
        // Continue to next method
      }
    }

    throw new Error("All DNS methods failed");
  }
}
```

## 🔐 Security Guidelines

### Input Validation

```typescript
// ✅ Good - Comprehensive validation
function sanitizeMessage(message: string): string {
  if (!message || typeof message !== "string") {
    throw new Error("Invalid message type");
  }

  return message
    .trim()
    .substring(0, 200) // Prevent oversized DNS labels
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .toLowerCase();
}

// ❌ Bad - No validation
function sanitizeMessage(message: string): string {
  return message.toLowerCase();
}
```

### Network Security

- **DNS-over-HTTPS**: Always available as fallback
- **Input sanitization**: No executable code in DNS queries
- **Error information**: Don't leak sensitive data in error messages
- **Rate limiting**: Prevent DNS flooding (implemented in service layer)

## 📚 Documentation Standards

### Code Documentation

````typescript
/**
 * Performs DNS TXT query using native platform implementations
 *
 * @param message - User message to send via DNS (max 200 chars)
 * @param server - DNS server hostname (default: "ch.at")
 * @returns Promise resolving to LLM response
 *
 * @throws {DNSError} When all DNS methods fail
 * @throws {ValidationError} When message format is invalid
 *
 * @example
 * ```typescript
 * const response = await dnsService.queryLLM("Hello world");
 * console.log(response); // "Hello! How can I help you today?"
 * ```
 */
async queryLLM(message: string, server: string = "ch.at"): Promise<string>
````

### README Updates

When adding features, update:

- **Feature list**: Add to key features
- **Architecture section**: Update if architecture changes
- **Usage examples**: Include new functionality
- **Troubleshooting**: Add common issues for new features

## 🚨 Breaking Change Policy

### Major Version (2.0.0)

- **API changes**: Incompatible public API modifications
- **Platform requirements**: Minimum iOS/Android version changes
- **Architecture changes**: Fundamental DNS implementation changes

### Minor Version (1.8.0)

- **New features**: Backward-compatible functionality
- **New DNS methods**: Additional fallback strategies
- **Performance improvements**: Non-breaking optimizations

### Patch Version (1.7.8)

- **Bug fixes**: Issue resolution without API changes
- **Security fixes**: Vulnerability patches
- **Documentation updates**: Non-API documentation changes

## 🤝 Community Guidelines

### Communication

- **Be respectful**: Professional, constructive feedback
- **Be specific**: Detailed issue descriptions and solutions
- **Be patient**: Maintainers are volunteers with day jobs
- **Be helpful**: Share network testing results and configurations

### Issue Reporting

Include:

- **Platform**: iOS/Android/Web
- **Version**: App version and OS version
- **Network**: WiFi/cellular, corporate/public
- **Reproduction steps**: Detailed, step-by-step instructions
- **Expected vs actual**: What should happen vs what actually happens

## 📞 Getting Help

### Documentation

- **Installation**: [docs/INSTALL.md](./docs/INSTALL.md)
- **Troubleshooting**: [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- **API Reference**: [docs/API.md](./docs/API.md)

### Contact

- **GitHub Issues**: [dnschat/issues](https://github.com/mneves75/dnschat/issues)
- **Discussions**: [dnschat/discussions](https://github.com/mneves75/dnschat/discussions)
- **Maintainer**: [@mneves75](https://x.com/mneves75)

## 🏆 Recognition

Contributors will be recognized in:

- **CHANGELOG.md**: Credit in release notes
- **README.md**: Contributors section
- **About screen**: In-app acknowledgments

---

**Thank you for contributing to DNSChat!**

_Every contribution, no matter how small, helps make DNS-based AI communication more reliable and accessible._
