# DNSChat docs

Developer documentation for DNSChat. Code is the source of truth — these docs explain *why* and *how it fits together*.

## Start here

- `docs/INSTALL.md` — setup, build, and verification commands
- `docs/architecture/SYSTEM-ARCHITECTURE.md` — what talks to what
- `docs/technical/DNS-PROTOCOL-SPEC.md` — DNS query/response rules (current behavior)
- `docs/technical/SPECIFICATION.md` — product behavior + repo invariants
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

Last full source/security sweep: `2026-05-17`.
Last AXe simulator E2E feature pass: `2026-05-17` for version `4.0.13` build
`43`.
Last iOS signed release archive/export: `2026-05-15` for version `4.0.12`
build `42`; version `4.0.13` build `43` is the current release target.

- `bun run verify:all` passes (`expo-doctor` 17/17, SDK alignment, typed routes,
  DNS resolver sync, iOS pods, React Compiler, Android setup, lint, and Jest).
- AXe E2E baseline: 10 feature groups passed in one owned release-simulator
  run.
- Jest baseline: 95 suites passed, 1 skipped; 816 tests passed, 13 skipped.
- `bun audit`, `npm audit` in `modules/dns-native`, and `gitleaks detect`
  report no vulnerabilities or leaks.
- `xcodebuild clean build` passes for Debug on an iOS 26.5 simulator.
- `xcodebuild clean build` and `xcodebuild clean archive` pass for generic iOS
  Release when code signing is disabled (`CODE_SIGNING_ALLOWED=NO`).
- Physical-device compiled Expo dev-client install passed.
- Signed App Store archive/export passed, App Store Connect metadata was
  updated, TestFlight upload completed, and the processed build is `VALID`.
  Internal App Store Connect IDs are intentionally omitted from public docs.
- `asc validate testflight` and App Store version validation pass with `0`
  errors and `0` warnings; App Privacy publish-state still needs browser
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
