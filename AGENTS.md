# AGENTS.md - Project Navigation for Coding Agents

This file provides a fast, practical map of the repo so agents can orient quickly and make safe changes.

## Start Here

- Read `CLAUDE.md` for architecture, commands, and transport order.
- Read `docs/README.md` for the documentation index and current ExecPlans.

## What This App Is

DNSChat is an Expo dev-client React Native app that sends short prompts as DNS TXT queries and renders responses.

**Stack**: Expo SDK 55 / React Native 0.83.2 / React 19.2.0 / TypeScript 5.9.2 / Hermes / New Architecture

## Key Entry Points

- `entry.tsx` -> runtime bootstrap; imports crypto bootstrap, then `expo-router/entry`.
- `app/_layout.tsx` -> root providers, onboarding gate, initialization hooks.
- `app/(tabs)/_layout.tsx` -> tab bar and screen wiring.

## Core Logic

- `src/services/dnsService.ts` -> DNS query pipeline (native -> UDP -> TCP -> mock).
- `src/services/dnsLogService.ts` -> log storage and cleanup scheduler.
- `src/services/storageService.ts` -> encrypted local storage for chats/logs.
- `modules/dns-native/` -> native DNS module (iOS/Android).

## Configuration

- `package.json` -> version source of truth.
- `app.json` -> Expo config (typed routes, new arch, plugins).
- `babel.config.js` -> React Compiler + production console stripping.
- `tsconfig.json` -> strict TS config.

## Commands (Bun)

- Dev: `bun run start`, `bun run ios`, `bun run android`, `bun run web`
- Lint: `bun run lint`
- Tests: `bun run test`
- Version sync: `bun run sync-versions` (source = `package.json`)
- Verify: `bun run verify:all` (runs all gates: lint, test, pods, sdk alignment, typed routes, etc.)

## Versioning Rules

- Update `package.json` first, then run `bun run sync-versions --bump-build`.
- iOS/Android versions are synced via `scripts/sync-versions.js`.

## Docs You Will Touch Often

- `docs/architecture/SYSTEM-ARCHITECTURE.md`
- `docs/technical/DNS-PROTOCOL-SPEC.md`
- `docs/troubleshooting/COMMON-ISSUES.md`
- `docs/EXECPLAN-*.md` (living execution plans)

## Guardrails

- Use Bun as default package manager.
- Keep iOS `DEVELOPMENT_TEAM` empty for public portability.
- Keep `react-native-reanimated/plugin` last in `babel.config.js`.
- Do not change DNS prompt limits without updating native constants and tests.
- Run `bun run verify:all` before committing to catch drift early.
