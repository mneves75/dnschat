# Open Questions - Modernization Plan

**Last updated:** 2025-10-03
**Status:** Phase 0 - Safeguards Complete

## Phase 1: Toolchain Hardening

### Q1.1: Node.js version enforcement strategy
- **Question:** Should we enforce exact Node 20.19.x or allow any 20.x LTS?
- **Context:** `.nvmrc` will pin version, but `package.json` engines field allows range
- **Options:**
  - Strict: `"node": "20.19.0"` (exact match)
  - Flexible: `"node": ">=20.19.0 <21"` (current approach)
- **Decision needed by:** Phase 1.1
- **Owner:** TBD

### Q1.2: CI/CD platform selection
- **Question:** Which CI platform should enforce version checks?
- **Context:** Currently no CI defined in repo
- **Options:**
  - GitHub Actions (most common for React Native)
  - GitLab CI
  - Bitbucket Pipelines
  - EAS Build exclusively
- **Decision needed by:** Phase 1.4
- **Owner:** TBD

### Q1.3: Java 17 distribution
- **Question:** Which Java 17 distribution should be documented?
- **Context:** OpenJDK, Azul Zulu, Eclipse Temurin all viable
- **Current:** Homebrew `openjdk@17` on macOS
- **Decision needed by:** Phase 1.3
- **Owner:** TBD

## Phase 2: Fabric Alignment

### Q2.1: Fabric rollout timeline
- **Question:** Enable Fabric on iOS immediately or staged rollout?
- **Context:** Android already on Fabric, iOS on Paper (legacy)
- **Risks:**
  - Native module compatibility (dns-native, LiquidGlassNative)
  - Breaking changes in layout/styling
  - Performance regression during transition
- **Options:**
  - Immediate: Flip Podfile flag, full regression test
  - Staged: Feature flag with gradual user rollout
  - Delayed: Wait for native module validation
- **Decision needed by:** Phase 2.1
- **Owner:** TBD
- **Blockers:** Phase 2.2 test results

### Q2.2: TurboModules migration path
- **Question:** Should we migrate native modules to TurboModule spec now or defer?
- **Context:** Current modules use legacy NativeModules pattern
- **Trade-offs:**
  - Now: Better performance, future-proof, but more work
  - Defer: Lower risk, revisit in next major version
- **Decision needed by:** Phase 2.3
- **Owner:** TBD

### Q2.3: Bridgeless mode readiness
- **Question:** Is the codebase ready for bridgeless React Native?
- **Context:** RN 0.81+ supports bridgeless, but requires TurboModules
- **Decision needed by:** Phase 2.3
- **Owner:** TBD

## Phase 3: Performance Profiling

### Q3.1: Profiling tool selection
- **Question:** Which profiling tools should be standardized?
- **Options:**
  - Expo: expo-profile, expo-dev-client performance overlay
  - React Native: React DevTools Profiler
  - Platform: Xcode Instruments, Android Profiler
  - Third-party: Flipper (deprecated), Reactotron
- **Decision needed by:** Phase 3.1
- **Owner:** TBD

### Q3.2: FlashList adoption scope
- **Question:** Replace FlatList globally or selectively?
- **Context:** FlashList claims 10x performance improvement
- **Evaluation criteria:**
  - Message list performance (primary use case)
  - Contact list performance
  - Bundle size impact
  - Migration effort
- **Decision needed by:** Phase 3.3
- **Owner:** TBD

### Q3.3: Performance SLO targets
- **Question:** What are acceptable performance thresholds?
- **Proposed targets:**
  - TTI (Time to Interactive): <2s on mid-range devices
  - FPS: 60fps sustained on chat screen
  - Memory: <150MB peak on iOS, <200MB on Android
  - Bundle size: <5MB JS bundle (uncompressed)
- **Decision needed by:** Phase 3.4
- **Owner:** TBD

## Phase 4: Testing Automation

### Q4.1: E2E framework choice
- **Question:** Detox vs Maestro for mobile e2e tests?
- **Comparison:**
  - **Detox:** Mature, gray-box, React Native aware, requires native config
  - **Maestro:** Simple YAML, black-box, cloud-friendly, less RN integration
- **Repo status:** Detox partially configured (`package.json`, no tests)
- **Decision needed by:** Phase 4.1
- **Owner:** TBD

### Q4.2: Test coverage targets
- **Question:** What test coverage is required for PR gating?
- **Current:** No unit tests, no e2e tests
- **Proposed:**
  - Unit: 60% coverage (business logic, services)
  - E2E: Critical user flows (login, send message, settings)
- **Decision needed by:** Phase 4.4
- **Owner:** TBD

### Q4.3: Device/emulator matrix
- **Question:** Which devices/OS versions to test?
- **Proposed matrix:**
  - iOS: 17.0 (minimum), 18.0 (latest), Simulator + real device
  - Android: API 31 (minimum), API 35 (target), Emulator + real device
- **Decision needed by:** Phase 4.2
- **Owner:** TBD

## Phase 5: Compliance & Observability

### Q5.1: App Tracking Transparency (ATT) stance
- **Question:** Does DNSChat request IDFA or track users?
- **Current:** No analytics/tracking dependencies found in `package.json`
- **Implication:** Likely no ATT prompt needed, but audit Sentry config
- **Decision needed by:** Phase 5.2
- **Owner:** TBD

### Q5.2: Privacy manifest API declarations
- **Question:** Which APIs require PrivacyInfo.xcprivacy entries?
- **Context:** Apple deadline Jan 31, 2026 for required reason APIs
- **Candidates:**
  - File timestamp APIs (if used)
  - System boot time (if used)
  - Disk space APIs (if used)
  - User defaults (AsyncStorage likely wrapped)
- **Decision needed by:** Phase 5.1
- **Owner:** TBD

### Q5.3: Sentry release automation
- **Question:** Should Sentry releases be created on every EAS build or just production?
- **Options:**
  - All builds: Better dev debugging, more noise
  - Production only: Cleaner Sentry UI, delayed error context
- **Decision needed by:** Phase 5.4
- **Owner:** TBD

## Phase 6: Release Hardening

### Q6.1: OTA update strategy
- **Question:** When to use OTA vs native app update?
- **Policy proposal:**
  - OTA: JS-only changes, hotfixes, feature flags
  - Native: Version bumps, native module changes, major features
- **Decision needed by:** Phase 6.2
- **Owner:** TBD

### Q6.2: EAS channel promotion flow
- **Question:** How long should builds stay in each channel?
- **Proposed:**
  - `development`: Immediate dev testing (0-1 day)
  - `preview`: Internal QA + stakeholder review (2-5 days)
  - `production`: Staged rollout (10% → 50% → 100% over 1 week)
- **Decision needed by:** Phase 6.1
- **Owner:** TBD

### Q6.3: Rollback procedures
- **Question:** What triggers a production rollback?
- **Criteria proposal:**
  - Crash rate >5% on new version
  - Critical bug affecting core feature (DNS, messaging)
  - Negative user feedback threshold
- **Decision needed by:** Phase 6.2
- **Owner:** TBD

## Cross-Cutting Concerns

### QX.1: Documentation maintenance
- **Question:** How to keep docs synchronized across CLAUDE.md, README.md, TECH_REVIEW.md, PLAN_MODERNIZATION.md?
- **Proposal:** Single source of truth per topic, cross-linking others
- **Decision needed by:** Phase 1.5
- **Owner:** TBD

### QX.2: Changelog conventions
- **Question:** Adopt Keep a Changelog format strictly or custom?
- **Current:** CHANGELOG.md exists, format TBD
- **Decision needed by:** Phase 6.3
- **Owner:** TBD

---

## Decision Log

_Decisions will be moved here once resolved, with rationale and date._

### Example (template)
**[Q1.1] Node.js version enforcement** - _Resolved 2025-10-XX_
**Decision:** Flexible range `>=20.19.0 <21`
**Rationale:** Balances stability with patch update flexibility
**Owner:** @username
