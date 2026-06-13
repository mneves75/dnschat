# Changelog

All notable changes to DNSChat will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [Unreleased]

## [4.0.31] - 2026-06-13

Build `64` -> `65`. Security and CI hardening release. Resolves all open
Dependabot advisories, repairs the three failing CI jobs, aligns the Expo
SDK 56 packages, and reconciles the default branch with the 4.0.25-4.0.30
release prep that had only lived on the working branch.

### Security

- Resolved all 8 open Dependabot advisories:
  - `shell-quote` 1.8.3 -> 1.8.4 (GHSA-w7jw-789q-3m8p, critical) in the
    dns-native module lockfile.
  - `addressable` 2.8.8 -> 2.9.0 (GHSA-h27x-rffw-24p4) in `ios/Gemfile.lock`.
  - `activesupport` 7.2.3 -> 7.2.3.1 (GHSA-2j26-frm8-cmj9,
    GHSA-89vf-4333-qx8v, GHSA-cg4j-q9v8-6v38).
  - `aws-sdk-s3` 1.205.0 -> 1.225.1 (GHSA-2xgq-q749-89fq).
  - `faraday` 1.10.4 -> 1.10.5 (GHSA-33mh-2634-fwr2, SSRF).
  - `json` 2.16.0 -> 2.19.9 (GHSA-3m6g-2423-7cp3, format string injection).

### Fixed

- Android `assembleDebug` compile error: removed a redundant `executor`
  argument from three `supplyDnsAsync` call sites in both copies of
  `DNSResolver.java`. The wrapper takes a single `Supplier<T>` and binds
  the shared executor internally; the extra argument had failed `javac`
  since the wrapper was introduced.
- dns-native CI install: restored `modules/dns-native/package-lock.json`
  (CI runs `npm ci` there) and bumped its `typescript` to `~6.0.3` and
  `ts-jest` to `^29.4.9` so the `ignoreDeprecations "6.0"` tsconfig
  compiles under Node.
- `bun.lock` regenerated at `lockfileVersion 1` so the CI-pinned bun
  `1.3.9` can parse it (the dev machine's bun 1.4.0 emits v2).

### Changed

- Aligned 8 Expo SDK 56 packages to the expo-doctor expected patches
  (`expo` 56.0.11, `expo-router` 56.2.10, `expo-constants` 56.0.18,
  `expo-asset` 56.0.17, `expo-linking` 56.0.14, `expo-build-properties`
  56.0.18, `@expo/ui` 56.0.17, `@expo/metro-runtime` 56.0.15) and removed
  a stale `overrides["expo-constants"]` pin that had capped the tree.
- Removed stale `docs/GUIDELINES-REF` references from repo config
  (`.gitignore`, `knip.json`, `tsconfig.json`, doctor configs).
- Bumped version metadata to `4.0.31` build/code `65` with
  `bun run sync-versions`.

### Release status

- All four CI jobs (`dns-native`, `test`, `android`, `sbom`) green on
  `2026-06-13`; `bun run verify:expo-doctor` reports `20/20`.
- Uploaded to TestFlight on `2026-06-13`: build `65` processed as `VALID`
  and was distributed to the internal tester group, with `What to Test`
  notes set for `en-US` and `pt-BR`. `ITMS-90534` did **not** recur — the
  stable Xcode slot (`26.6`, build `17F109`) is GM-licensed, so App Store
  Connect accepted the binary. The earlier "beta seed" diagnosis was
  incorrect; the archive failures during the retry were self-inflicted by an
  invalid `DEVELOPER_DIR` override pointing at a non-existent toolchain, not
  by the toolchain in the stable slot. The proven lane uses the default
  `xcode-select` Xcode (no `DEVELOPER_DIR` override) and, under host
  overload, an incremental archive with limited concurrency (`-jobs 3`,
  `nice`) to avoid fork-storm `SIGKILL`s.

## [4.0.30] - 2026-06-10

Build `63` -> `64`. TestFlight staging release of the 4.0.29 review
hardening; no source changes beyond version metadata.

### Changed

- Bumped Expo, iOS, and Android version metadata to `4.0.30` build/code `64`
  with `bun run sync-versions` so the signed TestFlight archive is built from
  the verified post-review source state.

### Release status

- Signed App Store archive and IPA export succeeded for `4.0.30` build `64`.
- TestFlight upload committed, but App Store Connect processing rejected the
  binary with `ITMS-90534` (Invalid Toolchain): the machine's stable Xcode
  slot was updated to the `26.6` beta seed on `2026-06-02`, and the only
  other toolchain (Xcode 27 beta) cannot compile `expo-modules-jsi`. The
  upload will be retried from a GM toolchain (Xcode 26.5 reinstall or the
  26.6 GM when released); the next attempt should bump the build number.

## [4.0.29] - 2026-06-10

Build `62` -> `63`. Full security, architecture, and performance review of the
codebase with fixes applied across the DNS pipeline, native layer, storage,
and UI.

### Security

- Bumped `dnsjava` from 3.5.2 to 3.6.2 in both Android Gradle files
  (CVE-2024-25638, improper DNS response validation in the legacy fallback).
- Native server allowlist updates from JS are now subset-only on iOS and
  Android: `configureSanitizer` can narrow but never widen the compiled-in
  allowlist (hardens against a hijacked JS bundle).
- JS UDP fallback no longer fails the whole query on the first invalid
  datagram: the listener re-arms and keeps waiting for a valid, ID-matched
  response until timeout (anti-spoofing resilience).
- Inbound TXT responses are sanitized before persistence/rendering: C0/C1
  control characters and Unicode bidi override controls are stripped
  (display-spoofing defense for untrusted DNS servers).
- `toUint8Array` in the DNS wire decoder now respects typed-array view
  bounds (`byteOffset`/`byteLength`).
- Multipart TXT responses are capped at an explicit part limit instead of
  relying on a caught `RangeError` for absurd `n/N:` headers.
- Pinned the unmaintained fallback transports `react-native-udp` and
  `react-native-tcp-socket` to exact versions; forced `shell-quote >= 1.8.4`
  via overrides (GHSA-w7jw-789q-3m8p, critical).
- Enabled additional Clang security diagnostics in the Xcode project
  (`CLANG_ANALYZER_SECURITY_*`, `CLANG_WARN_IMPLICIT_FALLTHROUGH`,
  `GCC_TREAT_IMPLICIT_FUNCTION_DECLARATIONS_AS_ERRORS`).
- Replaced a personal device name in public docs with a neutral placeholder
  and extended `verify:public-redaction` with a device-name denylist rule.

### Performance

- Splash screen dismissal no longer waits for full DNS-log store decryption;
  log initialization happens off the critical startup path.
- Chat storage keeps a validated in-memory cache inside the serialized
  operation queue: message sends no longer re-read, re-decrypt, and
  re-validate the entire history for every mutation.
- Chat list rows no longer mount one hidden Modal action sheet each; a single
  shared action sheet serves the whole list.
- `MessageBubble` is memoized across the FlatList boundary (documented
  exception to the no-manual-memoization rule), eliminating markdown
  re-parses of all visible bubbles on every chat state update.
- `DNSLogService` skips log fan-out entirely when no listener is subscribed
  and caches compiled redaction regexes per query.
- ChatContext no longer recreates its value on unrelated settings changes
  (settings are read at call time via a ref), and the chat-title expression
  is computed once.
- Removed the manual `useMemo` in the root layout, the redundant rate-limit
  cleanup interval, per-render `Localization.getLocales()` calls, dead
  allocations in `Toast`, and eager allocation of 100 staggered-list animated
  values regardless of item count.
- Expensive `devLog` argument construction is now gated behind `__DEV__` at
  hot call sites so release builds skip it.

### Changed

- Consolidated the duplicated multipart TXT parser into a single
  implementation in `modules/dns-native`; `dnsService` delegates and wraps
  errors at the boundary.
- Extracted `validateDNSServer`/`normalizeDNSServerInput` into
  `src/services/dnsServerValidation.ts` so settings storage no longer pulls
  the full DNS transport stack (and its socket libraries) at module load.
- The default DNS server is derived from `getDefaultServer()` instead of
  being hardcoded in three places.
- Unified the duplicated `AccessibilityConfig` type into
  `settingsStorage.ts`; removed the TCP frame encoder duplication in
  `dnsWire.ts`.
- Bumped Expo, iOS, and Android version metadata to `4.0.29` build/code `63`
  with `bun run sync-versions`.

### Removed

- Dead `src/utils/dnsErrors.ts` (hardcoded pt-BR strings outside i18n) and
  its orphaned spec, the stale `__tests__/archive/` artifact, and the unused
  npm `package-lock.json` in `modules/dns-native`.

### Fixed

- Podfile now clamps every pod target to `IPHONEOS_DEPLOYMENT_TARGET >= 16.4`;
  newer Xcode toolchains reject the 9.0/12.4/13.4 values shipped by
  resource-bundle pod targets, which broke simulator Release builds.
- Cleared a local signing team identifier that had leaked into the Xcode
  project file (repo policy: `DEVELOPMENT_TEAM` stays empty for portability).
- Orphaned `doctor.config.json` exemptions for deleted components are now
  caught by a new policy spec that validates every listed path exists.

### Verified

- `npx react-doctor@latest --project chat-dns` reports `100 / 100`; the
  dns-native module reports `100 / 100`.
- React Compiler healthcheck compiles `107 / 107` components.
- Jest: `117` suites passed (`1` skipped), `941` tests passed (`13` skipped).
- dns-native workspace: `8` suites passed (`1` skipped), `65` tests passed.
- `bun run verify:expo-doctor` `20/20`; typecheck and lint clean;
  `gitleaks` no leaks; `bun audit` no vulnerabilities;
  `verify:public-redaction` clean.
- Simulator Release build succeeds with the stable Xcode toolchain
  (`DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer`); the Xcode 27
  beta toolchain cannot compile `expo-modules-jsi` yet.
- Compiled Release app verified on the iOS Simulator: clean launch and
  relaunch, storage corruption recovery, and a normal launch with Reduce
  Motion enabled (simctl screenshot evidence; Argent MCP simulator-server
  was unavailable this session — version mismatch fallback recorded).

## [4.0.28] - 2026-06-08

Build `61` -> `62`. TestFlight chat-error presentation repair and React Doctor
tooling drift cleanup.

### Fixed

- Replaced the oversized DNS failure toast shown in TestFlight with compact
  localized error copy, bounded toast layout, and a reachable retry action.
- Render failed assistant messages as concise localized text instead of showing
  raw DNS troubleshooting diagnostics in the chat bubble.
- Renamed root and native-module React Doctor configs to `doctor.config.json`
  so the current CLI reads the intended scoped rules.
- Removed React Doctor fail-level dependency churn in toast, onboarding, and
  text-input effects while keeping React Compiler conventions intact.

### Changed

- Bumped Expo, iOS, and Android version metadata to `4.0.28` build/code `62`
  with `bun run sync-versions --bump-build`.

### Verified

- `npx react-doctor@latest --project chat-dns` reports `100 / 100`.
- `cd modules/dns-native && npx react-doctor@latest --verbose` reports
  `100 / 100`.
- Targeted regression suites for toast, chat retry, message content,
  bottom-sheet accessibility, text input state sync, settings persistence, and
  message-list behavior passed.
- `cd modules/dns-native && bun run test` passed.

## [4.0.27] - 2026-06-08

Build `60` -> `61`. Expo SDK 56 patch alignment and TestFlight staging refresh
after the security review.

### Changed

- Bumped Expo, iOS, and Android version metadata to `4.0.27` build/code `61`
  with `bun run sync-versions --bump-build`.
- Aligned Expo SDK 56 patch packages and regenerated the Bun and CocoaPods lock
  state so Expo Doctor, JS dependencies, and native pods agree before the signed
  archive.
- Updated public release docs, App Store/TestFlight runbooks, security baseline,
  and implementation notes for the 4.0.27 TestFlight lane.

### Verified

- `bun run verify:all` passed, including public redaction, security, Expo
  Doctor `20/20`, SDK alignment, typed routes, typecheck, DNS resolver sync,
  iOS pods sync, React Compiler healthcheck, Android setup checks, lint, and
  Jest.
- `cd modules/dns-native && bun run test` passed.
- `asc doctor` passed.
- Xcode Debug simulator build passed after the pod refresh.
- Signed App Store archive/export and TestFlight upload/validation are the
  required distribution gates for this build. App Store version validation is a
  separate App Store-submission state check and remains not applicable until a
  matching App Store version record exists.

## [4.0.26] - 2026-06-05

Build `59` -> `60`. Release packaging and TestFlight staging pass for the
premium/react-doctor hardening line.

### Changed

- Bumped Expo, iOS, and Android version metadata to `4.0.26` build/code `60`
  with `bun run sync-versions --bump-build`.
- Updated public release docs, App Store/TestFlight runbooks, security baseline,
  and implementation notes to reflect the fresh verification and deployment
  evidence.
- Switched the AXe release E2E default simulator profile to iPhone 17 Pro Max
  after AXe 1.7.1 could not describe the visible UI on the plain iPhone 17
  simulator.

### Fixed

- Made the AXe E2E harness tolerate an allowed `xcrun simctl bootstatus`
  timeout instead of aborting before the app can be inspected on slower hosts.

### Verified

- `npx react-doctor@latest --project chat-dns` reports `100 / 100`.
- `bun run e2e:axe:release` passed 10 feature groups for `4.0.26` build `60`.
- `bun run verify:all` passed, including public redaction, security, Expo
  Doctor `20/20`, React Compiler `102/102`, lint, and Jest (`114` suites
  passed, `1` skipped; `919` tests passed, `13` skipped).
- `cd modules/dns-native && bun run test` passed (`7` suites passed, `1`
  skipped; `57` tests passed, `13` skipped).
- Xcode Debug simulator build, unsigned generic Release build, unsigned generic
  Release archive, signed App Store archive, and signed IPA export passed.
- TestFlight upload/processing passed for `4.0.26` build `60`; App Store
  Connect reported processing state `VALID`, and `asc validate testflight`
  reported `0` errors and `0` warnings.
- Direct physical-device install on the personal test device is blocked by local Xcode
  Development provisioning state: `No Accounts: Add a new account in Accounts
  settings` and no matching iOS App Development profile for
  `org.mvneves.dnschat`. TestFlight remains the verified staging path.

## [4.0.25] - 2026-06-05

Build `58` -> `59`. React Compiler cleanliness pass: drove `react-doctor` from
`93/100` to `100/100` by fixing the underlying code rather than blanket
suppression, with no intended behavior change.

### Changed

- Migrated every Reanimated shared-value access to the React Compiler-compatible
  `.get()`/`.set()` accessors across animated components and hooks.
- Replaced `finally` blocks the React Compiler cannot lower with
  `Promise.prototype.finally()` or a trailing cleanup statement, keeping the
  "cleanup always runs" guarantee on every exit path.
- Replaced "create once" `useRef(...).current` holders of animated values with
  `useState` initializers so they are safe to read during render.
- Removed manual `useCallback`/`useMemo` that the React Compiler now memoizes.
- Derived chat error toasts purely from state instead of mirroring them through
  an effect, and trimmed redundant synchronous load flags.
- Made `GlassSettings` import `DNSService` statically (the module is already
  eagerly loaded by the root providers, so the lazy import only blocked
  compilation).

### Fixed

- Chat-list corruption recovery now resets state and clears the loading flag
  even if the best-effort reload itself fails, instead of leaking an unhandled
  rejection.

## [4.0.24] - 2026-06-04

Build `57` -> `58`. Production-readiness hardening after the 4.0.23 App Store
submission.

### Fixed

- Made shared bottom-sheet content scrollable so long localized copy, small
  screens, web, and large text have a recovery path instead of clipping
  unreachable actions.
- Made onboarding progress and first-chat onboarding auto-scroll honor Reduce
  Motion.
- Moved DNS log redaction for active prompt/title values, composed DNS query
  names, and multipart TXT fragments into `DNSLogService` before entries reach
  memory or persistence.
- Kept chat error toasts visible until dismissal or retry and allowed error
  messages to wrap instead of truncating the only visible DNS failure details.
- Bounded font scaling only for fixed-size glyph controls and the message error
  badge while leaving normal message and toast text scalable.
- Restored WCAG AA contrast on the chat message error badge and all toast
  variants by drawing their label from a new `textOnChroma` palette token
  instead of low-contrast white-on-chroma or a hardcoded `#000000` literal.
- Capped Dynamic Type scaling on the bottom-sheet close glyph so the 32x32
  control cannot distort at the largest text sizes.
- Guaranteed DNS query-lifecycle cleanup: `queryLLM` now wraps its body in
  try/finally so a query whose setup throws after logging started is still
  finalized, dropping its raw prompt/title from the in-memory redaction map
  instead of retaining it indefinitely.
- Tightened the composed-DNS-query log redaction to RFC 1035 label bounds
  (no lookbehind, Hermes-safe) so it no longer over-redacts malformed domain
  fragments while still scrubbing well-formed queries.
- Cleared the active-query and sensitive-value maps symmetrically on log
  deletion so deleting any log can never strand in-memory state.

### Added

- Regression coverage for bottom-sheet scroll recovery, onboarding Reduce
  Motion behavior, DNS log boundary redaction, persistent/untruncated error
  toasts, and fixed-glyph font scaling.
- Regression coverage for the query-lifecycle cleanup guard, redaction-regex
  precision, error-badge contrast token, and close-glyph scaling cap.
- `textOnChroma` palette token and a documented lifecycle contract for the
  `sensitiveValuesByQueryId` redaction map.

### Documentation

- Added an "Apple Platforms (Swift / iOS 26)" section to `CLAUDE.md` and
  `AGENTS.md` pointing at Xcode's bundled iOS 26 documentation for native
  module / Liquid Glass work, since those APIs post-date the model cutoff.

### Verified

- `bun run typecheck`, `bun run lint`, `bun run test` (full Jest: 914 passed,
  13 skipped), `cd modules/dns-native && bun run test` (57 passed, 13 skipped),
  `bun run verify:react-compiler` (83/83 components), `gitleaks detect`
  (no leaks), and `bun run verify:public-redaction` all passed.
- A compiled Debug build of the working tree (Apple Development signing) was
  installed and launched successfully on a physical iOS device via `devicectl`,
  validating the startup Reduce Motion path on-device.

## [4.0.23] - 2026-06-04

Build `56` -> `57`. TestFlight and App Store submission refresh.

### Changed

- Bumped app metadata to version `4.0.23` build `57` across Expo, iOS, and
  Android via `bun run sync-versions --bump-build`.
- Renewed App Store screenshot sets for iPhone and iPad in `en-US` and `pt-BR`.
- Updated public release docs and implementation notes with sanitized
  TestFlight, App Store validation, and App Review submission evidence.

### Verified

- `bun run verify:all`, native DNS module tests, `gitleaks detect`,
  `bun audit`, and `asc doctor` passed for the 4.0.23 target.
- Signed App Store archive/export/upload processed to `VALID` in App Store
  Connect for build `57`.
- `asc validate testflight --strict` reported `0` errors and `0` warnings for
  build `57`.
- Pre-submit App Store validation reported `0` errors, `0` warnings, and `0`
  blocking findings; the App Store version is now submitted and
  `WAITING_FOR_REVIEW`.

## [4.0.22] - 2026-06-04

Build `55` -> `56`. Release-device metadata and documentation sync for the
4.0.21 production-readiness fixes.

### Changed

- Bumped app metadata to version `4.0.22` build `56` across Expo, iOS, and
  Android via `bun run sync-versions --bump-build`.
- Updated public release docs and implementation notes with sanitized evidence
  for the physical-device Release build/install/launch lane and TestFlight
  deployment.

### Verified

- `bun run verify:all`, native DNS module tests, `gitleaks detect`, `bun audit`,
  and `asc doctor` pass for the 4.0.22 target.
- A compiled iOS Release build installed on a physical device, reported
  `4.0.22` bundle version `56`, and launched successfully via `devicectl`.
- Signed App Store archive/export/upload processed to `VALID` in App Store
  Connect; `asc validate testflight --strict` reported `0` errors and `0`
  warnings for build `56`.

## [4.0.21] - 2026-06-03

Build `54` -> `55`. Production-readiness review pass after the 4.0.20
reduce-motion hotfix.

### Fixed

- Restored OS Reduce Motion support without reintroducing the 4.0.19 startup
  false-to-true animation transition: the provider now resolves the initial OS
  value before rendering children and subscribes to later
  `reduceMotionChanged` updates.
- Kept haptics independent from Reduce Motion per the repo interaction
  contract: reduced motion ends animations, while haptics still fire when the
  user enables them and hardware supports them.
- Applied the in-app font-size accessibility setting to shared typography
  styles instead of leaving the setting disconnected.
- Localized relative timestamps in the chat list and profile screens through
  the selected app locale.
- Exposed markdown links inside assistant bubbles to screen readers instead of
  letting the parent bubble swallow interactive link semantics.
- Added web dialog semantics and a keyboard focus trap to the shared bottom
  sheet, including Escape-to-close and focus restoration.
- Made the native DNS sanitizer fail closed when native sanitizer configuration
  fails, instead of falling through to unsanitized native DNS calls.
- Stopped automatic DNS fallback from trying the known-offline `ch.at` service;
  the server remains allowlisted for explicit user selection.

### Changed

- Default DNS harness checks now target `llm.pieter.com`, matching the app
  default and avoiding accidental dependence on the offline `ch.at` endpoint.
- Bottom sheet text/action colors now come from the shared iMessage palette so
  dark mode and high-contrast state apply consistently.
- Reduced screen-reader noise in chat input character-limit announcements,
  marked decorative tab/log-status icons as hidden, and improved loading/live
  region announcements.

### Added

- Regression coverage for OS Reduce Motion startup behavior, dynamic type,
  locale mapping, bottom-sheet accessibility/palette policy, markdown link
  exposure, native sanitizer fail-closed behavior, DNS fallback policy, and
  local DNS harness defaults.

## [4.0.20] - 2026-06-02

Build `53` -> `54`. Hotfix for a crash introduced in `4.0.19`.

### Fixed

- **Crash on launch for users with iOS Reduce Motion enabled** ("Maximum update
  depth exceeded"). `4.0.19` derived `isReduceMotionEnabled` from an async
  `AccessibilityInfo` probe that flips `false -> true` after mount; that runtime
  transition re-triggered motion-transition effects across animated screens and
  drove an infinite render loop. Reduce motion is now a stable, in-app preference
  for the whole session.

### Changed

- `AccessibilityContext` no longer mirrors `settings.accessibility` into local
  state via an effect (an update-loop hazard); `config` is now derived directly
  from settings as the single source of truth, and `updateConfig` persists
  through settings.
- Added a behavioral render test (`accessibility.reduceMotion.behavior.spec.tsx`)
  that mounts the provider and fails if the async OS-driven flip or the
  `reduceMotionChanged` subscription is reintroduced. (The previous reduce-motion
  "tests" only string-matched source and could not catch the regression.)

### Known limitation

- The app no longer auto-adopts the OS Reduce Motion setting; users enable reduced
  motion via in-app Accessibility settings. Safe OS auto-detection (without a
  post-mount transition) is deferred pending on-device/simulator verification.

## [4.0.19] - 2026-06-01

Build `52` -> `53`. First distributed build carrying the React Doctor `100/100`
dead-code cleanup and the reduce-motion / retry UX fixes; it also rolls up the
previously-undistributed build `52` changes below.

### Added

- Chat failed-send errors now surface a non-blocking error toast with a localized
  **Retry** action that resends the last failed user prompt, replacing the blocking
  `Alert.alert` dialog.

### Fixed

- `Toast` snaps to its end state and skips spring/timing animations when reduce motion
  is enabled (haptics still fire), and now honors the OS-level reduce-motion setting via
  `AccessibilityInfo` in addition to the in-app accessibility toggle.
- `SkeletonMessage` now adopts the responsive `useResponsiveLayout().messageMaxWidth`
  (phone `75%`, tablet `60%`, desktop `560`) instead of a hardcoded `maxWidth: "75%"`.
  Previously the loading placeholder was wider than the `MessageBubble` that replaced
  it on tablet/desktop, causing a visible layout shift when a response arrived. Now
  matches the documented chat-content width rule and `MessageBubble`'s pattern. Build
  `51` -> `52`.

### Changed

- Corrected the `react-doctor.config.json` ignore overrides to use the current
  `deslop/*` rule namespace (root + `modules/dns-native`). The overrides previously
  targeted obsolete `react-doctor/*` / bare ids that no longer matched react-doctor
  v0.2.6 output, so no dead-code ignore applied; `chat-dns` now scores `100/100`
  with no detection rule disabled globally. Pruned the matching `knip.json` entries.
- Aligned five Expo SDK packages to the versions required by the installed SDK so
  `expo-doctor` returns `20/20`: `expo` `56.0.6`->`56.0.8`, `expo-router`
  `56.2.7`->`56.2.8`, `expo-linking` `56.0.12`->`56.0.13`, `expo-build-properties`
  `56.0.15`->`56.0.16`, `@expo/ui` `56.0.14`->`56.0.15`. Installed with a per-command
  `--minimum-release-age=0` override for only these packages (global Bun supply-chain
  policy unchanged).

### Removed

- Deleted 9 unreferenced dead-code files (verified zero repo-wide imports):
  `ChatListItem`, `InfoIcon`, `icons/LogsIcon`, `icons/SettingsIcon`,
  `ui/LiquidGlassButton`, `ui/LiquidGlassCard`, the unwired `navigation/screens/Home`
  screen, and the unused `onboarding/index` and `ui/hooks/index` barrels. Net `-715`
  lines; source file count `262` -> `253`.
- Dropped the obsolete `expo-modules-autolinking@56.0.13` Bun patch. `expo@56.0.8`
  pulls `expo-modules-autolinking@56.0.14`, which ships the Swift macro-plugin
  resolution fix upstream, so the local patch was no longer applied or needed.
- Removed the unused `@react-native-async-storage/async-storage` dependency from the
  `@dnschat/dns-native` workspace `package.json` (not imported anywhere in the module).

## [4.0.18] - 2026-05-28

### Added

- User-facing theme picker in Settings (System / Light / Dark). Selection is
  persisted alongside other preferences and applied globally via
  `Appearance.setColorScheme` so palette, navigation, and system controls all
  observe the override.
- `useResponsiveLayout` hook driving message-bubble max-width and web tab icon
  size so iPad/landscape and large desktop windows no longer leave chat bubbles
  stretched or icons disproportionately small.
- Accessibility-grouped `accessibilityRole="summary"` containers on onboarding
  Feature cards and the Ready card so screen readers announce each item once
  with full context instead of per-text-node.

### Changed

- Removed hard-coded hex colours from `ErrorBoundary`, `SkeletonMessage`,
  `Toast`, and the web `NativeMenu` fallback. All four now resolve colours
  through `useImessagePalette()` so dark mode and high-contrast preferences
  apply consistently.
- `useImessagePalette`, `useMotionReduction`, `useScreenReader`, `useFontSize`,
  and `useHighContrast` now fall back to safe defaults when no
  `AccessibilityProvider` is mounted (kept the explicit-throw contract only on
  the top-level `useAccessibility` hook).
- Honoured the reduce-motion preference on `ChatInput` send-button press,
  height resets, opacity transitions, `LiquidGlassButton` press scale, and
  `GlassBottomSheet` enter/exit timings.
- Onboarding NetworkSetup loading and recommendation panels now announce via
  `accessibilityLiveRegion` so the screen reader hears completion without
  re-focus.
- Settings transport test/force buttons now size to the platform minimum touch
  target via `getMinimumTouchTarget()` (44pt iOS / 48dp Android) instead of a
  hardcoded 44, matching `ChatInput`/`Chat`/`LiquidGlassButton`.

### Fixed

- Corrupted chat storage with a `null` or non-primitive `createdAt`/`updatedAt`/
  `timestamp` is now rejected as `StorageCorruptionError` instead of being
  silently coerced to the 1970 epoch by `new Date(null)` (which would reorder
  the chat list). Date reviver validates value type before constructing `Date`.
- Web preview now emits a one-time runtime warning when the encryption key is
  persisted to browser storage, making explicit that web storage is not a secure
  at-rest boundary (already documented in `SECURITY.md` / `docs/data-inventory.md`;
  native builds continue to use SecureStore).

### Migration

- Settings schema bumped to `SETTINGS_VERSION = 5` with a new
  `themePreference: 'system' | 'light' | 'dark'` field (default `system`).
  Migrations from v1–v4 backfill the field and preserve existing values.

### Verified

- `bun run typecheck` passes.
- Focused regression sets pass: i18n parity, settings migration, onboarding
  accessibility, ChatInput behavior, and native menu fallback.
- Post-review hardening (build 51): `bun run verify:all` passes (871 tests,
  13 skipped), `modules/dns-native` tests pass (56), `gitleaks` reports no
  leaks, and an independent code review found no critical/high/medium issues.
- TestFlight: signed archive and IPA export succeeded; `asc publish testflight`
  processed build 51 to `VALID`; `asc validate testflight --strict` reports
  0 errors / 0 warnings with bilingual "What to Test" notes. App Store version
  validation is not applicable (no 4.0.18 App Store version record exists).

## [4.0.17] - 2026-05-28

### Changed

- Removed `expo-dev-client` from the release dependency graph and refreshed the
  iOS pod/project references so TestFlight builds no longer carry Expo dev
  launcher/menu resources.
- Rolled `GlassBottomSheet` back to the React Native modal implementation and
  removed the hidden native bottom-sheet adapter surface implicated by the
  build 47 startup-crash investigation.
- Updated Settings, onboarding, and web chat layout copy/spacing to reduce
  overclaiming, expose selected language state, keep desktop chat/form width
  readable, and avoid dark-mode diagnostic text contrast failures.

### Fixed

- Made the root error boundary provider-independent so startup/render failures
  below `I18nProvider` can show a recovery UI instead of throwing again.
- Kept DNS query success independent from DNS-log persistence failures while
  preserving user-visible failure reporting for explicit log deletion.
- Cleared corrupted chat/log backup payloads when users clear local data, and
  made log deletion mutate in-memory state only after storage deletion succeeds.
- Hardened Android legacy DNS fallback parsing so accepted TXT records must
  match the requested owner name and IN class.
- Replaced missing chat deep links with an explicit "conversation not found"
  state instead of silently creating a blank conversation.

### Verified

- Focused regression set passed: `10` Jest suites and `102` tests.
- `bun run typecheck` passed after the startup-crash and persistence fixes.

## [4.0.16] - 2026-05-27

### Added

- Added regression coverage for Markdown link routing, DNS TXT answer owner/class
  validation, sanitized multipart conflict errors, onboarding transport copy, and
  accessibility actions on message/chat/log/settings surfaces.
- Added selective Expo UI adapter coverage for native menu and bottom-sheet
  fallbacks, including stricter Jest mocks for native UI surfaces.
- Added React Doctor configuration for the app and native module workspaces so
  `npx react-doctor@latest` reports a clean 100/100 score for both projects.

### Changed

- Extended the DNS resolver sync gate to cover the tracked iOS prebuild resolver
  copy as well as Android.
- Updated onboarding copy so DNS is described as observable infrastructure and
  the TypeScript transport chain is limited to Native, UDP, and TCP.
- Migrated supported action menus and bottom sheets through local Expo UI
  adapter boundaries while keeping web and test fallbacks explicit.
- Bumped app metadata to `4.0.16` build `47` across Expo, iOS, and Android via
  `sync-versions`.

### Fixed

- Routed Markdown links from assistant DNS responses through the shared external
  URL allowlist instead of the markdown library's raw opener.
- Hardened JS and iOS TXT parsing so accepted answers must match the requested
  owner name and IN class.
- Removed TXT payload fragments from multipart conflict errors before they can
  reach encrypted DNS logs.
- Fixed onboarding's DNS demo so it probes each displayed transport directly
  instead of reporting fallback success as Native DNS success.
- Added explicit assistive-technology actions and labels for Settings switches,
  message copy/share, chat open/share/delete, and DNS log summaries.
- Fixed React Doctor error-level findings covering Reanimated hook creation,
  accessibility listener cleanup, and chat input animated layout warnings.

### Verified

- `npx react-doctor@latest` reports `100 / 100` for both `chat-dns` and
  `@dnschat/dns-native`.
- `bun run typecheck`, `bun run test`, and native DNS module tests pass before
  the TestFlight release lane.

## [4.0.15] - 2026-05-24

### Added

- Added focused regression coverage for the shared glass form scroll contract so
  the chat list cannot regress into a non-scrollable content container.
- Added privacy and release-policy tests covering encrypted key fallback
  handling, DNS log redaction, dependency override expectations, web runtime
  boundaries, bottom-sheet accessibility, and visual design guardrails.

### Changed

- Consolidated DNS packet encoding, TCP framing, response validation, and TXT
  extraction behind a dedicated wire-format module so transport orchestration
  stays smaller without changing DNS behavior.
- Aligned the Expo SDK 56 patch package set and regenerated CocoaPods after
  `expo-doctor` reported package-version drift.
- Pinned the React Compiler healthcheck as a dev dependency so the verification
  script runs from a local binary instead of transient `bunx` resolution.
- Bumped app metadata to `4.0.15` build `45` across Expo, iOS, and Android via
  `sync-versions`.

### Fixed

- Fixed the main chat list on iOS so long conversation history scrolls normally
  above the floating native tab bar.
- Hardened encrypted storage key handling, DNS resolver logging, Liquid Glass
  form controls, skeleton surfaces, toast/error states, and bilingual user-facing
  copy without changing DNS protocol behavior.

### Verified

- `bun run verify:all`, native DNS module tests, `gitleaks detect`,
  `bun audit`, and `asc doctor` passed before the TestFlight release lane.
- Signed App Store archive/export, App Store Connect TestFlight upload, and
  `asc validate testflight` passed for build `45`; App Store version validation
  is not applicable until a matching App Store version record exists.

## [4.0.14] - 2026-05-22

### Changed

- Upgraded the app baseline to Expo SDK `56.0.3`, React Native `0.85.3`,
  React `19.2.3`, and TypeScript `6.0.3`.
- Raised the iOS deployment baseline to `16.4` and regenerated CocoaPods for
  the SDK 56 native module graph.
- Migrated app navigation theme imports to Expo Router SDK 56 entry points and
  removed unused direct React Navigation packages.
- Bumped app metadata to `4.0.14` build `44` across Expo, iOS, and Android via
  `sync-versions`.

### Fixed

- Replaced the removed React Native `StyleSheet.absoluteFillObject` usage in
  the glass bottom-sheet backdrop.

### Verified

- Lint (`ast-grep`), `verify:ios-pods`, and the full Jest suite (816 passed /
  13 skipped, 95 of 96 suites) passed against the SDK 56 baseline.
- Debug + Release iOS device builds compiled and installed on a physical
  iPhone 17 Pro Max via `xcrun devicectl`; the Release build is Apple
  Development signed (team-only) and launched on-device.
- Signed App Store archive, IPA export, and TestFlight upload are intentionally
  not part of this entry — those gates were not run for `4.0.14` build `44`.

## [4.0.13] - 2026-05-17

### Added

- Added Clawpatch-driven regression coverage for chat input behavior, message
  list auto-scroll/footer inset behavior, screen safe-area layout, staggered-list
  API shape, haptics configuration, i18n parity, route gates, native DNS port
  validation, and release-script policies.
- Added an app TypeScript `typecheck` script to the release verification gate.

### Fixed

- Hardened native DNS resolvers by validating TXT answer owner/class, rejecting
  invalid ports, avoiding prompt-derived native logs, and failing closed when
  resolver executors are saturated.
- Hardened release scripts for Android 16KB checks, version/build validation,
  ADB reverse serial handling, DNS harness transport parsing, and AXe success
  screenshot capture.
- Fixed cold chat deep-link hydration, chat deletion races, plaintext migration
  overwrite risk, DNS log subscription timing, Secure RNG bootstrap failure
  handling, haptics availability retries, and visible DNS log redaction.
- Fixed bilingual user-facing copy gaps across chat list, share, logs, skeletons,
  error states, profile clear-all, onboarding progress/navigation, and toast
  dismissal accessibility.
- Fixed UI edge cases in GlassForm navigation, bottom-sheet drag reset, tab-bar
  safe-area/accessibility semantics, text-input focus state, glass card styling,
  async button press containment, empty-state accessibility, and loading states.

### Security

- Disabled Android application backup for local encrypted-history storage while
  keeping SecureStore key material excluded from backup/device-transfer rules.
- Removed debug-optimized Android overlay/cleartext overrides and JitPack
  dependency resolution from the native DNS module.

### Changed

- Bumped app metadata to `4.0.13` build `43` across Expo, iOS, and Android via
  `sync-versions`.
- Shipped `4.0.13` build `43` through signed iOS archive/export and TestFlight
  processing, with TestFlight and App Store version validations returning no
  errors or warnings.
- Updated release docs, App Store/TestFlight notes, and verification baseline
  for the Clawpatch hardening release.

## [4.0.12] - 2026-05-15

### Fixed

- Fixed native navigation chrome theme alignment so chat detail toolbar icons,
  titles, and header surfaces resolve from the app palette in light and dark
  modes instead of falling back to mismatched React Navigation defaults.
- Fixed chat detail auto-scroll after keyboard/input inset changes so the final
  message stays visible above the composer.

### Security

- Hardened external link handling by routing app-opened URLs through a shared
  `https:` / `mailto:` allowlist with failure handling instead of direct native
  opener calls.

### Changed

- Bumped app metadata to `4.0.12` build `42` across Expo, iOS, and Android via
  `sync-versions`.
- Updated release docs, App Store/TestFlight notes, and verification baseline
  for the dark-mode navigation release.

## [4.0.11] - 2026-05-15

### Changed

- Bumped app metadata to `4.0.11` build `40` across Expo, iOS, and Android via
  `sync-versions`.
- Updated release docs, App Store/TestFlight notes, and agent guidance for the
  Expo Router route-resolution release.

### Fixed

- Fixed dynamic chat routes so the navigation title, share action, and delete
  action resolve from the route `threadId` instead of a stale `currentChat`.
- Removed duplicate chat-list route ownership so chat rows navigate through the
  existing route handler without nesting an extra `Link` around the pressable
  item.

## [4.0.10] - 2026-05-15

### Added

- Added a repeatable AXe simulator E2E loop with a source-backed feature
  manifest, human coverage checklist, package scripts, and failure artifacts
  for screenshots, accessibility dumps, and simulator diagnostics.
- Added AXe/Jest coverage for 10 declared feature groups: onboarding, chat
  list, chat thread, DNS transport settings smoke, settings, DNS logs, About,
  profile, not-found fallback, and localization/accessibility context.

### Changed

- Bumped app metadata to `4.0.10` build `39` across Expo, iOS, and Android via
  `sync-versions`.
- Updated release docs, App Store/TestFlight notes, and agent guidance for the
  AXe-verified release workflow.
- Improved chat/onboarding/settings/logs/About/profile/not-found surfaces with
  stable accessibility identifiers and AXe-visible controls for runtime E2E
  validation.
- Made `verify:expo-doctor` preload Ruby `logger` so local CocoaPods `1.16.2`
  is detected reliably by Expo Doctor on this machine.
- Aligned `expo-dev-client` to `55.0.34` with the Expo SDK 55 Doctor baseline
  and refreshed iOS pods.

### Fixed

- Fixed AXe harness handling for delayed iOS deep-link confirmation prompts by
  waiting through the full prompt window and tapping the actual `Button`
  element.
- Fixed AXe route assertions that targeted non-accessible root containers by
  asserting visible labels and child controls instead.

## [4.0.9] - 2026-05-14

### Fixed

- Light/dark mode mismatch on the chat thread navigation header. The root
  `<Stack>` in `app/_layout.tsx` now sets theme-aware `headerStyle`,
  `headerTintColor`, `headerTitleStyle`, `headerShadowVisible: false`, and
  `contentStyle` driven by `useImessagePalette()`. The chat header (back
  arrow, title, three-dot toolbar) now matches the screen body in both modes
  instead of rendering on a white background while the chat content is dark.
- Hardcoded color leaks across screens migrated onto the existing palette
  tokens: Home / Logs DNS-status indicator (`#34C759` → `palette.success`),
  Logs status text and active card surface, Home chat badge surface, and
  GlassSettings option cards (DNS picker, destructive surface, about card)
  now resolve correctly in both light and dark themes. The DNSLogViewer
  badge text now uses `palette.bubbleTextOnBlue` instead of a hardcoded
  `#fff`.

### Changed

- Added a reusable public-release redaction policy, local verification script,
  CI workflow, PR checklist, and docs guidance so release evidence stays split
  between placeholder-based public runbooks and private operator notes.
- Documented the completed DNSChat `4.0.8` TestFlight release evidence across
  README, install, security, App Store, TestFlight, and agent guidance docs:
  physical-device compiled install, signed archive/export, TestFlight
  validation, App Store version attachment, and public-doc redaction rules for
  local release identifiers.

## [4.0.8] - 2026-05-14

### Changed

- Documented the latest iOS CLI release smoke across README, install,
  TestFlight, App Store Connect, and agent guidance: Xcode `26.5` Debug simulator
  build passes, generic iOS Release build/archive pass unsigned, `asc doctor`
  passes local checks, and TestFlight release notes are prepared for build `36`.
- Documented current verification and release expectations across README,
  install, architecture, Android, App Store, and agent guidance surfaces.
- Revised App Store marketing and ASO copy to avoid implying that DNS prompt
  transport is private, end-to-end encrypted, or serverless.
- Clarified product privacy language across docs and screenshot-mode fixtures:
  local history is encrypted at rest, but DNS prompts travel over observable DNS
  infrastructure and must not be described as private or end-to-end encrypted.
- Hardened onboarding, settings, and chat state transitions to fail closed on persistence errors, keep thread selection stable after send failures, and apply onboarding network recommendations atomically.
- Localized onboarding accessibility labels and hints across navigation, DNS demo, first-chat, network setup, GitHub CTA, and the chat-list compose toolbar button.
- Updated the DNS protocol spec to match the shipped resolver behavior and response-validation contract.
- Aligned Expo SDK 55 patch packages with the current Expo Doctor baseline:
  Expo `55.0.24`, Expo Dev Client `55.0.33`, SecureStore `55.0.14`,
  Crypto `55.0.15`, Localization `55.0.14`, Splash Screen `55.0.21`,
  Build Properties `55.0.14`, and System UI `55.0.18`.
- Added an explicit 2026 review plan comparing DNSChat against the current
  Evan Bacon `chat-template`, Expo SDK 55 docs, React Native 0.83 security
  guidance, and the app's DNS privacy contract.
- Pinned the React Compiler healthcheck script to Bun execution so the full
  verification gate avoids Node 26 CommonJS/ESM runner failures.

### Added

- Added Android SecureStore backup/data-extraction policy tests and XML rules so
  encrypted key material is excluded from cloud backup and device transfer.
- Added `firebase-debug.log` patterns to `.gitignore` to keep local debug
  artifacts out of the repo.
- Added repository policy tests that block misleading DNS privacy/encryption
  claims and tracked Gradle cache folders.

### Removed

- Removed historical execution plans and completed engineering specs:
  `docs/plans/` directory (23 EXECPLANs from Jan 2026, all completed),
  `docs/architecture/EXPO-ROUTER-INTEGRATION.md` and
  `docs/architecture/ENGINEERING-EXEC-SPEC-BEST-PRACTICES-ALIGNMENT.md`
  (both marked Status: Implemented), and `docs/engineering-exec-spec.md` /
  `docs/engineering-todo.md` (Jan 6 work logs with all phases complete).
- Removed version-pinned App Store materials superseded by 4.0.x: all
  `docs/App_store/Apple_App_Store/*_v3.0.x*.md` and the entire
  `docs/App_store/Google_Play_Store/` directory (replaced by current
  `docs/ANDROID_GOOGLE_PLAY_STORE.md`).
- Removed root-level transient artifacts: `INSTALL.md` (pointer duplicate of
  `docs/INSTALL.md`), `progress.md`, `test_plan.md`, `audit_report.md` (Dec
  2025 v3.4.0 audit), `firebase-debug.log`, and `remediation_checklist.json`.

### Fixed

- Fixed the onboarding GitHub link to point at the public repository
  repository.
- Removed false screenshot-mode examples that claimed DNS TXT queries provide
  end-to-end encryption or make interception impossible.
- Removed tracked Android `.gradle` cache artifacts from the repository index.
- Updated dependency overrides and native-module dev tooling so `bun audit` and
  `npm audit` in `modules/dns-native` report no vulnerabilities.
- Fixed stale `ch.at` references in `docs/technical/DNS-PROTOCOL-SPEC.md`,
  `docs/technical/SPECIFICATION.md`, and `modules/dns-native/README.md` so the
  default zone, settings-migration target, and example queries all reflect the
  current `llm.pieter.com` default.
- Corrected the documented Android DoH fallback condition in
  `docs/technical/SPECIFICATION.md` and `modules/dns-native/README.md` to match
  the shipped behavior (DoH is only used when the selected resolver is
  Cloudflare `1.1.1.1`).
- Fixed broken cross-references in `CLAUDE.md` (`Thread.tsx` → `app/chat/[threadId].tsx`)
  and added Expo Router bootstrap, React Compiler, typed-routes, babel-plugin-order,
  and version-sync sections.
- Rewrote `docs/README.md` as a clean index without dead links to deleted plans
  and architecture docs.
- Removed stale Android release permissions for legacy storage and overlay windows.
- Declared iOS non-exempt encryption status in Expo config and native Info.plist.
- Fixed strict TypeScript/runtime defects in stack options, onboarding
  translations, markdown/skeleton optional styles, glass form props, chat
  clearing, Home navigation actions, screen entrance/list animation typing, and
  DNS harness buffer handling.
- Serialized DNS log persistence so concurrent query completion/settings events/deletes cannot overwrite each other on disk, and fixed final-method / retry attribution in DNS logs.
- Tightened JS UDP/TCP DNS response validation to enforce ID, QR/opcode/TC, RCODE, single TXT question matching, and source metadata checks for IPv4 resolvers.
- Rejected inconsistent multipart TXT totals in `parseTXTResponse()` to match native parser behavior.
- Restored public-repo portability by clearing committed iOS `DEVELOPMENT_TEAM`, which unblocks `repo.noCredentials`, `sync-versions`, and the full verification gate.
- Restricted Android native Cloudflare DoH fallback to the actual Cloudflare resolver (`1.1.1.1`) and reclassified `<12`-byte DNS packets as malformed responses instead of empty answers.
- Migrated legacy plaintext chat/log payloads to encrypted storage on read and
  encrypted corrupted plaintext backup payloads before writing recovery copies.
- Redacted prompt-derived chat titles, DNS labels, query names, and responses
  from persisted DNS logs.
- Kept local Expo module native sources explicitly trackable in `.gitignore`
  so Expo Doctor does not misclassify the owned `modules/dns-native` sources.

## [4.0.7] - 2026-03-03

### Added

- **NativeTabs**: Adopted Expo Router v5.5 `NativeTabs` API with SF Symbols (iOS) and Material Symbols (Android), replacing JS tabs with PNG icons on native platforms. Web fallback via `_layout.web.tsx` platform extension.
- **Color API**: New `platformColors.ts` with system color mappings via `expo-router` Color API. Added `useNativeColors()` hook for native `ColorValue` in style props. Colors auto-adapt to light/dark mode and Android 12+ dynamic colors.
- **Stack declarative headers**: Migrated to inline `Stack.Screen.Title` in chat, settings, and not-found screens for co-located header declarations.
- **Stack.Toolbar (iOS)**: Native iOS toolbar actions — share/clear menu in chat thread, new-chat button in chat list, close button in settings modal. Renders nothing on Android/Web.
- **Zoom transitions (iOS 18+)**: `Link.AppleZoom` on chat list items with `Link.AppleZoomTarget` on chat screen for native zoom animation. Graceful push fallback on older platforms.
- **Toolbar translations**: Added `navigation.toolbar` i18n keys (newChat, share, clearChat, dnsInfo) in en-US and pt-BR.
- `createAndNavigateToChat` helper exposed from `ChatContext` for toolbar integration.

### Fixed

- Fixed NativeTabs import path for expo-router v55.0.2 (`unstable-native-tabs` instead of `native-tabs`), resolving iOS bundling failure.
- Fixed "(tabs)" leaking into iOS back button title by setting explicit `headerBackTitle` on chat route.
- Removed opaque blue background from About screen header card — let LiquidGlassWrapper handle tinting instead of doubling `palette.surface` over glass.

## [4.0.6] - 2026-02-26

### Changed

- Bumped app version metadata to `4.0.6` (build `34`) across `package.json`, `app.json`, iOS project settings, Android Gradle config, and release docs.
- Squashed release work into one consolidated changelog entry for this patch line.
- Expanded verification gates in CI and local workflows: Expo Doctor, SDK alignment, typed routes, DNS resolver sync, React Compiler health, and Android 16KB alignment.

### Fixed

- Fixed iOS `Bundle React Native code and images` failures caused by Xcode script sandboxing by disabling user script sandboxing for the app target.
- Hardened SDK alignment checks to detect drift between declared deps, lockfile resolution, and installed `node_modules` versions.
- Switched iOS `Info.plist` version keys to build settings (`$(MARKETING_VERSION)`, `$(CURRENT_PROJECT_VERSION)`) to prevent future version drift.

## [4.0.5] - 2026-02-26

### Changed

- Bumped app version metadata to `4.0.5` (build `33`) across `package.json`, `app.json`, iOS project settings, and Android Gradle config.
- Merged Expo SDK 55 migration into `main` with dependency and native-project alignment.
- Upgraded stack to Expo `55.0.0`, React `19.2.0`, and React Native `0.83.2`.
- Removed obsolete SDK54 `patch-package` patches after validating SDK55 compatibility.
- Updated typed routes verification to support Expo Router 55+ generation paths.
- Updated README and docs metadata to reflect the shipped SDK55 stack.

### Fixed

- About and Settings now display runtime app version/build from Expo-native metadata (with safe fallback) instead of relying on a static package version import.
- Fixed iOS runtime startup issue caused by StrictMode (`findHostInstance_DEPRECATED`) by removing StrictMode at root layout.
- Fixed tab chat list runtime navigation error by removing focus-hook dependency that relied on missing navigation context during startup.

## [4.0.2] - 2026-01-07

### Fixed

- **CRITICAL**: Fixed data race on static `allowedServers` variable using `@MainActor` isolation
- **CRITICAL**: Fixed Unicode sanitization mismatch (Swift `.isDiacritic` vs JS `\p{M}`) by using `generalCategory` for combining marks
- Fixed missing `@available(iOS 16.0, *)` annotations on `createQueryTask` and `withTimeout` functions
- Fixed force unwrap in `withTimeout` with safe `guard let` pattern
- Fixed `CancellationError` not mapped to `DNSError.cancelled` for consistent error handling
- Added defensive iOS 16+ guard in `queryTXT` to prevent runtime crashes on older iOS versions
- Added `.waiting(let error)` handling in NWConnection state handler for early network unreachable detection
- Replaced deprecated `Task.sleep(nanoseconds:)` with `Task.sleep(for:)` API
- Added `Task.checkCancellation()` in retry loop for faster cancellation response
- Added comprehensive doc comments on concurrency-sensitive code paths
- **CRITICAL**: Fixed NWConnection resource leak on timeout/cancellation using `withTaskCancellationHandler`
- Fixed potential main thread blocking by marking `performUDPQuery` as `nonisolated` for Swift 6.2+ compatibility
- Fixed `cleanup()` to use proper `@MainActor` isolation instead of fire-and-forget Task
- Fixed `RNDNSModule.invalidate()` to dispatch to MainActor for cleanup
- Replaced global queue with dedicated serial queue for NWConnection callbacks

### Changed

- Enabled Android edge-to-edge and predictive back gesture support via Expo config.
- Set explicit Android build properties (compile/target SDK 35, NDK r28) and aligned native module fallbacks.
- Aligned Android build properties to SDK 36 in Expo config and native module fallbacks.
- Standardized Android dnsjava dependency version across app and native module.
- Updated `sync-versions` script parsing to handle Gradle assignment syntax.
- Docs: added guidelines compliance + code review exec spec.
- Docs: added data inventory/model registry and updated engineering exec tracking.
- Removed manual memoization in `ChatInput` for React Compiler support and updated static tests.
- Added explicit `useEffect` justification comments for external side effects.
- Simplified Android native sanitizer config to store compiled patterns with equality based on pattern + flags.
- Added DNS server health tracking in `DNSService` to record successes/failures per host:port.
- Docs: refreshed exec plan verification logs and aligned DNS server migration notes to port 53 default.
- Relaxed Android startup diagnostics to warn (not fail) when the native module registry is incomplete in dev runtimes.
- Aligned Android versionCode with iOS build number (31) to keep version sync no-op.
- Added a 16KB page-size alignment verification script for Android native libraries.
- Added glass style sanitization to keep shadow/border props off native glass views.
- Aligned Android NDK configuration to r29 and added checks for installed NDK versions.
- Added typed routes verification/generation for Expo Router.
- Added React Compiler healthcheck command for verification.
- Docs: recorded final verification run (lint/tests + Android/typed routes/React Compiler checks) in engineering exec spec.

### Fixed

- Fixed patch-package parsing for @react-native-menu/menu and react-native-screens patches.
- Added AsyncStorage dev dependency to `modules/dns-native` to unblock Jest mocks in module tests.
- Updated `modules/dns-native/package-lock.json` so CI installs the AsyncStorage devDependency.
- Stabilized chat loading and error alert behavior to avoid repeated alerts.
- Gated native DNS debug logging behind explicit debug flags in runtime and tests.
- Removed remaining `any`/`@ts-ignore` usage in production and test code paths.
- Hid route group names from iOS back button titles (no more "(tabs)" in header).
- Synced Android `DNSResolver.java` sources between `modules/dns-native` and the Expo prebuild output to prevent drift.
- Fixed Android DNS query deduplication so only one execution runs per unique query.
- Normalized DNS server hostnames (trim/lowercase/strip trailing dots) to stabilize cache keys and socket targets.
- Hardened Android sanitizer config validation to enforce the 63-byte DNS label limit.
- Cleanup logging now reports the correct number of cleared queries.
- Added Android JVM unit tests for resolver cleanup, sanitizer bounds, and host normalization.
- Added `verify:dnsresolver-sync` script to guard against resolver source drift.
- Replaced deprecated dnsjava resolver timeout API and URL construction in Android DNS resolver.
- Ensured DNS-over-HTTPS connections always close and Expo `createExpoConfig` gets a default `NODE_ENV` during Gradle builds.
- Updated project Gradle scripts to use assignment syntax to avoid upcoming Gradle 10 Groovy DSL deprecations.
- Patched dependency Gradle scripts to replace deprecated Groovy space-assignment syntax.
- Removed debug signing from Android release builds and wired release signing config to keystore.properties (android/ or repo root).
- Registered ExpoLinkingPackage via ModuleRegistryAdapter for stable deep-link lifecycle in Expo dev-client builds.
- Added iOS native DNS module cleanup on invalidation to cancel pending tasks.
- Aligned iOS Unicode normalization with JS/Android (NFKD compatibility decomposition).
- Enforced DNS server allowlist inside native resolvers using shared constants.
- Migrated Android DNS-over-HTTPS fallback to RFC 8484 wireformat (application/dns-message).
- Hardened native UDP DNS response validation on Android/iOS (transaction ID, header flags, QDCOUNT, and question name/type/class matching).
- Added Android JVM test stub for `android.util.Log` to unblock unit tests.
- Added JVM tests for resolver dedup reuse, bounded thread pool, and Unicode flag handling.
- Added DNSService fallback and server health coverage in Jest tests.
- Added default-export handling for UDP/TCP socket module loading to reduce false negatives in dev clients.

## 4.0.1 - 2026-01-05

### Fixed

- **CRITICAL**: Fixed memory leak in static `activeQueries` map - queries now properly cleared on module invalidation
- **CRITICAL**: Fixed thread pool management - replaced unbounded `newCachedThreadPool()` with fixed-size pool based on CPU cores
- **CRITICAL**: Fixed query deduplication race condition using atomic `ConcurrentHashMap.compute()` method
- Fixed `Pattern.UNICODE_CHARACTER_CLASS` usage for proper Unicode text support in international character sanitization
- Added domain validation in `queryTXT()` to reject null or empty domain parameters
- Removed unused `DNS_SERVER` constant that was causing confusion with actual default server configuration
- Added domain normalization (trim + lowercase) for consistent deduplication keys

### Changed

- Improved `cleanup()` method to cancel all pending futures before clearing the activeQueries map
- Refactored query deduplication logic into separate `executeQueryChain()` method for better code organization
- Updated thread pool to use bounded queue (50 capacity) with CallerRunsPolicy for backpressure
- Enhanced comments and documentation throughout DNSResolver.java for maintainability

### Technical Details

- **Memory Leak Fix**: Static `activeQueries` map now cleared in `cleanup()` with proper cancellation of pending futures
- **Thread Pool**: Fixed size equals CPU cores (min 2) with bounded queue preventing unbounded thread creation
- **Deduplication**: Atomic `compute()` prevents race conditions where multiple threads create duplicate queries
- **Unicode Support**: `UNICODE_CHARACTER_CLASS` flag properly used for Unicode-aware regex patterns
- **Domain Validation**: Rejects null/empty domains and normalizes to lowercase for consistent cache keys

### Sources

- [Stack Overflow - UNICODE_CHARACTER_CLASS behavior](https://stackoverflow.com/questions/72236081/different-java-regex-matching-behavior-when-using-unicode-character-class-flag)
- [Android DNS Resolver AOSP Docs](https://source.android.com/docs/core/ota/modular-system/dns-resolver)
- [React Native Native Modules Lifecycle](https://reactnative.dev/docs/0.80/the-new-architecture/native-modules-lifecycle)
- [Medium - Memory Leaks in React Native](https://medium.com/@umairzafar0010/debugging-and-resolving-react-native-app-memory-leaks-the-ultimate-challenge-690f9f49a39c)
- [Software Mansion - Hunting JS Memory Leaks](https://blog.swmansion.com/hunting-js-memory-leaks-in-react-native-apps-bd73807d0fde)

## 4.0.0 - 2026-01-05

### Changed

- Bumped app version metadata to 4.0.0 (build 30) across iOS and Android configs.
- Updated release and store documentation for the 4.0.0 major release.

## [3.x] - Historical

Versions 3.2.0 through 3.8.9 established the core feature set:

- **3.8.x**: Screen entrance animations, skeleton loading, empty states, Expo Router migration, encrypted local storage (AES-GCM), DNS log redaction, React Compiler activation, local DNS responder for smoke tests, privacy policy
- **3.7.0**: Android platform parity (tab bar icons, typography, glass fallback colors)
- **3.6.0**: Google Play Store launch guide and release documentation
- **3.5.0**: DNS response ID validation (RFC 5452), memory leak fixes, React Compiler, storage corruption detection, capabilities TTL cache
- **3.4.0**: Cryptographic DNS IDs, TCP buffer limits, storage corruption detection, socket cleanup guarantees, async error handling fixes
- **3.3.0**: Android CI, release signing policy, Java 17 auto-detection
- **3.2.x**: Public repo hardening (secrets scanning, policy tests, version sync gates), DNS server allowlist

[Unreleased]: https://github.com/<owner>/dnschat/compare/v4.0.28...HEAD
[4.0.28]: https://github.com/<owner>/dnschat/compare/v4.0.27...v4.0.28
[4.0.27]: https://github.com/<owner>/dnschat/compare/v4.0.26...v4.0.27
[4.0.26]: https://github.com/<owner>/dnschat/compare/v4.0.25...v4.0.26
[4.0.25]: https://github.com/<owner>/dnschat/compare/v4.0.24...v4.0.25
[4.0.24]: https://github.com/<owner>/dnschat/compare/v4.0.23...v4.0.24
[4.0.23]: https://github.com/<owner>/dnschat/compare/v4.0.22...v4.0.23
[4.0.22]: https://github.com/<owner>/dnschat/compare/v4.0.21...v4.0.22
[4.0.21]: https://github.com/<owner>/dnschat/compare/v4.0.20...v4.0.21
[4.0.20]: https://github.com/<owner>/dnschat/compare/v4.0.19...v4.0.20
[4.0.19]: https://github.com/<owner>/dnschat/compare/v4.0.18...v4.0.19
[4.0.18]: https://github.com/<owner>/dnschat/compare/v4.0.17...v4.0.18
[4.0.17]: https://github.com/<owner>/dnschat/compare/v4.0.16...v4.0.17
[4.0.16]: https://github.com/<owner>/dnschat/compare/v4.0.15...v4.0.16
[4.0.15]: https://github.com/<owner>/dnschat/compare/v4.0.14...v4.0.15
[4.0.14]: https://github.com/<owner>/dnschat/compare/v4.0.13...v4.0.14
[4.0.13]: https://github.com/<owner>/dnschat/compare/v4.0.12...v4.0.13
[4.0.12]: https://github.com/<owner>/dnschat/compare/v4.0.11...v4.0.12
[4.0.11]: https://github.com/<owner>/dnschat/compare/v4.0.10...v4.0.11
[4.0.10]: https://github.com/<owner>/dnschat/compare/v4.0.9...v4.0.10
[4.0.9]: https://github.com/<owner>/dnschat/compare/v4.0.8...v4.0.9
[4.0.8]: https://github.com/<owner>/dnschat/compare/v4.0.7...v4.0.8
[4.0.7]: https://github.com/<owner>/dnschat/compare/v4.0.6...v4.0.7
[4.0.6]: https://github.com/<owner>/dnschat/compare/v4.0.5...v4.0.6
[4.0.5]: https://github.com/<owner>/dnschat/compare/v4.0.2...v4.0.5
[4.0.2]: https://github.com/<owner>/dnschat/compare/v4.0.0...v4.0.2
[3.x]: https://github.com/<owner>/dnschat/compare/v3.2.0...v4.0.0
