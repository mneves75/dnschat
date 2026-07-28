# Plan 012: Make `pnpm run lint` actually load and enforce the ast-grep rules

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 749334c..HEAD -- package.json scripts/run-ast-grep.js project-rules/ __tests__/repo.lint.spec.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `749334c`, 2026-07-28

## Why this matters

`pnpm run lint` is the repo's only static-analysis gate. It runs in CI
(`.github/workflows/ci.yml:63`), in the generated pre-commit hook
(`scripts/install-git-hooks.js:19-20`), and in `verify:all`
(`package.json:51`). It currently loads **zero rules** and always exits 0, so
all three places produce a green signal that carries no information. The two
rules it is supposed to enforce — no imports from the deleted
`../components/liquidGlass/` path, no references to the deleted
`LiquidGlassNative` native module — are unenforced today. There is no ESLint
or Prettier config anywhere in the repo, so when this gate is inert the repo
has no working linter at all.

After this plan, a file containing either banned pattern makes `pnpm run lint`
exit non-zero, and a test proves it.

## Current state

Files involved:

- `package.json:54-55` — the `lint` and `lint:ast-grep` scripts.
- `scripts/run-ast-grep.js` — a wrapper that ensures the `@ast-grep/cli`
  binary exists, then runs `ast-grep scan <args passed through>`.
- `project-rules/astgrep-liquid-glass.yml` — the rule definitions.
- `__tests__/repo.lint.spec.ts` — a policy spec that currently certifies the
  broken wiring.

The scripts today (`package.json:54-55`):

```json
"lint:ast-grep": "node scripts/run-ast-grep.js --config project-rules/astgrep-liquid-glass.yml",
"lint": "node scripts/run-ast-grep.js --config project-rules/astgrep-liquid-glass.yml",
```

The wrapper forwards its argv straight into `scan`
(`scripts/run-ast-grep.js:44-47`):

```js
const args = process.argv.slice(2);
const result = spawnSync(binaryPath, ["scan", ...args], {
  cwd: projectRoot,
  stdio: "inherit",
});
```

The rule file today (`project-rules/astgrep-liquid-glass.yml`, complete):

```yaml
id: liquid-glass
rules:
  - id: no-legacy-liquid-glass-imports
    severity: error
    message: "Legacy liquidGlass module was removed. Import from 'components/LiquidGlassWrapper' instead."
    language: tsx
    pattern: "import $IDENT from '../components/liquidGlass/$REST'"
  - id: no-native-liquid-glass-module
    severity: error
    message: "Do not reference deleted ios/LiquidGlassNative modules."
    language: ts
    pattern: "'LiquidGlassNative'"
```

**Why this loads nothing.** `ast-grep scan --config` expects a *project*
config file — the `sgconfig.yml` shape, whose key field is `ruleDirs:`. It does
not accept a rule file. ast-grep's single-rule file format is different again:
top-level `id` / `language` / `severity` / `message` plus a **singular** `rule:`
block containing the matcher. The file above is neither shape: it has a
top-level `id` plus a plural `rules:` array whose entries put `pattern:`
directly on the rule instead of nested under `rule:`.

Reproduce the failure before changing anything:

```
$ pnpm exec ast-grep scan --config project-rules/astgrep-liquid-glass.yml --inspect summary
sg: summary|project: isProject=true,projectDir=project-rules
sg: summary|file: scannedFileCount=506,skippedFileCount=0
sg: summary|rule: effectiveRuleCount=0,skippedRuleCount=0
```

`effectiveRuleCount=0` is the whole finding.

The policy spec that must be updated (`__tests__/repo.lint.spec.ts:16-27`)
asserts on script *text* only — it never runs the linter, which is why the
broken wiring passed review:

```ts
expect(lintScripts).toContain("project-rules/astgrep-liquid-glass.yml");
if (usesDeterministicRunner) {
  expect(fs.existsSync("scripts/run-ast-grep.js")).toBe(true);
}
expect(fs.existsSync("project-rules/astgrep-liquid-glass.yml")).toBe(true);
```

Repo conventions to match:

- Policy specs live in `__tests__/` as `*.spec.ts`, use `node:fs` /
  `node:child_process` directly, and read tracked files. Model the new
  enforcement test on `__tests__/repo.gitHooks.spec.ts`, which shells out and
  asserts on real output rather than on source text.
- Scripts under `scripts/` are dependency-free CommonJS Node
  (`scripts/run-ast-grep.js` is the exemplar). Keep it that way.
- The repo bans emoji in every tracked file
  (`__tests__/repo.noEmoji.spec.ts`). Do not add any, including in YAML
  comments or fixture files.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install --frozen-lockfile` | exit 0 |
| Typecheck | `pnpm run typecheck` | exit 0, no output |
| Lint | `pnpm run lint` | exit 0 on a clean tree |
| Rule-count probe | `pnpm exec ast-grep scan --config sgconfig.yml --inspect summary` | `effectiveRuleCount` is 2 or more |
| Targeted tests | `pnpm run test --testPathPattern=repo.lint` | all pass |
| Full suite | `pnpm run test` | 129 suites passed, 1 skipped |

Two environment notes that will otherwise cost you an hour:

- **Never put a `--` separator before a script's flags.** pnpm forwards `--`
  literally, so `pnpm run test -- --bail` makes Jest treat the flags as test
  name patterns, match zero tests, and exit 1. Write
  `pnpm run test --bail`.
- **Use the Node version in `.node-version` (24).** On Node 26,
  `react-compiler-healthcheck` (part of `verify:all`) crashes in yargs with
  `require is not defined in ES module scope`. Example:
  `PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH" pnpm run test`.
- If `pnpm run test` fails in `__tests__/repo.noCredentials.spec.ts` with
  "project.pbxproj contains DEVELOPMENT_TEAM entries", the operator's working
  tree has a local iOS signing team set. That is pre-existing and unrelated to
  this plan. Report it; do not "fix" it by editing the pbxproj.

## Scope

**In scope** (the only files you should modify or create):

- `sgconfig.yml` (create, repo root)
- `project-rules/astgrep-liquid-glass.yml` (rewrite)
- `project-rules/` — additional rule files if you split the two rules
- `package.json` — the `lint` and `lint:ast-grep` script values only
- `__tests__/repo.lint.spec.ts` (extend)
- `__tests__/fixtures/astgrep/` (create, for the violation fixtures)

**Out of scope** (do NOT touch, even though they look related):

- `scripts/run-ast-grep.js` — its binary-bootstrap logic is correct and was
  fixed recently to avoid re-running the postinstall on every invocation.
  Changing only the arguments passed to it is enough.
- `.github/workflows/ci.yml` and `scripts/install-git-hooks.js` — they invoke
  `pnpm run lint`, which is the right entry point. Keep the entry point stable
  so the hook and CI need no change.
- Any source file under `src/`, `app/`, or `modules/` that the newly-live rules
  flag. If real violations exist, that is a STOP condition (see below), not
  something to fix inside this plan.
- Adding ESLint. That is a separate decision, tracked as its own finding.

## Git workflow

- Branch: `advisor/012-lint-gate-loads-rules`
- Conventional Commits, matching this repo's history. Example from `git log`:
  `fix: apply remaining improve-deep audit fixes and pnpm supply-chain hardening`
  For this plan: `fix(lint): load ast-grep rules so the lint gate enforces something`
- Commit per logical unit. Do NOT push and do NOT open a PR.

## Steps

### Step 1: Capture the current (broken) baseline

Record the probe output so the diff is provable:

```bash
pnpm exec ast-grep scan --config project-rules/astgrep-liquid-glass.yml --inspect summary 2>&1 | grep effectiveRuleCount
```

**Verify**: output contains `effectiveRuleCount=0`. If it already reports 2 or
more, the repo has drifted — STOP.

### Step 2: Create the violation fixtures

Create `__tests__/fixtures/astgrep/legacy-import.tsx.txt` containing an import
from `../components/liquidGlass/Something`, and
`__tests__/fixtures/astgrep/native-module.ts.txt` referencing
`LiquidGlassNative` both as a bare identifier and inside a string literal.

Use a `.txt` suffix so Jest's `testMatch` and the TypeScript project do not
pick them up; the enforcement test will copy them to real `.tsx`/`.ts` paths in
a temporary directory at run time.

**Verify**: `pnpm run typecheck` exits 0 (the fixtures must not enter the TS
program).

### Step 3: Convert the rules to ast-grep's real formats

Create `sgconfig.yml` at the repo root:

```yaml
ruleDirs:
  - project-rules
```

Rewrite `project-rules/astgrep-liquid-glass.yml` into ast-grep's single-rule
file shape (top-level `id`, `language`, `severity`, `message`, and a singular
`rule:` block). Because a rule file holds exactly one rule, put the second rule
in its own file, e.g. `project-rules/astgrep-native-liquid-glass.yml`. Keep the
existing `id` values (`no-legacy-liquid-glass-imports`,
`no-native-liquid-glass-module`) and the existing `message` strings so any
downstream tooling and docs stay accurate.

Do not copy the old `pattern` strings verbatim. `"import $IDENT from
'../components/liquidGlass/$REST'"` does not work: a metavariable inside a
string literal is not expanded, and the pattern only matches a default import
with that exact relative prefix. Write matchers that catch the real cases —
default, named and namespace imports, and any relative depth — and prove them
against the fixtures in Step 4 rather than reasoning about tree-sitter node
names. A `kind` + `regex` matcher on the import source string is usually the
robust shape; `pattern` alone usually is not.

**Verify**:
```bash
pnpm exec ast-grep scan --config sgconfig.yml --inspect summary 2>&1 | grep effectiveRuleCount
```
→ `effectiveRuleCount=2` (or more, if you split further).

### Step 4: Prove the rules fire, then prove the tree is clean

In a scratch directory outside the repo, copy each fixture to a real source
path and scan it with the repo's config. Both must report an error and exit
non-zero. Then scan the repo itself.

**Verify**:
- each fixture scan exits non-zero and names the corresponding rule id;
- `pnpm run lint` on the unmodified repo exits 0.

If `pnpm run lint` now reports violations in real source files, STOP (see STOP
conditions).

### Step 5: Point the scripts at the project config

Update `package.json` so both `lint` and `lint:ast-grep` invoke the wrapper
against the project config rather than the rule file — for example
`node scripts/run-ast-grep.js --config sgconfig.yml`. Keep both script names;
CI, the pre-commit hook, and `verify:all` all call `lint`.

**Verify**: `pnpm run lint` exits 0, and
`pnpm exec ast-grep scan --config sgconfig.yml --inspect summary` still reports
`effectiveRuleCount` of 2 or more.

### Step 6: Make the policy spec test enforcement, not text

Extend `__tests__/repo.lint.spec.ts` so it can no longer pass against an inert
gate. It must:

1. keep asserting `@ast-grep/cli` is a devDependency and that the lint script
   uses the checked-in runner (no global installs);
2. update the stale string assertions to the new config path — the current
   `expect(lintScripts).toContain("project-rules/astgrep-liquid-glass.yml")`
   will fail once the script points at `sgconfig.yml`;
3. add a case that copies a fixture into a temp dir, runs the linter against
   it via `execFileSync`/`spawnSync`, and asserts a non-zero exit plus the rule
   id in the output;
4. add a case asserting `effectiveRuleCount` is at least 2 from the
   `--inspect summary` probe.

**Verify**: `pnpm run test --testPathPattern=repo.lint` → all pass. Then
temporarily break the config (rename `sgconfig.yml`), re-run, and confirm the
spec **fails**. Restore it.

### Step 7: Full gate

**Verify**: `pnpm run typecheck` exits 0 and `pnpm run test` reports 129 suites
passed, 1 skipped (or the pre-existing pbxproj failure described above, and
nothing else).

## Test plan

- Extend `__tests__/repo.lint.spec.ts` with: (a) linter rejects the legacy
  import fixture, (b) linter rejects the `LiquidGlassNative` fixture, (c)
  `effectiveRuleCount` is at least 2, (d) the existing portability assertions,
  updated to the new config path.
- Structural pattern to follow: `__tests__/repo.gitHooks.spec.ts` — it reads a
  generated artifact and asserts on real content, and it is the closest thing
  in the repo to an execution-based policy spec.
- The negative control in Step 6 (break the config, watch the spec fail) is the
  part that matters. A spec that cannot fail is what produced this finding.

## Done criteria

ALL must hold:

- [ ] `pnpm exec ast-grep scan --config sgconfig.yml --inspect summary` reports `effectiveRuleCount` of 2 or more
- [ ] A file importing from `../components/liquidGlass/` makes `pnpm run lint` exit non-zero
- [ ] A file referencing `LiquidGlassNative` makes `pnpm run lint` exit non-zero
- [ ] `pnpm run lint` exits 0 on the unmodified repo
- [ ] `pnpm run typecheck` exits 0
- [ ] `pnpm run test` passes, with the new `repo.lint` cases included
- [ ] `.github/workflows/ci.yml` and `scripts/install-git-hooks.js` are unchanged
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The baseline probe in Step 1 does not report `effectiveRuleCount=0`.
- Once the rules load, `pnpm run lint` flags real violations in `src/`, `app/`
  or `modules/`. Report the exact `file:line` list. Fixing them is a separate,
  deliberate change — the point of this plan is the gate, and silently editing
  application code to make a newly-live linter pass is exactly the kind of
  unreviewed change that hides a regression.
- You cannot write a matcher that fires on the fixtures without also matching
  legitimate code. Report the false-positive case rather than loosening the
  rule until it stops firing.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- The invariant worth protecting is "the lint gate can fail". Any future change
  to the linter wiring must keep the fixture-based cases in
  `__tests__/repo.lint.spec.ts`; a text-only assertion is what allowed a dead
  gate to survive review here.
- A reviewer should check the negative control specifically: confirm the new
  spec fails when the config is removed.
- Deliberately deferred: adding ESLint/Prettier, and the dead `lint` script in
  `modules/dns-native/package.json` (it invokes `eslint` with no config file
  anywhere in the repo). Both are separate findings; keep them out of this
  change.
