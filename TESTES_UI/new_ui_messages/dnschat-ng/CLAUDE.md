# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native mobile messaging app (iOS, Android, Web) built with Expo SDK 54 and React 19. Features iMessage-style chat interface with native UICollectionView-based message rendering (iOS), mock conversation system with auto-replies, and Worklets-based animations.

## Core Commands

```bash
# Development
npm start                # Start Expo dev server
npm run ios             # Run on iOS simulator
npm run android         # Run on Android emulator
npm run web             # Run web preview

# Testing & Quality
npm test                # Run Jest tests
npx expo test           # Alternative test runner
npx prettier --write .  # Format code
npx expo start --clear  # Clear Metro cache
```

## Critical Development Guidelines

**IMPORTANT**: These rules OVERRIDE default behavior and MUST be followed:

1. **No Documentation Files**: Never create markdown files after completing tasks unless explicitly instructed. Use `agent_planning/` for planning docs only, archive when done.

2. **Use ast-grep**: For syntax-aware searches, always use `ast-grep --lang typescript -p '<pattern>'` (or appropriate language) instead of rg/grep.

3. **No Emojis**: Never use emojis in code or commit messages.

4. **StyleSheet.create Required**: Always use `StyleSheet.create`, never inline styles. This is a hard requirement for performance.

5. **Expo SDK 54**: This project uses Expo SDK 54 with React Native New Architecture enabled (`"newArchEnabled": true` in app.json).

## Tech Stack

### Framework & Language
- **React Native**: 0.81.4 with New Architecture (Fabric + TurboModules)
- **Expo SDK**: 54.0.13 stable
- **React**: 19.1.0 with React Compiler enabled (auto-memoization)
- **TypeScript**: 5.9.2 (strict mode)
- **Navigation**: Expo Router v6 with file-based routing
- **Animations**: react-native-worklets 0.5.1 and react-native-reanimated 4.1.1

### UI & Styling
- **Styling**: StyleSheet.create only (no inline styles)
- **Safe Area**: react-native-safe-area-context
- **Colors**: @react-navigation/native theme system
- **Icons**: @expo/vector-icons (FontAwesome)

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
├── messages/                # Messages screens
│   └── [conversationId].tsx # Dynamic chat detail route
└── modal.tsx               # Modal screen

context/
└── MessageProvider.tsx     # Message state management

components/
├── messages/
│   └── MessageListItem.tsx # Conversation list item
├── Themed.tsx              # Themed components
└── useColorScheme.ts       # Theme hook
```

### State Management (MessageProvider)

Located in `context/MessageProvider.tsx`, provides:

- **Message State**: Conversations, messages, unread counts, timestamps
- **Auto-Reply System**: Simulates conversation partners with random delays (600-1500ms)
- **Hooks**:
  - `useMessages()`: Returns all conversations
  - `useConversation(id)`: Returns specific conversation
  - `useMessageActions()`: Returns `sendMessage`, `markConversationRead`, `refreshConversations`

**Key Architecture Patterns**:
- useReducer for state management
- useCallback with proper dependencies for all functions
- useMemo for context value to prevent unnecessary re-renders
- Functional setState updates to minimize dependencies
- Conversation sorting by `lastMessageAt` timestamp

**Seed Data**: 5 mock conversations with participants (Ana, Devon, Priya, Max, June) and realistic message history.

### Dynamic Routes

- **Chat Detail**: `app/messages/[conversationId].tsx` handles individual conversations
- **Navigation**: Uses Expo Router's `useLocalSearchParams` for route params
- **Title Updates**: Dynamically sets navigation title from conversation data

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

### Conversation Screen Architecture

Located in `app/messages/[conversationId].tsx`:

- **Native Rendering**: Uses `NativeChatView` on iOS when available
- **Fallback**: FlatList for Android/Web with standard message bubbles
- **KeyboardAvoidingView**: Handles keyboard appearance (iOS padding offset: 88)
- **Composer**: TextInput with Send button, disabled when empty
- **Mark Read**: Uses `useFocusEffect` to clear unread count when screen focused

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
- **Console.log**: Remove from production builds
- **Memoization**: Let React Compiler handle, avoid manual useMemo/useCallback unless profiled
- **Release Testing**: Always test performance in release mode

### TypeScript Guidelines

- **Strict Mode**: Enabled in tsconfig.json
- **No any**: Never use `any` type
- **Path Alias**: Use `@/` for imports (e.g., `@/components/Themed`)
- **Type Exports**: Export types from context/component files

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
    scheduleReply(conversationId);
  },
  [scheduleReply]  // Include dependencies
);

// Wrap context value in useMemo with ALL dependencies
const value = useMemo<MessageContextValue>(
  () => ({
    conversations: state.conversations,
    sendMessage,
    markConversationRead,
    refreshConversations,
    getConversation
  }),
  [state.conversations, sendMessage, markConversationRead, refreshConversations, getConversation]
);
```

**Impact of Missing Memoization**:
- Navigation buttons may stop working (stale closure captures old router reference)
- Callbacks in child components reference outdated state
- Performance degrades from excessive re-renders

## Worklets and Animations

**Dependencies**: react-native-worklets (0.5.1) and react-native-reanimated (4.1.1)

**Important**: Worklets run on a separate JavaScript thread for 60fps animations without blocking the main JS thread.

**Usage Pattern**:
```typescript
import { useWorklet } from 'react-native-worklets';

const worklet = useWorklet(() => {
  'worklet';
  // Code that runs on worklet thread
  return value;
});
```

**Key Points**:
- Mark worklet functions with `'worklet'` directive
- Worklets enable smooth gesture-driven animations
- Used with Reanimated for shared values and animated styles
- See react-native-worklets documentation for advanced patterns

## Expo SDK 54 FileSystem API

**IMPORTANT**: Expo SDK 54 uses new object-oriented FileSystem API as default.

```typescript
import { Directory, File } from "expo-file-system";

// Create file in picked directory
const directory = await Directory.pickDirectoryAsync("Documents");
if (!directory) return; // User canceled

const file = directory.createFile(fileName, "application/json");
file.write(JSON.stringify(content)); // Write string or Uint8Array
```

**Key Points**:
- Use `Directory.createFile(name, mimeType)` instead of manual file creation
- Always check if directory picker was canceled (returns null)
- Serialize objects to JSON strings before writing
- Legacy methods (`FileSystem.writeAsStringAsync`) throw errors in SDK 54
- See `DOCS/EXPO-SDK-54-TIPS.md` for detailed implementation guide

## Native Module Development (expo-chatview)

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

**Key Patterns**:
```swift
// Module definition
public final class ExpoChatViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoChatView")

    View(ExpoChatView.self) {
      Events("onNearTop", "onVisibleIdsChange")
      Prop("messages") { (view: ExpoChatView, messages: [MessageDTO]?) in
        view.update(messages: messages ?? [])
      }
      AsyncFunction("scrollToEnd") { (view: ExpoChatView, animated: Bool?) in
        await MainActor.run { view.scrollToEnd(animated: animated ?? true) }
      }
    }
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

## Testing Checklist

Before committing:
1. Test on iOS simulator with native chat view (`npm run ios`)
2. Test on Android emulator with FlatList fallback (`npm run android`)
3. Verify no layout warnings in console
4. Check navigation flows work correctly
5. Test keyboard handling in conversation screen
6. Verify auto-scroll works with native UICollectionView (iOS)
7. Test message bubble rendering with SwiftUI MessageRow
8. Check native module registration in console
9. Run tests: `npm test` (if configured)

## Documentation Structure

- `/DOCS/` - Technical documentation
  - `EXPO-SDK-54-TIPS.md` - FileSystem API implementation guide
  - `PRD-2025-10-12.md` - Product requirements document
  - `REF_DOC/` - Reference documentation (if present)
- `AGENTS.md` - Repository guidelines and workflow
- `modules/expo-chatview/` - Native chat view module
  - `src/index.ts` - TypeScript API exports
  - `ios/` - Swift implementation files
  - `expo-module.config.json` - Module configuration

## Important Notes

- **John Carmack** reviews all code - maintain high quality
- **Follow KISS principle** - Keep It Simple, Stupid
- **Test thoroughly** before releases (iOS with native module, Android with fallback)
- **Native modules require development builds** - `expo start` will not work for testing native code
