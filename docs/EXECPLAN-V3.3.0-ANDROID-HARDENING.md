# Engineering Execution Plan: v3.3.0 Android Hardening Release

**Version**: 3.3.0
**Date**: 2025-12-16
**Author**: Engineering Agent
**Status**: Complete

## Goal

Ship Android hardening improvements as v3.3.0, ensuring:
1. Release builds are never debug-signed
2. Keystore configuration is portable across CI/local environments
3. Java 17 detection is robust and portable
4. CI prevents Android-specific regressions
5. Version parity between iOS/Android/Expo configs

## Non-Goals

- Runtime smoke tests on physical devices (build-level verification only for now)
- Breaking changes to DNS protocol or transport layer
- UI/UX changes

## Current State (v3.2.1)

### What Works
- iOS/Android versions synchronized at 3.2.1 (build 14)
- Tests pass (652 tests, 13 skipped)
- Lint passes (ast-grep rules)
- Android release signing policy prevents debug keystore
- Java 17 auto-detection on macOS (homebrew + java_home)
- `npm run android` is portable

### What's Changed Since v3.2.1 Tag
The `android-release` branch contains Android hardening fixes:
- `android/app/build.gradle`: Release signing policy, keystore.properties support
- `scripts/run-android.js`: Portable Java 17 detection
- `scripts/verify-android-setup.js`: SDK discovery with precedence
- Policy tests: `android.releaseSigningPolicy.spec.ts`, `verifyAndroidSetup.spec.ts`, `runAndroidJavaHome.spec.ts`
- Docs: `ANDROID_RELEASE.md`, `INSTALL.md`, `COMMON-ISSUES.md`

### Gaps Identified
1. **CI has no Android build job** - Gradle errors won't surface until local dev
2. **v3.2.1 already tagged/released** - Cannot re-tag; must bump to v3.3.0
3. **CHANGELOG doesn't reflect Android changes** - Needs update

## Proposed Approach

### Option A: Minimal CI (Selected)
Add `./gradlew assembleDebug assembleRelease` to CI without full Android SDK setup.
- Pro: Simple, catches Gradle config errors
- Con: Won't catch NDK/native build issues on ubuntu-latest

### Option B: Full Android SDK CI
Use `setup-android` action with full SDK.
- Pro: Catches more issues
- Con: Slower, complex matrix, overkill for this app

### Option C: No CI changes
Ship v3.3.0 without CI improvements.
- Pro: Fast
- Con: Android regressions can slip through

**Decision**: Option A - Minimal CI with Gradle check. This catches the most common issues (build.gradle syntax, dependency resolution) without CI complexity.

## Architecture Changes

### CI Pipeline (Additive)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   test job      │    │  dns-native job │    │  android job    │ ← NEW
│  (lint + test)  │    │  (module tests) │    │  (gradle build) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `package.json` | Version bump | 3.2.1 → 3.3.0 |
| `app.json` | Version bump | 3.2.1 → 3.3.0 |
| `android/app/build.gradle` | Version bump | 3.2.1 → 3.3.0, versionCode 14 → 15 |
| `ios/.../project.pbxproj` | Version bump | 3.2.1 → 3.3.0, build 14 → 15 |
| `CHANGELOG.md` | Content | Add v3.3.0 section |
| `.github/workflows/ci.yml` | Content | Add android job |

## Phased Plan

### Phase 0: Discovery (Complete)
- [x] Verify version sync state
- [x] Review android-release branch changes
- [x] Identify CI gaps
- [x] Confirm v3.2.1 is already released

### Phase 1: Version Bump
- [x] Update `package.json` version to 3.3.0
- [x] Run `npm run sync-versions` to propagate
- [x] Verify all files updated correctly

**Acceptance**: `npm run sync-versions:dry` shows all files at 3.3.0

### Phase 2: CHANGELOG Update
- [x] Add v3.3.0 section to CHANGELOG.md
- [x] Document Android hardening changes
- [x] Document CI improvements

**Acceptance**: CHANGELOG has accurate v3.3.0 entry

### Phase 3: CI Enhancement
- [x] Add android job to `.github/workflows/ci.yml`
- [x] Configure Java 17 + Gradle for ubuntu-latest
- [x] Run assembleDebug + assembleRelease
- [x] Add test for CI configuration

**Acceptance**: `npm test` passes with CI test, local Gradle builds work

### Phase 4: Verification
- [x] Run `npm run lint`
- [x] Run `npm test`
- [x] Run `npm run sync-versions:dry` (should show no changes)
- [x] Run `./gradlew :app:assembleDebug` (local)
- [x] Run `./gradlew :app:assembleRelease` (local)

**Acceptance**: All checks pass, versions in sync

## Testing Strategy

### Unit Tests (Existing)
- `android.releaseSigningPolicy.spec.ts` - Signing policy
- `verifyAndroidSetup.spec.ts` - SDK discovery
- `runAndroidJavaHome.spec.ts` - Java 17 detection
- `repo.ci.spec.ts` - CI configuration validation

### New Tests
- Add CI test for android job existence

### Integration Tests
- Local Gradle builds (assembleDebug, assembleRelease)

## Observability

### Build Artifacts
- `android/app/build/outputs/apk/debug/app-debug.apk`
- `android/app/build/outputs/apk/release/app-release-unsigned.apk` (when no signing creds)

### CI Signals
- GitHub Actions workflow status
- Gradle build exit codes

## Rollout Plan

1. Complete all phases on `android-release` branch
2. Create PR to main with full verification
3. Merge after review
4. Tag v3.3.0
5. Create GitHub Release

## Rollback Plan

If v3.3.0 has issues:
- Revert merge commit
- Re-release v3.2.1 (already exists)
- No customer impact (store builds are manual)

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| CI android job flaky | Medium | Low | Gradle cache, single build variant |
| Java 17 not available in CI | Low | Medium | Use actions/setup-java |
| Version sync script bug | Low | High | Dry-run verification |
| Build signing misconfiguration | Low | Medium | Policy tests prevent regression |

## Open Questions

None - all blocking questions resolved. Proceeding with v3.3.0 bump.

## Success Metrics

- [x] All tests pass (652+)
- [x] Lint passes
- [x] Gradle debug build succeeds
- [x] Gradle release build succeeds (unsigned)
- [x] Versions synchronized across all configs
- [x] CI includes android job
- [x] CHANGELOG documents all changes

## Verification Notes (2026-01-04)

This plan was completed during the 3.3.0 release. The checklist reflects shipped work; this pass confirms the current repo state still includes the Android CI job and version sync behavior. Local Gradle builds were not re-run in this verification pass.

Evidence (2026-01-04):

    bun run lint
    Result: PASS

    bun run test
    Result: PASS (64 suites, 1 skipped, 702 tests)

    bun run sync-versions:dry
    Result: PASS (versions synchronized at 3.8.4 build 24)
