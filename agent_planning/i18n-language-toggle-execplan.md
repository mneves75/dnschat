# ExecPlan: Bilingual UI & Locale Toggle

This ExecPlan follows `PLANS.md` and stays in sync with that guidance until archived. It remains a living doc; update every section as work proceeds.

## Purpose / Big Picture

Deliver full English (en-US) and Portuguese (pt-BR) UI coverage plus a user-facing toggle that defaults to the device locale when unset. The About tab must surface a reliable Settings entry point so users can discover the toggle instantly. Success means every screen reuses the shared translator, the Settings views persist locale choice (or follow system), and ast-grep linting prevents regressions before commits.

## Progress

- [x] (2025-10-25 23:10Z) Expand dictionaries + locale plumbing design captured, tests outlined.
- [x] (2025-10-25 23:30Z) Settings + GlassSettings language selectors implemented and tested.
- [x] (2025-10-25 23:45Z) All user-facing screens/components migrated to translation keys, About shows Settings CTA.
- [x] (2025-10-25 23:50Z) ast-grep lint wired into `npm run lint:ast-grep` + blocking git hook, repo docs updated via final summary.

## Surprises & Discoveries

- Observation: React-test-renderer now logs deprecation warnings during Jest runs; harmless but noisy.  
  Evidence: Jest console output while exercising new language toggle tests.

## Decision Log

- Decision: Centralized locale label mapping in `src/i18n/localeMeta.ts` so multiple screens can share the same translation keys without duplicating constants.  
  Rationale: Both Settings variants require the same locale labels; exporting a single map keeps type-safety.  
  Date/Author: 2025-10-25 / Codex.
- Decision: Added `scripts/install-git-hooks.js` and wired it via `npm run prepare` to keep ast-grep pre-commit enforcement automatic.  
  Rationale: Ensures every contributor has lint blocking commits without manual steps.  
  Date/Author: 2025-10-25 / Codex.

## Outcomes & Retrospective

- To be filled once features, tests, and hooks land; compare actual vs intended behavior and note any follow-ups.

## Context and Orientation

`src/i18n/index.tsx` already exposes `I18nProvider` and `useTranslation`, but only About.tsx consumes it. Dictionaries live in `src/i18n/messages/en-US.ts` and `pt-BR.ts`, sharing the English shape. `SettingsContext` (`src/context/SettingsContext.tsx`) stores `preferredLocale`, `systemLocale`, and exposes `updateLocale`, yet no UI drives it. `GlassSettings.tsx` is the modal presented at `navigation/index.tsx` route `Settings`; `Settings.tsx` is the legacy screen still referenced by tests and docs (`docs/SETTINGS.md`). Tabs render via `GlassChatList`, `Logs`, and `About`, so we must retrofit translations there plus shared components like `ChatInput`, `DNSLogViewer`, and `Form`-based sections. `project-rules/astgrep-liquid-glass.yml` defines ast-grep config, but no git hook currently runs `npm run lint:ast-grep`.

## Plan of Work

First, inventory every user-facing string across `src/navigation/screens`, `src/components/ChatInput.tsx`, `src/components/DNSLogViewer.tsx`, and any Alerts. Design a translation map under `screen.<name>` and `components.<name>` so both locales can mirror keys; extend `en-US.ts` / `pt-BR.ts` accordingly. Next, harden locale plumbing: in `settingsStorage.ts` ensure `resolveLocale` remains central, and update `SettingsContext.updateLocale` to validate inputs, store `null` for system default, and expose helper labels for UI. Add Jest coverage (new `__tests__/i18n.locale.spec.ts`) for `resolveLocale`, translator fallback, and migrations, plus extend `settings.migration.spec.ts` for locale sanitization.

Then implement language selectors. For classic `Settings.tsx`, insert a new section near the top with radio-style options: "Device Language" (null), `availableLocales` entries sourced from context, and a subtitle describing the active system locale (use `resolveLocale`). Mirror the experience in `GlassSettings.tsx` by adding a `Form.Section` with `Form.Item`s (or a sheet) that call `updateLocale`. Both screens should render status pills (current selection) and disable controls while `loading`. Create `__tests__/settings.language-toggle.spec.tsx` to mock `useSettings`, render the screen, and assert the correct `updateLocale` argument for each touch handler. For `GlassSettings`, stub `Form` components similarly and verify the new section surfaces the expected title/subtitle.

Next, update every screen/component to call `useTranslation` and replace literals with `t(...)`. `Chat.tsx` should source alert titles/buttons plus chat input placeholder from translations; `ChatInput` should accept translated placeholder/accessibility props. `ChatList` and `GlassChatList` require translated headers, empty states, and action labels. `Logs` and `DNSLogViewer` need translated empty states, section titles, action labels, and Alert copy. Simplify `Home`, `Profile`, and `NotFound` using translation keys even if these screens are mostly scaffolding. Rebalance About.tsx to add a prominent quick-action `Form.Item` (or header CTA) for Settings directly under the hero card, guaranteeing the button appears irrespective of translation order. While editing, keep typography/palette intact per `docs/SETTINGS.md` guidance.

Finally, integrate ast-grep enforcement by creating `scripts/install-git-hooks.js` (or similar) that writes `.git/hooks/pre-commit` to run `npm run lint:ast-grep`. Add an npm `prepare` script so hooking installs automatically, and document (in final summary) how to reinstall hooks without touching markdown outside planning. Update `package.json` scripts accordingly. Validate by running `npm run lint:ast-grep` and ensuring a failing rule blocks commits.

## Concrete Steps

Run commands from repo root via `tmux -c` invocations:

1. `tmux -c "npm run lint:ast-grep"` to ensure baseline passes before edits; expect existing rules to succeed.
2. After expanding translations and locale helpers, run `tmux -c "npm test -- settings.migration.spec.ts"` plus the new locale spec to verify logic.
3. Once language selectors ship, execute `tmux -c "npm test -- settings.language-toggle.spec.tsx"` to cover UI handlers.
4. Before final handoff, run full suite `tmux -c "npm test"` and `tmux -c "npm run lint:ast-grep"` to confirm stability.

Record representative output snippets (pass/fail) in Artifacts once available.

## Validation and Acceptance

Acceptance requires: (a) toggling between en-US, pt-BR, and device default updates `useSettings().locale` immediately and persists through reload (validated via tests plus manual toggle). (b) All screens show translated text per selection (spot-check Chat placeholder, ChatList empty state, Logs action labels). (c) The About page presents a visible Settings CTA that opens the modal. (d) `npm test` and `npm run lint:ast-grep` pass, and attempting `git commit` with an ast-grep violation fails due to the new pre-commit hook.

## Idempotence and Recovery

Translation edits are pure data: rerunning the scripts or reinstalling hooks is safe. The locale toggle writes to AsyncStorage; if corrupted, delete the `@chat_dns_settings` key (document during testing). The git hook installer should overwrite hooks deterministically so reruns cleanly re-install. If a migration fails, revert affected files (no destructive git commands per repo rules) and re-run targeted tests.

## Artifacts and Notes

To be populated with: translation diff summary, screenshots/console logs from locale tests, and sample `git commit` failure output when ast-grep trips. Keep snippets concise (<=10 lines) and redact private data.

## Interfaces and Dependencies

Key interfaces: `SupportedLocale` in `src/i18n/translations.ts`, `useSettings` contract exposing `locale`, `preferredLocale`, `systemLocale`, and mutators, plus `Form` components from `src/components/glass/GlassForm.tsx`. New UI should reuse existing `LiquidGlassWrapper` props and avoid introducing external libraries. Alerts remain from `react-native`. Tests rely on `jest` + `react-test-renderer`, mirroring existing specs. Ensure `scripts/install-git-hooks.js` uses Node FS APIs so no extra deps are needed.

Revision 2025-10-25 22:05Z: Initial plan drafted for bilingual toggle + ast-grep hook scope.
