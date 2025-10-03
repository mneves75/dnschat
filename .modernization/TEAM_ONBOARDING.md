# DNSChat Team Onboarding & Training

**Phase 6.4**
**Date:** 2025-10-03
**Status:** ✅ **IMPLEMENTED**

---

## Welcome to DNSChat Development

This guide will get you from zero to shipping production code in DNSChat. It assumes you're familiar with React Native/Expo but new to this specific codebase.

**What you'll learn:**
1. Local development setup and workflow
2. Testing strategy (unit, e2e, native modules)
3. Release process (EAS builds, OTA updates, staged rollouts)
4. Monitoring & incident response (Sentry, rollbacks)
5. Architecture deep-dives (DNS transport, native modules, UX)

**Time commitment:** ~4 hours for full onboarding (2 hours for express setup)

---

## Quick Start (30 minutes)

### Prerequisites

Ensure you have the correct toolchain versions installed:

| Tool | Required Version | Installation |
|------|------------------|--------------|
| **Node.js** | 20.19.x LTS | `nvm install 20.19` or download from nodejs.org |
| **npm** | ≥10.8.x | Ships with Node 20 |
| **Xcode** | 16.x | Mac App Store + Command Line Tools |
| **Android Studio** | Iguana (2024.1) | Download from developer.android.com |
| **Java** | 17 (for Android) | `brew install openjdk@17` |
| **Watchman** | Latest | `brew install watchman` |
| **EAS CLI** | Latest | `npm install -g eas-cli` |

**Environment Setup:**

```bash
# 1. Clone repository
git clone https://github.com/mvneves75/chat-dns.git
cd chat-dns

# 2. Install dependencies
npm install

# 3. Verify environment
npx expo-doctor

# Expected output: ✅ All checks passed

# 4. Verify native DNS module
node test-dns-simple.js "hello"

# Expected output: Successfully sent DNS TXT query
```

### First Build (iOS)

```bash
# Start Metro bundler
npm start

# In a new terminal: Run iOS simulator
npm run ios

# Expected: App launches in iOS simulator within 60 seconds
# First build takes ~3-5 minutes (CocoaPods install)
```

### First Build (Android)

```bash
# Set Java 17 for Android builds
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Run Android emulator (or connect physical device)
npm run android

# Expected: App launches in emulator within 90 seconds
# First build takes ~5-8 minutes (Gradle downloads)
```

**Troubleshooting:**
- **CocoaPods error:** Run `npm run fix-pods` to reset Pods directory
- **Java version mismatch:** Run `./android-java17.sh` then `cd android && ./gradlew assembleDebug`
- **Metro bundler crash:** Kill all Node processes (`killall node`) and restart

---

## Development Workflow

### 1. Git Workflow

**Branching Strategy:**
```
main (protected)
  ↳ feature/your-feature-name
  ↳ fix/bug-description
  ↳ hotfix/critical-fix (emergency only)
```

**Daily Workflow:**
```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/add-dns-caching

# 3. Make changes, commit frequently
git add -A
git commit -m "feat: implement DNS query caching"

# 4. Push to remote
git push origin feature/add-dns-caching

# 5. Open PR on GitHub
gh pr create --title "feat: Add DNS query caching" --body "..."

# 6. Wait for CI checks (unit tests, e2e, linting)
# 7. Request review from team
# 8. Merge after approval
```

**Commit Message Convention:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `refactor:` Code refactoring (no behavior change)
- `test:` Adding tests
- `chore:` Build, dependencies, tooling

**PR Requirements:**
- [ ] All CI checks pass (unit tests, e2e, TypeScript, linting)
- [ ] 1+ approval from team member
- [ ] No merge conflicts with main
- [ ] CHANGELOG.md updated (for user-facing changes)

### 2. Running Tests Locally

**Unit Tests (Jest):**
```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- DNSService.test.ts

# Run with coverage
npm run test:coverage

# Expected: >80% coverage for new code
```

**E2E Tests (Detox):**
```bash
# iOS simulator (Debug)
npm run test:detox -- --configuration ios.sim.debug

# iOS simulator (Release) - matches production
npm run test:detox -- --configuration ios.sim.release

# Android emulator (Release)
npm run test:detox -- --configuration android.emu.release

# Expected: All tests pass in <5 minutes
# If tests fail: Check logs in artifacts/ directory
```

**Native Module Tests:**
```bash
# Unit tests (Swift/Kotlin)
cd modules/dns-native
npm test

# Integration tests (requires physical device or simulator running)
npm run test:integration

# Expected: DNS queries succeed across all transports
```

**When to Run Tests:**
- ✅ Before opening PR (run `npm test` + Detox release config)
- ✅ After modifying native code (run native module tests)
- ✅ Before requesting PR review (ensure CI is green)
- ❌ Don't skip tests to "save time" - failing CI blocks merges

### 3. Code Quality Tools

**TypeScript:**
```bash
# Type check
npm run type-check

# Expected: 0 errors (repo uses strict mode)
```

**Linting:**
```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint:fix
```

**Formatting:**
```bash
# Format with Prettier (if configured)
npm run format
```

**Pre-commit Hooks:**
- Husky runs linting + type checks before every commit
- If commit fails: Fix errors, then re-commit
- Don't use `--no-verify` (bypasses quality gates)

---

## Architecture Overview

### DNS Transport Layer

DNSChat sends messages via DNS TXT queries with automatic transport fallback:

```
Native DNS (iOS/Android native API)
  ↓ (if fails)
UDP DNS (port 53)
  ↓ (if fails, e.g., VPN blocks UDP)
TCP DNS (port 53)
  ↓ (if fails)
DNS-over-HTTPS (port 443)
```

**Code Locations:**
- **Native Module:** `modules/dns-native/` (Swift for iOS, Kotlin for Android)
- **JavaScript Service:** `src/services/DNSService.ts` (orchestrates fallback)
- **UI Integration:** `src/navigation/screens/ChatScreen.tsx` (calls DNSService)

**Testing DNS Transports:**
```bash
# Use Settings → Transport Test buttons in app
# Or command-line:
node test-dns-simple.js "test message"

# Expected: See which transport succeeded
# Example output: "✅ Native DNS: 234ms"
```

### State Management

**React Context Providers:**
- `ChatContext` (`src/context/ChatContext.tsx`): Message history, send/receive
- `SettingsContext` (`src/context/SettingsContext.tsx`): User preferences, theme
- `DNSContext` (`src/context/DNSContext.tsx`): DNS transport configuration

**Persistence:**
- AsyncStorage wrappers in `src/services/storageService.ts`
- Chat messages stored locally (key: `@dnschat:messages`)
- Settings stored locally (key: `@dnschat:settings`)

**Adding New State:**
```typescript
// 1. Define context
export const MyContext = createContext<MyContextType | undefined>(undefined);

// 2. Create provider
export const MyProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const value = useMemo(() => ({ state, setState }), [state]);

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};

// 3. Add to App.tsx provider stack
<MyProvider>
  <ChatProvider>
    <App />
  </ChatProvider>
</MyProvider>
```

### Navigation

**React Navigation v7:**
- Root stack: `src/navigation/index.tsx`
- Screens: `src/navigation/screens/`
- Bottom tabs: ChatList, Settings
- Modals: (none currently, but can add as stack screens with `presentation: 'modal'`)

**Adding New Screen:**
```typescript
// 1. Define screen in navigation types (src/navigation/types.ts)
export type RootStackParamList = {
  Chat: undefined;
  Settings: undefined;
  NewScreen: { param: string };  // Add here
};

// 2. Create screen component (src/navigation/screens/NewScreen.tsx)
export const NewScreen = ({ route }: NewScreenProps) => {
  const { param } = route.params;
  return <View>...</View>;
};

// 3. Add to navigator (src/navigation/index.tsx)
<Stack.Screen name="NewScreen" component={NewScreen} />

// 4. Navigate from any component
navigation.navigate('NewScreen', { param: 'value' });
```

### Design System

**iOS:**
- Liquid Glass effect (iOS 17+): `ios/LiquidGlassNative` bridge
- Usage: `<View style={styles.container} glassEffect={true} />`

**Android:**
- Material 3 theming: `src/theme/android/material.ts`
- Edge-to-edge: `react-native-safe-area-context` for safe areas

**Theme Files:**
- `src/theme/colors.ts`: Color palette
- `src/theme/typography.ts`: Font styles
- `src/theme/spacing.ts`: Spacing constants

---

## Release Process

### 1. Local Builds (Development)

**Development Build (with Expo Dev Client):**
```bash
# Build development client once (caches for ~1 month)
eas build --profile development --platform ios

# Install on simulator/device
eas build:run --profile development --platform ios --latest

# Then use for daily development:
npm start
# Scan QR code or press 'i' for iOS
```

**Why Development Builds:**
- ✅ Fast iteration (Metro bundler with hot reload)
- ✅ Includes React DevTools, element inspector
- ✅ Uses Debug configuration (not optimized, easier to debug)

### 2. Preview Builds (QA/Testing)

**Purpose:** Internal testing before production release

```bash
# Build preview profile (Release config, internal distribution)
eas build --profile preview --platform all

# Submit to TestFlight (iOS) / Internal Testing (Android)
eas submit --profile preview --platform all

# Share with testers
# iOS: Invite via App Store Connect → TestFlight
# Android: Share internal testing link from Play Console
```

**Preview Testing Checklist:**
- [ ] Run full e2e test suite on preview build
- [ ] Manual QA on physical devices (iOS + Android)
- [ ] Soak test for 24-48 hours (team dogfooding)
- [ ] Performance profiling (launch time, DNS query latency)

### 3. Production Builds (App Store/Play Store)

**Full Release Process:**

See [RELEASE_CHECKLIST.md](./.modernization/RELEASE_CHECKLIST.md) for comprehensive steps. Summary:

```bash
# 1. Version bump
npm run sync-versions  # Updates app.json, package.json, native projects

# 2. Update CHANGELOG.md
# Add release notes under [2.0.3] - 2025-10-03

# 3. Commit and tag
git add -A
git commit -m "chore: bump version to 2.0.3"
git tag v2.0.3 -m "Release 2.0.3: Brief summary"
git push origin main --tags

# 4. Build production
eas build --profile production --platform all

# 5. Submit to stores
eas submit --profile production --platform all

# 6. Monitor Sentry after release
open https://sentry.io/organizations/<org>/releases/2.0.3/
```

**Key Concepts:**
- **Staged Rollout:** iOS/Android release to 10% → 50% → 100% over 7 days
- **Phased Release:** Apple's built-in staged rollout (enable in App Store Connect)
- **OTA Updates:** JavaScript-only updates without app store submission

### 4. Over-The-Air (OTA) Updates

**When to Use OTA:**
- ✅ Bug fix in JavaScript code (no native changes)
- ✅ UI text/styling changes
- ✅ Feature flag toggles
- ✅ Minor logic changes

**When NOT to Use OTA:**
- ❌ Native module changes (`modules/dns-native`)
- ❌ iOS/Android permissions
- ❌ Version bump in app.json
- ❌ Privacy manifest updates

**Publishing OTA Update:**
```bash
# 1. Test on preview channel first
eas update --branch preview --message "Fix: Correct placeholder text in chat input"

# 2. Verify on preview build (soak test 30-60 min)
eas build:run --profile preview --platform ios --latest
# Kill app, relaunch → OTA update downloads automatically

# 3. Deploy to production
eas update --branch production --message "Fix: Correct placeholder text in chat input"

# 4. Monitor Sentry for 1 hour
# Check crash rate, error rate

# 5. If issues arise → Rollback immediately
eas update:list --branch production
eas update:republish --update-id <previous-stable-id> --branch production --message "Rollback: Revert OTA fix"
```

**OTA Best Practices:**
- ✅ Always test on preview channel first (never push directly to production)
- ✅ Use descriptive messages (`eas update --message "..."`)
- ✅ Tag code state (`git tag v2.0.3-ota-1`) for rollback reference
- ✅ Monitor Sentry for 1 hour post-deployment
- ❌ Don't deploy OTA on Friday afternoon (no weekend coverage)

---

## Monitoring & Incident Response

### 1. Sentry Dashboard

**Accessing Sentry:**
```bash
# Open Sentry dashboard
open https://sentry.io/organizations/<org>/projects/dnschat/

# Or check latest release
open https://sentry.io/organizations/<org>/releases/<version>/
```

**Key Metrics to Monitor:**
- **Crash-free sessions:** Target >99.5%
- **Crash-free users:** Target >99%
- **New errors:** Target <5 per day
- **Performance (p95 latency):**
  - App Launch (TTI): <2500ms
  - DNS Query: <800ms
  - Screen Navigation: <300ms

**Sentry Alerts:**
- Slack channel: `#dnschat-alerts`
- Email: Team distribution list
- PagerDuty: (if configured for critical alerts)

**Common Alerts:**
| Alert | Meaning | Response |
|-------|---------|----------|
| "Error spike detected" | >10 errors in 10 min | Investigate within 15 min |
| "New release deployed" | Informational | Monitor for 1 hour |
| "Performance regression" | p95 latency >2x baseline | Profile and optimize |

### 2. Handling Sentry Alerts

**Step-by-Step Response:**

**Step 1: Triage (5 minutes)**
- [ ] Open Sentry issue from alert
- [ ] Check severity: critical / high / medium / low
- [ ] Check affected users: <10 / 10-100 / >100
- [ ] Check affected releases: latest only / multiple versions

**Step 2: Investigate (15 minutes)**
- [ ] Review stack trace (where did it crash?)
- [ ] Check breadcrumbs (what did user do before crash?)
- [ ] Identify root cause: code bug / API failure / network issue
- [ ] Check if regression (was it working in previous release?)

**Step 3: Decide Response (5 minutes)**
| Severity | Affected Users | Response |
|----------|----------------|----------|
| Critical | >5% | **ROLLBACK IMMEDIATELY** (see below) |
| High | 1-5% | Prepare hotfix, fast-track through CI |
| Medium | <1% | Create GitHub issue, schedule for next release |
| Low | <0.1% | Document in known issues, fix when convenient |

**Step 4: Execute Fix**
- **Rollback:** See "Rollback Procedure" below
- **Hotfix:** See "Hotfix Deployment" below
- **Scheduled Fix:** Create PR, normal review process

### 3. Rollback Procedure (Emergency)

**When to Rollback:**
- ✅ Crash-free sessions <99% for >1 hour
- ✅ New critical error affects >5% of users
- ✅ Data loss or privacy breach
- ✅ Compliance violation

**OTA Rollback (JavaScript bugs, <15 minutes):**
```bash
# 1. List recent updates
eas update:list --branch production

# Example output:
# ID: abc123, Message: "Hotfix 2.0.3-1: Fix rate limit bug", Created: 2025-10-03 14:30
# ID: def456, Message: "Release 2.0.3", Created: 2025-10-02 10:00

# 2. Rollback to last stable update (def456)
eas update:republish --update-id def456 --branch production --message "Rollback: Revert to stable 2.0.3"

# 3. Verify rollback
# Check Sentry: Error rate should drop within 15 minutes
# Test on device: Kill app, relaunch, verify functionality

# 4. Communicate to team
# Post in Slack: "Rolled back OTA update abc123 due to [issue]. Monitoring for 1 hour."
```

**Native Rollback (App Store/Play Store, 30-60 minutes):**
```bash
# 1. Pause App Store phased release (iOS)
# App Store Connect → Pricing and Availability → Pause Phased Release

# 2. Halt Play Store rollout (Android)
# Play Console → Production → Halt rollout at current percentage

# 3. Communicate to users
# Post to status page, Twitter, support channels:
# "We've identified an issue in DNSChat v2.0.3. Rollout paused. Fix incoming."

# 4. Deploy hotfix (see below)
```

### 4. Hotfix Deployment

**Hotfix Process (Fast Track, 1-2 hours):**
```bash
# 1. Create hotfix branch
git checkout -b hotfix/2.0.3-1

# 2. Fix bug (minimal changes only)
# Edit affected files...

# 3. Verify locally
npm test
npm run test:detox -- --configuration ios.sim.release

# 4. Bump version (2.0.3 → 2.0.4 or 2.0.3-1)
npm run sync-versions

# 5. Commit and tag
git add -A
git commit -m "fix: [brief description] (hotfix)"
git tag v2.0.4
git push origin hotfix/2.0.3-1 --tags

# 6. Build and submit
eas build --profile production --platform all
eas submit --profile production --platform all

# 7. Request expedited review (Apple)
# App Store Connect → App Review → "Request Expedited Review"
# Justification: "Critical bug causing crashes for X% of users"

# 8. Monitor Sentry after approval
# Expected approval: 2-4 hours (Apple), 1-3 hours (Google)
```

**Hotfix Communication:**
```markdown
# Internal (Slack #dnschat-team):
"🚨 Hotfix v2.0.4 deployed for [issue]. ETA live: 4h (iOS), 2h (Android). Monitoring Sentry."

# External (Twitter/Status page):
"DNSChat v2.0.4 released to fix [issue]. Update will roll out over next 24h. Thanks for your patience!"
```

---

## Advanced Topics

### 1. Native Module Development

**Editing DNS Native Module:**

**File Structure:**
```
modules/dns-native/
  ├── ios/
  │   ├── RNDNSModule.swift          # iOS implementation
  │   └── RNDNSModule.m              # Objective-C bridge
  ├── android/
  │   └── src/.../RNDNSModule.kt     # Android implementation
  ├── src/
  │   └── index.ts                   # JavaScript interface
  └── package.json
```

**Making Changes:**
```bash
# 1. Edit native code (Swift/Kotlin)
# modules/dns-native/ios/RNDNSModule.swift
# modules/dns-native/android/.../RNDNSModule.kt

# 2. Update JavaScript interface (if adding new methods)
# modules/dns-native/src/index.ts

# 3. Rebuild native module
cd modules/dns-native
npm run build

# 4. Test integration
npm run test:integration  # Requires device/simulator running

# 5. In main app: Reinstall Pods (iOS)
cd ../../
npm run fix-pods

# 6. Rebuild app
npm run ios
npm run android
```

**Common Pitfalls:**
- ❌ Forgetting to rebuild native module after changes → Stale JavaScript interface
- ❌ Not running `pod install` after iOS native changes → Linker errors
- ❌ Changing method signatures without updating JavaScript → Runtime crashes

### 2. Performance Profiling

**React DevTools Profiler:**
```bash
# 1. Launch development build
npm start

# 2. Open React DevTools
# In Chrome: http://localhost:8097/debugger-ui

# 3. Record profile
# DevTools → Profiler → Start recording
# Perform action (e.g., send message)
# Stop recording

# 4. Analyze flamegraph
# Look for expensive renders (>16ms)
# Optimize with React.memo, useMemo, useCallback
```

**Expo Profile (Launch Metrics):**
```typescript
// Instrument launch time
import { addNewArchitectureDevPlugin } from 'expo-profile';

if (__DEV__) {
  addNewArchitectureDevPlugin();
}

// Logs TTI (Time to Interactive) in Metro console
```

**Sentry Performance Monitoring:**
```typescript
// Add custom transaction
import * as Sentry from '@sentry/react-native';

const transaction = Sentry.startTransaction({
  name: 'DNS Query',
  op: 'dns.query',
});

await dnsQuery(domain);

transaction.finish();
```

### 3. Debugging Native Modules

**iOS (Xcode Debugger):**
```bash
# 1. Open Xcode workspace
open ios/DNSChat.xcworkspace

# 2. Set breakpoint in RNDNSModule.swift
# Click line number in Xcode to add breakpoint

# 3. Run from Xcode
# Product → Run (Cmd+R)

# 4. Trigger DNS query in app
# Xcode debugger pauses at breakpoint
# Inspect variables, step through code
```

**Android (Android Studio Debugger):**
```bash
# 1. Open android/ folder in Android Studio

# 2. Set breakpoint in RNDNSModule.kt
# Click line number to add breakpoint

# 3. Debug app
# Run → Debug 'app' (Shift+F9)

# 4. Trigger DNS query in app
# Debugger pauses at breakpoint
```

**Logging:**
```swift
// iOS (Swift)
print("[RNDNSModule] Query: \(domain)")
NSLog("[RNDNSModule] Query: %@", domain)
```

```kotlin
// Android (Kotlin)
Log.d("RNDNSModule", "Query: $domain")
```

### 4. Adding Third-Party Libraries

**Process:**
```bash
# 1. Install package
npm install react-native-new-library

# 2. For libraries with native code: Rebuild
# iOS:
cd ios && pod install && cd ..

# Android: Gradle auto-detects new native modules

# 3. Verify autolinking
npx react-native config
# Should list new library under "dependencies"

# 4. Test
npm run ios
npm run android

# 5. Update EAS build if needed (e.g., requires custom build config)
# Edit eas.json → build → production → ios/android sections
```

**Compatibility Checklist:**
- [ ] Library supports React Native 0.81+ (check README)
- [ ] Library supports Expo SDK 54 (check expo.dev for compatibility)
- [ ] Library supports New Architecture (Fabric/TurboModules) or has bridge compatibility
- [ ] Library is actively maintained (last commit <6 months)
- [ ] License is compatible (MIT, Apache, BSD - avoid GPL/AGPL)

---

## Reference Documentation

### Essential Reading

**Core Docs (Read first):**
1. [README.md](../README.md) - Project overview, setup instructions
2. [CLAUDE.md](../CLAUDE.md) - Development handbook, quick reference
3. [TECH_REVIEW.md](../TECH_REVIEW.md) - Architecture decisions, technical deep-dive

**Modernization Docs (Phase-by-phase implementation):**
1. [PLAN_MODERNIZATION.md](../.modernization/PLAN_MODERNIZATION.md) - 32-task roadmap
2. [BASELINE_METRICS.md](../.modernization/BASELINE_METRICS.md) - Performance baselines
3. [FABRIC_ALIGNMENT.md](../.modernization/FABRIC_ALIGNMENT.md) - New Architecture strategy
4. [DETOX_SETUP.md](../.modernization/DETOX_SETUP.md) - E2E testing guide
5. [PRIVACY_COMPLIANCE.md](../.modernization/PRIVACY_COMPLIANCE.md) - Apple/Google compliance
6. [SENTRY_OBSERVABILITY.md](../.modernization/SENTRY_OBSERVABILITY.md) - Monitoring setup
7. [RELEASE_WORKFLOW.md](../.modernization/RELEASE_WORKFLOW.md) - Release procedures
8. [RELEASE_CHECKLIST.md](../.modernization/RELEASE_CHECKLIST.md) - Pre-flight checklist (this is critical!)

**API References:**
- [Expo SDK 54 Docs](https://docs.expo.dev/versions/v54.0.0/)
- [React Navigation v7](https://reactnavigation.org/docs/7.x/getting-started)
- [Sentry React Native](https://docs.sentry.io/platforms/react-native/)
- [Detox](https://wix.github.io/Detox/)

### Key Commands Cheatsheet

**Development:**
```bash
npm start                  # Start Metro bundler
npm run ios                # Run iOS simulator
npm run android            # Run Android emulator
npm test                   # Run unit tests
npm run test:detox         # Run e2e tests
npm run type-check         # TypeScript validation
npm run lint               # ESLint
npm run fix-pods           # Reset CocoaPods (iOS)
```

**EAS:**
```bash
eas build --profile [development|preview|production] --platform [ios|android|all]
eas submit --profile [preview|production] --platform [ios|android|all]
eas update --branch [development|preview|production] --message "..."
eas update:list --branch production
eas update:republish --update-id <id> --branch production --message "Rollback"
```

**Versioning:**
```bash
npm run sync-versions:dry  # Check version drift
npm run sync-versions      # Sync versions across files
git tag v2.0.3 -m "Release 2.0.3: Summary"
git push origin main --tags
```

**Monitoring:**
```bash
# Sentry
open https://sentry.io/organizations/<org>/projects/dnschat/

# App Store Connect
open https://appstoreconnect.apple.com/

# Play Console
open https://play.google.com/console/
```

---

## Getting Help

### Internal Resources

**Team Communication:**
- **Slack:**
  - `#dnschat-team` - General discussion
  - `#dnschat-alerts` - Sentry alerts, production issues
  - `#dnschat-releases` - Release announcements
- **GitHub Issues:** https://github.com/mvneves75/chat-dns/issues
- **Weekly Sync:** Tuesdays 10am PT (calendar invite)

**Code Owners:**
- **Overall Architecture:** @mvneves75
- **Native Modules (iOS/Android):** @mvneves75
- **E2E Testing (Detox):** @mvneves75
- **Release Management:** @mvneves75
- **Sentry/Monitoring:** @mvneves75

### External Resources

**React Native / Expo:**
- [Expo Discord](https://chat.expo.dev/)
- [React Native Community Discord](https://discord.gg/react-native)
- [Stack Overflow (expo tag)](https://stackoverflow.com/questions/tagged/expo)

**Emergency Contacts:**
- **Production Incidents:** mvneves75@gmail.com (24/7 for critical issues)
- **Apple Expedited Review:** https://developer.apple.com/contact/app-store/
- **Google Play Support:** https://support.google.com/googleplay/android-developer/

---

## Onboarding Checklist

**Day 1:**
- [ ] Repository cloned, dependencies installed
- [ ] First iOS build successful
- [ ] First Android build successful
- [ ] Ran unit tests + e2e tests locally
- [ ] Read README.md, CLAUDE.md, TECH_REVIEW.md

**Week 1:**
- [ ] Shipped first PR (bug fix or small feature)
- [ ] Participated in PR review for teammate
- [ ] Read all modernization docs (PLAN_MODERNIZATION.md → RELEASE_CHECKLIST.md)
- [ ] Deployed first OTA update to preview channel
- [ ] Responded to first Sentry alert (or shadowed teammate)

**Month 1:**
- [ ] Shipped production release (assisted or led)
- [ ] Performed native module change (iOS or Android)
- [ ] Executed rollback procedure (drill or real incident)
- [ ] Contributed to architecture decision (RFC or design doc)
- [ ] Mentored new team member (if applicable)

**Sign-Off:**
```
Onboarding Complete: ✅
Developer: [Your Name]
Date: _______
Mentor: [Mentor Name]

Feedback:
[What went well, what could be improved for next onboarding]
```

---

**Status:** Phase 6.4 complete. Team onboarding and training documentation created.
**Next:** Create Phase 6 summary and overall modernization completion summary.
