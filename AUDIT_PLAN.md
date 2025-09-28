# Audit Plan — DNSChat

## Objectives
- Remove build/runtime blockers across iOS/Android/Web.
- Make DNS transport stack deterministic with clear fallbacks and logs.
- Ensure local CI (Jest + Node smoke) runs green without a device.
- Unify configuration between app and native module.

## Current Status
- All Jest suites pass locally (`npm test`).
- Node smoke test performs a raw UDP TXT query directly to `ch.at:53`.
- Expo Router false route warnings mitigated in Metro config.
- Reanimated plugin added to Babel; safe with RN 0.81.
- DNS allowlist unified with native constants.

## Completed Changes (this audit)
- metro.config.js: disabled `resolver.unstable_enablePackageExports`; kept tree‑shaking. Reduces Expo Router false positives in dev.
- babel.config.js: appended `react-native-reanimated/plugin` as last plugin.
- src/services/dnsService.ts: DNS server validation now uses `DNS_CONSTANTS.ALLOWED_DNS_SERVERS`.
- test-dns-simple.js: raw UDP TXT query to `ch.at:53` using `dns-packet` + `dgram`; added optional TCP mode (`--tcp`) and fallback when UDP times out; label equals sanitized message (no `.ch.at` suffix).
- package.json: added missing `zustand` required by `src/store/useSettingsStore.ts`.
- jest.config.js: added module extensions and mapped `modules/dns-native` to a deterministic Jest mock to keep tests hermetic.
- __tests__/mocks/modules-dns-native.js: stable mock for native DNS and constants.
- docs/PLAN_TODO.md: prior technical plan recorded; superseded by this file.

## Pending Work
- iOS local build and runtime verification on Simulator and a physical device.
- Android build validation with Java 17 and Gradle sync.
- App smoke flows: onboarding, settings changes, logs rendering for method attempts/fallbacks, sending a test chat.
 - Validate Node TCP mode on networks permitting TCP/53; document that `ch.at` may refuse TCP, so UDP remains primary.

## Execution Plan

### 1) iOS Local Build
- Prereqs: Xcode installed; CocoaPods installed.
- Commands:
  - `npm install`
  - `cd ios && pod install && cd ..`
  - `npm run ios` (select a simulator or pass `-d` to choose a device)
- If signing fails: open `ios/DNSChat.xcworkspace`, set Team, enable “Automatically manage signing”.

### 2) Android Local Build
- Prereqs: Java 17 on PATH.
- Commands:
  - `npm install`
  - `npm run android` (or `./android-java17.sh` to correct PATH on macOS/arm64)

### 3) Transport Verification (App)
- Settings → DNS server: cycle through `ch.at`, `llm.pieter.com`, and public resolvers; verify no validation mismatch.
- Settings → Test transport: run native/udp/tcp/https; confirm ordered fallback logs on the Logs screen.
- Chat screen: send a simple prompt; confirm response or a clear diagnostic with guidance.

### 4) Transport Verification (Node)
- `node test-dns-simple.js "hello"` → expect TXT response preview.
- UDP‑blocked networks: try `node test-dns-simple.js --tcp "hello"`. If the server refuses TCP/53, use in‑app flows instead.

### 5) Documentation Cleanup
- Keep this `AUDIT_PLAN.md` as the canonical audit; leave `docs/PLAN_TODO.md` referenced but prefer this file.

## Risk Register
- Native module not installed (SecureStore/Image/Updates) but referenced: avoid importing unless you will install and rebuild the dev client.
- UDP blocked environments: rely on TCP in app; optional: add TCP fallback to the Node smoke in restricted CI.

## Acceptance Criteria
- `npm test` returns zero failures consistently.
- App launches without Router “missing default export” warnings.
- Logs screen shows method attempts and deterministic fallbacks.
- iOS and Android builds run in dev mode without additional configuration beyond pods and Java 17.

## Fast Commands
- Install + iOS pods: `npm i && (cd ios && pod install)`
- iOS run: `npm run ios`
- Android run: `npm run android`
- Node smoke: `node test-dns-simple.js "hello"`
 - Node smoke (TCP): `node test-dns-simple.js --tcp "hello"`
