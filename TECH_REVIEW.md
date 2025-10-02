# Technical Review – DNSChat (2025-10-02)

## Architecture Snapshot
- **Entry point**: `index.tsx` renders `src/App.tsx`, which wires providers (`SettingsProvider`, `OnboardingProvider`, `ChatProvider`) and navigation.
- **Navigation**: `src/navigation/index.tsx` composes a native stack with tab scenes (`GlassChatList`, `Logs`, `About`, optional `DevLogs`). Tabs rely on `react-native-bottom-tabs` with React Navigation theming.
- **State & data**:
  - `ChatContext` orchestrates chat lifecycle, storage persistence, and DNS dispatch (`src/context/ChatContext.tsx`).
  - `SettingsContext` persists preferences (`AsyncStorage`) and surfaces DNS transport controls, locale, accessibility (`src/context/SettingsContext.tsx`).
  - `OnboardingContext` gates the first-run flow; `AccessibilityContext` centralises haptics/text scaling.
- **Services**:
  - `src/services/dnsService.ts` handles DNS query pipeline (native → UDP → TCP → DoH), message sanitisation, and rate limiting.
  - `DNSLogService` (`src/services/dnsLogService.ts`) captures per-transport telemetry with AsyncStorage-backed retention.
  - `storageService` manages encrypted chat persistence (interfaces with AsyncStorage & crypto utilities).
- **UI**:
  - Message rendering via `MessageList`/`MessageBubble` (FlatList with memoised cells) and `ChatInput`.
  - Liquid glass wrapper (`src/components/LiquidGlassWrapper.tsx`) bridges to `LiquidGlassNative` on iOS; CSS fallback elsewhere.
  - Settings surface uses custom glass components (`src/components/glass/*`).
- **Native modules**:
  - `modules/dns-native` exposes `RNDNSModule` (Swift `DNSResolver.swift`, Java `DNSResolver.java`) with unit/integration tests.
  - `ios/LiquidGlassNative` implements SwiftUI glass view bridging via `LiquidGlassViewManager.swift`.
  - Android/iOS projects enable Hermes and new architecture toggles, though iOS Podfile currently disables them.

## Dependency Inventory (Top-Level)
| Package | Current | Status | Notes |
| --- | --- | --- | --- |
| `expo` | `54.0.0-preview.12` | Preview | Stable SDK 54.0.0 shipped June 11 2025 – upgrade off preview. [1]
| `react-native` | `0.81.1` | ✅ Current | 0.81 released Aug 12 2025 (active). [2]
| `react` / `react-dom` | `19.1.0` | ✅ Current | Matches RN 0.81 requirements.
| `@react-navigation/*` | `^7.x` | ✅ | Aligns with React Navigation 7 stable.
| `react-native-reanimated` | `~3.17.4` | ⚠️ Behind | 4.x introduces fabric compatibility; assess post Expo upgrade (official docs pending).
| `react-native-screens` | `~4.11.1` | ⚠️ Behind | Latest 4.16 aligns with Expo SDK 54 release channel.
| `expo-dev-client` | `~5.2.4` | ✅ | Compatible with SDK 54.
| `@react-native-async-storage/async-storage` | `2.1.2` | ✅ | Latest minor.
| Dev tooling (`jest`, `ts-jest`, `typescript`) | ~29 / 5.8 | ✅ | Matches setup; ensure TypeScript 5.8 stays compatible with React 19.

_Module package (`modules/dns-native`)_
- Peer `react-native` >=0.70, dev deps on Jest 29, TypeScript 5.x, ESLint 8. Needs periodic lint rule refresh.

## Build & Release Pipeline
- **Expo/EAS**: `eas.json` defines `development`, `preview`, `production` build profiles plus iOS submit profile pre-filled with Apple ID/team.
- **iOS**:
  - `app.json` sets deployment target 16.0, `newArchEnabled: true`, `expo-build-properties` enabling DSYM & sourcemaps.
  - Podfile includes custom pods (`DNSNative`, `LiquidGlassNative`, `SDWebImage*`) and disables new arch via env override.
  - `ios/DNSChat` project contains additional Swift files for Liquid Glass bridging.
- **Android**:
  - `android/app/build.gradle` sets `compileSdk`/`targetSdk` via root `ext`; currently matches Expo defaults (likely 34). Will require bump to API 35 before Aug 2025 target deadline. [3]
  - Hermes enabled, Proguard optional, new architecture toggle active in `gradle.properties`.
  - Custom script `android-java17.sh` forces Java 17 path for CLI builds.
- **Versioning**: `scripts/sync-versions.js` reads `CHANGELOG.md`, writes package/app/ios/android versions, increments build numbers.

## Quality & Performance
- **Networking**: DNS pipeline logs attempts/fallbacks, sanitises user input aggressively, and enforces rate limits (`DNS_CONSTANTS`).
- **UI performance**:
  - `MessageList` uses FlatList with `getItemLayout`, batching tweaks, and auto-scroll; consider Debouncing `setTimeout` for large datasets.
  - Liquid glass wrapper precomputes platform capability but assumes iOS 26+—needs adjustment to actual iOS 17 availability.
- **Error handling**: Contexts capture errors and expose `clearError`. `ErrorBoundary` wraps app root.
- **Testing**:
  - Root Jest config runs app tests plus module tests (ts-jest). Mocks for RN UDP/TCP packages included.
  - `modules/dns-native/__tests__` covers DNS parsing, integration (flag). Integration tests expect device/simulator.
  - No e2e harness checked in (Detox/Maestro absent); plan recommends introduction.
- **Security**: AES-256-GCM constants centralised; DNS sanitisation whitelists servers (`modules/dns-native/constants.ts`). Verify encryption routines remain in sync across platforms.

## Developer Experience
- **TypeScript**: Strict mode via `tsconfig.json` (extends Expo base). `types/` defines domain models.
- **Tooling**: Scripts for changelog, version sync, DNS harness. No root lint/format script—Prettier implied but not automated.
- **Directory structure**: Clear separation between `src`, `modules`, `docs`. `project-rules/` hosts agent SOPs.
- **Docs**: Legacy files referenced iOS 26/new architecture incorrectly; updated canonical docs now reside in `CLAUDE.md` plus modernization plan.
- **CI/CD**: No GitHub Actions present; rely on EAS cloud builds. Consider adding lint/test workflow when plan approved.

## Hotspots & Follow-Ups
1. **SDK Preview** – upgrade to Expo SDK 54 stable to exit preview channel and unlock OTA stability. [1]
2. **New Architecture toggle drift** – align `app.json`, Podfile, and Gradle flags (enable or roll back) and test bridging modules accordingly.
3. **LiquidGlass availability** – update native wrapper to target official iOS 17+ API, remove artificial `iOS 26` gate. [4]
4. **Target API 35** – schedule Gradle `compileSdk`/`targetSdk` bump + compatibility audit before Google deadline. [3]
5. **Observability** – no crash/error reporting integration yet (Sentry/Firebase). Add instrumentation in plan.
6. **Version mismatch** – package/app at 2.0.0 vs changelog 2.0.1. Use sync script prior to release.

[1]: https://expo.dev/changelog/sdk-54
[2]: https://reactnative.dev/versions
[3]: https://support.google.com/googleplay/android-developer/answer/11926878
[4]: https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
