# Exec Plan: Native DNS Best-Practices Hardening (2026-01-06)

Status: Completed
Owner: Mobile
Last updated: 2026-01-06

## Goal

Harden native DNS behavior and build hygiene to align with current best practices, reduce Gradle deprecation noise, and keep iOS/Android/TypeScript behavior aligned without changing DNS transport semantics.

## Non-goals

- Changing DNS transport order or adding new transports.
- Rewriting the DNS protocol implementation or server allowlist model.
- Updating UI or navigation.

## Current state

- Android DNSResolver is synchronized and fixed for modern Java/Gradle deprecations.
- iOS DNSResolver sanitation uses canonical decomposition (NFD), while JS/Android use compatibility decomposition (NFKD).
- Several Android dependency build.gradle files still use deprecated Groovy “space assignment” syntax.
- iOS native module does not implement module invalidation cleanup.

## Best-practice references (source of truth)

- React Native native module lifecycle/invalidating guidance.
- Gradle 8+ upgrade notes about Groovy DSL space-assignment deprecation.
- Cloudflare DoH JSON vs wireformat guidance (documented tradeoffs; not a transport change here).

## Phased plan

### Phase 0: Audit and scope

Acceptance criteria:
- Enumerate deprecation warnings and native module lifecycle gaps.
- Confirm sanitizer normalization mismatch across platforms.

Tasks:
- [x] Review iOS DNSResolver normalization and lifecycle behavior.
- [x] Identify Gradle deprecation warnings in dependencies.

Verification:
- [x] `rg -n "deprecation" android` (manual review).

### Phase 1: Gradle deprecation hygiene (dependencies)

Acceptance criteria:
- All Groovy space-assignment warnings from dependency build.gradle files patched.
- Patches persisted via patch-package.

Tasks:
- [x] Patch Expo module build.gradle assignments:
  - `expo`, `expo-constants`, `expo-dev-client`, `expo-dev-launcher`, `expo-dev-menu`,
    `expo-dev-menu-interface`, `expo-json-utils`, `expo-manifests`, `expo-modules-core`,
    `expo-updates-interface`.
- [x] Patch React Native dependency build.gradle assignments:
  - `@react-native-async-storage/async-storage`, `@react-native-clipboard/clipboard`,
    `react-native-device-info`, `react-native-edge-to-edge`, `react-native-gesture-handler`,
    `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`.
- [x] Patch additional RN dependency build.gradle assignments:
  - `@react-native-menu/menu`, `react-native-keyboard-controller`, `react-native-worklets`,
    `react-native-svg`, `react-native-udp`.

Verification:
- [x] `cd android && ./gradlew --warning-mode all :app:testDebugUnitTest`

Residual warnings (expected):
- `sdk.dir` in `android/local.properties` not set in this environment.
- Gradle toolchain auto-provisioning warning (requires toolchain repo config to silence).

### Phase 2: iOS native module lifecycle cleanup

Acceptance criteria:
- iOS native module implements invalidate cleanup to cancel pending tasks.
- Cleanup is safe on any thread.

Tasks:
- [x] Add `DNSResolver.cleanup()` to cancel active tasks.
- [x] Implement `RCTInvalidating.invalidate()` in `RNDNSModule`.

Verification:
- [x] Code review + build (no compilation errors).

### Phase 3: Unicode normalization alignment

Acceptance criteria:
- iOS sanitizer uses compatibility decomposition (NFKD) to match JS/Android.

Tasks:
- [x] Update `foldUnicode` to use `decomposedStringWithCompatibilityMapping`.
- [x] Sync duplicate resolver copy under `modules/dns-native`.

Verification:
- [x] Spot-check with unit tests (not required to add new tests).

### Phase 4: Documentation and traceability

Acceptance criteria:
- Changelog and exec plan reflect the changes.

Tasks:
- [x] Update `CHANGELOG.md` with iOS cleanup + NFKD alignment.
- [x] Add this exec plan to `docs/plans/`.

Verification:
- [x] `rg -n "Exec Plan" docs/plans/EXECPLAN-2026-01-06-NATIVE-DNS-BEST-PRACTICES.md`.

## Implementation status

All phases completed on 2026-01-06.
