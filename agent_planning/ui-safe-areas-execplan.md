# UI Safe Areas & Palette ExecPlan

## Purpose
- audit every screen (Chat, ChatList, GlassChatList, Logs, DevLogs, About, Settings, GlassSettings, Home, Profile, NotFound) for safe area usage, runtime theme compliance, i18n coverage, and iMessage palette fidelity.
- ensure Settings reachable from About with obvious button.
- wire runtime dark/light toggle path (from Settings context) to screens.

## Constraints & Inputs
- obey `LiquidGlassWrapper` palette definitions.
- respect existing dirty tree without reverting.
- use existing i18n infrastructure (`src/i18n/translations.ts`, translation tables).
- leverage `react-native-safe-area-context` / `react-native-edge-to-edge`.
- tests after each feature.

## Step Plan
- [x] Inventory current safe area + theming for each screen, note gaps.
- [x] Design shared screen wrapper (safe area aware, palette aware, background fill).
- [ ] Patch screens incrementally (Chat/ChatList family → Logs/DevLogs → About/Settings/GlassSettings → Home/Profile/NotFound).
- [ ] Integrate Settings CTA in About linking to Settings modal.
- [ ] Ensure i18n strings centralised (create translations map, wire hooks).
- [ ] Verify runtime theme toggle flows (Settings context watchers) and apply to UI.
- [ ] Tests: add unit coverage for new layout wrapper + i18n mapping (per step).
- [ ] Manual QA checklist -> update summary.

## Validation
- Jest suite passing.
- Visual smoke via story/test placeholders (if available).
- Confirm Settings CTA works in navigation (unit or integration).

## Notes
- Keep palette constants centralized.
- Avoid markdown outside planning per repo rules.
