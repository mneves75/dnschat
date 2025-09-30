# DNSChat UI Liquid Glass Redesign Plan
Date: September 30, 2025

## Source References
- `docs/EXPO_REACT_NATIVE_DOCS/expo-dev-guides.md`: Latest Expo Router, local build, and development workflow guidance for Expo SDK 54.
- `docs/EXPO_REACT_NATIVE_DOCS/eactnative.dev-docs-next.md`: React Native Next documentation covering Fabric defaults, new architecture components, and modern UI primitives.
- `docs/apple/liquid-glass/overview.md` & `docs/apple/liquid-glass/patterns.md`: iOS 26 Liquid Glass concepts, variants, container usage, and interaction patterns.
- `docs/liquid-glass-tabbar-plan.md` & `docs/LIQUID_GLASS_MODERNIZATION_PLAN_V2.md`: Existing modernization context and capability detection decisions to carry forward.

## Guiding Principles
- Lean on Expo Router group layouts, native tabs, and Expo CLI workflow updates (per Expo guides) to keep navigation declarative and bundle-aware.
- Adopt React Native "Next"/Fabric defaults: component-level theming via hooks, automatic batching, Pressable over Touchable*, and FlashList/SectionList for virtualized glass content.
- Treat Liquid Glass as a first-class design system element: wrap glass regions in containers, vary tint/variant by interaction state, support merge animations, and honor accessibility toggles for reduced transparency.
- Preserve cross-platform parity by layering graceful degradations (regular surfaces on Android/Web) while exercising native glass on iOS 17+ and Liquid Glass extensions on iOS 26.
- Maintain testability: Collocate screen-level tests, use story-driven docs for each tab, and include visual diff baselines for glass states.

## Core Workstreams
1. **Experience System**
   - Promote design tokens into a `useGlassTheme()` hook that mediates Expo theme + iOS 26 material parameters.
   - Replace custom wrappers with the canonical `GlassContainer`/`GlassView` APIs where possible, keeping UniversalGlassView only for cross-platform fallbacks.
   - Introduce interaction presets (rest, hover, pressed) using `.interactive` variants and haptics tied to the Liquid Glass patterns doc.
2. **Navigation & Layout**
   - Restructure `(app)` group to leverage Expo Router v6 native tab layout and header slots, aligning with expo-dev-guides recommendations (preload critical routes, use `Tabs.Screen` options for native transitions).
   - Normalize modal experiences (`/settings`, `/chat/[id]`) to use shared glass headers and container-based sheet presentations.
3. **Data & Observability**
   - Audit context/providers to ensure concurrent rendering safety (React Native Next guidance) and memoize expensive selectors.
   - Instrument FPS and memory during glass-heavy interactions; set acceptance thresholds for each tab.

## Tab UI Redesign Strategy
### 1. Chats Tab (`app/(app)/(tabs)/index.tsx` → `GlassChatList`)
- **Structure**: Rebuild the list with `FlashList` (Expo recommends for large lists) to minimize layout thrash inside glass containers. Provide adaptive grid layout on iPadOS using responsive breakpoints.
- **Glass Treatment**: Wrap the list in a `GlassEffectContainer` with `spacing` tuned from Apple patterns doc; individual chats become `GlassView` cards with variant escalation (`regular` at rest, `.interactive` on hover/press) and merge animations on pull-to-refresh.
- **Empty/Loading**: Add Liquid Glass-based placeholders (skeleton shimmer using `.glassEffectUnion`) and adopt Expo Router skeleton route transitions to keep navigation fluid.
- **Actions**: Convert the bottom sheet to Expo's Sheet primitive once available; ensure long-press uses haptics + interactive tinting defined in the patterns doc.
- **Testing**: Snapshot FlashList states, add detox/Playwright flows for iOS 26 to verify glass merges, and run `node test-dns-simple.js` between UI iterations to guard service health.

### 2. Logs Tab (`app/(app)/(tabs)/logs.tsx` → `Logs` screen)
- **Structure**: Split into two sections: active session stream and historical archive. Use Expo Router segments for detail modals rather than expanding cards inline.
- **Glass Treatment**: Promote the log stack into a vertical `GlassContainer` with group IDs for Query vs Entry cards (per patterns.md `glassEffectUnion`). Highlight active queries with `.interactive` tint and animated status pulses using the pulse animation pattern.
- **Data Visualization**: Introduce a timeline ribbon (Liquid Glass `capsule` badges) and aggregated stats row pinned under the header using native tab large titles.
- **Controls**: Replace Alert-based destructive actions with a glass action sheet using Expo UI's `ActionSheet` once stabilized; integrate filter/sort segmented control styled via `.buttonStyle(.glass)` equivalence.
- **Testing**: Add Jest unit coverage for expanded state reducers and an integration test ensuring reduced-transparency mode swaps glass for solid surfaces.

### 3. About Tab (`app/(app)/(tabs)/about.tsx` → `About` screen)
- **Structure**: Convert to scrollable story built from modular sections (Mission, Credits, Tech stack) sourced from localized markdown to honor Expo docs guidance on content separation.
- **Glass Treatment**: Use `GlassContainer` with progressive blurs, pinned hero header using `.prominent` variant and morphing transition when scrolling (morph pattern from patterns.md).
- **Interactions**: Replace `Linking.openURL` calls with Expo Router external link hooks for analytics. Add share sheet and contact CTAs with glass button styles.
- **Accessibility**: Provide voiceover-friendly order, supply large dynamic type layout, and ensure contrast meets Apple's spec when tinting glass.
- **Testing**: Snapshot hero transitions, run accessibility audits via `@react-native-community/cli doctor --accessibility` once available.

### 4. Dev Logs Tab (`app/(app)/(tabs)/dev-logs.tsx` → `DevLogs` screen)
- **Structure**: Gate behind build flag but modernize layout with split view: control plane (glass toolbar) and log stream (FlashList + collapsible sections) per Expo dev-tools best practices.
- **Glass Treatment**: Apply minimal glass to avoid performance overhead; use `.regular` for telemetry cards and `.interactive` for toggles. Keep fallback non-glass surfaces when `supportsSwiftUIGlass` is false.
- **Tooling Hooks**: Embed quick links to `glass-debug` route and new diagnostics (FPS overlay). Surface instrumentation toggles via `GlassButtonGroup` applying Apple toolbar guidance.
- **Testing**: Add E2E smoke in development builds verifying navigation guard, and unit tests for capability toggles.

## Cross-Cutting Enhancements
- **Header & Tab Bar**: Finalize Liquid Glass header/tab bar implementation using `GlassContainer` wrappers, ensure merge transitions synced with scroll behavior, and align with `docs/liquid-glass-tabbar-plan.md` decisions.
- **Settings Modal**: Extend plan to include glass-backed segmented controls, dynamic previews, and Expo `useLocalSearchParams` for quick glass toggles.
- **Localization**: Expand `useLocalization` dictionary for new UI copy; add screenshot localization tests.
- **Performance Budget**: Define frame-drop threshold (<3 frames per interaction) and memory < 250 MB on iPhone 15 in iOS 26 simulator.

## Execution Timeline
1. **Phase 0 (Week 1)** – Foundation: finalize capability hooks, design tokens, audit performance baselines, align with Expo CLI workflow.
2. **Phase 1 (Week 2)** – Chats tab rebuild + navigation refactor.
3. **Phase 2 (Week 3)** – Logs tab modernization + telemetry enhancements.
4. **Phase 3 (Week 4)** – About + Dev tools reshaping, finalize shared components.
5. **Phase 4 (Week 5)** – QA, accessibility passes, visual diff suite, documentation updates.

## Validation Checklist
- Expo Router integration smoke tested via `npm run ios` and `npm run android` with dev client.
- Jest + typecheck clean; add targeted tests for new glass utilities.
- Visual diff snapshots across light/dark, glass on/off.
- Accessibility verification: reduced transparency, VoiceOver/Screen Reader path.
- Release readiness: update `CHANGELOG.md`, attach screenshots, run `npm run sync-versions:dry` before PR.

## Open Questions
- Confirm availability of Expo `FlashList` in stable SDK 54 channel; otherwise plan for migration.
- Determine analytics requirements for new About tab CTAs.
- Decide if Dev Logs tab remains shipped in production builds with hidden flag or moves to dedicated dev menu.
