# Fabric & TurboModules Architecture Decision

**Status:** Proposed (pending test validation)  
**Date:** 2025-10-03  
**Phase:** 2.3 - Fabric/TurboModules decision and rollout plan

## Executive Summary

**Decision:** Enable React Native's New Architecture (Fabric + TurboModules) on iOS to achieve platform parity with Android.

**Current State:**
- ✅ Android: Fabric enabled (via app.config.ts)
- ⚠️ iOS: Fabric enabled in config but Podfile was ambiguous (fixed in Phase 2.1)

**Proposed State:**
- ✅ Android: Fabric enabled (unchanged)
- ✅ iOS: Fabric explicitly enabled (via updated Podfile)

**Rationale:** Aligns with React Native and Expo's deprecation timeline for Paper (legacy architecture). Fabric brings performance improvements, better concurrent rendering, and positions the app for future RN versions.

---

## Background

### What is Fabric?

Fabric is React Native's new rendering system (introduced in RN 0.68, stable in RN 0.70+). Key improvements:

- **Concurrent Rendering:** Enables React 18+ features (Suspense, Transitions)
- **Synchronous Layout:** Eliminates layout thrashing in cross-platform views
- **Better Type Safety:** C++ core with improved JS bindings
- **Performance:** Faster view creation, reduced bridge overhead

### What are TurboModules?

TurboModules replace NativeModules with a new JSI (JavaScript Interface) API:

- **Lazy Loading:** Modules load on-demand instead of startup
- **Type Safety:** Code-generated bindings from TypeScript
- **No Bridge:** Direct JS ↔ Native calls via JSI (faster)
- **Better Threading:** Explicit thread control for async operations

### DNSChat's Current State

#### app.config.ts
```typescript
// Line 35
newArchEnabled: true  // expo-build-properties.ios
// Line 87
newArchEnabled: true  // app-level flag
```

#### ios/Podfile (Before Phase 2.1)
```ruby
# Line 7 - OLD
ENV['RCT_NEW_ARCH_ENABLED'] = '0' if podfile_properties['newArchEnabled'] == 'false'
# ❌ Only disabled Fabric when explicitly false; didn't enable when true
```

#### ios/Podfile (After Phase 2.1)
```ruby
# Line 9 - NEW
ENV['RCT_NEW_ARCH_ENABLED'] = podfile_properties['newArchEnabled'] == 'true' ? '1' : '0'
# ✅ Explicitly sets Fabric based on properties file
```

#### ios/Podfile.properties.json
```json
{
  "newArchEnabled": "true"  // Line 4
}
```

**Result:** iOS was unknowingly running Paper (legacy) despite config saying Fabric. Android was correctly running Fabric.

---

## Decision Details

### Immediate Actions (Phase 2)

1. ✅ **Podfile Fix (Phase 2.1):** Explicitly set `ENV['RCT_NEW_ARCH_ENABLED']` based on `Podfile.properties.json`
2. ✅ **Test Procedure (Phase 2.2):** Document native module validation on Fabric
3. 📝 **Decision Doc (Phase 2.3):** This document
4. 📝 **Tech Review Update (Phase 2.4):** Document new architecture state

### Validation Checklist

Before finalizing Fabric on iOS, verify:

- [ ] **Native Modules Work:**
  - `modules/dns-native` (Swift TurboModule wrapper)
  - `ios/LiquidGlassNative` (Objective-C++ bridge)
- [ ] **Integration Tests Pass:**
  - Run `RUN_INTEGRATION_TESTS=true npm test` in `modules/dns-native`
- [ ] **App Functionality:**
  - Chat send/receive via DNS
  - Liquid Glass effects render correctly (iOS 17+)
  - No crashes or native errors
- [ ] **Performance:**
  - 60fps scroll in message list
  - No regressions vs. Paper baseline

**Validation Method:** Follow `.modernization/FABRIC_TEST_PROCEDURE.md`

### Rollback Plan (If Tests Fail)

If critical issues found:

1. Revert `ios/Podfile` to commit before Phase 2.1
2. Set `ios/Podfile.properties.json`: `"newArchEnabled": "false"`
3. Rebuild: `npm run fix-pods && npm run ios`
4. Document blockers in `OPEN_QUESTIONS.md` Q2.1
5. Defer Fabric to future milestone

---

## TurboModules Migration

### Current Native Module Pattern

**dns-native:** Uses legacy `NativeModules` pattern:

```typescript
// modules/dns-native/index.ts
import { NativeModules } from 'react-native';
const { RNDNSModule } = NativeModules;
```

**Status:** ✅ Works on both Paper and Fabric (backward compatible)

### Migration to TurboModules (Future Work)

**Recommendation:** **Defer** TurboModules conversion to a future phase.

**Rationale:**
- Fabric works with legacy NativeModules (compatibility layer exists)
- Current modules are stable and performant
- TurboModules require significant refactoring:
  - Code-gen from TypeScript specs
  - New C++/Swift/Java implementations
  - Extensive testing

**Timeline:**
- Phase 2 (Current): Validate existing modules on Fabric
- Phase 3-6: Performance profiling, testing, release hardening
- **Future:** Migrate to TurboModules when bandwidth allows (document in OPEN_QUESTIONS.md Q2.2)

---

## Rollout Strategy

### Option A: Immediate Rollout (Recommended)

**Approach:** Enable Fabric on iOS for all users immediately after validation.

**Pros:**
- Simplifies architecture (both platforms on Fabric)
- Faster feedback loop
- No feature flag complexity

**Cons:**
- All users exposed to potential issues simultaneously
- Requires high confidence in test results

**Mitigation:**
- Thorough integration testing (Phase 2.2)
- EAS preview builds before production (Phase 6.1)
- OTA rollback capability (Phase 6.2)

### Option B: Staged Rollout

**Approach:** Enable Fabric for subset of users via feature flag.

**Pros:**
- Lower risk (can monitor metrics before full rollout)
- Easier to isolate issues

**Cons:**
- Requires additional infrastructure (feature flags, analytics)
- Delays benefits for most users
- Complexity in maintaining two architectures

**Decision:** Use **Option A** unless Phase 2.2 tests reveal concerns.

---

## Success Metrics

Track these metrics post-rollout (Phase 3.4):

| Metric | Target | Measurement |
|--------|--------|-------------|
| TTI (Time to Interactive) | <2s on mid-range devices | Hermes profiler |
| FPS (Chat scroll) | 60fps sustained | React DevTools Profiler |
| Memory Peak | <150MB iOS, <200MB Android | Xcode Instruments / Android Profiler |
| Crash-free rate | >99.5% | Sentry dashboard |
| DNS query success rate | >95% (network permitting) | App logs |

---

## Migration Timeline

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 2.1 | Podfile Fabric alignment | ✅ Complete |
| 2.2 | Native module validation | ✅ Documented (awaiting device testing) |
| 2.3 | Decision documentation | 🚧 In Progress |
| 2.4 | TECH_REVIEW.md update | ⏳ Pending |
| 3.x | Performance profiling on Fabric | ⏳ Pending |
| 6.x | Production rollout | ⏳ Pending |

---

## Open Questions

See `OPEN_QUESTIONS.md` for detailed discussion:

- **Q2.1:** Fabric rollout timeline (immediate vs staged)
- **Q2.2:** TurboModules migration schedule
- **Q2.3:** Bridgeless mode readiness (future consideration)

---

## References

- [React Native New Architecture](https://reactnative.dev/docs/new-architecture-intro)
- [Expo Fabric Migration](https://docs.expo.dev/guides/new-architecture/)
- [Fabric API](https://reactnative.dev/architecture/fabric-renderer)
- [TurboModules Docs](https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules)
- Project test procedure: `.modernization/FABRIC_TEST_PROCEDURE.md`

---

## Approval

**Decision Maker:** [Team Lead / Project Owner]  
**Date:** [After Phase 2.2 validation]  
**Approval:** [ ] Approved  [ ] Deferred  [ ] Needs Discussion

**Notes:**
