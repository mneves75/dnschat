# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is DNSChat

A React Native (Expo dev-client) chat app that sends short prompts as DNS TXT queries to LLM servers and renders responses. Uses React Native 0.83.6, Expo SDK 55.0.23, React 19.2.0, TypeScript 5.9.x.

**Default DNS Server**: `llm.pieter.com:53` (by @levelsio)
**Fallback Server**: `ch.at:53` (currently offline)

## Quick Navigation for Common Tasks

| Task | Files to Check |
|------|----------------|
| Runtime bootstrap | `entry.tsx` -> `expo-router/entry` -> `app/_layout.tsx` |
| Tab layout | `app/(tabs)/_layout.tsx` (web override: `_layout.web.tsx`) |
| Chat thread route | `app/chat/[threadId].tsx` |
| DNS query logic | `src/services/dnsService.ts` |
| Server configuration | `modules/dns-native/constants.ts` (`getLLMServers`, `getDefaultServer`) |
| Default server setting | `src/context/settingsStorage.ts` (`DEFAULT_DNS_SERVER`) |
| Settings UI | `src/navigation/screens/GlassSettings.tsx` |
| Translations | `src/i18n/messages/en-US.ts`, `pt-BR.ts` |
| Native DNS module | `modules/dns-native/index.ts` |
| Chat context | `src/context/ChatContext.tsx` |
| Message sanitization | `modules/dns-native/constants.ts` (`sanitizeDNSMessageReference`) |

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
dig @llm.pieter.com "hello" TXT +short  # Quick server test
node test-dns-simple.js "test message"
bun run dns:harness -- --message "test message"

# iOS pod helpers
bun run verify:ios-pods   # Check lockfile sync
bun run fix-pods          # Basic CocoaPods cleanup
bun run clean-ios         # Deep pods reset

# Android diagnostics
bun run verify:android    # Sanity check tooling/device
bun run verify:android-16kb # Validate 16KB page size alignment after a native Android build
bun run verify:typed-routes # Generate and validate Expo Router typed routes
bun run verify:react-compiler # Run React Compiler healthcheck
bun run verify:all     # Run ALL verification gates (lint, test, pods, sdk alignment, etc.)

# Version sync
bun run sync-versions     # Sync version across package.json, app.json, native configs
bun run sync-versions:dry # Preview changes
```

## Architecture

### Routing & Bootstrap

This app uses **Expo Router** (file-based routing under `app/`), not React Navigation directly. `package.json:main` points at `entry.tsx`, which loads the crypto bootstrap then re-exports `expo-router/entry`. Provider wiring (Settings, Chat, Onboarding, Accessibility, Theme) lives in `app/_layout.tsx`.

`src/navigation/screens/` contains screen components consumed by Expo Router routes — they are not routes themselves. Don't add new files there expecting routing to pick them up; add a route in `app/` and import the screen.

`experiments.reactCompiler: true` and `experiments.typedRoutes: true` are enabled in `app.json`. Manual `useMemo`/`useCallback` should be removed (the compiler handles memoization). Run `bun run verify:typed-routes` after adding/renaming routes.

### DNS Server Fallback Chain

**Server selection** (in `src/services/dnsService.ts:570-575`):
- If user has selected a server in settings -> use ONLY that server (no fallback)
- Otherwise -> use `getLLMServers()` which returns `[llm.pieter.com:53, ch.at:53]`

**Transport fallback** (for each server):
1. Native DNS (iOS/Android native module)
2. UDP (react-native-udp)
3. TCP (react-native-tcp-socket)
4. Mock (web/development)

**Query flow**:
1. Validate prompt (reject empty/whitespace/control chars)
2. Enforce 120-char limit before sanitization
3. Sanitize into DNS label (lowercase, spaces->dashes, 63-char max)
4. Send `label.<zone>` query through transport chain
5. Parse TXT response (plain or multipart `n/N:` format)

### Key Directories

```
modules/dns-native/           # Native DNS module (TS API + iOS/Android bridges)
  constants.ts                # DNS_SERVERS, limits, sanitization rules
  index.ts                    # NativeDNS class, DNSError types
  ios/, android/              # Platform-specific implementations
  __tests__/                  # Module tests (run separately)

src/services/
  dnsService.ts               # Query pipeline, transport chain, parsing (1600+ lines)
  dnsLogService.ts            # Logging for Logs screen
  storageService.ts           # AsyncStorage persistence
  encryptionService.ts        # Secure storage

src/context/
  settingsStorage.ts          # DEFAULT_DNS_SERVER, settings persistence
  SettingsContext.tsx         # Settings state management
  ChatContext.tsx             # Chat state, sendMessage()

src/navigation/screens/        # Screen components rendered by Expo Router routes
  GlassSettings.tsx           # Settings UI with server picker
  GlassChatList.tsx           # Chat list
  Chat.tsx                    # Chat thread (rendered from app/chat/[threadId].tsx)

app/                          # Expo Router routes (file-based)
  _layout.tsx                 # Root providers + onboarding gate
  (tabs)/_layout.tsx          # Tab bar wiring
  chat/[threadId].tsx         # Dynamic chat-thread route

src/i18n/messages/
  en-US.ts, pt-BR.ts          # Translations including DNS server labels

docs/plans/                   # Execution plans and documentation
```

### Settings System

**User settings** stored in AsyncStorage:
- `dnsServer`: Selected DNS server (default: `llm.pieter.com`)
- `enableMockDNS`: Use mock responses for testing
- `allowExperimentalTransports`: Enable UDP/TCP fallbacks
- `enableHaptics`: Haptic feedback
- `preferredLocale`: Language preference

**Important**: When `dnsServer` is set, the app uses ONLY that server with NO fallback chain.

### Native Module

`modules/dns-native/` is a separate workspace. Constants in `constants.ts` must stay synchronized with iOS/Android implementations.

Key constraints:
- `MAX_MESSAGE_LENGTH: 120` (before sanitization)
- `MAX_DNS_LABEL_LENGTH: 63` (RFC 1035)
- `DNS_SERVERS` array defines server order and ports

### Pre-commit Hook

Installed via `bun install` -> `scripts/install-git-hooks.js`. Runs:
1. `bun run verify:ios-pods`
2. `bun run lint`
3. `bun run test -- --bail --passWithNoTests`

### AST-Grep Rules

`project-rules/astgrep-liquid-glass.yml` blocks:
- Imports from deleted `../components/liquidGlass/` path
- References to deleted `LiquidGlassNative` module

Use `components/LiquidGlassWrapper` instead.

### Babel Constraint

`react-native-reanimated/plugin` must remain the **last** entry in `babel.config.js:plugins`. The production-only `transform-remove-console` plugin runs before it.

### Versioning

`package.json:version` is the source of truth. To bump:

```bash
# 1. Edit package.json version manually, then:
bun run sync-versions          # Propagates to app.json (iOS buildNumber, Android versionCode), native modules
bun run sync-versions:dry      # Preview without writing
```

Never edit `ios/` or `android/` version fields by hand — they will be overwritten.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push to main and PRs:
- Root tests: verify:ios-pods, lint, test
- dns-native tests: separate job in `modules/dns-native`

## Platform Notes

**iOS**: Requires Xcode 15+, iOS 16+ target. Device builds need signing team in Xcode (repo keeps `DEVELOPMENT_TEAM` empty).

**Android**: Requires Java 17. `bun run android` auto-detects via `/usr/libexec/java_home -v 17` or Homebrew paths. Release signing credentials are never committed (uses `keystore.properties` or CI injection).

Android release manifests intentionally avoid legacy storage and overlay permissions. SecureStore is excluded from Android backup/device-transfer rules via `android/app/src/main/res/xml/secure_store_backup_rules.xml` and `secure_store_data_extraction_rules.xml`.

**Web**: Uses Mock DNS (browsers cannot do raw DNS on port 53).

## Common Issues

| Issue | Solution |
|-------|----------|
| DNS queries fail | Check `modules/dns-native/constants.ts` for server config |
| Default server wrong | Check `src/context/settingsStorage.ts:DEFAULT_DNS_SERVER` |
| Settings not updating | Check `src/context/SettingsContext.tsx` |
| Server picker wrong order | Check `src/navigation/screens/GlassSettings.tsx:dnsServerOptions` |
| Translation mismatch | Update both `en-US.ts` and `pt-BR.ts` |
| Android "Failed to locate application identifier" | Run `npx expo prebuild --platform android --clean` |
| Android minSdkVersion mismatch | Ensure `app.json` has `minSdkVersion: 24` (required by dependencies) |
| Android signature mismatch on install | Uninstall existing app: `adb uninstall org.mvneves.dnschat` |
| DNS Native Module not registered | The `dns-native-plugin.js` handles this - regenerate with prebuild |
