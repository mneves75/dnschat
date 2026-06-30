# DNSChat

DNSChat is a React Native Expo app that sends short chat prompts as
DNS TXT queries (default DNS server: `llm.pieter.com`). The app includes:

- A native DNS TXT resolver module for iOS/Android (`modules/dns-native/`)
- JavaScript fallback transports (UDP/TCP) for constrained networks
- An in-app Logs screen to inspect attempts, failures, and fallbacks

[![Version](https://img.shields.io/badge/version-4.1.5-blue.svg)](.)
[![React Native](https://img.shields.io/badge/React%20Native-0.86.0-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-57.0.x-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.x-blue.svg)](https://www.typescriptlang.org/)
[![iOS](https://img.shields.io/badge/iOS-16.4%2B-lightgrey.svg)](https://developer.apple.com/ios/)
[![Android](https://img.shields.io/badge/Android-API%2024%2B-green.svg)](https://developer.android.com/)
[![CI](actions/workflows/ci.yml/badge.svg)](actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- Chat with LLMs over DNS - no API keys, no accounts, no tracking
- Native DNS resolution on iOS and Android with JS fallback transports
- Encrypted local chat history (AES-GCM)
- Multi-server support with automatic transport fallback
- Bilingual UI (English / Portuguese)
- Full offline chat history with search
- **NativeTabs** with SF Symbols (iOS) and Material Symbols (Android)
- **Platform colors** via expo-router Color API (auto light/dark, Android 12+ dynamic)
- **Native iOS toolbars** with share, clear, and new-chat actions (liquid glass)
- **Zoom transitions** (iOS 18+) from chat list to thread

## Tech stack

- App version: `4.1.5` (build `72`)
- Expo workflow: Expo Router + EAS-compatible native config
- Expo SDK: `57.0.x`
- React: `19.2.3`
- React Native: `0.86.0`
- TypeScript: `6.0.x`
- Hermes: enabled
- New Architecture: enabled by default on SDK 57
- React Compiler: enabled (`experiments.reactCompiler: true`)
- Typed routes: enabled (`experiments.typedRoutes: true`)

## How DNSChat encodes prompts

User prompts are validated and sanitized into a single DNS label (RFC 1035
constraints) before building a query name. Practical constraints (see
`modules/dns-native/constants.ts`):

- Prompts are capped at 120 characters before sanitization (hard fail, no silent truncation)
- DNS labels are capped at 63 characters after sanitization

TXT responses are parsed as either:

- Plain TXT records (concatenate non-empty records), or
- Multipart `n/N:` segments that must form a complete sequence

## Transport + fallback order

The transport order used by `src/services/dnsService.ts` is:

1. Native DNS (iOS/Android native module)
2. UDP (JavaScript transport via `react-native-udp`)
3. TCP (DNS-over-TCP via `react-native-tcp-socket`)
4. Mock (optional development fallback)

Web preview uses the Mock path by default because browsers cannot do raw DNS on
port 53.

DNS packet encoding, DNS-over-TCP framing, decoded-response validation, and TXT
record extraction live in `src/services/dnsWire.ts`; `dnsService.ts` owns the
transport chain, retries, logging, and server fallback orchestration.

## Quick start

Prereqs:

- Node.js 20.19.4+
- iOS: Xcode 26.4+ (macOS only), iOS 16.4+ device/simulator
- Android: Java 17 + Android SDK

Install:

```bash
git clone <repository-url>
cd dnschat
bun install
```

Run:

```bash
# Dev server
bun run start

# iOS
bun run ios

# Android (auto-selects Java 17 when available)
bun run android

# Web preview (uses Mock DNS)
bun run web
```

Notes:

- iOS simulator builds work out of the box; device builds require you to pick your own signing team in Xcode (the repo keeps `DEVELOPMENT_TEAM` empty).
- For a full physical-device install, build the native `DNSChat`
  target for the device identifier and install the compiled `.app`; Expo Go is
  not a valid substitute for this repo because the app depends on native DNS
  modules. Keep device names, local paths, and signing identifiers out of public
  docs.

## DNS smoke tests

```bash
# Quick DNS check (no React Native runtime required)
node test-dns-simple.js "test message"
node test-dns-simple.js "test message" --local-server

# Full harness (builds scripts/ ts -> js, then runs UDP/TCP transports)
bun run dns:harness -- --message "test message"
bun run dns:harness -- --message "test message" --local-server

# Debug output artifacts
bun run dns:harness -- --message "test" --json-out harness-output.json --raw-out raw-dns.bin
```

## Development commands

```bash
# Lint (ast-grep rules)
bun run lint

# Unit tests
bun run test

# AXe simulator E2E
bun run e2e:axe:doctor
bun run e2e:axe:release

# Public-doc redaction gate
bun run verify:public-redaction

# Keep Expo iOS pods aligned with installed node_modules (iOS)
bun run verify:ios-pods

# Sanity checks for Android tooling/device expectations
bun run verify:android

# Full verification gate before committing/release work
bun run verify:all

# Sync app + native module versions (use :dry to preview)
bun run sync-versions
bun run sync-versions:dry

# CocoaPods cleanup helpers
bun run fix-pods
bun run clean-ios
```

## Git hook (ast-grep)

This repo installs a pre-commit hook that blocks commits when the ast-grep lint
fails.

Mechanism:

- `bun install` runs `bun run prepare`
- `prepare` runs `scripts/install-git-hooks.js`
- that script writes `.git/hooks/pre-commit` that runs `verify:ios-pods`, `lint`
  (ast-grep), and unit tests

If you do not want repo-managed hooks, remove `.git/hooks/pre-commit` locally.

## Documentation

Start here:

- [`docs/README.md`](docs/README.md) — full documentation index
- [`docs/INSTALL.md`](docs/INSTALL.md) — setup, build, verification
- [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md) — guidance for AI coding agents

Architecture & spec:

- [`docs/architecture/SYSTEM-ARCHITECTURE.md`](docs/architecture/SYSTEM-ARCHITECTURE.md) — what talks to what
- [`docs/technical/DNS-PROTOCOL-SPEC.md`](docs/technical/DNS-PROTOCOL-SPEC.md) — query/response rules
- [`docs/technical/SPECIFICATION.md`](docs/technical/SPECIFICATION.md) — product behavior + repo invariants
- [`docs/technical/EXPO-DOCTOR-CONFIGURATION.md`](docs/technical/EXPO-DOCTOR-CONFIGURATION.md) — intentional Expo Doctor warnings

Operational:

- [`docs/troubleshooting/COMMON-ISSUES.md`](docs/troubleshooting/COMMON-ISSUES.md) — known issues + fixes
- [`docs/data-inventory.md`](docs/data-inventory.md) — on-device data storage + retention
- [`docs/model-registry.md`](docs/model-registry.md) — model usage policy

Release:

- [`docs/ANDROID_RELEASE.md`](docs/ANDROID_RELEASE.md) — Android release checklist
- [`docs/ANDROID_GOOGLE_PLAY_STORE.md`](docs/ANDROID_GOOGLE_PLAY_STORE.md) — Play Store publishing
- [`docs/App_store/Apple_App_Store/AppStoreConnect.md`](docs/App_store/Apple_App_Store/AppStoreConnect.md) — App Store listing materials
- [`docs/App_store/Apple_App_Store/TESTFLIGHT.md`](docs/App_store/Apple_App_Store/TESTFLIGHT.md) — TestFlight upload steps

## Current verification baseline

Last architecture/dependency verification: `2026-06-10`.
Last full source/security sweep: `2026-06-10` (three-track review: security,
architecture, performance; fixes applied across the DNS pipeline, native
layer, storage, and UI — see `CHANGELOG.md` `4.0.29`).
Last AXe simulator E2E feature pass: `2026-06-05` for version `4.0.26` build
`60`; 10 feature groups passed (historical; Argent MCP is the current
verification surface).
The latest `VALID` TestFlight build is version `4.1.3` build `70`, signed with the
Apple Distribution identity, uploaded to the internal tester group, and processed
`VALID` on `2026-06-22` (advancing from `4.1.1` build `68`, also `VALID`). Release
builds use the proven `xcodebuild archive` -> `-exportArchive` -> `asc publish
testflight` lane with bilingual `What to Test` notes (`en-US` and `pt-BR`). App
Store Connect has no App Store version record for this line, so App Store submission
validation is not applicable for these TestFlight-only staging builds.

Version `4.1.2` build `69` is a premium-feel pass on top of `4.1.1`: a semantic
`palette.isDark` signal for the loading-skeleton tint (replacing a hard-coded-hex
check), a new `isDark` palette flag, removal of unused `errorShake` dead code, Expo
SDK 56 dependency patch alignment, plus interactive keyboard drag-to-dismiss on the
chat list, a calmer (no-overshoot) input auto-grow spring, and deletion of the dead
`GlassTabBar` component. It was built into a Development-signed binary that installed
and launched cleanly on a physical iOS device; it was not uploaded to TestFlight.

Version `4.1.3` build `70` is a release-readiness and documentation-integrity pass
on top of `4.1.2` (a structured-review-flagged changelog release-state correction
and a keyboard drag-to-dismiss regression test; no app-behavior change versus
`4.1.2`). It carries all of the `4.1.2` premium-feel work to TestFlight, since
`4.1.2` itself was only Development-signed onto a device and never uploaded.

- `4.1.5` build `72` SDK 57 gates on `2026-06-30`: `bun run verify:all`
  passed; Expo Doctor reported `19/19`; `bun audit` reported
  `No vulnerabilities found`; `gitleaks detect` reported `no leaks found`;
  Jest reported `122` suites passed, `1` skipped, `959` tests passed, and
  `13` skipped.
- Native DNS module tests pass on `2026-06-30` (`8` suites passed, `1` skipped;
  `64` tests passed, `13` skipped).
- Xcode `26.6` (`17F113`) local iOS evidence on `2026-06-30`: Debug simulator
  build passed, unsigned generic Release build passed, and unsigned generic
  Release archive passed.
- Runtime smoke on `2026-06-30`: the compiled simulator app installed and
  launched with Argent after clearing a stale Metro process from another repo;
  accessibility and React component discovery showed the DNSChat onboarding
  screen. Argent screenshot/gesture backend failed with
  `simulator-server exited with code before becoming ready`; that is a tooling
  gap, not an app launch failure.
- TestFlight, App Store version attachment, and physical-device install remain
  separate evidence claims for `4.1.5` build `72` and must not be inferred from
  the local simulator/archive checks.
- `4.1.0` build `67` (a staging milestone; later superseded by `4.1.1` build
  `68` as the latest `VALID` TestFlight build); the build number was advanced
  from `4.0.32` build `66`. Build `67` completed `VALID` on `2026-06-22` using
  the GM Xcode `26.6` (`17F109`) toolchain via the archive -> export ->
  `asc publish testflight` lane (build `66` was also `VALID`). Internal App
  Store Connect IDs and tester group names are intentionally omitted from
  public docs.
- Compiled Release simulator runtime evidence on `2026-06-22` for `4.1.0` build
  `67`: the app launches cleanly (no `ErrorBoundary`) and the new adaptive
  launcher icon renders on the Home Screen, verified via Argent MCP (`describe`
  + `gesture-tap` + Home-screen capture). The in-app DNS-message path was not
  exercised on this build because it was compiled unsigned
  (`CODE_SIGNING_ALLOWED=NO`), which makes `expo-secure-store`'s keychain
  unavailable ("Encryption key is unavailable"); DNS end-to-end is covered by
  the Node harness (real TXT answer) and by the TestFlight device build.
- Historical `asc validate testflight` evidence is superseded by each uploaded
  build validation. App Store submission validation is not applicable until a
  matching App Store version record exists.
- `xcodebuild test` is not a native gate yet because the `DNSChat` scheme has no
  XCTest bundles.
- DNS transport is observable. Public copy and tests intentionally avoid
  claiming that DNS prompts are private or end-to-end encrypted.

## Security notes

- DNS is observable infrastructure. Do not send secrets or personal data.
- DNS servers are validated/whitelisted (see `modules/dns-native/constants.ts`).
- Local chat/log payloads are encrypted at rest. Native builds keep encryption
  key material in SecureStore, and Android backup/device-transfer rules exclude
  that SecureStore data. Web preview uses same-origin browser storage for the
  local-only preview key because SecureStore is not available in browsers; do
  not treat Web preview storage as a secure production at-rest boundary.
- Store submission credentials are not committed. Keep `eas submit`/App Store
  Connect identifiers local (do not add them to `eas.json`).
- Public release docs use placeholders for local/device/account identifiers.
  Run `bun run verify:public-redaction` before committing release notes or store
  runbooks. Exact release evidence belongs in private notes outside git.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

Report security vulnerabilities via [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
