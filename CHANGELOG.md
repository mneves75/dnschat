# Changelog

All notable changes to DNSChat will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## Unreleased

### Fixed

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
- Added iOS native DNS module cleanup on invalidation to cancel pending tasks.
- Aligned iOS Unicode normalization with JS/Android (NFKD compatibility decomposition).
- Hardened native UDP DNS response validation on Android/iOS (transaction ID, header flags, QDCOUNT, and question name/type/class matching).

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

## 3.8.9 - 2026-01-05

### Added

- Added `useScreenEntrance` hook for screen entrance animations (fade + translateY).
- Added `useStaggeredList` hook for staggered list item animations.
- Added `EmptyState` component with SVG icons for chat, logs, search, and error states.
- Added skeleton loading components: `ChatListSkeleton`, `SettingsSkeleton`, `LogsSkeleton`.
- Added `testID` prop support to `Form.Item` component for testing.
- Implemented Profile screen with user statistics and data management actions.
- Implemented Home screen with quick actions and recent chats preview.
- Added exec plan for native DNS port parity and Reanimated render-safety (`docs/plans/EXECPLAN-2026-01-05-NATIVE-DNS-PARITY-REANIMATED.md`).

### Changed

- Enhanced all screens with entrance animations following iOS 26 Liquid Glass guidelines.
- Enhanced GlassChatList with skeleton loading, empty state, and staggered item animations.
- Enhanced Logs screen with skeleton loading, empty state, and staggered animations.
- Enhanced GlassSettings with entrance animations and palette-based colors.
- Enhanced About screen with entrance animations.
- Enhanced Chat screen with subtle fade-in animation (keyboard-compatible).
- Redesigned NotFound screen with glass UI components.
- Fixed tab bar to use palette colors instead of hardcoded values.
- Replaced hardcoded colors across all screens with `useImessagePalette` tokens.
- Docs: refreshed the 2026-01-05 guidelines re-verification ExecPlan and documentation index.
- Bumped app version metadata to 3.8.9 (build 29) across iOS and Android configs.
- Updated native DNS module README to document the `port` parameter.
- Refreshed docs index to reference the current exec plan location.

### Fixed

- Fixed settings tests to work with GlassSettings after deleting duplicate Settings.tsx.
- Fixed `Form.Item` mock in tests to properly pass through `testID` and `onPress` props.
- Fixed native DNS bridge mismatch by adding the `port` parameter across iOS/Android bridges.
- Fixed Android native DNS transport to honor per-server ports for UDP and legacy resolver calls.
- Fixed Reanimated warnings by removing shared-value reads during render in `useScreenEntrance` and `Toast`.
- Added DNS port validation before socket usage to prevent invalid port errors.

### Removed

- Deleted duplicate `ChatList.tsx` screen (GlassChatList is the canonical implementation).
- Deleted duplicate `Settings.tsx` screen (GlassSettings is the canonical implementation).
- Removed outdated exec plan documents from `docs/` (now tracked in `docs/plans/`).

## 3.8.8 - 2026-01-05

### Changed

- Bumped app version metadata to 3.8.8 (build 28) across iOS and Android configs.
- Updated release metadata and store documentation for the 3.8.8 build.

### Fixed

- Fixed iOS bundling by restoring the `useStaggeredList` hook module to TSX so JSX parses correctly.

## 3.8.7 - 2026-01-05

### Added

- Added agent navigation documentation in `AGENTS.md`.

### Changed

- Updated release metadata and store documentation for the 3.8.7 build.
- Bumped app version metadata to 3.8.7 (build 27) across iOS and Android configs.

### Fixed

- Fixed Chat screen motion-reduction hook import path to restore a successful build.

## 3.8.6 - 2026-01-05

### Added

- Added a new guidelines re-verification and best-practices ExecPlan for the 2026-01-05 review cycle.

### Changed

- Refreshed release/store documentation and install notes to reflect the 3.8.6 build.
- Bumped app version metadata to 3.8.6 (build 26) across iOS and Android configs.

### Fixed

- Removed a stale navigation dependency in GlassChatList's new chat handler after the Expo Router migration.

## 3.8.5 - 2026-01-04

### Added

- Added a "Clear Local Data" action in Settings to delete chat history and DNS logs.
- Added a privacy policy document (`PRIVACY.md`).
- Added Expo Router file-based routing with tab, stack, modal, and deep-link parity.
- Added a router entry point (`entry.tsx`) and route param helpers with tests.

### Changed

- Migrated navigation from the legacy React Navigation scaffold to Expo Router.
- Removed `react-native-bottom-tabs` in favor of Expo Router tabs.
- Enabled typed routes in `app.json` and set web bundler to Metro.
- Updated translations to reference the new route entry location.
- Updated store/release documentation and operational guides to use Bun-first commands and current app identifiers.
- Refreshed Settings copy for data deletion messaging.
- Bumped app version metadata to 3.8.5 (build 25) across iOS and Android configs.

## 3.8.4 - 2026-01-04

### Changed

- Accessibility settings updates now skip redundant writes using explicit field equality checks.
- Added a guidelines re-verification ExecPlan and reconciled legacy exec plans to reflect completion status.
- Bumped app version metadata to 3.8.4 (build 24) across iOS and Android configs.

## 3.8.3 - 2026-01-04

### Changed

- dns-native tests now reuse the app-level Jest setup to avoid ESM module parsing failures.
- Added a module-local package-lock for dns-native to support deterministic npm ci in CI.
- Hardened storage recovery to back up and clear corrupted chats by default, with an opt-out for strict corruption detection.
- Added DNS log recovery to back up and clear corrupted log payloads on decrypt/parse failure.
- Updated SecureStore encryption key identifier and length validation to prevent invalid key persistence.
- Surfaced storage reset errors in chat list screens and handled auto-create chat failures safely.

## 3.8.2 - 2026-01-04

### Security

- Ensure DNS transaction IDs use secure RNG sources with a dev/test-only fallback.

### Changed

- Strip `console.*` calls in production builds (excluding `console.error` and `console.warn`) for performance.
- Replace deprecated `expo-random` usage with `expo-crypto` and add a crypto bootstrap to ensure secure RNG availability.
- DNS log cleanup scheduler is now idempotent to avoid multiple intervals.
- DNS protocol docs and TXT parsing comments aligned with runtime behavior.
- CI workflows now use Bun installs, pinned actions, concurrency limits, and publish SBOM artifacts.
- dns-native test config no longer depends on Expo tsconfig to keep module CI self-contained.

## 3.8.1 - 2026-01-04

### Added

- Local DNS responder mode for smoke tests and harness scripts (`--local-server`) to validate UDP/TCP paths without external network access.

### Changed

- Root app is wrapped in `React.StrictMode` to align with React Compiler healthcheck guidance.

### Fixed

- Jest open-handle warning resolved by tearing down DNSService background listener in tests.

## 3.8.0 - 2026-01-04

### Security

- **Encrypted Local Storage**: Chat and DNS log payloads are now encrypted at rest using AES-GCM with a device-stored key.
- **Log Redaction**: DNS query and response content is hashed before persistence to avoid storing raw free-form text.

### Added

- `babel-plugin-react-compiler` dependency to support React Compiler activation in Expo SDK 54.
- `babel.config.js` to wire React Compiler and React Native Reanimated plugins.
- `expo-secure-store` and `expo-random` for key storage and secure randomness.
- `@noble/ciphers` and `@noble/hashes` for AES-GCM encryption and SHA-256 hashing.

### Changed

- Expo SDK patched to `54.0.30`.
- Default package manager workflow updated to Bun (`bun install`, `bun run`).
- TypeScript strictness options expanded in `tsconfig.json`.
- DNS retry delay constant aligned across JS and native sources (200ms).
- Typography scale now exposes explicit cross-platform keys to satisfy strict typing and avoid undefined style access.
- Jest TypeScript configuration loosens `verbatimModuleSyntax` for CommonJS test runs.

### Fixed

- iOS signing team identifiers removed from `project.pbxproj` to satisfy public repo policy tests.
- Encrypted payload parsing now accepts the versioned `enc:v1:` prefix format.
- Jest runs now mock noble ESM cryptography modules to avoid ESM loader failures.

## 3.7.0 - 2025-12-16

### Fixed

- **Android Tab Bar Icons**: Fixed 2 of 3 tab bar icons not showing on Android
  - SF Symbols only work on iOS; added platform-specific PNG images for Android
  - Added `logs-icon.png` and `info-icon.png` assets for Android

- **Android Typography Crash**: Fixed "Cannot read property 'lineHeight' of undefined" error when opening Chat screen
  - Root cause: `Material3Type` lacked iOS-compatible `body` key
  - Added iOS-compatible aliases (`body`, `headline`, `callout`, `subheadline`, `footnote`, `caption1`, `caption2`) to `Material3Type` for cross-platform compatibility

- **Android Gray Rectangle Issue**: Fixed gray rectangles appearing in chat list on Android
  - Root cause: Semi-transparent `rgba` colors appear as gray boxes without glass blur effects
  - Updated `LiquidGlassWrapper` fallback to use solid colors on Android (#FFFFFF, #E3F0FF)
  - Added proper `elevation` property for Android shadows instead of iOS shadow properties
  - Changed `GlassChatItem` to use `palette.solid` instead of `palette.surface` on Android

## 3.6.0 - 2025-12-16

### Added

- **Google Play Store Launch Guide**: Comprehensive documentation for publishing to Google Play Store (`docs/ANDROID_GOOGLE_PLAY_STORE.md`):
  - Google Play Console setup and app creation workflow
  - Store listing configuration with full description template
  - Screenshot specifications and capture instructions
  - Content rating questionnaire guidance (IARC)
  - Data safety section documentation
  - Release management workflow (internal → closed → production)
  - Pre-submission review checklist

### Changed

- Updated `ANDROID_RELEASE.md` to reference new Play Store guide

## 3.5.0 - 2025-12-16

### Security

- **DNS Response ID Validation (RFC 5452)**: Validate that DNS response transaction IDs match the request ID to prevent cache poisoning and response spoofing attacks
- **Storage Queue Sync Fix**: Refactored Promise chain in `queueOperation` to use `.then()` pattern instead of async/await to prevent exceptions from being swallowed silently
- **Storage Data Validation**: Added comprehensive validation of chat data structure loaded from AsyncStorage to detect and reject corrupted data early

### Performance

- **Memory Leak Fix**: Added periodic cleanup interval and maximum size limit for `requestHistory` array to prevent unbounded memory growth during long sessions
- **Capabilities Cache Race Condition**: Implemented promise lock pattern in `NativeDNS.isAvailable()` to prevent duplicate concurrent requests to native module
- **Accessibility Event Listeners**: Replaced polling interval with `AccessibilityInfo.addEventListener` for more efficient screen reader detection

### Added

- React Compiler enabled via `experiments.reactCompiler: true` in app.json
- `EXECPLAN-V3.5.0-SECURITY-PERFORMANCE.md` release documentation

### Changed

- `DNSService.cleanupRequestHistory()` now runs automatically every 60 seconds
- Maximum request history size capped at 100 entries

### Fixed

- 21 TypeScript errors across multiple files:
  - `ChatInput.tsx`: Null check and testID prop typing
  - `GlassTabBar.tsx`: StyleProp import for proper style typing
  - `GlassChatList.tsx`: Palette property names (`highlight`, `userBubble`)
  - `Logs.tsx`: useEffect cleanup return type (void wrapper)
  - `screenshotMode.ts`: Mock data matches Chat type (`role`, `status`, `updatedAt`)
  - `i18n/index.tsx`: Type assertion via `unknown` for translation dictionaries
  - `navigation/index.tsx`: Local TabRoute interface definition
  - `About.tsx`: Null children for empty Form.Section
  - `threadScreen.errors.spec.ts`: Correct import path for dns-native module

### Removed

- Deleted dead code `RouterProvider.tsx` (expo-router remnant)

## 3.4.0 - 2025-12-16

### Security

- **DNS ID Generation (RFC 5452)**: Replaced `Math.random()` with cryptographically secure `crypto.getRandomValues()` to prevent DNS cache poisoning attacks via predictable transaction IDs
- **TCP Buffer Size Limit**: Added 65535-byte maximum response size to prevent memory exhaustion denial-of-service attacks via malicious DNS responses
- **Storage Corruption Detection**: Distinguish between "no data" (empty array) and "corrupted data" (throw `StorageCorruptionError`) to prevent silent data loss
- **AppState Listener Singleton**: Prevent memory leaks from multiple listener registrations when `DNSService.initialize()` is called repeatedly
- **ChatContext Race Condition**: Capture both `chatIdAtSend` and `assistantMessageId` at creation time to prevent stale closure bugs where error handler would update wrong chat or search through stale `chats` array
- **Socket Cleanup Guarantees**: Added `settled` flag pattern and try-finally blocks to ensure sockets are always cleaned up, preventing resource leaks
- **Async Error Handling**: Fixed fire-and-forget async in `OnboardingContext` (`nextStep`/`previousStep`) to properly await and log storage errors
- **Capabilities TTL**: Added 30-second TTL cache for native DNS capabilities to detect network configuration changes (WiFi/cellular/VPN)

### Added

- `generateSecureDNSId()` function for cryptographically random DNS transaction IDs
- `StorageCorruptionError` class for distinguishing storage corruption from empty data
- `DNSService.initialize()` public method for explicit AppState listener setup
- `NativeDNS.invalidateCapabilities()` method for forcing capabilities refresh
- Comprehensive test suites:
  - `chatContext.raceCondition.spec.ts` - ChatContext stale closure prevention tests (11 tests)
  - `dnsService.appState.spec.ts` - AppState listener singleton tests (6 tests)
  - `storageService.corruption.spec.ts` - Storage corruption detection tests (13 tests)
  - `nativeDNS.capabilitiesTTL.test.ts` - Capabilities TTL tests (7 tests)

### Changed

- `OnboardingContext.nextStep()` and `previousStep()` are now async functions that properly await storage operations
- Socket cleanup in DNS UDP/TCP transports uses `settled` flag pattern to prevent double cleanup

## 3.3.0 - 2025-12-16

### Added
- Android Gradle build job in CI to prevent configuration regressions
- Policy tests for Android release signing (`android.releaseSigningPolicy.spec.ts`)
- Policy tests for Android setup verification (`verifyAndroidSetup.spec.ts`)
- Policy tests for Java 17 detection (`runAndroidJavaHome.spec.ts`)
- `npm run android` script with portable Java 17 auto-detection
- `npm run verify:android` for local environment diagnostics
- `docs/ANDROID_RELEASE.md` with release signing and checklist documentation

### Changed
- Android release builds are never debug-signed; signing requires explicit credentials
- `keystore.properties` lookup supports both `android/` and repo root locations
- Java 17 detection prefers valid `JAVA_HOME`, then macOS `java_home -v 17`, then Homebrew paths
- Android SDK resolution prioritizes `local.properties`, then env vars, then default location

### Fixed
- Release signing policy prevents accidental debug-signed APKs reaching Play Store
- SDK path warnings when `android/local.properties` points to missing directory

## 3.2.1 - 2025-12-16

### Changed
- Updated Expo SDK 54 compatible native module versions via `expo install --fix`:
  - `expo-build-properties` `~1.0.10`
  - `expo-dev-client` `~6.0.20`
  - `expo-glass-effect` `~0.1.8`
  - `expo-haptics` `~15.0.8`
  - `expo-linking` `~8.0.10`
  - `expo-localization` `~17.0.8`
  - `expo-splash-screen` `~31.0.12`
  - `expo-system-ui` `~6.0.9`

### Fixed
- Keep `ios/DNSChat.xcodeproj/project.pbxproj` portable by ensuring `DEVELOPMENT_TEAM` stays empty (developers should configure signing locally, not in the repo).

## 3.2.0 - 2025-12-15

### Added
- Public repo hardening gates (CI + policy tests) to enforce release invariants:
  - Secrets scanning via gitleaks
  - No emoji in tracked files
  - No private URLs/internal endpoints in tracked files
  - Deterministic iOS pods lockfile behavior
  - Deterministic version syncing across iOS/Android/Expo config

### Changed
- DNS server configuration is now strict allowlist-only with canonical normalization and port rejection, and invalid persisted values are coerced back to the safe default during migration.
- Logging is gated behind a dev-only helper to keep production runtime output quiet and predictable.
