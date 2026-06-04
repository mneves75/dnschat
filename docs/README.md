# DNSChat docs

Developer documentation for DNSChat. Code is the source of truth — these docs explain *why* and *how it fits together*.

## Start here

- `docs/INSTALL.md` — setup, build, and verification commands
- `docs/architecture/SYSTEM-ARCHITECTURE.md` — what talks to what
- `docs/technical/DNS-PROTOCOL-SPEC.md` — DNS query/response rules (current behavior)
- `docs/technical/SPECIFICATION.md` — product behavior + repo invariants
- `docs/plans/SDK56_UPGRADE_PLAN.md` — SDK 56 upgrade plan and verification gate
- `docs/plans/EXPO_UI_COMPONENT_MIGRATION_PLAN.md` - Expo UI adoption decision
  and migration plan
- `docs/e2e-axe-feature-coverage.md` — AXe simulator E2E feature checklist
  and runner notes
- `docs/technical/CHAT-TEMPLATE-2026-REVIEW.md` — 2026 chat-template review plan and applied repairs
- `docs/troubleshooting/COMMON-ISSUES.md` — known issues and fixes

## Reference

- `docs/technical/EXPO-DOCTOR-CONFIGURATION.md` — why specific Expo Doctor warnings are intentional
- `docs/data-inventory.md` — on-device data storage, retention, encryption
- `docs/model-registry.md` — model usage policy (currently: none)
- `docs/public-release-redaction.md` — public-doc redaction policy and release
  evidence split

## Current verification baseline

Last architecture/dependency verification: `2026-06-03`.
Last full source/security sweep: `2026-06-03`.
Last AXe simulator E2E feature pass: `2026-05-17` for version `4.0.13` build
`43`.
Current release target: version `4.0.23` build `57`. Last uploaded and
processed TestFlight build is version `4.0.23` build `57` (`VALID` on
`2026-06-04`).

- `npx react-doctor@latest --verbose .` reports `93 / 100` for `chat-dns` on
  `2026-06-03`. Confirmed fixes were applied for the user font-size hook and
  an animated layout border; remaining diagnostics are advisory React Compiler
  optimization findings around Reanimated shared values, `try/finally`, refs,
  and existing manual memoization.
- `bun run typecheck` passes through `bun run verify:all` on `2026-06-04`.
- Native DNS module tests pass on `2026-06-04` (`7` suites passed, `1` skipped;
  `57` tests passed, `13` skipped).
- AXe E2E baseline: 10 feature groups passed in one owned release-simulator
  run on `2026-05-17`.
- Jest baseline for build `57` passed through the final full gate on
  `2026-06-04`: `110` suites passed, `1` skipped; `893` tests passed, `13`
  skipped.
- `gitleaks detect` on `2026-06-04` reports `no leaks found` across `366`
  scanned commits.
- `bun audit` on `2026-06-04` reports `No vulnerabilities found`.
- `xcodebuild clean build` passes for Debug on an iOS 26.5 simulator on
  `2026-05-24`.
- `xcodebuild clean build` and `xcodebuild clean archive` pass for generic iOS
  Release when code signing is disabled (`CODE_SIGNING_ALLOWED=NO`) on
  `2026-05-24`.
- Physical-device Release build, install, installed metadata check, and launch
  passed on `2026-06-04` for version `4.0.22` build `56`.
- Current target: `4.0.23` build `57`; last signed TestFlight build:
  `4.0.23` build `57`. The release lane uses signed App Store archive/export,
  App Store Connect upload, processing, and validation before the build is
  described as distributed. Internal App Store Connect IDs are intentionally
  omitted from public docs.
- `asc validate testflight --strict` for build `57` passes with `0` errors and
  `0` warnings. App Store screenshots were renewed for iPhone and iPad in
  `en-US` and `pt-BR`; pre-submit App Store validation reported `0` errors,
  `0` warnings, and `0` blocking findings; the App Store version is now
  `WAITING_FOR_REVIEW`. App Privacy publish-state still needs browser
  confirmation because the API cannot verify it.
- `xcodebuild test` is not a native gate yet because the `DNSChat` scheme has no
  XCTest bundles.
- Public docs and store copy must not claim that DNS prompts are private or
  end-to-end encrypted; only local history is encrypted at rest.
- Public docs must use placeholders for local/device/account-specific release
  identifiers. Run `bun run verify:public-redaction` and `gitleaks detect`
  before committing release docs.

## Release

- `docs/ANDROID_RELEASE.md` — Android release checklist + signing
- `docs/ANDROID_GOOGLE_PLAY_STORE.md` — Play Store publishing guide
- `docs/App_store/Apple_App_Store/AppStoreConnect.md` — App Store listing materials
- `docs/App_store/Apple_App_Store/TESTFLIGHT.md` — TestFlight upload steps

## External

- React Native: https://reactnative.dev/docs/getting-started
- Expo: https://docs.expo.dev/
- Expo Router: https://docs.expo.dev/router/introduction/
- DNS RFC 1035: https://www.rfc-editor.org/rfc/rfc1035
- DNS-over-TCP RFC 7766: https://www.rfc-editor.org/rfc/rfc7766
