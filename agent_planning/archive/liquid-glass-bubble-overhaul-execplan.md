```md
# Liquid Glass Message Bubble Rebuild

This ExecPlan is a living document maintained per `PLANS.md`. All sections must stay current as work progresses.

## Purpose / Big Picture

Users expect iOS 26 glass chat bubbles that mirror iMessage: distinct blue user bubbles, neutral assistant bubbles, and a readable fallback when Liquid Glass is unavailable. Today bubbles render almost flat because the tint layers are missing. This plan restores the layered glass look (tint, highlight, stroke) and aligns non-glass fallbacks, so anyone can run the app on iPhone or simulator and immediately see true Liquid Glass messaging.

## Progress

- [x] (2025-10-27 18:05Z) Captured MessageBubble baseline, noted test guards, and drafted layered overlay strategy.
- [x] (2025-10-27 18:55Z) Implemented bubble tone overlays, updated Jest expectations, and ran ast-grep plus targeted/full test suites.
- [x] (2025-10-27 19:10Z) Archived this ExecPlan under `agent_planning/archive/` after final QA sign-off.

## Surprises & Discoveries

- None logged yet; update as findings surface.

## Decision Log

- Decision: Use in-place overlays inside `MessageBubble` rather than modifying `LiquidGlassWrapper` to keep other glass consumers untouched.  
  Rationale: Only chat bubbles need the layered treatment and existing tests assert wrapper semantics.  
  Date/Author: 2025-10-27 / Codex.

## Outcomes & Retrospective

- Layered tint overlays now live inside `MessageBubble`, producing consistent iMessage-style bubbles for glass and fallback states; tonal constants may need minor tuning after on-device QA.
- Jest coverage watches for the overlay scaffolding so future refactors cannot drop the tint/highlight layers silently; all structural and full test suites pass locally (watchman recrawl warnings observed but harmless).

## Context and Orientation

The chat UI lives in `src/components/MessageBubble.tsx`, rendered by `MessageList.tsx`. Glass utilities reside in `src/components/LiquidGlassWrapper.tsx`, while color tokens come from `src/ui/theme/imessagePalette.ts` and spacing from `src/ui/theme/liquidGlassSpacing.ts`. Unit tests in `__tests__/chat.glassEffect.spec.ts` assert the glass architecture and will need updates after structural changes. `npm run lint:ast-grep` enforces structural rules via `project-rules/astgrep-liquid-glass.yml`; the repo already wires a pre-commit hook through `scripts/install-git-hooks.js`.

## Plan of Work

Describe edits sequentially for a fresh contributor:

1. Inspect `MessageBubble.tsx` to map existing style arrays (`bubbleStyles`, `bubbleGlassContainer`, `bubblePressable`) and note comment markers the tests expect. Record baseline behavior (user vs assistant, error path) so new overlays respect each branch.
2. Introduce a memoized `bubbleTone` object in `MessageBubble.tsx` capturing tint, highlight, stroke, fallback background/border, and shadow strength for user, assistant (light/dark), and error states. Keep constants descriptive and reuse palette colors where possible; prefer RGBA literals only when palette lacks an equivalent.
3. Add absolute-positioned overlay layers (`glassTintLayer`, `glassHighlightLayer`, `glassStrokeLayer`) rendered inside the `Pressable` so both glass and fallback share the same visual treatment. Ensure overlays are `pointerEvents="none"` and inherit the corner radius from `getCornerRadius('message')`.
4. Strengthen fallback visuals by adjusting the non-glass branch of `bubbleStyles` to apply `bubbleTone.fallbackBackground`, `bubbleTone.fallbackBorder`, and tuned shadows while keeping tails (`borderBottom*Radius`) intact. Preserve the existing separation between `bubbleGlassContainer` and `bubbleShadow` to satisfy tests.
5. Double-check `LiquidGlassWrapper` usage: keep variant/tint logic but feed the new overlay so glass mode always shows tint even on static backgrounds. Verify no appearance props leak into `bubbleGlassContainer`.
6. Update `__tests__/chat.glassEffect.spec.ts` expectations if string assertions change (for example, new comments describing overlay layers). Add new assertions ensuring overlay views exist so regressions are caught.
7. Run ast-grep lint and focused Jest suites (`npm test -- __tests__/chat.glassEffect.spec.ts`) via tmux, then execute the full test run to ensure global stability.

## Concrete Steps

- `tmux new-session -d -s lintcheck 'cd /Users/mvneves/dev/MOBILE/chat-dns && npm run lint:ast-grep && sleep 1'` to confirm the tree is clean before editing (expect zero violations).
- Edit `src/components/MessageBubble.tsx` per steps 2–5, using `apply_patch` for atomic diffs.
- If overlays require shared tokens, adjust `src/ui/theme/imessagePalette.ts` cautiously; otherwise leave untouched.
- Modify `__tests__/chat.glassEffect.spec.ts` to reflect the new structure while keeping critical assertions on glass separation.
- `tmux new-session -d -s glassspec 'cd /Users/mvneves/dev/MOBILE/chat-dns && npm test -- __tests__/chat.glassEffect.spec.ts && sleep 1'` to verify targeted tests.
- `tmux new-session -d -s testall 'cd /Users/mvneves/dev/MOBILE/chat-dns && npm test && sleep 1'` for full regression.

## Validation and Acceptance

Acceptance requires:
- On iOS glass-enabled devices the chat view renders bubbles with visible tint, highlight, and stroke layers; screenshots should show blue user bubbles and neutral assistant bubbles.
- On non-glass platforms bubbles show the same layered look using the fallback colors.
- `npm run lint:ast-grep`, `npm test -- __tests__/chat.glassEffect.spec.ts`, and `npm test` all pass.
- Comments explaining the glass/fallback separation remain, satisfying existing architectural assertions.

## Idempotence and Recovery

Overlay styles are pure UI changes; re-running the edits is safe. If visual tweaks overshoot, revert the specific hunks in `MessageBubble.tsx` and re-run the tests. No schema or data migrations exist.

## Artifacts and Notes

Capture final diffs for `MessageBubble.tsx` and updated Jest output to document success. No additional markdown summaries outside `agent_planning/` are permitted; after completion archive this ExecPlan under `agent_planning/archive/`.

## Interfaces and Dependencies

- `src/components/MessageBubble.tsx`: Maintain exported component signature.
- `LiquidGlassWrapper` API (`variant`, `shape`, `cornerRadius`, `tintColor`) remains unchanged; overlays must coexist without touching wrapper internals.
- Palette utilities from `src/ui/theme/imessagePalette.ts` and `getCornerRadius` from `src/ui/theme/liquidGlassSpacing.ts` provide all needed tokens; no new dependencies required.
```
