# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is DNSChat

A React Native Expo app that sends short prompts as DNS TXT queries to LLM servers and renders responses. Uses React Native 0.85.x, Expo SDK 56.0.6, React 19.2.3, TypeScript 6.x.

**Default DNS Server**: `llm.pieter.com:53` (by @levelsio)
**Fallback Server**: `ch.at:53` (currently offline)

## Quick Navigation for Common Tasks

| Task | Files to Check |
|------|----------------|
| Runtime bootstrap | `entry.tsx` -> `expo-router/entry` -> `app/_layout.tsx` |
| Tab layout | `app/(tabs)/_layout.tsx` (web override: `_layout.web.tsx`) |
| Chat thread route | `app/chat/[threadId].tsx` |
| DNS query orchestration | `src/services/dnsService.ts` |
| DNS wire format (encode / decode / TCP frame / TXT extract) | `src/services/dnsWire.ts` |
| Server configuration | `modules/dns-native/constants.ts` (`getLLMServers`, `getDefaultServer`) |
| Default server setting | `src/context/settingsStorage.ts` (`DEFAULT_DNS_SERVER`) |
| Settings UI | `src/navigation/screens/GlassSettings.tsx` |
| Translations | `src/i18n/messages/en-US.ts`, `pt-BR.ts` |
| Native DNS module | `modules/dns-native/index.ts` |
| Chat context | `src/context/ChatContext.tsx` |
| Message sanitization | `modules/dns-native/constants.ts` (`sanitizeDNSMessageReference`) |
| Color/typography/spacing tokens | `src/ui/theme/imessagePalette.ts`, `liquidGlassTypography.ts`, `liquidGlassSpacing.ts` |
| Theme preference (System/Light/Dark) | `src/context/settingsStorage.ts:themePreference` -> `app/_layout.tsx` `Appearance.setColorScheme` |
| Responsive layout (phone/tablet/desktop) | `src/ui/hooks/useResponsiveLayout.ts` |
| Accessibility provider + resilient hooks | `src/context/AccessibilityContext.tsx` |
| Glass UI primitives | `src/components/LiquidGlassWrapper.tsx`, `src/components/glass/*` |

## Commands

```bash
# Development
bun run start       # Expo development server
bun run ios         # Build and run iOS
bun run android     # Build and run Android (auto-selects Java 17)
bun run web         # Web preview (uses Mock DNS)

# Testing
bun run test        # Run all unit tests (jest --runInBand)
bun run test -- --testPathPattern=<pattern>  # Run specific test file
# Runtime UI verification: use Argent MCP by default for simulator discovery,
# screenshots, component-tree/debugger inspection, and tap/type flows.
# Do not run AXe by default; use bun run e2e:axe:* only by explicit request or
# documented Argent unavailability.

# Linting
bun run lint        # ast-grep rules (blocks legacy liquid glass imports)

# DNS module tests (separate workspace)
cd modules/dns-native && bun run test

# DNS smoke tests (no RN runtime)
dig @llm.pieter.com "hello" TXT +short  # Quick server test
node test-dns-simple.js "test message"
bun run dns:harness -- --message "test message"

# iOS pod helpers
bun run verify:ios-pods   # Check lockfile sync
bun run fix-pods          # Basic CocoaPods cleanup
bun run clean-ios         # Deep pods reset

# iOS CLI release smoke
xcodebuild -workspace ios/DNSChat.xcworkspace -scheme DNSChat -showdestinations
xcodebuild clean build -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 17'
xcodebuild clean build -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Release -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO
xcodebuild clean archive -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Release -destination 'generic/platform=iOS' -archivePath /tmp/DNSChat.xcarchive CODE_SIGNING_ALLOWED=NO
asc doctor                # Local App Store Connect CLI health; upload/submission checks need credentials

# iOS physical-device / TestFlight release path
# Device install must use the compiled native app, not Expo Go.
xcodebuild clean build -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Debug -destination 'platform=iOS,id=<DEVICE_ID>' DEVELOPMENT_TEAM=<TEAM_ID> CODE_SIGN_STYLE=Manual PROVISIONING_PROFILE_SPECIFIER='<DEVELOPMENT_PROFILE>'
xcrun devicectl device install app --device <COREDEVICE_ID> <DERIVED_DATA>/Build/Products/Debug-iphoneos/DNSChat.app

# Signed TestFlight export requires a distribution identity + App Store profile.
xcodebuild clean archive -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Release -destination 'generic/platform=iOS' -archivePath /tmp/DNSChat.xcarchive DEVELOPMENT_TEAM=<TEAM_ID> CODE_SIGN_STYLE=Manual PROVISIONING_PROFILE_SPECIFIER='<APP_STORE_PROFILE>' CODE_SIGN_IDENTITY='iPhone Distribution'
xcodebuild -exportArchive -archivePath /tmp/DNSChat.xcarchive -exportPath /tmp/DNSChat-export -exportOptionsPlist /tmp/DNSChat-ExportOptions.plist
asc publish testflight --app <APP_ID> --ipa /tmp/DNSChat-export/DNSChat.ipa --version <VERSION> --build-number <BUILD> --group <GROUPS> --wait

# Android diagnostics
bun run verify:android    # Sanity check tooling/device
bun run verify:android-16kb # Validate 16KB page size alignment after a native Android build
bun run verify:typed-routes # Generate and validate Expo Router typed routes
bun run verify:react-compiler # Run React Compiler healthcheck
bun run verify:public-redaction # Ensure public docs do not expose local release identifiers
bun run verify:security # Run dependency audit plus gitleaks secret scan
bun run verify:all     # Run ALL verification gates (lint, test, pods, sdk alignment, etc.)

# Version sync
bun run sync-versions     # Sync version across package.json, app.json, native configs
bun run sync-versions:dry # Preview changes
```

## Architecture

### Routing & Bootstrap

This app uses **Expo Router** (file-based routing under `app/`), not React Navigation directly. `package.json:main` points at `entry.tsx`, which loads the crypto bootstrap then re-exports `expo-router/entry`. Provider wiring (Settings, Chat, Onboarding, Accessibility, Theme) lives in `app/_layout.tsx`.

`src/navigation/screens/` contains screen components consumed by Expo Router routes — they are not routes themselves. Don't add new files there expecting routing to pick them up; add a route in `app/` and import the screen.

`experiments.reactCompiler: true` and `experiments.typedRoutes: true` are enabled in `app.json`. Manual `useMemo`/`useCallback` should be removed (the compiler handles memoization). Run `bun run verify:typed-routes` after adding/renaming routes.

**React Compiler conventions** (keeps `react-doctor` at 100/100 — see `implementation-notes.html`):
- Reanimated shared values must use the `.get()`/`.set()` accessors, never `.value` (the compiler cannot optimize `.value`).
- Hold "create once" animated values (`Animated.Value`, `makeMutable`) in a `useState(() => …)` initializer, not `useRef(...).current` — refs cannot be read during render.
- Do not use a `finally` block (the compiler cannot lower it); use `Promise.prototype.finally()` or a trailing cleanup statement after `try/catch`.
- Legitimate external-sync `setState`-in-effect cases (splash settle, route hydration, load-on-mount) are exempted per-file in `doctor.config.json`, not in code.
- `react-doctor` must be scoped with `--project chat-dns`; a bare run can report the sibling `paquera-mobile` project from the parent Bun workspace.

### Argent MCP Runtime Verification

Use Argent MCP as the default native simulator proof surface for UI/runtime
work. Before tapping or typing, run discovery first: `describe`,
`debugger-component-tree`, or screenshot. Never guess coordinates. For
release-facing UI, navigation, accessibility, or localization changes, exercise
the compiled native app with Argent screenshots/component-tree evidence after
`bun run verify:all` and before claiming release readiness. At session end, call
Argent `stop-all-simulator-servers` and clean up temporary simulator state.

AXe is not the default verification surface in this repo. Use AXe only when the
user explicitly asks for AXe or Argent MCP is unavailable for the required
inspection, and record the exact fallback reason.

### DNS Server Fallback Chain

**Server selection** (search `getLLMServers` in `src/services/dnsService.ts` — currently around line 775):
- If user has selected a server in settings -> use ONLY that server (no fallback)
- Otherwise -> use `getLLMServers()` which returns `[llm.pieter.com:53, ch.at:53]`

**Transport fallback** (for each server):
1. Native DNS (iOS/Android native module)
2. UDP (react-native-udp)
3. TCP (react-native-tcp-socket)
4. Mock (web/development)

**Query flow**:
1. Validate prompt (reject empty/whitespace/control chars)
2. Enforce 120-char limit before sanitization
3. Sanitize into DNS label (lowercase, spaces->dashes, 63-char max)
4. Send `label.<zone>` query through transport chain
5. Parse TXT response (plain or multipart `n/N:` format)

### Key Directories

```
modules/dns-native/           # Native DNS module (TS API + iOS/Android bridges)
  constants.ts                # DNS_SERVERS, limits, sanitization rules
  index.ts                    # NativeDNS class, DNSError types
  ios/, android/              # Platform-specific implementations
  __tests__/                  # Module tests (run separately)

src/services/
  dnsService.ts               # Query orchestration, transport chain, retries/logging
  dnsWire.ts                  # DNS wire format: encode TXT query, decode packet, TCP framing, TXT extraction, response validation
  dnsLogService.ts            # Logging for Logs screen
  storageService.ts           # AsyncStorage persistence
  encryptionService.ts        # Secure storage

src/context/
  settingsStorage.ts          # DEFAULT_DNS_SERVER, settings persistence
  SettingsContext.tsx         # Settings state management
  ChatContext.tsx             # Chat state, sendMessage()

src/navigation/screens/        # Screen components rendered by Expo Router routes
  GlassSettings.tsx           # Settings UI with server picker
  GlassChatList.tsx           # Chat list
  Chat.tsx                    # Chat thread (rendered from app/chat/[threadId].tsx)

app/                          # Expo Router routes (file-based)
  _layout.tsx                 # Root providers + onboarding gate
  (tabs)/_layout.tsx          # Tab bar wiring
  chat/[threadId].tsx         # Dynamic chat-thread route

src/i18n/messages/
  en-US.ts, pt-BR.ts          # Translations including DNS server labels

docs/                         # Developer docs (see docs/README.md for index)
  architecture/SYSTEM-ARCHITECTURE.md
  technical/DNS-PROTOCOL-SPEC.md
  technical/SPECIFICATION.md
  troubleshooting/COMMON-ISSUES.md
  data-inventory.md, model-registry.md
```

### Settings System

**User settings** stored in AsyncStorage at key `@chat_dns_settings`, schema versioned (`SETTINGS_VERSION` in `src/context/settingsStorage.ts`):
- `dnsServer`: Selected DNS server (default: `llm.pieter.com`)
- `enableMockDNS`: Use mock responses for testing
- `allowExperimentalTransports`: Enable UDP/TCP fallbacks
- `enableHaptics`: Haptic feedback
- `preferredLocale`: Language preference (null = follow system)
- `themePreference`: `'system' | 'light' | 'dark'` — applied globally via `Appearance.setColorScheme('unspecified' | 'light' | 'dark')` in `app/_layout.tsx`
- `accessibility`: `{ fontSize, highContrast, reduceMotion, screenReader }`

**Important**: When `dnsServer` is set, the app uses ONLY that server with NO fallback chain.

**When you bump `SETTINGS_VERSION`**: add a migration branch in `migrateSettings()` (covers v1, v2, v3, v4+) and update the spec at `__tests__/settings.migration.spec.ts`. New fields must be backfilled with safe defaults across every prior version.

### Theming & Accessibility

- **Palette**: `useImessagePalette()` is the single source of truth for colours. It auto-resolves dark/light and honours `useHighContrast()`. Don't hard-code hex strings in components — read from the palette.
- **Resilient hooks**: `useHighContrast`, `useMotionReduction`, `useScreenReader`, `useFontSize` return defaults when no `AccessibilityProvider` is mounted (so isolated unit tests don't need to wrap providers). Only `useAccessibility()` itself throws when used outside a provider — keep it that way to catch real wiring bugs.
- **Reduce motion**: any animation in `ChatInput`, `LiquidGlassButton`, `GlassBottomSheet`, screen entrance, etc., must short-circuit to the end state when `shouldReduceMotion` is true. Do not gate haptics on it — those still fire.
- **Responsive bubbles / icons**: `useResponsiveLayout()` returns `{ messageMaxWidth, tabIconSize, isPhone/isTablet/isDesktop }`. Breakpoints: phone < 600, tablet 600–1024, desktop ≥ 1024. Apply `messageMaxWidth` instead of a fixed `"75%"` for chat content.

### Native Module

`modules/dns-native/` is a separate workspace. Constants in `constants.ts` must stay synchronized with iOS/Android implementations.

Key constraints:
- `MAX_MESSAGE_LENGTH: 120` (before sanitization)
- `MAX_DNS_LABEL_LENGTH: 63` (RFC 1035)
- `DNS_SERVERS` array defines server order and ports

### Pre-commit Hook

Installed via `bun install` -> `scripts/install-git-hooks.js`. Runs:
1. `bun run verify:ios-pods`
2. `bun run lint`
3. `bun run test -- --bail --passWithNoTests`

### AST-Grep Rules

`project-rules/astgrep-liquid-glass.yml` blocks:
- Imports from deleted `../components/liquidGlass/` path
- References to deleted `LiquidGlassNative` module

Use `components/LiquidGlassWrapper` instead.

### Babel Constraint

`react-native-reanimated/plugin` must remain the **last** entry in `babel.config.js:plugins`. The production-only `transform-remove-console` plugin runs before it.

### Versioning

`package.json:version` is the source of truth. To bump:

```bash
# 1. Edit package.json version manually, then:
bun run sync-versions          # Propagates to app.json (iOS buildNumber, Android versionCode), native modules
bun run sync-versions:dry      # Preview without writing
```

Never edit `ios/` or `android/` version fields by hand — they will be overwritten.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push to main and PRs:
- Root tests: verify:ios-pods, lint, test
- dns-native tests: separate job in `modules/dns-native`

## Platform Notes

**iOS**: Requires Xcode 26.4+, iOS 16.4+ target. Device builds need a local signing team/profile, but the repo keeps `DEVELOPMENT_TEAM` empty for public portability. The repo working version is `4.1.4` build `71`: a UI-polish pass applying the `make-interfaces-feel-better` micro-detail principles and the Expo professional-design-principles article — variant-gated iOS scale-on-press in `PressableRipple` (button variants `primary`/`icon`/`destructive` scale to `0.96` via a shared no-overshoot `SpringConfig.press`; `surface` rows/cards keep the opacity dim; a `pressScale` prop overrides per call site and the ChatInput send button passes `pressScale={false}` to avoid double-scaling), tabular figures (`fontVariant: ["tabular-nums"]`) on dynamic numbers (input character counter, message `HH:mm` timestamps, Logs clock times and latency durations), the canonical tactile press scale standardized to `0.96`, removal of the dead `createButtonPressAnimation` helper, and a shared Jest `react-native-reanimated` mock (`__tests__/mocks/react-native-reanimated.js`, wired via `moduleNameMapper`) so rendering suites stop hand-rolling partial stubs that omit `Easing`/hooks; JS/TS only, no native/transport/behavior change, verified by `tsc`, `lint`, full Jest (959 pass) and a clean Codex `autoreview`, not built for TestFlight (the latest `VALID` TestFlight build remains `4.1.3` build `70`). The prior `4.1.3` build `70` was a release-readiness and documentation-integrity pass (a structured-review-flagged changelog release-state correction plus a keyboard drag-to-dismiss regression test; no app-behavior change versus `4.1.2`), signed with the Apple Distribution identity and uploaded to TestFlight, processed `VALID` for internal testers on `2026-06-22` — it carries the 4.1.2 premium-feel work to TestFlight, since 4.1.2 itself was only Development-signed onto a device. The `4.1.2` build `69` premium-feel pass (loading-skeleton tint switched from a hard-coded `#FFFFFF` check to a semantic `palette.isDark` signal, a new `isDark` flag on `IMessagePalette`, removal of the unused `errorShake` haptic dead code, Expo SDK 56 dependency patch alignment for `expo`/`@expo/ui`/`expo-build-properties`/`expo-router` so `expo-doctor` version-match passes, plus interactive keyboard drag-to-dismiss on the chat list, a calmer no-overshoot input auto-grow spring, and deletion of the dead `GlassTabBar` component and its orphaned metrics token) was built into a Development-signed binary that installed and launched cleanly on a physical iOS device; it was not uploaded to TestFlight. The `4.1.1` build `68` source patch (Reduce-Motion `LiquidGlassTextInput` fix, keyed chat message-list `ErrorBoundary`, Android-glass-color + GlassTabBar-metric tokenization, React Doctor `failOn` -> `blocking` migration) was built and uploaded this session; the last TestFlight build accepted `VALID` is now version `4.1.3` build `70` (`2026-06-22`, advancing from `4.1.1` build `68`, also `VALID`), shipped to the internal tester group via the Apple Distribution `xcodebuild archive` -> `-exportArchive` -> `asc publish testflight` lane with bilingual `What to Test` notes for `en-US` and `pt-BR` (for 4.1.3 the unsigned Release archive was re-signed at export time using the App Store export-options plist, avoiding a second archive build). Build `67` promotes the iOS New-Architecture DNS transport fix to a tagged minor and additionally carries a native `NWConnection` TCP-fallback leak fix, the Apple iOS 26+ adaptive launcher icon (light/dark/tinted, applied directly to the `AppIcon.appiconset` asset catalog rather than via a `prebuild` regen — verified rendering on the Home Screen of a booted simulator), and Dependabot security updates (`concurrent-ruby` 1.3.7, `ws` 7.5.11, `@babel/core` 7.29.7, `js-yaml` 4.2.0; `faraday` stays 1.10.x, pinned `~> 1.0` by the Ruby build tooling whose patch is in 2.x — local build-only, tracked not forced). The in-app DNS runtime on the New-Arch native path is not yet confirmed on device/sim (the unsigned `CODE_SIGNING_ALLOWED=NO` sim build cannot reach `expo-secure-store`'s keychain — "Encryption key is unavailable"); DNS end-to-end is covered by the Node harness and rides on the TestFlight device build. App Store Connect has no App Store version record for this line yet, so App Store submission validation is not applicable for this TestFlight-only staging build. The Podfile clamps every pod target to `IPHONEOS_DEPLOYMENT_TARGET >= 16.4` — newer Xcode toolchains reject the 9.0/12.4/13.4 values pinned by resource-bundle pod targets. TestFlight/App Store uploads require a GM Xcode. As of `2026-06-13` the machine's `/Applications/Xcode.app` is `26.6` build `17F109` with a **GM** license (`Contents/Resources/LicenseInfo.plist` -> `licenseType = GM`; bundled iOS 26.5 SDK), and App Store Connect accepted its `4.0.31` build `65` binary with no `ITMS-90534`. The earlier `2026-06-10` "beta seed" diagnosis was wrong: the archive failures during the retry were self-inflicted by an invalid `DEVELOPER_DIR` override pointing at a non-existent `Xcode-26.5.0.app`, not the stable-slot toolchain. Use the default `xcode-select` Xcode (do NOT override `DEVELOPER_DIR`); the Xcode 27 beta still cannot compile `expo-modules-jsi`. Under host overload (Microsoft Defender pegging CPU, load avg in the hundreds), avoid `clean` and run an incremental archive with `-jobs 3` + `nice` to dodge fork-storm `SIGKILL`s (`rc=137`). Runtime UI verification defaults to Argent MCP; historical AXe evidence exists for older builds only and AXe should not be used unless explicitly requested or Argent is unavailable. Direct physical-device install works (verified `4.0.32` build `66` on `2026-06-22`, and `4.0.31` build `65` on `2026-06-13`); the earlier "blocked by `No Accounts` / no development profile" note was stale. The keychain holds an Apple Development identity and the target device is already registered on the account, so an `IOS_APP_DEVELOPMENT` provisioning profile can be minted via the `asc` CLI (bundle id + Apple Development cert + device) without Xcode's account UI. Under host overload, prefer re-signing the existing Release archive `.app` (embed the dev profile, swap entitlements to `get-task-allow=true` from the profile, re-sign each embedded framework inside-out then the bundle with `--generate-entitlement-der`, then `xcrun devicectl device install app`) instead of a fresh device build — the Release archive already bundles the JS so the re-signed app runs standalone. `devicectl … process launch` failing with `FBSOpenApplicationErrorDomain error 7 / Locked` is a locked-device condition, not an install failure; unlock and tap the app, trusting the developer under Settings → General → VPN & Device Management on first run if prompted. Do not change the startup motion contract without verifying animated screens on-device/simulator with Reduce Motion enabled. Internal App Store Connect IDs, tester group names, device names, and local artifact paths belong in private release notes, not public docs. `xcodebuild test` is not a gate yet because the `DNSChat` scheme has no XCTest bundles.

If a freshly imported distribution certificate makes `codesign` hang during `[CP] Embed Pods Frameworks`, isolate signing in a temporary or local build keychain, unlock it, set its key partition list, put it first in `security list-keychains`, and pass `OTHER_CODE_SIGN_FLAGS='--keychain <keychain path>'` to `xcodebuild archive`. Do not commit certificates, private keys, `.p12` files, provisioning profiles, or App Store Connect keys. Keep exact device, signing, tester-group, local-path, and App Store Connect evidence in private notes outside git; public docs must follow `docs/public-release-redaction.md`.

**Profile ↔ certificate mismatch recovery**: when `xcodebuild archive` fails with `Provisioning profile X doesn't include signing certificate Apple Distribution: …`, the profile was issued for the legacy `iPhone Distribution` cert while the keychain only carries the modern `Apple Distribution` cert. Use the `asc` CLI to pull a profile bound to the current cert instead of editing entitlements:

```bash
asc profiles list                                          # find an IOS_APP_STORE profile linked to the Apple Distribution cert
asc profiles view --id <PROFILE_ID> --include certificates # verify the linked cert id
asc profiles download --id <PROFILE_ID> --output /tmp/<name>.mobileprovision
security cms -D -i /tmp/<name>.mobileprovision > /tmp/profile.plist
PROFILE_UUID=$(/usr/libexec/PlistBuddy -c "Print UUID" /tmp/profile.plist)
cp /tmp/<name>.mobileprovision "$HOME/Library/MobileDevice/Provisioning Profiles/$PROFILE_UUID.mobileprovision"
# Then re-archive with PROVISIONING_PROFILE_SPECIFIER set to the new profile name and CODE_SIGN_IDENTITY='Apple Distribution'.
```

**Android**: Requires Java 17. `bun run android` auto-detects via `/usr/libexec/java_home -v 17` or Homebrew paths. Release signing credentials are never committed (uses `keystore.properties` or CI injection).

Android release manifests intentionally avoid legacy storage and overlay permissions. SecureStore is excluded from Android backup/device-transfer rules via `android/app/src/main/res/xml/secure_store_backup_rules.xml` and `secure_store_data_extraction_rules.xml`.

**Web**: Uses Mock DNS (browsers cannot do raw DNS on port 53).

## Apple Platforms (Swift / iOS 26)

When writing or reviewing Swift / iOS 26 / iPadOS 26 code (e.g. the native DNS module under `modules/dns-native/ios/` or Liquid Glass UI parity), consult Xcode's bundled iOS 26 documentation before relying on training memory — these APIs are newer than the knowledge cutoff:

```
/Applications/Xcode.app/Contents/PlugIns/IDEIntelligenceChat.framework/Versions/A/Resources/AdditionalDocumentation/
```

Topics available there include Liquid Glass design (`SwiftUI-`, `UIKit-`, `AppKit-`, `WidgetKit-Implementing-Liquid-Glass-Design.md`), `Swift-Concurrency-Updates.md`, `FoundationModels-Using-on-device-LLM-in-your-app.md`, `SwiftData-Class-Inheritance.md`, `StoreKit-Updates.md`, and more. Read the relevant file directly; do not guess at iOS 26 API shapes.

## Common Issues

| Issue | Solution |
|-------|----------|
| DNS queries fail | Check `modules/dns-native/constants.ts` for server config |
| Default server wrong | Check `src/context/settingsStorage.ts:DEFAULT_DNS_SERVER` |
| Settings not updating | Check `src/context/SettingsContext.tsx` |
| Server picker wrong order | Check `src/navigation/screens/GlassSettings.tsx:dnsServerOptions` |
| Translation mismatch | Update both `en-US.ts` and `pt-BR.ts` |
| Android "Failed to locate application identifier" | Run `npx expo prebuild --platform android --clean` |
| Android minSdkVersion mismatch | Ensure `app.json` has `minSdkVersion: 24` (required by dependencies) |
| Android signature mismatch on install | Uninstall existing app: `adb uninstall <ANDROID_PACKAGE>` |
| DNS Native Module not registered | The `dns-native-plugin.js` handles this - regenerate with prebuild |
| `useAccessibility must be used within an AccessibilityProvider` in tests | Use the resilient variants (`useHighContrast`, `useMotionReduction`, …) which default-out; only call `useAccessibility()` from components that always render under the provider tree (or stub it in the suite's `jest.mock("../src/context/AccessibilityContext", …)`). |
| `Provisioning profile … doesn't include signing certificate` during archive | Pull the matching profile via `asc profiles download` (see "Platform Notes / iOS"). |
| Theme override doesn't apply | `Appearance.setColorScheme()` accepts `'unspecified' \| 'light' \| 'dark'` on RN 0.85, not `null` or `undefined`. |
