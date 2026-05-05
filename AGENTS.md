# AGENTS.md - Project Navigation for Coding Agents

This file provides a fast, practical map of the repo so agents can orient quickly and make safe changes.

## Start Here

- Read `CLAUDE.md` for architecture, commands, and transport order.
- Read `docs/README.md` for the documentation index.
- Read `docs/technical/SPECIFICATION.md` before broad review, security work, or behavior changes; it is the current product and engineering behavior contract.
- Read `SECURITY.md`, `docs/data-inventory.md`, and `docs/model-registry.md` before privacy, storage, logging, networking, or release-readiness changes.

## What This App Is

DNSChat is an Expo dev-client React Native app that sends short prompts as DNS TXT queries and renders responses.

**Stack**: Expo SDK 55.0.23 / React Native 0.83.6 / React 19.2.0 / TypeScript 5.9.x / Hermes / New Architecture

The app's product promise is: no accounts, no API keys, no tracking, local encrypted history, and DNS-based prompt/response transport. DNS is observable infrastructure, so UX, docs, logs, and tests must never imply that DNS prompts are private.

## Key Entry Points

- `entry.tsx` -> runtime bootstrap; imports crypto bootstrap, then `expo-router/entry`.
- `app/_layout.tsx` -> root providers, onboarding gate, initialization hooks.
- `app/(tabs)/_layout.tsx` -> tab bar and screen wiring.

## Core Logic

- `src/services/dnsService.ts` -> DNS query pipeline (native -> UDP -> TCP -> mock).
- `src/services/dnsLogService.ts` -> log storage and cleanup scheduler.
- `src/services/storageService.ts` -> encrypted local storage for chats/logs.
- `src/services/encryptionService.ts` -> AES-GCM encryption helpers and SecureStore-backed key handling.
- `src/context/settingsStorage.ts` -> settings persistence, default DNS server, and migration/coercion of invalid settings.
- `src/i18n/messages/en-US.ts`, `src/i18n/messages/pt-BR.ts` -> bilingual copy; update both locales together.
- `modules/dns-native/` -> native DNS module (iOS/Android).

## Requirement Contract

- Product behavior source of truth: `docs/technical/SPECIFICATION.md`.
- DNS wire/protocol rules: `docs/technical/DNS-PROTOCOL-SPEC.md`.
- System architecture and transport boundaries: `docs/architecture/SYSTEM-ARCHITECTURE.md`.
- Data handling and retention: `docs/data-inventory.md`.
- Model/provider claims: `docs/model-registry.md`.
- Public security process: `SECURITY.md`.

For any source-code sweep, map findings and fixes back to these requirements. Do not treat a lint/test pass as enough if behavior, docs, security posture, or native/JS parity drift from the requirement contract.

## Configuration

- `package.json` -> version source of truth.
- `app.json` -> Expo config (typed routes, new arch, plugins).
- `babel.config.js` -> React Compiler + production console stripping.
- `tsconfig.json` -> strict TS config.

## Commands (Bun)

- Dev: `bun run start`, `bun run ios`, `bun run android`, `bun run web`
- Lint: `bun run lint`
- Tests: `bun run test`
- Native module tests: `cd modules/dns-native && bun run test`
- DNS harness: `bun run dns:harness -- --message "test message"`; add `--local-server` for offline UDP/TCP verification.
- Security scan: `gitleaks detect --source . --redact --no-banner --config .gitleaks.toml`
- Version sync: `bun run sync-versions` (source = `package.json`)
- Verify: `bun run verify:all` (runs all gates: lint, test, pods, sdk alignment, typed routes, etc.)

## Review / Security Sweep Protocol

When asked for a broad review, "latest/best practices", "2026+", or a full source sweep:

1. Use the relevant skills/workflows first (`$code-review`, `$security-review`, and React Native/iOS simulator skills when runtime evidence is needed).
2. Confirm current official docs for unfamiliar or version-sensitive Expo, React Native, React Compiler, platform, or security guidance before changing code.
3. Inventory all owned source surfaces: `app/`, `src/`, `modules/dns-native/`, `scripts/`, `__tests__/`, native config under `ios/` and `android/`, and release/security docs.
4. Check security explicitly: prompt validation, DNS server allowlist, DNS query composition, TXT parsing, encrypted local storage, SecureStore key handling, logs/redaction, backup exclusions, native permissions, release signing, dependency overrides, and secret scanning.
5. Preserve behavior with focused regression tests before cleanup/refactor edits when behavior is not already protected.
6. Keep native and TypeScript DNS constants synchronized. Do not change `MAX_MESSAGE_LENGTH`, `MAX_DNS_LABEL_LENGTH`, server order, or sanitizer behavior without native + JS tests and docs updates.
7. Finish with evidence: `bun run verify:all`, `cd modules/dns-native && bun run test`, `gitleaks detect --source . --redact --no-banner --config .gitleaks.toml`, and any platform/runtime smoke required by the touched area.

## Versioning Rules

- Update `package.json` first, then run `bun run sync-versions --bump-build`.
- iOS/Android versions are synced via `scripts/sync-versions.js`.

## Docs You Will Touch Often

- `docs/architecture/SYSTEM-ARCHITECTURE.md`
- `docs/technical/DNS-PROTOCOL-SPEC.md`
- `docs/technical/SPECIFICATION.md`
- `docs/data-inventory.md`
- `docs/model-registry.md`
- `docs/troubleshooting/COMMON-ISSUES.md`

## Guardrails

- Use Bun as default package manager.
- Keep iOS `DEVELOPMENT_TEAM` empty for public portability.
- Keep `react-native-reanimated/plugin` last in `babel.config.js`.
- Keep React Compiler enabled and avoid adding manual memoization unless profiling proves it is needed.
- Do not change DNS prompt limits without updating native constants and tests.
- Do not add arbitrary DNS server input; server choices must stay allowlisted.
- Do not log prompts, TXT responses, encryption keys, device identifiers, or credentials in production paths.
- Do not commit `.env*`, App Store Connect keys, Android keystores, Firebase configs, or other secret-bearing files.
- Keep user-facing copy bilingual; update `en-US` and `pt-BR` in the same change.
- Run `bun run verify:all` before committing to catch drift early.
