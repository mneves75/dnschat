# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Critical Development Guidelines

**These rules OVERRIDE default behavior and MUST be followed:**

1. **No Documentation Files**: Never create markdown (`.md`) files after completing tasks unless explicitly instructed. Use `agent_planning/` for planning docs only, archive when done in `agent_planning/archive/`.

2. **No Emojis**: Never use emojis in code, commit messages, or communications.

3. **Critical Thinking**: Push reasoning to 100% capacity. Walk through thought process step-by-step. John Carmack and domain experts will verify all work. Challenge assumptions, think harder, question everything.

4. **ast-grep Usage**: For syntax-aware searches, always use `ast-grep --lang typescript -p '<pattern>'` (or set `--lang` appropriately for JavaScript, Swift, Java, etc.) instead of `rg` or `grep` unless explicitly requested. Set up ast-grep as codebase linter and git hook to block commits with violations.

5. **Tmux Usage**: Execute commands in tmux sessions when available.

6. **Communication Style**: Sacrifice grammar for concision. List unresolved questions at end if any.

7. **Atomic Commits**: Commit only files touched, list each path explicitly:
   - Tracked files: `git commit -m "<scoped message>" -- path/to/file1 path/to/file2`
   - New files: `git restore --staged :/ && git add "path/to/file1" "path/to/file2" && git commit -m "<scoped message>" -- path/to/file1 path/to/file2`

8. **ExecPlans**: For complex features or significant refactors, use an ExecPlan (as described in `/PLANS.md` or `DOCS/PLANS.md`) from design to implementation.

9. **Reference Documentation**: Always refer to documentation in `docs/` and `docs/REF_DOC/` folders before implementing.

## Project Overview

React Native mobile app providing ChatGPT-like interface via DNS TXT queries. Features local storage, dark/light themes, native DNS modules for iOS/Android, and iOS 26+ Liquid Glass design system.

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

## Documentation Structure

**AGENTS.md / CLAUDE.md** - How to work on this codebase (READ THIS FIRST)
**PROJECT_STATUS.md** - Current progress, what's next, blockers (READ THIS SECOND)
**README.md** - Human-readable project overview
**QUICKSTART.md** - User getting started guide (optional)

- `/docs/technical/` - Specifications and guides
- `/docs/troubleshooting/` - Common issues
- `/docs/architecture/` - System design
- `/docs/REF_DOC/` - Reference documentation (1096+ markdown files)
  - `docs/REF_DOC/docs_apple/` - Swift, SwiftUI, Liquid Glass, HIG
  - `docs/REF_DOC/docs_expo_dev/` - Complete Expo guides and API references
  - `docs/REF_DOC/docs_reactnative_getting-started/` - New Architecture, platform integration

**CRITICAL**: Always consult `docs/REF_DOC/` BEFORE implementing features or answering questions about Expo, React Native, iOS, or Swift.

## Apple Platform Guidelines

### Swift & iOS Development

**Language Preferences**:
- Favor Apple programming languages: Swift, Objective-C, C, C++
- Default to Swift unless user indicates another language
- Pay attention to platform context (iOS vs macOS vs watchOS vs visionOS)
- Use official platform names: iOS, iPadOS, macOS, watchOS, visionOS

**Modern Concurrency**:
- Prefer Swift Concurrency (async/await, actors) over Dispatch or Combine
- Be flexible if user's code shows different preference

**Modern Previews**:
- Use `#Preview` macro for SwiftUI previews
- Avoid legacy `PreviewProvider` protocol for new code

### Xcode CLI Usage

When building/testing with Xcode CLI:

1. Identify correct scheme and destination
2. Workspace location: `./XXX.xcworkspace`
3. Use: `.claude/scripts/xcodebuild <params>`

**Rules**:
- Parameters same as system `xcodebuild`
- NEVER add clean option
- Build results written to output file
- Use Read/Search tools to interpret output (file is large)
- NEVER read output file whole
- Use specified scheme and destination

**Build Commands**:
```bash
# Build for iOS
xcodebuild -project project.xcodeproj -scheme SchemeName -sdk iphoneos build

# Run tests
xcodebuild test -project project.xcodeproj -scheme SchemeName -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

### iOS 26 Liquid Glass Requirements

All UI MUST follow iOS 26 Liquid Glass design (see `docs/REF_DOC/docs_apple/liquid-glass.md`):

```swift
// Tab bar with glass effect
TabView {
    ConvertView()
        .tabItem { Label("Convert", systemImage: "photo.on.rectangle") }
}
.tabBarStyle(.sidebarAdaptable)  // iPad sidebar adaptation

// Custom elements with glass
VStack {
    Image(systemName: "photo.stack")
    Text("Select Files")
}
.glassEffect(.regular.interactive())  // Interactive glass

// Glass container for morphing animations
GlassEffectContainer(spacing: 20) {
    HStack {
        Button("Lossless") { }
            .glassEffect()
        Button("Lossy") { }
            .glassEffect()
    }
}

// Glass button styles
Button("Convert") { }
    .buttonStyle(.glassProminent)  // Primary actions
```

**Critical Requirements**:
- Tab bar uses `.sidebarAdaptable` on iPad
- `.glassEffect()` on custom UI cards
- `.buttonStyle(.glass)` or `.glassProminent` for buttons
- `GlassEffectContainer` for morphing animations
- Edge-to-edge content with background extension

### Modern SwiftUI Patterns (NO MVVM)

**CRITICAL: NO ViewModels, NO MVVM**

Use modern SwiftUI patterns (iOS 17+), NOT UIKit/MVVM:

**DO**:
- Use `@State` for local view state
- Use `@Observable` classes for shared state (NOT `@ObservableObject`)
- Use `@Environment` for dependency injection
- Use `actor` for isolated concurrency
- Keep state ownership in views unless sharing required

**DON'T**:
- Create `ViewModel` classes for every view
- Use `@ObservableObject` or `@Published` (legacy iOS 16)
- Use Combine for simple async operations
- Move state out of views unnecessarily

**State Management Examples**:
```swift
// CORRECT: Local view state
struct ConvertView: View {
    @State private var selectedFiles: [URL] = []
    @State private var conversionProgress: Double = 0.0
}

// CORRECT: Shared state with @Observable
@Observable
class ConversionCoordinator {
    var tasks: [ConversionTask] = []
    var isProcessing: Bool = false
}

// WRONG: Don't create ViewModels
class ConvertViewModel: ObservableObject { } // NO!
```

**Concurrency**:
- Use `async/await` for ALL async operations
- Use `.task { }` modifier for view lifecycle-aware async work
- Use `actor` for state isolation (conversion queue, file operations)
- Handle errors with `do/try/catch`, not completion handlers

**Code Organization**:
- Feature-based folders (NOT Models/, Views/, ViewModels/)
- Related code in same file when appropriate
- Extensions for organization within large files
- Keep files < 300 lines when possible

## Guidelines

- **Follow KISS principle** - Keep It Simple, Stupid
- **Test thoroughly** before releases (iOS, Android, real DNS queries)
- **John Carmack reviews all work** - Maintain highest quality standards
- **Keep commits atomic** - Use explicit file paths as shown in IMPORTANT section above
- Always look for reference documentation in `docs/` and `docs/REF_DOC/` folders

## Testing Checklist

Before committing:
1. Test on iOS simulator (`npm run ios`)
2. Test on Android emulator (`npm run android`)
3. Verify DNS queries work: `node test-dns-simple.js "test message"`
4. Run DNS harness: `npm run dns:harness -- --message "harness test"`
5. Check native module registration (console logs)
6. Run version sync if needed: `npm run sync-versions`
7. Update CHANGELOG.md for significant changes (following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/))

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

## Important Notes

- **Expo Go Limitation**: Expo Go does not support custom native modules. Use Development Builds (`npm run ios/android`) to test DNS functionality and other native features.
- Update CHANGELOG.md for all changes following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- Native DNS is prioritized over network methods for best performance