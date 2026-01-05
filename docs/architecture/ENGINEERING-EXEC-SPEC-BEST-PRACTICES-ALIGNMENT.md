# Engineering Exec Spec: Best-Practices Alignment and Hardening (DNSChat)

Status: Implemented
Owner: Mobile
Last updated: 2026-01-04

## Goal

Align DNSChat with current platform and security best practices while preserving existing product behavior and transport semantics. This spec focuses on cryptographic randomness, deprecated dependencies, doc/code alignment, and lifecycle guards.

## Non-goals

- Adding new DNS transports (e.g., DNS-over-HTTPS in the TypeScript layer).
- Changing the DNS prompt sanitization rules or transport order semantics.
- UI redesign or navigation rewrites.
- Major refactors outside the identified best-practice gaps.

## Current state (post-implementation)

- Randomness:
  - `src/services/encryptionService.ts` uses `expo-crypto` for key/nonce generation.
  - `src/services/dnsService.ts` uses secure RNG sources and restricts Math.random to dev/test fallback.
- Storage:
  - Chat and DNS logs are encrypted before being persisted to AsyncStorage.
- Logging:
  - DNS log cleanup runs on an unguarded interval; repeated initialization can create multiple intervals.
- Docs vs code:
  - DNS protocol spec describes behavior that is close but not fully aligned with current `composeDNSQueryName` and `parseTXTResponse` comments.

## Best-practice references (source of truth)

- Expo recommends `expo-crypto` for cryptographically secure random values and provides `getRandomValues` and `getRandomBytesAsync`.
- `expo-random` is deprecated in favor of `expo-crypto`.
- React Native security guidance warns against storing sensitive data in AsyncStorage without protection.

## Proposed approach (chosen)

### Option A: Documentation-only alignment

Pros:
- Zero runtime risk.

Cons:
- Leaves deprecated dependencies and insecure fallback paths in place.

### Option B: Targeted hardening + doc alignment (recommended)

Pros:
- Removes deprecated dependency usage.
- Ensures cryptographically secure randomness is always used.
- Keeps changes scoped and testable.

Cons:
- Requires careful entry-point bootstrapping and test updates.

Chosen: Option B.

## Architecture / data flow updates

### Crypto bootstrap

Add a small bootstrap module that ensures a secure RNG is available everywhere:

- On native: prefer `expo-crypto` for `getRandomValues`/`getRandomBytesAsync`.
- On web: consider `expo-standard-web-crypto` if global `crypto` is missing.
- Ensure the bootstrap runs before any code uses `crypto` (entry point import order).

### Replace deprecated randomness usage

- Replace `expo-random` usages in `encryptionService` with `expo-crypto`.
- Ensure `generateSecureDNSId` never falls back to `Math.random` in production builds (keep a defensive fallback for test environments only).

### Interval guard for DNS log cleanup

- Introduce a static interval handle in `DNSLogService` and guard against multiple scheduler starts.
- Add a teardown hook if applicable (tests or app shutdown).

### Doc and comment alignment

- Update DNS protocol spec or code behavior to remove discrepancies:
  - `composeDNSQueryName` input expectations (empty DNS server handling).
  - `parseTXTResponse` comment vs actual concatenation behavior.

## Phased plan with milestones

### Phase 0: Discovery and constraints

Acceptance criteria:
- Inventory of randomness usage, entry points, and any global crypto polyfills.
- Confirm all runtime entry points (native + web) and where to inject bootstrap.

TODO:
- Audit `entry.tsx`, `app/_layout.tsx`, and any other entry points for initialization order.
- Confirm whether web builds already expose `crypto`.

Verification:
- `rg "getRandom" src modules app`

Rollback:
- No code changes.

### Phase 1: Crypto modernization

Acceptance criteria:
- `expo-random` removed from runtime usage.
- `expo-crypto` provides RNG for encryption and DNS transaction IDs.

TODO:
- Add `expo-crypto` if missing.
- Replace `expo-random` usage in `src/services/encryptionService.ts`.
- Add `src/bootstrap/crypto.ts` (or similar) to polyfill `crypto.getRandomValues` on supported platforms.
- Import bootstrap at the earliest entry point.

Verification:
- Unit test: encryption round-trip still succeeds.
- Runtime check: `crypto.getRandomValues` exists after bootstrap.

Rollback:
- Revert dependency and bootstrap changes.

### Phase 2: DNS transaction ID hardening

Acceptance criteria:
- `generateSecureDNSId` uses secure RNG without `Math.random` fallback in production.
- Test coverage for secure RNG path.

TODO:
- Update `generateSecureDNSId` to use `expo-crypto` directly when global `crypto` is not present.
- Add a test to ensure deterministic fallback in Jest (or a mocked secure RNG).

Verification:
- `bun run test -- --testPathPattern=dnsService`

Rollback:
- Revert DNS RNG change.

### Phase 3: DNS log cleanup guard

Acceptance criteria:
- `DNSLogService.initializeCleanupScheduler()` is idempotent.

TODO:
- Add a static interval handle and guard.
- Add unit coverage or a small behavioral test to ensure single interval start.

Verification:
- `bun run test -- --testPathPattern=dnsLogService`

Rollback:
- Revert interval guard change.

### Phase 4: Documentation alignment

Acceptance criteria:
- Docs match actual runtime behavior and comments match code.

TODO:
- Update `docs/technical/DNS-PROTOCOL-SPEC.md` for `composeDNSQueryName` behavior.
- Fix `parseTXTResponse` comment in `src/services/dnsService.ts` to describe concatenation.

Verification:
- `bun run lint`
- `bun run test`

Rollback:
- Revert doc changes.

### Phase 5: Release hardening

Acceptance criteria:
- CI passes with updated dependencies.
- No regressions in DNS transports or storage.

TODO:
- Run full test suite and DNS harness checks.
- Update changelog if needed.

Verification:
- `bun run lint`
- `bun run test`
- `node test-dns-simple.js "hello"`
- `bun run dns:harness -- --message "hello"`

Rollback:
- Revert changes in a single PR if needed.

## Implementation status

All phases completed on 2026-01-04.

## Detailed multi-phase todo (completed)

### Phase 0: Discovery and constraints

- [x] Inventory RNG usage (code + tests).
- [x] Identify entry points where bootstrap must run.
- [x] Check web crypto availability assumptions.

### Phase 1: Crypto modernization

- [x] Add secure RNG bootstrap (`src/bootstrap/crypto.ts`).
- [x] Import bootstrap early (`entry.tsx`).
- [x] Replace deprecated RNG usage in encryption (`src/services/encryptionService.ts`).
- [x] Update dependencies + lockfile (`package.json`, `bun.lock`).

### Phase 2: DNS transaction ID hardening

- [x] Secure RNG only with dev/test fallback (`src/services/dnsService.ts`).
- [x] Add tests for secure RNG paths (`__tests__/dnsService.spec.ts`).

### Phase 3: DNS log cleanup guard

- [x] Guard scheduler against duplicate intervals (`src/services/dnsLogService.ts`).
- [x] Add teardown hook (`src/services/dnsLogService.ts`).
- [x] Add scheduler idempotency test (`__tests__/dnsLogService.spec.ts`).

### Phase 4: Documentation alignment

- [x] Align `composeDNSQueryName` rules (`docs/technical/DNS-PROTOCOL-SPEC.md`).
- [x] Align TXT parsing comment (`src/services/dnsService.ts`).
- [x] Update docs index (`docs/README.md`).

### Phase 5: Release hardening verification

- [x] Lint + unit tests run.
- [x] DNS smoke/harness attempted (network-limited failures documented).
- [x] Spec marked implemented (this document).

## Testing strategy

- Unit tests for RNG bootstrap and encryption round-trip.
- DNS unit tests to ensure query name composition and TXT parsing still conform to spec.
- Manual smoke tests for UDP/TCP fallback remain unchanged.

## Observability

- Maintain existing dev-only logs via `devLog`.
- Ensure any new crypto bootstrap warnings are gated to dev builds.

## Rollout plan

- Prefer multiple small PRs aligned to phases 1-4.
- Keep dependency changes isolated for easy rollback.

## Rollback plan

- Revert bootstrap and `expo-crypto` changes in a single commit.
- Restore `expo-random` usage only if necessary for compatibility.

## Risks and mitigations

- Risk: entry-point ordering issues prevent crypto bootstrap.
  - Mitigation: explicit import in the earliest entry file and test for presence.
- Risk: web build lacks crypto polyfill.
  - Mitigation: fallback to `expo-standard-web-crypto` or guard with feature detection.
- Risk: doc/spec drift persists.
  - Mitigation: add tests for expected behavior and update specs concurrently.

## Open questions

- Should we guarantee secure RNG in production builds only, or also in dev/test?
- Do we want to salt or HMAC the redaction hashes to reduce offline guessing risk?
