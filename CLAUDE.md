# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native mobile app providing ChatGPT-like interface via DNS TXT queries. Features production-grade AES-256-GCM encryption with iOS Keychain/Android Keystore, iOS 26+ Liquid Glass UI, native DNS modules with bounds-checked parsing, and comprehensive security hardening (v2.1.0+).

**Current Version**: 2.0.0 (security features from v2.1.0 implemented)
**Primary Documentation**: README.md, SECURITY.md, CHANGELOG.md

## Core Commands

```bash
# Development
npm start                # Start Expo dev server with dev client
npm run ios             # Build & run iOS (requires Xcode)
npm run android         # Build & run Android (auto-sets Java 17)
npm run android:java24  # Build Android with system Java
npm run web             # Start web server
npm run fix-pods        # Fix iOS CocoaPods issues
npm run clean-ios       # Clean iOS build artifacts
npm run sync-versions   # Sync versions across platforms
/changelog              # Generate changelog (in Claude Code)

# Testing & Quality
npm test                # Run all Jest tests in sequence
npm run typecheck       # Check TypeScript for all projects
npm run typecheck:app   # Check app TypeScript only
npm run typecheck:test  # Check test TypeScript only
node test-dns-simple.js "message"      # Simple UDP DNS test
node test-dns-simple.js --experimental # Log fallback strategies
npm run dns:harness     # Advanced DNS test harness
```

## Architecture

### Tech Stack
- **Framework**: React Native 0.81.4 with Expo SDK 54.0.10
- **Language**: TypeScript (strict mode) with multiple tsconfig files
- **Navigation**: Expo Router v6 with Native Tabs (file-based routing)
- **Native Modules**: Custom DNS implementations (iOS Swift, Android Java)
- **UI System**: iOS 26+ Liquid Glass with environmental adaptation + fallbacks
- **State Management**: Zustand + React Context patterns
- **Storage**: iOS Keychain/Android Keystore for encryption keys, AsyncStorage for encrypted data
- **Security**: AES-256-GCM encryption, PBKDF2 key derivation, fail-fast crypto validation

### Project Structure
```
app/                    # Expo Router v6 file-based routing
├── (app)/             # App group with authentication
│   ├── (tabs)/        # Tab navigator layout
│   │   ├── index.tsx  # Main chat screen
│   │   ├── logs.tsx   # DNS logs viewer
│   │   ├── about.tsx  # About/settings screen
│   │   └── dev-logs.tsx # Development logs
│   ├── chat.tsx       # Individual chat view
│   ├── settings.tsx   # App settings
│   └── _layout.tsx    # App layout wrapper
├── _layout.tsx        # Root layout with providers
└── +not-found.tsx     # 404 fallback

src/                   # Source code components and services
├── components/        # Reusable UI components
├── context/          # React Context providers
├── screens/          # Legacy screen components (being migrated)
├── services/         # Core business logic services
├── store/            # Zustand stores
├── theme/            # Theming and design system
└── i18n/             # Internationalization

modules/dns-native/    # Cross-platform DNS native module
├── ios/DNSResolver.swift    # iOS Network Framework implementation
├── android/            # Android DnsResolver API + dnsjava
├── constants.ts        # Shared DNS constants
└── index.ts           # Platform bridge and fallback logic

ios/DNSNative/         # iOS-specific native module (primary implementation)
├── DNSResolver.swift  # Production DNS resolver with AtomicFlag guards
└── DNSNative.podspec  # CocoaPods specification
```

### Key Services
- **DNSService**: Multi-method DNS queries with strict input validation and bounds-checked parsing
- **DNSLogService**: Real-time query monitoring with rate limiting
- **EncryptionService**: AES-256-GCM encryption with platform-specific secure key storage
- **StorageService**: Encrypted chat storage with automatic legacy migration
- **ChatContext + useChatStore**: Hybrid state management
- **SettingsContext**: App configuration with migration support
- **LiquidGlass System**: iOS 26+ native glass effects with comprehensive fallbacks

### DNS Query Methods (in order)
1. **Native DNS modules** (iOS Network Framework / Android DnsResolver)
2. **UDP DNS** (react-native-udp) - Primary fallback
3. **TCP DNS** (react-native-tcp-socket) - For UDP-blocked networks
4. **DNS-over-HTTPS** (Cloudflare) - Limited to non-ch.at queries
5. **Mock service** (development/testing)

## Security & Quality Status (v2.1.0)

### ✅ FIXED - Critical Security Issues (v2.1.0)

**All P0 security vulnerabilities have been resolved:**

1. **✅ Real Secure Storage** (was: Fake Keychain/Keystore)
   - **Fixed**: Now uses real iOS Keychain and Android Keystore via `react-native-keychain`
   - **Location**: `src/utils/encryption.ts:51-215`
   - **Impact**: Encryption keys truly secure, not accessible to malware or backups

2. **✅ Encrypted Backup** (was: Plaintext backup bypass)
   - **Fixed**: Backup now encrypted with AES-256-GCM
   - **Location**: `src/services/storageService.ts:45-66`
   - **Impact**: No plaintext conversation data in AsyncStorage

3. **✅ Fail-Fast Crypto Validation** (was: Silent crypto failure)
   - **Fixed**: App fails to start if Web Crypto unavailable
   - **Location**: `src/utils/encryption.ts:17-49`
   - **Impact**: No silent security degradation

### ✅ FIXED - High-Priority Correctness Issues

4. **✅ iOS CheckedContinuation Crash** (was: P0 double-resume crash)
   - **Fixed**: Atomic flags prevent double resume in all code paths
   - **Location**: `ios/DNSNative/DNSResolver.swift:115-148`
   - **Impact**: Prevents Fabric crashes from concurrent DNS queries

5. **✅ iOS DNS Parser Bounds Checking** (was: Crash vulnerability)
   - **Fixed**: All array access validated with guard statements
   - **Location**: `ios/DNSNative/DNSResolver.swift:244-348`
   - **Impact**: Prevents crashes from malicious DNS responses

6. **✅ iOS DNS Timeout Task Lifecycle** (was: Resource leak)
   - **Fixed**: Timeout tasks properly cancelled in all code paths
   - **Location**: `ios/DNSNative/DNSResolver.swift:151-202`
   - **Impact**: Eliminates resource leaks with concurrent queries

### Known Issues (Non-Critical)

**P1 - Cross-Platform Inconsistencies**
- **Issue**: Message sanitization may differ between platforms
- **Priority**: Low - no security impact, cosmetic only
- **Fix**: Standardize sanitization logic (future enhancement)

**For detailed security information**, see `SECURITY.md` which includes:
- Threat model and attack vectors
- Encryption architecture details
- DNS security measures
- Incident response procedures
- Security testing guidelines

## Development Guidelines

### iOS Development
- Requires CocoaPods: Run `npm run fix-pods` for issues
- Native module in `ios/DNSNative/`
- Uses Network.framework (iOS 14.0+)

### Android Development
- **Requires Java 17**: Automatically set via `npm run android` script
- **Alternative**: Use `npm run android:java24` for system Java
- Native module in `/modules/dns-native/android/`
- Uses DnsResolver API (API 29+) with dnsjava fallback for older devices

### Version Management
- CHANGELOG.md is source of truth
- Run `npm run sync-versions` before builds
- Updates package.json, app.json, iOS, and Android

## Testing & Quality Assurance

### Test Structure
```bash
__tests__/                          # Jest unit tests
├── dnsService.spec.ts             # Core DNS service tests
├── dnsService.parse.spec.ts       # DNS response parsing
├── dnsService.pipeline.spec.ts    # Multi-method pipeline
├── dnsService.rateLimit.spec.ts   # Rate limiting logic
├── dnsConstants.spec.ts           # DNS constant validation
├── settings.migration.spec.ts     # Settings migration tests
├── liquidGlass.spec.ts            # Liquid Glass system tests
├── i18n.spec.ts                   # Internationalization tests
├── store/chatStore.spec.ts        # Zustand store tests
└── mocks/                         # Test mocks and utilities

modules/dns-native/__tests__/       # Native module tests
└── DNSResolver.test.ts            # Cross-platform DNS tests
```

### Pre-commit Checklist
1. **Run TypeScript checks**: `npm run typecheck`
2. **Run full test suite**: `npm test`
3. **Test DNS functionality**: `node test-dns-simple.js "test message"`
4. **Test iOS simulator**: `npm run ios`
5. **Test Android emulator**: `npm run android`
6. **Verify native modules**: Check DNS method preferences in Settings
7. **Version sync if needed**: `npm run sync-versions`

## Common Issues & Fixes

### iOS Build Failures
```bash
npm run fix-pods  # Cleans and reinstalls pods
```

### Native Module Not Found
Verify DNSNative pod in ios/Podfile:
```ruby
pod 'DNSNative', :path => './DNSNative'
```

### Java Version Issues
Use Java 17 for Android builds (automated in npm scripts)

## Documentation Structure

- `README.md` - Project overview, quick start, features
- `SECURITY.md` - Comprehensive security documentation (threat model, encryption architecture, known issues)
- `CHANGELOG.md` - Release history (keepachangelog.com format)
- `SONNET-VERIFICATION-UPDATE.md` - Security implementation verification
- `/docs/` - Technical specifications, guides, troubleshooting
- `.cursor/rules/` - Cursor IDE rules for consistent development

## Important Development Notes

### Code Quality & Security
- **John Carmack reviews all code** - maintain exceptional quality standards
- **DNS Injection Protection**: All user input MUST go through `sanitizeMessage()` validation
- **Server Whitelisting**: Only allow known-safe DNS servers (ch.at, Google DNS, Cloudflare)
- **Thread Safety**: iOS uses NSLock-protected continuations, Android uses bounded thread pools
- **Resource Management**: Always ensure proper cleanup of network connections and timers

### Change Management
- **Update CHANGELOG.md** for all user-facing changes (follows keepachangelog.com)
- **Follow KISS principle** - prefer simple, readable solutions
- **Test thoroughly** before releases using full test suite
- **Version sync** via `npm run sync-versions` before major releases

### DNS Architecture Priorities
1. **Native DNS modules** (fastest, most reliable)
2. **UDP/TCP fallbacks** (network compatibility)
3. **DNS-over-HTTPS** (privacy, bypasses ch.at custom TXT responses)
4. **Mock service** (development only)

### Development Tools
- **Use `ast-grep`** for syntax-aware searches: `ast-grep --lang typescript -p '<pattern>'`
- **Consult Swift docs** at `/Applications/Xcode.app/Contents/PlugIns/IDEIntelligenceChat.framework/Versions/A/Resources/AdditionalDocumentation`
- **VibeTunnel integration**: Use `vt title` commands to communicate progress

## Swift Xcode 26 Additional Docs

Always look for Swift documentation updated at this Xcode 26 folder: `/Applications/Xcode.app/Contents/PlugIns/IDEIntelligenceChat.framework/Versions/A/Resources/AdditionalDocumentation`.

# Guidelines for Modern Swift

Whenever possible, favor Apple programming languages and frameworks or APIs that are already available on Apple devices. Whenever suggesting code, assume the user wants Swift unless they show or tell you they are interested in another language. Always prefer Swift, Objective-C, C, and C++ over alternatives.

Pay close attention to the platform that the code targets. For example, if you see clues that the user is writing a Mac app, avoid suggesting iOS-only APIs.

Refer to Apple platforms with their official names, like iOS, iPadOS, macOS, watchOS, and visionOS. Avoid mentioning specific products and instead use these platform names.

In general, prefer the use of Swift Concurrency (async/await, actors, etc.) over tools like Dispatch or Combine, but if the user's code or words show you they may prefer something else, you should be flexible to this preference.

## Modern Previews

Instead of using the `PreviewProvider` protocol for new previews in SwiftUI, use the new `#Preview` macro.
