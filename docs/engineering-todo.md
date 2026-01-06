# Engineering TODO (Guidelines Compliance) — 2026-01-06

This TODO is organized into phases. Each task must be delivered as a small, focused diff with its own verification and commit.

## Phase 1 — Documentation Compliance

Task 1.1: Add data inventory
- Acceptance criteria: `docs/data-inventory.md` exists and documents what data is stored locally, retention windows, and encryption at rest.
- Verification commands: `rg -n "data inventory" docs/data-inventory.md` and `bun run test`.

Task 1.2: Add model registry (explicitly state “no models” if none)
- Acceptance criteria: `docs/model-registry.md` exists and explicitly lists model usage status (none) and review policy.
- Verification commands: `rg -n "model" docs/model-registry.md` and `bun run test`.

Task 1.3: Update docs index references (if needed)
- Acceptance criteria: `docs/README.md` or relevant docs mention the new inventory/registry (only if required by existing doc structure).
- Verification commands: `rg -n "data-inventory|model-registry" docs/README.md`.

## Phase 2 — Type Safety Compliance

Task 2.1: Remove `@ts-ignore` in tests
- Acceptance criteria: No `@ts-ignore` remains in repo; replaced with `@ts-expect-error` and clear justification or typed accessors.
- Verification commands: `rg -n "@ts-ignore" -S .` and `bun run test`.

Task 2.2: Replace `any` in production code paths
- Acceptance criteria: No `: any` or `as any` remains in `src/`, `app/`, `modules/`, or `scripts/` (excluding Jest’s `expect.any`).
- Verification commands: `rg -n "(:\\s*any\\b|as any\\b)" src app modules scripts` and `bun run test`.

Task 2.3: Reduce `any` usage in tests and mocks
- Acceptance criteria: Test files avoid `any` casts except where Jest APIs require it; new helper types used where possible.
- Verification commands: `rg -n "(:\\s*any\\b|as any\\b)" __tests__ modules/dns-native/__tests__` and `bun run test`.

## Phase 3 — React Compiler Compliance

Task 3.1: Remove manual memoization where React Compiler is enabled
- Acceptance criteria: `useMemo`/`useCallback` removed from `src/components/ChatInput.tsx` unless a documented exception is required for correctness.
- Verification commands: `rg -n "useMemo|useCallback" src/components/ChatInput.tsx` and `bun run test`.

Task 3.2: Audit remaining `useEffect` usage for necessity
- Acceptance criteria: `useEffect` remains only where effects are required (subscriptions, timers, imperative APIs) and is documented when non-obvious.
- Verification commands: `rg -n "useEffect" src app` and targeted unit tests relevant to modified components.

## Phase 4 — Android SDK Alignment

Task 4.1: Align Expo build properties with Android 16 (API 36)
- Acceptance criteria: `app.json` sets `compileSdkVersion` and `targetSdkVersion` to 36; related docs/tests updated if they assert earlier values.
- Verification commands: `rg -n "compileSdkVersion|targetSdkVersion" app.json` and `bun run test`.

Task 4.2: Align native module defaults to SDK 36
- Acceptance criteria: `modules/dns-native/android/build.gradle` and `android/app/src/main/java/com/dnsnative/build.gradle` default to 36 where they use `safeExtGet`.
- Verification commands: `rg -n "compileSdkVersion|targetSdkVersion" modules/dns-native/android/build.gradle android/app/src/main/java/com/dnsnative/build.gradle` and `bun run test`.

## Phase 5 — Final Verification + Review Packet

Task 5.1: Full suite verification
- Acceptance criteria: `bun run lint`, `bun run test`, `bun run dns:harness:build` all pass after changes.
- Verification commands: run each command and capture output summary.

Task 5.2: Review packet and guideline-to-evidence mapping
- Acceptance criteria: Final response includes a checklist mapping each guideline to evidence (tests, scans, docs).
- Verification commands: manual review of `docs/engineering-exec-spec.md` updates and final response checklist.
