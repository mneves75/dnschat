# DNSChat Release Checklist

**Phase 6.3**
**Date:** 2025-10-03
**Status:** ✅ **IMPLEMENTED**

---

## Overview

This is the authoritative pre-flight checklist for DNSChat production releases. Use this document before every App Store/Play Store submission to ensure quality, compliance, and operational readiness.

**Checklist Philosophy:**
- **Gate releases on objective criteria** (test pass rates, performance metrics, crash-free rate)
- **Enforce compliance checks** (privacy, security, accessibility)
- **Validate monitoring & rollback readiness** before deployment
- **Document every release decision** for post-mortem analysis

**Target Audience:** Release managers, QA engineers, developers preparing production builds.

---

## Pre-Release Verification (T-7 days)

### 1. Code Quality & CI/CD

**CI Pipeline Health:**
- [ ] All GitHub Actions workflows passing on `main` branch
  - [ ] `ci.yml`: Unit tests, TypeScript checks, linting
  - [ ] `detox-e2e.yml`: End-to-end tests (iOS + Android)
  - [ ] `native-dns-module.yml`: Native module integration tests
- [ ] No failing tests in last 48 hours (check GitHub Actions history)
- [ ] No open Dependabot security alerts (critical/high severity)

**Code Review:**
- [ ] All PRs for this release have 1+ approvals
- [ ] No uncommitted changes in local workspace (`git status`)
- [ ] `CHANGELOG.md` updated with release notes (following keepachangelog.com)
- [ ] Version numbers synchronized across:
  - [ ] `package.json` (version field)
  - [ ] `app.json` (expo.version, ios.buildNumber, android.versionCode)
  - [ ] Native projects (verify with `npm run sync-versions:dry`)

**Dependency Audit:**
```bash
# Run security audit
npm audit --production

# Expected: 0 high/critical vulnerabilities
# If vulnerabilities exist: update deps or document risk acceptance
```

- [ ] `npm audit` shows 0 high/critical vulnerabilities (production deps only)
- [ ] All third-party SDKs updated to latest stable (Sentry, Expo modules)
- [ ] No beta/alpha dependencies in production build (check `package.json`)

---

### 2. Performance Validation

**Baseline Metrics (Target vs Actual):**

Run performance profiler on preview build:
```bash
# Build preview profile
eas build --profile preview --platform all

# Install on physical devices (iOS + Android)
eas build:run --profile preview --platform ios --latest
eas build:run --profile preview --platform android --latest

# Measure launch metrics (use expo-profile or manual stopwatch)
```

**Metrics Checklist:**

| Metric | Target | Actual (iOS) | Actual (Android) | Pass/Fail |
|--------|--------|--------------|------------------|-----------|
| **App Launch (TTI)** | p95 <2500ms | _______ | _______ | ☐ |
| **DNS Query (Native)** | p95 <500ms | _______ | _______ | ☐ |
| **DNS Query (DoH fallback)** | p95 <1000ms | _______ | _______ | ☐ |
| **Screen Navigation** | p95 <300ms | _______ | _______ | ☐ |
| **Message Rendering (50 msgs)** | p95 <150ms | _______ | _______ | ☐ |
| **FPS (ChatScreen)** | ≥58 fps | _______ | _______ | ☐ |
| **Bundle Size (iOS)** | <10 MB | _______ | N/A | ☐ |
| **APK Size (Android)** | <15 MB | N/A | _______ | ☐ |

**Performance Actions:**
- [ ] If any metric fails: investigate with React DevTools Profiler
- [ ] Compare against baseline (`.modernization/BASELINE_METRICS.md`)
- [ ] Document any performance regressions in CHANGELOG
- [ ] If >10% regression: delay release and optimize

**DNS Transport Validation:**
```bash
# Test all transports on preview build
# Use Settings → Transport Test buttons

# Expected results:
# ✅ Native DNS: Success (<300ms)
# ✅ UDP DNS: Success (<500ms)
# ✅ TCP DNS: Success (<800ms)
# ✅ DNS-over-HTTPS: Success (<1000ms)
```

- [ ] Native DNS transport succeeds on iOS + Android
- [ ] UDP/TCP fallback succeeds (test with VPN enabled to force fallback)
- [ ] DoH fallback succeeds (test with UDP/TCP blocked via network tools)
- [ ] Rate limiting triggers correctly (send >10 queries in 10 seconds)

---

### 3. Quality Assurance (Manual Testing)

**Test Environments:**
- [ ] iOS 17.0 (minimum supported version)
- [ ] iOS 18.x (latest stable)
- [ ] Android 13 (API 33 - minimum supported)
- [ ] Android 15 (API 35 - target API)

**Critical User Flows (iOS + Android):**

**3.1. Onboarding Flow:**
- [ ] App launches successfully (no white screen, no crash)
- [ ] Safe areas respected (no content under notch/navigation bar)
- [ ] Permissions requested correctly (none for DNSChat - DNS only)
- [ ] Liquid Glass effect renders on iOS 17+ (Settings screen)

**3.2. Chat Functionality:**
- [ ] Send message via DNS TXT query (enter domain, type message, send)
  - [ ] Message appears in chat list immediately
  - [ ] DNS query completes within 2 seconds
  - [ ] Fallback works if primary transport fails
- [ ] Receive message from DNS TXT response
  - [ ] Message displays with correct timestamp
  - [ ] Avatar/username rendered properly
- [ ] Message history persists (kill app, relaunch, verify messages still visible)
- [ ] Empty state shows when no messages (first launch)

**3.3. Settings & Configuration:**
- [ ] Transport Test buttons work (Native, UDP, TCP, DoH)
- [ ] Theme toggle works (light/dark mode, if implemented)
- [ ] Language selection works (if i18n enabled)
- [ ] About screen displays correct version number (matches app.json)

**3.4. Edge Cases:**
- [ ] Airplane mode: App shows graceful error (no crash)
- [ ] Slow network (use Network Link Conditioner): Spinner shows, timeout handled
- [ ] Invalid domain input: Error message displayed
- [ ] Background/foreground: App resumes correctly (no state loss)
- [ ] Deep link (if supported): Opens correct screen

**3.5. Accessibility:**
- [ ] VoiceOver (iOS) / TalkBack (Android) reads all UI elements
- [ ] Font scaling: UI doesn't break at 200% text size
- [ ] Contrast ratio: All text meets WCAG AA (4.5:1 minimum)
- [ ] Interactive elements: Minimum 44×44 pt tap targets

**Platform-Specific Checks:**

**iOS:**
- [ ] Dynamic Island (iPhone 14 Pro+): No overlap with UI
- [ ] StandBy Mode (iOS 17+): App handles lock screen correctly
- [ ] Widgets (if implemented): Display correct data
- [ ] Handoff (if supported): Continues activity on Mac/iPad

**Android:**
- [ ] Material You theming: Colors adapt to wallpaper (Android 12+)
- [ ] Edge-to-edge: Content draws behind system bars correctly
- [ ] Predictive back gesture (Android 14+): Animation smooth
- [ ] App shortcuts (if implemented): Launch correct screens

---

### 4. Compliance & Privacy

**Apple Privacy Manifest (iOS):**
- [ ] `ios/DNSChat/PrivacyInfo.xcprivacy` exists and validates
  - Run: `plutil -lint ios/DNSChat/PrivacyInfo.xcprivacy`
  - Expected: "OK"
- [ ] UserDefaults API documented with reason CA92.1
- [ ] NSPrivacyTracking set to `false` (no user tracking)
- [ ] NSPrivacyTrackingDomains is empty array
- [ ] No required reason APIs used without declaration

**App Tracking Transparency (ATT):**
- [ ] Confirmed: DNSChat does NOT track users (no ATT prompt)
- [ ] No NSUserTrackingUsageDescription in Info.plist
- [ ] No IDFA usage (verify with `grep -r advertisingIdentifier ios/`)

**Google Play Data Safety:**
- [ ] Play Console Data Safety form filled out (see `.modernization/PRIVACY_COMPLIANCE.md`)
- [ ] Data types declared:
  - [ ] Messages and user content (stored locally only, not shared)
  - [ ] App activity (crash logs via Sentry)
  - [ ] App info and performance (diagnostics)
- [ ] Data sharing: "No, we don't share data with third parties"
- [ ] Data security: "Data is encrypted in transit" (DNS-over-HTTPS)

**Third-Party SDK Audit:**
- [ ] Sentry configured with PII stripping (`.modernization/SENTRY_OBSERVABILITY.md`)
  - [ ] beforeSend hook removes cookies, auth headers
  - [ ] tracesSampleRate: 0.1 (not 1.0)
  - [ ] No user email/phone collected
- [ ] AsyncStorage: Only app-local data (no cloud sync)
- [ ] No analytics/tracking SDKs installed (verify `package.json`)

---

## App Store / Play Store Submission (T-3 days)

### 5. Build Preparation

**Version Bump & Tagging:**
```bash
# 1. Update version in app.json (e.g., 2.0.2 → 2.0.3)
# 2. Sync across all files
npm run sync-versions  # (remove --dry-run after verification)

# 3. Update CHANGELOG.md
# Add release notes under [2.0.3] - 2025-10-03

# 4. Commit version bump
git add -A
git commit -m "chore: bump version to 2.0.3"

# 5. Create git tag
git tag v2.0.3 -m "Release 2.0.3: [Brief summary]"
git push origin main
git push origin v2.0.3
```

**Checklist:**
- [ ] Version bumped in `app.json` (expo.version, ios.buildNumber, android.versionCode)
- [ ] `npm run sync-versions` executed (no drift between files)
- [ ] CHANGELOG.md updated with release notes
- [ ] Git tag created (`v2.0.3`) and pushed to origin
- [ ] Sentry release automation triggered (check `.github/workflows/sentry-release.yml` logs)

**EAS Build (Production Profile):**
```bash
# Build for both platforms
eas build --profile production --platform all

# Monitor build progress
# iOS: ~15-20 minutes
# Android: ~10-15 minutes

# Expected output:
# ✅ Build complete: <build-url>
# ✅ dSYM uploaded (iOS)
# ✅ Source maps uploaded (Sentry)
```

**Build Validation:**
- [ ] EAS build succeeds (no errors in logs)
- [ ] iOS build includes dSYM files (for crash symbolication)
- [ ] Android build targets API 35 (verify in build logs)
- [ ] Source maps uploaded to Sentry (check Sentry → Settings → Releases)
- [ ] Build size within limits (iOS <200 MB, Android <100 MB for OBB+APK)

---

### 6. App Store Connect (iOS)

**Submission Checklist:**
```bash
# Submit to App Store Connect
eas submit --profile production --platform ios

# Or manually upload via Xcode/Transporter
```

**App Store Connect Steps:**
- [ ] Build uploaded to App Store Connect
- [ ] TestFlight: Build appears in "Builds" (wait ~5 min for processing)
- [ ] Version info:
  - [ ] Version: 2.0.3
  - [ ] Build: Auto-incremented (e.g., 20250003)
- [ ] App Information:
  - [ ] Screenshots updated (if UI changed)
  - [ ] What's New: Copy from CHANGELOG.md
  - [ ] Keywords: Verified (if applicable)
  - [ ] Support URL: Up to date
  - [ ] Privacy Policy URL: Verified (if required)
- [ ] Pricing & Availability:
  - [ ] Countries/regions: Verified
  - [ ] Price tier: Confirmed (free for DNSChat)
- [ ] App Privacy:
  - [ ] Privacy manifest detected automatically (iOS 17+)
  - [ ] Privacy Nutrition Label: Verified matches privacy manifest
- [ ] Phased Release:
  - [ ] ✅ ENABLED: "Release this version over 7 days"
  - [ ] ❌ Automatic updates: OFF (manual control)

**Review Submission:**
- [ ] "Submit for Review" clicked
- [ ] Export Compliance: "No encryption" (or CCATS if applicable)
- [ ] Advertising Identifier (IDFA): "No, we don't use IDFA"
- [ ] Content Rights: Verified all content is owned/licensed

**Expected Timeline:**
- [ ] In Review: 24-48 hours
- [ ] Approved: Ready for release
- [ ] Phased Release starts: Day 0 at 10%

---

### 7. Google Play Console (Android)

**Submission Checklist:**
```bash
# Submit to Google Play
eas submit --profile production --platform android

# Or manually upload via Play Console
```

**Play Console Steps:**
- [ ] Build uploaded to Production track
- [ ] Release details:
  - [ ] Release name: 2.0.3 (1234) [auto-generated versionCode]
  - [ ] Release notes: Copy from CHANGELOG.md (multi-language if supported)
- [ ] Countries/regions: All countries (or restricted list)
- [ ] App content:
  - [ ] Target age: Everyone / Teen (select appropriate)
  - [ ] Content rating: ESRB E (Everyone) or equivalent
  - [ ] Ads: "No, my app doesn't contain ads"
- [ ] Data safety:
  - [ ] Form completed (see `.modernization/PRIVACY_COMPLIANCE.md`)
  - [ ] Privacy policy URL: Added (if required)
- [ ] Staged Rollout:
  - [ ] ✅ ENABLED: "Release to 10% of users"
  - [ ] Monitor for 24h before increasing

**Review Submission:**
- [ ] "Send for review" clicked (or "Start rollout to Production")
- [ ] App bundle size verified (<150 MB for AAB)
- [ ] Target API: 35 (mandatory for new uploads after Aug 31, 2025)

**Expected Timeline:**
- [ ] In Review: 1-3 days (usually faster than Apple)
- [ ] Published: Live to 10% of users immediately
- [ ] Monitor 24h, then increase to 50%, then 100%

---

## Post-Release Monitoring (T+7 days)

### 8. Release Health Tracking

**Sentry Monitoring (First 24 Hours):**
```bash
# Open Sentry dashboard
open https://sentry.io/organizations/<org>/releases/<version>/

# Check metrics hourly for first 6 hours, then daily
```

**Sentry Checklist:**
- [ ] Crash-free sessions: >99.5% (target)
  - [ ] Actual: _______ (record at T+1h, T+6h, T+24h)
- [ ] Crash-free users: >99%
  - [ ] Actual: _______ (record at T+1h, T+6h, T+24h)
- [ ] New error types: <5 in 24 hours
  - [ ] Actual: _______ (investigate any new errors immediately)
- [ ] Performance (p95 latency):
  - [ ] App Launch: <2500ms → Actual: _______
  - [ ] DNS Query: <800ms → Actual: _______

**Alert Response (If Metrics Fail):**
| Alert Condition | Severity | Response Time | Action |
|-----------------|----------|---------------|--------|
| Crash-free sessions <99% | 🔴 Critical | <15 min | Initiate rollback procedure (see `.modernization/RELEASE_WORKFLOW.md`) |
| New error >10 events/hour | 🟠 High | <1 hour | Investigate, prepare hotfix if needed |
| Performance regression >2x baseline | 🟡 Medium | <4 hours | Profile, optimize in next release |

**Rollback Decision:**
- [ ] If crash-free sessions <99% for >1 hour → **ROLLBACK IMMEDIATELY**
- [ ] If new critical error affects >5% users → **ROLLBACK IMMEDIATELY**
- [ ] If moderate issues → Monitor for 6 hours, decide on hotfix vs rollback

**Rollback Procedure (Emergency):**
```bash
# See .modernization/RELEASE_WORKFLOW.md for full procedure

# Step 1: List recent updates
eas update:list --branch production

# Step 2: Rollback to last stable OTA (if JS-only issue)
eas update:republish --update-id <stable-id> --branch production --message "Rollback: Revert to 2.0.2"

# Step 3: If native crash → Pause App Store phased release
# App Store Connect → Pricing and Availability → Pause Phased Release

# Step 4: Communicate to users
# Post to status page, Twitter, support channels
```

---

### 9. App Store / Play Store Metrics

**App Store Connect (iOS):**
- [ ] Phased release progress:
  - [ ] Day 1: 10% rollout → Crash rate _______ (target <0.5%)
  - [ ] Day 3: 50% rollout → Crash rate _______ (target <0.5%)
  - [ ] Day 7: 100% rollout → Crash rate _______ (target <0.5%)
- [ ] Ratings & Reviews:
  - [ ] Average rating: _______ (target >4.0)
  - [ ] New 1-star reviews: _______ (target <5 in 24h)
  - [ ] Respond to negative reviews within 24h
- [ ] Adoption rate:
  - [ ] Day 3: _______% on latest version (target >50%)
  - [ ] Day 7: _______% on latest version (target >80%)

**Google Play Console (Android):**
- [ ] Staged rollout progress:
  - [ ] Day 1: 10% rollout → ANR rate _______ (target <0.5%)
  - [ ] Day 3: 50% rollout → ANR rate _______ (target <0.5%)
  - [ ] Day 7: 100% rollout → ANR rate _______ (target <0.5%)
- [ ] Pre-launch report: All tests passed (Play Console auto-tests on devices)
- [ ] Ratings & Reviews:
  - [ ] Average rating: _______ (target >4.0)
  - [ ] Respond to reviews mentioning crashes/bugs within 24h

---

### 10. User Feedback & Support

**Support Channels Monitoring:**
- [ ] Email support (mvneves75@gmail.com): Check daily for first 7 days
- [ ] GitHub Issues: Monitor for new bug reports
- [ ] Twitter/Social media: Search for "@DNSChat crash" or similar

**Common Issues to Watch For:**
- [ ] "App crashes on launch" → Check Sentry for launch-time errors
- [ ] "Messages not sending" → Verify DNS transport status (could be ISP blocking)
- [ ] "UI looks broken" → Check for iOS/Android version-specific layout issues
- [ ] "Battery drain" → Investigate background DNS polling (should be minimal)

**Response Templates:**
```markdown
# Template 1: Crash Report
"Thanks for reporting! We've identified the issue and are working on a fix.
Expected resolution: [24h for hotfix / next release for minor bugs].
In the meantime, try [workaround if available]."

# Template 2: DNS Query Failing
"DNS queries may be blocked by your network/VPN. DNSChat will automatically
fall back to TCP/DoH. Try toggling Transport Test in Settings to verify."

# Template 3: General Bug
"Appreciate the report! We've logged this as issue #[number].
You can track progress at [GitHub issue URL]."
```

---

## Emergency Procedures

### 11. Hotfix Deployment (Critical Bugs)

**When to Deploy Hotfix:**
- [ ] Crash affects >5% of users
- [ ] Data loss or privacy breach
- [ ] Compliance violation (e.g., privacy manifest incorrect)
- [ ] Security vulnerability (e.g., DNS spoofing)

**Hotfix Process (Fast Track):**
```bash
# 1. Create hotfix branch
git checkout -b hotfix/2.0.3-1

# 2. Fix bug (minimal changes only)
# Edit affected files...

# 3. Test locally
npm run ios
npm run android

# 4. Run e2e tests
npm run test:detox -- --configuration ios.sim.release
npm run test:detox -- --configuration android.emu.release

# 5. Bump version (2.0.3 → 2.0.3-1 or 2.0.4)
npm run sync-versions

# 6. Commit and tag
git add -A
git commit -m "fix: [brief description] (hotfix)"
git tag v2.0.3-1
git push origin hotfix/2.0.3-1
git push origin v2.0.3-1

# 7. Build and submit
eas build --profile production --platform all
eas submit --profile production --platform all
```

**Apple Expedited Review (iOS):**
- [ ] App Store Connect → App Review → "Request Expedited Review"
- [ ] Justification: "Critical bug causing crashes affecting [X]% of users. Immediate fix required to prevent data loss/privacy issue."
- [ ] Expected approval: 2-4 hours (vs 24-48 hours standard)

**Android Immediate Release:**
- [ ] Play Console: Submit hotfix, select "Full rollout" (skip staged rollout for critical fixes)
- [ ] Expected live time: 1-3 hours after submission

---

### 12. OTA Hotfix (JavaScript-Only Bugs)

**When OTA is Appropriate:**
- [ ] Bug is in JavaScript/React code (no native module changes)
- [ ] No version bump required
- [ ] No App Store/Play Store re-submission needed

**OTA Deployment:**
```bash
# 1. Test fix on preview channel first
eas update --branch preview --message "Hotfix: [description]"

# 2. Verify on preview build (wait 30 min for soak test)
eas build:run --profile preview --platform ios --latest

# 3. Deploy to production
eas update --branch production --message "Hotfix 2.0.3-ota-1: [description]"

# 4. Monitor Sentry for next 1 hour
# Check crash rate, error rate

# 5. If OTA causes issues → Rollback immediately
eas update:list --branch production
eas update:republish --update-id <previous-stable-id> --branch production --message "Rollback: Revert OTA hotfix"
```

**OTA Limitations (DO NOT use OTA for):**
- ❌ Native module changes (`modules/dns-native`)
- ❌ iOS/Android permissions changes
- ❌ app.json version bump
- ❌ Privacy manifest updates
- ❌ Build settings changes (Xcode, Gradle)

---

## Sign-Off & Documentation

### 13. Release Sign-Off

**Final Checklist (Before Marking Release Complete):**
- [ ] All quality gates passed (CI, manual QA, performance)
- [ ] App Store + Play Store approved and live
- [ ] Sentry metrics healthy for 7 days (crash-free >99.5%)
- [ ] No critical user-reported issues
- [ ] Adoption rate >80% (Day 7)
- [ ] CHANGELOG.md reflects actual release date
- [ ] Post-mortem document created (if issues occurred)

**Sign-Off:**
```
Release: v2.0.3
Date: 2025-10-03
Released by: [Your Name]
Approved by: [Manager/CTO]

Summary:
- Changes: [Brief summary from CHANGELOG]
- Issues encountered: [None / List issues]
- Rollbacks: [None / Describe rollback events]
- Lessons learned: [Key takeaways]

Overall Status: ✅ SUCCESS / ⚠️ SUCCESS WITH ISSUES / ❌ FAILED
```

**Post-Release Documentation:**
- [ ] Create release retrospective doc (`.modernization/RETROSPECTIVES/v2.0.3.md`)
- [ ] Update known issues list (if any bugs deferred to next release)
- [ ] File GitHub issues for follow-up work
- [ ] Update roadmap with next planned release

---

## References

- **EAS Build & Update:** [RELEASE_WORKFLOW.md](./.modernization/RELEASE_WORKFLOW.md)
- **Privacy Compliance:** [PRIVACY_COMPLIANCE.md](./.modernization/PRIVACY_COMPLIANCE.md)
- **Sentry Monitoring:** [SENTRY_OBSERVABILITY.md](./.modernization/SENTRY_OBSERVABILITY.md)
- **Detox E2E Testing:** [DETOX_SETUP.md](./.modernization/DETOX_SETUP.md)
- **Performance Baselines:** [BASELINE_METRICS.md](./.modernization/BASELINE_METRICS.md)

---

## Appendix: Checklist Template (Copy for Each Release)

**Release Version:** _______
**Target Release Date:** _______
**Release Manager:** _______

### Quick Status

| Phase | Status | Blocker (if any) |
|-------|--------|------------------|
| ☐ Pre-Release Verification | ⏳ | |
| ☐ App Store Submission | ⏳ | |
| ☐ Play Store Submission | ⏳ | |
| ☐ Post-Release Monitoring (24h) | ⏳ | |
| ☐ Post-Release Monitoring (7d) | ⏳ | |
| ☐ Release Sign-Off | ⏳ | |

**Notes:**
[Add any release-specific notes, risks, or dependencies here]

---

**Status:** Phase 6.3 complete. Comprehensive release checklist created covering all stages from pre-release to sign-off.
**Next:** Phase 6.4 (Team training documentation).
