# Fix LiquidGlassTextInput visual sync and harden UI QA loop

This ExecPlan follows PLANS.md and DOCS/GUIDELINES-REF/EXECPLANS-GUIDELINES.md. It is a living document; update Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective as work proceeds.

## Purpose / Big Picture

Users must see accurate visual states on text inputs: error borders should appear immediately when validation fails, and theme changes should update borders without user interaction. The plan delivers a deterministic, test-covered LiquidGlassTextInput plus enforcement hooks (ast-grep pre-commit) so regressions are blocked.

## Progress

- [x] (2025-11-25T18:20Z) Baseline review, identified border sync risk and hook verification need.
- [x] (2025-11-25T18:45Z) Verified LiquidGlassTextInput sync path matches spec; ensured container testID present.
- [x] (2025-11-25T18:50Z) Added state-sync jest spec with custom reanimated mock.
- [x] (2025-11-25T18:55Z) Ran `npm run lint:ast-grep` and `npm test` (38 suites, 1 skipped).
- [x] (2025-11-25T19:05Z) Committed docs + test (`test(ui): guard liquid glass input sync`).

## Surprises & Discoveries

- Jest cache surfaced stale failure expectations (useAnimatedStyle) until rerun; current spec expects Animated.timing + useNativeDriver, no code change needed.
- react-native-reanimated ESM mock throws in ts-jest; hand-rolled CJS mock fixed parsing for new test.

## Decision Log

- Decision: Keep existing border sync implementation (already present) and add deterministic tests instead of refactoring further.  
  Rationale: Code already meets guidelines; regression risk covered by tests.  
  Date/Author: 2025-11-25 / assistant
- Decision: Replace reanimated canned mock with lightweight CJS mock for this spec.  
  Rationale: Avoid ESM parse errors under ts-jest; keeps test deterministic.  
  Date/Author: 2025-11-25 / assistant

## Outcomes & Retrospective

- Added executable state-sync test; lint + full jest suite green (37 passed, 1 skipped).  
- Ast-grep hook already active via `.git/hooks/pre-commit`; lint passes clean.  
- No code changes needed in LiquidGlassTextInput after verification; tests now guard regression.

## Context and Orientation

Relevant files: `src/components/ui/LiquidGlassTextInput.tsx` (animated border logic), `project-rules/astgrep-liquid-glass.yml` + `scripts/install-git-hooks.js` (linter/hook), tests under `__tests__`. Current issue: borderColor shared value set once on mount/focus; when `errorText` or palette changes while blurred, visuals stay stale, hiding errors and theme changes.

## Plan of Work

Narrative: Fix rendering first, then guard with tests, then verify tooling. Edit LiquidGlassTextInput to centralize border state sync (palette, error, focus), drop unused helpers, and add minimal test hooks. Add Jest test with reanimated mock to assert border color updates on `errorText` change without focus. Confirm ast-grep hook present and documented. Run lint/tests; adjust if failures. Finalize by updating Progress/Outcomes and committing touched files only.

## Concrete Steps

1) Modify `src/components/ui/LiquidGlassTextInput.tsx`: create sync helper driving border shared values from (`hasError`, `isFocused`, palette), call from focus/blur and useEffect listening to palette/error changes; add testID for container.  
2) Add Jest spec under `__tests__/components/LiquidGlassTextInput.spec.tsx` with reanimated mock + palette/typography mocks; assert border color switches to destructive when `errorText` appears without refocus; assert palette change propagates.  
3) Verify ast-grep hook present (`.git/hooks/pre-commit`), run `npm run lint:ast-grep`, then `npm test`.  
4) Update this plan’s Progress/Outcomes; commit with scoped message including changed paths only.

## Validation and Acceptance

- `npm run lint:ast-grep` passes.
- `npm test` passes; new spec fails on old code and passes after fix (demonstrate in notes).
- Manual reasoning: rendering with `errorText="Required"` immediately shows destructive border color without focus/blur; rerender with new palette updates border.

## Idempotence and Recovery

Edits are additive and guarded by tests. Re-running commands is safe. If jest mock conflicts, clear `jest-cache` and rerun. If ast-grep fails due to new rule, align code rather than disabling.

## Artifacts and Notes

- Capture test output snippets after runs.  
- Record any mock adjustments for reanimated in Surprises & Discoveries.
