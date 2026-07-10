# Plan 010: Fix the release ledger in docs, add CI typecheck, fast verify tier, and remove dead DX artifacts

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. On
> any STOP condition, stop and report. When done, update the status row in
> `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 2739cf2..HEAD -- README.md docs/README.md .github/workflows/ci.yml package.json .env.development.example knip.json src/components/LiquidGlassWrapper.tsx`
> On excerpt mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: S–M (many small independent items)
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx + docs + tech-debt
- **Planned at**: commit `2739cf2`, 2026-07-10

## Why this matters

The two "start here" docs assert a release state two versions behind reality
(stale is worse than missing: agents make release decisions against it). CI
never typechecks, so a type error in any file not imported by a test lands
green on main. The 12-gate serial `verify:all` reports a one-char type error
only after minutes of network-bound gates. Plus four dead artifacts that
mislead: env vars nothing reads, an orphaned `knip.json`, and three exported
glass components with zero consumers.

## Current state

- `docs/README.md:34-41` — says "Current release target: version 4.1.5 build
  72 … latest uploaded TestFlight build before this lane is version 4.1.3
  build 70". REALITY (from root `README.md:236-240` and `CHANGELOG.md`):
  4.2.0 build 73 shipped TestFlight VALID on 2026-07-04; current working
  version is 4.2.1 build 74 (not built). NOTE: by the time you execute this,
  the operator may have bumped to 4.2.2/75 — read `package.json` `version`
  and `CHANGELOG.md` first and state whatever is CURRENT.
- Root `README.md:216-222` — prose still says "The latest VALID TestFlight
  build is version 4.1.3 build 70 … VALID on 2026-06-22", contradicting
  `README.md:236-240` ("4.2.0 build 73 SHIPPED … supersedes 4.1.3 build 70").
  Rewrite the 216-232 region so the CURRENT ledger (4.2.0/73 VALID
  2026-07-04) is stated once and the 4.1.x paragraphs read clearly as
  history. Also reconcile `README.md:209` "Last architecture/dependency
  verification: 2026-06-10" with `docs/README.md:29` (2026-06-30) — use the
  newer date, or today's if you can verify the claim it stamps.
- **Redaction rule (MANDATORY for the doc edits)**: public docs must not name
  tester groups, App Store Connect IDs, device names, profile names, local
  paths. Run `bun run verify:public-redaction` after editing. Follow
  `docs/public-release-redaction.md`.
- `.github/workflows/ci.yml` — the `test` job (steps around lines 17-62) runs
  verify:ios-pods, expo-doctor, sdk-alignment, typed-routes,
  dnsresolver-sync, public-redaction, react-compiler, lint, test — but NOT
  `bun run typecheck` and not `bun audit`. Every `uses:` is SHA-pinned; bun
  is pinned to 1.3.9 — keep both conventions.
- `package.json:49` — `verify:all` chain order runs network-bound gates
  (security, expo-doctor) before typecheck/lint/test. `package.json:34` —
  `"typecheck": "tsc --noEmit -p tsconfig.json"`.
- `.env.development.example` — documents `LIQUID_GLASS_PRE_IOS26`,
  `ENABLE_MOCK_DNS`, `DNS_SERVER`, `GLASS_DEBUG`, `DNS_DEBUG`,
  `ENABLE_EXPERIMENTAL_FEATURES`; repo-wide grep shows ZERO readers of any of
  them (mock DNS and server selection are in-app Settings, in
  `src/context/settingsStorage.ts`).
- `knip.json` — 933-byte config at root; `knip` is not in any
  package.json/bun.lock/script/workflow. Orphaned config.
- `src/components/LiquidGlassWrapper.tsx:265,384,400` — exports
  `shouldUseGlassEffect`, `LiquidGlassCard`, `LiquidGlassNavBar`; zero
  consumers outside the barrel re-export in
  `src/components/glass/index.ts:34-35`. (`LiquidGlassButton` IS used —
  keep it.)

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Redaction gate | `bun run verify:public-redaction` | exit 0 |
| Typecheck | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Tests | `bun run test` | all pass |
| CI lint (syntax) | `node -e "require('js-yaml') && console.log('ok')" 2>/dev/null || npx -y yaml-lint .github/workflows/ci.yml` | valid YAML (or visually verify) |

## Scope

**In scope**:
- `README.md`, `docs/README.md` (release-ledger truth only — no restructuring)
- `.github/workflows/ci.yml` (add typecheck step; optionally `bun audit`)
- `package.json` (add `verify:fast`; reorder `verify:all`)
- `.env.development.example`
- `knip.json` (delete)
- `src/components/LiquidGlassWrapper.tsx`, `src/components/glass/index.ts`
  (remove the 3 dead exports + their barrel lines)
- Tests that assert on the above (update if a policy spec greps for them)

**Out of scope**:
- `CHANGELOG.md` (the operator maintains it in the release commit)
- `CLAUDE.md`/`AGENTS.md` (operator-owned)
- Pre-commit hook narrowing (DX-03 — backlog; MED risk, operator decision)
- Wiring knip as a real tool (recorded as the alternative; removal chosen
  because ast-grep + react-doctor + the policy specs cover the intent today)

## Git workflow

Work in the current tree. Do NOT commit or push.

## Steps

### Step 1: Fix the release ledger

Update `docs/README.md:34-41` and `README.md:216-232` (+ the `:209` date) per
"Current state" above. State the CURRENT release (read `package.json` +
`CHANGELOG.md` first), mark older builds as history.

**Verify**: `bun run verify:public-redaction` → exit 0;
`grep -n "latest .*VALID" README.md` names 4.2.0/73 (or newer), not 4.1.3.

### Step 2: Add typecheck (and audit) to CI

In `.github/workflows/ci.yml`, in the `test` job, add a step
`run: bun run typecheck` immediately after the install step and BEFORE the
slower verify steps. Optionally add `run: bun audit` as a separate
non-blocking step only if a pattern for advisory steps already exists;
otherwise add it as a normal blocking step after typecheck.

**Verify**: YAML parses; step ordering: install → typecheck → (audit) → rest.

### Step 3: verify:fast + fail-fast ordering

In `package.json`:
- Add `"verify:fast": "bun run typecheck && bun run lint && bun run test"`.
- Reorder `verify:all` to: typecheck → lint → verify:typed-routes →
  verify:dnsresolver-sync → verify:ios-pods → verify:react-compiler →
  verify:sdk-alignment → verify:public-redaction → verify:android →
  verify:android-16kb → verify:security → verify:expo-doctor → test.
  (Cheap/local first, network-bound late, full test suite last. Keep ALL 13
  gates — only the order changes.)

**Verify**: `node -e "const s=require('./package.json').scripts; console.log(s['verify:fast'], '\n', s['verify:all'])"` shows both;
run `bun run verify:fast` → exits 0.

### Step 4: Trim the env example

Rewrite `.env.development.example` to keep ONLY vars the code actually reads
(re-grep to confirm; as of planning: none of the six). Replace contents with a
short comment block: mock DNS and DNS-server selection live in in-app
Settings (`src/context/settingsStorage.ts`); add example vars back only when
code reads them. If a repo policy spec asserts this file's contents, update it
coherently.

**Verify**: `grep -rn "LIQUID_GLASS_PRE_IOS26\|ENABLE_MOCK_DNS\|GLASS_DEBUG\|DNS_DEBUG\|ENABLE_EXPERIMENTAL_FEATURES" src app modules scripts` → 0 (unchanged); `bun run test` → pass.

### Step 5: Delete knip.json

`git rm knip.json` (or plain delete; operator commits).

**Verify**: `ls knip.json` → not found.

### Step 6: Remove the 3 dead glass exports

Delete `LiquidGlassCard`, `LiquidGlassNavBar`, and `shouldUseGlassEffect`
definitions/exports from `src/components/LiquidGlassWrapper.tsx` and their
re-export lines in `src/components/glass/index.ts`. First check for
test/type references: `grep -rn "LiquidGlassCard\|LiquidGlassNavBar\|shouldUseGlassEffect" src app __tests__ modules` — the only expected hits are
the definition file and the barrel. If a test references them, update the
test in the same spirit (asserting absence is fine).

**Verify**: `bun run typecheck` → exit 0; `bun run lint` → exit 0 (ast-grep
liquid-glass rules must stay green); `bun run test` → pass.

## Test plan

Existing gates cover everything; step 4/6 may require updating policy specs
that grep these files — keep their intent (asserting the CURRENT truth).

## Done criteria

- [ ] `docs/README.md` + `README.md` agree on the current release ledger; `bun run verify:public-redaction` exits 0
- [ ] CI `test` job contains a typecheck step before the verify gates
- [ ] `verify:fast` exists; `verify:all` reordered with all 13 gates intact
- [ ] `.env.development.example` documents no unread vars
- [ ] `knip.json` deleted
- [ ] `grep -rn "LiquidGlassCard\|LiquidGlassNavBar\|shouldUseGlassEffect" src app` → 0 matches
- [ ] `bun run verify:fast` exits 0; `bun run test` exits 0
- [ ] `plans/README.md` status row updated

## STOP conditions

- `verify:public-redaction` fails after the doc edits and the fix isn't
  obvious from `docs/public-release-redaction.md` → report the exact failing
  pattern.
- Removing a glass export cascades into >2 non-test files → it wasn't dead;
  revert that item and report.
- A policy spec's intent is unclear when updating it → report rather than
  weakening the assertion.

## Maintenance notes

- Backlog recorded in plans/README.md: DX-03 (pre-commit `--findRelatedTests`
  narrowing — operator decision), wiring knip as an alternative to deletion.
- Reviewer: check CI YAML indentation and that no gate was silently dropped
  from `verify:all`.
