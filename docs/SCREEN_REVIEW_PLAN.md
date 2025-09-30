# Screen Audit Plan — Expo & React Native Best Practices (2025-09-30)

This pass reviews every screen under `src/screens/` using guidance from `docs/EXPO_REACT_NATIVE_DOCS/*` (Expo Router, React Native, FlashList, and Expo UX best practices). Findings focus on accessibility, performance, and API usage gaps that could cause regressions when the Liquid Glass redesign ships.

---

## Overview

- **Scope**: `Chat`, `GlassChatList`, `Logs`, `Settings`, `GlassSettings`, `DevLogs`, `About`, `Profile`, `NotFound`.
- **Reference docs**: Expo Router navigation, Expo layout/safe-area guidelines, React Native accessibility patterns, FlashList configuration notes.
- **Themes**: move interactive elements to `Pressable`, stabilize layout with Safe Area helpers, fix FlashList props, eliminate effect-driven render loops, and align duplicate UX between classic & glass settings.

---

## Screen Findings

### Chat (`src/screens/Chat.tsx`)
- Hard-coded `keyboardVerticalOffset=100` breaks when header height changes; Expo Router docs recommend deriving this via `useHeaderHeight()` or `Platform.select` to avoid clipped inputs.
- `SafeAreaView` wraps entire screen but `StatusBar` background is opaque while container is transparent, causing visible seams in dark mode.
- No handling for Android back navigation to dismiss alerts or error state; Expo UX guidance suggests using toasts/snackbars instead of modal alerts for recoverable failures.

### GlassChatList (`src/screens/GlassChatList.tsx`)
- `usePerformanceMonitoring` calls `setMetrics` inside an effect without a dependency array, triggering an infinite re-render loop (effect runs after every render → state update → rerender). Needs guard or `useRef`.
- `FlashList` prop `estimatedSize` is invalid; the library expects `estimatedItemSize`. Current usage falls back to default heuristics, hurting performance.
- Actions use `TouchableOpacity` with text-only content; Expo accessibility guidance prefers `Pressable`/`Button` with `accessibilityRole` and ripple feedback for Android.
- `GlassActionSheet` "Cancel" action is a no-op, leaving the sheet visible unless the user taps outside; should invoke `actionSheet.hide()` to match iOS design.
- `handleShareChat` logs to console but never calls `Share.share`, so the Share chip is inert.

### Logs (`src/screens/Logs.tsx`)
- Identical `usePerformanceMonitoring` pattern causes the same infinite render loop as in Chat List.
- Filter/sort `TouchableOpacity` controls lack accessibility roles and press feedback.
- `FlashList` again uses `estimatedSize` → should be `estimatedItemSize`.
- Timeline chart uses derived `logs` array but doesn’t memoize `logs` conversions; any update triggers full re-render even for unchanged data. Consider memoizing parsed entries.

### Settings (`src/screens/Settings.tsx`)
- `ScrollView` lacks `keyboardShouldPersistTaps="handled"` and `contentInsetAdjustmentBehavior="automatic"`, causing inputs to lose focus and status bar overlap on iOS.
- `PreferenceButton` renders clickable `Text` nodes; best practice is `Pressable` or `TouchableOpacity` to ensure focus/hover states and accessibility hints.
- Diagnostic buttons rely on blocking `Alert.alert`; Expo docs recommend using notices/snackbars for async results, or at least gating repeated alerts while network calls are active.
- DNS server `TextInput` allows saving empty strings (no validation before `setDnsServer`).

### GlassSettings (`src/screens/GlassSettings.tsx`)
- Mirrors validation gaps from classic Settings (no empty/server guard, toggles ignore errors).
- Uses `Linking.openURL` without `canOpenURL` checks; Expo docs warn this may reject on restricted devices.
- Transport test triggers `DNSService.queryLLM` without try/catch wrapping `import` failure (should mirror Settings fallback).
- Lacks safe-area padding for top toolbar; should use `useSafeAreaInsets()` instead of magic `paddingTop: 60`.

### DevLogs (`src/screens/DevLogs.tsx`)
- Glass debug button uses `router.push("/glass-debug")` but route may not exist; should wrap in guard or use typed routes to avoid runtime 404.
- Toolbar safe-area offset is hard-coded (60). Replace with `useSafeAreaInsets()` consistent with Expo guidance.

### About (`src/screens/About.tsx`)
- `Animated.event` uses `useNativeDriver: false` even though `opacity` can run natively; enabling the native driver improves scroll perf per RN docs.
- External `Linking.openURL` calls lack error handling, which Expo doc flags for compliance.
- `ScrollView` should set `contentInsetAdjustmentBehavior="automatic"` to avoid overlapping status bar.
- Credits list uses `TouchableOpacity` wrappers but does not declare `accessibilityRole="link"` or open inside try/catch.

### Profile (`src/screens/Profile.tsx`)
- Omits `SafeAreaView`; top content can sit under device cutouts per Expo layout guidance.
- Strings aren’t localized and default to “User” without placeholder styling.

### NotFound (`src/screens/NotFound.tsx`)
- Styled correctly but lacks `accessibilityRole="button"` on the Pressable returning home.

---

## TODO

- [x] Chat: replace hard-coded `keyboardVerticalOffset` with safe-area/header-aware offset and align `StatusBar` with transparent backgrounds.
- [x] GlassChatList: fix performance monitor effect (track renders with refs only), switch to `estimatedItemSize`, convert actions to `Pressable`, wire up Share + cancel actions.
- [x] Logs: same performance hook fix, correct FlashList prop, add accessible filter/sort controls.
- [x] Settings: add keyboard-safe props to `ScrollView`, convert preference rows to `Pressable`, validate DNS server input, and tighten alert handling.
- [x] GlassSettings: mirror settings fixes, guard outbound links, wrap transport buttons in accessible pressables, use safe-area insets for top padding.
- [x] DevLogs: use safe-area insets and guard glass-debug navigation when route is missing.
- [x] About: enable native driver for scroll animation, add `contentInsetAdjustmentBehavior`, wrap external links with `canOpenURL` + error handling.
- [x] Profile & NotFound: wrap content in safe-area aware containers and add accessibility roles on CTA buttons.

Owners should tackle high-severity items (FlashList render loop, navigation offsets) before continuing Liquid Glass rollout.
