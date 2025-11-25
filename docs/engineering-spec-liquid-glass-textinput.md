# Engineering Spec: Reliable Error/Theme Sync for LiquidGlassTextInput

## Summary

LiquidGlassTextInput must surface validation and theme changes instantly. Today its border shared values are only updated on focus/blur; if `errorText` arrives while blurred or the palette changes (e.g., user toggles dark mode or high-contrast), the border stays stale, hiding errors and violating HIG and our React guidelines. This spec delivers a deterministic, test-covered fix plus tooling checks to prevent regressions.

## Goals

- Always reflect `errorText` immediately with destructive border color, even when the field is blurred.
- Keep border color/width synchronized with palette changes without requiring user interaction.
- Preserve existing haptic/animation affordances and API surface.
- Add automated tests that fail on the current bug and pass after the fix.
- Verify ast-grep pre-commit hook is present and documented as the enforced linter.

## Non-Goals

- Redesigning the input visuals beyond border sync.
- Changing typography/palette tokens or spacing.
- Adding runtime validation logic (only visual/state sync).

## Current Behavior

- `borderColor` shared value initialized once; updated only inside `handleFocus`/`handleBlur`.
- `hasError` changes while blurred do not re-run animation → error borders never appear unless the user refocuses.
- Palette updates (theme switch, accessibility contrast) do not propagate to the animated border.
- `getBorderColor` helper is unused, hinting at missing synchronization.

## Proposed Approach

### Phase 1 — State Synchronization

- Introduce a `syncBorderState(nextFocused: boolean, nextHasError: boolean)` helper that computes target color/width from palette + focus + error.
- Call `syncBorderState` in focus/blur handlers (with explicit booleans) and from a `useEffect` that watches `hasError`, `isFocused`, and palette tokens to catch prop/theme changes.
- Remove unused `getBorderColor` helper.
- Add a deterministic `testID` on the animated container to support testing without impacting UI.

### Phase 2 — Tests

- Create `__tests__/components/LiquidGlassTextInput.spec.tsx`.
- Mock `react-native-reanimated` with the official jest mock (synchronous timing) and stub typography/palette hooks with deterministic tokens.
- Write two assertions:
  1. Error-first render: border color equals palette.destructive.
  2. Error introduced after initial render (no focus): border color transitions from palette.border to palette.destructive.
- Optional: palette change rerender updates border color (guards theme sync).

### Phase 3 — Tooling Verification

- Confirm `.git/hooks/pre-commit` invokes `npm run lint:ast-grep`.
- Run `npm run lint:ast-grep` and `npm test`; capture outputs for the ExecPlan notes.

## Acceptance Criteria

- Rendering with `errorText="Required"` shows destructive border immediately without focus/blur.
- Rerendering with `errorText` added while blurred updates border color.
- Rerendering with a different palette updates border color to the new palette’s border/destructive values.
- All lint + jest suites pass.

## Risks & Mitigations

- Reanimated mock differences: use official mock and synchronous helpers; keep styles plain objects for tests.
- Palette dependency churn: encapsulate palette keys in helper to avoid missed dependencies.
- Snapshot brittleness: avoid snapshots; assert flattened styles only.

## Rollout & Validation Plan

- Local: run lint + jest (Phase 3).
- Document outcomes in `docs/execplan-liquid-glass-input.md` Progress/Outcomes.
- No runtime feature flags needed; change is small and backwards compatible.

## Testing Plan

- Unit: new jest spec described above.
- Tooling: ast-grep run as gate.
- Manual reasoning: none required once tests pass; behavior covered by automated assertions.

## Observability

- Not instrumenting runtime logging to avoid noise; bug is visual and test-covered.
