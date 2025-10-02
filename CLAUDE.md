# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native mobile app providing ChatGPT-like interface via DNS TXT queries. Features production-grade AES-256-GCM encryption with iOS Keychain/Android Keystore, iOS 26+ Liquid Glass UI, native DNS modules with bounds-checked parsing, and comprehensive security hardening (v2.1.0+).

**Current Version**: 2.0.1
**Modernization Status**: 🔴 iOS 26 + Android Material You modernization planned (see MODERNIZATION_PLAN_iOS26_ANDROID.md)
**Primary Documentation**: README.md, SECURITY.md, CHANGELOG.md, MODERNIZATION_PLAN_iOS26_ANDROID.md

## Core Commands

```bash
# Development
npm start                # Start dev server
npm run ios             # Build iOS (requires Java 17)
npm run android         # Build Android (requires Java 17)
npm run fix-pods        # Fix iOS CocoaPods issues
npm run sync-versions   # Sync versions across platforms
/changelog              # Generate changelog (in Claude Code)

# Testing
node test-dns.js "message"  # Test DNS functionality
```

## Architecture

### Tech Stack
- **Framework**: React Native 0.81.1 with Expo SDK 54.0.0-preview.12 ⚠️ *Upgrade to 54.0.12 stable pending*
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router v6 with Native Tabs (file-based routing)
- **Native Modules**: Custom DNS implementations (iOS Swift, Android Java)
- **UI System**: iOS 26+ Liquid Glass with environmental adaptation + fallbacks
- **State Management**: Zustand + React Context patterns
- **Storage**: iOS Keychain/Android Keystore for encryption keys, AsyncStorage for encrypted data
- **Security**: AES-256-GCM encryption, PBKDF2 key derivation, fail-fast crypto validation

### Key Services
- **DNSService**: Multi-method DNS queries with fallback chain
- **StorageService**: AsyncStorage persistence  
- **DNSLogService**: Query logging and debugging
- **ChatContext**: Global state management

### DNS Query Methods (in order)
1. Native DNS modules (iOS/Android optimized)
2. UDP DNS (react-native-udp)
3. TCP DNS (react-native-tcp-socket)
4. DNS-over-HTTPS (Cloudflare)
5. Mock service (development)

## Modernization Plan

**Status**: 🔴 **AWAITING JOHN CARMACK'S REVIEW**

A comprehensive iOS 26 + Android Material You modernization plan has been created. See [MODERNIZATION_PLAN_iOS26_ANDROID.md](MODERNIZATION_PLAN_iOS26_ANDROID.md) for full details.

### Key Modernization Goals:
1. **Expo SDK 54 Stable**: Upgrade from preview to 54.0.12 stable release
2. **iOS 26 Liquid Glass**: Replace custom wrapper with official `expo-glass-effect`
3. **Android Material You**: Full Material Design 3 integration with dynamic theming
4. **Performance**: FlashList, remove console.logs, achieve 60fps
5. **Accessibility**: WCAG 2.1 AA compliance + i18n (EN/PT/ES)

### Timeline: 4-6 weeks (8 phases)
- Week 1: Dependencies + iOS 26 Liquid Glass
- Week 2: Android Material You + Screen redesigns
- Week 3-4: Performance + Accessibility
- Week 5: Testing & QA
- Week 6: Documentation & Release

## Critical Known Issues (FIXED in v2.0.1)

### ✅ P0 - iOS CheckedContinuation Crash (FIXED)
**Location**: ios/DNSNative/DNSResolver.swift:115-148
**Fix**: Atomic flags prevent double resume in all code paths

### P1 - Cross-Platform Inconsistencies  
**Issue**: Message sanitization differs between platforms
**Fix**: Standardize sanitization logic

### P2 - Resource Leaks
**Issue**: NWConnection not properly disposed on failure
**Fix**: Ensure cleanup in all code paths

## Development Guidelines

### iOS Development
- Requires CocoaPods: Run `npm run fix-pods` for issues
- Native module in `ios/DNSNative/`
- Uses Network.framework (iOS 14.0+)

### Android Development  
- **Requires Java 17**: Set via `npm run android`
- Native module in `android/app/src/main/java/com/dnsnative/`
- Uses DnsResolver API (API 29+) with dnsjava fallback

### Version Management
- CHANGELOG.md is source of truth
- Run `npm run sync-versions` before builds
- Updates package.json, app.json, iOS, and Android

## Testing Checklist

Before committing:
1. Test on iOS simulator
2. Test on Android emulator  
3. Verify DNS queries work: `node test-dns.js "test"`
4. Check native module registration
5. Run version sync if needed

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

- `/docs/technical/` - Specifications and guides
- `/docs/troubleshooting/` - Common issues
- `/docs/architecture/` - System design
- `CHANGELOG.md` - Release history

## Important Notes

- John Carmack reviews all code - maintain high quality
- Update CHANGELOG.md for all changes
- Follow KISS principle
- Test thoroughly before releases
- Native DNS is prioritized over network methods
- You run in an environment where `ast-grep` is available; whenever a search requires syntax-aware or structural matching, default to `ast-grep --lang ruby -p '<pattern>'` (or set `--lang` appropriately) and avoid falling back to text-only tools like `rg` or `grep` unless I explicitly request a plain-text search.