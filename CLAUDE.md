# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is DNSChat

A React Native Expo app that sends short prompts as DNS TXT queries to LLM servers and renders responses. Uses React Native 0.86.x, Expo SDK 57, React 19.2.3, TypeScript 6.x.

**Default DNS Server**: `llm.pieter.com:53` (by @levelsio) - the only server in the automatic chain.
**`ch.at:53`** is still in `DNS_SERVERS` and selectable in Settings, but it is **not** an automatic fallback (it is offline). See DNS Server Fallback Chain below.

## Start Here

This file covers architecture, commands, and platform mechanics. The companion docs own the rest:

| Doc | Owns |
|-----|------|
| `AGENTS.md` | Guardrails, requirement contract, review/security sweep protocol, release + TestFlight protocol |
| `docs/technical/SPECIFICATION.md` | Product and engineering behavior contract (read before broad review or behavior changes) |
| `docs/README.md` | Documentation index |
| `DESIGN.md`, `PRODUCT.md` | Visual system + product intent (source of the Plain Language Rule enforced in tests) |

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
| Theme preference (System/Light/Dark) | `src/context/settingsStorage.ts:themePreference` -> `app/_layout.tsx` `Appearance.setColorScheme`; web-safe resolution via `src/ui/theme/resolvedColorScheme.ts` (`useResolvedColorScheme`) |
| Cross-platform alerts / confirmations | `src/utils/appAlert.ts` (`appAlert`) — use instead of `Alert.alert` (no-op on web) |
| Responsive layout (phone/tablet/desktop) | `src/ui/hooks/useResponsiveLayout.ts` |
| Accessibility provider + resilient hooks | `src/context/AccessibilityContext.tsx` |
| Glass UI primitives | `src/components/LiquidGlassWrapper.tsx`, `src/components/glass/*` |

## Commands

**Toolchain**: pnpm `11.17.0` pinned via `packageManager` (CI enables Corepack); `.node-version` is `24`, `engines.node >= 22.13 < 26`, CI pins Node `22.23.1`. Use Node 22.13+ or 24 - React Native and Metro require that floor on the Node 22 line, and `verify:react-compiler` breaks on Node 26 (see Common Issues). Never pass a `--` separator to a pnpm script (also Common Issues).

```bash
# Development
pnpm run start       # Expo development server
pnpm run ios         # Build and run iOS
pnpm run android     # Build and run Android (auto-selects Java 17)
pnpm run web         # Web preview (uses Mock DNS)

# Typecheck and tests
pnpm run typecheck   # tsc --noEmit (first gate in CI)
pnpm run typecheck:dns-native # Isolated tsc gate for modules/dns-native
pnpm run test        # Run all unit tests (jest --runInBand)
pnpm run test --testPathPattern=<pattern>  # Run specific test file
pnpm run verify:fast # typecheck + format check + lint + test (inner loop)
# Runtime UI verification: Argent MCP (policy: "Argent MCP Runtime Verification" below).

# Formatting and linting
pnpm run fmt         # Write deterministic JS/TS/JSON/CSS formatting with Oxfmt
pnpm run fmt:check   # Check formatting without writing
pnpm run lint        # Oxlint correctness + ast-grep structural rules

# DNS module tests (separate workspace)
cd modules/dns-native && pnpm run test

# DNS smoke tests (no RN runtime)
dig @llm.pieter.com "hello" TXT +short  # Quick server test
node test-dns-simple.js "test message"
pnpm run dns:harness --message "test message"

# iOS pod helpers
pnpm run verify:ios-pods   # Check lockfile sync
pnpm run fix-pods          # Basic CocoaPods cleanup
pnpm run clean-ios         # Deep pods reset

# iOS CLI release smoke
xcodebuild -workspace ios/DNSChat.xcworkspace -scheme DNSChat -showdestinations
xcodebuild clean build -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 17'
xcodebuild clean build -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Release -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO
xcodebuild clean archive -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Release -destination 'generic/platform=iOS' -archivePath /tmp/DNSChat.xcarchive CODE_SIGNING_ALLOWED=NO
asc doctor                # Local App Store Connect CLI health; upload/submission checks need credentials

# iOS physical-device / TestFlight release path
# Device install must use the compiled native app, not Expo Go.
#
# Use -configuration RELEASE for a standalone install. Release embeds
# main.jsbundle; a Debug device build has NO bundle and boots straight to the
# React Native redbox "No script URL provided" unless Metro is running and
# reachable from the device. Only build Debug on device when you are actively
# attached to Metro.
xcodebuild clean build -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Release -destination 'platform=iOS,id=<DEVICE_UDID>' -derivedDataPath <DERIVED_DATA> -allowProvisioningUpdates DEVELOPMENT_TEAM=<TEAM_ID> CODE_SIGN_STYLE=Automatic
ls <DERIVED_DATA>/Build/Products/Release-iphoneos/DNSChat.app/main.jsbundle   # must exist
xcrun devicectl device install app --device <COREDEVICE_ID> <DERIVED_DATA>/Build/Products/Release-iphoneos/DNSChat.app

# Device identifiers: `xcrun devicectl list devices` gives the CoreDevice id
# (for `install`/`launch`); `xcrun xctrace list devices` gives the hardware
# UDID (for the xcodebuild `-destination id=`). They are different values.
#
# Survival + smoke proof (a successful launch response alone proves nothing):
xcrun devicectl device process launch --device <COREDEVICE_ID> --console <BUNDLE_ID>   # hold ~30s
xcrun devicectl device info processes --device <COREDEVICE_ID>                          # app still listed
xcrun devicectl device process launch --device <COREDEVICE_ID> --payload-url 'dnschat://' <BUNDLE_ID>
xcrun devicectl device capture screenshot --device <COREDEVICE_ID> --destination <PATH>.png

# Signed TestFlight export requires a distribution identity + App Store profile.
xcodebuild clean archive -workspace ios/DNSChat.xcworkspace -scheme DNSChat -configuration Release -destination 'generic/platform=iOS' -archivePath /tmp/DNSChat.xcarchive DEVELOPMENT_TEAM=<TEAM_ID> CODE_SIGN_STYLE=Manual PROVISIONING_PROFILE_SPECIFIER='<APP_STORE_PROFILE>' CODE_SIGN_IDENTITY='iPhone Distribution'
xcodebuild -exportArchive -archivePath /tmp/DNSChat.xcarchive -exportPath /tmp/DNSChat-export -exportOptionsPlist /tmp/DNSChat-ExportOptions.plist
asc publish testflight --app <APP_ID> --ipa /tmp/DNSChat-export/DNSChat.ipa --version <VERSION> --build-number <BUILD> --group <GROUPS> --wait

# Verification gates
pnpm run verify:android    # Sanity check tooling/device
pnpm run verify:android-16kb # Validate 16KB page size alignment after a native Android build
pnpm run verify:typed-routes # Generate and validate Expo Router typed routes
pnpm run verify:dnsresolver-sync # iOS/Android DNSResolver source parity
pnpm run verify:sdk-alignment # Expo SDK 57 dependency version alignment
pnpm run verify:react-compiler # Run React Compiler healthcheck
pnpm run verify:react-doctor # Run react-doctor (scoped to this project)
pnpm run verify:public-redaction # Ensure public docs do not expose local release identifiers
pnpm run verify:security # Run dependency audit plus gitleaks secret scan
pnpm run verify:all     # Run ALL verification gates (lint, test, pods, sdk alignment, etc.)

# Version sync
pnpm run sync-versions     # Sync version across package.json, app.json, native configs
pnpm run sync-versions:dry # Preview changes
```

## Architecture

### Routing & Bootstrap

This app uses **Expo Router** (file-based routing under `app/`), not React Navigation directly. `package.json:main` points at `entry.tsx`, which loads the crypto bootstrap then re-exports `expo-router/entry`. Provider wiring (Settings, Chat, Onboarding, Accessibility, Theme) lives in `app/_layout.tsx`.

`src/navigation/screens/` contains screen components consumed by Expo Router routes — they are not routes themselves. Don't add new files there expecting routing to pick them up; add a route in `app/` and import the screen.

`experiments.reactCompiler: true` and `experiments.typedRoutes: true` are enabled in `app.json`. Manual `useMemo`/`useCallback` should be removed (the compiler handles memoization). Run `pnpm run verify:typed-routes` after adding/renaming routes.

**React Compiler conventions** (keeps `react-doctor` at 100/100 — see `implementation-notes.html`):
- Reanimated shared values must use the `.get()`/`.set()` accessors, never `.value` (the compiler cannot optimize `.value`).
- Hold "create once" animated values (`Animated.Value`, `makeMutable`) in a `useState(() => …)` initializer, not `useRef(...).current` — refs cannot be read during render.
- Do not use a `finally` block (the compiler cannot lower it); use `Promise.prototype.finally()` or a trailing cleanup statement after `try/catch`.
- Legitimate external-sync `setState`-in-effect cases (splash settle, route hydration, load-on-mount) are exempted per-file in `doctor.config.json` (react-doctor) and in the `.oxlintrc.json` overrides (Oxlint `react/set-state-in-effect`), not in code. The two tools do not flag the same files, so the lists are maintained independently.
- `react-doctor` must be scoped with `--project chat-dns`; a bare run can report the sibling `paquera-mobile` project from the parent workspace.

### Argent MCP Runtime Verification

Use Argent MCP as the default native simulator proof surface for UI/runtime
work. Before tapping or typing, run discovery first: `describe`,
`debugger-component-tree`, or screenshot. Never guess coordinates. For
release-facing UI, navigation, accessibility, or localization changes, exercise
the compiled native app with Argent screenshots/component-tree evidence after
`pnpm run verify:all` and before claiming release readiness. At session end, call
Argent `stop-all-simulator-servers` and clean up temporary simulator state.

AXe is not the default verification surface in this repo. Use AXe only when the
user explicitly asks for AXe or Argent MCP is unavailable for the required
inspection, and record the exact fallback reason.

### DNS Server Fallback Chain

**Server selection** (search for the `getLLMServers` call site in `src/services/dnsService.ts`):
- If user has selected a server in settings -> use only that server (no fallback)
- Otherwise -> use `getLLMServers()`, which returns `LLM_DNS_SERVERS` in `modules/dns-native/constants.ts` - currently a single entry, `llm.pieter.com:53`

**There is no server-level fallback today.** `LLM_DNS_SERVERS` holds one server, so `queryLLM`'s multi-server loop, `logServerFallback`, and the "All LLM servers are unreachable" message are unreachable in the default configuration. All real fallback happens at the transport level below.

**Native is stricter than JS (since 4.4.0)**: the compiled-in native allowlist is
the two LLM zones only (never a public recursive resolver), the bridge accepts
port 53 and nothing else, and every native query name is pinned to the selected
resolver's zone. Native must stay a strict *subset* of `ALLOWED_DNS_SERVERS`, and
both platforms must narrow identically - enforced by
`modules/dns-native/__tests__/nativeSecurityPolicy.test.ts`. An IP resolver
therefore fails the native rung and falls through to UDP/TCP; with experimental
transports off it is retried `MAX_RETRIES` times and then fails, unless Mock DNS
is on. The Settings picker offers only the two LLM hostnames, so an IP resolver
arrives only from a setting an older install persisted. The Android DNS-over-HTTPS rung
was removed; `androidDnsResolver.policy.spec.ts` fails the build if
`HttpURLConnection` returns to that resolver.

**Transport fallback** (for each server):
1. Native DNS (iOS/Android native module)
2. UDP (react-native-udp) - the socket is bound to an ephemeral port before `send()`; `react-native-udp` throws `ERR_SOCKET_BAD_PORT` from `send()` on an unbound socket, so skipping the bind makes this rung fail 100% of the time. Bind failures report `Failed to bind UDP socket:` and are deliberately *not* reclassified as a blocked port.
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
- `dnsServer`: Selected DNS server (default: `llm.pieter.com`); when set, only that server is used — no fallback chain
- `enableMockDNS`: Use mock responses for testing
- `allowExperimentalTransports`: Enable UDP/TCP fallbacks
- `enableHaptics`: Haptic feedback
- `preferredLocale`: Language preference (null = follow system)
- `themePreference`: `'system' | 'light' | 'dark'` — applied globally via `Appearance.setColorScheme('unspecified' | 'light' | 'dark')` in `app/_layout.tsx`
- `accessibility`: `{ fontSize, highContrast, reduceMotion, screenReader }`

**When you bump `SETTINGS_VERSION`**: add a migration branch in `migrateSettings()` (covers v1, v2, v3, v4+) and update the spec at `__tests__/settings.migration.spec.ts`. New fields must be backfilled with safe defaults across every prior version.

### Theming & Accessibility

- **Palette**: `useImessagePalette()` is the single source of truth for colours. It auto-resolves dark/light and honours `useHighContrast()`. Don't hard-code hex strings in components — read from the palette.
- **Color scheme (web-safe)**: resolve the active scheme through `useResolvedColorScheme()` (`src/ui/theme/resolvedColorScheme.ts`), never raw `useColorScheme()` from `react-native`. `Appearance.setColorScheme` is ignored by react-native-web, so the raw hook would strand the user's Light/Dark preference on web. The palette already routes through it. The hook collapses `null`/`undefined`/`"unspecified"` to `"light"` (its return type is strictly `"light" | "dark"` — `tsc` enforces this).
- **Alerts / confirmations**: call `appAlert()` (`src/utils/appAlert.ts`), never `Alert.alert` directly. `Alert.alert` is a silent no-op on react-native-web; `appAlert` bridges to `window.confirm`/`window.alert` there. Pass a real button list only when you need actions — `appAlert` forwards the platform default (dismissable) when the list is empty.
- **Resilient hooks**: `useHighContrast`, `useMotionReduction`, `useScreenReader`, `useFontSize` return defaults when no `AccessibilityProvider` is mounted (so isolated unit tests don't need to wrap providers). Only `useAccessibility()` itself throws when used outside a provider — keep it that way to catch real wiring bugs.
- **Reduce motion**: any animation in `ChatInput`, `LiquidGlassButton`, `GlassBottomSheet`, screen entrance, etc., must short-circuit to the end state when `shouldReduceMotion` is true. Do not gate haptics on it — those still fire.
- **Responsive bubbles / icons**: `useResponsiveLayout()` returns `{ messageMaxWidth, tabIconSize, isPhone/isTablet/isDesktop }`. Breakpoints: phone < 600, tablet 600–1024, desktop ≥ 1024. Apply `messageMaxWidth` instead of a fixed `"75%"` for chat content.

### Native Module

`modules/dns-native/` is a separate workspace. Constants in `constants.ts` must stay synchronized with iOS/Android implementations.

Key constraints:
- `MAX_MESSAGE_LENGTH: 120` (before sanitization)
- `MAX_DNS_LABEL_LENGTH: 63` (RFC 1035)
- `DNS_SERVERS` array defines server order and ports

### Enforced Repo Policies

`__tests__/` contains policy specs that fail the whole suite (and therefore the pre-commit hook and CI) on things that are easy to write by reflex. Before editing source or docs:

- **No emoji or pictographic glyphs** in any tracked source or doc file (`repo.noEmoji.spec.ts`). This includes markdown you add to `CLAUDE.md`, `README.md`, or the changelog.
- **No `console.*` in `src/`** outside `src/utils/devLog.ts`, `src/utils/androidStartupDiagnostics.ts`, and `src/components/ErrorBoundary.tsx` (`repo.noConsoleLog.spec.ts`). Use `devLog`.
- **No pure-black literals** (`#000` / `#000000`) in `src/components` or `src/navigation` styles (`uiDesignPolicy.spec.ts`). Read colours from `useImessagePalette()`.
- **Plain Language Rule** for user-facing copy: no "magic", "revolutionary", "amazing", "world's first" or their pt-BR equivalents, in either locale (`i18n.plainLanguage.policy.spec.ts`, from `DESIGN.md`).
- **No private URLs or private-range IPs**, no tracked `.env*` files except `*.example` / `*.example.local` (`.env.development.example` is tracked on purpose), no keystores or `.DS_Store`, no non-`.md` files under `docs/App_store/`, and an empty iOS `DEVELOPMENT_TEAM` (`repo.noPrivateUrls`, `repo.hygiene`, `repo.noCredentials`).
- Twelve `*.policy.spec.ts` files assert on **file text** rather than behavior - TS sources (`messageContent`, `rootLayout`, `errorBoundary`, `webAlert`, `webRuntime`, `doctorConfig`), native sources (`iosDnsResolver`, `androidDnsResolver`, `nativeLogging`, `dnsNativePlugin`, `iosScreenshots`), and the Android manifest. A clean refactor can break a test that looks unrelated; update the spec deliberately rather than working around it.

### Pre-commit Hook

Installed via `pnpm install` -> `scripts/install-git-hooks.js`. Runs:
1. `pnpm run verify:ios-pods`
2. `pnpm run fmt:check`
3. `pnpm run lint`
4. `pnpm run test --bail`

### AST-Grep Rules

`sgconfig.yml` (repo root) registers `project-rules/` as the rule directory; `pnpm run lint` scans with it. Eight language-specific rules enforce four bans:
- Imports from the deleted `../components/liquidGlass/` path
- References to the deleted `LiquidGlassNative` module
- Direct imports, `require`, or dynamic imports of the unhardened Markdown renderer
- Tautological Jest equality assertions that compare an observed value with itself

Use `components/LiquidGlassWrapper` for liquid glass and
`src/components/SafeMarkdown.tsx` for untrusted Markdown.

**Two rule files per ban, not one.** ast-grep treats `Tsx` and `TypeScript` as separate languages, and a rule file holds exactly one rule for one language. A single-language rule silently misses half the codebase - that is how this gate originally shipped inert. When adding a rule, add both variants and a fixture for each; `__tests__/repo.lint.spec.ts` runs the linter against `__tests__/fixtures/astgrep/` and asserts `effectiveRuleCount >= 8`, so an inert gate fails the suite.

### Babel Constraint

Do **not** add `react-native-reanimated/plugin` to `babel.config.js:plugins`. In SDK 57 that path is a shim re-exporting `react-native-worklets/plugin`, and `babel-preset-expo` already registers that plugin automatically whenever the package is installed — listing it manually runs the same visitors twice on every file. The only plugin entry is the production-only `transform-remove-console`.

(Ordering is also not a lever here: Babel runs plugins before presets, so the preset's copy always ran last regardless of position.)

### Versioning

`package.json:version` is the source of truth. To bump:

```bash
# 1. Edit package.json version manually, then:
pnpm run sync-versions          # Propagates to app.json (iOS buildNumber, Android versionCode), native modules
pnpm run sync-versions:dry      # Preview without writing
```

Never edit `ios/` or `android/` version fields by hand — they will be overwritten.

## CI

Four workflows run on push to main and PRs: `ci.yml`, `gitleaks.yml` (secret scan), `codeql.yml`, and `public-redaction.yml` (which pins Node `20.19.4`, below `engines.node`).

`ci.yml` runs on Node `22.23.1` with Corepack enabled (four jobs):

- `test`: typecheck, Oxfmt check, `pnpm audit`, verify:ios-pods, verify:expo-doctor, verify:sdk-alignment, verify:typed-routes, verify:dnsresolver-sync, verify:public-redaction, verify:react-compiler, lint, test.
- `dns-native`: typechecks and tests the `modules/dns-native` workspace separately.
- `android`: Java 17 + Gradle `assembleDebug` and `assembleRelease`, then verify:android-16kb.
- `sbom`: generates a CycloneDX SBOM (`anchore/sbom-action`) into `artifacts/sbom/<version>.json` and uploads it as a workflow artifact.

`verify:react-doctor` and `verify:android` are in `verify:all` but not in CI - run `verify:all` locally before a release. (`pnpm audit` runs directly in `ci.yml`; gitleaks has its own workflow.)

## Platform Notes

**iOS — durable rules**:

- Requires Xcode 26.4+, iOS 16.4+ target. Device builds need a local signing team/profile; the repo keeps `DEVELOPMENT_TEAM` empty for public portability. The Podfile clamps every pod target to `IPHONEOS_DEPLOYMENT_TARGET >= 16.4`. The committed pod state is precompiled-mode.
- Toolchain choice (verified 2026-07-10): on a macOS 27 beta host, Xcode 26.6's SWBBuildService dies silently, which makes the nested `expo-modules-jsi` SPM build (the `[CP-User] Build ExpoModulesJSI xcframework` script phase) hang forever at 0% CPU with no crash report — build with `DEVELOPER_DIR=/Applications/Xcode-beta.app/Contents/Developer` instead. On stable macOS, prefer the stable Xcode. (The old note that the Xcode 27 beta cannot compile `expo-modules-jsi` is stale.)
- Keep App Store Connect IDs, tester group names, device names, local paths, profile names, and signing identifiers out of public docs (`docs/public-release-redaction.md`); record exact release evidence in private notes outside git. Do not commit certificates, private keys, `.p12` files, provisioning profiles, or App Store Connect keys.
- `xcodebuild test` is not a native gate yet because the `DNSChat` scheme has no XCTest bundles.
- Archive-lane incident recipe: if an archive fails with an `RNDeps` script error like `node_modules/react-native/scripts/xcode/with-environment.sh: No such file`, `node_modules` (and the `/tmp` DerivedData `.o` cache) may have been wiped mid-build (seen once under a Microsoft Defender fork-storm). Fix: `pnpm install --frozen-lockfile --ignore-scripts`, then archive from durable `$HOME` build paths (not `/tmp`). Grep the archive log for `No such file` and check `ls -ld node_modules` before blaming host load.
- A successful `devicectl` launch response is not survival evidence — build `75` "launched" and exited in ~0.1 s with `___UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption_block_invoke` (missing `UIScene` lifecycle). Require process-survival proof (e.g. the full 30-second `devicectl --console` window plus `dnschat://` cold/warm starts, as done for build `76`).

**iOS — release state**:

- Current TestFlight beta (2026-08-31): `4.3.6` build `84`, tagged
  `v4.3.6-beta1` from the exact source used for the signed archive and IPA.
  TestFlight returned `VALID`; bilingual notes and strict validation (`0`
  errors, `0` warnings) are verified. The physical Release app installed and
  remained running. No matching App Store version exists, so this is not a
  production submission.
- Previous TestFlight release (2026-07-10): `4.2.3` build `77`, `VALID` on TestFlight. Signed archive/export and strict validation passed; physical-device proof belonged to build `76`. No matching App Store version record existed, so it was not a production submission.
- `4.2.3` supersedes `4.2.0` build `73` (`VALID` 2026-07-04): iOS 26 HIG redesign across every screen, DNS transport correctness hardening (wall-clock query budget, UDP `defer` teardown parity, TCP frame-length validation, mixed plain/multipart rejection), storage write-amplification coalescing, dead-module removal, Expo SDK 57 patch alignment (`expo-doctor` 19/19). The backend/transport work ran as dispatched `codex` plans (`plans/001`-`004`), reconciled in the main session (two review misses fixed: an orphaned `doctor.config.json` exemption and the second `DNSResolver.swift` copy); the frontend redesign was authored in the main session.
- Argent caveat from that lane: the accessibility and React component-tree backends worked, but the screenshot/gesture simulator-server backend failed with `simulator-server exited with code before becoming ready` — do not claim tap-flow proof from that run.

If a freshly imported distribution certificate makes `codesign` hang during `[CP] Embed Pods Frameworks`, isolate signing in a temporary or local build keychain, unlock it, set its key partition list, put it first in `security list-keychains`, and pass `OTHER_CODE_SIGN_FLAGS='--keychain <keychain path>'` to `xcodebuild archive`. (Secrets and redaction rules: "iOS — durable rules" above.)

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

**Android**: Requires Java 17. `pnpm run android` auto-detects via `/usr/libexec/java_home -v 17` or Homebrew paths. Release signing credentials are never committed (uses `keystore.properties` or CI injection).

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
| Android "Failed to locate application identifier" | Run `pnpm exec expo prebuild --platform android --clean` |
| Android minSdkVersion mismatch | Ensure `app.json` has `minSdkVersion: 24` (required by dependencies) |
| Android signature mismatch on install | Uninstall existing app: `adb uninstall <ANDROID_PACKAGE>` |
| DNS Native Module not registered | The `dns-native-plugin.js` handles this - regenerate with prebuild |
| `useAccessibility must be used within an AccessibilityProvider` in tests | Use the resilient variants (`useHighContrast`, `useMotionReduction`, …) which default-out; only call `useAccessibility()` from components that always render under the provider tree (or stub it in the suite's `jest.mock("../src/context/AccessibilityContext", …)`). |
| `Provisioning profile … doesn't include signing certificate` during archive | Pull the matching profile via `asc profiles download` (see "Platform Notes / iOS"). |
| Same error on a **development** build, even though the profile names the right cert | Xcode matches certificates by identity, not common name. A reissued `Apple Development` cert has the same CN as the one baked into an older profile. Compare fingerprints - `security find-certificate -c '<CN>' -p \| openssl x509 -noout -fingerprint -sha1` against the SHA-1 of each DER in the profile's `DeveloperCertificates` - and if they differ, rebuild with `-allowProvisioningUpdates CODE_SIGN_STYLE=Automatic` instead of hunting for a profile. |
| Device app shows the red screen `No script URL provided` / `unsanitizedScriptURLString = (null)` | A Debug build was installed on the device. Debug embeds no JS bundle. Rebuild `-configuration Release` (see the device path above) or start Metro and keep the device on the same network. |
| Device/Release build fails at `ExpoSymbols`/`ExpoModulesCore` with "this SDK is not supported by the compiler (the SDK is built with 'Apple Swift version X', while this compiler is 'Y')" | The precompiled Expo module xcframeworks were built with an older Swift than the local Xcode. Re-run `cd ios && EXPO_USE_PRECOMPILED_MODULES=0 bundle exec pod install` to build Expo modules from source, build, then restore the committed pod state (`git checkout ios/Podfile.lock ios/DNSChat.xcodeproj/project.pbxproj ios/DNSChat/PrivacyInfo.xcprivacy && bundle exec pod install`). |
| `[CP-User] Build ExpoModulesJSI xcframework` phase hangs forever (0% CPU, DerivedData frozen, no error) | The nested SPM `xcodebuild` is waiting on a build service that died silently (seen with Xcode 26.6 on a macOS 27 beta host; no crash report). `sample <pid>` shows `waitForBuildWithBuildLog` + `mach_msg2_trap`. Kill the build tree and rebuild with the Xcode that matches the OS beta (`DEVELOPER_DIR=/Applications/Xcode-beta.app/Contents/Developer`). Do NOT patch away the `env -i` in `build-xcframework.sh` — inside the pod phase it must stay, or the inherited Xcode env breaks `Package.swift` paths (`module map file '…/Pods/' not found`). |
| `expo-doctor` reports the owned local module as ignored | Confirm the workspace was installed from the root with `pnpm install --frozen-lockfile`, then run `pnpm run verify:expo-doctor`; the native module is part of the root workspace and must not maintain a nested lockfile or install. |
| `Build input file cannot be found: …ReactCodegen/*-generated.mm` during device/Release build | New-Arch codegen is partially materialized under `ios/build/generated`. Run `bundle exec pod install` to regenerate the full codegen set — `xcodebuild build` alone never regenerates it. Under host overload also drop to `-jobs 2` + `nice` (the `ExpoModulesJSI` xcframework script phase fork-storms). |
| Theme override doesn't apply | `Appearance.setColorScheme()` accepts `'unspecified' \| 'light' \| 'dark'` on RN 0.85, not `null` or `undefined`. |
| `verify:react-compiler` dies with `ReferenceError: require is not defined in ES module scope` (yargs) | You are on a Node newer than the repo pin. `react-compiler-healthcheck` breaks under Node 26; verified working on Node 24.18.0. Run repo gates under `.node-version` (24), e.g. `PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH" pnpm run verify:all`. |
| Jest matches 0 tests and exits 1 | pnpm forwards `--` **literally** to scripts, so `pnpm run test -- --bail` makes jest read the flags as positional test-name patterns. Drop the `--`: `pnpm run test --bail`. |
| `repo.noCredentials.spec.ts` fails locally | A local signing setup filled iOS `DEVELOPMENT_TEAM` in `ios/DNSChat.xcodeproj/project.pbxproj`. It also makes `sync-versions.js` refuse to run, so `syncVersions.spec.ts` fails too. That breaks `pnpm run test`, `verify:all`, and the pre-commit hook. Blank only that field before committing - `sed -i '' 's/DEVELOPMENT_TEAM = [A-Z0-9]*;/DEVELOPMENT_TEAM = "";/g' ios/DNSChat.xcodeproj/project.pbxproj` - and never stage it. Do not `git checkout` the whole pbxproj: that also discards unrelated unstaged native project edits. |

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues in `mneves75/dnschat` (via the `gh` CLI). External PRs are **not** a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical vocabulary — label strings equal the five role names (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` + `docs/adr/` at the repo root (created lazily by `/domain-modeling`). See `docs/agents/domain.md`.
