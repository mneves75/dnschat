# Contributing to DNSChat

Keep changes small, testable, cross-platform, security-first.

## Setup

- Follow `docs/INSTALL.md` for full setup.
- Android: Java 17 required for builds.
- iOS: Xcode 15+ (macOS), iOS 16+ device/simulator.

## Dev loop

```bash
pnpm install
pnpm run start
```

## Issue templates

Use this repository's GitHub issue templates for bug reports and feature requests.

Common checks:

```bash
# Lint (ast-grep rules)
pnpm run lint

# Unit tests
pnpm run test

# Ensure iOS pods lockfile matches installed deps
pnpm run verify:ios-pods

# Android tooling sanity check
pnpm run verify:android

# Run all verification gates at once
pnpm run verify:all
```

DNS smoke checks:

```bash
node test-dns-simple.js "test message"
pnpm run dns:harness --message "test message"
node test-dns-simple.js "test message" --local-server
pnpm run dns:harness --message "test message" --local-server
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

## Reporting vulnerabilities

See [SECURITY.md](SECURITY.md) for responsible disclosure.

## Git hooks

`pnpm install` runs `pnpm run prepare` which installs a pre-commit hook that runs:

- `pnpm run verify:ios-pods`
- `pnpm run lint`
- `pnpm run test --bail --passWithNoTests`

Remove `.git/hooks/pre-commit` locally if you do not want repo-managed hooks.

## PR checklist

- `pnpm run lint`
- `pnpm run test`
- `node test-dns-simple.js "hello"`
- `pnpm run dns:harness --message "hello"`
