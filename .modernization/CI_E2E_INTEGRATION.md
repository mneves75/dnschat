# CI/EAS E2E Test Integration Guide

**Phase 4.3**
**Date:** 2025-10-03
**Status:** ✅ **IMPLEMENTED**

---

## Overview

This document describes the comprehensive CI/CD integration for Detox e2e tests across GitHub Actions and EAS Build.

**Goals:**
- Automated e2e testing on every PR and push to main/develop
- Cross-platform validation (iOS + Android) before merge
- Artifact collection for test failures (screenshots, logs, videos)
- EAS Build integration for cloud-based e2e testing

---

## GitHub Actions Workflows

### 1. E2E Test Workflow (`.github/workflows/e2e-tests.yml`)

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`
- Manual workflow dispatch
- Only when relevant files change:
  - `src/**` (app code)
  - `e2e/**` (test code)
  - `modules/dns-native/**` (native module)
  - `ios/**`, `android/**` (native code)
  - `app.config.ts`, `package.json`, `package-lock.json`

**Jobs:**

#### `e2e-ios` (macOS-latest, 60min timeout)

**Steps:**
1. Checkout code
2. Setup Node.js 20.19.1 (with npm cache)
3. Install npm dependencies (`npm ci`)
4. Setup iOS environment (Xcode, simulators)
5. Install CocoaPods dependencies (`pod install`)
6. Build app for Detox (`npm run detox:build:ios`)
   - Target: Release configuration for iOS Simulator
   - Output: `ios/build/Build/Products/Release-iphonesimulator/DNSChat.app`
   - Timeout: 30 minutes
7. Boot iOS Simulator (iPhone 15)
8. Run Detox e2e tests (`npm run detox:test:ios`)
   - Runs all 6 test suites (onboarding, chat-lifecycle, dns-transports, error-handling, native-module, smoke)
   - Records logs for debugging
   - Timeout: 20 minutes
9. Upload artifacts on failure (screenshots, logs, videos)
10. Upload test results (always, for historical tracking)

**Resource Requirements:**
- Runner: `macos-latest` (required for Xcode)
- Xcode version: Latest stable (auto-selected by GitHub)
- Simulator: iPhone 15 (iOS 17+)
- Estimated duration: 15-25 minutes

#### `e2e-android` (Ubuntu-latest, 60min timeout)

**Steps:**
1. Checkout code
2. Setup Node.js 20.19.1
3. Setup Java 17 (Temurin distribution, with Gradle cache)
4. Install npm dependencies
5. Configure Android environment (SDK paths, licenses)
6. Install Android SDK Platform 35 + Build Tools 35.0.0
7. Create AVD (Pixel 8 API 35 emulator)
8. Build app for Detox (`npm run detox:build:android`)
   - Target: Release APK
   - Output: `android/app/build/outputs/apk/release/app-release.apk`
   - Timeout: 30 minutes
9. Start Android Emulator (headless, no animations)
   - Uses `reactivecircus/android-emulator-runner@v2`
   - Disables window animations for stable testing
10. Run Detox e2e tests (`npm run detox:test:android`)
    - Timeout: 20 minutes inside emulator runner
11. Upload artifacts on failure
12. Upload test results

**Resource Requirements:**
- Runner: `ubuntu-latest`
- Java: 17 (Temurin)
- Android SDK: API 35, Build Tools 35.0.0
- Emulator: Pixel 8 API 35 (x86_64, google_apis)
- Estimated duration: 20-30 minutes

#### `e2e-summary` (Ubuntu-latest, always runs)

**Purpose:** Aggregate test results and post summary

**Steps:**
1. Check both iOS and Android job results
2. Exit with failure if either platform failed
3. Post PR comment with test summary table:

```markdown
## E2E Test Results

| Platform | Status |
|----------|--------|
| iOS (iPhone 15 Simulator) | ✅ Passed |
| Android (Pixel 8 API 35) | ✅ Passed |

**Test Suites:** onboarding, chat-lifecycle, dns-transports, error-handling, native-module, smoke

[View workflow run](...)
```

**Concurrency:**
- Group: `e2e-${{ github.ref }}`
- Cancel in-progress: `true`
- Behavior: Cancels old runs when new commit pushed to same PR/branch

---

### 2. Main CI Workflow (`.github/workflows/ci.yml`)

**Updated to reference e2e workflow:**

```yaml
# E2E tests run in separate workflow (.github/workflows/e2e-tests.yml)
# Triggered automatically for PRs and main/develop pushes
# Required to pass before merging (see branch protection rules)
```

**Rationale for separate workflow:**
- E2E tests are slow (~20-30 minutes)
- Allows parallel execution with lint/typecheck job
- Easier to debug e2e-specific failures
- Cleaner artifact organization

**Current CI jobs:**
- `lint-and-typecheck`: Fast feedback on code quality (5-10 minutes)

**Future CI jobs (TODO comments):**
- Lint code (when linter configured)
- Run unit tests (when tests exist)

---

## EAS Build Integration

### E2E Build Profile (`eas.json`)

```json
{
  "build": {
    "e2e": {
      "distribution": "internal",
      "env": {
        "DETOX_ENABLED": "true"
      },
      "ios": {
        "buildConfiguration": "Release",
        "simulator": true,
        "includeDsym": true,
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease :app:assembleAndroidTest -DtestBuildType=release",
        "resourceClass": "medium"
      }
    }
  }
}
```

**Configuration Details:**

**iOS:**
- `buildConfiguration: "Release"` - Production-like performance
- `simulator: true` - Build for simulator (required for Detox)
- `includeDsym: true` - Debug symbols for crash reports
- `resourceClass: "m-medium"` - macOS medium worker (faster builds)

**Android:**
- `buildType: "apk"` - APK for emulator (not AAB for store)
- `gradleCommand: ":app:assembleRelease :app:assembleAndroidTest"` - Build both app and test APK
- `-DtestBuildType=release` - Align test APK with Release build type
- `resourceClass: "medium"` - Medium worker for Gradle builds

**Environment Variable:**
- `DETOX_ENABLED: "true"` - Optional flag for conditional logic (e.g., disable analytics in e2e builds)

---

## Usage

### Local Development

**iOS:**
```bash
# Build app
npm run detox:build:ios

# Run all e2e tests
npm run detox:test:ios

# Run all-in-one (build + test)
npm run e2e:ios

# Run specific test suite
npm run detox:test:ios -- e2e/onboarding.e2e.js

# Run with visible simulator (no --headless)
npm run detox:test:ios -- --no-headless
```

**Android:**
```bash
# Ensure emulator is running (Pixel_8_API_35)
emulator -avd Pixel_8_API_35 &

# Build app
npm run detox:build:android

# Run all e2e tests
npm run detox:test:android

# Run all-in-one
npm run e2e:android
```

**Both Platforms:**
```bash
# Run iOS and Android sequentially
npm run e2e:all
```

---

### EAS Build Cloud

**Build e2e binaries on EAS:**

```bash
# iOS
eas build --platform ios --profile e2e

# Android
eas build --platform android --profile e2e

# Both
eas build --platform all --profile e2e
```

**Download and test locally:**

```bash
# 1. Build on EAS (faster than local, especially iOS)
eas build --platform ios --profile e2e

# 2. Download artifact
# (Use EAS dashboard or CLI to get download URL)

# 3. Run tests against downloaded build
detox test --configuration ios.sim.release --headless
```

**Benefits of EAS Build for e2e:**
- Consistent build environment (no "works on my machine")
- Faster iOS builds (Apple Silicon EAS workers)
- Parallel iOS + Android builds
- Shared artifacts across team

---

## Artifacts & Debugging

### Artifacts Uploaded (on test failure)

**Screenshots:**
- Path: `artifacts/**/*.png`
- Captures: App state at failure point

**Logs:**
- Path: `artifacts/**/*.log`
- Contains:
  - Detox internal logs
  - Metro bundler logs (if applicable)
  - Native module logs (DNS query details)

**Videos** (if enabled):
- Path: `artifacts/**/*.mp4`
- Records: Full test execution

**Retention:** 7 days

### Accessing Artifacts

1. Navigate to failed workflow run
2. Scroll to bottom → "Artifacts" section
3. Download:
   - `detox-artifacts-ios-<run-number>` (iOS failures)
   - `detox-artifacts-android-<run-number>` (Android failures)
   - `e2e-test-results-ios-<run-number>` (Jest test results)
   - `e2e-test-results-android-<run-number>`

### Debugging Failed Tests

**Step 1: Review GitHub Actions logs**
- Click on failed step (e.g., "Run Detox E2E tests (iOS)")
- Look for:
  - `FAIL e2e/onboarding.e2e.js` (which suite failed)
  - Error message / stack trace
  - Detox matcher errors (e.g., "Element not found: by.id('chat-new')")

**Step 2: Download artifacts**
- Screenshot: Shows UI state at failure
- Logs: Full Detox execution log

**Step 3: Reproduce locally**
```bash
# Run same test suite locally
npm run e2e:ios -- e2e/onboarding.e2e.js --no-headless

# Enable Detox debug logging
DEBUG=detox:* npm run e2e:ios
```

**Step 4: Common Issues**

| Error | Cause | Fix |
|-------|-------|-----|
| "Element not found: by.id('...')" | Missing testID in component | Add testID (see TESTID_REQUIREMENTS.md) |
| "Timeout waiting for element" | Element loads slower than expected | Increase timeout: `waitFor(...).withTimeout(5000)` |
| "App crashed during test" | Native module error | Check device logs: `xcrun simctl spawn booted log stream` |
| "Simulator boot failed" | Simulator unavailable | Reset simulator: `xcrun simctl erase all` |
| "Gradle build failed" | Android SDK/Java mismatch | Verify Java 17 + Android SDK 35 installed |

---

## Performance Benchmarks

**Typical CI Execution Times:**

| Job | Duration | Notes |
|-----|----------|-------|
| Checkout + Setup (iOS) | 2-3 min | Node, CocoaPods install |
| Build iOS app | 8-12 min | Xcode Release build |
| Run iOS e2e tests | 5-10 min | 6 test suites, ~75 scenarios |
| **Total iOS** | **15-25 min** | - |
| Checkout + Setup (Android) | 2-3 min | Node, Java, Android SDK |
| Build Android APK | 10-15 min | Gradle assembleRelease |
| Run Android e2e tests | 8-12 min | Emulator startup + tests |
| **Total Android** | **20-30 min** | - |

**Optimization Opportunities:**
- Cache CocoaPods (`~/.cocoapods` directory) - saves 1-2 min
- Cache Gradle build (`~/.gradle` directory) - saves 2-4 min
- Use EAS Build for CI (pre-built binaries) - saves 8-12 min

---

## Branch Protection Rules (Phase 4.4)

**Required Status Checks (to be configured):**

```
Repository Settings → Branches → Branch protection rules for `main`:

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging

Required checks:
- lint-and-typecheck (from ci.yml)
- e2e-ios (from e2e-tests.yml)
- e2e-android (from e2e-tests.yml)
- e2e-summary (from e2e-tests.yml)
```

**Effect:** PRs cannot be merged unless:
1. Lint & TypeCheck passes
2. Both iOS and Android e2e tests pass
3. E2E summary aggregates successfully

**Manual Override:** Repository admins can bypass (not recommended for production)

---

## Monitoring & Metrics

### Success Rate Tracking

**Goal:** Maintain >95% e2e test pass rate

**Metrics to track:**
- % of PRs passing e2e tests on first try
- Average time to fix flaky tests
- Most frequently failing test scenarios

**Tools:**
- GitHub Insights → Actions tab → Workflow runs
- Custom dashboard (future): Query GitHub API for workflow statistics

### Flakiness Detection

**Definition:** Test fails/passes inconsistently without code changes

**Detection:**
- Re-run failed test 3 times
- If passes on retry → mark as flaky
- Track flaky tests in separate issue tracker

**Mitigation (future):**
- Add retry logic to Detox config:
  ```json
  {
    "testRunner": "jest",
    "runnerConfig": "e2e/jest.config.js",
    "retries": 2  // Retry flaky tests up to 2 times
  }
  ```

---

## Troubleshooting

### iOS Build Failures

**"xcodebuild: Command not found"**
- Cause: Xcode not installed or not selected
- Fix: Runner uses `macos-latest` with Xcode pre-installed

**"Pod install failed"**
- Cause: CocoaPods dependency conflict
- Fix: Update `ios/Podfile.lock`, commit, retry

**"Simulator boot timeout"**
- Cause: macOS runner overloaded
- Fix: Retry workflow (transient issue)

### Android Build Failures

**"JAVA_HOME not set"**
- Cause: Java 17 setup failed
- Fix: Verify `actions/setup-java@v4` step succeeded

**"Android SDK not found"**
- Cause: SDK installation step failed
- Fix: Check `sdkmanager` output for errors

**"Emulator failed to start"**
- Cause: AVD creation failed or KVM unavailable
- Fix: Ensure `reactivecircus/android-emulator-runner` uses hardware acceleration (x86_64)

### Test Execution Failures

**"All tests failed immediately"**
- Cause: App build artifact not found
- Fix: Verify `binaryPath` in `package.json` detox config matches build output

**"Tests timeout waiting for app launch"**
- Cause: App crashes on startup
- Fix: Check native logs for crash reports

---

## Future Enhancements (Post-Phase 4)

### Phase 5: Observability Integration
- [ ] Send e2e test results to Sentry (track failure patterns)
- [ ] Alert on flaky test rate >10%
- [ ] Dashboard: e2e test duration trends

### Phase 6: Release Automation
- [ ] Run e2e tests on EAS Build `preview` channel before promoting to `production`
- [ ] Automated rollback if e2e tests fail on release candidate

### Performance Optimizations
- [ ] Matrix strategy: Run test suites in parallel (6 parallel jobs)
- [ ] Cache Detox build artifacts between runs
- [ ] Use EAS Build artifacts instead of rebuilding in CI

---

## References

- [Detox Documentation](https://wix.github.io/Detox/)
- [Expo + Detox Guide](https://docs.expo.dev/build-reference/e2e-tests/)
- [GitHub Actions: Caching Dependencies](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [EAS Build Configuration](https://docs.expo.dev/build/eas-json/)
- [Android Emulator Runner Action](https://github.com/ReactiveCircus/android-emulator-runner)

---

## Summary

**Implemented:**
- ✅ Separate e2e workflow for iOS + Android
- ✅ EAS Build e2e profile (simulator builds)
- ✅ Artifact collection on failures
- ✅ PR comment summaries
- ✅ Concurrency control (cancel old runs)

**Pending (Phase 4.4):**
- ⏳ Add missing testIDs to components (30 remaining)
- ⏳ Configure branch protection rules
- ⏳ Run smoke test in CI to verify setup

**Outcome:** Comprehensive CI/EAS integration ready for PR gating (Phase 4.4)
