# ExecPlan: Native DNS Port Parity + Reanimated Render-Safety

**Version**: 1.0.0
**Created**: 2026-01-05
**Status**: COMPLETE
**Reviewer**: John Carmack Standard

---

## Executive Summary

Fix two production regressions surfaced in runtime logs:

1. Native DNS TurboModule bridge was out of sync with TypeScript (missing `port` parameter), causing iOS/Android native DNS to fail before UDP/TCP fallback.
2. Reanimated warnings were emitted due to reading shared values during React render.

Secondary hardening: validate DNS port range before UDP/TCP socket usage to avoid invalid-port errors and to fail fast with clear messages.

---

## Problem Statement

### Observed Failures

- iOS native DNS: `RNDNSModule.queryTXT(): Error while converting JavaScript argument 2 to Objective C type RCTPromiseResolveBlock`.
  - Root cause: native bridge still expected `(domain, message, resolve, reject)` while JS now calls `(domain, message, port)`.
- Android native DNS: same mismatch (JS passes port, Java module expects only domain + message).
- Reanimated warnings: "Reading from `value` during component render".
  - Root cause: shared values read in render (`useScreenEntrance`, `Toast`).
- UDP error: `ERR_SOCKET_BAD_PORT`.
  - Root cause: port not validated at socket boundary (could become invalid if config is wrong).

---

## Goals

- Native DNS bridge parity across TypeScript, iOS, Android.
- Eliminate shared-value reads during React render.
- Add fast port validation to prevent invalid socket calls.
- Keep iOS/Android copies in sync with `modules/dns-native/` sources.

Non-goals:
- Changing DNS server selection behavior or fallback policy.
- Adding new servers or altering DNS protocol logic.

---

## Implementation Plan

### Phase 1: Native DNS Bridge Parity

- [x] iOS: add `port` parameter to bridge + resolver, include port in query dedupe key.
- [x] Android: add `port` parameter to bridge + resolver, propagate through UDP + legacy resolver, include port in dedupe key.
- [x] Sync copied native sources (`ios/DNSNative`, `android/app/src/main/java/com/dnsnative`) from `modules/dns-native`.
- [x] Update `modules/dns-native/README.md` API signature + example to include `port`.

### Phase 2: Reanimated Render-Safety

- [x] `useScreenEntrance`: move `isReady` to React state and update via `runOnJS`, no shared-value reads in render.
- [x] `Toast`: replace render-time shared-value check with `isMounted` state controlled by animation completion.

### Phase 3: Port Validation Before UDP/TCP

- [x] Add `normalizePort` in `DNSService` to enforce 1-65535 range and integer coercion.
- [x] Use normalized port in `createQueryContext` (shared by query + test paths).

### Phase 4: Verification

- [x] `bun run test -- --testPathPattern=dnsService`
- [x] `cd modules/dns-native && npm test`

---

## Files Touched

- `modules/dns-native/ios/DNSResolver.swift`
- `modules/dns-native/ios/RNDNSModule.m`
- `modules/dns-native/android/DNSResolver.java`
- `modules/dns-native/android/RNDNSModule.java`
- `ios/DNSNative/DNSResolver.swift` (synced)
- `ios/DNSNative/RNDNSModule.m` (synced)
- `android/app/src/main/java/com/dnsnative/DNSResolver.java` (synced)
- `android/app/src/main/java/com/dnsnative/RNDNSModule.java` (synced)
- `modules/dns-native/README.md`
- `src/ui/hooks/useScreenEntrance.ts`
- `src/components/ui/Toast.tsx`
- `src/services/dnsService.ts`

---

## Validation Results

- `bun run test -- --testPathPattern=dnsService`
  - Result: PASS (6 suites, 50 tests)
- `cd modules/dns-native && npm test`
  - Result: PASS (7 suites, 56 tests; 1 suite skipped as expected)

---

## Risks & Mitigations

- **Risk**: Port parameter mismatch persists in generated native folders.
  - **Mitigation**: Copy module sources into app-native directories in repo; keep plugin copy source aligned.
- **Risk**: Animation lifecycle regressions due to Toast unmount timing.
  - **Mitigation**: `isMounted` gates render only after slide-out completes.

---

## Completion Checklist (John Carmack Standard)

- [x] Root causes identified and fixed with minimal, direct changes.
- [x] No render-time reads of Reanimated shared values.
- [x] Native bridge signatures match JS calls on both platforms.
- [x] Port usage validated before sockets.
- [x] Tests run and passing.

