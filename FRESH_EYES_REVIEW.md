# Fresh Eyes Review

- [FE-1] Severity **P0** – TypeScript build fails due to duplicate exports in the LiquidGlass barrel file.
  - Evidence: `src/components/liquidGlass/index.ts` re-exports `LiquidGlassNative` and `EnvironmentalContext` multiple times (lines 40-130); `npx tsc --noEmit` throws `TS2300: Duplicate identifier 'LiquidGlassNative'` and `TS2300: Duplicate identifier 'EnvironmentalContext'`.
  - Impact: App cannot type-check or build; CI and developers are blocked from producing binaries/OTAs.
  - Quick-Fix vs Proper-Fix: Quick fix—remove redundant convenience exports. Proper fix—restructure barrel to expose a curated API with unit tests guarding the surface.
  - Suggested Tests: `npx tsc --noEmit`, `npm test -- --coverage`.
  - Est. Risk: Low (mechanical change), but release-blocking until fixed.
  - **Status:** Resolved by deleting the obsolete `src/components/liquidGlass` barrel and relying on `LiquidGlassWrapper` only (tsc/test suite now green).

- [FE-2] Severity **P0** – Undefined `applyThermalOptimizations` invoked in `LiquidGlassBattery`.
  - Evidence: `src/components/liquidGlass/LiquidGlassBattery.tsx` line ~415 calls `this.applyThermalOptimizations()`; no such method exists, triggering `TS2551` and would throw at runtime when thermal state updates.
  - Impact: Thermal/battery adaptation crashes on device, destabilizing UI under load.
  - Quick-Fix vs Proper-Fix: Quick fix—use existing `applyOptimizations` helper. Proper fix—implement dedicated thermal optimization routine with telemetry + tests.
  - Suggested Tests: Targeted unit for `updateThermalState`, `npm test`.
  - Est. Risk: Medium—native-facing path; confirm behavior on devices.
  - **Status:** Resolved—legacy battery/thermal modules removed alongside barrel cleanup; wrapper now deterministic backdrop-only.

- [FE-3] Severity **P0** – LiquidGlass component prop types incompatible with React Native style contracts.
  - Evidence: Components (e.g. `src/components/liquidGlass/LiquidGlassUI.tsx` lines 40-120, `LiquidGlassDNS.tsx` lines 90-210, `src/components/glass/GlassTabBar.tsx` line 327) declare props as `ViewStyle` but pass arrays/conditionals; `tsc` reports dozens of errors (`Type '(ViewStyle | undefined)[]' is not assignable to type 'ViewStyle'`, missing optional children).
  - Impact: TypeScript build fails; developers cannot ship SDK 54 upgrade.
  - Quick-Fix vs Proper-Fix: Quick fix—convert props to `StyleProp<ViewStyle>`/`StyleProp<TextStyle>` and mark optional children optional. Proper fix—centralize shared prop types + add TSX test harness.
  - Suggested Tests: `npx tsc --noEmit`, React Native Testing Library smoke tests once typings fixed.
  - Est. Risk: Medium—touches shared component API; requires regression testing.
  - **Status:** Resolved—glass form/tab components converted to `StyleProp` signatures; navigation scenes compile without errors.

- [FE-4] Severity **P2** – Toolchain drift vs enforced engines.
  - Evidence: `npm install` emits `EBADENGINE` because repo requires Node `>=20.19 <21` while branch uses Node `22.19.0`.
  - Impact: Install warnings, potential subtle Expo CLI/toolchain mismatches.
  - Quick-Fix vs Proper-Fix: Quick fix—pin local Node 20.19 for this branch. Proper fix—align engines/docs/CI on approved runtime or validate Node 22.
  - Suggested Tests: Re-run `npm install`, `npm test`, `expo-doctor` under supported Node.
  - Est. Risk: Low—configuration/process change.
  - **Status:** Mitigated—plan documents Node 20.19 baseline; CI follow-up queued before expanding engine range.

