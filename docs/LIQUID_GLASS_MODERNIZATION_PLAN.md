# Liquid Glass + Chat UI Modernization Plan (Expo SDK 54)
Date: September 28, 2025

## Executive Summary
- Goal: align DNSChat’s glass surfaces and chat flows with Expo SDK 54 primitives so the UI matches Apple’s iOS 26 liquid glass language while remaining performant on earlier OS versions.
- Strategy: replace bespoke wrappers with `expo-glass-effect` components, move tab scaffolding to Expo Router v6 native tabs, and rebuild chat surfaces on `@expo/ui` foundations.
- Outcomes: deterministic capabilities detection, removal of require cycles, consistent glass visuals on the tab bar and chat surfaces, and audited documentation for John Carmack’s review packet.

## Current State Assessment
- **Custom wrappers dominate glass rendering** (`src/components/LiquidGlassWrapper.tsx`, `src/components/liquidGlass/*`): heavy manual capability detection, custom blur fallbacks, and a require cycle between wrapper/native modules.
- **Capability flags never go true in dev** (`src/utils/liquidGlass.ts`): simulator builds report `supportsSwiftUIGlass: false`, so tab and header backgrounds fall back to opaque views.
- **Tab bar uses generic `Tabs` background slot** (`app/(app)/(tabs)/_layout.tsx`): relies on `LiquidGlassWrapper` but never instantiates a real glass surface, so users only see transparent backgrounds.
- **Chat screens compose manual glass containers** (`src/screens/GlassChatList.tsx`, `src/components/glass/GlassTabBar.tsx`): recreates interactions that Expo UI now provides with native focus and haptics.
- **Docs and CHANGELOG lack modernization narrative** (`docs/README.md`, `CHANGELOG.md`): no traceability for upcoming SDK 54 glass adoption.

## Alignment Targets from Expo SDK 54
1. `GlassView` / `GlassContainer` from `expo-glass-effect` deliver native iOS 26 visuals with built-in fallbacks and availability checks.
2. Expo Router v6 native tabs expose `Tabs.Screen` presets with glass-friendly headers, background containers, and performance optimizations.
3. `@expo/ui` beta provides glass-ready cards, lists, and bottom sheets for chat surfaces; pairing with `GlassView` avoids bespoke styling.
4. Capability detection should delegate to `isLiquidGlassAvailable()` and runtime `GlassView` fallbacks instead of custom detectors.

## Phased Roadmap
### Phase 0 — Foundations (Week 1)
- Audit current glass modules, remove unused exports, and break the `LiquidGlassWrapper` ↔ `LiquidGlassNative` require cycle.
- Instrument capability logging via `console.info` and add a storybook-style screen to visualize glass states across devices.
- Exit criteria: `npm run typecheck` passes; Metro reload no longer triggers `property is not configurable` errors.

### Phase 1 — Adopt `expo-glass-effect` (Weeks 2–3)
- Install `expo-glass-effect` and migrate existing wrappers to thin `GlassView` adapters with shared props.
- Replace manual capability detector with `isLiquidGlassAvailable()` and keep lightweight platform guards only for analytics.
- Implement glass tab/background surfaces using `GlassContainer` for grouped regions, ensuring interactive props respect SDK warnings.
- Exit criteria: On iOS 26 simulator/device the tab bar shows native glass; on unsupported platforms fallback surfaces still render shadow/tint.

### Phase 2 — Navigation Modernization (Week 3)
- Switch to Expo Router native tabs configuration, using `tabs.native` router entry for glass-friendly headers and animations.
- Delete custom `GlassTabBar` once native tabs provide consistent styling; move bespoke badges/icons into router slot renders.
- Exit criteria: Tab navigation uses Router v6 native tabs, no warnings about missing default exports, and the glass effect applies consistently across pushes/modals.

### Phase 3 — Chat Surface Refresh (Weeks 4–5)
- Rebuild list items and modals with `@expo/ui` primitives (Cards, Sheets, Inputs) layered atop `GlassView` backgrounds.
- Add accessibility toggles (respect reduced transparency) and ensure haptics route through Expo UI’s interaction APIs.
- Exit criteria: Chat list, detail, and sheet screens pass manual QA with glass enabled/disabled, and design tokens live under a shared theme.

### Phase 4 — QA, Documentation, and Delivery (Week 5)
- Add Jest/Playwright coverage for capability toggles and snapshot the tab bar with/without glass.
- Update `docs/README.md`, `docs/TECH-FAQ.md`, and `CHANGELOG.md` with modernization summary, test evidence, and rollout checklist.
- Prepare PR description for Carmack review including simulator screenshots and capability matrices.

## Dependencies & Risks
- `expo-glass-effect` currently supports iOS 26+ only; older devices will depend on fallback styling.
- Interactive glass props are not dynamically toggleable; components needing live intensity changes must remount.
- Native tabs require Expo Router v6 adoption; ensure navigation variants (dev tools tab, feature flags) migrate.

## Success Metrics
- Capability logs show `isLiquidGlassAvailable() === true` on iOS 26 hardware.
- Tab bar and headers demonstrate measurable translucency (visual QA + screenshot diffs).
- No Metro warnings about missing default exports or require cycles in glass modules.
- Docs and CHANGELOG include dated entries describing glass modernization scope, rollout status, and testing evidence.

## Testing Strategy
- Unit: reducers/hooks affected by new capability plumbing.
- Integration: Expo Router navigation tests to confirm glass surfaces mount during tab transitions.
- Visual: Playwright screenshot suite for glass-enabled tab bar and chat cards.
- Manual: QA checklist for accessibility (Reduce Transparency), low-power mode, and sensor toggles.

## Why the Tab Bar Lacks Liquid Glass Today
- Capability detector reports `supportsSwiftUIGlass: false`, so `_layout.tsx` never enables native glass.
- The fallback wrapper renders a transparent `View` without blur, leaving tabs visually flat.
- Native module exports remain empty at runtime, so even when the wrapper requests capabilities it cannot load `LiquidGlassNative` methods.
- Adopting `GlassView` + native tabs ensures the bar renders a real blur/tint when the OS supports it and gracefully degrades otherwise.
