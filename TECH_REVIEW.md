# Technical Review – DNSChat (2025-10-03)

## Architecture map

- **App shell**: `index.tsx` renders `src/App.tsx`, which composes `SettingsProvider`, `OnboardingProvider`, `ChatProvider`, `ErrorBoundary`, and navigation.
- **Navigation**: `src/navigation/index.tsx` defines a native stack topped by a bottom-tab navigator (`GlassChatList`, `Logs`, `About`, optional `DevLogs`). Tabs use React Navigation v7 + `react-native-bottom-tabs`.
- **State**: Contexts in `src/context/` manage chat lifecycle (`ChatContext`), preferences and DNS transports (`SettingsContext`), onboarding progression (`OnboardingContext`), and accessibility (`AccessibilityContext`). AsyncStorage + custom storage service handle persistence.
- **Services**: `src/services/dnsService.ts` sanitises messages, orchestrates native → UDP → TCP → DoH fallback, and records telemetry via `DNSLogService`. Additional services encapsulate encryption, clipboard, and storage concerns.
- **UI**: Chat experience comprises `MessageList` (FlatList with layout hints), `MessageBubble`, `ChatInput`, and Liquid Glass wrappers. Onboarding uses animated screens with React Reanimated 4.1.1.
- **Native modules**: `modules/dns-native` (Swift/Java) exposes `RNDNSModule`; `ios/LiquidGlassNative` bridges SwiftUI `.glassEffect()` for iOS 17+. Both rely on TurboModules/Fabric when enabled.

## Dependency inventory

| Package | Version | Status | Notes |
| --- | --- | --- | --- |
| `expo` | 54.0.12 | ✅ Current | Latest stable SDK 54 release (June 2025). [1]
| `react-native` | 0.81.4 | ✅ Current | Stable RN 0.81 line (Aug 2025). [2]
| `react` / `react-dom` | 19.1.0 | ✅ | Matches RN 0.81 requirement with React Compiler enabled.
| `@react-navigation/*` | ^7.0–7.1 | ✅ | Aligns with Navigation v7 docs; includes native-stack, elements, bottom-tabs.
| `react-native-reanimated` | ~4.1.1 | ⚠️ | Requires Fabric on both platforms; Android OK, iOS Podfile still disables new arch.
| `react-native-screens` | ~4.16.0 | ✅ | Recommended for SDK 54; compatible with Fabric.
| `react-native-worklets` | 0.5.1 | ✅ | Shared runtime for Reanimated 4.
| `expo-dev-client` | ~6.0.13 | ✅ | Bundled with SDK 54.0.12. [1]
| `@sentry/react-native` | ~7.1.0 | ✅ | Error/crash reporting integration active.
| `@react-native-async-storage/async-storage` | 2.2.0 | ✅ | Latest stable release.
| Tooling (`jest`, `ts-jest`, `typescript`) | 29.x / 5.9.2 | ✅ | TS 5.9 supports React 19 features.

_Module: `modules/dns-native`_
- Peer `react-native` >=0.70. Dev dependencies mirror root (Jest 29, TS 5.9). Ensures compatibility with TurboModule autolinking.

## Build & release pipeline

- **Configuration**:
  - `app.config.ts` enables Fabric/TurboModules, sets iOS deployment target 16, Android `compileSdk/targetSdk` 35, build tools 35.0.0, Kotlin 1.9.24, edge-to-edge plugin, Sentry hook.
  - `eas.json` defines `development` (Debug, simulator), `preview` (Release internal), `production` (store) profiles plus `submit` credentials.
- **iOS**:
  - Podfile autolinks Expo modules, injects custom pods (`LiquidGlassNative`, SDWebImage) and sets `ENV['RCT_NEW_ARCH_ENABLED'] = '0'`, effectively disabling Fabric despite Expo config.
  - Release builds enable dSYM export and Hermes symbol upload via `expo-build-properties` + EAS profile.
- **Android**:
  - `android/app/build.gradle` pulls `compileSdk`/`targetSdk` from root ext (set to 35 by Expo plugin) and enables Hermes, edge-to-edge, TurboModules (`newArchEnabled=true`).
  - Custom script `android-java17.sh` ensures Java 17 environment for local Gradle builds.
- **Versioning**: `scripts/sync-versions.js` reads `CHANGELOG.md` and updates `package.json`, `app.json`, Gradle `versionCode`, and iOS plist/build settings.

## Quality, performance & observability

- **DNS transport**: `DNSService` sanitises inputs, rate-limits (10 req/min window), and records per-transport telemetry. Native module handles multipart TXT parsing + error taxonomy.
- **UI performance**: `MessageList` uses `getItemLayout`, tuned batching, and auto-scroll on insert. Onboarding uses Reanimated 4; ensure Fabric parity on iOS before enabling new arch. Liquid Glass capabilities currently cached with optimistic defaults—verify detection covers reduced transparency / non-iOS platforms.
- **Networking resilience**: Fallback order Native → UDP → TCP → HTTPS is well documented; ensure DoH fallback remains responsive under high latency.
- **Security**: DNS sanitisation denies control chars and invalid hostnames. Storage encrypts history via AES-256 (verify key rotation in future). No secrets committed.
- **Observability**: `@sentry/react-native` v7.1 monitors crashes/perf; `DNSLogService` persists logs via AsyncStorage. Consider centralising log export for customer support.
- **Testing**: Jest coverage for contexts/services; native module includes unit + device integration tests (manual). No automated e2e—modernization plan should introduce Detox/Maestro.

## Developer experience

- TypeScript strict mode with shared domain types (`src/types`).
- Scripts: Prettier not enforced automatically—add lint/format to CI backlog. Module package uses ESLint config; root lacks lint script.
- Documentation refreshed (`CLAUDE.md`, `AGENTS.md`). Additional platform deep dives in `docs/apple/` (SwiftUI/Liquid Glass) and modernization roadmap.
- CI: No GitHub Actions; rely on manual/EAS flows. Add pipeline for `npm test`, type-check, lint before production rollout.

## Compatibility notes & follow-ups

1. **Fabric alignment** – Resolve iOS Podfile override so Fabric/TurboModules match Expo config when modernization plan schedules switch.
2. **Performance budgets** – Establish TTI and FPS targets post-Fabric; current guide highlights 60fps goal but lacks measurement.
3. **E2E automation** – Add Detox or Maestro flows covering onboarding → chat send → settings transport test.
4. **Android signing** – Release build currently uses debug keystore; ensure production keystore configured before store submission.
5. **Safe area usage** – Continue mandating `react-native-safe-area-context`; audit legacy components before modernization (none found yet).

## OPEN_QUESTIONS

| Topic | Question | Proposed next step |
| --- | --- | --- |
| Fabric on iOS | When should we re-enable `RCT_NEW_ARCH_ENABLED` in Podfile? | Run stabilization sprint with native module regression tests; track in modernization Phase 3. |
| Crash analytics scope | Are Sentry release/environment tags wired through EAS build automation? | Confirm `SENTRY_*` secrets available in CI; add checklist to release template. |
| DNS server allowlist | Should we expose configurable allowlist beyond `ch.at` + manual entries? | Review product requirements; add to modernization backlog if needed. |
| Bundle size | No current automated measurement. | Integrate `expo export --dump-sourcemap` / `react-native-bundle-visualizer` in CI once budgets defined. |

References: [1] https://expo.dev/changelog/sdk-54 • [2] https://reactnative.dev/blog/2025/08/12/react-native-0.81
