# Plan 003: Low-risk architecture cleanup (dead code, redundant deps, context slicing)

> **Executor instructions**: Follow step by step; run each verification and
> confirm the expected result before the next step. On a STOP condition, stop
> and report. Update this plan's row in `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat b69b6ab..HEAD -- knip.json package.json src/context/ChatContext.tsx src/context/SettingsContext.tsx src/components/MessageBubble.tsx`
> Mismatch with "Current state" = STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW–MED
- **Depends on**: none (but coordinate: MessageBubble.tsx is read-heavy in the
  redesign; do Step 4 last and keep the diff minimal)
- **Category**: tech-debt
- **Planned at**: commit `b69b6ab`, 2026-07-04

## Why this matters

Four independent, mostly-mechanical cleanups: (1) genuinely dead modules kept
alive only by knip's allowlist; (2) a redundant UUID dependency the stack
already provides; (3) a duplicated `dns-packet` dep across workspaces; (4)
monolithic context values that re-render unrelated consumers (e.g. every
mounted message bubble on any settings toggle). Each lowers maintenance cost or
runtime re-render pressure without changing product behavior.

## Current state

- `knip.json` `ignoreExports` lists modules with ZERO real import sites (only
  self-reference), including `src/components/ui/LiquidGlassTextInput.tsx`,
  `src/components/ui/Toast.tsx`, `src/components/layout/Screen.tsx`,
  `src/ui/hooks/useStaggeredList.tsx`. VERIFY each has no importer before
  deleting (see Step 1) — some entries in that list ARE used elsewhere (e.g.
  `EmptyState.tsx`, skeletons) and must NOT be deleted.
- `src/context/ChatContext.tsx:9` and `src/services/storageService.ts:3`
  `import uuid from "react-native-uuid"`; `expo-crypto` (`package.json:72`) is
  already a dependency and exposes `randomUUID()`. `entry.tsx` bootstraps global
  crypto.
- `package.json` (root) and `modules/dns-native/package.json` both declare
  `dns-packet ^5.6.1`.
- `src/context/ChatContext.tsx` (~lines 453–469): single `contextValue` bundles
  `chats`, `currentChat`, `isLoading`, `error`, and all actions — any tick
  re-renders every `useChat()` consumer.
- `src/context/SettingsContext.tsx` (~lines 363–385): single value with state +
  actions; `MessageBubble.tsx:47` reads only `locale` from it, so any settings
  change re-renders all bubbles.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Typecheck | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Tests | `bun run test` | all pass |
| Dead-code check | `bunx knip` (read-only) | fewer/again-clean reports |
| Find importers | `bunx ast-grep --lang tsx -p 'import $$$ from "$PATH"'` or `grep -rn "LiquidGlassTextInput" src/` | as expected |

## Scope

**In scope**:
- `knip.json`
- deletion of confirmed-dead modules under `src/components/ui/`, `src/components/layout/`, `src/ui/hooks/` (ONLY those with zero importers)
- `package.json`, `modules/dns-native/package.json`, `bun.lock` (dep changes)
- `src/context/ChatContext.tsx`, `src/context/SettingsContext.tsx`
- `src/services/storageService.ts` (uuid swap)
- `src/components/MessageBubble.tsx` (context read only)

**Out of scope**:
- `app/`, `src/navigation/`, `src/ui/theme/`, other `src/components/*` screens — owned by the redesign session. Coordinate on MessageBubble.tsx: touch ONLY the `useSettings()` read line, nothing visual.
- Splitting god modules `dnsService.ts` / `dnsLogService.ts` / `GlassSettings.tsx` — deferred (see Maintenance; those are L-effort and need characterization tests first).

## Git workflow

Work on the current branch. Do NOT commit/push/touch `.git`. Operator commits by path.

## Steps

### Step 1: Delete confirmed-dead modules

For EACH candidate (`LiquidGlassTextInput.tsx`, `Toast.tsx`,
`layout/Screen.tsx`, `useStaggeredList.tsx`), run
`grep -rn "<basename>" src/ app/ --include='*.ts*'` excluding the file itself.
Delete ONLY files with zero external references. IMPORTANT: `Toast.tsx` may be
used by the redesign session — check `git grep` AND ask (report) if any active
import exists; if `Toast` is imported anywhere, KEEP it and remove it from this
step. Remove the corresponding `knip.json` `ignoreExports` entries only for
files actually deleted.

**Verify**: `bunx knip` → the deleted entries no longer needed; `bun run typecheck` → 0.

### Step 2: Replace `react-native-uuid` with `expo-crypto`

Swap `uuid.v4()` calls in `ChatContext.tsx` and `storageService.ts` for
`Crypto.randomUUID()` (`import * as Crypto from "expo-crypto"`). Confirm
`Crypto.randomUUID` exists in the installed `expo-crypto` version (Expo SDK 57).
Remove `react-native-uuid` from `package.json` dependencies. Run
`bun install --frozen-lockfile --ignore-scripts` — if it reports the lockfile
would change, run `bun install --ignore-scripts` (lockfile update is expected
for a dep removal) and confirm `head -2 bun.lock` still shows
`"lockfileVersion": 1` (CI pins bun 1.3.9 which only reads v1).

**Verify**: `bun run typecheck` → 0; `grep -rn "react-native-uuid" src/` → no matches; `bun run test -- --testPathPattern='storage|ChatContext'` → pass.

### Step 3: De-duplicate `dns-packet`

Confirm both manifests pin the same version. If the workspaces share a hoisted
`node_modules`, leave both declarations (workspace convention) but ensure the
versions are identical; if they diverge, align them. Do NOT remove the polyfill
in `dnsService.ts` (out of scope). This step is a version-alignment check, not a
refactor — if already aligned, record "no change needed" and skip.

**Verify**: `bun run typecheck` → 0; `cd modules/dns-native && bun run test` → pass.

### Step 4: Slice the contexts (state vs. actions)

For BOTH `ChatContext.tsx` and `SettingsContext.tsx`: split the single provider
value into two stable memoized objects — one for volatile state, one for actions
— OR expose a dedicated selector for the hot read. Concretely:
- `SettingsContext`: expose `locale` such that `MessageBubble` re-renders only
  when `locale` changes, not on every settings toggle (e.g. a separate
  `LocaleContext` or a `useLocale()` selector). Update `MessageBubble.tsx:47`
  to consume the narrow read.
- `ChatContext`: separate actions (stable identity) from state so
  action-only consumers (`createChat`, `deleteChat` callers) don't re-render on
  `isLoading`/`error` ticks.

Keep the public hook names (`useChat`, `useSettings`) working — internally
compose from the sliced contexts to avoid touching every call site.

**Verify**: `bun run typecheck` → 0; `bun run test` → all pass; `bun run verify:react-compiler` → pass (context value objects must stay compiler-friendly).

### Step 5: Full gates

**Verify**: `bun run typecheck` → 0; `bun run lint` → 0; `bun run test` → all pass; `cd modules/dns-native && bun run test` → pass.

## Test plan

- Step 4: add a render-count test if the existing test setup supports it
  (render a bubble, toggle an unrelated setting, assert the bubble did not
  re-render) — model after any existing React Testing Library spec; if the
  harness can't observe render counts cleanly, assert via a memoized child spy
  instead. If neither is feasible, note it and rely on `verify:react-compiler`.
- Steps 1–3: existing suites must stay green (no new behavior).

## Done criteria

- [ ] `bun run typecheck` exits 0
- [ ] `bun run lint` exits 0
- [ ] `bun run test` and `modules/dns-native` tests pass
- [ ] `grep -rn "react-native-uuid" src/` returns nothing; dep removed from `package.json`
- [ ] `head -2 bun.lock` still shows `"lockfileVersion": 1`
- [ ] Deleted modules have zero remaining importers
- [ ] `git diff --name-only` shows only in-scope files
- [ ] `plans/README.md` updated

## STOP conditions

- Any "dead" candidate turns out to have a real importer (keep it, report).
- `Crypto.randomUUID` is not available in the installed expo-crypto version.
- Context slicing would require editing screen files owned by the redesign
  session (coordinate/report instead of touching them).
- Removing `react-native-uuid` forces a bun.lock v2 rewrite that can't be
  avoided (report — CI would break).

## Maintenance notes

- Deferred (separate future plans, L-effort, need characterization tests first):
  break up `dnsService.ts` (~1744 lines) into a `Transport` interface +
  per-transport modules with a thin orchestrator; split `dnsLogService.ts`
  (redaction / persistence / UI-formatting); decompose `GlassSettings.tsx`
  (~1031 lines, imports 3 service singletons) into section subcomponents + hooks;
  extract a shared `OnboardingScreenLayout`. These are intentionally NOT in this
  plan because they are high-blast-radius and the redesign session is actively
  editing several of those files.
- Reviewer should verify the context slice keeps `useChat`/`useSettings`
  behavior identical and doesn't regress the existing `settingsRef` mitigation
  documented in `ChatContext.tsx`.
