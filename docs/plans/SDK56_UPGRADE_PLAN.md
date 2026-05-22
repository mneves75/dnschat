# Expo SDK 56 upgrade plan

Status: implementation in progress on 2026-05-22.

Authoritative references checked on 2026-05-22:

- Expo SDK 56 changelog: https://expo.dev/changelog/sdk-56
- Expo native project upgrade helper: https://docs.expo.dev/bare/upgrade/
- Expo React Compiler guide: https://docs.expo.dev/guides/react-compiler/
- React Native 0.85 release notes: https://reactnative.dev/blog/2026/04/07/react-native-0.85

## Success criteria

- `package.json`, `bun.lock`, native pods, and app config align with Expo SDK 56.
- App code has no direct `@react-navigation/*` imports; SDK 56 router entry points are used.
- React Native 0.85 removals are handled, especially removed `StyleSheet.absoluteFillObject`.
- iOS minimum target is `16.4` across Expo config, Podfile properties, local podspecs, and docs.
- React Compiler remains enabled, with no new manual memoization added for speculative performance.
- DNS transport, prompt validation, local encrypted history, logs, and bilingual copy remain behaviorally unchanged.
- Verification proves the upgrade with Expo Doctor, SDK alignment, typecheck, unit tests, native module tests, and iOS pod sync.

## Phase 1: dependency and native baseline

1. Use the SDK 56 upgrade command with Bun:

   ```bash
   bunx expo install expo@~56.0.3 --fix --bun -- --minimum-release-age 0
   ```

   The `--minimum-release-age 0` override is scoped to this install because SDK 56 was published on 2026-05-21 and Bun's repo policy otherwise blocks fresh packages.

2. Expected aligned versions:

   - Expo `56.0.3`
   - Expo Router `56.2.5`
   - React Native `0.85.3`
   - React `19.2.3`
   - TypeScript `6.0.3`
   - Reanimated `4.3.1`
   - Worklets `0.8.3`

3. Raise iOS baseline to `16.4`:

   - `app.json` `expo.ios.deploymentTarget`
   - `app.json` `expo-build-properties` iOS deployment target
   - `ios/Podfile.properties.json`
   - `modules/dns-native/*.podspec`
   - `ios/DNSNative/DNSNative.podspec`
   - public install/store docs

4. Regenerate pods:

   ```bash
   cd ios && pod update React-Core-prebuilt ReactNativeDependencies --no-repo-update
   ```

   Rationale: React Native 0.85 prebuilt core moved the local podspec snapshot; targeted pod update refreshes the VFS overlay without broad CocoaPods repo churn.

## Phase 2: SDK 56 code migration

1. Replace direct React Navigation imports:

   - `ThemeProvider`, `DarkTheme`, and `DefaultTheme` come from `expo-router/react-navigation`.
   - `Theme` type comes from `expo-router/react-navigation`.
   - Remove app dependencies on `@react-navigation/bottom-tabs`, `@react-navigation/elements`, `@react-navigation/native`, and `@react-navigation/native-stack`.

2. Remove deprecated/removed React Native APIs:

   - Replace `StyleSheet.absoluteFillObject` with explicit absolute fill style fields.

3. Keep Expo Router native tabs usage on SDK 56-compatible `NativeTabs.Trigger.*` children.

## Phase 3: visual and performance refinement

1. Keep the current native-tabs plus platform color direction; it already matches SDK 56's stronger native UI direction without introducing a new UI dependency.
2. Prefer automatic React Compiler optimization over broad `useMemo` or `useCallback` additions.
3. For chat performance, keep `FlatList` as the message surface and verify its footer-inset/scroll behavior after the RN 0.85 upgrade.
4. Avoid adopting Expo UI drop-in replacements until a concrete current component has two real adapters or an existing community dependency can be deleted.

## Phase 4: architecture deepening

Top recommendation from the architecture review: split `src/services/dnsService.ts` behind a `DNSTransport` interface with adapters for native, UDP, TCP, and mock transports.

Why this comes first:

- Locality: SDK/networking regressions concentrate in one adapter.
- Leverage: transport tests hit one interface while preserving native/JS parity.
- Depth: fallback orchestration becomes smaller while transport implementations absorb protocol-specific complexity.

Work order:

1. Add regression coverage around the existing transport order and method-specific error mapping.
2. Extract adapter interfaces without changing exported `DNSService` behavior.
3. Move native, UDP, TCP, and mock implementations one at a time.
4. Keep TXT parsing and prompt sanitization behavior unchanged unless a separate spec update is approved.

## Phase 5: verification gate

Minimum gate for the SDK upgrade branch:

```bash
bunx expo install --check --json
bun run verify:ios-pods
bun run verify:sdk-alignment
bun run verify:typed-routes
bun run typecheck
bun run lint
bun run test
cd modules/dns-native && bun run test
gitleaks detect --source . --redact --no-banner --config .gitleaks.toml
```

Release-facing completion should add:

```bash
bun run verify:all
bun run e2e:axe:release
xcodebuild clean build -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 17'
xcodebuild clean build -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Release -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO
xcodebuild clean archive -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Release -destination 'generic/platform=iOS' -archivePath /tmp/DNSChat.xcarchive CODE_SIGNING_ALLOWED=NO
asc doctor
```
