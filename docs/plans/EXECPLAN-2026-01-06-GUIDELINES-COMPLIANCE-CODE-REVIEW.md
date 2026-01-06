# Engineering Exec Spec: Guidelines Compliance + Code Review (DNSChat)

Status: Implemented
Owner: Mobile
Last updated: 2026-01-06

## Goal

Perform a repo-wide code review aligned with GUIDELINES-REF, validate best practices against authoritative sources, and remediate any blocking CI/test issues.

## Non-goals

- Large feature changes or UI redesigns.
- Dependency upgrades outside of required fixes.
- Rewriting architecture without an explicit request.

## Current state (pre-implementation)

- CI fails on patch-package parse errors for patched dependencies.
- dns-native tests fail due to missing AsyncStorage dependency in the module workspace.
- Guidelines compliance status was not explicitly tracked in a single exec spec.

## Proposed approach (chosen)

Option A: Only fix CI errors.
- Pros: quick unblock.
- Cons: leaves guidelines compliance and best practices undocumented.

Option B: Fix CI errors and document compliance + review findings (chosen).
- Pros: unblocks CI and produces a traceable, reviewable compliance record.
- Cons: requires additional documentation work.

Option C: Full refactor to preemptively align with every guideline.
- Pros: maximal alignment.
- Cons: high risk and scope creep without explicit product requirements.

Chosen: Option B.

## Architecture / data flow updates

- No runtime architecture changes.
- CI stability restored via patch file regeneration and module test dependency alignment.

## Guidelines applicability matrix (verified)

Applicability for this repo:
- Applicable: MOBILE, EXPO, REACT, TYPESCRIPT, BUN, IOS, SWIFT, SECURITY, OWASP, LOG, DEV, SOFTWARE-ENGINEERING, REACT_USE_EFEECT, AUDIT.
- Not applicable: data platforms, web-only stacks, vendor-specific integrations not present in this repo.

Detailed checklist:
- [x] AUDIT-GUIDELINES.md - Applicable
- [x] BUN-GUIDELINES.md - Applicable
- [x] CLOUDERA-PYSPARK-GUIDELINES.md - Not applicable
- [x] CLOUDFARE-GUIDELINES.md - Not applicable
- [x] D1-DATETIME-EXPIRY-GUIDELINES.md - Not applicable
- [x] DB-GUIDELINES.md - Not applicable
- [x] DESIGN-UI-UX-GUIDELINES.md - Partially applicable (UI patterns, accessibility)
- [x] DEV-GUIDELINES.md - Applicable
- [x] ELYSIA-GUIDELINES.md - Not applicable
- [x] EXECPLANS-GUIDELINES.md - Applicable (doc format)
- [x] EXPO-GUIDELINES.md - Applicable
- [x] IOS-GUIDELINES.md - Applicable
- [x] KIWIFY-API-GUIDELINES.md - Not applicable
- [x] LOG-GUIDELINES.md - Applicable
- [x] MCPORTER-GUIDELINES.md - Not applicable
- [x] MOBILE-GUIDELINES.md - Applicable
- [x] OWASP-GUIDELINES.md - Applicable
- [x] PEEKABOO-GUIDELINES.md - Not applicable
- [x] PETER-ORACLE-GUIDELINES.md - Not applicable
- [x] PNPM-GUIDELINES.md - Not applicable (Bun is required)
- [x] POSTGRESQL-GUIDELINES.md - Not applicable
- [x] PSEO-GUIDELINES.md - Not applicable
- [x] PYTHON-GUIDELINES.md - Not applicable
- [x] RAG-CHATBOT-GUIDELINES.md - Not applicable
- [x] REACT-GUIDELINES.md - Applicable
- [x] REACT_USE_EFEECT-GUIDELINES.md - Applicable
- [x] SECURITY-GUIDELINES.md - Applicable
- [x] SOFTWARE-ENGINEERING-GUIDELINES.md - Applicable
- [x] SQLITE-GUIDELINES.md - Not applicable
- [x] STAGEHAND-GUIDELINES.md - Not applicable
- [x] SUPABASE-GUIDELINES.md - Not applicable
- [x] SWEETLINK-GUIDELINES.md - Not applicable
- [x] TESTING-IN-MEMORY-DATABASE-GUIDELINES.md - Not applicable
- [x] TYPESCRIPT-GUIDELINES.md - Applicable
- [x] VERCEL-DESIGN-GUIDELINES.md - Not applicable
- [x] VERCEL-GUIDELINES.md - Not applicable
- [x] WAHA-GUIDELINES.md - Not applicable
- [x] WARELAY-GUIDELINES.md - Not applicable
- [x] WEB-GUIDELINES.md - Not applicable
- [x] WEB-NEXTJS-GUIDELINES.md - Not applicable

## Review findings (summary)

- CI instability due to invalid patch file format (patch-package parsing) was confirmed and fixed.
- dns-native tests require AsyncStorage mock support; module-level devDependency added.
- No TODO/FIXME markers found in app source (static scan).
- Logging remains scoped to dev utilities or guarded test contexts.

## Phased plan with milestones

### Phase 0: Discovery

Acceptance criteria:
- Identify CI blockers and missing module dependencies.

TODO:
- Reproduce patch-package parsing errors.
- Reproduce dns-native test dependency failure.

Verification:
- `./node_modules/.bin/patch-package --dry-run`
- `cd modules/dns-native && npm test`

### Phase 1: Guidelines verification

Acceptance criteria:
- All GUIDELINES-REF docs are classified as applicable or not.
- Applicable docs reviewed for conflicts with current code/config.

TODO:
- Enumerate GUIDELINES-REF docs.
- Map applicability to this repo.
- Capture any required remediations.

Verification:
- Updated exec spec with applicability matrix.

### Phase 2: Remediation

Acceptance criteria:
- Patch files parse and apply.
- dns-native tests resolve AsyncStorage mock.

TODO:
- Regenerate patch files with valid headers.
- Add AsyncStorage devDependency to `modules/dns-native`.

Verification:
- `./node_modules/.bin/patch-package --dry-run`
- `bun run test`

### Phase 3: Documentation + validation

Acceptance criteria:
- Docs and changelog updated.
- Lint/test checks pass.

TODO:
- Update docs index.
- Update changelog.
- Re-run lint/tests.

Verification:
- `bun run lint`
- `bun run test`

## Testing strategy

- Root unit tests via `bun run test`.
- Patch parsing validation via `patch-package --dry-run`.
- Module tests via `npm test` inside `modules/dns-native` when dependencies are installed.

## Observability

- No runtime telemetry changes.
- CI logs are the primary signal for success.

## Rollout plan

- Merge and monitor CI on main.

## Rollback plan

- Revert patch files and module devDependency changes.

## Risks and mitigations

- Risk: Patch files can drift from installed dependency versions.
  - Mitigation: regenerate patches only against installed versions and validate with dry-run.

## Open questions

- None.

## Implementation status

All phases completed on 2026-01-06.

## Detailed multi-phase todo (completed)

### Phase 0: Discovery
- [x] Reproduced patch-package parse errors.
- [x] Confirmed dns-native test dependency failure.

### Phase 1: Guidelines verification
- [x] Enumerated all GUIDELINES-REF docs and mapped applicability.
- [x] Reviewed applicable guidelines for conflicts with current repo.

### Phase 2: Remediation
- [x] Regenerated patch files with valid hunks.
- [x] Added AsyncStorage devDependency to `modules/dns-native`.

### Phase 3: Documentation + validation
- [x] Updated docs index and changelog.
- [x] Re-ran patch-package dry-run.
- [x] Ran lint and unit tests.
