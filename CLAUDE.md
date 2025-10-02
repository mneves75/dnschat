# Claude Agent Handbook

## Overview
- **App**: DNSChat (React Native + Expo) with native DNS TXT transports.
- **Package version**: `2.0.0` (run `npm run sync-versions` to sync with `CHANGELOG.md` `2.0.1` before shipping).
- **Frontend stack**: Expo SDK 54 preview (`54.0.0-preview.12`), React Native 0.81.1, React 19, TypeScript strict mode.
- **Navigation**: `@react-navigation` stack + `react-native-bottom-tabs`; no Expo Router usage.
- **State**: Context providers in `src/context/` (`ChatContext`, `SettingsContext`, `OnboardingContext`, `AccessibilityContext`).
- **Native modules**: `modules/dns-native` (Swift + Java) and `ios/LiquidGlassNative`.
- **Design**: Liquid glass wrapper (native bridge on iOS 17+, CSS fallback otherwise) and Material-edge styling.
- **Docs ownership**: Mobile Platform team (`@mvneves`) signs off on Apple/modernization docs.

> **Canonical docs**: `README.md`, this file, `CHANGELOG.md`, `TECH_REVIEW.md` (architecture), `PLAN_MODERNIZATION.md` (roadmap).

## Setup
1. **Prerequisites**
   - Node.js 20.19.x LTS (Expo SDK 54 toolchain baseline). Install via asdf/nvm; verify with `node -v`. [¹]
   - npm 9+ (ships with Node 20). Yarn is optional; repo uses `package-lock.json`.
   - Watchman (macOS) for fast rebuilds: `brew install watchman`.
   - Xcode 16.x + Command Line Tools for iOS builds; install Rosetta when prompts appear on Apple Silicon. [²]
   - Android Studio Iguana with SDK Platform 35, build-tools 35.0.0, and Java 17 (install via `brew install openjdk@17`). [³]

2. **Bootstrap commands**
   ```bash
   npm install
   npm run sync-versions:dry   # check version drift
   npx expo-doctor             # validate expo project status
   node test-dns-simple.js "hello"  # DNS smoke test
   ```

3. **Expo CLI usage**
   - Start dev client: `npm start`
   - Web preview: `npm run web`
   - Verify CLI ≥11: `npx expo --version`; upgrade globally if required.

## Build & Release
### Local workflows
- **iOS**: `npm run ios`
  - Invokes `expo run:ios`, regenerates native project in `ios/`, and runs `pod install` as needed.
  - `ios/Podfile` forces classic architecture even though `app.json` sets `newArchEnabled: true`; flagged in modernization plan.
- **Android**: `npm run android`
  - Configures `JAVA_HOME` for Java 17.
  - For Gradle-only builds, run `./android-java17.sh`, then `cd android && ./gradlew assembleDebug`.

### EAS pipelines (`eas.json`)
- Profiles: `development` (dev client, simulator), `preview` (internal), `production` (store).
- Production iOS profile enables dSYM exports and Hermes symbol uploads; ensure App Store Connect credentials are current before `eas build --profile production --platform ios`.
- Tag releases (`git tag vX.Y.Z`) prior to running `eas build` so OTA updates map to git history.

### Store compliance reminders
- App Store submissions must use the latest Xcode toolchain and include 1024×1024 icons starting April 29, 2025; new privacy updates (January 31, 2026) will require manifest updates—see plan. [²]
- Google Play requires target API ≥35 for new uploads after August 31, 2025; plan upgrades to adjust Gradle ext values. [³]

## Troubleshooting
- **Version drift**: If `package.json`, `app.json`, or native project numbers differ from `CHANGELOG.md`, run `npm run sync-versions` (dry run first) to align marketing/build versions.
- **CocoaPods errors**: `npm run fix-pods` cleans Pods and reinstalls; requires CocoaPods ≥1.15.
- **Expo doctor warnings**:
  - `newArchEnabled` mismatch stems from Podfile override—documented technical debt.
  - Preview SDK: Current Expo SDK build is preview; restrict to dev/test until upgrading to 54 stable.
- **DNS smoke test failure**: `node test-dns-simple.js` should return Cloudflare TXT payload. If `ECONNREFUSED`, check VPN/firewall and verify UDP port 53 access.
- **Native module not found**: Ensure `pod install` (iOS) or Gradle sync (Android) completed; `modules/dns-native/index.ts` expects `RNDNSModule` registration.

## FAQ
- **Navigation edits?** Stack + tabs live in `src/navigation/index.tsx`; screens in `src/navigation/screens/`.
- **Where is persistent state handled?** AsyncStorage-backed services in `src/services/storageService.ts` and contexts in `src/context/`.
- **Toggle mock DNS?** Settings screen flips `enableMockDNS`, persisted via `SettingsContext`.
- **Stale references to Expo Router/Zustand?** Ignore—current stack uses React Navigation and React Context only.
- **Liquid glass requirements?** Native bridge applies on iOS 17+; falls back elsewhere. See Apple Liquid Glass announcement for design language. [⁴]

---
Updated: 2025-10-02.

[¹]: https://docs.expo.dev/more/expo-cli/#system-requirements
[²]: https://developer.apple.com/news/upcoming-requirements/
[³]: https://support.google.com/googleplay/android-developer/answer/11926878
[⁴]: https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
