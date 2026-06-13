# DNSChat

DNSChat is a React Native Expo app that sends short chat prompts as
DNS TXT queries (default DNS server: `llm.pieter.com`). The app includes:

- A native DNS TXT resolver module for iOS/Android (`modules/dns-native/`)
- JavaScript fallback transports (UDP/TCP) for constrained networks
- An in-app Logs screen to inspect attempts, failures, and fallbacks

[![Version](https://img.shields.io/badge/version-4.0.30-blue.svg)](.)
[![React Native](https://img.shields.io/badge/React%20Native-0.85.3-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-56.0.9-black.svg)](https://expo.dev/)
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

- App version: `4.0.30` (build `64`)
- Expo workflow: Expo Router + EAS-compatible native config
- Expo SDK: `56.0.9`
- React: `19.2.3`
- React Native: `0.85.3`
- TypeScript: `6.0.x`
- Hermes: enabled
- New Architecture: enabled by default on SDK 56
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
Current release target: version `4.0.30` build `64`. This release lane carries
the 4.0.28 chat-error presentation fix plus the full review hardening
(dnsjava CVE fix, subset-only native allowlist, UDP datagram re-arm,
inbound response sanitization, storage mutation cache, splash off the
log-decrypt path, single shared chat-list action sheet). Signed
archive/export, TestFlight upload, processing, and validation run after the
final source/docs state is verified and pushed. The latest already-uploaded
TestFlight build before this lane is version `4.0.26` build `60` (`VALID` on
`2026-06-05`). App Store Connect has no App Store version record for `4.0.30`,
so App Store submission validation is not applicable for this TestFlight-only
staging build.

- `npx react-doctor@latest --project chat-dns` reports `100 / 100` on
  `2026-06-10`; the dns-native module also reports `100 / 100`.
- `bun run verify:expo-doctor` reports `20/20 checks passed, no issues` on
  `2026-06-10` (expo `56.0.9`, expo-router `56.2.9`, expo-linking `56.0.13`,
  expo-build-properties `56.0.17`, @expo/ui `56.0.16`).
- Native DNS module tests pass on `2026-06-10` (`8` suites passed, `1`
  skipped; `65` tests passed, `13` skipped), including the new
  `nativeSecurityPolicy` suite asserting dnsjava `>= 3.6.2` and allowlist
  set-equality across TS/Swift/Java.
- Jest baseline on `2026-06-10`: `117` suites passed, `1` skipped; `941` tests
  passed, `13` skipped. New suites cover inbound response sanitization, the
  multipart part-count cap, the storage mutation cache, and doctor.config
  exemption path validity.
- `gitleaks detect` on `2026-06-10` reports `no leaks found`.
- `bun audit` on `2026-06-10` reports `No vulnerabilities found` (after
  forcing `shell-quote >= 1.8.4`, GHSA-w7jw-789q-3m8p).
- `xcodebuild build` passes for Release on the iOS Simulator with the stable
  Xcode toolchain on `2026-06-10` after clamping pod deployment targets to
  `16.4` (the Xcode 27 beta toolchain cannot compile `expo-modules-jsi` yet —
  use `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer` when the
  beta is globally selected).
- Compiled Release simulator runtime evidence on `2026-06-10`: first launch
  surfaces the storage corruption-recovery toast for a stale store and
  resets safely; relaunch is clean; launch with system Reduce Motion
  enabled renders normally (no ErrorBoundary). Captured via `simctl`
  screenshots because the Argent MCP simulator-server could not start in
  this session (0.7.0 server / 0.10.0 CLI mismatch after a mid-session CLI
  update) — recorded as the documented Argent-unavailable fallback.
- Physical-device Release build, install, installed metadata check, and launch
  passed on `2026-06-04` for version `4.0.22` build `56`. Direct
  physical-device install remains blocked by local Xcode Development
  provisioning state (`No Accounts` and no matching development profile);
  TestFlight is the verified staging path for this build.
- TestFlight upload attempt for `4.0.30` build `64` on `2026-06-10`: signed
  archive and IPA export succeeded; App Store Connect processing rejected the
  binary with `ITMS-90534` (Invalid Toolchain) because the local stable Xcode
  slot now carries the `26.6` beta seed. Retry requires a GM toolchain and a
  fresh build number.
- Current target: `4.0.30` build `64`; the release lane uses signed App Store
  archive/export, App Store Connect upload, processing, and validation before
  the build is described as distributed. Internal App Store Connect IDs and
  tester group names are intentionally omitted from public docs.
- Historical `asc validate testflight` evidence is superseded by each uploaded
  build validation. App Store submission validation for `4.0.30` is not
  applicable until a matching App Store version record exists.
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
