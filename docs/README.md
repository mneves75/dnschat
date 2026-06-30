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

Last architecture/dependency verification: `2026-06-30`.
Last full source/security sweep: `2026-06-10` (three-track review with fixes —
see `CHANGELOG.md` `4.0.29`).
Last AXe simulator E2E feature pass: `2026-06-05` for version `4.0.26` build
`60`; 10 feature groups passed. Runtime UI verification now defaults to Argent.
Current release target: version `4.1.5` build `72`. This SDK 57 lane carries
the Expo SDK 57 / React Native 0.86 dependency and native pod refresh. Signed
archive/export, TestFlight upload, processing, and validation run after the
final source/docs state is verified and pushed. The latest uploaded TestFlight
build before this lane is version `4.1.3` build `70` (`VALID` on
`2026-06-22`). Do not describe `4.1.5` build `72` as uploaded, distributed, or
attached to an App Store version until separate `asc` or App Store Connect
evidence proves it.

- `npx react-doctor@latest --project chat-dns` reports `100 / 100` for
  `chat-dns` on `2026-06-10` (module also `100 / 100`).
- Jest baseline on `2026-06-30`: `122` suites passed, `1` skipped; `959` tests
  passed, `13` skipped.
- Native DNS module tests pass on `2026-06-30` (`8` suites passed, `1` skipped;
  `64` tests passed, `13` skipped).
- AXe E2E baseline: 10 feature groups passed in one owned release-simulator
  run on `2026-06-05`.
- `bun run verify:all` passed on `2026-06-30` for build `72`.
- `gitleaks detect` on `2026-06-30` reports `no leaks found`.
- `bun audit` on `2026-06-30` reports `No vulnerabilities found`.
- `xcodebuild clean build` passes for Debug on an iOS 26.5 simulator on
  `2026-06-30`.
- `xcodebuild clean build` and `xcodebuild clean archive` pass for generic iOS
  Release when code signing is disabled (`CODE_SIGNING_ALLOWED=NO`) on
  `2026-06-30`.
- Physical-device Release build, install, installed metadata check, and launch
  are separate evidence claims and are not implied by the local SDK 57 simulator
  and unsigned archive checks.
- Current target: `4.1.5` build `72`. The release lane uses signed App Store
  archive/export, App Store Connect upload, processing, and validation before
  the build is described as distributed. Internal App Store Connect IDs are
  intentionally omitted from public docs.
- `asc validate testflight` must pass with `0` errors and `0` warnings before
  build `72` is described as distributed. App Store version validation for
  `4.1.5` is not applicable until a matching App Store version record exists.
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
