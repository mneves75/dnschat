# Plan 009: Dependency hygiene — remove dead native dep, stale type stubs, and the residual expo-constants override

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. On
> any STOP condition, stop and report. When done, update the status row in
> `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 2739cf2..HEAD -- package.json modules/dns-native/package.json`
> The working tree ALREADY carries uncommitted SDK-57 patch-alignment changes
> to `package.json`, `bun.lock`, `ios/Podfile.lock` (expo/@expo/ui/expo-router
> → 57.0.4, expo-linking → 57.0.2). That is expected — preserve those changes.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW–MED (lockfile + pods mechanics; the landmines are documented
  below — follow them exactly)
- **Depends on**: none
- **Category**: migration/deps
- **Planned at**: commit `2739cf2`, 2026-07-10

## Why this matters

Three hygiene items: (1) `react-native-device-info` is declared and autolinked
into every native build (`RNDeviceInfo` pod) but has ZERO import sites — dead
native weight in the binary and the SBOM. (2) `modules/dns-native` typechecks
against the deprecated RN-0.72-era `@types/react-native` stubs while the app
runs RN 0.86 — false type assurance. (3) `package.json` `overrides` still pins
`expo-constants` to exact `57.0.3`; today it is harmless (equals the direct
dep) but it will SILENTLY cap any future expo-constants bump tree-wide — this
exact override pattern already cost hours once (documented landmine).

## Current state

- `package.json:85` — `"react-native-device-info": "^14.0.4"`; zero
  references: `grep -rn "device-info\|DeviceInfo" src app modules --include="*.ts" --include="*.tsx"` → 0.
  `ios/Podfile.lock` contains `RNDeviceInfo (14.1.1)` via autolinking.
- `package.json:71` — direct dep `"expo-constants": "57.0.3"`;
  `package.json:116` — `overrides` block ALSO has `"expo-constants": "57.0.3"`.
  Remove ONLY the overrides entry; keep the direct dep pin.
- `modules/dns-native/package.json:30` — `"@types/react-native": "^0.72.0"`
  in devDependencies. RN ≥0.71 ships its own types via the `react-native`
  package. The module's CI job runs `npm ci` + tests against its OWN
  committed `package-lock.json` (must be regenerated and stay committed).

**LOCKFILE LANDMINES (follow exactly)**:
1. Local bun is 1.4.0 but CI pins bun 1.3.9, which only reads
   `"lockfileVersion": 1`. NEVER run plain `bun install`/`bun remove` — it
   rewrites the lockfile to v2 and breaks CI. Use the pinned binary via npm:
   `npx -y bun@1.3.9 <command>`.
2. Global `~/.bunfig.toml` has `minimumReleaseAge = 604800`; irrelevant for
   removals, but if any resolution is needed add `--minimum-release-age=0`.
3. After removing a JS package whose pod is autolinked, re-run pod install
   with Homebrew ruby: from `ios/`,
   `PATH="/opt/homebrew/opt/ruby/bin:$PATH" bundle exec pod install`.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Remove dep | `npx -y bun@1.3.9 remove react-native-device-info` | lockfile stays v1 |
| Lockfile check | `grep -m1 '"lockfileVersion"' bun.lock` | `"lockfileVersion": 1,` |
| Pods | `cd ios && PATH="/opt/homebrew/opt/ruby/bin:$PATH" bundle exec pod install` | exit 0 |
| Pods gate | `bun run verify:ios-pods` | exit 0 |
| Module lockfile | `cd modules/dns-native && npm install` (regenerates package-lock.json) then `npm ci` | exit 0 |
| Module tests | `cd modules/dns-native && bun run test` | all pass |
| Module typecheck | `cd modules/dns-native && npx tsc --noEmit` (check its package.json scripts for the exact name first) | exit 0 |
| SDK alignment | `bun run verify:sdk-alignment && npx expo install --check` | "Dependencies are up to date" |
| Full gates | `bun run verify:all` | exit 0 (test is the last chained gate) |

## Scope

**In scope**:
- `package.json` (remove device-info dep line + expo-constants OVERRIDES
  entry only), `bun.lock` (via pinned bun)
- `ios/Podfile.lock` (via pod install only — never hand-edit)
- `modules/dns-native/package.json`, `modules/dns-native/package-lock.json`
- dns-native TS files ONLY if removing the stubs surfaces type errors that
  have an obvious, local fix (missing import of a type from `react-native`)

**Out of scope**:
- Any other dependency bump/removal (eslint 9 migration = backlog DEPS-03;
  markdown-display = watch item DEPS-04)
- `android/` files (autolinking handles removal at build time)
- The direct `expo-constants` dependency pin

## Git workflow

Work in the current tree; PRESERVE the uncommitted SDK-alignment changes. Do
NOT commit or push.

## Steps

### Step 1: Remove react-native-device-info

`npx -y bun@1.3.9 remove react-native-device-info` from the repo root.

**Verify**: `grep -m1 '"lockfileVersion"' bun.lock` → `1`; `grep -c "device-info" package.json` → 0.

### Step 2: Re-sync pods

From `ios/`: `PATH="/opt/homebrew/opt/ruby/bin:$PATH" bundle exec pod install`.

**Verify**: `grep -c "RNDeviceInfo" ios/Podfile.lock` → 0; `bun run verify:ios-pods` → exit 0.

### Step 3: Drop the expo-constants override

Edit `package.json`: delete the `"expo-constants": "57.0.3"` line from the
`overrides` object ONLY (line ~116; the dependencies entry at line ~71 stays).
Then re-resolve with the pinned bun: `npx -y bun@1.3.9 install --ignore-scripts`.

**Verify**: `grep -m1 '"lockfileVersion"' bun.lock` → `1`;
`node -e "const p=require('./package.json'); if (p.overrides['expo-constants']) throw 1; console.log('override gone')"`;
`npx expo install --check` → "Dependencies are up to date".

### Step 4: Remove @types/react-native from dns-native

In `modules/dns-native/package.json` delete the `"@types/react-native"`
devDependency. Regenerate the committed lockfile: from `modules/dns-native/`,
`npm install` then confirm `npm ci` works clean. Fix any surfaced type errors
by importing types from `react-native` itself (its bundled types). If the
fallout is more than trivial import fixes, STOP and report.

**Verify**: `cd modules/dns-native && npm ci && bun run test` → all pass;
module typecheck (its tsconfig forces `ignoreDeprecations "6.0"` — do not
change tsconfig) → exit 0.

### Step 5: Full gates

**Verify**: `bun run verify:all` → completes with the final `bun run test`
passing (the chain is `&&`-linked; test output at the end proves the rest).

## Test plan

No new tests — this is manifest/lockfile hygiene gated by the existing
verify chain and both test suites.

## Done criteria

- [ ] `grep -rn "device-info" package.json ios/Podfile.lock` → no matches
- [ ] `package.json` overrides has NO expo-constants entry; direct dep intact
- [ ] `grep -m1 '"lockfileVersion"' bun.lock` → 1
- [ ] `modules/dns-native/package-lock.json` regenerated and consistent (`npm ci` exits 0)
- [ ] `bun run verify:all` exits 0; `cd modules/dns-native && bun run test` passes
- [ ] `plans/README.md` status row updated

## STOP conditions

- `bun.lock` flips to `"lockfileVersion": 2` and re-running via
  `npx -y bun@1.3.9` does not restore v1 → STOP (do not commit a v2 lockfile).
- Pod install fails or `verify:ios-pods` disagrees after step 2.
- Removing the type stubs surfaces >5 type errors in dns-native → report the
  list instead of refactoring.
- Dropping the override changes ANY resolved version other than nothing
  (check `git diff bun.lock` — expo-constants should stay 57.0.3 today).

## Maintenance notes

- Backlog: DEPS-03 (dns-native ESLint 9 flat-config migration or lint
  removal), DEPS-04 (watch `react-native-markdown-display` abandonment on the
  render path).
- Reviewer: confirm the SDK-alignment diff (expo 57.0.4 bumps) is still
  intact and was not reverted by the installs.
