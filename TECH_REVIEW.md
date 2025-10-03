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
| `expo` | `54.0.12` | ✅ Stable | Upgraded from preview to stable SDK 54.0.12 (shipped June 11 2025). [1]
| `react-native` | `0.81.4` | ✅ Current | Latest stable 0.81.4 released Aug 2025 (active). [2]
| `react` / `react-dom` | `19.1.0` | ✅ Current | Matches RN 0.81 requirements; React Compiler enabled.
| `@react-navigation/*` | `^7.x` | ✅ | Aligns with React Navigation 7 stable.
| `react-native-reanimated` | `4.1.1` | ✅ Current | Upgraded to 4.1.1 with Fabric support; requires New Architecture (enabled on Android, iOS pending Podfile fix).
| `react-native-screens` | `4.16.0` | ✅ Current | Updated to 4.16.0 for Expo SDK 54 compatibility.
| `react-native-worklets` | `0.5.1` | ✅ | Required for Reanimated 4.x; shared worklet runtime.
| `expo-dev-client` | `~6.0.13` | ✅ | Compatible with SDK 54.0.12.
| `@react-native-async-storage/async-storage` | `2.2.0` | ✅ | Latest stable.
| `@sentry/react-native` | `~7.1.0` | ✅ | Error reporting integration active.
| Dev tooling (`jest`, `ts-jest`, `typescript`) | ~29 / 5.9.2 | ✅ | TypeScript 5.9.2 recommended for React 19 compatibility.

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
1. ✅ **SDK Preview** – ~~upgrade to Expo SDK 54 stable~~ DONE: Now on SDK 54.0.12 stable. [1]
2. **New Architecture toggle drift** – align `app.json`, Podfile, and Gradle flags (enable or roll back) and test bridging modules accordingly. iOS Podfile currently disables Fabric despite `app.json` enabling it.
3. ✅ **LiquidGlass availability** – ~~update native wrapper to target official iOS 17+ API~~ DOCUMENTED: Confirmed iOS 17+ requirement in CLAUDE.md; legacy "iOS 26" references removed. [4]
4. ✅ **Target API 35** – ~~schedule Gradle bump~~ DONE: Android targets API 35 for Google Play compliance (Aug 2025 deadline). [3]
5. ✅ **Observability** – ~~no crash/error reporting~~ DONE: Sentry integration active (`@sentry/react-native` ~7.1.0).
6. ✅ **Version mismatch** – ~~package/app version drift~~ RESOLVED: All configs now at 2.0.1 (use `npm run sync-versions` before releases).
7. **Reanimated 4 + Fabric**: Test animations thoroughly when iOS Podfile enables Fabric. Reanimated 4.1.1 requires New Architecture for full feature set.

[1]: https://expo.dev/changelog/sdk-54
[2]: https://reactnative.dev/versions
[3]: https://support.google.com/googleplay/android-developer/answer/11926878
[4]: https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
