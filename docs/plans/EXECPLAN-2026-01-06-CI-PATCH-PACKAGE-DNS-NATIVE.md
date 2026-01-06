# Engineering Exec Spec: CI Patch-Package + dns-native Jest Fixes (DNSChat)

Status: Implemented
Owner: Mobile
Last updated: 2026-01-06

## Goal

Restore CI reliability by fixing patch-package parse errors and ensuring dns-native Jest tests can resolve AsyncStorage mocks.

## Non-goals

- Changing runtime behavior of the app beyond CI/test requirements.
- Upgrading dependencies outside the failing patches/tests.
- Rewriting Jest setup or introducing new test frameworks.

## Current state (pre-implementation)

- `patch-package` fails to parse `@react-native-menu/menu` and `react-native-screens` patch files.
- `modules/dns-native` tests fail because `@react-native-async-storage/async-storage` is missing in that package scope.

## Proposed approach (chosen)

### Option A: Remove patches and accept upstream behavior

Pros:
- Quick CI unblocking.

Cons:
- Loses required compatibility fixes and Gradle syntax changes.

### Option B: Regenerate patch files with correct hunk headers (recommended)

Pros:
- Preserves required compatibility fixes.
- Keeps patch-package flow intact.

Cons:
- Requires careful diff generation and verification.

### Option C: Inline changes by forking the dependencies

Pros:
- Full control over changes.

Cons:
- Heavy maintenance burden and diverges from patch-package workflow.

Chosen: Option B.

## Architecture / data flow updates

- Patch files are regenerated from validated diffs to satisfy patch-package parser expectations.
- dns-native Jest runs continue to use the repo-level setup file; we add missing dependency for module-level resolution.

## Phased plan with milestones

### Phase 0: Discovery

Acceptance criteria:
- Identify failing patches and missing test dependencies.

TODO:
- Reproduce patch-package parse errors.
- Confirm dns-native tests fail due to missing AsyncStorage module.

Verification:
- `./node_modules/.bin/patch-package --dry-run`
- `cd modules/dns-native && npm test`

Rollback:
- No code changes.

### Phase 1: Patch regeneration

Acceptance criteria:
- Patch files parse and apply in CI and locally.

TODO:
- Regenerate `@react-native-menu/menu` patch with accurate hunks.
- Regenerate `react-native-screens` patch with accurate hunks.
- Validate patch-package parsing.

Verification:
- `./node_modules/.bin/patch-package --dry-run`

Rollback:
- Restore prior patch files.

### Phase 2: dns-native test dependency

Acceptance criteria:
- dns-native Jest can resolve AsyncStorage mocks.

TODO:
- Add `@react-native-async-storage/async-storage` as a devDependency to `modules/dns-native`.
- Update `modules/dns-native/package-lock.json` so `npm ci` installs the devDependency.

Verification:
- `cd modules/dns-native && npm test`

Rollback:
- Remove the devDependency.

### Phase 3: Validation + docs

Acceptance criteria:
- CI steps pass locally where reproducible.
- Docs and changelog updated.

TODO:
- Update docs index and changelog.
- Re-run patch-package dry run.

Verification:
- `./node_modules/.bin/patch-package --dry-run`
- `bun run lint`
- `bun run test`

Rollback:
- Revert doc updates.

## Testing strategy

- Patch parsing: `./node_modules/.bin/patch-package --dry-run`.
- Unit tests: `bun run test` (repo) and `npm test` under `modules/dns-native` when dependencies are installed.

## Observability

- No runtime telemetry changes.
- CI should surface failures on patch-package parse and dns-native test steps.

## Rollout plan

- Merge to main after local verification passes.
- Monitor CI for regression on patch-package and dns-native tests.

## Rollback plan

- Revert patch regeneration and dns-native devDependency change.

## Risks and mitigations

- Risk: Patch diffs drift from installed dependency versions.
  - Mitigation: Keep patch file version pinned and regenerate only against installed package version.

## Open questions

- None.

## Implementation status

All phases completed on 2026-01-06.

## Detailed multi-phase todo (completed)

### Phase 0: Discovery

- [x] Reproduce patch-package parse error locally.
- [x] Identify dns-native Jest resolution failure for AsyncStorage.

### Phase 1: Patch regeneration

- [x] Regenerate `@react-native-menu/menu` patch with valid hunks.
- [x] Regenerate `react-native-screens` patch with valid hunks.
- [x] Validate patch-package parser.

### Phase 2: dns-native test dependency

- [x] Add `@react-native-async-storage/async-storage` devDependency to `modules/dns-native`.
- [x] Update `modules/dns-native/package-lock.json` for CI installs.

### Phase 3: Validation + docs

- [x] Update docs index and changelog.
- [x] Re-run patch-package dry run.
- [x] Re-run lint/tests.

## Verification Log (re-run 2026-01-06)

- `./node_modules/.bin/patch-package --dry-run` (all patches applied).
- `cd modules/dns-native && npm test` (7 passed, 1 skipped; 56 passed, 13 skipped).
- `bun run lint` (pass).
- `bun run test` (65 passed, 1 skipped; 717 passed, 13 skipped).
- `rg -n "EXECPLAN-2026-01-06-CI-PATCH-PACKAGE-DNS-NATIVE" docs/README.md` (entry present).
- `rg -n "patch-package|dns-native" CHANGELOG.md` (entries present).
