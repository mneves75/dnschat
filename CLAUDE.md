# Claude Agent Handbook

## Overview
- **App**: DNSChat (React Native + Expo) with native DNS TXT transports.
- **Package version**: `2.0.1` (synced across all configs; run `npm run sync-versions` before releases).
- **Frontend stack**: Expo SDK 54 stable (`54.0.12`), React Native 0.81.4, React 19.1, TypeScript 5.9.2 strict mode.
- **Navigation**: `@react-navigation` stack + `react-native-bottom-tabs`; no Expo Router usage.
- **State**: Context providers in `src/context/` (`ChatContext`, `SettingsContext`, `OnboardingContext`, `AccessibilityContext`).
- **Native modules**: `modules/dns-native` (Swift + Java) and `ios/LiquidGlassNative`.
- **Design**: Liquid glass wrapper (native bridge on iOS 17+, CSS fallback otherwise) and Material-edge styling.
- **Docs ownership**: Mobile Platform team (`@mvneves`) signs off on Apple/modernization docs.

> **Canonical docs**: `README.md`, this file, `CHANGELOG.md`, `TECH_REVIEW.md` (architecture), `PLAN_MODERNIZATION.md` (roadmap).

## New Architecture (Fabric)

- **Enabled**: `newArchEnabled: true` in `app.json` (though iOS Podfile currently overrides to classic)
- **TurboModules**: Native DNS modules (`DNSNative`, `LiquidGlassNative`) use bridging architecture
- **Performance**: Native bottom tabs leverage UITabBarController (iOS) and BottomNavigationView (Android)
- **Status**: Fabric enabled on Android; iOS pending Podfile alignment (tracked in modernization plan)
- **Testing**: Verify native modules work in both architectures before full rollout
- Uses React Native 0.81.4 + React 19.1 with React Compiler for auto-memoization

## SDK 54 Specifics

- **React 19.1.0** + **React Native 0.81.4**
- **Expo SDK 54.0.12** (stable release, no longer preview)
- **React Compiler** enabled by default (auto-memoization of components/hooks)
- **Navigation**: React Navigation v7 with native stack + `react-native-bottom-tabs`
- **State Management**: React Context providers (no Expo Router usage)
- Native projects (`ios/`, `android/`) are versioned; keep build settings in native projects, not `app.json`

## SDK 54 Key Features

### Precompiled React Native for iOS
- **Build Speed**: 120s → 10s (12x improvement) on React Native core compilation
- XCFrameworks shipped alongside source for instant builds
- Not compatible with `use_frameworks!` in Podfile (DNSChat doesn't use this)
- Automatically used in SDK 54—no configuration needed

### React Native 0.81 & React 19.1
- **React 19.1** with improved hooks:
  - `use()` hook for async data fetching and context
  - Enhanced refs with automatic cleanup
  - Better hydration error messages
- **React Compiler** enabled by default:
  - Auto-memoization of components and hooks
  - Eliminates need for manual `useMemo`/`useCallback` in most cases
  - Compiles components to optimized JavaScript at build time
- **Owner stacks**: Better error messages showing component hierarchy in development
- **Unhandled promise rejections**: Now logged as errors (catch all promises!)

### Performance & Developer Experience
- **Improved Autolinking**: Transitive dependencies (React Native modules in node_modules) now autolinked
- **Import Stack Traces**: Enabled by default, shows full import chains on module errors
- **experimentalImportSupport**: Default on for better ESM, tree shaking, and React Compiler compatibility
- **Hermes Bytecode**: Optimized for Hermes JIT on both iOS and Android

### Reanimated 4.1 (New Architecture)
DNSChat uses Reanimated 4.1.1 with `react-native-worklets`:
- **Fabric-only**: Requires New Architecture (enabled on Android, pending iOS Podfile fix)
- **Worklets**: Shared worklet runtime between Reanimated and other libraries
- **Performance**: 60fps animations with glass effects via `LiquidGlassWrapper`
- **Testing**: Verify animations work in both Fabric and Classic architectures during transition

## Setup
1. **Prerequisites**
   - Node.js 20.19.x LTS (Expo SDK 54 toolchain baseline). Install via asdf/nvm; verify with `node -v`. [¹]
   - npm 9+ (ships with Node 20). Yarn is optional; repo uses `package-lock.json`.
   - Watchman (macOS) for fast rebuilds: `brew install watchman`.
   - Xcode 16.x + Command Line Tools for iOS builds; install Rosetta when prompts appear on Apple Silicon. [²]
   - Android Studio Iguana with SDK Platform 35, build-tools 35.0.0, and Java 17 (install via `brew install openjdk@17`). [³]

2. **Bootstrap commands**
   ```bash
   npm install
   npm run sync-versions:dry   # check version drift
   npx expo-doctor             # validate expo project status
   node test-dns-simple.js "hello"  # DNS smoke test
   ```

3. **Expo CLI usage**
   - Start dev client: `npm start`
   - Web preview: `npm run web`
   - Verify CLI ≥11: `npx expo --version`; upgrade globally if required.

4. **TypeScript Path Aliases** (Optional)

   Currently, DNSChat uses relative imports (`../../context/ChatContext`). To enable path aliases like `@/context/ChatContext`:

   ```json
   // tsconfig.json
   {
     "extends": "expo/tsconfig.base",
     "compilerOptions": {
       "moduleResolution": "bundler",
       "strict": true,
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

   Then configure Metro bundler:

   ```javascript
   // metro.config.js (add to existing config)
   const { getDefaultConfig } = require('expo/metro-config');

   const config = getDefaultConfig(__dirname);

   config.resolver.extraNodeModules = {
     '@': __dirname + '/src',
   };

   module.exports = config;
   ```

   **Note**: Requires updating all imports across codebase. Consider as future enhancement when project scales beyond current structure.

## Build & Release
### Local workflows
- **iOS**: `npm run ios`
  - Invokes `expo run:ios`, regenerates native project in `ios/`, and runs `pod install` as needed.
  - `ios/Podfile` forces classic architecture even though `app.json` sets `newArchEnabled: true`; flagged in modernization plan.
- **Android**: `npm run android`
  - Configures `JAVA_HOME` for Java 17.
  - For Gradle-only builds, run `./android-java17.sh`, then `cd android && ./gradlew assembleDebug`.

### Android Modern Features

- **Edge-to-Edge**: Always enabled via `react-native-edge-to-edge`, cannot be disabled
  - Use `react-native-safe-area-context` for insets (already integrated in `src/navigation`)
  - Status bar and navigation bar are transparent by default
- **Target API 35**: Bumped for August 2025 Google Play compliance (see TECH_REVIEW.md)
- **Material Design 3**: Bottom tabs use Material You color system for parity with iOS Liquid Glass
- **Hermes**: Enabled by default for better performance and smaller bundles
- **Gradle 8.10+**: Modern build toolchain with configuration cache support
- **Java 17**: Required for all Android builds; scripts enforce via `JAVA_HOME` override

### EAS pipelines (`eas.json`)
- Profiles: `development` (dev client, simulator), `preview` (internal), `production` (store).
- Production iOS profile enables dSYM exports and Hermes symbol uploads; ensure App Store Connect credentials are current before `eas build --profile production --platform ios`.
- Tag releases (`git tag vX.Y.Z`) prior to running `eas build` so OTA updates map to git history.

### Store compliance reminders
- App Store submissions must use the latest Xcode toolchain and include 1024×1024 icons starting April 29, 2025; new privacy updates (January 31, 2026) will require manifest updates—see plan. [²]
- Google Play requires target API ≥35 for new uploads after August 31, 2025; plan upgrades to adjust Gradle ext values. [³]

## Troubleshooting
- **Version drift**: If `package.json`, `app.json`, or native project numbers differ from `CHANGELOG.md`, run `npm run sync-versions` (dry run first) to align marketing/build versions.
- **CocoaPods errors**: `npm run fix-pods` cleans Pods and reinstalls; requires CocoaPods ≥1.15.
- **Expo doctor warnings**:
  - `newArchEnabled` mismatch stems from Podfile override—documented technical debt tracked in modernization plan.
  - If `expo-doctor` flags outdated packages, verify against `package.json` versions (current: SDK 54.0.12 stable, RN 0.81.4, Reanimated 4.1.1).
- **DNS smoke test failure**: `node test-dns-simple.js` should return Cloudflare TXT payload. If `ECONNREFUSED`, check VPN/firewall and verify UDP port 53 access.
- **Native module not found**: Ensure `pod install` (iOS) or Gradle sync (Android) completed; `modules/dns-native/index.ts` expects `RNDNSModule` registration.

## FAQ
- **Navigation edits?** Stack + tabs live in `src/navigation/index.tsx`; screens in `src/navigation/screens/`.
- **Where is persistent state handled?** AsyncStorage-backed services in `src/services/storageService.ts` and contexts in `src/context/`.
- **Toggle mock DNS?** Settings screen flips `enableMockDNS`, persisted via `SettingsContext`.
- **Stale references to Expo Router/Zustand?** Ignore—current stack uses React Navigation and React Context only.
- **Liquid glass requirements?** Native bridge applies on iOS 17+; falls back elsewhere. See Apple Liquid Glass announcement for design language. [⁴]

## Common Pitfalls

1. **New Architecture Mismatch**: If you see native module errors, check that `app.json` and `ios/Podfile` agree on architecture. Current config: `app.json` enables, Podfile disables—documented technical debt tracked in modernization plan.

2. **DNS Transport Failures**: UDP queries may fail on corporate/VPN networks. App automatically falls back (Native → UDP → TCP → DoH). Check logs via `DNSLogViewer` component or in-app Logs tab to see fallback chain.

3. **Liquid Glass iOS Version**: Requires iOS 17+, not iOS 26. Earlier documentation referenced incorrect version (now fixed). Native bridge in `ios/LiquidGlassNative` handles version detection and CSS fallback.

4. **Java Version**: Android builds require Java 17. Scripts auto-configure `JAVA_HOME` via `android-java17.sh`, but ensure OpenJDK 17 is installed: `brew install openjdk@17`.

5. **AsyncStorage Persistence**: Chat history persists even after app deletion on iOS (keychain-backed). Use Settings → Clear All Data for true reset during development.

6. **Native Module Changes**: After editing Swift/Java in `modules/dns-native` or `ios/LiquidGlassNative`, must run `pod install` (iOS) or Gradle sync (Android) before rebuilding. Use `npm run fix-pods` for iOS cleanup.

7. **Version Drift**: If builds show mismatched version numbers, run `npm run sync-versions:dry` to preview changes, then `npm run sync-versions` to sync `package.json`, `app.json`, and native configs from `CHANGELOG.md`.

8. **DNS Injection Prevention**: Message sanitization is strict—control characters and DNS special characters are blocked. If legitimate messages fail, check `modules/dns-native/src/constants.ts` whitelist.

## Performance Optimization

### React Native Performance

- **StyleSheet.create**: Always use for style definitions, never inline objects in render
- **Console.log Removal**: Strip all `console.log` statements in production builds (Hermes optimizes these away in release mode)
- **FlatList Optimization**: `MessageList` uses `getItemLayout` for instant scrolling and `removeClippedSubviews` for memory efficiency
- **Memoization**: React 19 Compiler handles auto-memoization of components/hooks; avoid manual `useMemo`/`useCallback` unless profiled
- **Release Build Testing**: Always test performance in release mode: `npx expo run:ios --configuration Release` or `npx expo run:android --variant release`

### Component Style Patterns

```typescript
// ✅ Good: StyleSheet with theme integration
export function MessageBubble({ message, style }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.bubble, { backgroundColor: colors.surface }, style]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 16,
    padding: 12,
    marginVertical: 4,
  },
  text: { fontSize: 16 },
});

// ❌ Bad: Inline objects (creates new object every render)
<View style={{ borderRadius: 16, padding: 12 }}>
```

### Liquid Glass Performance

- **Limit Effects**: Use 5-10 glass effects max per screen for 60fps on older devices
- **Disable During Scroll**: Heavy animations compete with glass rendering; `LiquidGlassWrapper` detects scroll context
- **Fallback Strategy**: Wrapper automatically detects iOS version, reduced transparency mode, and performance constraints
- **Testing**: Test on physical iPhone (iOS 17-18) to verify glass rendering; simulator may not accurately represent performance

### DNS Performance

- **Rate Limiting**: Enforced at 10 queries/minute to prevent spam and server blocking
- **Connection Pooling**: Native modules reuse DNS connections where possible
- **Timeout Strategy**: 5s native → 3s UDP → 5s TCP → 8s DoH, then fail gracefully
- **Background Suspension**: Queries suspend while app is backgrounded; errors indicate suspension state

## Accessibility Requirements

All interactive elements must meet WCAG 2.1 Level AA standards:

- **Labels**: All interactive elements need `accessibilityLabel` (buttons, links, inputs)
- **Roles**: Use `accessibilityRole` ("button", "link", "header", "search", "text", etc.)
- **States**: Apply `accessibilityState` for `disabled`, `selected`, `checked`, `busy`
- **Screen Readers**: Test with VoiceOver (iOS) and TalkBack (Android) during development
- **Contrast**: Minimum 4.5:1 for text, 3:1 for large text (≥18pt) and UI components
- **Touch Targets**: Minimum 44×44pt (iOS) / 48×48dp (Android) for all tappable elements
- **Dynamic Type**: Support iOS Dynamic Type and Android font scaling via `AccessibilityContext`
- **Haptics**: `AccessibilityContext` centralizes haptic feedback with respect to user preferences

### Accessibility Testing

```typescript
// Example: MessageBubble with full accessibility
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={`Message from ${message.sender}`}
  accessibilityHint="Double tap to view message details"
  accessibilityState={{ disabled: isLoading }}
>
  <Text>{message.text}</Text>
</TouchableOpacity>
```

**Test checklist**:
- [ ] Enable VoiceOver (iOS: Settings → Accessibility → VoiceOver)
- [ ] Enable TalkBack (Android: Settings → Accessibility → TalkBack)
- [ ] Verify all interactive elements are announced
- [ ] Test navigation with swipe gestures only
- [ ] Verify dynamic font scaling (Settings → Display → Text Size)

## Deprecations & Breaking Changes (SDK 54)

### Already Compliant
DNSChat correctly uses modern APIs and avoids deprecated patterns:

- ✅ **SafeAreaView**: Uses `react-native-safe-area-context` instead of deprecated RN core SafeAreaView
- ✅ **React Native 0.81**: Uses latest stable version with React 19.1 support
- ✅ **Hermes**: Enabled by default on both platforms
- ✅ **Metro Bundler**: Uses modern `expo/metro-config` with `experimentalImportSupport`

### Watch List

- **Reanimated v4**: Requires New Architecture (Fabric)
  - DNSChat has Reanimated 4.1.1 installed
  - Fabric enabled on Android; iOS pending Podfile update
  - Animations currently work in Classic mode but may need adjustments for full Fabric migration

- **Metro Internals**: If using any `metro/src/..` imports (currently none detected), migrate to `metro/private/..`

- **React Native Screens**: DNSChat uses 4.16.0
  - Latest Expo SDK 54 recommends ensuring screens library is up to date for New Architecture compatibility

### Future Considerations

- **Expo SDK 55** (future): Will remove legacy APIs entirely
  - Plan to audit codebase when SDK 55 RC releases
  - Review `expo-doctor` warnings for deprecation notices

- **Android API 36** (Android 16): Google will require this in future
  - Current target: API 35
  - Monitor Android developer blog for timeline

---
Updated: 2025-10-02.

[¹]: https://docs.expo.dev/more/expo-cli/#system-requirements
[²]: https://developer.apple.com/news/upcoming-requirements/
[³]: https://support.google.com/googleplay/android-developer/answer/11926878
[⁴]: https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
