# Phase 0: Liquid Glass UI Foundation

**Status**: ✅ Complete
**Date**: September 30, 2025
**Part of**: [Liquid Glass UI Redesign Plan](./ui-liquid-glass-redesign-plan.md)

## Overview

Phase 0 establishes the foundational hooks, design tokens, and capability detection system for the Liquid Glass UI redesign. This phase creates a unified API that bridges Expo's theme system with iOS 26 Liquid Glass materials while maintaining graceful cross-platform fallbacks.

## Deliverables

### 1. ✅ Capability Detection Audit

**Location**: `src/utils/liquidGlass.ts`, `src/components/glass/GlassCapabilityBridge.ts`

**Findings**:
- **Three-tier detection system** already in place:
  1. `LiquidGlassDetector` singleton provides comprehensive capability analysis
  2. `useLiquidGlassAvailability()` hook exposes version detection (ios26/ios17/fallback)
  3. `useLiquidGlassCapabilities()` provides detailed feature flags and performance tiers

- **Performance characteristics**:
  - Memoized detection with lazy evaluation
  - Device-family-aware optimization (iPhone/iPad/Mac)
  - Thermal and memory profile guidance

- **Version thresholds**:
  - iOS 26+: Full Liquid Glass with sensor awareness and dynamic intensity
  - iOS 17-25: High-quality blur with limited dynamic features
  - iOS 13-16: Basic UIBlurEffect without advanced affordances
  - Non-iOS: Graceful fallback to solid surfaces

**Decision**: Keep existing detection system; extend with new unified theme hook.

---

### 2. ✅ Unified useGlassTheme() Hook

**Location**: `src/hooks/useGlassTheme.ts`

**Purpose**: Single source of truth for glass-aware design tokens and styling.

**API**:

```typescript
const { colors, glass, materials, getGlassStyle, shouldUseGlass } = useGlassTheme();
```

**Capabilities**:

#### a) Material Parameters
Three iOS 26-aligned variants with precise tint/shadow/blur values:
- **`regular`**: Standard glass surfaces (chat cards, list items)
- **`prominent`**: High-contrast glass (headers, important containers)
- **`interactive`**: Touch-responsive glass (buttons, controls)

Each material includes:
- `tintColor`: RGBA background with proper opacity
- `borderColor`: Platform-aware edge definition
- `shadow`: Complete shadow parameters (color, offset, opacity, radius)
- `blurRadius`: CSS pixel value for fallback blur
- `containerSpacing`: Merge distance for glass effect union

#### b) Glass Capabilities
Consolidated capability information:
- `available`: Whether any glass effects are supported
- `supportsLiquidGlass`: iOS 26+ specifically
- `supportsStandardGlass`: iOS 17-25 blur effects
- `isFallback`: Platform fallback mode (Android/Web)
- `version`: `"ios26" | "ios17" | "fallback"`
- `loading`: Capability detection in progress

#### c) Style Generation
`getGlassStyle(containerType, material?, shape?)` returns platform-appropriate `ViewStyle`:

**Container Types**:
- `container`: General-purpose glass wrapper
- `card`: List items, content cards
- `button`: Interactive controls
- `navbar`: Top navigation bar
- `tabbar`: Bottom tab bar
- `sheet`: Modal bottom sheet

**Shapes**:
- `capsule`: Fully rounded (buttons, pills)
- `roundedRect`: Modern corners (cards, containers)
- `rect`: Sharp edges (full-width bars)

**Automatic Fallbacks**:
- iOS 26+: Native Liquid Glass materials
- iOS 17-25: Standard blur with reduced effects
- Android/Web: Solid surfaces with elevation

#### d) Convenience Helpers
- `shouldUseGlass()`: Boolean check respecting platform, capability, and loading state
- `useGlassCapabilities()`: Direct access to capability object
- `useGlassMaterials()`: Direct access to material parameters
- `useGlassStyle()`: Direct access to style generator function

---

### 3. ✅ Design Token Integration

**Current State**: `src/theme/AppThemeContext.tsx`

**Changes Made**:
- Existing theme provides baseline colors (light/dark mode)
- `useGlassTheme()` extends theme with iOS 26 material parameters
- No breaking changes to existing theme API

**Integration Pattern**:
```typescript
// Old approach (still works)
const theme = useAppTheme();
const cardStyle = { backgroundColor: theme.colors.card };

// New approach (glass-aware)
const { colors, getGlassStyle } = useGlassTheme();
const cardStyle = getGlassStyle('card', 'regular', 'roundedRect');
```

Components can adopt the new hook incrementally without disrupting existing code.

---

### 4. ✅ Fallback Strategy

**Cross-Platform Behavior**:

| Platform | Glass Available? | Behavior |
|----------|-----------------|----------|
| iOS 26+ | Yes (Liquid Glass) | Full native glass with sensor awareness, dynamic intensity, and environmental cues |
| iOS 17-25 | Yes (Standard Blur) | High-quality UIBlurEffect with static parameters, no sensor integration |
| iOS 13-16 | Limited (Basic Blur) | Basic UIBlurEffect, conservative performance settings |
| Android | No | Solid `colors.card` surface with elevation shadows |
| Web | No | Solid `colors.card` surface with CSS shadows |

**Accessibility**:
- Respects iOS "Reduce Transparency" setting via existing capability detection
- Falls back to solid surfaces when accessibility mode is active
- Maintains contrast ratios per Apple HIG

**Performance Guardrails**:
- Maximum glass elements per performance tier (5-50 depending on device)
- Automatic intensity reduction on low-memory devices
- Thermal guidance (aggressive/moderate/conservative)

**Dark Mode**:
- Separate material parameters for light and dark themes
- Automatic tint adjustment based on `useAppTheme().isDark`
- iOS 26+ gets enhanced shadows in dark mode

---

## Performance Baseline

**Target**: <250 MB memory, <3 frame drops per interaction, 60fps animations

**Current Measurements**: ⏳ Deferred to Phase 1 (tab rebuild)

**Rationale**: Accurate performance baseline requires glass components in production use. Will measure during Chats tab rebuild (Phase 1) with real-world glass containers and interactions.

**Planned Instrumentation** (Phase 1):
- React Native Performance API integration
- Frame drop counting during glass animations
- Memory pressure monitoring with glass element count
- iOS Instruments trace for Metal shader acceleration

---

## Open Questions / Future Work

1. **Testing Strategy**:
   - Hook requires `@testing-library/react-native` for proper integration tests
   - Current test infrastructure doesn't support React hooks
   - **Action**: Add testing library in future sprint, write comprehensive hook tests

2. **Performance Budget Validation**:
   - Baseline measurements deferred to Phase 1 (Chats tab rebuild)
   - Will establish frame-drop threshold and memory limits with real components

3. **Material Parameter Tuning**:
   - Current values based on Apple design docs and visual inspection
   - May require adjustment after real device testing on iPhone 16 Pro with iOS 26

4. **Sensor Integration**:
   - Capability detection supports sensor-aware glass (iOS 26+)
   - Native module implementation required for ambient light and proximity detection
   - **Defer to Phase 2** (after navigation refactor)

---

## Migration Guide for Existing Components

### Before (direct theme usage):
```typescript
const theme = useAppTheme();
<View style={{
  backgroundColor: theme.colors.card,
  borderRadius: 12,
  borderColor: theme.colors.border,
  borderWidth: 1,
}} />
```

### After (glass-aware):
```typescript
const { getGlassStyle } = useGlassTheme();
<View style={getGlassStyle('card', 'regular', 'roundedRect')} />
```

**Benefits**:
- Automatic iOS 26 glass effects when available
- Graceful fallback to solid surfaces on other platforms
- Consistent material parameters across the app
- Single source of truth for glass styling

---

## Next Steps: Phase 1 (Week 2)

1. **Rebuild Chats tab** using `useGlassTheme()`:
   - Wrap `FlashList` in glass container
   - Convert chat cards to glass surfaces
   - Add interactive glass for actions

2. **Measure performance baseline**:
   - Instrument frame drops and memory usage
   - Validate against <250 MB, <3 drops thresholds

3. **Refactor navigation**:
   - Apply glass to tab bar and headers
   - Align with Expo Router v6 native tabs

---

## References

- [Liquid Glass UI Redesign Plan](./ui-liquid-glass-redesign-plan.md)
- [iOS 26 Liquid Glass Patterns](./apple/liquid-glass/patterns.md)
- [iOS 26 Liquid Glass Overview](./apple/liquid-glass/overview.md)
- [Expo SDK 54 Dev Guides](./EXPO_REACT_NATIVE_DOCS/expo-dev-guides.md)
- [React Native Next Documentation](./EXPO_REACT_NATIVE_DOCS/reactnative.dev-docs-next.md)
