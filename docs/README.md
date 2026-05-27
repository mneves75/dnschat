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

Last architecture/dependency verification: `2026-05-27`.
Last full source/security sweep: `2026-05-27`.
Last AXe simulator E2E feature pass: `2026-05-17` for version `4.0.13` build
`43`.
Current iOS/TestFlight release target: version `4.0.16` build `47`.

- `npx react-doctor@latest` reports `100 / 100` for both `chat-dns` and
  `@dnschat/dns-native` on `2026-05-27`.
- `bun run typecheck` passes on `2026-05-27`.
- Native DNS module tests pass on `2026-05-27` (`7` suites passed, `1` skipped;
  `56` tests passed, `13` skipped).
- AXe E2E baseline: 10 feature groups passed in one owned release-simulator
  run on `2026-05-17`.
- Jest baseline on `2026-05-27`: 105 suites passed, 1 skipped; 860 tests
  passed, 13 skipped.
- `gitleaks detect` on `2026-05-24` reports `no leaks found` across `348`
  scanned commits.
- `bun audit` on `2026-05-24` reports `No vulnerabilities found`.
- `xcodebuild clean build` passes for Debug on an iOS 26.5 simulator on
  `2026-05-24`.
- `xcodebuild clean build` and `xcodebuild clean archive` pass for generic iOS
  Release when code signing is disabled (`CODE_SIGNING_ALLOWED=NO`) on
  `2026-05-24`.
- Physical-device compiled Expo dev-client install passed.
- Current signed TestFlight target: `4.0.16` build `47`. The release lane uses
  signed App Store archive/export, App Store Connect upload, processing, and
  validation before the build is described as distributed. Internal App Store
  Connect IDs are intentionally omitted from public docs.
- `asc validate testflight` passes with `0` errors and `0` warnings. App Store
  version validation is not applicable until a matching App Store version
  record exists; App Privacy publish-state still needs browser confirmation
  because the API cannot verify it.
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
