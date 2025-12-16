# Changelog

All notable changes to DNSChat will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## Unreleased

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
