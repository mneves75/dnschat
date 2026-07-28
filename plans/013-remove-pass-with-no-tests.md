# Plan 013: Make a vanished test suite fail CI instead of passing it

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 749334c..HEAD -- .github/workflows/ci.yml scripts/install-git-hooks.js __tests__/repo.gitHooks.spec.ts jest.config.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `749334c`, 2026-07-28

## Why this matters

CI and the generated pre-commit hook both run Jest with `--passWithNoTests`.
That flag turns "I found no tests" into exit code 0. The repo's `testMatch`
globs in `jest.config.js` depend on two directory conventions
(`__tests__/**/*.spec.*` at the root and `modules/**/__tests__/**/*.test.*`);
a directory rename, a move to `src/__tests__`, or an edit to `roots` would
silently reduce the entire 1030-test suite to nothing while CI and the hook
both stay green. Nothing else in the repo enforces a floor: `jest.config.js`
has no `coverageThreshold`, and no spec asserts a minimum suite count.

Nothing in this repo needs the flag — the suite always matches at least 129
suites. After this plan, a globbing regression fails loudly.

## Current state

Files involved:

- `.github/workflows/ci.yml:66` — the CI test step.
- `scripts/install-git-hooks.js:22` — the generated pre-commit hook body.
- `__tests__/repo.gitHooks.spec.ts:23` — pins the hook's exact command string,
  so it **will fail** when you change the hook. This is the trap in this plan.
- `jest.config.js:5-9` — the globs whose breakage this plan is guarding.

CI today (`.github/workflows/ci.yml:66`):

```yaml
      - name: Test
        run: pnpm run test --bail --passWithNoTests
```

The hook template today (`scripts/install-git-hooks.js:16-23`) — note it is a
JavaScript template literal that writes a shell script:

```js
const hookScript = `#!/bin/sh
set -e

echo "pre-commit: verifying iOS pods lockfile"
pnpm run verify:ios-pods

echo "pre-commit: running lint"
pnpm run lint

echo "pre-commit: running unit tests"
pnpm run test --bail --passWithNoTests
`;
```

The spec that pins it (`__tests__/repo.gitHooks.spec.ts:15-23`):

```ts
    expect(script).toContain("pre-commit: running lint");
    expect(script).toContain("pnpm run lint");

    expect(script).toContain("pre-commit: running unit tests");
    expect(script).toContain("pnpm run test --bail --passWithNoTests");
```

The globs being protected (`jest.config.js:5-9`):

```js
  roots: ["<rootDir>"],
  testMatch: [
    "<rootDir>/__tests__/**/*.spec.(ts|tsx|js)",
    "<rootDir>/modules/**/__tests__/**/*.test.(ts|tsx|js)",
  ],
```

Reproduce the failure mode:

```
$ pnpm exec jest --runInBand --passWithNoTests --testPathPattern="zzz-nonexistent"
No tests found, exiting with code 0
$ echo $?
0
```

Repo conventions to match:

- Policy specs live in `__tests__/*.spec.ts`, plain Jest with `node:fs` /
  `node:child_process`, no test framework helpers. See
  `__tests__/repo.ci.spec.ts` for the workflow-assertion style and
  `__tests__/repo.gitHooks.spec.ts` for the hook style.
- The repo bans emoji in every tracked file
  (`__tests__/repo.noEmoji.spec.ts`).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install --frozen-lockfile` | exit 0 |
| Typecheck | `pnpm run typecheck` | exit 0, no output |
| Targeted tests | `pnpm run test --testPathPattern='repo\.(gitHooks\|ci)'` | all pass |
| Full suite | `pnpm run test` | 129 suites passed, 1 skipped |
| Reinstall hook | `node scripts/install-git-hooks.js` | prints the install confirmation |
| List test files | `pnpm exec jest --listTests` | one path per line, 130 lines |

Two environment notes that will otherwise cost you an hour:

- **Never put a `--` separator before a script's flags.** pnpm forwards `--`
  literally, so `pnpm run test -- --bail` makes Jest treat the flags as test
  name patterns, match zero tests, and exit 1. Write `pnpm run test --bail`.
  (This repo hit exactly that bug during its bun-to-pnpm migration.)
- **Use the Node version in `.node-version` (24).** Example:
  `PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH" pnpm run test`.
- If `pnpm run test` fails in `__tests__/repo.noCredentials.spec.ts` with
  "project.pbxproj contains DEVELOPMENT_TEAM entries", the operator's tree has
  a local iOS signing team set. Pre-existing and unrelated. Report it; do not
  edit the pbxproj.

## Scope

**In scope** (the only files you should modify):

- `.github/workflows/ci.yml` — the `Test` step's command only
- `scripts/install-git-hooks.js` — the `hookScript` template only
- `__tests__/repo.gitHooks.spec.ts` — update the pinned command string
- `__tests__/repo.ci.spec.ts` — add the suite-floor assertion if you put it
  there, or create a new spec (your choice; state which in the status row)

**Out of scope** (do NOT touch, even though they look related):

- `jest.config.js` — do not "improve" the globs. This plan guards them; it does
  not change them. Editing both the guard and the thing guarded in one change
  defeats the purpose.
- `package.json`'s `test` script — it is `jest --runInBand` with no flags and
  should stay that way; the flags are supplied per-caller.
- The `--bail` flag. Keep it. It is orthogonal and desirable in CI/hooks.
- The `dns-native` CI job's own `npm test` invocation — it is a separate
  workspace with its own suite and is not affected by these globs.

## Git workflow

- Branch: `advisor/013-remove-pass-with-no-tests`
- Conventional Commits, matching this repo's history. Example from `git log`:
  `chore(scripts): add verify:react-doctor to gate suite`
  For this plan: `ci: drop --passWithNoTests so an empty suite fails`
- Do NOT push and do NOT open a PR.

## Steps

### Step 1: Confirm the failure mode locally

```bash
pnpm exec jest --runInBand --passWithNoTests --testPathPattern="zzz-nonexistent"; echo "exit=$?"
pnpm exec jest --runInBand --testPathPattern="zzz-nonexistent"; echo "exit=$?"
```

**Verify**: the first prints `exit=0`, the second prints `exit=1`. That
difference is the entire justification for this plan.

### Step 2: Remove the flag from CI

Edit `.github/workflows/ci.yml:66` to `pnpm run test --bail`.

**Verify**: `grep -n "passWithNoTests" .github/workflows/ci.yml` returns
nothing.

### Step 3: Remove the flag from the hook template, and update its spec

Edit the `hookScript` template in `scripts/install-git-hooks.js` to
`pnpm run test --bail`. Then update
`__tests__/repo.gitHooks.spec.ts:23` to expect the new string.

Do these in the same commit: the spec asserts the exact command, so changing
one without the other leaves the suite red.

**Verify**:
```bash
node scripts/install-git-hooks.js
grep -n "passWithNoTests" .git/hooks/pre-commit scripts/install-git-hooks.js
pnpm run test --testPathPattern=repo.gitHooks
```
→ the grep returns nothing, the spec passes.

### Step 4: Add a suite-size floor

Add a policy assertion that the test-file discovery still finds a realistic
number of suites, so a globbing regression fails even if some other caller
reintroduces the flag. Run `pnpm exec jest --listTests --json` (or the plain
form and count lines) from the spec via `execFileSync`, and assert the count is
at least 100.

Pick 100 deliberately: the repo has 130 test files today, so the floor leaves
room to delete genuinely obsolete suites without tripping, while catching the
collapse-to-zero case this plan exists for.

**Verify**: the new case passes. Then temporarily edit `jest.config.js`'s
`testMatch` to a glob that matches nothing, re-run the spec, and confirm it
**fails**. Restore `jest.config.js` exactly (`git diff jest.config.js` must be
empty afterwards).

### Step 5: Full gate

**Verify**: `pnpm run typecheck` exits 0; `pnpm run test` reports 129 suites
passed, 1 skipped; `git status` shows only in-scope files modified.

## Test plan

- Update the pinned string in `__tests__/repo.gitHooks.spec.ts` (existing
  case).
- New case: test-file discovery returns at least 100 paths. Model it on
  `__tests__/repo.ci.spec.ts`, which already shells out and asserts on repo
  artifacts.
- The negative control in Step 4 (break `testMatch`, watch the floor assertion
  fail, restore) is the part that proves the guard works. Do not skip it, and
  do not commit the broken `jest.config.js`.

## Done criteria

ALL must hold:

- [ ] `grep -rn "passWithNoTests" .github/ scripts/ __tests__/` returns no matches
- [ ] `node scripts/install-git-hooks.js` regenerates a hook whose test line is `pnpm run test --bail`
- [ ] A spec asserts test-file discovery returns at least 100 paths, and that spec fails when `testMatch` is broken
- [ ] `pnpm run typecheck` exits 0
- [ ] `pnpm run test` passes
- [ ] `git diff jest.config.js` is empty
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1 does not reproduce the exit-0/exit-1 difference.
- Removing the flag makes CI-equivalent local runs fail for a reason other than
  the pre-existing pbxproj signing failure described above.
- The suite-floor assertion turns out to be flaky across environments (for
  example `jest --listTests` behaving differently under a different working
  directory). Report the instability instead of lowering the floor until it
  passes.

## Maintenance notes

- If test files are ever deliberately consolidated below 100 suites, lower the
  floor in the same commit that removes them, with the new count in the commit
  message. Never delete the assertion.
- A reviewer should confirm the negative control was actually run — ask for the
  output showing the floor assertion failing against a broken glob.
- Deliberately deferred: `coverageThreshold` in `jest.config.js`. A coverage
  floor is a bigger conversation (this suite is heavy on file-text policy specs
  that inflate coverage without exercising behavior) and does not belong in a
  change whose point is a single guard.
