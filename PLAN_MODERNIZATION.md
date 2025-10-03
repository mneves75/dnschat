# DNSChat Modernization Plan
**Date:** 2025-10-03  
**Scope:** Documentation & planning only — no code changes executed yet.  
**Branch for implementation:** create `docs/expo-rn-modernization-alignment` (Mirrors current working branch).

## 1. Objectives (measurable)
1. **Toolchain stability** – Pin Node 20.19.x, npm ≥10.8, Xcode 16.x, Java 17, and Expo CLI ≥12 across docs, local dev, and CI (`npx expo-doctor` clean on fresh checkout). [1][3]
2. **Architecture alignment** – Enable Fabric/TurboModules on both platforms (including iOS Podfile) with native DNS + Liquid Glass modules passing regression tests.
3. **Performance** – Achieve app launch time-to-interactive ≤3.5 s on iPhone 14 / Pixel 7 (release builds) and maintain ≥60 fps scroll in chat list.
4. **Quality automation** – Introduce end-to-end coverage (Detox or Maestro) for onboarding → chat send → settings transport test; gate PRs on unit + e2e suites.
5. **Compliance & observability** – Ship App Store privacy manifest commitments, Google Play Data Safety updates, and Sentry release tagging with automated rollback strategy.

## 2. Current state → target

| Area | Current snapshot | Target | Gap |
| --- | --- | --- | --- |
| Expo & RN | Expo 54.0.12 / RN 0.81.4 already stable | Maintain parity with latest stable; document upgrade playbook | ✅ Versions current; document guardrails and monitoring for SDK 55.
| Toolchain pinning | Ad-hoc (docs mention Node 20.19, but no `.nvmrc`/CI enforcement) | Introduce `.nvmrc`, CI version check, onboarding updates | Medium: codify versions + add CI job.
| Fabric / TurboModules | Android enabled; iOS Podfile disables via env | Enable iOS Fabric or explicitly defer with documented reason | High: must reconcile Podfile vs Expo config before enabling features relying on Fabric.
| Performance budgets | Informal; no automated metrics | Define KPIs (TTI, FPS, bundle size) and automate measurements | Medium: requires profiling & tooling.
| Observability | Sentry integrated, DNS logs persisted locally | Add release environment tagging, dashboards, privacy manifest updates | Medium: configure build hooks + analytics.
| Testing | Jest unit/integration (manual), no e2e | Add Detox/Maestro, integrate into CI/EAS | High: new framework + device farm planning.
| Compliance | Target API 35 set via Expo config; privacy manifest TODO | Complete Apple privacy manifest by Jan 2026, update Google Data Safety after analytics instrumentation | Medium: gather required data + timeline.

## 3. Phased roadmap

| Phase | Goal | Key tasks | Duration | Cost of change |
| --- | --- | --- | --- | --- |
| **0 – Safeguards & audit** | Snapshot current state before changes | Tag `v2.0.1-pre-modernization`, archive latest EAS build artifacts, export dependency & perf baselines, document OPEN_QUESTIONS | 2 days | Low |
| **1 – Toolchain hardening** | Make environments reproducible | Add `.nvmrc`/`.npmrc`, document Java 17 install flow, CI job verifying `node`, `npm`, `expo` versions, refresh onboarding docs | 3 days | Medium |
| **2 – Fabric alignment** | Decide + implement Fabric/TurboModules posture | Evaluate native module readiness, adjust Podfile to enable Fabric or codify opt-out, run native integration tests, update documentation | 5 days | High |
| **3 – Performance & profiling** | Meet TTI/FPS targets | Instrument startup (Hermes profiler, `expo-profile`), lazy-load heavy contexts, consider FlashList, run device benchmarks, track bundle size | 5 days | Medium |
| **4 – Testing & automation** | Increase coverage & CI confidence | Add Detox/Maestro flows, integrate with EAS or GitHub Actions, ensure Jest + e2e gating, mock DNS responses for deterministic tests | 6 days | High |
| **5 – Compliance & observability** | Meet platform policies and improve telemetry | Implement Apple privacy manifest, ATT prompt if required, update Google Data Safety, configure Sentry release tagging & performance dashboards, log export runbook | 4 days | Medium |
| **6 – Release hardening** | Validate release + rollback story | Stage builds to `preview` → `production`, verify OTA rollback commands, produce final checklist and training docs | 4 days | Medium |

Total estimated effort (single engineer): ~24 days; parallel tracks (tooling/testing) reduce calendar duration.

## 4. Acceptance criteria by phase

- **Phase 0**: Snapshot stored in `/archive/2025-10-03-modernization-baseline`; `npm run sync-versions:dry` clean; dependency & perf baselines recorded.
- **Phase 1**: Local onboarding doc references `.nvmrc`; CI step fails if runtime drift; `npx expo-doctor` passes on clean machine.
- **Phase 2**: Fabric status documented, Podfile/App config aligned, native DNS + Liquid Glass integration tests pass on iOS & Android.
- **Phase 3**: Release build profiling shows TTI ≤3.5 s, chat scroll maintains ≥58 fps on target devices, bundle size report captured.
- **Phase 4**: Detox/Maestro pipeline green on both platforms; PR template updated with automated test evidence requirement.
- **Phase 5**: Privacy manifest merged, ATT decision documented, Google Data Safety updated, Sentry releases tagged automatically.
- **Phase 6**: Canary rollout & rollback rehearsal completed, release checklist signed, environments documented.

## 5. Risk register

| ID | Risk | Prob. | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| R1 | Enabling Fabric breaks native modules | Medium | High | Prototype on feature branch, run native module integration tests, maintain ability to toggle via Podfile/gradle. |
| R2 | Detox/Maestro setup slows CI | Medium | Medium | Execute on nightly device farm initially; optimise test suite before gating PRs. |
| R3 | Privacy manifest misclassification | Low | High | Work with legal/compliance to audit APIs; follow Apple documentation; peer review manifest before submission. [4] |
| R4 | Performance goals unmet | Medium | Medium | Profile early, instrument telemetry, prioritise memoization/lazy-load tasks in Phase 3. |
| R5 | Toolchain drift persists | Medium | Medium | Enforce `.nvmrc` checks in CI and document manual override process. |

## 6. Rollback plan

1. **Source control**: Tag completion of each phase (`modernization-phaseX`). Use `git revert` or branch off tags for emergency rollback.
2. **EAS channels**: Promote builds from `canary` → `preview` → `production`; use `eas update --channel production --rollout 0` to halt or roll back OTA updates immediately.
3. **Artifacts**: Maintain previous IPAs/AABs in `_APP_STORE/` and internal Play tracks; document signing credentials and keystore locations.
4. **Feature flags**: Wrap experimental transports/UI changes with context-driven toggles to disable without redeploying.

## 7. Test strategy

- **Unit**: Jest (app + modules) targeting DNS sanitisation, storage, context reducers (≥80% critical-path coverage).
- **Component**: React Testing Library for ChatInput, MessageList, Onboarding screens with accessibility assertions.
- **Integration**: DNS harness + native module integration tests (device/simulator) executed after Fabric changes.
- **E2E**: Detox/Maestro covering onboarding completion, chat send, retry path, Settings transport forcing.
- **Performance**: `expo-profile` / Hermes tracing for startup; frames-per-second instrumentation via Flipper; bundle analysis with `expo export --dump-sourcemap`.

## 8. Compliance checklist

| Item | Status | Notes |
| --- | --- | --- |
| iOS privacy manifest | 🔲 | Draft manifest required before Jan 31 2026 for relevant APIs. [4] |
| App Tracking Transparency | 🔲 | Decide if analytics requires ATT prompt; document result. |
| Apple icon & toolchain requirements | ✅ | 1024×1024 icon committed; Xcode 16 in use. |
| Google target API ≥35 | ✅ | Expo config sets compile/target 35; confirm Gradle sync after updates. [5] |
| Google Data Safety | 🔲 | Update after analytics instrumentation changes. |

## 9. Observability enhancements

- Automate Sentry release tagging (EAS env vars) and ensure DSN configured per environment.
- Extend `DNSLogService` to export anonymised logs for support; add retention policy.
- Add performance dashboards (TTI, request latency) in Sentry or alternative APM.
- Document log redaction runbook referencing `docs/apple/logging-private-fix.md`.

## 10. Dependency upgrade matrix (annex)

| Package | Current | Target | Notes/links |
| --- | --- | --- | --- |
| `expo` | 54.0.12 | Monitor 55.x | Stay on 54 until Expo SDK 55 stable + RN 0.82 tested. [1] |
| `react-native` | 0.81.4 | Monitor 0.82 | Evaluate after Expo 55 release. [2] |
| `react-native-reanimated` | 4.1.1 | 4.1.x | Ensure Fabric support on iOS before updating. |
| `@react-navigation/*` | ^7.1.x | ^7.2.x | Adopt minor updates post-stability verification. |
| `expo-build-properties` | ~1.0.9 | Latest 1.x | Keep aligned with Expo SDK when enabling Fabric. |
| Tooling (`jest`, `ts-jest`, `typescript`) | 29.x / 5.9.2 | Hold | Upgrade to Jest 30 once RN 0.82 supports. |

**References**

[1]: https://expo.dev/changelog/sdk-54  
[2]: https://reactnative.dev/blog/2025/08/12/react-native-0.81  
[3]: https://docs.expo.dev/more/expo-cli/#system-requirements  
[4]: https://developer.apple.com/news/upcoming-requirements/  
[5]: https://support.google.com/googleplay/android-developer/answer/11926878
