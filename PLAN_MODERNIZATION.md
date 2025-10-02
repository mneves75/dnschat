# DNSChat Modernization Plan (Draft for Approval)
**Date:** 2025-10-02  
**Scope:** Documentation & planning only — no code changes executed yet.  
**Baseline Branch:** `docs/expo-rn-modernization`

# create PR -> expo-rn-modernization

## 1. Objectives (Measurable)
1. Replace preview Expo SDK with latest stable release while keeping feature parity (all smoke tests green, EAS builds succeed on iOS/Android). [1]
2. Align React Native toolchain with 0.81 active release while validating TurboModule readiness. [2]
3. Deliver a compliant release pipeline: target API 35 (Android) and latest Xcode 26 toolchain (iOS) with documented rollback. [3][4]
4. Reduce time-to-interactive (TTI) < 3.5s on mid-tier hardware (iPhone 14, Pixel 7) by optimizing navigation boot and DNS initialization.
5. Establish observability baseline (crash/error reporting, performance telemetry) and accessibility/i18n audit checklist.

## 2. Current State → Target (Gap Analysis)
| Area | Current | Target | Gap |
| --- | --- | --- | --- |
| Expo SDK | 54.0.0-preview.12 | 54.0.0 stable | Switch channels, run config migrations. [1]
| React Native | 0.81.1 (active) | 0.81.1 stable (confirm) | Validate preview flags/off-cycle patches. [2]
| Toolchain | Node ≥18, Java 17, Xcode 16 | Lock versions in docs & CI | Codify via `.nvmrc`, `@expo/cli` pin, CI matrix.
| New Architecture | Enabled in config, disabled in Podfile | Decide enablement; ensure native modules compatible. [5]
| Android Target API | 34 (Expo default) | 35 (deadline Aug 31 2025) | Update Gradle ext, dependencies. [3]
| Liquid Glass | Hard-coded iOS 26+ | Official iOS 17+ support | Update capability detection & docs. [4]
| Observability | Manual logs only | Crash + performance analytics | Introduce Sentry/Firebase + DNS telemetry dashboards.
| Testing | Unit (Jest), no e2e | Add Detox/Maestro, automated DNS smoke | Expand coverage & CI integration.

## 3. Phased Approach
| Phase | Goal | Est. Duration | Cost of Change | Key Tasks |
| --- | --- | --- | --- | --- |
| **0. Safeguards & Audit** | Baseline health, backups, version sync | 3 days | Low | Tag `v2.0.0-pre-modernization`, archive EAS artifacts, run `npm run sync-versions`, capture dependency report. |
| **1. Toolchain Hardening** | Lock Node/Expo CLI/Java/Xcode versions | 4 days | Medium | Introduce `.nvmrc`, document Java 17 install, add `eas-cli` pin, update onboarding docs. Validate on clean checkout. |
| **2. Expo/RN Upgrade** | Move to Expo SDK 54 stable, verify RN 0.81 config | 7 days | High | Run `npx expo upgrade`, resolve config diffs, update `app.json`, patch native modules, run smoke tests + EAS preview build. |
| **3. Modern APIs** | Align New Architecture/Turbo Modules & Liquid Glass | 6 days | High | Decide NA enablement, update Podfile flags, adjust `LiquidGlassWrapper` to iOS 17 gating, revalidate native DNS module bridging. [4][5] |
| **4. Performance** | Improve startup & list perf | 5 days | Medium | Profile with React DevTools & Flipper, implement lazy context init, memoize heavy renders, evaluate FlashList adoption. |
| **5. Access/I18n/Analytics** | Ship accessibility, localization, analytics | 6 days | Medium | Run WCAG audit, ensure i18n strings, add crash reporting and analytics events, document privacy manifests. |
| **6. Release Hardening** | Final QA, canary, rollback drills | 4 days | Medium | Configure staged EAS channels, run Detox/Maestro suites, capture release notes, execute rollback simulation.

_Total estimated effort: 31 person-days (single engineer), adjust for parallelism._

## 4. Acceptance Criteria per Phase
- **Phase 0**: Git tag exists; `npm run sync-versions:dry` shows no diffs; document audit stored in `/archive/2025-10-02-audit`.
- **Phase 1**: CI/dev instructions list fixed tool versions; `npx expo-doctor` passes on clean environment; `node -v` check enforced via `.nvmrc`.
- **Phase 2**: `expo upgrade` applied; `npm test`, `node test-dns-simple.js`, `eas build --profile preview` succeed (both platforms).
- **Phase 3**: New Architecture decision documented; native modules compiled without warnings; Liquid Glass wrapper honors iOS 17 detection and fallback; bridging tests pass.
- **Phase 4**: Launch profiler demonstrates TTI ≤3.5s, bundle size metrics tracked; no regression in DNS throughput.
- **Phase 5**: Accessibility audit checklist complete, locales verified (EN/PT/ES), analytics events visible in dashboard, privacy manifests validated.
- **Phase 6**: Canary release published to secondary EAS channel, rollback script tested, release checklist signed off.

## 5. Risks & Mitigations
| ID | Risk | Prob. | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| R1 | Expo upgrade breaks native DNS module | Med | High | Run module tests (`modules/dns-native && npm test`), adjust codegen if needed, coordinate with New Arch phase. |
| R2 | Target API 35 introduces Android build regressions | Med | High | Use canary builds, enable Play Console pre-release, monitor crashlytics before wide rollout. |
| R3 | Liquid Glass wrapper mis-detects devices | High | Medium | Replace manual version parsing with `ProcessInfo` APIs (iOS) and add instrumentation fallback tests. |
| R4 | Lack of automated testing extends release time | Med | Medium | Prioritize Detox/Maestro setup in Phase 5, enforce in CI. |
| R5 | Toolchain drift across contributors | High | Medium | Enforce `.tool-versions` / `.nvmrc`, add CI job verifying versions. |
| R6 | Privacy manifest changes (Jan 2026) missed | Low | High | Track Apple deadlines in documentation, add privacy manifest tasks to release checklist. [2]

## 6. Rollback Plan
1. **Git**: Tag each phase completion (`modernization-phaseX-done`). Use `git revert` or `git switch <tag>` for emergency rollback.
2. **EAS Channels**: Maintain `production`, `preview`, `canary`. Deploy upgrades to `canary` first; use `eas update --channel production --rollout 0` to halt if issues arise.
3. **Native builds**: Keep previous IPA/AAB artifacts in `_APP_STORE/` and Play Console internal track for redeploy.
4. **Feature flags**: Introduce toggles for experimental transports and UI features during modernization.

## 7. Test Strategy
- **Unit**: Jest for services (`dnsService`, `storageService`), modules (`modules/dns-native`). Keep coverage ≥80% for critical paths.
- **Component**: React Testing Library for views (ChatInput, MessageList) focusing on accessibility props.
- **Integration**: DNS harness (`npm run dns:harness`), new TurboModule tests when enabling new arch.
- **E2E**: Adopt Detox (Android/iOS) or Maestro for chat flows (onboarding, send message, fallback). Automate in CI.
- **Performance**: Use `expo-profile` / `hermes-profile` for startup times; track bundle sizes via `expo export --dump-sourcemap`.

## 8. Compliance Checklist (Apple & Google)
- ✅ App transport security exceptions documented (if any).
- ✅ NS*UsageDescription strings present for networking if needed.
- 🔲 Privacy manifest updates required before Jan 31 2026 (apps with certain APIs). [2]
- 🔲 Ensure ATT flow (if analytics/crash reporting uses tracking).
- 🔲 Google Play Data Safety form updated after analytics integration.
- 🔲 Target/compile SDK set to 35; hardware back button behavior verified. [3]

## 9. Observability & Telemetry
- Adopt Sentry or Firebase Crashlytics; capture release versions from EAS metadata.
- Instrument DNS transport metrics (success/failure, latency) via `DNSLogService` pipeline -> analytics sink.
- Attach performance markers for navigation transitions and startup.
- Provide runbook for log redaction (see `docs/apple/logging-private-fix.md`).

## 10. Annex – Package Upgrade Matrix
| Package | Current | Target | Notes / Migration Link |
| --- | --- | --- | --- |
| `expo` | `54.0.0-preview.12` | `54.0.0` | Follow Expo SDK 54 migration guide. [1]
| `react-native` | `0.81.1` | `0.81.1` (confirm stable) | Validate release via blog; ensure pods regenerate. [2]
| `expo-dev-client` | `~5.2.4` | `5.2.x` | Re-install during Expo upgrade.
| `react-native-reanimated` | `~3.17.4` | `4.x` (pending Expo support) | Verify compatibility with Expo SDK 54 (JSI). [6]
| `react-native-screens` | `~4.11.1` | `^4.16.0` | Upgrade after Expo update.
| `@react-navigation/*` | `^7.1.x` | `^7.2.x` | Minor bump for bugfixes.
| `expo-build-properties` | `~0.14.8` | Latest matching SDK 54 | Required for build flags.
| `modules/dns-native` | `1.5.0` | `1.6.0` (planned) | Add new-arch compatibility, retest integration.
| Tooling (`jest`, `ts-jest`, `typescript`) | `^29.7`, `^29.2`, `~5.8.3` | Lock versions; future upgrade to Jest 30 once RN supports. |

**References**

[1]: https://expo.dev/changelog/sdk-54  
[2]: https://reactnative.dev/blog/2025/08/12/react-native-0.81  
[3]: https://support.google.com/googleplay/android-developer/answer/11926878  
[4]: https://developer.apple.com/news/upcoming-requirements/  
[5]: https://reactnative.dev/architecture/overview  
[6]: https://github.com/software-mansion/react-native-reanimated#installation
