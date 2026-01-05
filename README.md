# DNSChat

DNSChat is a React Native (Expo dev-client) app that sends short chat prompts as
DNS TXT queries (default DNS server: `ch.at`). The app includes:

- A native DNS TXT resolver module for iOS/Android (`modules/dns-native/`)
- JavaScript fallback transports (UDP/TCP) for constrained networks
- An in-app Logs screen to inspect attempts, failures, and fallbacks

[![Version](https://img.shields.io/badge/version-3.8.6-blue.svg)](https://github.com/mneves75/dnschat)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.30-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![iOS](https://img.shields.io/badge/iOS-16%2B-lightgrey.svg)](https://developer.apple.com/ios/)
[![Android](https://img.shields.io/badge/Android-API%2021%2B-green.svg)](https://developer.android.com/)

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
git clone https://github.com/mneves75/dnschat.git
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

- `docs/README.md` (index)
- `docs/INSTALL.md`
- `docs/architecture/SYSTEM-ARCHITECTURE.md`
- `docs/troubleshooting/COMMON-ISSUES.md`
- `docs/technical/DNS-PROTOCOL-SPEC.md`

## Security notes

- DNS is observable infrastructure. Do not send secrets or personal data.
- DNS servers are validated/whitelisted (see `modules/dns-native/constants.ts`).
- Store submission credentials are not committed. Keep `eas submit`/App Store
  Connect identifiers local (do not add them to `eas.json`).

## License

MIT. See `LICENSE`.
