# Engineering Exec Spec: Guidelines Compliance + Best Practices Review (DNSChat)

Status: Implemented
Owner: Mobile
Last updated: 2026-01-06

## Goal

Perform a repo-wide review against GUIDELINES-REF, validate current best practices using authoritative sources, and remediate CI/test blockers.

## Non-goals

- Feature development or UI redesign.
- Dependency upgrades outside the CI/test fixes.
- Large-scale refactors not tied to verification findings.

## Current state (pre-implementation)

- CI fails on patch-package parsing for select patches.
- `modules/dns-native` tests fail because AsyncStorage mock dependency is missing for Jest.
- No single exec spec captured the compliance review + best practices verification.

## Proposed approach (chosen)

Option A: Only fix CI failures.
- Pros: fast unblock.
- Cons: no compliance audit record.

Option B: Fix CI failures and document compliance + best-practices verification (chosen).
- Pros: unblocks CI, provides audit trail.
- Cons: additional documentation work.

Option C: Broad refactor to preemptively align every guideline.
- Pros: maximal alignment.
- Cons: high risk and scope creep.

Chosen: Option B.

## External best-practices verification (authoritative sources)

- Patch-package expected patch format and regeneration flow (official docs).
- AsyncStorage Jest mocking guidance (official docs).

Sources:
- https://www.npmjs.com/package/patch-package
- https://github.com/DS300/patch-package
- https://react-native-async-storage.github.io/async-storage/docs/advanced/jest

## Guidelines applicability matrix (verified)

Applicable:
- AUDIT, BUN, DEV, EXECPLANS, EXPO, IOS, LOG, MOBILE, OWASP, REACT, REACT_USE_EFEECT, SECURITY, SOFTWARE-ENGINEERING, TYPESCRIPT, DESIGN-UI-UX (partial).

Not applicable for this repo (no usage):
- CLOUDERA-PYSPARK, CLOUDFARE, D1-DATETIME-EXPIRY, DB, ELYSIA, KIWIFY-API, MCPORTER, PEEKABOO, PETER-ORACLE, PNPM, POSTGRESQL, PSEO, PYTHON, RAG-CHATBOT, SQLITE, STAGEHAND, SUPABASE, SWEETLINK, TESTING-IN-MEMORY-DATABASE, VERCEL, VERCEL-DESIGN, WAHA, WARELAY, WEB, WEB-NEXTJS.

## Review findings

- Patch files for `@react-native-menu/menu` and `react-native-screens` were not parsable by patch-package.
- `modules/dns-native` Jest setup requires AsyncStorage mock module but it was missing from the module workspace dependencies.
- `modules/dns-native/package-lock.json` needed update to reflect the new devDependency for CI (`npm ci`).

## Remediation summary

- Regenerated patch files with valid hunks and verified via patch-package dry-run.
- Added AsyncStorage devDependency to dns-native and updated module lockfile.
- Updated docs index and changelog to document the work.

## Phased plan with milestones

### Phase 0: Discovery

Acceptance criteria:
- CI blockers identified and reproduced locally.

TODO:
- Reproduce patch-package parse errors.
- Confirm dns-native test dependency failure.

Verification:
- `./node_modules/.bin/patch-package --dry-run`
- `cd modules/dns-native && npm test`

### Phase 1: Best practices verification

Acceptance criteria:
- External sources reviewed and documented.

TODO:
- Validate patch-package expectations and regen flow.
- Validate AsyncStorage Jest mock guidance.

Verification:
- Sources recorded in this exec spec.

### Phase 2: Remediation

Acceptance criteria:
- Patch files parse and apply.
- dns-native tests resolve AsyncStorage mocks.

TODO:
- Regenerate patch files with valid headers.
- Add AsyncStorage devDependency to `modules/dns-native`.
- Update `modules/dns-native/package-lock.json`.

Verification:
- `./node_modules/.bin/patch-package --dry-run`
- `bun run test`

### Phase 3: Docs + validation

Acceptance criteria:
- Docs and changelog updated.
- Lint/tests pass.

TODO:
- Update docs index.
- Update changelog.
- Re-run lint/tests.

Verification:
- `bun run lint`
- `bun run test`

## Testing strategy

- Patch parsing: `./node_modules/.bin/patch-package --dry-run`.
- Root unit tests: `bun run test`.
- Module tests: `npm test` under `modules/dns-native` (requires lockfile sync).

## Observability

- No runtime telemetry changes.
- CI logs remain the primary signal.

## Rollout plan

- Merge to main after local verification passes.
- Monitor CI for patch-package and dns-native jobs.

## Rollback plan

- Revert patch files and dns-native dependency/lockfile updates.

## Risks and mitigations

- Risk: Patch files drift from installed dependency versions.
  - Mitigation: regenerate patches only against installed versions, verify via dry-run.

## Open questions

- None.

## Implementation status

All phases completed on 2026-01-06.

## Detailed multi-phase todo (completed)

### Phase 0: Discovery
- [x] Reproduced patch-package parse errors.
- [x] Confirmed dns-native dependency failure.

### Phase 1: Best practices verification
- [x] Verified patch-package expectations and regeneration flow.
- [x] Verified AsyncStorage Jest mocking guidance.

### Phase 2: Remediation
- [x] Regenerated patch files with valid hunks.
- [x] Added AsyncStorage devDependency to `modules/dns-native`.
- [x] Updated `modules/dns-native/package-lock.json`.

### Phase 3: Docs + validation
- [x] Updated docs index and changelog.
- [x] Re-ran patch-package dry-run.
- [x] Ran lint and unit tests.

## Verification Log (re-run 2026-01-06)

- `./node_modules/.bin/patch-package --dry-run` (all patches applied).
- `cd modules/dns-native && npm test` (7 passed, 1 skipped; 56 passed, 13 skipped).
- `bun run lint` (pass).
- `bun run test` (65 passed, 1 skipped; 717 passed, 13 skipped).
