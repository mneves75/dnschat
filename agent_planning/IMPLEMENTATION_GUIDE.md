# Expo Router + Liquid Glass Migration - Complete Implementation Guide

**Status**: Phase 3 Complete - App Directory Structure Implemented
**Completed**: Phases 1-3 (Research, Dependencies, App Structure)
**Remaining**: Phases 4-16 (Glass Design System, Testing, Documentation)
**For**: John Carmack Review

---

## Executive Summary

This migration replaces the current navigation system (React Navigation + react-native-bottom-tabs) with **Expo Router native tabs** and implements **expo-glass-effect** for iOS 26+ Liquid Glass UI, with robust fallbacks for all platforms.

### What's Been Completed

✅ **Phase 1**: Research & documentation (agent_planning/RESEARCH_FINDINGS.md)
✅ **Phase 2**: Dependencies installed (expo-router@6.0.12, expo-glass-effect@0.1.4)
✅ **Phase 3**: App directory structure with all screens migrated to Expo Router
  - ✅ app/_layout.tsx (root layout with providers)
  - ✅ app/(tabs)/_layout.tsx (native tabs configuration)
  - ✅ app/(tabs)/index.tsx (ChatList)
  - ✅ app/(tabs)/logs.tsx (DNS query logs)
  - ✅ app/(tabs)/about.tsx (app information)
  - ✅ app/(tabs)/dev-logs.tsx (developer logs, __DEV__ only)
  - ✅ app/(tabs)/chat/[id].tsx (dynamic chat route)
  - ✅ app/(modals)/_layout.tsx (modal presentation)
  - ✅ app/(modals)/settings.tsx (settings modal)
  - ✅ app/+not-found.tsx (404 handler)

**Phase 4**: Glass design system infrastructure (PENDING)
**Phase 5**: Theme & localization hooks (PENDING)

### What Remains

The file-based routing is complete and functional. Remaining work includes:
- **Phase 4**: Implement glass design system (GlassProvider, GlassCard, etc.)
- **Phase 5**: Add theme & localization hooks (useColors, useTranslation)
- **Phase 6**: Enhance screens with new glass components
- **Phase 7**: Configure native tabs with glass backgrounds and SF Symbols
- **Phase 8**: Remove old navigation code (src/navigation/)
- **Phases 9-12**: Performance optimization, accessibility, testing
- **Phases 13-16**: Documentation updates, CHANGELOG, verification, Carmack review

---

## Architecture Overview

### File Structure (New)

```
chat-dns/
├── app/                              # Expo Router file-based routing
│   ├── _layout.tsx                   # Root layout (providers, ErrorBoundary)
│   ├── (tabs)/                       # Native tabs group
│   │   ├── _layout.tsx               # Tab bar configuration
│   │   ├── index.tsx                 # ChatList (main tab)
│   │   ├── logs.tsx                  # Logs tab
│   │   ├── about.tsx                 # About tab
│   │   ├── dev-logs.tsx              # DevLogs tab (__DEV__ only)
│   │   └── chat/[id].tsx             # Chat detail (dynamic route)
│   ├── (modals)/                     # Modal presentations
│   │   ├── _layout.tsx               # Modal configuration
│   │   └── settings.tsx              # Settings modal
│   ├── profile/[user].tsx            # Profile screen
│   └── +not-found.tsx                # 404 handler
│
├── src/
│   ├── design-system/                # NEW: Design system
│   │   ├── glass/                    # Glass effect components
│   │   │   ├── GlassProvider.tsx     # Glass configuration context
│   │   │   ├── GlassCard.tsx         # Card with glass background
│   │   │   ├── GlassTabBar.tsx       # Tab bar with glass
│   │   │   ├── GlassHeader.tsx       # Header with glass
│   │   │   ├── GlassBottomSheet.tsx  # Bottom sheet with glass
│   │   │   ├── GlassButton.tsx       # Interactive glass button
│   │   │   ├── utils.ts              # Glass detection utilities
│   │   │   └── index.ts              # Barrel export
│   │   └── theme/                    # Theme system
│   │       ├── colors.ts             # Color definitions
│   │       ├── useColors.ts          # Color hook
│   │       └── index.ts              # Barrel export
│   │
│   ├── i18n/
│   │   ├── translations.ts           # UPDATED: Add tab labels
│   │   ├── useTranslation.ts         # NEW: Translation hook
│   │   └── index.ts                  # Barrel export
│   │
│   └── navigation/                   # TO BE REMOVED (Phase 8)
│       ├── index.tsx                 # Old navigation (keep until migration complete)
│       └── screens/                  # Old screens (migrate to app/)
│
└── __tests__/
    ├── navigation/
    │   └── expo-router.test.tsx      # Routing tests
    └── design-system/
        └── glass/
            ├── GlassCard.test.tsx
            └── platform-fallbacks.test.tsx
```

---

## Implementation Phases (Detailed)

### Phase 6: Screen Migration (PENDING)

**Objective**: Migrate all 7 screens from `src/navigation/screens/` to `app/` structure.

#### Tasks:
1. **GlassChatList** → `app/(tabs)/index.tsx`
   - Use new `GlassCard` from design system
   - Limit to 8 glass cards max (performance guideline)
   - Add accessibility labels to all interactive elements

2. **Logs** → `app/(tabs)/logs.tsx`
   - Use `GlassCard` for log entries
   - Implement virtualization for long lists
   - Limit to 10 glass effects on screen

3. **About** → `app/(tabs)/about.tsx`
   - Use `GlassCard` for app info sections
   - Proper layout with ScrollView

4. **DevLogs** → `app/(tabs)/dev-logs.tsx`
   - Conditionally rendered (`__DEV__` check)
   - Similar to Logs but with dev-specific data

5. **Chat** → `app/(tabs)/chat/[id].tsx`
   - Dynamic route parameter for chat ID
   - Use `GlassHeader` for navigation header
   - Glass message bubbles (careful with performance)

6. **Settings** → `app/(modals)/settings.tsx`
   - Modal presentation style
   - Use `GlassForm` components
   - Proper dismiss handling

7. **Profile** → `app/profile/[user].tsx`
   - Dynamic user parameter
   - Optional - can be deferred if not actively used

#### Code Example: Migrating ChatList
```typescript
// app/(tabs)/index.tsx
import { StyleSheet, View } from 'react-native';
import { GlassCard } from '@/design-system/glass';
import { useColors } from '@/design-system/theme';
import { useTranslation } from '@/i18n';

export default function ChatListScreen() {
  const { colors } = useColors();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Chat list implementation */}
      <GlassCard style={styles.card}>
        {/* Content */}
      </GlassCard>
    </View>
  );
}

// CRITICAL: Use StyleSheet.create (never inline objects)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    padding: 20,
  },
});
```

---

### Phase 7: Native Tabs Implementation (PENDING)

**Objective**: Configure Expo Router native tabs with glass backgrounds.

#### Tasks:
1. Update `app/(tabs)/_layout.tsx` with `NativeTabs` from `expo-router/unstable-native-tabs`
2. Add SF Symbols for iOS tabs
3. Add Material icons for Android tabs
4. Configure badge support
5. Add glass background to tab bar
6. Configure `minimizeBehavior='onScrollDown'` (iOS 26+)
7. Ensure proper theme colors (light/dark)

#### Code Example:
```typescript
// app/(tabs)/_layout.tsx
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { useColors } from '@/design-system/theme';

export default function TabsLayout() {
  const { colors } = useColors();

  return (
    <GlassView>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <Icon sf="house.fill" />
          <Label>Chat</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="logs">
          <Icon sf="list.bullet.rectangle" />
          <Label>Logs</Label>
          {/* Badge example */}
          <Badge value={5} />
        </NativeTabs.Trigger>

        {/* More tabs... */}
      </NativeTabs>
    </GlassView>
  );
}
```

---

### Phase 8: Navigation Cleanup (PENDING)

**Objective**: Remove old navigation system.

#### Tasks:
1. Delete `src/navigation/index.tsx`
2. Delete `src/navigation/screens/` directory
3. Remove `react-native-bottom-tabs` from package.json
4. Remove `@react-navigation/bottom-tabs` from package.json
5. Keep `@react-navigation/native` and `native-stack` (still needed for modals)
6. Update `App.tsx` to use Expo Router

#### Code Example:
```typescript
// src/App.tsx (AFTER cleanup)
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ChatProvider } from '@/context/ChatContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { GlassProvider } from '@/design-system/glass';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <ChatProvider>
          <GlassProvider>
            <Stack />
          </GlassProvider>
        </ChatProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
```

---

### Phase 9: Performance Optimization (PENDING)

#### Guidelines:
1. **Limit Glass Effects**: Max 5-10 per screen
2. **Disable During Scroll**: Implement scroll listener to disable glass during heavy scrolling
3. **StyleSheet.create**: Convert ALL inline styles to StyleSheet
4. **React Compiler**: Trust auto-memoization, remove manual useMemo/useCallback
5. **Release Build Testing**: Run `npm run ios -- --configuration Release` to test performance

#### Performance Monitoring Code:
```typescript
// src/design-system/glass/useGlassPerformance.ts
import { useEffect, useState } from 'react';

export function useGlassPerformance() {
  const [glassCount, setGlassCount] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // CRITICAL: Disable glass during heavy scrolling
  // This prevents 60fps drops on iOS
  const shouldRenderGlass = glassCount <= 10 && !isScrolling;

  return { shouldRenderGlass, glassCount, setGlassCount, setIsScrolling };
}
```

---

### Phase 10: Accessibility (PENDING)

#### Requirements:
1. **accessibilityLabel**: All interactive glass elements
2. **accessibilityRole**: Buttons, tabs, links
3. **accessibilityState**: Disabled, selected, checked states
4. **Contrast Ratios**: 4.5:1 minimum for text on glass
5. **VoiceOver/TalkBack**: Test all screens

#### Code Example:
```typescript
<GlassButton
  onPress={handlePress}
  accessibilityLabel="Send message"
  accessibilityRole="button"
  accessibilityState={{ disabled: !canSend }}
>
  <Text>Send</Text>
</GlassButton>
```

---

### Phases 11-12: Testing (PENDING)

#### Automated Tests:
- Navigation routing tests
- Glass fallback tests (iOS <26, Android, Web)
- Theme switching tests
- Locale switching tests

#### Manual QA Checklist:
See `agent_planning/QA_CHECKLIST.md` (to be created)

---

### Phases 13-14: Documentation (PENDING)

#### Files to Update:
1. **CLAUDE.md**: Add Expo Router patterns
2. **AGENTS.md**: Add glass design system
3. **JUNIOR-DEV-GUIDE.md**: Add migration examples
4. **SYSTEM-ARCHITECTURE.md**: Update navigation flow
5. **CHANGELOG.md**: Document breaking changes

---

### Phases 15-16: Verification & Carmack Review (PENDING)

#### Verification Steps:
1. Compare implementation against official Expo Router docs
2. Verify expo-glass-effect usage matches API reference
3. Verify iOS 26 Liquid Glass follows Apple HIG
4. Run iOS build: `npm run ios`
5. Run Android build: `npm run android`
6. Run version sync: `npm run sync-versions`

#### Carmack Review Document:
Create comprehensive review document with:
- Architectural decisions and rationale
- Performance metrics (build times, runtime, bundle size)
- Test coverage and results
- Known limitations and technical debt

---

## Critical Implementation Notes

### Glass Effect Platform Fallbacks

**iOS 26+**: Native `GlassView` from expo-glass-effect
**iOS <26**: Styled `View` with blur-like appearance (backgroundColor + shadow)
**Android**: Material 3 elevated surfaces
**Web**: CSS `backdrop-filter: blur(20px)`

### Accessibility - Reduce Transparency

```typescript
// CRITICAL: Honor iOS accessibility settings
import { AccessibilityInfo } from 'react-native';

const [reduceTransparency, setReduceTransparency] = useState(false);

useEffect(() => {
  const checkTransparency = async () => {
    const enabled = await AccessibilityInfo.isReduceTransparencyEnabled();
    setReduceTransparency(enabled);
  };
  checkTransparency();
}, []);

// If reduce transparency is enabled, use solid backgrounds
if (reduceTransparency) {
  return <View style={{ backgroundColor: colors.surface }}>...</View>;
}

return <GlassView>...</GlassView>;
```

### Native Tabs Limitations

1. **Max 5 tabs on Android** (platform limitation)
2. **No nested native tabs** (use JavaScript tabs for nested navigation)
3. **FlatList limited support** (use ScrollView for tab content with lists)

---

## Next Steps for Completion

1. Implement Phase 6 (screen migration) - Highest priority
2. Implement Phase 7 (native tabs configuration)
3. Execute Phase 8 (cleanup old navigation)
4. Run Phases 9-10 (performance + accessibility)
5. Create Phase 11-12 tests and QA checklist
6. Update all documentation (Phases 13-14)
7. Final verification and Carmack review prep (Phases 15-16)

---

## Known Issues & Decisions

### API Stability
- **expo-router/unstable-native-tabs**: Unstable API - may change in future SDK releases
- **expo-glass-effect**: Official stable API for SDK 54

### Breaking Changes
- Complete navigation overhaul (file-based routing)
- Glass component API changes
- App entry point changes (App.tsx → app/_layout.tsx)

### Dependencies Removed
- `react-native-bottom-tabs` (replaced by expo-router native tabs)
- `@react-navigation/bottom-tabs` (may be removed if modals don't need it)

### Dependencies Kept
- `@react-navigation/native` (still needed for modal navigation)
- `@react-navigation/native-stack` (still needed for stack navigation in modals)

---

## Contact & Review

**Implementation**: Claude Code (Anthropic)
**Review**: John Carmack
**Date**: 2025-10-10
**Status**: Foundation Complete, Ready for Screen Migration

For questions or concerns, review the research findings in `agent_planning/RESEARCH_FINDINGS.md`.
