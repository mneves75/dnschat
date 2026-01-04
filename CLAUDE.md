# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is DNSChat

A React Native (Expo dev-client) chat app that sends short prompts as DNS TXT queries to `ch.at` and renders responses. Uses React Native 0.81.5, Expo SDK 54.0.30, React 19.1.0, TypeScript 5.9.2.

## Commands

```bash
# Development
bun run start       # Expo dev-client server
bun run ios         # Build and run iOS
bun run android     # Build and run Android (auto-selects Java 17)
bun run web         # Web preview (uses Mock DNS)

# Testing
bun run test        # Run all unit tests (jest --runInBand)
bun run test -- --testPathPattern=<pattern>  # Run specific test file

# Linting
bun run lint        # ast-grep rules (blocks legacy liquid glass imports)

# DNS module tests (separate workspace)
cd modules/dns-native && bun run test

# DNS smoke tests (no RN runtime)
node test-dns-simple.js "test message"
bun run dns:harness -- --message "test message"
node test-dns-simple.js "test message" --local-server
bun run dns:harness -- --message "test message" --local-server

# iOS pod helpers
bun run verify:ios-pods   # Check lockfile sync
bun run fix-pods          # Basic CocoaPods cleanup
bun run clean-ios         # Deep pods reset

# Android diagnostics
bun run verify:android    # Sanity check tooling/device

# Version sync
bun run sync-versions     # Sync version across package.json, app.json, native configs
bun run sync-versions:dry # Preview changes
```

## Architecture

### DNS Query Pipeline

Transport fallback order (in `src/services/dnsService.ts`):
1. Native DNS (iOS/Android native module)
2. UDP (react-native-udp)
3. TCP (react-native-tcp-socket)
4. Mock (web/development)

Query flow:
1. Validate prompt (reject empty/whitespace/control chars)
2. Enforce 120-char limit before sanitization
3. Sanitize into DNS label (lowercase, spaces→dashes, 63-char max)
4. Send `label.<zone>` query through transport chain
5. Parse TXT response (plain or multipart `n/N:` format)

### Key Directories

- `modules/dns-native/` - Native DNS module (TS API + iOS/Android bridges)
  - `constants.ts` - Shared DNS constants (limits, sanitization rules, server whitelist)
  - `index.ts` - Module entry point
  - `ios/`, `android/` - Platform-specific implementations
- `src/services/` - App services
  - `dnsService.ts` - Query pipeline, transport chain, parsing
  - `dnsLogService.ts` - Logging for Logs screen
  - `storageService.ts` - AsyncStorage persistence
- `src/context/` - React contexts (Chat, Settings, Onboarding, Accessibility)
- `src/navigation/screens/` - App screens
- `src/components/` - UI components (ChatInput, MessageList, LiquidGlassWrapper)

### Native Module

`modules/dns-native/` is a separate workspace (npm lockfile used for module-only CI). Its constants in `constants.ts` must stay synchronized with iOS/Android implementations. Key constraints:
- `MAX_MESSAGE_LENGTH: 120` (before sanitization)
- `MAX_DNS_LABEL_LENGTH: 63` (RFC 1035)
- `ALLOWED_DNS_SERVERS` whitelist

### Pre-commit Hook

Installed via `bun install` → `scripts/install-git-hooks.js`. Runs:
1. `bun run verify:ios-pods`
2. `bun run lint`
3. `bun run test -- --bail --passWithNoTests`

### AST-Grep Rules

`project-rules/astgrep-liquid-glass.yml` blocks:
- Imports from deleted `../components/liquidGlass/` path
- References to deleted `LiquidGlassNative` module

Use `components/LiquidGlassWrapper` instead.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push to main and PRs:
- Root tests: verify:ios-pods, lint, test
- dns-native tests: separate job in `modules/dns-native`

## Platform Notes

**iOS**: Requires Xcode 15+, iOS 16+ target. Device builds need signing team in Xcode (repo keeps `DEVELOPMENT_TEAM` empty).

**Android**: Requires Java 17. `bun run android` auto-detects via `/usr/libexec/java_home -v 17` or Homebrew paths. Release signing credentials are never committed (uses `keystore.properties` or CI injection).

**Web**: Uses Mock DNS (browsers cannot do raw DNS on port 53).
