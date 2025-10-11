# Expo Doctor Configuration & Intentional Deviations

**Last Updated:** 2025-10-10
**Version:** 2.0.0+

## Overview

This document explains intentional deviations from Expo Doctor's recommended configuration and why they are necessary for DNSChat's architecture.

## Intentional Deviations

### 1. Native Configuration Properties in app.json (Non-CNG Project)

**Status:** INTENTIONAL - Not an error
**Expo Doctor Warning:**
```
This project contains native project folders but also has native configuration
properties in app.json, indicating it is configured to use Prebuild. When the
android/ios folders are present, EAS Build will not sync the following properties:
orientation, icon, userInterfaceStyle, scheme, ios, android, plugins, androidStatusBar.
```

#### Why We Keep Native Folders

DNSChat requires **custom native modules** (`DNSNative`) that provide platform-optimized DNS resolution:
- **iOS**: Swift implementation using `Network.framework` for native DNS queries
- **Android**: Java implementation using `DnsResolver` API (API 29+) with dnsjava fallback

**Continuous Native Generation (CNG/Prebuild)** is incompatible with custom native modules because:
1. Prebuild regenerates native folders on every build
2. Custom native code would be lost during regeneration
3. We need manual control over native module integration

#### Why We Keep app.json Properties

We maintain native configuration properties in `app.json` for **documentation and development convenience**:
- Serves as single source of truth for intended configuration
- Enables faster development with Expo development builds
- Allows partial Prebuild usage for plugins (expo-splash-screen, expo-asset, etc.)
- Native folders are manually kept in sync with app.json values

#### Manual Sync Process

When changing configuration:
1. Update `app.json` (source of truth)
2. Manually sync to `ios/` (Info.plist, project.pbxproj)
3. Manually sync to `android/` (AndroidManifest.xml, build.gradle)
4. Test on both platforms to verify sync

**Affected Properties (Manually Synced):**
- `orientation` → iOS: UISupportedInterfaceOrientations, Android: android:screenOrientation
- `icon` → iOS: AppIcon in Assets.xcassets, Android: res/mipmap
- `userInterfaceStyle` → iOS: UIUserInterfaceStyle, Android: android:theme
- `scheme` → iOS: URL Schemes in Info.plist, Android: intent-filter in AndroidManifest
- `ios.bundleIdentifier` → iOS: PRODUCT_BUNDLE_IDENTIFIER
- `android.package` → Android: package in AndroidManifest

### 2. Excluded Packages (React Native Directory Check)

**Status:** INTENTIONAL - Critical DNS fallback infrastructure
**Expo Doctor Warning:**
```
Untested on New Architecture: react-native-tcp-socket
Unmaintained: react-native-udp
No metadata available: @dnschat/dns-native
```

#### Package: `react-native-udp` (Unmaintained)

**Why We Keep It:**
- **Critical DNS fallback**: Primary fallback when native DNS fails
- **Network resilience**: Works on networks that block native DNS or DNS-over-HTTPS
- **No viable alternatives**: No maintained React Native UDP library exists
- **Defensive implementation**: Code uses try-catch and gracefully falls back if unavailable

**Architecture Integration:**
```typescript
// dnsService.ts lines 46-60
let dgram: any = null;
try {
  dgram = require('react-native-udp');
  // Graceful fallback to TCP/HTTPS/Mock if UDP unavailable
} catch (error) {
  // UDP not available, will use fallback methods
}
```

**Maintenance Status:**
- Last updated: January 26, 2023 (2 years unmaintained)
- Version: 4.1.7 (stable, no known critical bugs)
- New Architecture: Uses Interop Layer (backward compatibility mode)

**Risk Mitigation:**
1. Non-critical: App functions without UDP (fallback chain works)
2. Isolated: Loaded dynamically, failures don't crash app
3. Monitored: DNSLogService tracks UDP failures and fallback success

**Alternative Considered:**
- Native UDP sockets via custom native module → Too complex, overkill for fallback
- Remove UDP entirely → Reduces network resilience significantly

#### Package: `react-native-tcp-socket` (New Architecture Untested)

**Why We Keep It:**
- **Critical DNS fallback**: Secondary fallback when UDP is blocked
- **Corporate networks**: TCP port 53 often allowed when UDP is blocked
- **Active development**: Version 6.3.0, updated 5 months ago
- **Defensive implementation**: Graceful fallback if unavailable

**Architecture Integration:**
```typescript
// dnsService.ts lines 62-76
let TcpSocket: any = null;
try {
  TcpSocket = require('react-native-tcp-socket');
  // Graceful fallback to HTTPS/Mock if TCP unavailable
} catch (error) {
  // TCP Socket not available, will use DNS-over-HTTPS fallback
}
```

**New Architecture Status:**
- Issue #187 open: "Support for React Native New Architecture"
- React Native 0.74+ Interop Layer provides backward compatibility
- Tested successfully on New Architecture (Expo SDK 54, RN 0.81)
- No runtime errors observed in development/testing

**Risk Mitigation:**
1. Non-critical: App functions without TCP (native DNS and mock fallback work)
2. Isolated: Loaded dynamically, failures tracked and logged
3. Tested: Manually verified on iOS 16+ and Android API 29+

**Alternative Considered:**
- Wait for New Architecture support → Delays critical network resilience
- Native TCP sockets via custom module → Too complex for fallback

#### Package: `@dnschat/dns-native` (No Metadata)

**Why No Metadata:**
- **Local package**: Custom native module, not published to npm
- **Private to DNSChat**: Located in `modules/dns-native/`
- **Not applicable**: React Native Directory only tracks public npm packages

**Package Details:**
- Type: Custom native module (iOS Swift, Android Java)
- Purpose: Platform-optimized DNS TXT record resolution
- Status: Actively maintained as part of DNSChat

### 3. DNS Fallback Chain Architecture

**Complete Fallback Chain (in order):**

1. **Native DNS** (`@dnschat/dns-native`)
   - iOS: Network.framework (iOS 14.0+)
   - Android: DnsResolver API (API 29+) with dnsjava fallback
   - Fastest, most reliable

2. **UDP DNS** (`react-native-udp`)
   - Uses dns-packet for protocol handling
   - Standard DNS port 53 via UDP
   - Falls back if native unavailable or network blocks native

3. **TCP DNS** (`react-native-tcp-socket`)
   - DNS-over-TCP (RFC 7766)
   - Works when UDP port 53 is blocked
   - Common in corporate/restrictive networks

4. **DNS-over-HTTPS** (fetch API)
   - Uses Cloudflare DNS-over-HTTPS
   - **Architectural limitation**: Cannot access ch.at custom TXT responses
   - Disabled for ch.at, available for other DNS providers

5. **Mock Service** (`MockDNSService`)
   - Development/testing fallback
   - Guarantees app never completely fails
   - Disabled by default (user-configurable)

## Configuration

### Expo Doctor Exclusions

**Location:** `package.json`

```json
{
  "expo": {
    "doctor": {
      "reactNativeDirectoryCheck": {
        "exclude": [
          "react-native-udp",
          "react-native-tcp-socket",
          "@dnschat/dns-native"
        ],
        "listUnknownPackages": true
      }
    }
  }
}
```

**Purpose:**
- Acknowledges intentional use of unmaintained/untested packages
- Documents technical debt and architectural decisions
- Allows expo-doctor to pass while preserving critical functionality

## Verification

### Test DNS Fallback Chain

```bash
# Test all transport methods
node test-dns-simple.js "Hello DNS"

# Test individual transports (requires running app)
# - Native DNS: Automatically used first
# - UDP: Disable native DNS in Settings
# - TCP: Disable native DNS and block UDP
# - Mock: Enable in Settings
```

### Run Expo Doctor

```bash
npx expo-doctor

# Expected result: 17/17 checks passed (after configuration)
```

## Technical Debt

### Priority: P2 (Monitor, not urgent)

**Tasks:**
1. **Monitor react-native-tcp-socket** for New Architecture support (Issue #187)
2. **Monitor react-native-udp** for community fork or maintained alternative
3. **Consider custom native UDP/TCP modules** if packages become incompatible
4. **Test New Architecture thoroughly** when Expo SDK upgrades

### When to Address

Trigger action if:
- Expo SDK or React Native upgrade breaks UDP/TCP libraries
- New Architecture Interop Layer removed
- Critical security vulnerability discovered in unmaintained packages
- Better-maintained alternatives become available

## References

- **Expo Doctor**: https://docs.expo.dev/more/expo-cli/#doctor
- **React Native Directory**: https://reactnative.directory/
- **New Architecture Interop**: https://reactnative.dev/docs/new-architecture-intro
- **DNSChat DNS Protocol**: `docs/technical/DNS-PROTOCOL-SPEC.md`
- **Native Module Specification**: `docs/technical/NATIVE-SPEC-CLAUDE.md`

---

**Reviewed by:** Development Team
**Approved by:** Technical Lead
**John Carmack Review:** ⏳ Pending
