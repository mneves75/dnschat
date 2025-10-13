# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native mobile messaging app (iOS, Android, Web) built with Expo SDK 54 and React 19. Features iMessage-style chat interface that uses DNS TXT queries as the transport layer. Messages are sent via DNS queries to DNS servers that return responses as TXT records. Includes native UICollectionView-based message rendering (iOS), multi-transport DNS fallback (Native/UDP/TCP/HTTPS), and persistent conversation storage.

## Core Commands

```bash
# Development
npm start                # Start Expo dev server
npm run ios             # Run on iOS simulator (requires development build for native DNS module)
npm run android         # Run on Android emulator (requires development build)
npm run web             # Run web preview (no native DNS, HTTPS only)
```

## Critical Development Guidelines

**IMPORTANT**: These rules OVERRIDE default behavior and MUST be followed:

1. **No Documentation Files**: Never create markdown files after completing tasks unless explicitly instructed. Use `agent_planning/` for planning docs only, archive when done.

2. **Use ast-grep**: For syntax-aware searches, always use `ast-grep --lang typescript -p '<pattern>'` (or appropriate language) instead of rg/grep.

3. **No Emojis**: Never use emojis in code or commit messages.

4. **StyleSheet.create Required**: Always use `StyleSheet.create`, never inline styles. This is a hard requirement for performance.

5. **Expo SDK 54**: This project uses Expo SDK 54 with React Native New Architecture enabled (`"newArchEnabled": true` in app.json).

6. **Development Builds Required**: Custom native modules (expo-chatview, dns-native) require `expo run:ios` or `expo run:android` - Expo Go will not work.

## Tech Stack

### Framework & Language
- **React Native**: 0.81.4 with New Architecture (Fabric + TurboModules)
- **Expo SDK**: 54.0.13 stable
- **React**: 19.1.0 with React Compiler enabled (auto-memoization)
- **TypeScript**: 5.9.2 (strict mode)
- **Navigation**: Expo Router v6 with file-based routing
- **Animations**: react-native-worklets 0.5.1 and react-native-reanimated 4.1.1

### DNS & Networking
- **DNS Transport**: Native DNS (iOS/Android), UDP (`react-native-udp`), TCP (`react-native-tcp-socket`), HTTPS (dns.google)
- **DNS Packet**: `dns-packet` for encoding/decoding DNS messages
- **DNS Servers**: Whitelisted servers in `constants/dns.ts` (default: configurable via Preferences)

### UI & Styling
- **Styling**: StyleSheet.create only (no inline styles)
- **Safe Area**: react-native-safe-area-context
- **Colors**: @react-navigation/native theme system
- **Icons**: @expo/vector-icons (FontAwesome)
- **Lists**: @shopify/flash-list for efficient message rendering

### Storage
- **AsyncStorage**: `@react-native-async-storage/async-storage` for persistence
- **Conversations**: Stored in `storage/conversations.ts` with automatic save debouncing (350ms)
- **Preferences**: Stored in `storage/preferences.ts` for user settings and DNS configuration

### Native Modules
- **expo-chatview**: Custom Expo module for native chat UI (iOS-only)
  - iOS: UICollectionView with SwiftUI MessageRow cells
  - Uses UICollectionViewDiffableDataSource for efficient updates
  - Exports `NativeChatView` component and `ExpoChatViewModule` for scrolling
  - Located in `modules/expo-chatview/`

## Architecture

### File-Based Routing (Expo Router)

```
app/
├── _layout.tsx              # Root layout with providers
├── +not-found.tsx           # 404 screen
├── (tabs)/                  # Tab group
│   ├── _layout.tsx          # Tab bar layout
│   ├── index.tsx            # Conversations list (home)
│   └── two.tsx              # Secondary tab
├── chat/                    # Chat screens
│   └── [conversationId].tsx # Dynamic chat detail route
├── new-chat.tsx            # Modal: Create new conversation
└── modal.tsx               # Generic modal screen

context/
├── MessageProvider.tsx     # Conversation & message state
├── TransportProvider.tsx   # DNS transport state & execution
└── PreferencesProvider.tsx # User preferences & settings

services/
└── DNSTransportService.ts  # DNS query execution with multi-transport fallback

storage/
├── conversations.ts        # AsyncStorage persistence for conversations
└── preferences.ts          # AsyncStorage persistence for settings

components/
├── chat/
│   └── ChatView.tsx        # Native iOS chat view or FlashList fallback
├── messages/
│   └── MessageListItem.tsx # Conversation list item
└── ui/
    └── GlassContainer.tsx  # Blur container for iOS glass effects
```

### State Management (Context Providers)

**MessageProvider** (`context/MessageProvider.tsx`):
- Manages conversations and messages
- Persists to AsyncStorage with debouncing (350ms delay)
- Hydrates state on mount from AsyncStorage
- Provides hooks:
  - `useMessages()`: Returns all conversations
  - `useConversation(id)`: Returns specific conversation
  - `useMessageActions()`: Returns CRUD operations
  - `useMessagesHydration()`: Returns hydration status

**TransportProvider** (`context/TransportProvider.tsx`):
- Wraps DNSTransportService for query execution
- Manages loading/error states
- Uses user's transport preferences from PreferencesProvider
- Provides hooks:
  - `useTransport()`: Returns `executeQuery`, `status`, `error`, `resetError`

**PreferencesProvider** (`context/PreferencesProvider.tsx`):
- Manages user preferences (DNS server, transport methods, theme)
- Persists to AsyncStorage
- Provides hooks:
  - `usePreferences()`: Returns all preferences
  - `usePreferenceActions()`: Returns update functions

**Key Architecture Patterns**:
- useReducer for complex state (MessageProvider)
- useCallback with proper dependencies for all functions
- useMemo for context value to prevent unnecessary re-renders
- Functional setState updates to minimize dependencies
- Debounced AsyncStorage writes to avoid performance issues

### DNS Transport Layer

**DNSTransportService** (`services/DNSTransportService.ts`):

Multi-transport DNS query service with automatic fallback:

1. **Native DNS**: iOS (Network Framework), Android (DnsResolver API)
   - Requires `modules/dns-native/` module
   - Only available in development builds (not Expo Go)

2. **UDP DNS**: Direct socket queries to DNS servers
   - Requires `react-native-udp` package
   - May be blocked on corporate networks (port 53)

3. **TCP DNS**: TCP-based DNS queries with length prefix
   - Requires `react-native-tcp-socket` package
   - Fallback when UDP is blocked

4. **HTTPS DNS**: DNS-over-HTTPS via dns.google
   - Always available (fetch API)
   - Limited: cannot reach custom DNS servers with custom TXT responses

**Query Flow**:
1. User sends message → `TransportProvider.executeQuery()`
2. Message sanitized and converted to DNS label via `buildDnsQueryLabel()`
3. DNSTransportService tries transports in order (based on user preferences)
4. Implements retry logic (max 3 attempts) with exponential backoff
5. Returns parsed TXT records as `QueryResult`
6. Records parsed for multi-part responses (e.g., `1/3:part1`, `2/3:part2`)

**Rate Limiting**:
- Max 10 requests per 60 seconds (prevents DNS abuse)
- Throws `RateLimitError` when limit exceeded

**Backgrounding Detection**:
- Pauses queries when app is backgrounded
- Throws `BackgroundedError` if query attempted while paused

### Chat Screen Architecture

Located in `app/chat/[conversationId].tsx`:

- **Native Rendering**: Uses `NativeChatView` on iOS when available
- **Fallback**: FlashList for Android/Web with standard message bubbles
- **KeyboardAvoidingView**: Handles keyboard appearance (iOS padding offset: 88)
- **Composer**:
  - TextInput with validation (max 253 characters after normalization)
  - Character counter and validation error display
  - Send button disabled when invalid or loading
- **DNS Query Flow**:
  1. User types message and presses Send
  2. Message validated and sent to `MessageProvider.sendMessage()`
  3. Outgoing message added to conversation immediately
  4. `TransportProvider.executeQuery()` triggered
  5. Loading overlay shown during DNS query
  6. Response parsed and added as incoming message
  7. Error banner shown if query fails, with Retry button
- **Mark Read**: Uses `useFocusEffect` to clear unread count when screen focused

### Native Chat View (expo-chatview)

Located in `modules/expo-chatview/`, provides iOS-native chat rendering:

**Architecture**:
- **iOS Implementation**: UICollectionView with UICollectionViewDiffableDataSource
- **Cell Rendering**: SwiftUI MessageRow embedded in UIHostingConfiguration (iOS 16+)
- **Props**: `messages`, `contentBottomInset`, `onNearTop`, `onVisibleIdsChange`, `onPressMessage`
- **Module Methods**: `scrollToEnd(viewTag, animated)` via ExpoChatViewModule

**Key Features**:
- Auto-scroll to bottom when near bottom (isNearBottom threshold: 120px)
- Emits `onNearTop` when scrolled within 120px of top (for pagination)
- Tracks visible message IDs with `onVisibleIdsChange`
- Interactive keyboard dismissal (`keyboardDismissMode: .interactive`)
- Compositional layout with automatic cell sizing

**Usage Pattern**:
```typescript
import { NativeChatView, isNativeChatViewAvailable } from 'expo-chatview';

if (isNativeChatViewAvailable) {
  <NativeChatView
    messages={messages}
    contentBottomInset={keyboardHeight}
    onNearTop={() => console.log('Load more')}
  />
}
```

**Files**:
- `modules/expo-chatview/src/index.ts` - TypeScript bindings
- `modules/expo-chatview/ios/ExpoChatView.swift` - UICollectionView implementation
- `modules/expo-chatview/ios/MessageRow.swift` - SwiftUI message bubble
- `modules/expo-chatview/ios/ExpoChatViewModule.swift` - Expo module definition
- `modules/expo-chatview/ios/MessageDTO.swift` - Message data transfer object

### DNS Configuration

**Whitelisted DNS Servers** (`constants/dns.ts`):
- Define allowed DNS servers with host, port, protocol
- Default server configurable via PreferencesProvider
- Security: Only whitelisted servers allowed (prevents arbitrary DNS queries)

**DNS Label Construction** (`utils/dnsLabel.ts`):
- Converts message to DNS-safe label (max 63 chars per label)
- Appends conversation ID for context/routing
- Sanitizes: lowercase, trim, replace spaces with dashes, remove invalid chars

**Record Parsing**:
- Supports multi-part TXT responses (e.g., `1/3:content`, `2/3:content`, `3/3:content`)
- Assembles parts in order by numeric ID
- Falls back to single-part responses

## Development Guidelines

### React Native Best Practices

**Performance**:

```typescript
// REQUIRED: Always use StyleSheet.create
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

// NEVER: Inline styles (creates new object every render)
<View style={{ flex: 1, backgroundColor: '#fff' }}>
```

**Context Memoization**:

```typescript
// REQUIRED pattern for all Context providers
const contextValue = useMemo(() => ({
  data,
  action1,
  action2,
}), [data, action1, action2]); // List ALL dependencies

// Wrap ALL callbacks in useCallback
const action1 = useCallback(() => {
  // Use functional setState to avoid dependencies
  setState(prev => prev.filter(x => x.id !== id));
}, []); // Minimal dependencies
```

**Critical Rules**:
- **StyleSheet.create**: Always use, never inline styles
- **Console.log**: Remove from production builds (use `if (__DEV__)` guards)
- **Memoization**: Let React Compiler handle, avoid manual useMemo/useCallback unless profiled
- **Release Testing**: Always test performance in release mode
- **FlashList**: Use for lists with 10+ items instead of FlatList

### TypeScript Guidelines

- **Strict Mode**: Enabled in tsconfig.json
- **No any**: Never use `any` type
- **Path Alias**: Use `@/` for imports (e.g., `@/components/Themed`)
- **Type Exports**: Export types from context/component files
- **DNS Types**: Located in `services/DNSTransportService.ts` and `types/external.d.ts`

### DNS Development Guidelines

**Testing DNS Queries**:
1. Use development builds (not Expo Go) for native DNS module
2. Test all transports individually via Preferences screen
3. Verify rate limiting works (10 requests/min)
4. Test backgrounding behavior (queries pause)
5. Test error handling (network offline, DNS server unreachable)

**DNS Server Requirements**:
- Must return TXT records for queries to `<label>.<domain>`
- Support multi-part responses with `id/total:content` format
- Respond within 10 seconds (QUERY_TIMEOUT_MS)
- Listed in `constants/dns.ts` DNS_SERVER_WHITELIST

**Common DNS Issues**:
- UDP/TCP blocked: Use HTTPS transport or different network
- Native module unavailable: Requires development build, not Expo Go
- Rate limit errors: Wait 60 seconds or increase RATE_LIMIT_MAX_REQUESTS
- Timeout errors: Check DNS server availability and network conditions

### Styling Requirements

All interactive elements MUST have:
- `accessibilityLabel`: Descriptive label
- `accessibilityRole`: "button", "link", "header", etc.
- `accessibilityState`: For disabled, selected, checked states

**Contrast Requirements**:
- Text: Minimum 4.5:1
- Large text/UI components: Minimum 3:1

### Layout Children Warnings (Expo Router)

**CRITICAL**: JSX comments inside Stack/Tabs components create extra child nodes and trigger warnings.

**Solution**: Move ALL JSX comments OUTSIDE layout component JSX:

```typescript
// CORRECT: Comment outside component
// This is a route configuration comment
<Stack.Screen name="home" />

// WRONG: Comment inside component creates extra child
<Stack>
  {/* This creates a child node and triggers warning */}
  <Stack.Screen name="home" />
</Stack>
```

**Files to Check**: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`

### Context Memoization Best Practices

**From MessageProvider.tsx**:

```typescript
// Wrap ALL functions in useCallback
const sendMessage = useCallback(
  (conversationId: string, text: string) => {
    if (!text.trim()) return;
    const message: Message = { /* ... */ };
    dispatch({ type: 'SEND_MESSAGE', payload: { conversationId, message } });
  },
  [] // Use functional setState to minimize dependencies
);

// Wrap context value in useMemo with ALL dependencies
const value = useMemo<MessageContextValue>(
  () => ({
    conversations: state.conversations,
    sendMessage,
    markConversationRead,
    refreshConversations,
    getConversation,
    isHydrated
  }),
  [state.conversations, sendMessage, markConversationRead, refreshConversations, getConversation, isHydrated]
);
```

**Impact of Missing Memoization**:
- Navigation buttons may stop working (stale closure captures old router reference)
- Callbacks in child components reference outdated state
- Performance degrades from excessive re-renders

## Native Module Development

### expo-chatview Module

**Structure**: Custom Expo modules use expo-modules-core for Fabric/TurboModule compatibility

**iOS Development**:
- Swift-only implementation (no Objective-C)
- Use `Module { }` DSL from expo-modules-core
- View components extend `ExpoView`
- Async functions use Swift concurrency (`async/await`)
- Always use `@MainActor` for UI operations

**Module Configuration** (`expo-module.config.json`):
```json
{
  "ios": {
    "modules": ["ExpoChatViewModule"]
  }
}
```

**Autolinking**: Expo automatically discovers modules in `modules/*/` directories
- No manual Podfile entries needed
- Module must have `expo-module.config.json`
- iOS code in `ios/` directory
- TypeScript bindings in `src/index.ts`

**Testing Native Modules**:
1. Clean iOS build: `rm -rf ios/Pods ios/build`
2. Reinstall pods: `cd ios && pod install && cd ..`
3. Run development build: `npm run ios`
4. Check console for module registration logs

### dns-native Module

Located in `modules/dns-native/` (if present):
- iOS: Swift + Network Framework (iOS 16.0+)
- Android: Java + DnsResolver API (API 29+)
- Exports `queryTXT(domain, message)` method
- Returns array of TXT record strings

## Common Issues & Fixes

### Layout Children Warnings

**Symptom**: "Layout children must be of type Screen, all other children are ignored"

**Solution**: Remove JSX comments from inside Stack/Tabs components. Move comments outside JSX.

### Navigation Issues

**Symptom**: Buttons stop working, stale state in callbacks

**Solution**: Ensure all context functions use `useCallback` and context value uses `useMemo` with complete dependency arrays.

### Performance Issues

**Symptom**: App feels sluggish, excessive re-renders

**Solution**:
1. Verify all styles use `StyleSheet.create`
2. Check context memoization patterns
3. Test in release mode: `expo run:ios --configuration Release`

### Native Module Issues (expo-chatview)

**Symptom**: Module not found or NativeChatView is null

**Solution**:
1. Verify `modules/expo-chatview/expo-module.config.json` exists
2. Clean and rebuild: `rm -rf ios/Pods ios/build && cd ios && pod install && cd ..`
3. Check Xcode build output for module registration
4. Verify `isNativeChatViewAvailable` before using NativeChatView
5. Run `npm run ios` (not `expo start` - native modules need dev builds)

**Symptom**: UICollectionView not scrolling or auto-scrolling incorrectly

**Solution**:
1. Check `contentBottomInset` prop matches keyboard height
2. Verify messages array is sorted by `createdAt` (ascending)
3. Ensure `scrollToEnd` is called after layout completes
4. Check console for Swift errors in ExpoChatView.swift

### DNS Query Issues

**Symptom**: "All DNS transports failed"

**Common Causes**:
1. **Network blocks port 53**: Corporate firewalls or public WiFi
   - Switch to different network (WiFi ↔ cellular)
   - Enable HTTPS transport in Preferences

2. **Native module unavailable**: Not using development build
   - Run `npm run ios` or `npm run android` (not `expo start`)
   - Cannot use Expo Go for native DNS

3. **Rate limit exceeded**: Too many queries in 60 seconds
   - Wait 60 seconds before retrying
   - Check RATE_LIMIT_MAX_REQUESTS in DNSTransportService

4. **App backgrounded**: Queries suspend during backgrounding
   - Bring app to foreground before querying

**Troubleshooting**:
- Check transport order in Preferences
- Try different DNS server
- Enable verbose logging in `__DEV__` mode
- Test with HTTPS transport (always available)

### AsyncStorage Issues

**Symptom**: Conversations not persisting across app restarts

**Solution**:
1. Verify `isHydrated` is `true` before operations
2. Check `saveConversations` debounce logic (350ms delay)
3. Ensure cleanup in `useEffect` runs on unmount
4. Check AsyncStorage quota on device

## Testing Checklist

Before committing:
1. Test on iOS simulator with native chat view (`npm run ios`)
2. Test on Android emulator with FlashList fallback (`npm run android`)
3. Verify DNS queries work with all enabled transports
4. Test rate limiting (send 11+ messages quickly)
5. Test backgrounding behavior (query pauses)
6. Verify no layout warnings in console
7. Check navigation flows work correctly
8. Test keyboard handling in conversation screen
9. Verify auto-scroll works with native UICollectionView (iOS)
10. Test message bubble rendering with SwiftUI MessageRow
11. Check native module registration in console
12. Verify conversation persistence (AsyncStorage)
13. Test error handling (network offline, DNS timeout)

## Documentation Structure

- `/DOCS/` - Technical documentation
  - `DNSCHATNG-DETAILED-TODO-20251013.md` - Project roadmap and tasks
  - `REF_DOC/` - Reference documentation (if present)
- `AGENTS.md` - Repository guidelines and workflow
- `modules/expo-chatview/` - Native chat view module
  - `src/index.ts` - TypeScript API exports
  - `ios/` - Swift implementation files
  - `expo-module.config.json` - Module configuration
- `modules/dns-native/` - Native DNS module (if present)

## Important Notes

- **John Carmack** reviews all code - maintain high quality
- **Follow KISS principle** - Keep It Simple, Stupid
- **Test thoroughly** before releases:
  - iOS with native chat view and native DNS
  - Android with FlashList fallback and native DNS
  - All DNS transports (Native, UDP, TCP, HTTPS)
  - Real DNS queries to whitelisted servers
- **Native modules require development builds** - `expo start` will not work for testing native code
- **DNS queries are real** - respect rate limits and server availability
