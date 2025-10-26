# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Critical Development Guidelines

**FOLLOW THESE GUIDELINES ALWAYS! These rules OVERRIDE default behavior and MUST be followed:**

1. **No Documentation Files**: Never create markdown (`.md`) files after completing tasks unless explicitly instructed. **DO NOT** externalize or document your work, usage guidelines, or benchmarks in markdown files after completing the task. If you need to use markdown files to control your work, do so in `agent_planning/` folder and archive it after you do not need the doc anymore in `agent_planning/archive/`. You may include a brief summary of your work.

2. **No Emojis**: Never use emojis in code, commit messages, or communications. NEVER!

3. **Critical Thinking**: You think I am absolutely right. But push your reasoning to 100% of your capacity. I'm trying to stay a critical and sharp analytical thinker. Walk me through your thought process step-by-step. The best people in the domain will verify what you do. Think hard! Be a critical thinker! John Carmack and domain experts will verify all work. Challenge assumptions, think harder, question everything.

4. **ast-grep Usage**: You run in an environment where `ast-grep` is available; whenever a search requires syntax-aware or structural matching, default to `ast-grep --lang typescript -p '<pattern>'` (or set `--lang` appropriately for JavaScript, Swift, Java, Ruby, etc.) and avoid falling back to text-only tools like `rg` or `grep` unless explicitly requested.

5. **Communication Style**: Sacrifice grammar for the sake of concision. List any unresolved questions at the end, if any.

6. **Atomic Commits**: Commit only files touched, list each path explicitly:
   - Tracked files: `git commit -m "<scoped message>" -- path/to/file1 path/to/file2`
   - New files: `git restore --staged :/ && git add "path/to/file1" "path/to/file2" && git commit -m "<scoped message>" -- path/to/file1 path/to/file2`

7. **ExecPlans**: When writing complex features or significant refactors, use an ExecPlan (as described in `/PLANS.md`) from design to implementation. See `/PLANS.md` for full specification.

8. **Reference Documentation**: Always refer to documentation in `docs/` and `docs/REF_DOC/` folders before implementing.

## Project Overview

React Native mobile app providing ChatGPT-like interface via DNS TXT queries. Features local storage, dark/light themes, native DNS modules for iOS/Android, and iOS 26+ Liquid Glass design system.

## Core Commands

```bash
# Development
npm start                # Start dev server
npm run ios             # Build iOS
npm run android         # Build Android (requires Java 17)
npm run fix-pods        # Fix iOS CocoaPods issues
npm run sync-versions   # Sync versions across platforms
/changelog              # Generate changelog (in Claude Code)

# Testing
node test-dns-simple.js "message"     # Quick DNS smoke test
npm run dns:harness -- --message "x"  # Comprehensive DNS harness test
```

## Architecture

### Tech Stack
- **Framework**: React Native 0.81 with Expo SDK 54
- **React**: React 19.1 with React Compiler enabled
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation v7 with react-native-bottom-tabs (native UITabBarController/BottomNavigationView)
- **Native Modules**: Custom DNS implementations (iOS Swift, Android Java)
- **Architecture**: New Architecture (Fabric) enabled with TurboModules
- **Internationalization**: expo-localization with structured messages (en-US, pt-BR)

### Key Services
- **DNSService**: Multi-method DNS queries with fallback chain
- **StorageService**: AsyncStorage persistence
- **DNSLogService**: Query logging and debugging
- **ChatContext**: Global state management
- **I18n**: Localized strings with pt-BR and en-US support

### DNS Query Methods (in order)
1. Native DNS modules (iOS/Android optimized)
2. UDP DNS (react-native-udp)
3. TCP DNS (react-native-tcp-socket)
4. Mock service (development)

### Module Structure
- **modules/dns-native/**: Standalone DNS native module package
  - Self-contained with own package.json and tests
  - iOS Swift implementation using Network.framework
  - Android Java implementation using DnsResolver API
  - Integration test harness: `npm run dns:harness`
  - Smoke tests: `node test-dns-simple.js "message"`
- **plugins/dns-native-plugin.js**: Expo config plugin for native module registration
- **iOS bridge**: ios/DNSChat/ contains AppDelegate and native setup
- **Android bridge**: android/app/src/main/java/com/dnsnative/ contains native DNS implementation

### New Architecture (Fabric)
- **Enabled**: `"newArchEnabled": true` in `app.json`
- Uses TurboModules where appropriate
- Performance optimizations with `@shopify/flash-list` for list rendering
- React Compiler enabled by default (auto-memoization)

### Liquid Glass UI (iOS 26+)
Uses official `expo-glass-effect` (v0.1.4) with graceful fallbacks:

**Official API (expo-glass-effect)**:
```tsx
import { GlassView, GlassContainer, isLiquidGlassAvailable } from 'expo-glass-effect';

// Basic glass view
<GlassView
  glassEffectStyle="regular"  // 'clear' | 'regular'
  isInteractive={false}        // Enable touch interactions
  tintColor="#007AFF"          // Optional tint
  style={{ borderRadius: 16 }}
>
  <Text>Content</Text>
</GlassView>

// Glass container for morphing animations
<GlassContainer spacing={10}>
  <GlassView style={styles.glass1} />
  <GlassView style={styles.glass2} />
</GlassContainer>

// Runtime check
if (isLiquidGlassAvailable()) {
  // iOS 26+ glass effects available
}
```

**Wrapper Component (LiquidGlassWrapper)**:
```tsx
import { LiquidGlassWrapper } from '@/components/LiquidGlassWrapper';

<LiquidGlassWrapper
  variant="regular"      // regular | prominent | interactive
  shape="capsule"        // capsule | rect | roundedRect
  isInteractive={false}
>
  <Text>Content</Text>
</LiquidGlassWrapper>
```

**Platform Support**:
- iOS 26+: Native UIGlassEffect rendering via expo-glass-effect
- iOS < 26: Blur-like CSS fallback with shadows/borders
- Android: Material Design 3 elevated surfaces
- Web: CSS backdrop-filter with solid fallback

**Accessibility**:
- Automatically detects `AccessibilityInfo.isReduceTransparencyEnabled()`
- Falls back to solid backgrounds when transparency disabled
- Real-time accessibility setting change monitoring

**Performance Guidance**:
- **iOS 26+ High-end**: Max 10 glass elements per screen
- **iOS 17-25 Medium**: Max 5 glass elements per screen
- **iOS 16 Low-tier**: Max 3 glass elements per screen
- Disable glass during heavy animations/scrolling
- Use `GlassContainer` for morphing groups

**Known Limitations**:
- `isInteractive` prop set-once on mount (remount with different key to toggle)
- Expo's `GlassView`/`GlassContainer` are the single source of truth; the old
  `ios/LiquidGlassNative/` bridge was removed in favour of Expo autolinking.
- Sensor-aware adaptation is intentionally omitted until the official SDK
  exposes those hooks.

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

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── glass/          # Liquid Glass wrappers and components
│   ├── icons/          # Icon components
│   ├── layout/         # Screen and layout components
│   └── onboarding/     # Onboarding flow screens
├── context/            # React Context providers (Chat, Settings, Accessibility)
├── navigation/         # Navigation configuration and screens
│   ├── providers/      # Router providers
│   └── screens/        # Main app screens (Chat, Settings, Logs, etc.)
├── services/           # Core services (DNS, Storage, Logging)
├── types/              # TypeScript type definitions
├── ui/                 # UI utilities (theme, hooks)
└── i18n/               # Internationalization (en-US, pt-BR)

modules/dns-native/     # Standalone DNS native module
├── src/                # TypeScript DNS service implementations
├── ios/                # iOS Swift Network.framework implementation
├── android/            # Android Java DnsResolver implementation
└── __tests__/          # Module unit tests

ios/DNSChat/            # iOS native app
android/                # Android native app
plugins/                # Expo config plugins
scripts/                # Build and version sync scripts
```

## Development Guidelines

### iOS Development
- Requires CocoaPods: Run `npm run fix-pods` for issues
- Native DNS module in `modules/dns-native/` with iOS bridge in `ios/DNSChat/`
- Uses Network.framework (iOS 14.0+)
- Deployment target: iOS 16.0+

### Android Development
- **Requires Java 17**: Automatically set via `npm run android` script
- Native DNS module in `modules/dns-native/` with Android bridge in `android/app/src/main/java/com/dnsnative/`
- Uses DnsResolver API (API 29+) with dnsjava fallback
- Minimum SDK: API 21+

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

### React Best Practices: You Might Not Need an Effect

**CRITICAL**: Most side effects belong in event handlers, not useEffect. Reference: https://react.dev/learn/you-might-not-need-an-effect

**When NOT to use useEffect**:

1. **Deriving State from Props/State**
   - Compute values during render instead of synchronizing with effects
   - Bad: `useEffect(() => { setFullName(firstName + ' ' + lastName); }, [firstName, lastName])`
   - Good: `const fullName = firstName + ' ' + lastName;`

2. **Caching Expensive Calculations**
   - Use `useMemo` for pure calculations, not effects
   - Good: `const sortedList = useMemo(() => items.sort(compareItems), [items])`
   - Runs during rendering, avoids unnecessary re-renders

3. **Resetting State on Prop Changes**
   - Use `key` prop to reset component state instead of effects
   - Bad: `useEffect(() => { setCount(0); }, [userId])`
   - Good: `<Profile key={userId} />` treats different userIds as different components

4. **Adjusting State During Render**
   - Update state directly during rendering when props change
   - Requires careful condition-checking to avoid infinite loops

5. **Event-Specific Logic**
   - Critical question: Should this run because component displayed, or because user interacted?
   - User interactions belong in event handlers, NOT effects
   - Example: Form submission, button clicks, input changes

**When TO use useEffect**:
- Synchronizing with external systems (WebSocket connections, browser APIs)
- Fetching data (with proper cleanup for race conditions)
- Subscribing to external stores (prefer `useSyncExternalStore` when possible)

**React 19.1 & React Compiler**:
- React Compiler automatically memoizes components and values
- Remove manual `useMemo`/`useCallback` unless profiling shows benefit
- Compiler handles optimization, focus on readable code

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

**When invoked:**

1. Identify the correct Xcode scheme and destination
2. Project location: `ios/DNSChat.xcodeproj` or `ios/DNSChat.xcworkspace` (if using CocoaPods)
3. Use Xcode CLI to initiate build/test: `.claude/scripts/xcodebuild <params>` (if available) or direct `xcodebuild` command

**Follow these rules:**

- Parameters to `.claude/scripts/xcodebuild` are identical to system `xcodebuild`
- ❌ **NEVER clean the build** - Do not add clean option under any circumstances
- ❌ Avoid building unrelated targets
- `.claude/scripts/xcodebuild` writes build results to an output file
- **Always use Read and Search tools** to interpret the output file
- The output file is large - **NEVER read it whole**
- Use the scheme specified (typically "DNSChat")
- Use the destination specified

**Build Commands:**
```bash
# Build for iOS Simulator (React Native development)
xcodebuild -workspace ios/DNSChat.xcworkspace -scheme DNSChat -sdk iphonesimulator build

# Build for iOS Device (requires provisioning)
xcodebuild -workspace ios/DNSChat.xcworkspace -scheme DNSChat -sdk iphoneos build

# Run tests (if implemented)
xcodebuild test -workspace ios/DNSChat.xcworkspace -scheme DNSChat -destination 'platform=iOS Simulator,name=iPhone 16 Pro'

# Preferred: Use npm scripts instead
npm run ios              # Builds and runs on iOS Simulator via Expo
npm run fix-pods         # Fix CocoaPods issues before building
```

**IMPORTANT**: For React Native/Expo projects, prefer `npm run ios` over direct Xcodebuild commands. Only use Xcodebuild directly when debugging native module issues or when MCP Xcode tools are invoked.

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
- Ensure `modules/dns-native/` package is properly linked
- Check expo config plugin in app.json: `"./plugins/dns-native-plugin"`
- Run `npm run fix-pods` to reinstall CocoaPods dependencies

### Java Version Issues
Use Java 17 for Android builds (automated in npm scripts)

## Important Notes

- **Expo Go Limitation**: Expo Go does not support custom native modules. Use Development Builds (`npm run ios/android`) to test DNS functionality and other native features.
- Update CHANGELOG.md for all changes following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- Native DNS is prioritized over network methods for best performance
