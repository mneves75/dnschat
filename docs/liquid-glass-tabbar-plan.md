# Liquid Glass Tab Bar Recovery Plan

_Date:_ September 30, 2025

## Context & Findings
- The iOS tab bar currently renders without any blur because the React wrapper only enables the native `UIVisualEffectView` when the platform reports iOS 26 or newer.
- Current devices (iOS 17/18) never meet that guard, so we always fall back to the plain `View` implementation with opaque colors.
- `app/(app)/(tabs)/_layout.tsx` passes a `blurIntensity` prop that neither TypeScript nor the native view understand, leading to runtime warnings and preventing the intended glass effect from mounting cleanly.
- Capability detection (`src/utils/liquidGlass.ts`) and the native module both claim basic glass support is unavailable before iOS 26, contradicting real UIKit behaviour.

## Goals
1. Deliver a functioning blur-backed tab bar on current iOS releases while keeping room for future iOS 26+ enhancements.
2. Align TypeScript, native iOS code, and capability detection so "supported" means "we can render a native blur", while advanced SwiftUI-only affordances remain feature-flagged.
3. Eliminate invalid props/usages and add regression coverage to guard the behaviour matrix.

## TODO
- [x] Reclassify capability detection so iOS 13+ reports `isSupported: true` for baseline blur, while preserving an explicit `supportsSwiftUIGlass` flag for 26+ only.
- [x] Update the iOS native module/view manager to expose the revised capability payload and allow the native view on all glass-capable versions.
- [x] Refine `LiquidGlassWrapper` and tab layout usage: drop invalid props, forward configuration correctly, and rely on the new capability flags; add/adjust automated tests to lock the expectations in.

## Verification
- Run the focused Jest suite (`npm test -- liquidGlass`) after adjustments.
- Attempt a TypeScript pass (`npm run typecheck`) to surface regressions (project currently reports missing `expo-router/entry` types in this environment).
