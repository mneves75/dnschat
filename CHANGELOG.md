# Changelog

All notable changes to DNSChat will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [Unreleased]

## [4.0.6] - 2026-02-26

### Changed

- Bumped app version metadata to `4.0.6` (build `34`) across `package.json`, `app.json`, iOS project settings, Android Gradle config, and release docs.
- Squashed release work into one consolidated changelog entry for this patch line.
- Expanded verification gates in CI and local workflows: Expo Doctor, SDK alignment, typed routes, DNS resolver sync, React Compiler health, and Android 16KB alignment.

### Fixed

- Fixed iOS `Bundle React Native code and images` failures caused by Xcode script sandboxing by disabling user script sandboxing for the app target.
- Hardened SDK alignment checks to detect drift between declared deps, lockfile resolution, and installed `node_modules` versions.
- Switched iOS `Info.plist` version keys to build settings (`$(MARKETING_VERSION)`, `$(CURRENT_PROJECT_VERSION)`) to prevent future version drift.

## [4.0.5] - 2026-02-26

### Changed

- Bumped app version metadata to `4.0.5` (build `33`) across `package.json`, `app.json`, iOS project settings, and Android Gradle config.
- Merged Expo SDK 55 migration into `main` with dependency and native-project alignment.
- Upgraded stack to Expo `55.0.0`, React `19.2.0`, and React Native `0.83.2`.
- Removed obsolete SDK54 `patch-package` patches after validating SDK55 compatibility.
- Updated typed routes verification to support Expo Router 55+ generation paths.
- Updated README and docs metadata to reflect the shipped SDK55 stack.

### Fixed

- About and Settings now display runtime app version/build from Expo-native metadata (with safe fallback) instead of relying on a static package version import.
- Fixed iOS runtime startup issue caused by StrictMode (`findHostInstance_DEPRECATED`) by removing StrictMode at root layout.
- Fixed tab chat list runtime navigation error by removing focus-hook dependency that relied on missing navigation context during startup.

## [4.0.2] - 2026-01-07

### Fixed

- **CRITICAL**: Fixed data race on static `allowedServers` variable using `@MainActor` isolation
- **CRITICAL**: Fixed Unicode sanitization mismatch (Swift `.isDiacritic` vs JS `\p{M}`) by using `generalCategory` for combining marks
- Fixed missing `@available(iOS 16.0, *)` annotations on `createQueryTask` and `withTimeout` functions
- Fixed force unwrap in `withTimeout` with safe `guard let` pattern
- Fixed `CancellationError` not mapped to `DNSError.cancelled` for consistent error handling
- Added defensive iOS 16+ guard in `queryTXT` to prevent runtime crashes on older iOS versions
- Added `.waiting(let error)` handling in NWConnection state handler for early network unreachable detection
- Replaced deprecated `Task.sleep(nanoseconds:)` with `Task.sleep(for:)` API
- Added `Task.checkCancellation()` in retry loop for faster cancellation response
- Added comprehensive doc comments on concurrency-sensitive code paths
- **CRITICAL**: Fixed NWConnection resource leak on timeout/cancellation using `withTaskCancellationHandler`
- Fixed potential main thread blocking by marking `performUDPQuery` as `nonisolated` for Swift 6.2+ compatibility
- Fixed `cleanup()` to use proper `@MainActor` isolation instead of fire-and-forget Task
- Fixed `RNDNSModule.invalidate()` to dispatch to MainActor for cleanup
- Replaced global queue with dedicated serial queue for NWConnection callbacks

### Changed

- Enabled Android edge-to-edge and predictive back gesture support via Expo config.
- Set explicit Android build properties (compile/target SDK 35, NDK r28) and aligned native module fallbacks.
- Aligned Android build properties to SDK 36 in Expo config and native module fallbacks.
- Standardized Android dnsjava dependency version across app and native module.
- Updated `sync-versions` script parsing to handle Gradle assignment syntax.
- Docs: added guidelines compliance + code review exec spec.
- Docs: added data inventory/model registry and updated engineering exec tracking.
- Removed manual memoization in `ChatInput` for React Compiler support and updated static tests.
- Added explicit `useEffect` justification comments for external side effects.
- Simplified Android native sanitizer config to store compiled patterns with equality based on pattern + flags.
- Added DNS server health tracking in `DNSService` to record successes/failures per host:port.
- Docs: refreshed exec plan verification logs and aligned DNS server migration notes to port 53 default.
- Relaxed Android startup diagnostics to warn (not fail) when the native module registry is incomplete in dev runtimes.
- Aligned Android versionCode with iOS build number (31) to keep version sync no-op.
- Added a 16KB page-size alignment verification script for Android native libraries.
- Added glass style sanitization to keep shadow/border props off native glass views.
- Aligned Android NDK configuration to r29 and added checks for installed NDK versions.
- Added typed routes verification/generation for Expo Router.
- Added React Compiler healthcheck command for verification.
- Docs: recorded final verification run (lint/tests + Android/typed routes/React Compiler checks) in engineering exec spec.

### Fixed

- Fixed patch-package parsing for @react-native-menu/menu and react-native-screens patches.
- Added AsyncStorage dev dependency to `modules/dns-native` to unblock Jest mocks in module tests.
- Updated `modules/dns-native/package-lock.json` so CI installs the AsyncStorage devDependency.
- Stabilized chat loading and error alert behavior to avoid repeated alerts.
- Gated native DNS debug logging behind explicit debug flags in runtime and tests.
- Removed remaining `any`/`@ts-ignore` usage in production and test code paths.
- Hid route group names from iOS back button titles (no more "(tabs)" in header).
- Synced Android `DNSResolver.java` sources between `modules/dns-native` and the Expo prebuild output to prevent drift.
- Fixed Android DNS query deduplication so only one execution runs per unique query.
- Normalized DNS server hostnames (trim/lowercase/strip trailing dots) to stabilize cache keys and socket targets.
- Hardened Android sanitizer config validation to enforce the 63-byte DNS label limit.
- Cleanup logging now reports the correct number of cleared queries.
- Added Android JVM unit tests for resolver cleanup, sanitizer bounds, and host normalization.
- Added `verify:dnsresolver-sync` script to guard against resolver source drift.
- Replaced deprecated dnsjava resolver timeout API and URL construction in Android DNS resolver.
- Ensured DNS-over-HTTPS connections always close and Expo `createExpoConfig` gets a default `NODE_ENV` during Gradle builds.
- Updated project Gradle scripts to use assignment syntax to avoid upcoming Gradle 10 Groovy DSL deprecations.
- Patched dependency Gradle scripts to replace deprecated Groovy space-assignment syntax.
- Removed debug signing from Android release builds and wired release signing config to keystore.properties (android/ or repo root).
- Registered ExpoLinkingPackage via ModuleRegistryAdapter for stable deep-link lifecycle in Expo dev-client builds.
- Added iOS native DNS module cleanup on invalidation to cancel pending tasks.
- Aligned iOS Unicode normalization with JS/Android (NFKD compatibility decomposition).
- Enforced DNS server allowlist inside native resolvers using shared constants.
- Migrated Android DNS-over-HTTPS fallback to RFC 8484 wireformat (application/dns-message).
- Hardened native UDP DNS response validation on Android/iOS (transaction ID, header flags, QDCOUNT, and question name/type/class matching).
- Added Android JVM test stub for `android.util.Log` to unblock unit tests.
- Added JVM tests for resolver dedup reuse, bounded thread pool, and Unicode flag handling.
- Added DNSService fallback and server health coverage in Jest tests.
- Added default-export handling for UDP/TCP socket module loading to reduce false negatives in dev clients.

## 4.0.1 - 2026-01-05

### Fixed

- **CRITICAL**: Fixed memory leak in static `activeQueries` map - queries now properly cleared on module invalidation
- **CRITICAL**: Fixed thread pool management - replaced unbounded `newCachedThreadPool()` with fixed-size pool based on CPU cores
- **CRITICAL**: Fixed query deduplication race condition using atomic `ConcurrentHashMap.compute()` method
- Fixed `Pattern.UNICODE_CHARACTER_CLASS` usage for proper Unicode text support in international character sanitization
- Added domain validation in `queryTXT()` to reject null or empty domain parameters
- Removed unused `DNS_SERVER` constant that was causing confusion with actual default server configuration
- Added domain normalization (trim + lowercase) for consistent deduplication keys

### Changed

- Improved `cleanup()` method to cancel all pending futures before clearing the activeQueries map
- Refactored query deduplication logic into separate `executeQueryChain()` method for better code organization
- Updated thread pool to use bounded queue (50 capacity) with CallerRunsPolicy for backpressure
- Enhanced comments and documentation throughout DNSResolver.java for maintainability

### Technical Details

- **Memory Leak Fix**: Static `activeQueries` map now cleared in `cleanup()` with proper cancellation of pending futures
- **Thread Pool**: Fixed size equals CPU cores (min 2) with bounded queue preventing unbounded thread creation
- **Deduplication**: Atomic `compute()` prevents race conditions where multiple threads create duplicate queries
- **Unicode Support**: `UNICODE_CHARACTER_CLASS` flag properly used for Unicode-aware regex patterns
- **Domain Validation**: Rejects null/empty domains and normalizes to lowercase for consistent cache keys

### Sources

- [Stack Overflow - UNICODE_CHARACTER_CLASS behavior](https://stackoverflow.com/questions/72236081/different-java-regex-matching-behavior-when-using-unicode-character-class-flag)
- [Android DNS Resolver AOSP Docs](https://source.android.com/docs/core/ota/modular-system/dns-resolver)
- [React Native Native Modules Lifecycle](https://reactnative.dev/docs/0.80/the-new-architecture/native-modules-lifecycle)
- [Medium - Memory Leaks in React Native](https://medium.com/@umairzafar0010/debugging-and-resolving-react-native-app-memory-leaks-the-ultimate-challenge-690f9f49a39c)
- [Software Mansion - Hunting JS Memory Leaks](https://blog.swmansion.com/hunting-js-memory-leaks-in-react-native-apps-bd73807d0fde)

## 4.0.0 - 2026-01-05

### Changed

- Bumped app version metadata to 4.0.0 (build 30) across iOS and Android configs.
- Updated release and store documentation for the 4.0.0 major release.

## [3.x] - Historical

Versions 3.2.0 through 3.8.9 established the core feature set:

- **3.8.x**: Screen entrance animations, skeleton loading, empty states, Expo Router migration, encrypted local storage (AES-GCM), DNS log redaction, React Compiler activation, local DNS responder for smoke tests, privacy policy
- **3.7.0**: Android platform parity (tab bar icons, typography, glass fallback colors)
- **3.6.0**: Google Play Store launch guide and release documentation
- **3.5.0**: DNS response ID validation (RFC 5452), memory leak fixes, React Compiler, storage corruption detection, capabilities TTL cache
- **3.4.0**: Cryptographic DNS IDs, TCP buffer limits, storage corruption detection, socket cleanup guarantees, async error handling fixes
- **3.3.0**: Android CI, release signing policy, Java 17 auto-detection
- **3.2.x**: Public repo hardening (secrets scanning, policy tests, version sync gates), DNS server allowlist

[Unreleased]: https://github.com/mneves75/dnschat/compare/v4.0.6...HEAD
[4.0.6]: https://github.com/mneves75/dnschat/compare/v4.0.5...v4.0.6
[4.0.5]: https://github.com/mneves75/dnschat/compare/v4.0.2...v4.0.5
[4.0.2]: https://github.com/mneves75/dnschat/compare/v4.0.0...v4.0.2
[3.x]: https://github.com/mneves75/dnschat/compare/v3.2.0...v4.0.0
