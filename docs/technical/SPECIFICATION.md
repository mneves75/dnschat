# DNSChat specification (current behavior)

DNSChat is a mobile chat UI where each user message is encoded into a DNS TXT
query and the TXT response is shown as the assistant message.

This is a behavior spec, not a release log.

## Core UX

- Chat list: multiple threads persisted locally.
- Thread view: user and assistant bubbles, streaming-like UX (send user message,
  show assistant response when DNS returns).
- Settings: DNS server selection, transport toggles, onboarding reset.
- Logs: in-app DNS logs showing transport attempts and fallbacks.

## Prompt rules (must match native + JS)

Source of truth: `modules/dns-native/constants.ts`.

- Max prompt length before sanitization: `120`.
- Prompt must not contain control characters.
- Sanitizer outputs a single RFC 1035 DNS label:
  - lowercase alphanumeric + dash only
  - max length `63`
  - empty after sanitization is rejected

Rationale: avoid silent truncation and avoid DNS injection/encoding ambiguity.

## DNS query behavior

Source of truth: `src/services/dnsService.ts`.

End-to-end steps:

1. Validate prompt.
2. Sanitize prompt into `label`.
3. Compose query name `${label}.${zone}`.
4. Send query via transport chain.
5. Parse TXT answer set into a single response string.

TXT parsing rules are defined in `docs/technical/DNS-PROTOCOL-SPEC.md` and
implemented in `parseTXTResponse`.

## Transport chain

Order:

1. Native DNS module
2. UDP DNS (JS)
3. TCP DNS (JS)
4. Mock (optional dev fallback)

Web builds use Mock because browsers cannot do custom DNS to `ch.at` on port 53.

## Local persistence

Storage backend:

- AsyncStorage
- Threads + messages are serialized to JSON

Expected properties:

- Thread list survives app restarts.
- Thread title derives from first user message (trimmed/shortened).
- Message status supports success/error states so failures are visible.

Implementation: `src/services/storageService.ts`.

## Non-goals / constraints

- DNS is not private. Do not send secrets or personal data.
- Some networks block UDP/TCP port 53; fallbacks and logs exist to make this
  visible, not silent.

## Engineering execution spec (public release hardening)

This section is an engineering spec for making the repo shippable as a public
production codebase. It is intentionally explicit about invariants and
verification.

### Goals

1. Repo is safe to publish: no credentials, no internal-only docs, no private URLs.
2. Docs reflect actual behavior (not aspirational transports/features).
3. Tooling is reproducible on clean machines and in CI.
4. "No emoji" policy is enforced by tests to prevent regressions.
5. Version sync tooling is deterministic (no accidental build bumps).

### Non-goals

- Re-architecting the app or changing the product UX.
- Adding new network transports in the TypeScript layer (e.g. DNS-over-HTTPS).
- "Perfect" logging UX; only enforce safety + determinism.

### Invariants (must always hold)

Transport + DNS:

- Input validation + sanitization rules are identical across TS and native.
- TypeScript transport chain is: native -> udp -> tcp -> mock.
- TCP transport means DNS-over-TCP on port 53 (not DNS-over-HTTPS).
- DNS query name is fully composed by TypeScript and passed to native as-is.

Security:

- No secrets in git history or working tree (enforced via gitleaks).
- No hardcoded credentials or private endpoints.
- DNS server is validated/whitelisted (do not accept arbitrary user input).
  - Enforced by `validateDNSServer` (`src/services/dnsService.ts`) using the shared allowlist in `modules/dns-native/constants.ts`.
  - Persisted settings are coerced back to `ch.at` during migration when an unallowlisted value is found (`src/context/settingsStorage.ts`).

Repo quality:

- Lint and tests can run on CI without relying on global tools.
- Pre-commit hook blocks commits when lint/tests fail.
- No emoji/pictographic glyphs in tracked source/docs files.
- No noisy `console.log` debug spam in app runtime code (keep logs behind a gated helper).

### Implementation checklist (completed in code)

1. Secrets scanning
   - `.gitleaks.toml` configured for known false positives (Podfile.lock)
   - CI runs gitleaks on PRs and main (`.github/workflows/gitleaks.yml`)
	   - Local verification command: `gitleaks detect --source . --redact --no-banner --config .gitleaks.toml`
	   - Repo policy tests ensure release credentials are not committed:
	     - `__tests__/repo.noCredentials.spec.ts` (EAS submit config + iOS signing team IDs)

2. Lint portability
   - `@ast-grep/cli` is a devDependency so `npm run lint` works in CI
   - Lint config is `project-rules/astgrep-liquid-glass.yml`
   - Local verification command: `npm run lint`

3. No-emoji enforcement
   - Jest test scans tracked files using `git ls-files`: `__tests__/repo.noEmoji.spec.ts`
   - Any emoji regression fails CI and local tests

4. Version sync determinism
   - `scripts/sync-versions.js` uses `package.json` as source-of-truth
   - Build numbers do not change when everything is already synchronized
   - Optional flags:
     - `--bump-build` to bump build explicitly
     - `--build-number <n>` to set an explicit build number (must be monotonic)
   - Jest test: `__tests__/syncVersions.spec.ts`

5. Documentation correctness
   - Architecture doc explicitly states TS chain has no DNS-over-HTTPS
   - Android native internal fallback chain may use DNS-over-HTTPS for non-`ch.at`
     (`docs/architecture/SYSTEM-ARCHITECTURE.md`)

6. CI hardening (public repo baseline)
   - CI runs on PRs + main:
     - Lint + unit tests (`.github/workflows/ci.yml`)
     - Secrets scan (`.github/workflows/gitleaks.yml`)
   - Optional but recommended for public release:
     - Dependency update automation (`.github/dependabot.yml`)
     - Static analysis (`.github/workflows/codeql.yml`)

7. Repo hygiene
   - No tracked macOS artifacts:
     - `.DS_Store` removed and ignored
     - Guard test prevents it from coming back
   - Store listing assets and automation can be tracked when needed:
     - Store metadata docs live under `docs/App_store/` (markdown only).
     - fastlane configuration + screenshots live under `ios/fastlane/`.
     - Generated outputs (e.g. `ios/fastlane/report.xml`) stay out of git.
     - Guard tests enforce these constraints (`__tests__/repo.hygiene.spec.ts`).
   - Local-only tooling folders are ignored and must not be tracked:
     - `.claude/`, `.cursor/`, `agent_planning/`, `.logs/` are gitignored
     - Guard test prevents tracking them (`__tests__/repo.hygiene.spec.ts`)
   - Keep dependencies minimal and justifiable:
     - Remove unused heavyweight tooling deps from `package.json` to reduce
       attack surface and install time (e.g. Playwright, when not used).
	   - Block common secret-bearing files at the repo boundary:
     - Do not track `.env` or `.env.*` files unless they are explicit examples
       (`.env.*.example`)
     - Do not track private key material (`.p8`, `.p12`, `.pem`, `.key`, etc)
     - Do not track common cloud service secret configs (Firebase plist/json)
	     - Guard test enforces this (`__tests__/repo.hygiene.spec.ts`)

8. Deterministic iOS pods maintenance
   - Default cleanup workflows keep `ios/Podfile.lock` intact (determinism).
   - `npm run clean-ios` removes `Pods/` and reinstalls without touching the lockfile.
   - `scripts/fix-cocoapods.sh` preserves `Podfile.lock` by default; `--reset-lock` is explicit.
   - Jest policy test: `__tests__/iosPodsCleanupPolicy.spec.ts`

9. Logging hygiene (production + tests)
   - `src/` does not use `console.*` directly except:
     - `src/utils/devLog.ts` (gated helper)
     - `src/utils/androidStartupDiagnostics.ts` (explicit diagnostic utility)
     - `src/components/ErrorBoundary.tsx` (explicit last-resort crash boundary)
   - Jest policy test: `__tests__/repo.noConsoleLog.spec.ts`

### Verification (required before release)

Run locally:

- `npm install`
- `npm run lint`
- `npm test -- --bail --passWithNoTests`
- `cd modules/dns-native && npm ci && npm test`
- `gitleaks detect --source . --redact --no-banner --config .gitleaks.toml`

CI enforces:

- Lint + Jest (`.github/workflows/ci.yml`)
- Gitleaks (`.github/workflows/gitleaks.yml`)
