# Changelog

All notable changes to DNSChat will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [Unreleased]

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

[Unreleased]: https://github.com/<owner>/dnschat/compare/v4.0.17...HEAD
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
