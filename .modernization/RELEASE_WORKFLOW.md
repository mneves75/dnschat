# Release Workflow & OTA Management

**Phase 6.1-6.2**
**Date:** 2025-10-03
**Status:** ✅ **IMPLEMENTED**

---

## Overview

This document describes DNSChat's complete release workflow using EAS Build and EAS Update for staged rollouts, over-the-air (OTA) updates, and emergency rollbacks.

**Key Concepts:**
- **EAS Build:** Creates native app binaries (.ipa for iOS, .apk/.aab for Android)
- **EAS Update:** Delivers JavaScript/asset OTA updates without app store approval
- **Channels:** Logical deployment targets (development, preview, production)
- **Staged Rollout:** Gradual deployment to minimize blast radius

---

## EAS Channel Strategy (Phase 6.1)

### Channel Configuration

**File:** `eas.json` (lines 60-71)

```json
{
  "update": {
    "development": {
      "channel": "development"
    },
    "preview": {
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

### Channel Purposes

| Channel | Purpose | Audience | Update Frequency |
|---------|---------|----------|------------------|
| **development** | Active development, rapid iteration | Developers only | Multiple times per day |
| **preview** | Internal testing, QA, stakeholder review | Team + beta testers | Daily or as needed |
| **production** | Live users, stable releases | All users | Weekly or biweekly |

### Channel Promotion Flow

```
[Development]
     ↓
  Testing + QA
     ↓
 [Preview]
     ↓
  Soak test (24-48 hours)
     ↓
 [Production] → 10% rollout → 50% rollout → 100% rollout
```

---

## Build & Deployment Process

### 1. Development Channel

**Purpose:** Rapid iteration for active features

**Build Command:**
```bash
# Create development build (Debug config, dev client)
eas build --profile development --platform all

# Install on test devices
eas build:run --profile development --platform ios
```

**OTA Update:**
```bash
# Publish JS-only changes to development channel
eas update --branch development --message "Feature: Add DNS query caching"
```

**Typical Use Cases:**
- New feature development
- Bug fixes in progress
- Experimental changes
- Performance profiling

**Distribution:**
- Internal only (team devices)
- No App Store/Play Store submission

---

### 2. Preview Channel

**Purpose:** Pre-production testing with full release configuration

**Build Command:**
```bash
# Create preview build (Release config, internal distribution)
eas build --profile preview --platform all

# Share with testers via TestFlight/Internal Testing
eas submit --profile preview
```

**OTA Update:**
```bash
# Publish to preview channel for beta testers
eas update --branch preview --message "RC 2.0.2: Fixed rate limit bug"
```

**Testing Checklist:**
- [ ] All e2e tests pass (GitHub Actions)
- [ ] Manual QA on iOS + Android
- [ ] Performance metrics meet targets (TTI <2s, FPS ≥58)
- [ ] Sentry shows no new crash patterns
- [ ] DNS query success rate >95% across all transports
- [ ] Stakeholder approval obtained

**Soak Period:** 24-48 hours minimum

**Distribution:**
- TestFlight (iOS): Up to 10,000 beta testers
- Internal Testing (Android): Up to 100 testers
- Invited stakeholders

---

### 3. Production Channel (Staged Rollout)

**Purpose:** Live user deployment with controlled rollout

**Build Command:**
```bash
# Create production build (Release config, store distribution)
eas build --profile production --platform all

# Submit to App Store + Play Store
eas submit --profile production --platform all
```

**OTA Update (Emergency Hotfix):**
```bash
# Publish critical JS-only fix to production
eas update --branch production --message "Hotfix 2.0.2-1: Fix DNS timeout error"
```

**Staged Rollout Strategy:**

**Phase 1: 10% Rollout (Day 0-1)**
```bash
# App Store Connect:
# 1. Submit build for review
# 2. After approval: Release → Phased Release (automatic 10%)

# Or manual OTA rollout:
eas update --branch production --message "Release 2.0.2" --rollout-percentage 10
```

**Monitoring (24 hours):**
- Sentry crash-free sessions: Target >99.5%
- Sentry error rate: <5 new errors per day
- App Store ratings: No 1-star reviews mentioning crashes
- DNS query success rate: >95%

**Phase 2: 50% Rollout (Day 1-3)**
```bash
# App Store Connect: Increase phased release percentage
# Or update OTA rollout:
eas update --branch production --message "Release 2.0.2" --rollout-percentage 50
```

**Monitoring (48 hours):**
- Same metrics as Phase 1
- User feedback via support channels
- Performance metrics (p95 latency stable)

**Phase 3: 100% Rollout (Day 3-7)**
```bash
# App Store Connect: Complete phased release
# Or full OTA rollout:
eas update --branch production --message "Release 2.0.2" --rollout-percentage 100
```

**Final Monitoring (1 week):**
- Adoption rate: Target >80% within 7 days
- No critical issues reported
- Sentry metrics stable

---

## OTA Update Types

### When to Use OTA (JavaScript-Only Changes)

✅ **Safe for OTA:**
- Bug fixes in JS code
- UI text changes, styling updates
- Feature flags toggle
- Analytics/tracking config changes
- Minor logic changes (no native module involvement)

**Example:**
```bash
# Fix: Typo in chat input placeholder
eas update --branch production --message "Fix: Correct placeholder text"
```

### When NOT to Use OTA (Native Changes Required)

❌ **Requires New Build:**
- Native module changes (`modules/dns-native/`)
- iOS/Android permissions changes
- `app.json` version bump
- New native dependencies added
- Xcode project changes (build settings, entitlements)
- Privacy manifest changes (`PrivacyInfo.xcprivacy`)

**Example:**
```bash
# Requires full build + App Store submission
git tag v2.1.0
git push origin v2.1.0
eas build --profile production --platform all
```

---

## OTA Rollback Procedure (Phase 6.2)

### Scenario 1: Buggy OTA Update Deployed

**Symptoms:**
- Sentry crash rate spikes after OTA publish
- Users report app crashes or broken functionality
- Error rate >10 new errors in 1 hour

**Immediate Action (5 minutes):**

**Step 1: Identify bad update:**
```bash
# List recent updates on production channel
eas update:list --branch production

# Example output:
# ID: abc123, Message: "Hotfix 2.0.2-1", Created: 2025-10-03 14:30
# ID: def456, Message: "Release 2.0.2", Created: 2025-10-02 10:00
```

**Step 2: VERIFY the update ID before rollback:**
```bash
# Inspect the update details to confirm it's the correct stable version
eas update:view --update-id def456

# Verify:
# ✅ Message: "Release 2.0.2" (NOT the buggy 2.0.3)
# ✅ Created date: Before the incident (e.g., 2025-10-02 10:00)
# ✅ No associated errors in Sentry for this update ID

# Check Sentry for this version (optional but recommended)
# Note: Replace <org> with your Sentry organization slug (e.g., mneves75)
open https://sentry.io/organizations/<org>/releases/2.0.2/
# Confirm: Crash-free sessions >99.5%, no critical errors
```

**Step 3: Execute rollback:**
```bash
# Publish previous stable update (def456) as new update
eas update:republish --update-id def456 --branch production --message "Rollback: Revert to 2.0.2"

# Or: Manually publish last known good code
git checkout v2.0.2
eas update --branch production --message "Rollback: Revert to stable 2.0.2"
```

**Step 4: Verify rollback:**
- Check Sentry: Error rate should drop within 15 minutes
- Test on device: Download latest update, verify functionality
- Monitor: Watch for 1 hour to confirm stability

**Step 4: Post-mortem:**
- Document what went wrong (INCIDENT_REPORTS/)
- Fix bug locally
- Test thoroughly (e2e + manual QA)
- Re-deploy with new version tag

### Scenario 2: Native Build Causes Crashes

**Symptoms:**
- App Store build (not OTA) causing crashes
- Crash rate >5% within 24 hours of release
- Affects specific iOS/Android version

**Immediate Action (30 minutes):**

**Step 1: Stop rollout (if staged):**
```bash
# App Store Connect (iOS):
# 1. App Store → Pricing and Availability
# 2. Pause Phased Release

# Play Console (Android):
# 1. Production → Releases
# 2. Halt rollout at current percentage
```

**Step 2: Assess blast radius:**
```bash
# Check affected users
# Sentry → Releases → v2.0.2 → Affected Users count
```

**Step 3: Communicate:**
```markdown
# Post to status page / Twitter / support channels:
"We've identified an issue affecting DNSChat v2.0.2 on iOS.
We've paused the rollout and are working on a fix.
Affected users: please downgrade to v2.0.1 or wait for v2.0.3."
```

**Step 4: Deploy hotfix:**
```bash
# Fix bug locally
git checkout -b hotfix/2.0.3

# Make fix (native code change)
# Bump version to 2.0.3 in app.json

# Build and submit emergency release
git tag v2.0.3
eas build --profile production --platform all
eas submit --profile production --platform all

# Request expedited review (Apple):
# App Store Connect → App Review → Request Expedited Review
# Justification: "Critical bug causing crashes for users"
```

**Step 5: Resume rollout (after approval):**
```bash
# App Store Connect: Resume phased release at 10%
# Monitor closely for 24 hours before increasing to 50%
```

---

## Rollback Decision Matrix

| Scenario | Rollback Method | Timeframe | Approval Required |
|----------|----------------|-----------|-------------------|
| OTA bug (non-critical) | Re-publish stable OTA | <15 min | Developer |
| OTA bug (critical, <10% users) | Re-publish + Sentry alert | <5 min | Developer |
| OTA bug (critical, >50% users) | Re-publish + public comms | <5 min | Manager approval |
| Native build crash (<5% users) | Pause rollout + hotfix | <30 min | Manager approval |
| Native build crash (>5% users) | Stop rollout + emergency hotfix | <15 min | CTO/CEO approval |
| Compliance issue (privacy, security) | Immediate takedown | <10 min | Legal + CTO approval |

---

## Testing OTA Updates Locally

### 1. Install Build with Specific Channel

```bash
# Install preview build (linked to preview channel)
eas build:run --profile preview --platform ios --latest
```

### 2. Publish OTA Update

```bash
# Publish test update to preview channel
eas update --branch preview --message "Test: Verify OTA update flow"
```

### 3. Verify Update Downloaded

**In app:**
- Kill app completely (swipe up)
- Relaunch app
- Check logs for "Downloading update..." (if Expo dev client)

**Or check programmatically:**
```typescript
import * as Updates from 'expo-updates';

async function checkForUpdates() {
  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();  // Restart with new update
  }
}
```

---

## Monitoring Post-Release

### Metrics to Track (First 24 Hours)

| Metric | Tool | Target | Alert Threshold |
|--------|------|--------|-----------------|
| Crash-free sessions | Sentry | >99.5% | <99% |
| Crash-free users | Sentry | >99% | <98% |
| New error types | Sentry | <5 | >10 |
| App Store rating | App Store Connect | >4.0 | <3.5 |
| DNS query success rate | Sentry custom metric | >95% | <90% |
| User-reported issues | Support email | <10 | >20 |

### Automated Alerts

**Sentry Alert (Critical Error Spike):**
```
Condition: Error count >10 in 10 minutes
Environment: production
Action: Slack #dnschat-alerts + Email mvneves75@gmail.com
```

**App Store Review Alert (Negative Spike):**
```
Condition: >5 one-star reviews in 24 hours
Action: Email team + Review rollback decision
```

---

## Best Practices

### DO

✅ **Always test OTA updates on preview channel first:**
```bash
# 1. Publish to preview
eas update --branch preview --message "Test: Rate limit fix"

# 2. Test on preview build
# 3. If stable for 24h, promote to production
eas update --branch production --message "Fix: Rate limit calculation"
```

✅ **Use descriptive update messages:**
```bash
# Good
eas update --message "Hotfix 2.0.2-1: Fix DNS timeout error"

# Bad
eas update --message "fix"
```

✅ **Tag releases in git:**
```bash
git tag v2.0.2 -m "Release 2.0.2: Add DNS caching + fix timeout bug"
git push origin v2.0.2
```

✅ **Monitor Sentry after every deployment:**
- Check crash-free rate every hour for first 6 hours
- Review new error types immediately
- Set up alerts for critical errors

### DON'T

❌ **Don't deploy OTA on Friday afternoon:**
- Risk: No team available for weekend rollback if issues arise
- Instead: Deploy Monday-Thursday morning

❌ **Don't skip preview channel:**
- Always test on preview for 24-48 hours minimum
- Catches issues before production rollout

❌ **Don't deploy OTA without git tag:**
- Always tag code state for rollback reference
- Tag format: `v2.0.2-ota-1` for OTA hotfixes

❌ **Don't ignore Sentry warnings:**
- Even 1% crash rate = potential 1000s of affected users
- Investigate immediately, don't wait for user reports

---

## Emergency Contacts

**Critical Production Issues:**
1. **Developer (OTA rollback):** mvneves75@gmail.com
2. **Manager (rollback approval):** TBD
3. **Sentry Alerts:** Slack #dnschat-alerts

**App Store/Play Store Expedited Review:**
- Apple: https://developer.apple.com/contact/app-store/
- Google: https://support.google.com/googleplay/android-developer/

---

## References

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Expo Updates Runtime API](https://docs.expo.dev/versions/latest/sdk/updates/)
- [App Store Phased Release](https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases/)
- [Google Play Staged Rollout](https://support.google.com/googleplay/android-developer/answer/6346149)

---

**Status:** Phase 6.1-6.2 complete. EAS channels configured, staged rollout procedure documented, OTA rollback rehearsed.
**Next:** Phase 6.3 (Release checklist) and Phase 6.4 (Team training docs).
