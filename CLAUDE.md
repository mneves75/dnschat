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

## Critical Development Guidelines

**IMPORTANT**: These rules OVERRIDE default behavior and MUST be followed:

1. **No Documentation Files**: Never create markdown files after completing tasks unless explicitly instructed. Use `agent_planning/` for planning docs only, archive when done.

2. **Use ast-grep**: For syntax-aware searches, always use `ast-grep --lang typescript -p '<pattern>'` (or appropriate language) instead of rg/grep.

3. **No Emojis**: Never use emojis in code or commit messages.

4. **CHANGELOG.md Updates**: Always update CHANGELOG.md for significant changes following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

5. **Expo Go Limitation**: Expo Go does not support custom native modules. Use Development Builds (`npm run ios/android`) to test DNS functionality.

6. **Development Build Required**: Custom native DNS modules require `expo run:ios` or `expo run:android` - Expo Go will not work.

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

## Important Notes

- **John Carmack** reviews all code - maintain high quality
- **Update CHANGELOG.md** for all changes following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- **Follow KISS principle** - Keep It Simple, Stupid
- **Test thoroughly** before releases (iOS, Android, real DNS queries)
- **Native DNS prioritized** over network methods for best performance
