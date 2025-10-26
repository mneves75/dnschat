# DNSChat v3.0.1 Release Notes

## 🔧 Settings Simplification & DNS Architecture Cleanup

DNSChat v3.0.1 removes non-functional DNS-over-HTTPS and simplifies settings to a clean, automatic fallback chain!

### What's New

**Settings Schema v3** - Simplified DNS configuration!
- **Automatic Fallback Chain**: Single Native→UDP→TCP fallback replaces complex method preferences
- **Experimental Transports Enabled**: UDP/TCP fallbacks now enabled by default for maximum reliability
- **Migration**: All v2 settings automatically upgraded to v3 with comprehensive test coverage

**Documentation Enhancements** - React best practices!
- **React Best Practices Section**: Complete guide on when NOT to use useEffect
- **Deriving State**: Compute values during render instead of synchronizing with effects
- **Event Handlers vs Effects**: Clear guidance on when to use each
- **React 19.1 Guidance**: React Compiler auto-memoization patterns

### What Changed

**Settings UI** - Cleaner, simpler interface!
- **App Behavior Section**: Replaced complex "DNS Method" preferences with simple toggles
- **Mock DNS Toggle**: Development feature now visible for testing
- **Haptics Toggle**: Moved to App Behavior section for better organization
- **Transport Tests**: Reduced from 4 buttons (Native, UDP, TCP, HTTPS) to 3 (removed HTTPS)

### What Was Removed

**DNS-over-HTTPS Support** - Eliminated non-functional transport!
- **Why Removed**: DNS-over-HTTPS never worked due to ch.at DNS TXT architectural limitation
- **Code Cleanup**: Removed `performDNSOverHTTPS()` function from DNSService
- **UI Cleanup**: Removed HTTPS from all transport test UI and translation strings
- **Credits**: Removed Cloudflare infrastructure credit (no longer using Cloudflare)
- **API Simplification**: `DNSService.queryLLM()` signature reduced from 5 to 4 parameters

### What Was Fixed

**Test Suite Improvements**:
- **AccessibilityContext Mocks**: Fixed missing mocks in settings test suites
- **Migration Tests**: Comprehensive v1→v3, v2→v3, and v3 scenarios validated
- **Method Order Tests**: Rewritten to match new 2-parameter signature (enableMock, allowExperimental)

## Breaking Changes

IMPORTANT: Settings schema v3 has breaking changes!

- **Removed Fields**: `preferDnsOverHttps` and `dnsMethodPreference` no longer exist
- **API Change**: `DNSService.queryLLM()` signature changed from 5 to 4 parameters
- **DNS Method**: Single automatic fallback chain (no user configuration needed)
- **Migration**: Automatic - all existing settings upgrade to v3 on app launch

## Migration Guide

No action required! Settings automatically migrate from v2 to v3:

1. **Automatic Migration**: App detects v2 settings and upgrades to v3
2. **Settings Preserved**: DNS server, haptics, locale, accessibility all preserved
3. **Transports Enabled**: Experimental transports (UDP/TCP) enabled by default
4. **No Data Loss**: All user preferences maintained during migration

If you were using deprecated settings programmatically:
```typescript
// Old (v2)
settings.preferDnsOverHttps
settings.dnsMethodPreference
DNSService.queryLLM(message, server, preferHttps, methodPreference, enableMock)

// New (v3)
settings.allowExperimentalTransports
DNSService.queryLLM(message, server, enableMock, allowExperimentalTransports)
```

## Previous Versions

### v3.0.0 - Major Design System Overhaul

## 🎨 Complete iOS 26 Liquid Glass Integration

DNSChat v3.0.0 brings a complete visual transformation with iOS 26 Liquid Glass design system!

### What's New

**Complete Typography System** - Professional text styling across the entire app!
- **15 Typography Styles**: From display large (57pt) to caption2 (11pt)
- **Platform-Adaptive**: SF Pro typography on iOS, Roboto on Android
- **Pixel-Perfect**: Letter spacing verified against Apple Human Interface Guidelines
- **Smart Scaling**: Automatic platform selection with `useTypography()` hook

**Comprehensive Spacing System** - Consistent layout and accessibility!
- **8px/4dp Base Grid**: iOS uses 8px base, Android uses 4dp base
- **Touch Targets**: All interactive elements meet 44pt iOS / 48dp Android minimum (WCAG 2.1 Level AA)
- **Corner Radius**: Consistent radii for all component types (cards, buttons, inputs)
- **Elevation System**: 5 levels for Material Design 3 shadow compatibility

**Haptic Feedback System** - Feel every interaction!
- **8 Haptic Types**: Light, medium, heavy, success, warning, error, selection, rigid
- **iOS Integration**: Full expo-haptics implementation
- **Platform-Aware**: iOS-only execution with graceful Android fallback

**Fluid Animations** - Smooth 60fps animations everywhere!
- **Spring Physics**: Tuned damping (15) and stiffness (150) for Liquid Glass feel
- **Worklet-Compatible**: All animations use 'worklet' directive for 60fps performance
- **Button Animations**: 0.95 scale on press with bouncy spring config
- **Timing Presets**: Quick (200ms), smooth (300ms), slow (500ms), interactive (150ms)

**New UI Components**:
- **LiquidGlassButton**: 5 variants, 3 sizes, haptics, animations, loading states
- **SkeletonMessage**: Shimmer loading animation for chat messages
- **LiquidGlassCard**: Card container with glass effects and press interactions
- **LiquidGlassTextInput**: Focus animations, error states, clear button
- **Toast**: Toast notifications with auto-dismiss and haptic feedback

### What Changed

**Updated Components** - All core components modernized!
- **MessageBubble**: Typography integration, haptic feedback on long press
- **ChatInput**: Perfect circular send button on all platforms, haptics on send
- **Chat Screen**: Palette and spacing improvements
- **About Screen**: Complete typography overhaul
- **Navigation**: DevLogs tab removed from bottom navigation (still accessible via deep link)

### What Was Fixed

**iOS 26 Human Interface Guidelines Compliance**:
- **Automatic Dark Mode**: All UI elements now properly adapt to light and dark mode automatically
- **Accessibility Improvements**: High contrast support, VoiceOver labels throughout, 44pt minimum touch targets
- **Visual Consistency**: Semantic color system ensures consistent, professional look across all screens
- **Chat Interface**: Message bubbles, input field, send button, and icons all use theme-aware colors
- **Empty States**: Proper typography and spacing following iOS 26 design patterns with glass effect backgrounds
- **Contrast Ratios**: All text and UI elements maintain 4.5:1 contrast ratio for WCAG 2.1 Level AA compliance
- **No More Hardcoded Colors**: Every color adapts to user preferences (light/dark mode, high contrast, reduce transparency)

**Critical Bug Fixes**:
- **Touch Target Violation**: Small buttons now meet 44pt iOS / 48dp Android minimum
- **ChatInput Border Radius**: Send button now perfectly circular on both platforms
- **Missing Dependency**: Installed expo-haptics to enable haptic feedback
- **Yellow Glow Removed**: Plus icon in chat list no longer has yellow background glow
- **DNS Crash Fixed**: CheckedContinuation double-resume crash in iOS DNS resolver eliminated

## Breaking Changes

IMPORTANT: This is a major version with breaking changes!

- **New Dependency**: `expo-haptics@15.0.7` is now required
- **Typography System**: Complete overhaul - custom typography will need updating
- **Spacing System**: All spacing now uses 8px/4dp grid - custom layouts may need adjustment
- **Component APIs**: New `useTypography()` hook and `LiquidGlassSpacing` constants
- **Navigation**: DevLogs tab removed from bottom navigation

## Migration Guide

If you've customized the app, follow these steps:

1. **Update Dependencies**:
   ```bash
   npm install expo-haptics@15.0.7
   ```

2. **Update Custom Typography**:
   ```tsx
   // Old
   fontSize: 16

   // New
   import { useTypography } from '@/ui/hooks/useTypography';
   const typography = useTypography();
   style={[typography.body]}
   ```

3. **Update Custom Spacing**:
   ```tsx
   // Old
   padding: 16

   // New
   import { LiquidGlassSpacing } from '@/ui/theme/liquidGlassSpacing';
   padding: LiquidGlassSpacing.md
   ```

## Previous Versions

### v2.1.2 - DNS Testing Infrastructure

**DNS Harness Test Tool** - Powerful testing tool for developers:
- Tests DNS queries using UDP and TCP transports directly from Node.js
- Verify DNS protocol compatibility without running the full React Native app
- Usage: `npm run dns:harness -- --message "your test message"`

See [CHANGELOG.md](./CHANGELOG.md) for detailed technical changelog following Keep a Changelog format.

---

**Version**: 3.0.1
**Release Date**: October 26, 2025
**React Native**: 0.81.5
**Expo SDK**: 54.0.20
**TypeScript**: 5.9.2
