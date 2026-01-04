# Contributing to DNSChat

Keep changes small, testable, cross-platform, security-first.

## Setup

- Follow `docs/INSTALL.md` for full setup.
- Android: Java 17 required for builds.
- iOS: Xcode 15+ (macOS), iOS 16+ device/simulator.

## Dev loop

```bash
bun install
bun run start
```

Common checks:

```bash
# Lint (ast-grep rules)
bun run lint

# Unit tests
bun run test

# Ensure iOS pods lockfile matches installed deps
bun run verify:ios-pods

# Android tooling sanity check
bun run verify:android
```

DNS smoke checks:

```bash
node test-dns-simple.js "test message"
bun run dns:harness -- --message "test message"
node test-dns-simple.js "test message" --local-server
bun run dns:harness -- --message "test message" --local-server
```

## Code guidelines

- TypeScript strict: avoid `any`, keep types close to usage.
- Keep transport order and behavior aligned with `src/services/dnsService.ts`.
- Keep sanitization rules aligned with `modules/dns-native/constants.ts` (shared contract).
- Avoid platform divergence unless unavoidable; document the reason in the PR description.

## Security + privacy

- DNS is observable infrastructure; never put secrets/PII in prompts or logs.
- Do not add unvalidated DNS endpoints; keep the DNS server whitelist consistent across layers.
- Validate and sanitize inputs before building query names.

## Git hooks

`bun install` runs `bun run prepare` which installs a pre-commit hook that runs:

- `bun run verify:ios-pods`
- `bun run lint`
- `bun run test -- --bail --passWithNoTests`

Remove `.git/hooks/pre-commit` locally if you do not want repo-managed hooks.

## PR checklist

- `bun run lint`
- `bun run test`
- `node test-dns-simple.js "hello"`
- `bun run dns:harness -- --message "hello"`
