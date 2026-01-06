# Engineering Exec Spec: Security + Best-Practices Audit (DNSChat)

Status: Implemented
Owner: Mobile
Last updated: 2026-01-06

## Goal

Harden DNSChat for current platform requirements and security expectations while keeping behavior stable: reduce React Compiler anti-patterns, align Android build targets/NDK defaults, tighten error alert behavior, and complete a public-info + dependency audit with documented verification.

## Non-goals

- Rewriting DNS transport order or prompt sanitization rules.
- Major UI redesign or navigation changes.
- Changing persisted data schema or encryption format.
- Git history rewrites or repository fork management.

## Current state (pre-implementation)

- Android config lacked explicit edge-to-edge + predictive back flags.
- Native module build fallbacks defaulted to older Android SDK levels.
- Debug logging in the native module was not gated consistently.
- Several hooks relied on memoization that conflicts with React Compiler guidance.
- Error alerts could re-fire due to unstable callback identities.

## Proposed approach (chosen)

### Option A: Minimal config-only updates

Pros:
- Low risk.
- Short change set.

Cons:
- Leaves React Compiler anti-patterns and alert re-trigger issues.

### Option B: Config updates + runtime correctness cleanup (recommended)

Pros:
- Aligns build targets with platform guidance.
- Eliminates unstable callback identities in alerts.
- Keeps React Compiler happy without unnecessary memoization.

Cons:
- Requires more verification and larger diff.

Chosen: Option B.

## Architecture / data flow updates

- Chat runtime: make `loadChats` a stable in-scope function and avoid re-firing error alerts on every render.
- Logging: gate native debug logs behind a runtime flag to keep production output clean.
- Android build config: explicitly set compile/target SDK and NDK defaults via Expo build properties + module fallbacks.

## Phased plan with milestones

### Phase 0: Discovery + audit

Acceptance criteria:
- Repo scanned for secrets and public-only content.
- Dependency audit executed.

TODO:
- Run secret scanning across repo.
- Run dependency audit with Bun.

Verification:
- `gitleaks detect --source . --no-git --report-format json --report-path /tmp/gitleaks-report.json`
- `bun audit`

Rollback:
- No code changes.

### Phase 1: Platform config alignment

Acceptance criteria:
- Android targets set explicitly and consistent across native module fallbacks.
- Edge-to-edge + predictive back enabled.

TODO:
- Update `app.json` with Android build properties and UX flags.
- Align native module fallback compile/target SDK values.
- Align dnsjava dependency versions across Android modules.

Verification:
- `rg -n "compileSdkVersion|targetSdkVersion|minSdkVersion" app.json android modules`

Rollback:
- Revert config changes.

### Phase 2: React Compiler + runtime correctness

Acceptance criteria:
- No unnecessary `useMemo`/`useCallback` patterns.
- Error alerts fire once per error.
- Chat load function available for context consumers.

TODO:
- Remove `useMemo`/`useCallback` where not required.
- Fix ChatContext `loadChats` scope.
- Prevent repeated alerts by stabilizing alert effect dependencies.
- Gate native debug logging.

Verification:
- `rg -n "useMemo|useCallback" src`
- Smoke run of chat flows in dev-client.

Rollback:
- Revert runtime changes.

### Phase 3: Validation

Acceptance criteria:
- Lint + tests run cleanly.
- Security audit results captured.

TODO:
- Run lint and tests.
- Re-run critical audits if needed.

Verification:
- `bun run lint`
- `bun run test`

Rollback:
- Revert to last green commit.

## Testing strategy

- Lint: `bun run lint`.
- Unit tests: `bun run test`.
- Security audit: `bun audit`.

## Observability

- Keep dev-only logging gated through `__DEV__` and explicit debug flags.
- No new telemetry introduced.

## Rollout plan

- Merge to main after local lint/tests pass.
- Run store builds (EAS or CI) targeting updated SDK levels.

## Rollback plan

- Revert the commit(s) touching config + runtime fixes.
- Restore previous SDK defaults if build failures occur.

## Risks and mitigations

- Risk: Raising target/compile SDK may surface new Android warnings.
  - Mitigation: align with Android guidance and keep minSdk unchanged.
- Risk: Removing memoization changes render timing.
  - Mitigation: keep logic identical; rely on React Compiler and existing performance assumptions.

## Open questions

- None.

## Implementation status

All phases completed on 2026-01-06.

## Detailed multi-phase todo (completed)

### Phase 0: Discovery + audit

- [x] Run repo secret scan (gitleaks).
- [x] Run dependency audit.

### Phase 1: Platform config alignment

- [x] Add `edgeToEdgeEnabled` + `predictiveBackGestureEnabled` in `app.json`.
- [x] Set Android `compileSdkVersion`, `targetSdkVersion`, `minSdkVersion`, `ndkVersion` in build properties.
- [x] Align native module fallback SDK versions.
- [x] Align dnsjava versions across Android modules.

### Phase 2: React Compiler + runtime correctness

- [x] Remove unnecessary `useMemo`/`useCallback` usages.
- [x] Fix `loadChats` availability in `ChatContext`.
- [x] Prevent repeated alert triggers in chat screens.
- [x] Gate native debug logging behind debug flag.

### Phase 3: Validation

- [x] Run lint.
- [x] Run tests.
- [x] Record audit outputs.
