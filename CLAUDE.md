# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
npm test                     # Run Jest tests
npm run dns:harness         # Run DNS test harness
```

## Package Manager Preferences

- **Bun**: Preferred package manager when available (fast, modern, all-in-one)
- **pnpm**: Alternative for projects requiring pnpm-specific features
- **npm**: Fallback for maximum compatibility
- Always check `package.json` for `"packageManager"` field to respect project configuration

## Critical Development Guidelines

**IMPORTANT**: These rules OVERRIDE default behavior and MUST be followed:

1. **No Documentation Files**: Never create markdown files after completing tasks unless explicitly instructed. Use `agent_planning/` for planning docs only, archive when done.

2. **Use ast-grep**: For syntax-aware searches, always use `ast-grep --lang typescript -p '<pattern>'` (or appropriate language) instead of rg/grep.
   - Set up ast-grep as codebase linter and git hook to block commits with violations

3. **No Emojis**: Never use emojis in code or commit messages.

4. **CHANGELOG.md Updates**: Always update CHANGELOG.md for significant changes following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

5. **Expo Go Limitation**: Expo Go does not support custom native modules. Use Development Builds (`npm run ios/android`) to test DNS functionality.

6. **Development Build Required**: Custom native DNS modules require `expo run:ios` or `expo run:android` - Expo Go will not work.

7. **Critical Thinking**: Push reasoning to 100% capacity. Walk through thought process step by step. John Carmack and domain experts will verify work.

8. **Communication Style**:
   - Sacrifice grammar for concision
   - List unresolved questions at end
   - No unnecessary documentation unless requested

9. **Execution Environment**:
   - Use tmux when executing commands
   - Always refer to documentation in `docs/` and `docs/REF_DOC/` folders

10. **Atomic Commits**: Commit only files touched, list each path explicitly
    - Tracked files: `git commit -m "<scoped message>" -- path/to/file1 path/to/file2`
    - New files: `git restore --staged :/ && git add "path/to/file1" "path/to/file2" && git commit -m "<scoped message>" -- path/to/file1 path/to/file2`

## ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in `/PLANS.md`) from design to implementation.

## Tech Stack

### Framework & Language
- **React Native**: 0.81.4 with New Architecture (Fabric + TurboModules)
- **Expo SDK**: 54.0.13 stable
- **React**: 19.1.0 with React Compiler enabled (auto-memoization)
- **TypeScript**: 5.9.2 (strict mode)
- **Navigation**: Expo Router with file-based routing

### UI & Design
- **Native Tabs**: `expo-router/unstable-native-tabs` with native UITabBarController/BottomNavigationView
- **Glass Effects**: `expo-glass-effect@0.1.4` for iOS 26+ native Liquid Glass
  - Official Expo package wrapping UIVisualEffectView
  - Design system at `src/design-system/glass/` (GlassCard, GlassButton, GlassScreen)
  - Automatic platform fallbacks (iOS <26, Android Material 3, Web CSS backdrop-filter)
- **Styling**: StyleSheet.create (never inline styles)
- **Lists**: `@shopify/flash-list` for 10+ items

### Native Modules
- **DNS Native Module**: `modules/dns-native/` for DNS implementations
  - iOS: Swift + Apple Network Framework (iOS 16.0+)
  - Android: Java + DnsResolver API (API 29+) with dnsjava fallback
  - Expo autolinking (no manual Podfile entries needed)

## Expo SDK Best Practices

### New Architecture (Fabric + TurboModules)

- **Enabled**: `"newArchEnabled": true` in `app.json`
- Uses TurboModules where appropriate
- Native tabs leverage iOS 26 Liquid Glass and Android Material You
- Performance optimizations with `@shopify/flash-list` for lists

### Expo Glass Effect (iOS 26 Liquid Glass)

Uses official `expo-glass-effect` with graceful fallbacks:

**Platform Support**:
- **iOS 26+**: Native Liquid Glass rendering via UIVisualEffectView
- **iOS < 26 / Android / Web**: Alternative blur/transparency effects
- **Force enable for testing**: Set `LIQUID_GLASS_PRE_IOS26=1` or `global.__DEV_LIQUID_GLASS_PRE_IOS26__ = true`

**Core Components** (see `src/design-system/glass/`):
- `<GlassView>`: Native glass view component
- `<GlassContainer>`: Container with spacing for morphing effects
- `isLiquidGlassAvailable()`: Check for iOS 26+ support
- `AccessibilityInfo.isReduceTransparencyEnabled()`: Fallback to solid backgrounds

**Performance Guidance**:
- Limit to 5-10 glass effects on static screens
- Disable during heavy animations/scrolling
- `isInteractive` prop set-once on mount (remount with different key to toggle)

### React Native 0.81 & React 19.1 Features

- **React 19.1**: Improved hooks (`use` hook, enhanced refs)
- **React Compiler**: Enabled by default (auto-memoization)
- **Owner stacks**: Better error messages
- **Unhandled promise rejections**: Logged as errors
- **First-party JSC removed**: Use community JSC if needed

### Expo SDK 54 Stable APIs

**expo-file-system**: Stable object-oriented API
```typescript
import { File, Directory } from 'expo-file-system';
// Legacy API at 'expo-file-system/legacy' (deprecated in SDK 55)
```

**expo-sqlite**: localStorage API for web compatibility
```typescript
import { loadExtensionAsync } from 'expo-sqlite';
// SQLite extensions support
// sqlite-vec bundled for vector data
```

**expo-app-integrity**: DeviceCheck (iOS) & Play Integrity API (Android)

**expo/blob**: Binary data handling (beta)

**expo-updates**:
```typescript
import { setUpdateRequestHeadersOverride, useUpdates } from 'expo-updates';
// Runtime header overrides
// downloadProgress in useUpdates() hook
// reloadScreenOptions for custom reload screens
```

### Liquid Glass Design Patterns

**Glass Cards**:
```typescript
import { GlassView } from 'expo-glass-effect';

<GlassView variant="regular">
  <Text>Card Content</Text>
</GlassView>
```

**Containers**:
```typescript
<GlassContainer spacing={16}>
  <GlassView>Item 1</GlassView>
  <GlassView>Item 2</GlassView>
</GlassContainer>
```

**Fallbacks**:
- Provide `BlurView` or solid backgrounds for iOS < 26
- Respect reduced transparency mode
- Apply subtle `tintColor` to match theme

**Performance**:
- Disable glass during scrolling/animations
- Limit to 5-10 effects per screen
- Monitor with GlassProvider element counting

### Material Design 3 (Android Parity)

- **Color System**: Theme-based Material You colors
- **Components**: Elevated cards, filled buttons, outlined text fields
- **Motion**: Container transforms and shared element transitions
- **Accessibility**: 4.5:1 contrast ratios, 48dp minimum touch targets

### React Native Performance Rules

**StyleSheet.create** (REQUIRED):
```typescript
// CORRECT: StyleSheet with theme integration
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

// WRONG: Inline objects create new object every render
<View style={{ borderRadius: 16, padding: 20 }}>
```

**Critical Performance Rules**:
- **StyleSheet.create**: Always use, never inline styles
- **Console.log**: Remove from production builds
- **FlashList**: Use for lists with 10+ items instead of FlatList
- **Memoization**: Let React Compiler handle, avoid manual useMemo/useCallback unless profiled
- **Release Testing**: Always test performance in release mode: `--no-dev --minify`

### Accessibility Requirements

All interactive elements MUST have:
- `accessibilityLabel`: Descriptive label
- `accessibilityRole`: "button", "link", "header", etc.
- `accessibilityState`: For disabled, selected, checked states

**Screen Reader Testing**:
- iOS: VoiceOver
- Android: TalkBack

**Contrast Requirements**:
- Text: Minimum 4.5:1
- Large text/UI components: Minimum 3:1

## Architecture

### File-Based Routing (Expo Router)

```
app/
├── _layout.tsx              # Root layout with providers
├── +not-found.tsx           # 404 screen
├── (tabs)/                  # Tab group
│   ├── _layout.tsx          # Native tabs layout
│   ├── index.tsx            # Chat list (home)
│   ├── chat/[id].tsx        # Chat detail (dynamic route)
│   ├── logs.tsx             # DNS logs
│   ├── dev-logs.tsx         # Developer logs (__DEV__ only)
│   └── about.tsx            # About screen
└── (modals)/                # Modal group
    ├── _layout.tsx          # Modal stack layout
    └── settings.tsx         # Settings modal

src/
├── components/              # Reusable UI components
├── context/                 # React Context providers
├── design-system/glass/     # Glass design system
├── services/                # DNS and storage services
├── types/                   # TypeScript definitions
└── utils/                   # Utility functions
```

### Key Services & Context

- **DNSService** (`src/services/dnsService.ts`): Multi-method DNS queries with fallback chain
  - Native DNS → UDP → TCP → DNS-over-HTTPS → Mock
  - Validates and sanitizes all DNS queries (RFC 1035 compliant)
  - Rate limiting and backgrounding detection

- **StorageService** (`src/services/storageService.ts`): AsyncStorage persistence for chats

- **DNSLogService** (`src/services/dnsLogService.ts`): Query logging and debugging

- **ChatContext** (`src/context/ChatContext.tsx`): Global chat state management
  - Sends messages via DNSService
  - Manages chat list and current chat
  - Error handling and loading states

- **SettingsContext** (`src/context/SettingsContext.tsx`): App settings and DNS configuration
  - DNS server selection
  - DNS method preferences
  - Theme and locale settings

### Glass Design System (expo-glass-effect)

**Official Package**: `expo-glass-effect@0.1.4` provides native iOS 26+ Liquid Glass via UIVisualEffectView

**Design System Location**: `src/design-system/glass/`

**Core Components**:
- **GlassProvider**: Capabilities detection, performance monitoring, accessibility integration
  - Detects iOS 26+ for native Liquid Glass with `isLiquidGlassAvailable()`
  - Tracks element count (max 5-10 per screen)
  - Monitors scroll/animation for performance
  - Respects "Reduce Transparency" accessibility setting

- **GlassCard**: Card component using expo-glass-effect's GlassView
  - iOS 26+: Native UIVisualEffectView (liquid glass)
  - iOS <26: Semi-transparent View with shadow
  - Android: Material 3 elevated Card with dynamic elevation
  - Web: CSS backdrop-filter blur
  - Variants: `regular`, `prominent`, `interactive`

- **GlassButton**: Button component with glass effects

- **GlassScreen**: Screen wrapper with glass background and element counting

**Usage Example**:
```typescript
import { GlassCard } from './design-system/glass';

<GlassCard variant="regular" onPress={handlePress}>
  <Text>Card Content</Text>
</GlassCard>
```

**Performance Guidance**:
- Limit to 5-10 glass effects on static screens
- Disable during heavy animations/scrolling
- `isInteractive` prop can only be set on mount (remount with different key to toggle)
- Auto-registers with GlassProvider for element counting

### NativeTabs System (iOS 26+)

Located in `app/(tabs)/_layout.tsx`, uses `expo-router/unstable-native-tabs`:

**Core Features**:
- **Badge Support**: Notification counts on tabs (e.g., chat list count)
- **minimizeBehavior**: Auto-hide tab bar during scrolling (`minimizeBehavior="onScrollDown"`)
- **System Integration**: Search tab with `role="search"` for iOS system search
- **DynamicColorIOS**: Accessibility-aware colors with high contrast support
- **SF Symbols**: Native iOS icons (house, magnifyingglass, list.clipboard, info.circle)

**Implementation Example**:
```typescript
import { DynamicColorIOS } from 'react-native';
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';

const tabBarTintColor = DynamicColorIOS({
  light: '#007AFF',
  dark: '#0A84FF',
  highContrastLight: '#0040DD',
  highContrastDark: '#409CFF',
});

<NativeTabs tintColor={tabBarTintColor} minimizeBehavior="onScrollDown">
  <NativeTabs.Trigger name="index">
    <Icon sf="house" />
    <Label>Chat</Label>
    <Badge>{chatCount > 0 ? String(chatCount) : undefined}</Badge>
  </NativeTabs.Trigger>

  <NativeTabs.Trigger name="search" role="search">
    <Icon sf="magnifyingglass" />
    <Label>Search</Label>
  </NativeTabs.Trigger>
</NativeTabs>
```

**Key Points**:
- Badge automatically hides when undefined
- DynamicColorIOS falls back to `light` value on Android/Web
- Search role integrates with iOS system search
- minimize behavior requires iOS 26+

### DNS Implementation Details

**DNS Query Flow**:
1. User message → validateDNSMessage() → sanitizeDNSMessage()
2. composeDNSQueryName() creates `<label>.<dnsServer>` (e.g., `hello.ch.at`)
3. queryLLM() attempts methods in order based on preference
4. parseTXTResponse() handles multi-part responses (e.g., `1/3:part1`, `2/3:part2`, `3/3:part3`)

**Security**:
- Input validation rejects control characters and DNS special characters
- Server whitelist allows only ch.at, Google DNS, Cloudflare
- Message sanitization: lowercase → trim → spaces-to-dashes → remove-invalid → truncate(63)

**Method Order** (default: `native-first`):
1. **Native DNS**: iOS Network Framework / Android DnsResolver
2. **UDP DNS**: `react-native-udp` (direct socket)
3. **TCP DNS**: `react-native-tcp-socket` (for UDP-blocked networks)
4. **DNS-over-HTTPS**: Cloudflare (limited - cannot reach ch.at custom TXT)
5. **Mock Service**: Development fallback (always succeeds)

**Known Limitations**:
- DNS-over-HTTPS cannot access ch.at's custom TXT responses (resolver architecture limitation)
- UDP/TCP may be blocked on corporate networks (port 53)
- Queries suspend when app is backgrounded

## Version Management

**CRITICAL**: CHANGELOG.md is the source of truth for version numbers.

```bash
# Before any build or release:
npm run sync-versions        # Updates package.json, app.json, iOS, Android

# Preview changes first:
npm run sync-versions:dry    # Shows what would be updated
```

Version sync updates:
- `package.json`: version field
- `app.json`: expo.version and build numbers
- iOS: `Info.plist` CFBundleShortVersionString and CFBundleVersion
- Android: `build.gradle` versionName and versionCode

## Development Guidelines

### iOS Development

- **Requires CocoaPods**: Run `npm run fix-pods` for issues
- **Native modules**: Located in `modules/dns-native/` (Expo autolinking)
- **Liquid Glass**: Uses official `expo-glass-effect@0.1.4` (no custom native code)
- **Minimum iOS**: 16.0 for Network Framework
- **Deployment Target**: iOS 16.0+ (app.json)

**Common iOS Issues**:

```bash
# CocoaPods issues
npm run fix-pods
cd ios && pod install && cd ..

# Clean build
npm run clean-ios
```

### Android Development

- **Requires Java 17**: Automated in `npm run android` script
- **Native modules**: `android/app/src/main/java/com/dnsnative/`
- **DNS Implementation**: DnsResolver API (API 29+) with dnsjava fallback
- **Minimum SDK**: API 21 (Android 5.0)

**Common Android Issues**:

```bash
# Java version issues - use npm script
npm run android  # Sets JAVA_HOME to Java 17 automatically

# Manual Java 17 setup (if needed)
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=/opt/homebrew/opt/openjdk@17/bin:$PATH
```

### React Native Best Practices

**Performance**:

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

**Critical Rules**:
- **StyleSheet.create**: Always use, never inline styles
- **Console.log**: Remove from production builds
- **FlashList**: Use for lists with 10+ items instead of FlatList
- **Memoization**: Let React Compiler handle, avoid manual useMemo/useCallback unless profiled
- **Release Testing**: Always test performance in release mode: `--no-dev --minify`

### Accessibility Requirements

All interactive elements MUST have:
- `accessibilityLabel`: Descriptive label
- `accessibilityRole`: "button", "link", "header", etc.
- `accessibilityState`: For disabled, selected, checked states

**Contrast Requirements**:
- Text: Minimum 4.5:1
- Large text/UI components: Minimum 3:1

**Testing**:
- iOS: Test with VoiceOver
- Android: Test with TalkBack

### Material Design 3 (Android)

- **Color System**: Theme-based Material You colors
- **Components**: Elevated cards, filled buttons, outlined text fields
- **Motion**: Container transforms and shared element transitions
- **Accessibility**: Large touch targets (48dp minimum)

## Known Issues & Fixes

### CRITICAL: Native Module Registration

**Symptom**: "RNDNSModule found: false" or "Native DNS Module Not Registering"

**Solution**:
1. Check `modules/dns-native/` directory exists (not `ios/DNSNative/`)
2. Remove manual pod entries from `ios/Podfile` (Expo autolinking handles it)
3. Clean and reinstall: `npm run fix-pods`
4. Verify in console: "RNDNSModule found: true"

**Prevention**:
- Never add manual pod entries for Expo-autolinked modules
- Use `modules/dns-native/` structure for cross-platform native code

### Layout Children Warnings (Expo Router)

**Symptom**: "Layout children must be of type Screen, all other children are ignored"

**Root Cause**: JSX comments `{/* ... */}` inside Stack/NativeTabs components are treated as child nodes by React.

**Solution**: Move ALL JSX comments OUTSIDE layout component JSX:

```typescript
// Good: Comment outside component
// This is a route configuration comment
<Stack.Screen name="home" />

// Bad: Comment inside component creates extra child
<Stack>
  {/* This creates a child node and triggers warning */}
  <Stack.Screen name="home" />
</Stack>
```

**Files to Check**: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(modals)/_layout.tsx`

### DNS Query Issues

**Symptom**: "All DNS transport methods failed"

**Common Causes**:
1. **Network blocks port 53**: Corporate firewalls or public WiFi
   - Switch to different network (WiFi ↔ cellular)
   - Enable "Allow Experimental Transports" in Settings

2. **DNS-over-HTTPS limitation**: Cannot reach ch.at custom TXT
   - Use Native/UDP/TCP methods (experimental transports)
   - Mock service as fallback for testing

3. **App backgrounded**: Queries suspend during backgrounding
   - Bring app to foreground before querying

**Troubleshooting**:
- Check DNS logs in app (Logs tab)
- Try different DNS server (Settings → DNS Service)
- Enable verbose logging in Settings

### React Context Memoization Patterns

**Symptom**: Navigation handlers or callbacks stop working, components don't update when context changes, or stale data appears in callbacks.

**Root Cause**: Context providers creating new objects/functions on every render, causing:
1. All consuming components re-render unnecessarily
2. Child callbacks capture stale closure values
3. React.memo components with custom comparisons miss updates
4. Navigation handlers reference outdated state

**Solution**: Proper memoization pattern in Context providers:

```typescript
// REQUIRED: Wrap ALL callbacks in useCallback
const deleteChat = useCallback(async (chatId: string) => {
  // Use functional setState updates to avoid dependencies
  setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
  setCurrentChat((current) => current?.id === chatId ? null : current);
}, []); // No dependencies with functional updates

const sendMessage = useCallback(async (content: string) => {
  // Include dependencies that the function actually uses
  if (!currentChat) return;

  // ... implementation using currentChat, settings
}, [currentChat, settings, loadChats]); // List actual dependencies

// REQUIRED: Wrap context value in useMemo with ALL dependencies
const contextValue = useMemo(() => ({
  chats,
  currentChat,
  isLoading,
  error,
  createChat,
  deleteChat,
  sendMessage,
  loadChats,
  setCurrentChat, // setState functions are already stable
  clearError,
}), [
  chats,
  currentChat,
  isLoading,
  error,
  createChat,
  deleteChat,
  sendMessage,
  loadChats,
  clearError,
]);
```

**Critical Rules**:
1. ALL functions in context value MUST be wrapped in `useCallback`
2. Context value object MUST be wrapped in `useMemo`
3. List ALL dependencies in both hooks (ESLint exhaustive-deps will help)
4. Use functional setState updates (`setState(prev => ...)`) to minimize dependencies
5. setState functions from `useState` are already stable and don't need wrapping

**When to Use Functional setState**:
- When updating state based only on previous state value
- To avoid adding state variables as dependencies to useCallback
- For simple transformations (filter, map, etc.)

**Example from ChatContext** (`src/context/ChatContext.tsx`):
- `deleteChat`: Uses functional updates, no dependencies needed
- `sendMessage`: Needs `currentChat` and `settings`, listed as dependencies
- `contextValue`: Memoized with all values and callbacks as dependencies

**Impact of Missing Memoization**:
- Navigation buttons may stop working (stale closure captures old router reference)
- Callbacks in child components reference outdated state
- Performance degrades from excessive re-renders
- React.memo optimizations become ineffective

**Files to Check**: All Context providers in `src/context/`

## Testing Checklist

Before committing:
1. Test on iOS simulator (`npm run ios`)
2. Test on Android emulator (`npm run android`)
3. Verify DNS queries work: `node test-dns.js "test"`
4. Check native module registration (console logs)
5. Run version sync if needed: `npm run sync-versions`
6. Update CHANGELOG.md for significant changes
7. Run tests: `npm test`

## Apple Platforms

### Swift & iOS Development

**Language Preferences**:
- Favor Apple programming languages and frameworks: Swift, Objective-C, C, C++
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

### Code Organization

- Feature-based folders (NOT Models/, Views/, ViewModels/)
- Related code in same file when appropriate
- Extensions for organization within large files
- Keep files < 300 lines when possible

## Documentation Structure

- `/docs/technical/` - Specifications and guides
- `/docs/troubleshooting/` - Common issues
- `/docs/architecture/` - System design
- `/docs/REF_DOC/` - Reference documentation (1096+ markdown files)
  - `docs/REF_DOC/docs_apple/` - Swift, SwiftUI, Liquid Glass, HIG
  - `docs/REF_DOC/docs_expo_dev/` - Complete Expo guides and API references
  - `docs/REF_DOC/docs_reactnative_getting-started/` - New Architecture, platform integration
- `CHANGELOG.md` - Release history (source of truth for versions)

**CRITICAL**: Always consult `docs/REF_DOC/` BEFORE implementing features or answering questions about Expo, React Native, iOS, or Swift.

## Important Notes & Guidelines

### Code Quality Standards

- **John Carmack** reviews all code - maintain highest quality
- **Follow KISS principle** - Keep It Simple, Stupid
- **Critical thinking required** - Push reasoning to 100%, think step-by-step
- **Domain experts verify** - Best people in field will review

### Documentation & Communication

- **Update CHANGELOG.md** for all changes following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- **Always refer to docs** - Check `docs/` and `docs/REF_DOC/` before implementing
- **No unnecessary markdown** - Only create docs if explicitly requested
- **Concise communication** - Sacrifice grammar for brevity
- **List unresolved questions** - At end of responses if any

### Development Workflow

- **Test thoroughly** before releases (iOS, Android, real DNS queries)
- **Atomic commits** - Commit only touched files, list paths explicitly
- **Use tmux** - Execute commands in tmux when possible
- **Native DNS prioritized** - Over network methods for best performance

### Documentation Structure

**AGENTS.md / CLAUDE.md** - How to work on this codebase (READ FIRST)
**PROJECT_STATUS.md** - Current progress, what's next, blockers (READ SECOND)
**README.md** - Human-readable project overview
**QUICKSTART.md** - User getting started guide (optional)

### Reference Documentation

See `docs/REF_DOC/` for comprehensive reference:
- `docs/REF_DOC/docs_apple/` - Swift, SwiftUI, Liquid Glass, HIG (1096+ files)
- `docs/REF_DOC/docs_expo_dev/` - Complete Expo guides and API references
- `docs/REF_DOC/docs_reactnative_getting-started/` - New Architecture, platform integration
