# Plan 004: Test coverage + CI/DX hardening (behavioral gaps, green `test` job, faster loop)

> **Executor instructions**: Follow step by step; run each verification and
> confirm the expected result. On a STOP condition, stop and report. Update this
> plan's row in `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat b69b6ab..HEAD -- __tests__/ jest.config.js tsconfig.test.json .github/workflows/ci.yml package.json src/context/settingsStorage.ts`
> Mismatch with "Current state" = STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW–MED
- **Depends on**: none (Step 1 CI fix may interact with Plan 003's dep changes — do whichever lands first, then re-sync lockfiles)
- **Category**: tests
- **Planned at**: commit `b69b6ab`, 2026-07-04

## Why this matters

The `test` CI job is red on every push because expo-doctor flags 8 SDK-57 patch
drifts. Separately, the security-critical DNS anti-spoofing branches and the
hand-rolled byte encoder are under-tested, a `Platform.OS` mutation leaks
across files under `--runInBand`, and ts-jest type-checks every file making the
5-test run take ~27s. This plan makes the `test` job green, closes the highest-
value behavioral coverage gaps, and speeds the loop — without weakening the
type gate (`typecheck` stays the single source of type truth).

## Current state

- `.github/workflows/ci.yml` (~line 41) runs `bun run verify:expo-doctor` in
  the `test` job; expo-doctor reports 8 packages off their pinned patch
  (`expo`, `@expo/ui`, `expo-router`, `expo-constants`, `expo-asset`,
  `expo-build-properties`, `expo-splash-screen`, `@expo/metro-runtime`).
- `src/services/dnsWire.ts:165-193` — six security `throw`s in
  `validateDecodedDnsResponseForTxt` (ID mismatch, QR flag, opcode, TC
  truncation, rcode, QDCOUNT). Tests cover only question-name, source-address,
  source-port, and no-matching-TXT. The ID-mismatch branch has no test.
- `src/services/dnsWire.ts:114-136` — `encodeTxtDnsQuery`, a manual byte/label
  encoder, tested with a single input (`'hello.ch.at'`) in
  `__tests__/dnsWire.spec.ts:14-27`.
- `__tests__/hapticsConfigurator.spec.tsx:54` sets `Platform.OS = "android"`
  with `beforeEach` reset to `"ios"` but NO `afterEach`/`afterAll` restore; the
  RN mock `Platform` is a module singleton. Correct pattern (capture + restore)
  is in `__tests__/dnsService.appState.spec.ts:120-121`.
- `jest.config.js:11` uses `ts-jest` with no `isolatedModules`; `verify:all`
  already runs a separate `tsc --noEmit` gate.
- `src/context/settingsStorage.ts:54` `SETTINGS_VERSION = 5`; `migrateSettings`
  handles `< 3`, `=== 3`, `>= 4` (catch-all), and legacy v1. The v5 migration
  only added `themePreference` backfill (verified: the `=== 3` and `>= 4`
  branches both set `themePreference: resolvedThemePreference`). No test
  explicitly asserts a v4 payload gains `themePreference` default.
- The `android` CI job's original Java compile error (`DNSResolver.java:825`)
  was already fixed in commit `6b007a1` — do NOT re-fix it; it is not in scope.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Expo doctor | `bun run verify:expo-doctor` | exit 0 after fix |
| Typecheck | `bun run typecheck` | exit 0 |
| Tests | `bun run test` | all pass |
| Scoped tests | `bun run test -- --testPathPattern='dnsWire\|settings.migration\|haptics'` | pass |

## Scope

**In scope**:
- `.github/workflows/ci.yml` is NOT edited; the fix is aligning package
  versions + lockfiles so `verify:expo-doctor` passes
- `package.json`, `bun.lock`, `ios/Podfile.lock` (version alignment only)
- `__tests__/dnsWire.spec.ts`, `__tests__/settings.migration.spec.ts`, `__tests__/hapticsConfigurator.spec.tsx`
- `jest.config.js`, `tsconfig.test.json`
- `__tests__/mocks/react-native-reanimated.js` (tighten to `.get()/.set()` only)

**Out of scope**:
- `app/`, `src/components/`, `src/navigation/`, `src/ui/` product code — owned by redesign session.
- Android Gradle job tuning; the Java compile fix (already done).
- Converting the ~23 meta/policy specs to behavioral tests — deferred (M-effort judgment call; see Maintenance).

## Git workflow

Work on the current branch. Do NOT commit/push/touch `.git`. Operator commits by path.

## Steps

### Step 1: Make the `test` CI job green (expo-doctor)

Run `bunx expo install --check` to see the drift, then align the 8 packages to
their expected patch versions with `bunx expo install <pkg>@<version> ...` (or
edit `package.json` to the versions expo-doctor requests, then
`bun install --ignore-scripts`). Confirm `head -2 bun.lock` stays
`"lockfileVersion": 1`. If a pod-dependent package changed, run
`cd ios && bundle exec pod install` to re-sync `Podfile.lock` (only if pods
drift — the CI `test` job does not build pods, but the pre-commit
`verify:ios-pods` gate does).

If any pin is intentional for the SDK-57 beta and cannot be moved, add an
`expo.install.exclude` entry in `package.json` and note why (STOP and report if
unsure which packages are intentionally pinned — check
`overrides`/`resolutions` and the release notes in CLAUDE.md first).

**Verify**: `bun run verify:expo-doctor` → exit 0.

### Step 2: Cover the DNS anti-spoofing branches

In `__tests__/dnsWire.spec.ts`, add one `toThrow` case per untested branch of
`validateDecodedDnsResponseForTxt`: ID mismatch, QR flag missing, non-standard
opcode, TC=1 truncation, rcode != NOERROR, QDCOUNT != 1. Clone the existing
base decoded packet and mutate one field per test. Follow the packet-builder
pattern already in that file.

**Verify**: `bun run test -- --testPathPattern='dnsWire'` → pass, 6 new tests.

### Step 3: Boundary tests for the byte encoder

Add parameterized encode→`decodeDnsPacket` round-trip tests for: a 63-char
label (max), a long multi-label name, the 120-char max message, and rejection
or correct handling of a label > 63 chars. Assert the round trip recovers the
input.

**Verify**: `bun run test -- --testPathPattern='dnsWire'` → pass.

### Step 4: Fix the `Platform.OS` leak

In `__tests__/hapticsConfigurator.spec.tsx`, capture `const original =
Platform.OS` and restore it in `afterEach` (mirror
`dnsService.appState.spec.ts:120-121`).

**Verify**: `bun run test -- --testPathPattern='haptics'` → pass; `bun run test` (full, runInBand) → pass.

### Step 5: v4→v5 migration test

In `__tests__/settings.migration.spec.ts`, add a test migrating a v4 payload
(without `themePreference`) and asserting the result has
`themePreference: 'system'` (the safe default) and preserves the other fields.

**Verify**: `bun run test -- --testPathPattern='settings.migration'` → pass.

### Step 6: Speed up ts-jest

Set `isolatedModules: true` in `tsconfig.test.json` (and/or the ts-jest
transform options in `jest.config.js`). This makes ts-jest transpile-only; the
`typecheck` gate (`tsc --noEmit`) remains the single type source of truth. Watch
for `const enum` usages that require full type info — if any test relies on
emit-time type erasure that breaks, report it.

**Verify**: `bun run test -- --testPathPattern='dnsWire'` → pass and visibly faster; `bun run test` → all pass; `bun run typecheck` → still exit 0 (unchanged).

### Step 7: Tighten the reanimated mock

In `__tests__/mocks/react-native-reanimated.js`, remove the `.value`
getter/setter so the mock exposes only `.get()/.set()/.modify()` (matching the
repo's React Compiler rule). If removing `.value` reveals any src still using
`.value`, fix those to `.get()/.set()` — but ONLY in files already in scope for
this plan; if a `.value` use is in a redesign-owned file, report it instead of
editing.

**Verify**: `bun run test` → all pass; `bun run verify:react-compiler` → pass.

### Step 8: Full gates

**Verify**: `bun run verify:expo-doctor` → 0; `bun run typecheck` → 0; `bun run lint` → 0; `bun run test` → all pass.

## Test plan

New tests: 6 anti-spoofing branch tests, ~4 encoder boundary tests, 1 v4→v5
migration test. Restore-leak fix and mock tightening are hardening, not new
behavior. Model all after existing specs in the same files.

## Done criteria

- [ ] `bun run verify:expo-doctor` exits 0
- [ ] `bun run typecheck` exits 0, `bun run lint` exits 0
- [ ] `bun run test` exits 0 with the new tests present
- [ ] `head -2 bun.lock` shows `"lockfileVersion": 1`
- [ ] ts-jest run is transpile-only (`isolatedModules: true` present)
- [ ] reanimated mock exposes no `.value`
- [ ] `git diff --name-only` shows only in-scope files
- [ ] `plans/README.md` updated

## STOP conditions

- expo-doctor drift can't be resolved without a bun.lock v2 rewrite (report).
- A pinned package is intentionally held for the beta and moving it breaks the build.
- `isolatedModules` breaks a test that depends on `const enum` or type-only emit.
- Tightening the reanimated mock reveals `.value` usage in a redesign-owned file.

## Maintenance notes

- Deferred (separate plan, M-effort judgment): ~23 meta/policy specs assert on
  source text (`readFileSync` + `toContain`); keep the security/hygiene ones,
  convert behavior-testing string-greps to render/execute tests. Not in scope —
  it needs case-by-case review.
- Also deferred: root-workspace `test:watch`/`test:coverage` scripts and a
  coverage threshold scoped to `src/services/**` + `src/context/**`; and
  scoping the pre-commit hook to `jest --findRelatedTests <staged>` to cut
  commit time (CI keeps the full run).
- Reviewer should confirm the expo version alignment matches what the SDK-57
  release lane in CLAUDE.md expects and didn't silently bump a major.
