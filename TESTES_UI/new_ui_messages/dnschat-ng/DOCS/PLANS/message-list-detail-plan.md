# Message List & Detail Screens Plan

## 0. References & Constraints
- **Primary spec**: `DOCS/PROMPT-IMESSAGE-LIKE-SCREEN-MAIN.swift` (Expo SDK 54, Fabric, Swift `UICollectionView` renderer with React-driven data).
- **Scope**: Implement only the first tab (message list) and a message detail screen that simulates send/receive flows with mocked replies.
- **Non-goals**: Real networking, persistence, or Android-native renderer (JS fallback acceptable if Swift Fabric view is pending).

## 1. Architecture Decisions
1. **Navigation**: Use Expo Router stack nested under `(tabs)` for the list → detail flow. Add a dedicated `messages` segment with `[conversationId].tsx`.
2. **State layer**: Co-locate a lightweight message store in `src/context/MessageContext.tsx` (or `app/context` per repo conventions) using React state + reducer, mirroring React Query caches described in the spec. Provide in-memory seeded conversations.
3. **Native bridge strategy**: Prepare for the Fabric `ChatView` module by defining a TypeScript interface (`components/chat/ChatView.tsx`) that can swap between the native implementation and a JS placeholder while the module is in progress.

## 2. Data & Mocking
1. Seed `mockConversations` with 5–8 threads, each containing participants, last message preview, unread count, and `messages` array sorted newest-last.
2. Implement a `simulateReply(conversationId, userMessage)` helper that waits 600–1500 ms, then enqueues a reply from a random persona using canned answers. Store timers per conversation to avoid double replies.
3. Ensure deterministic IDs (e.g., `nanoid`) so diffable data sources will align once the Fabric view lands.

## 3. Message List (First Tab)
1. Replace `app/(tabs)/index.tsx` with a `MessageListScreen`:
   - Render `FlashList` (placeholder until native integration) with rows showing avatar initials, name, snippet, timestamp, unread badge.
   - Add pull-to-refresh stub calling `refreshConversations()` (currently refetch mock data).
   - Hook row press to `router.push('/messages/[conversationId]')`.
2. Create `components/messages/MessageListItem.tsx` for row presentation; share color tokens via `constants/Colors.ts`.
3. Wire list screen to the context provider, memoizing derived sections (`pinned`, `recent`) to match the iMessage spec feel.

## 4. Message Detail Screen
1. Add `app/messages/[conversationId].tsx` with a stack header styled per spec (contact name, online status chip, call icons as placeholders).
2. Body layout: Mount the shared `<ChatView />` abstraction, which now proxies to a JS fallback and will switch to Fabric once the native view ships.
3. Composer:
   - TextInput + attach button + send button with disabled state when empty.
   - On send: append optimistic message, clear input, call `simulateReply` to enqueue mock response.
4. Scroll behavior: auto-scroll to end on new messages; if user is scrolled up, show “Tap to jump to latest” pill as described in the spec.

## 5. Provider & Hooks
1. Create `context/MessageProvider.tsx` exporting `MessageProvider`, `useMessages()`, `useConversation(conversationId)`, and `useSendMessage()`.
2. Inside provider, manage conversations state, update preview metadata on every send/receive, and expose `markConversationRead`.
3. Register provider at the root (`app/_layout.tsx`) to wrap the Router tree.

## 6. Visual & Theming Details
1. Match bubble colors: user = hex `#0A84FF`, others = `Color(UIColor.secondarySystemBackground)` equivalent; respect light/dark themes using existing `useColorScheme`.
2. Typography: use SF UI fonts bundled in Expo (`System font`) with sizes per spec (body 16, timestamp 12).
3. Spacing: 12 px horizontal padding inside bubbles, 8 px vertical, 20 px row spacing, 16 px screen padding.

## 7. Simulation & System Behaviors
1. For each outgoing message, trigger `setTimeout` reply with random text snippet and optionally attachments placeholder (future).
2. Cap simulated history at ~50 messages per thread; implement lazy prepend once native infinite scroll arrives.
3. Log telemetry (console for now) when `onNearTop` or `onVisibleIdsChange` fire, mirroring the Fabric events API.

## 8. Testing & Verification
1. Write component tests with Jest + React Native Testing Library for `MessageListItem` and the composer logic (mock timers).
2. Add integration tests exercising `simulateReply` to ensure only one reply per send and proper state updates.
3. Manual QA checklist:
   - Tab list renders seeded conversations.
   - Navigating to detail shows history and auto-scrolls.
   - Sending message immediately echoes bubble and triggers random reply.
   - Dark mode layout respects colors.

## 9. Future Native Integration Hooks
1. `modules/expo-chatview` now exists with a placeholder package exporting `NativeChatView` detection; wire Swift implementation next.
2. Prop contracts (`messages`, `onPressMessage`, `onVisibleIdsChange`, `onNearTop`) live in `components/chat/ChatView.tsx`; ensure native module mirrors these names.
3. Next steps: add Swift/iOS target with diffable data source, emit Fabric events, and capture progress in `PROJECT_STATUS.md`.
