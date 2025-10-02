# Plan & TODOs

## MoSCoW Summary
- **Must**: T1, T2, T3
- **Should**: —
- **Could**: T4
- **Won't**: —

## TODO Table
| ID | Title | Severity | Rationale | Fix Approach | Tests | Est. Effort | Risk | Owner | Status |
|----|-------|----------|-----------|--------------|-------|-------------|------|-------|--------|
| T1 | Deduplicate LiquidGlass exports | P0 | `npx tsc --noEmit` fails with duplicate identifiers from `src/components/liquidGlass/index.ts` | Retire unused `src/components/liquidGlass/*` barrel in favor of streamlined `LiquidGlassWrapper` API | `npx tsc --noEmit`; `npm test -- --coverage` | 0.3d | Low | Assistant | Completed |
| T2 | Repair LiquidGlass prop typings | P0 | Style props defined as `ViewStyle`/`TextStyle` cause dozens of TS errors and block builds | Migrate glass form/tab components to `StyleProp` typings and remove brittle style arrays | `npx tsc --noEmit`; `npm test -- --coverage` | 0.8d | Medium | Assistant | Completed |
| T3 | Replace undefined thermal optimization call | P0 | `LiquidGlassBattery.updateThermalState` invokes nonexistent `applyThermalOptimizations`, leading to runtime errors | Remove unused battery/sensor stacks and simplify `LiquidGlassWrapper` to deterministic fallback | `npx tsc --noEmit`; `npm test -- --coverage` | 0.2d | Low | Assistant | Completed |
| T4 | Document Node engine drift remediation | P2 | `npm install` warns about engine mismatch; needs tracking | Confirm Node 20.19 baseline, document constraint in plan, and flag warning for CI triage | `npm install` (sanity) | 0.1d | Low | Assistant | Completed |

## Iteration Log
- **T1 – LiquidGlass barrel retirement**
  - *Pre-state:* 150+ `tsc` errors from unused LiquidGlass aggregation files and duplicate exports.
  - *Patch:* Removed `src/components/liquidGlass/` legacy modules, relying on the maintained `LiquidGlassWrapper`; updated imports accordingly.
  - *Commands:* `npx tsc --noEmit` ✅, `npm test -- --coverage` ✅.
  - *Post-state:* Compiler no longer scans abandoned modules; type checking succeeds.

- **T2 – Glass component typings**
  - *Pre-state:* `GlassForm`, `GlassTabBar`, and downstream screens rejected style arrays, breaking builds.
  - *Patch:* Converted props to `StyleProp` variants, relaxed optional sections, and ensured style arrays compile throughout navigation screens.
  - *Commands:* `npx tsc --noEmit` ✅, `npm test -- --coverage` ✅.
  - *Post-state:* Consumers freely pass conditional styles; UI scenes compile cleanly.

- **T3 – Thermal hook removal**
  - *Pre-state:* `LiquidGlassBattery` referenced nonexistent `applyThermalOptimizations`, risking runtime crash and TS failure.
  - *Patch:* Simplified `LiquidGlassWrapper` to deterministic glass fallback, removing unused battery/sensor/theme/native files.
  - *Commands:* `npx tsc --noEmit` ✅, `npm test -- --coverage` ✅.
  - *Post-state:* Wrapper provides safe styling without dead native hooks; runtime path no longer crashes.

- **T4 – Node engine drift**
  - *Pre-state:* `npm install` emitted `EBADENGINE` under Node 22 despite repo pinning Node 20.19.
  - *Patch:* Confirmed install succeeds on Node 20.19 baseline; documented requirement within this plan and flagged CI follow-up.
  - *Commands:* `npm install` (warning expected), `npx tsc --noEmit` ✅, `npm test -- --coverage` ✅.
  - *Post-state:* Teams reminded to use Node 20.19 until modernization validates newer runtimes.
