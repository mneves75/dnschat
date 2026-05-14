# DNSChat

DNSChat is a React Native (Expo dev-client) app that sends short chat prompts as
DNS TXT queries (default DNS server: `llm.pieter.com`). The app includes:

- A native DNS TXT resolver module for iOS/Android (`modules/dns-native/`)
- JavaScript fallback transports (UDP/TCP) for constrained networks
- An in-app Logs screen to inspect attempts, failures, and fallbacks

[![Version](https://img.shields.io/badge/version-4.0.8-blue.svg)](.)
[![React Native](https://img.shields.io/badge/React%20Native-0.83.6-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-55.0.24-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.x-blue.svg)](https://www.typescriptlang.org/)
[![iOS](https://img.shields.io/badge/iOS-16%2B-lightgrey.svg)](https://developer.apple.com/ios/)
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

- App version: `4.0.8` (build `36`)
- Expo workflow: Expo Router + dev-client + EAS-compatible native config
- Expo SDK: `55.0.24`
- React: `19.2.0`
- React Native: `0.83.6`
- TypeScript: `5.9.x`
- Hermes: enabled
- New Architecture: enabled by default on SDK 55
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

## Quick start

Prereqs:

- Node.js 18+
- iOS: Xcode 15+ (macOS only), iOS 16+ device/simulator
- Android: Java 17 + Android SDK

Install:

```bash
git clone <repository-url>
cd dnschat
bun install
```

Run:

```bash
# Dev server (Expo dev-client)
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
- For a full physical-device Expo dev-client install, build the native `DNSChat`
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

Last full source/security sweep: `2026-05-14`.
Last iOS CLI release smoke: `2026-05-14` with Xcode `26.5` (`17F42`).

- `bun run verify:all` passes (`expo-doctor` 17/17, SDK alignment, typed routes,
  DNS resolver sync, iOS pods, React Compiler, Android setup, lint, and Jest).
- Jest baseline: 73 suites passed, 1 skipped; 761 tests passed, 13 skipped.
- `bun audit`, `npm audit` in `modules/dns-native`, and `gitleaks detect`
  report no vulnerabilities or leaks.
- `xcodebuild clean build` passes for Debug on an iOS 26.5 simulator.
- `xcodebuild clean build` and `xcodebuild clean archive` pass for generic iOS
  Release when code signing is disabled (`CODE_SIGNING_ALLOWED=NO`).
- Physical-device compiled Expo dev-client install passed.
- Signed App Store archive/export passed, and the IPA was uploaded to
  TestFlight. The processed build is `VALID` and attached to the App Store
  version; internal App Store Connect IDs are intentionally omitted from public
  docs.
- `asc validate testflight` and App Store version validation pass with `0`
  errors and `0` warnings; the remaining App Store validation notes are
  informational: manual release type and API-unverifiable App Privacy publish
  state.
- `xcodebuild test` is not a native gate yet because the `DNSChat` scheme has no
  XCTest bundles.
- DNS transport is observable. Public copy and tests intentionally avoid
  claiming that DNS prompts are private or end-to-end encrypted.

## Security notes

- DNS is observable infrastructure. Do not send secrets or personal data.
- DNS servers are validated/whitelisted (see `modules/dns-native/constants.ts`).
- Local chat/log payloads are encrypted at rest; Android backup/device-transfer
  rules exclude SecureStore key material.
- Store submission credentials are not committed. Keep `eas submit`/App Store
  Connect identifiers local (do not add them to `eas.json`).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

Report security vulnerabilities via [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
