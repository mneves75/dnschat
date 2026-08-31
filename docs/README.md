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
- `docs/technical/SCREEN-MOUNT-PERF.md` — per-screen mount budget, measurement protocol, current baseline
- `docs/troubleshooting/COMMON-ISSUES.md` — known issues and fixes

## Reference

- `docs/technical/EXPO-DOCTOR-CONFIGURATION.md` — why specific Expo Doctor warnings are intentional
- `docs/data-inventory.md` — on-device data storage, retention, encryption
- `docs/model-registry.md` — model usage policy (currently: none)
- `docs/public-release-redaction.md` — public-doc redaction policy and release
  evidence split

## Current verification baseline

Last architecture/dependency verification: `2026-08-31`.
Last full source/security sweep: `2026-08-31` (native DNS, encrypted storage,
release automation, model-output rendering, UI/accessibility, and public
disclosures; see `CHANGELOG.md` `4.3.6`).
Last AXe simulator E2E feature pass: `2026-06-05` for version `4.0.26` build
`60`; 10 feature groups passed. Runtime UI verification now defaults to Argent.
Current beta candidate: `4.3.6` build `84`. Latest validated TestFlight build
remains `4.2.3` build `77` (`VALID` on `2026-07-10`, with strict validation
clean and bilingual test notes). Build `76` was installed and sustained through
normal, cold `dnschat://`, and foreground `dnschat://` launches on a physical
device. Build `75` was installed but exited immediately because its Xcode
27-linked binary still used the legacy application lifecycle. Build `77`
supersedes version `4.2.0` build `73` (`VALID` on `2026-07-04`). Its signed
archive/export, TestFlight processing, group relationship, bilingual notes, and
`0` error / `0` warning validation are verified; physical-device launch proof
remains scoped to build `76`. No App Store version record exists for `4.2.3`,
and App Store production submission has not happened for this line.

- `pnpm dlx react-doctor@latest --project chat-dns` reports `100 / 100` for
  `chat-dns` on `2026-07-28` (module also `100 / 100`).
- Jest baseline on `2026-07-28`: `129` suites passed, `1` skipped; `1013` tests
  passed, `13` skipped.
- Native DNS module tests pass on `2026-07-28` (`8` suites passed, `1` skipped;
  `65` tests passed, `13` skipped).
- AXe E2E baseline: 10 feature groups passed in one owned release-simulator
  run on `2026-06-05`.
- `pnpm run verify:all` passed on `2026-07-28` for build `80`: 129 suites and
  1013 tests passed; 1 suite and 13 tests skipped; React Compiler 105/105 and
  Expo Doctor 19/19. Android `assembleDebug`/`assembleRelease` and 16KB alignment
  checks require native build artifacts and are run separately in CI.
- Native DNS tests passed on `2026-07-28`: 8 suites and 65 tests passed; 1
  suite and 13 tests skipped.
- `gitleaks detect` on `2026-07-28` reports `no leaks found`.
- `pnpm audit` on `2026-07-28` reports `No known vulnerabilities found`.
- `xcodebuild clean build` passes for Debug on an iOS 26.5 simulator on
  `2026-06-30`.
- `xcodebuild clean build` and `xcodebuild clean archive` pass for generic iOS
  Release when code signing is disabled (`CODE_SIGNING_ALLOWED=NO`) on
  `2026-06-30`.
- Physical-device Release build, install, installed metadata check, and launch
  are separate evidence claims and are not implied by the local SDK 57 simulator
  and unsigned archive checks.
- Latest validated TestFlight release: `4.2.3` build `77`. Signed App Store archive/export passed,
  TestFlight processing returned `VALID`, and strict validation reported `0`
  errors and `0` warnings. Internal App Store Connect IDs are intentionally
  omitted from public docs.
- App Store version validation for `4.2.3` is blocked because no matching App
  Store version record exists. This is App Store-submission state, not a
  TestFlight processing failure.
- `xcodebuild test` is not a native gate yet because the `DNSChat` scheme has no
  XCTest bundles.
- Public docs and store copy must not claim that DNS prompts are private or
  end-to-end encrypted; only local history is encrypted at rest.
- Public docs must use placeholders for local/device/account-specific release
  identifiers. Run `pnpm run verify:public-redaction` and `gitleaks detect`
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
