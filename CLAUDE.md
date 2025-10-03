# Claude Agent Handbook

Authoritative quick-start for DNSChat contributors. Keep this guide aligned with the latest stable Expo, React Native, and Apple platform guidance.

> Canonical references live in `README.md`, `TECH_REVIEW.md`, `PLAN_MODERNIZATION.md`, and this handbook. Cross-link updates instead of duplicating content.

## Overview

- **App**: DNSChat (Expo/React Native) delivering DNS TXT-based chat with native transports.
- **Current toolchain**: Expo SDK 54.0.12 (stable) with React Native 0.81.4, React 19.1, TypeScript 5.9 strict mode. [1][2]
- **Architecture highlights**: React Navigation v7 (native stack + bottom tabs), React Context providers for state, native DNS module (`modules/dns-native`) and iOS Liquid Glass wrapper (`ios/LiquidGlassNative`).
- **Design system**: Liquid Glass on iOS 17+ via `.glassEffect()` bridge; Material 3 edge-to-edge styling on Android.
- **New Architecture**: `app.config.ts` enables Fabric/TurboModules; Android builds Fabric today, Podfile currently opts iOS out—see modernization plan for alignment.

## Setup

### Tooling requirements

| Target | Required version | Notes |
| --- | --- | --- |
| Node.js | 20.19.x LTS | Aligns with Expo SDK 54 baseline. [3] |
| npm | ≥10.8.x | Ships with Node 20; repo uses `package-lock.json`. |
| Xcode | 16.x | Install command line tools + Rosetta (Apple Silicon) for simulator support. |
| Android toolchain | Android Studio Iguana, SDK Platform 35, Build Tools 35.0.0, Java 17 | `android-java17.sh` exports `JAVA_HOME` on macOS. |
| Watchman | Latest | Improves Metro performance on macOS (`brew install watchman`). |

### Repository bootstrap

```bash
npm install
npm run sync-versions:dry   # sanity-check marketing vs build numbers
npx expo-doctor             # validate Expo config/environment
node test-dns-simple.js "hello"  # DNS transport smoke test
```

### Project layout

- **App**: `src/` (components, navigation, contexts, services, theme, i18n).
- **Native modules**: `modules/dns-native` (Swift/Java TurboModule) and `ios/LiquidGlassNative` bridge.
- **Configuration**: `app.config.ts`, `eas.json`, platform folders (`ios/`, `android/`).
- **Scripts**: `npm run sync-versions`, `npm run fix-pods`, `scripts/run-dns-harness.ts`, etc.

## Build & Release

### Local workflows

| Task | Command | Notes |
| --- | --- | --- |
| Dev client | `npm start` | Starts Metro with Expo dev client. |
| iOS device/simulator | `npm run ios` | Runs `expo run:ios`; regenerates native project and `pod install`. Podfile currently disables Fabric—see plan before toggling. |
| Android device/emulator | `npm run android` | Uses Java 17 path override. For Gradle-only builds run `./android-java17.sh && cd android && ./gradlew assembleDebug`. |
| Web preview | `npm run web` | Expo web bundler. |
| Native DNS harness | `cd modules/dns-native && npm test` (unit) / `npm run test:integration` (device required). |

### Expo Application Services

- `eas.json` profiles:
  - `development`: Dev client, Debug config, iOS simulator ready.
  - `preview`: Internal distribution, Release config, dSYM + sourcemaps for smoke tests.
  - `production`: Store distribution with Hermes dSYM archival and symbol uploads.
- iOS submit profile pre-populates Apple ID (`mvneves75@gmail.com`), ASC app ID `6740045336`, and team `N4BTRJM68S`—update secrets in EAS when rotating credentials.
- Tag releases (`git tag vX.Y.Z`) before EAS builds so OTA updates trace to git history.

### Versioning and compliance

- Keep `package.json`, `app.json`, native project versions in sync via `npm run sync-versions` (dry run first).
- **Apple**: Follow latest Xcode + 1024×1024 icon requirement and privacy manifest deadlines (effective Jan 31, 2026). [4]
- **Google Play**: Target API 35 is mandatory for new uploads after Aug 31, 2025; repo already targets 35 via `app.config.ts` but verify Gradle ext stays aligned. [5]
- **Safe areas**: Use `react-native-safe-area-context` (already installed) instead of legacy RN `SafeAreaView`. [6]

## Troubleshooting

1. **New Architecture drift** – `app.config.ts` enables Fabric/TurboModules, but `ios/Podfile` sets `ENV['RCT_NEW_ARCH_ENABLED'] = '0'`. Decide per modernization plan; inconsistent toggles cause native module crashes.
2. **DNS transport fallback** – `node test-dns-simple.js` or in-app logs show fallback order (Native → UDP → TCP → DoH). VPN/corporate networks can block UDP port 53; ensure TCP/HTTPS succeed.
3. **Native module missing** – Run `pod install` (iOS) or Gradle sync (Android) after editing `modules/dns-native` or bridge code. Ensure `RNDNSModule` is autolinked before launching the app.
4. **Version drift** – If `npm run sync-versions:dry` reports deltas, update CHANGELOG and rerun without `--dry-run` to propagate marketing/build numbers.
5. **CocoaPods hiccups** – `npm run fix-pods` removes `Pods/` and reinstalls with deterministic settings. Require CocoaPods ≥1.15 for Expo SDK 54.
6. **Expo Doctor warnings** – Common alerts include missing Java 17 or mismatched Fabric config. Resolve CLI environment issues before running `eas build`.

## FAQ

- **Where do I edit navigation?** `src/navigation/index.tsx` defines the stack/tab router; individual scenes live in `src/navigation/screens/`.
- **Persistent state lives where?** React Context providers (`src/context/*`) use AsyncStorage helpers from `src/services/storageService.ts`.
- **How do I test DNS locally?** Run `node test-dns-simple.js "message"` or use the Settings screen “Transport Test” buttons.
- **Is Expo Router supported?** No—stick to React Navigation. Avoid adding alternative routing stacks without architectural review.
- **Which iOS versions support Liquid Glass?** iOS 17+ (per Apple’s WWDC24 announcement). Bridges gate features based on runtime availability. [4]
- **Safe area utilities?** Always import from `react-native-safe-area-context`; do not use deprecated RN `SafeAreaView`. [6]

## References

1. Expo SDK 54 release notes: https://expo.dev/changelog/sdk-54
2. React Native 0.81 release blog: https://reactnative.dev/blog/2025/08/12/react-native-0.81
3. Expo CLI system requirements: https://docs.expo.dev/more/expo-cli/#system-requirements
4. Apple Liquid Glass & platform requirements: https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
5. Google Play target API policy: https://support.google.com/googleplay/android-developer/answer/11926878
6. `react-native-safe-area-context` documentation: https://github.com/th3rdwave/react-native-safe-area-context
