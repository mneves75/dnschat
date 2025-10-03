# Phase 2.2: Native Module Integration Testing Procedure

**Status:** Ready for manual execution  
**Required:** Physical device or simulator  
**Duration:** ~15 minutes per platform

## Overview

This procedure validates that native modules (dns-native, LiquidGlassNative) work correctly on both legacy (Paper) and new (Fabric) React Native architectures. Tests must pass before finalizing Fabric rollout.

---

## Prerequisites

### iOS
- Xcode 16+ on macOS
- iOS Simulator (iPhone 15 or newer, iOS 17+) OR physical device
- CocoaPods ≥1.15.0

### Android
- Android Studio with SDK Platform 35 and Build Tools 35.0.0
- Android Emulator (API 35) OR physical device
- Java 17

---

## Test Execution

### Phase A: iOS on Fabric (NEW Architecture)

This tests the **new Podfile configuration** (Fabric enabled via Phase 2.1).

```bash
# 1. Clean previous builds
cd ios && rm -rf Pods/ Podfile.lock build/ && cd ..

# 2. Verify Fabric is enabled
cat ios/Podfile.properties.json | grep newArchEnabled
# Expected: "newArchEnabled": "true"

# 3. Install pods and build
npm run ios  # or: npx expo run:ios

# 4. Once app launches, run integration tests
cd modules/dns-native
RUN_INTEGRATION_TESTS=true npm test

# 5. Record results in FABRIC_TEST_RESULTS.md (template below)
```

**Expected Outcome:**
- App launches without crashes
- All integration tests pass (or document failures)
- LiquidGlassNative (`.glassEffect()`) works on iOS 17+ devices/simulators
- No native module errors in Xcode console

### Phase B: Android on Fabric (EXISTING Configuration)

This validates Android **already works** on Fabric (baseline).

```bash
# 1. Clean previous builds
cd android && ./gradlew clean && cd ..

# 2. Build and run
source android-java17.sh  # if needed
npm run android

# 3. Run integration tests
cd modules/dns-native
RUN_INTEGRATION_TESTS=true npm test

# 4. Record results
```

**Expected Outcome:**
- App launches without crashes
- All integration tests pass
- Native DNS module works via Android DnsResolver
- No JNI errors in logcat

### Phase C: Regression Testing

Run these manual checks in the app after builds complete:

#### iOS & Android
1. **Chat functionality:**
   - Send a message via DNS (ch.at or llm.pieter.com)
   - Verify response appears in chat UI
   - Check Settings → "Transport Test" buttons work

2. **Native DNS module:**
   - Open app logs (if available in debug build)
   - Verify DNS query attempts show correct fallback order (Native → UDP → TCP → DoH)
   - Test network interruption: enable airplane mode, send message, verify graceful error

3. **Liquid Glass (iOS 17+ only):**
   - Navigate to Settings screen
   - Verify glass blur effects render correctly
   - Change device appearance (light/dark mode), verify glass adapts
   - Check no visual glitches or rendering issues

4. **Performance:**
   - Scroll through long chat history (if available)
   - Verify 60fps scroll performance
   - Check app memory usage in Xcode Instruments / Android Profiler

---

## Test Results Template

Copy this template to `.modernization/FABRIC_TEST_RESULTS.md` and fill in after testing:

```markdown
# Fabric Integration Test Results

**Date:** YYYY-MM-DD  
**Tester:** [Your Name]  
**Build:** [Commit SHA or tag]

## iOS (Fabric Enabled)

### Environment
- Device/Simulator: [e.g., iPhone 15 Pro Simulator, iOS 18.0]
- Xcode Version: [e.g., 16.0]
- Pod Install Success: [✅ / ❌]

### Integration Tests
- `npm test` Exit Code: [0 = pass, non-zero = fail]
- Tests Passed: [X/Y]
- Tests Failed: [List failures]

### Manual Regression
- Chat send/receive: [✅ / ❌]
- DNS fallback order: [✅ / ❌]
- Liquid Glass rendering: [✅ / ❌ / N/A if <iOS 17]
- Performance (60fps scroll): [✅ / ❌]

### Issues Found
[Describe any crashes, errors, or unexpected behavior]

---

## Android (Fabric Baseline)

### Environment
- Device/Emulator: [e.g., Pixel 6 Emulator, API 35]
- Android Studio Version: [e.g., Iguana]
- Gradle Build Success: [✅ / ❌]

### Integration Tests
- `npm test` Exit Code: [0 = pass, non-zero = fail]
- Tests Passed: [X/Y]
- Tests Failed: [List failures]

### Manual Regression
- Chat send/receive: [✅ / ❌]
- DNS fallback order: [✅ / ❌]
- Performance (60fps scroll): [✅ / ❌]

### Issues Found
[Describe any crashes, errors, or unexpected behavior]

---

## Decision

Based on test results:

- [ ] **Proceed with Fabric on iOS** - All tests passed, no regressions
- [ ] **Defer Fabric on iOS** - Critical issues found, document in OPEN_QUESTIONS.md
- [ ] **Staged Rollout** - Partial issues, enable for subset of users first

**Rationale:**
[Explain decision based on test outcomes]

**Action Items:**
- [ ] Item 1
- [ ] Item 2
```

---

## Rollback Procedure (If Tests Fail)

If critical issues are found on iOS Fabric:

1. **Revert Podfile change:**
   ```bash
   cd ios
   git checkout HEAD~1 Podfile  # revert to legacy config
   rm -rf Pods/ Podfile.lock
   pod install
   cd ..
   npm run ios
   ```

2. **Document issues in OPEN_QUESTIONS.md** under Q2.1 (Fabric rollout timeline)

3. **Update Podfile.properties.json:**
   ```json
   {
     "newArchEnabled": "false"
   }
   ```

4. **Rebuild and confirm Paper (legacy) works:**
   ```bash
   npm run ios
   cd modules/dns-native && RUN_INTEGRATION_TESTS=true npm test
   ```

---

## Next Steps

After successful testing:

1. ✅ Mark Phase 2.2 as complete in todo list
2. 📝 Document findings in Phase 2.3 (Fabric/TurboModules decision)
3. 📝 Update TECH_REVIEW.md with architecture state (Phase 2.4)
4. 🚀 Proceed to Phase 3 (Performance Profiling)

If tests fail:

1. ❌ Rollback (see above)
2. 📝 Document blockers in OPEN_QUESTIONS.md
3. 🔍 Investigate native module compatibility issues
4. 🔄 Retry after fixes

---

## References

- Integration test source: `modules/dns-native/__tests__/integration.test.ts`
- Fabric migration guide: https://reactnative.dev/docs/new-architecture-intro
- Expo Fabric docs: https://docs.expo.dev/guides/new-architecture/
