# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native mobile app providing ChatGPT-like interface via DNS TXT queries. Features local storage, dark/light themes, and native DNS modules for iOS/Android.

## Core Commands

```bash
# Development
npm start                # Start dev server
npm run ios             # Build iOS (requires Java 17)
npm run android         # Build Android (requires Java 17)
npm run fix-pods        # Fix iOS CocoaPods issues
npm run sync-versions   # Sync versions across platforms
/changelog              # Generate changelog (in Claude Code)

# Testing
node test-dns.js "message"  # Test DNS functionality
```

## Architecture

### Tech Stack
- **Framework**: React Native 0.81 with Expo SDK 54
- **React**: React 19.1 with React Compiler enabled
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation v7
- **Native Modules**: Custom DNS implementations (iOS Swift, Android Java)
- **Architecture**: New Architecture (Fabric) enabled with TurboModules

### Key Services
- **DNSService**: Multi-method DNS queries with fallback chain
- **StorageService**: AsyncStorage persistence  
- **DNSLogService**: Query logging and debugging
- **ChatContext**: Global state management

### DNS Query Methods (in order)
1. Native DNS modules (iOS/Android optimized)
2. UDP DNS (react-native-udp)
3. TCP DNS (react-native-tcp-socket)
4. DNS-over-HTTPS (Cloudflare)
5. Mock service (development)

### New Architecture (Fabric)
- **Enabled**: `"newArchEnabled": true` in `app.json`
- Uses TurboModules where appropriate
- Performance optimizations with `@shopify/flash-list` for list rendering
- React Compiler enabled by default (auto-memoization)

### Liquid Glass UI (Future Enhancement)
Uses official `expo-glass-effect` with graceful fallbacks:
- iOS 26+: Native Liquid Glass rendering
- iOS < 26 / Android / Web: Alternative blur/transparency effects
- Force enable for testing on iOS < 26: Set `LIQUID_GLASS_PRE_IOS26=1` or `global.__DEV_LIQUID_GLASS_PRE_IOS26__ = true`
- Check availability: `isLiquidGlassAvailable()` before rendering glass components
- Accessibility: `AccessibilityInfo.isReduceTransparencyEnabled()` for fallback to solid backgrounds
- **Performance Guidance**: Limit to 5-10 glass effects on static screens, disable during heavy animations/scrolling
- **Interactive Glass**: `isInteractive` prop set-once on mount (remount with different key to toggle)

### iOS 26 & Liquid Glass (Future)
- **expo-glass-effect**: `<GlassView>`, `<GlassContainer>` components with native UIVisualEffectView
- **Icon Composer Support**: `.icon` format for Liquid Glass app icons (macOS only tooling)
- **NativeTabs Enhancements**:
  - Badge support for notifications
  - Tab bar minimize behavior (`minimizeBehavior="onScrollDown"`)
  - Separate search tab (`role="search"`)
  - Tab bar search input with `headerSearchBarOptions`
  - DynamicColorIOS for adaptive colors in glass contexts

### React Native 0.81 & React 19.1
- **React 19.1** with improved hooks (`use` hook, enhanced refs)
- **React Compiler** enabled by default (auto-memoization)
- Owner stacks for better error messages
- Unhandled promise rejections now logged as errors
- First-party JSC support removed (use community JSC if needed)

### New & Stable APIs (Expo SDK 54)
- **expo-file-system**: Stable object-oriented API (was `/next`)
  - `File` and `Directory` classes
  - Legacy API at `expo-file-system/legacy` (deprecated in SDK 55)
- **expo-sqlite**: localStorage API for web compatibility
  - SQLite extensions support (`loadExtensionAsync`)
  - sqlite-vec bundled for vector data
- **expo-app-integrity**: DeviceCheck (iOS) & Play Integrity API (Android)
- **expo/blob**: Binary data handling (beta)
- **expo-updates**:
  - `setUpdateRequestHeadersOverride()` for runtime header overrides
  - `downloadProgress` in `useUpdates()` hook
  - `reloadScreenOptions` for custom reload screens

## Critical Known Issues

### P0 - iOS CheckedContinuation Crash
**Location**: ios/DNSNative/DNSResolver.swift:91-132
**Fix**: Add atomic flag to prevent double resume

### P1 - Cross-Platform Inconsistencies  
**Issue**: Message sanitization differs between platforms
**Fix**: Standardize sanitization logic

### P2 - Resource Leaks
**Issue**: NWConnection not properly disposed on failure
**Fix**: Ensure cleanup in all code paths

## Development Guidelines

### iOS Development
- Requires CocoaPods: Run `npm run fix-pods` for issues
- Native module in `ios/DNSNative/`
- Uses Network.framework (iOS 14.0+)

### Android Development  
- **Requires Java 17**: Set via `npm run android`
- Native module in `android/app/src/main/java/com/dnsnative/`
- Uses DnsResolver API (API 29+) with dnsjava fallback

### Version Management
- CHANGELOG.md is source of truth
- Run `npm run sync-versions` before builds
- Updates package.json, app.json, iOS, and Android

### Liquid Glass Design Patterns (Future)
- **Glass Cards**: Use `GlassView` for cards, modals, headers (iOS 26+)
- **Containers**: Wrap multiple glass elements in `GlassContainer` with `spacing` prop for merging
- **Fallbacks**: Provide `BlurView` or solid backgrounds for iOS < 26 and reduced transparency mode
- **Tinting**: Apply subtle `tintColor` to match theme, avoid heavy tints that obscure content
- **Performance**: Disable glass during scrolling/animations, limit to 5-10 effects per screen

### Material Design 3 (Android)
- **Color System**: Use theme-based Material You colors for Android parity
- **Components**: Elevated cards, filled buttons, outlined text fields
- **Motion**: Emphasize delight with container transforms and shared element transitions
- **Accessibility**: Ensure 4.5:1 contrast ratios, large touch targets (48dp minimum)

### React Native Performance
- **StyleSheet.create**: Always use for style definitions, never inline objects in render
- **Console.log Removal**: Strip all `console.log` statements in production builds
- **FlashList**: Use `@shopify/flash-list` for lists with 10+ items
- **Memoization**: Let React Compiler handle, remove manual `useMemo`/`useCallback` unless profiled
- **Release Build Testing**: Always test performance in release mode with `--no-dev --minify`

### Component Style Patterns
```typescript
// Good: StyleSheet with theme integration
export function Card({ children, style }: CardProps) {
  const { colors } = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
});

// Bad: Inline objects (creates new object every render)
<View style={{ borderRadius: 16, padding: 20 }}>
```

### Accessibility Requirements
- **Labels**: All interactive elements need `accessibilityLabel`
- **Roles**: Use `accessibilityRole` ("button", "link", "header", etc.)
- **States**: Apply `accessibilityState` for disabled, selected, checked
- **Screen Readers**: Test with VoiceOver (iOS) and TalkBack (Android)
- **Contrast**: Minimum 4.5:1 for text, 3:1 for large text/UI components

## Testing Checklist

Before committing:
1. Test on iOS simulator
2. Test on Android emulator  
3. Verify DNS queries work: `node test-dns.js "test"`
4. Check native module registration
5. Run version sync if needed

## Common Issues & Fixes

### iOS Build Failures
```bash
npm run fix-pods  # Cleans and reinstalls pods
```

### Native Module Not Found
Verify DNSNative pod in ios/Podfile:
```ruby
pod 'DNSNative', :path => './DNSNative'
```

### Java Version Issues
Use Java 17 for Android builds (automated in npm scripts)

## Documentation Structure

- `/docs/technical/` - Specifications and guides
- `/docs/troubleshooting/` - Common issues
- `/docs/architecture/` - System design
- `/docs/REF_DOC/` - Reference documentation (1096+ markdown files)
  - `docs/REF_DOC/docs_apple/` - Swift, SwiftUI, Liquid Glass, HIG
  - `docs/REF_DOC/docs_expo_dev/` - Complete Expo guides and API references
  - `docs/REF_DOC/docs_reactnative_getting-started/` - New Architecture, platform integration
- `CHANGELOG.md` - Release history

**CRITICAL**: Always consult `docs/REF_DOC/` BEFORE implementing features or answering questions about Expo, React Native, iOS, or Swift.

## Critical Development Guidelines

**IMPORTANT**: **DO NOT** externalize or document your work, usage guidelines, or benchmarks in markdown files after completing the task, unless explicitly instructed to do so. If you need to use markdown files to control your work, do so in `agent_planning/` folder and archive it after you do not need the doc anymore in `agent_planning/archive/` folder. You may include a brief summary of your work. FOLLOW THESE GUIDELINES ALWAYS!

**IMPORTANT**: You run in an environment where `ast-grep` is available; whenever a search requires syntax-aware or structural matching, default to `ast-grep --lang typescript -p '<pattern>'` (or set `--lang` appropriately for JavaScript, Swift, Java, etc.) and avoid falling back to text-only tools like `rg` or `grep` unless I explicitly request a plain-text search.

**Important**: Expo Go does not support custom native modules. Use Development Builds (`npm run ios/android`) to test DNS functionality and other native features.

## Important Notes

- John Carmack reviews all code - maintain high quality
- Update CHANGELOG.md for all changes
- Follow KISS principle
- Test thoroughly before releases
- Native DNS is prioritized over network methods