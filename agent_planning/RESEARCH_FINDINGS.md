# Expo Router + Liquid Glass Migration - Research Findings

**Date**: 2025-10-10
**Project**: chat-dns
**SDK Version**: Expo SDK 54.0.13
**React Native**: 0.81.4
**React**: 19.1.0

---

## Executive Summary

Successfully verified that **both** Expo Router native tabs and expo-glass-effect are available and ready for integration in SDK 54. This migration is fully supported by official Expo APIs.

---

## 1. Expo Router Native Tabs

### Package Information
- **Package**: `expo-router` (already in package.json v7.x recommended)
- **Native Tabs Import**: `expo-router/unstable-native-tabs`
- **Status**: Experimental/Unstable API (subject to change)
- **SDK Requirement**: SDK 54+

### Key Components
1. `NativeTabs` - Main container for tab navigation
2. `NativeTabs.Trigger` - Defines individual tab routes
3. `Icon` - Tab bar icons (SF Symbols on iOS, drawables on Android)
4. `Label` - Tab bar text labels
5. `Badge` - Notification indicators

### Official Documentation
- **Guide**: https://docs.expo.dev/router/advanced/native-tabs/
- **API Reference**: https://docs.expo.dev/versions/latest/sdk/router-native-tabs/

### Features Confirmed
- File-based routing for tabs
- SF Symbols support (iOS)
- Material icons support (Android)
- Badge notifications
- iOS 26 enhancements:
  - Tab bar minimize behavior (`minimizeBehavior="onScrollDown"`)
  - Separate search tab
  - Tab bar search input

### Platform Limitations
- **Android**: Max 5 tabs
- **Nested Tabs**: Not supported
- **FlatList**: Limited support
- **Platform Variations**: Different behavior on iOS vs Android

### Example Usage
```typescript
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="logs">
        <Label>Logs</Label>
        <Icon sf="list.bullet.rectangle" />
        <Badge value={5} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

---

## 2. Expo Glass Effect

### Package Information
- **Package**: `expo-glass-effect` (needs installation)
- **Status**: Official SDK 54 API
- **Platform Support**: iOS 26+ (fallback to `View` on unsupported platforms)
- **Xcode Requirement**: Xcode 16.1+ (Xcode 26 recommended)

### Key Components
1. `GlassView` - Main glass effect component
2. `GlassContainer` - Groups multiple glass elements with spacing

### Official Documentation
- **API Reference**: https://docs.expo.dev/versions/latest/sdk/glass-effect/
- **Blog Post**: https://expo.dev/blog/liquid-glass-app-with-expo-ui-and-swiftui
- **Apple HIG**: https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass

### Features Confirmed
- Native UIVisualEffectView integration (iOS 26+)
- Interactive glass effects (`isInteractive` prop)
- Tint color customization
- Accessibility support via `AccessibilityInfo.isReduceTransparencyEnabled()`
- Automatic fallback to `View` on unsupported platforms

### Glass Styles
Based on Apple HIG and expo-glass-effect API:
- System materials (thin, regular, thick)
- Interactive states
- Customizable tint colors

### Example Usage
```typescript
import { GlassView, GlassContainer } from 'expo-glass-effect';
import { AccessibilityInfo } from 'react-native';

function GlassCard() {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    const checkAccessibility = async () => {
      const enabled = await AccessibilityInfo.isReduceTransparencyEnabled();
      setReduceTransparency(enabled);
    };
    checkAccessibility();
  }, []);

  if (reduceTransparency) {
    // Fallback to solid background for accessibility
    return <View style={{ backgroundColor: '#1C1C1E' }}>...</View>;
  }

  return (
    <GlassView tintColor="#007AFF" isInteractive={false}>
      {/* Content */}
    </GlassView>
  );
}
```

---

## 3. Current Project State

### Navigation Architecture
- **Current**: `@react-navigation/native` + `react-native-bottom-tabs`
- **File**: `src/navigation/index.tsx`
- **Screens**:
  - HomeTabs (TabView with ChatList, Logs, About, DevLogs)
  - Chat (dynamic route)
  - Settings (modal)
  - Profile
  - NotFound

### Glass Components Audit
1. `src/components/LiquidGlassWrapper.tsx` - Custom glass wrapper (will be replaced)
2. `src/components/glass/GlassTabBar.tsx` - Custom tab bar
3. `src/components/glass/GlassBottomSheet.tsx` - Custom bottom sheet
4. `src/components/glass/GlassForm.tsx` - Custom form
5. `src/components/glass/index.ts` - Export barrel
6. `src/components/liquidGlass/*` - Various liquid glass components (will be replaced)
7. `src/utils/liquidGlass.ts` - Detection utilities (will be enhanced)

### Theme & Localization
- **Locale Support**: en-US, pt-BR (via `src/i18n/translations.ts`)
- **Theme**: Light/Dark via `useColorScheme()`
- **Colors**: Adaptive colors in glass components
- **Already Installed**: `expo-localization` v15.0.3

---

## 4. Dependencies Analysis

### To Install
```json
{
  "expo-router": "latest SDK 54 compatible",
  "expo-glass-effect": "latest SDK 54 compatible"
}
```

### To Remove
```json
{
  "react-native-bottom-tabs": "^0.10.0", // Will be replaced by expo-router native tabs
  "@react-navigation/bottom-tabs": "^7.1.1" // May no longer be needed
}
```

### To Keep
```json
{
  "@react-navigation/native": "^7.0.12", // Still needed for modals
  "@react-navigation/native-stack": "^7.1.13" // Still needed for stack navigation
}
```

---

## 5. Migration Strategy

### Phase Breakdown
1. **Phase 1**: Research ✅ COMPLETE
2. **Phase 2**: Install dependencies
3. **Phase 3**: Create app/ directory structure
4. **Phase 4**: Build glass design system
5. **Phase 5**: Integrate theme & localization
6. **Phase 6**: Migrate all screens
7. **Phase 7**: Implement native tabs
8. **Phase 8**: Cleanup old navigation
9. **Phase 9**: Performance optimization
10. **Phase 10**: Accessibility
11. **Phase 11**: Automated testing
12. **Phase 12**: Manual QA
13. **Phase 13**: Documentation updates
14. **Phase 14**: CHANGELOG updates
15. **Phase 15**: Final verification
16. **Phase 16**: Carmack review prep

### Breaking Changes
- Navigation structure completely changes (file-based routing)
- Glass components API changes (expo-glass-effect vs custom)
- App entry point changes (App.tsx → app/_layout.tsx)
- Dependencies removed (react-native-bottom-tabs)

### Risk Mitigation
- Comprehensive testing across iOS (26+, <26), Android, Web
- Performance profiling (release builds)
- Accessibility validation (VoiceOver, TalkBack)
- Gradual rollout possible via feature flags

---

## 6. Critical Findings

### API Status
- **expo-router/unstable-native-tabs**: UNSTABLE - API may change
- **expo-glass-effect**: STABLE - Official SDK 54 API

### Platform Compatibility
| Feature | iOS 26+ | iOS <26 | Android | Web |
|---------|---------|---------|---------|-----|
| Native Tabs | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Liquid Glass | ✅ Native | ❌ Fallback | ❌ Fallback | ❌ Fallback |
| GlassView | ✅ UIVisualEffectView | ⚠️ View | ⚠️ View | ⚠️ View |

### Performance Considerations
- Limit glass effects to 5-10 per screen
- Disable during heavy animations/scrolling
- Use StyleSheet.create (never inline styles)
- Test release builds with `--no-dev --minify`

### Xcode Requirements
- **Minimum**: Xcode 16.1
- **Recommended**: Xcode 26
- **Current iOS deployment target**: 16.0 (per app.json)

---

## 7. Recommendations

### Immediate Actions
1. Install expo-router (if not already installed)
2. Install expo-glass-effect
3. Create agent_planning/QA_CHECKLIST.md for testing
4. Set up iOS 26 simulator for testing native glass

### Code Quality
- Add extensive comments on tricky parts (per Carmack standards)
- Use TypeScript strict mode throughout
- Follow CLAUDE.md performance guidelines
- Maintain accessibility (WCAG compliance)

### Testing Strategy
- Unit tests for all new components
- Integration tests for routing
- Platform fallback tests (iOS <26, Android, Web)
- Theme/locale switching tests
- Performance benchmarks (60fps verification)

---

## 8. References

### Official Documentation
- [Expo Router Native Tabs](https://docs.expo.dev/router/advanced/native-tabs/)
- [expo-glass-effect API](https://docs.expo.dev/versions/latest/sdk/glass-effect/)
- [Apple Liquid Glass HIG](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass)
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54)

### Project Documentation
- CLAUDE.md - Development guidelines
- docs/technical/JUNIOR-DEV-GUIDE.md - Onboarding guide
- docs/architecture/SYSTEM-ARCHITECTURE.md - System design
- CHANGELOG.md - Version history

---

**Status**: Research phase complete. Ready to proceed with Phase 2 (Dependency Installation).
**Next Steps**: Install expo-router and expo-glass-effect, update app.json configuration.
