# Chat DNS - Mobile Chat Interface Specification

## Overview
A modern, ChatGPT-like mobile chat interface that communicates with an LLM via DNS TXT queries. The app provides a seamless chat experience with local storage for conversation history.

## Inspiration and Acknowledgements

- See [Arxiv Daily tweet](https://x.com/Arxiv_Daily/status/1952452878716805172) for background on DNS-based chat via `dig`.
- See [ch.at – Universal Basic Intelligence](https://github.com/Deep-ai-inc/ch.at) for an OSS reference (supports `dig @ch.at "..." TXT`).

## Core Features

### 1. Chat Interface
- **Message Display**: Clean, modern chat bubbles with clear distinction between user and AI messages
- **Input Area**: Bottom-mounted input field with send button, similar to ChatGPT
- **Auto-scroll**: Automatic scrolling to latest messages
- **Loading States**: Typing indicators while waiting for DNS response
- **Markdown Support**: Render formatted text, code blocks, and lists in AI responses
- **Timestamps**: Display message timestamps
- **Copy Messages**: Long-press to copy message content

### 2. DNS Communication

#### Core DNS System
- **Query Format**: `dig @ch.at "<USER_MESSAGE>" TXT +short`
- **Response Handling**: Parse DNS TXT records and combine multi-part responses
- **Retry Logic**: Automatic retry with exponential backoff for failed queries (3 retries, 10-second timeout)

#### 🔧 Enhanced Transport Layer (v1.7.2)
**Multi-Layer Fallback Strategy:**
1. **Native DNS** (iOS Network Framework, Android DnsResolver) - Platform-optimized, fastest
2. **UDP DNS** - Direct UDP queries via react-native-udp 
3. **DNS-over-TCP** - TCP fallback for UDP-blocked networks
4. **DNS-over-HTTPS** - Cloudflare API fallback (architectural limitations with ch.at)
5. **Mock Service** - Development/testing fallback

**🛡️ Enterprise-Grade Error Handling:**
- **UDP Port Blocking Detection**: Smart ERR_SOCKET_BAD_PORT detection with TCP fallback
- **TCP Connection Issues**: Comprehensive ECONNREFUSED/ETIMEDOUT handling
- **Network Restriction Guidance**: User-friendly error messages with actionable troubleshooting:
  - Network switching recommendations (WiFi ↔ Cellular)
  - Port blocking detection with administrator contact advice
  - 5-step troubleshooting guide for connectivity failures
  - Platform-specific guidance for iOS/Android restrictions
- **Diagnostic Logging**: Comprehensive error logging for debugging and support

### 3. Local Storage
- **Conversation History**: Persist all chats using AsyncStorage
- **Chat Sessions**: Support multiple chat conversations
- **Session Management**: Create, delete, and rename chat sessions
- **Auto-save**: Real-time saving of messages as they're sent/received
- **Data Structure**:
  ```typescript
  interface Chat {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages: Message[];
  }
  
  interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    status: 'sending' | 'sent' | 'error';
  }
  ```

### 4. Navigation Structure
- **Chat List Screen**: Overview of all chat sessions with preview
- **Chat Screen**: Active conversation interface
- **Settings Screen**: DNS server configuration, theme preferences
- **New Chat**: Floating action button or header button to start new conversation

### 5. UI/UX Requirements
- **Theme**: Support light/dark mode based on system preference
- **Responsive**: Adapt to different screen sizes and orientations
- **Keyboard Handling**: Smart keyboard avoidance for input field
- **Pull to Refresh**: Reload chat history
- **Swipe Actions**: Swipe to delete chats from list
- **Empty States**: Helpful prompts when no chats exist
- **Accessibility**: Full VoiceOver/TalkBack support

## Technical Architecture

### Dependencies
- `@react-native-async-storage/async-storage`: Local storage
- `react-native-markdown-display`: Markdown rendering
- `react-native-reanimated`: Smooth animations
- `react-native-svg`: Icons and graphics
- `react-native-uuid`: UUID generation
- `react-native-keyboard-aware-scroll-view`: Keyboard handling
- Custom DNS resolver implementation using native modules or external service

### Services
1. **StorageService**: CRUD operations for chats and messages
2. **DNSService**: Handle DNS queries and response parsing
3. **ChatService**: Business logic for chat operations
4. **ThemeService**: Theme management and persistence

### State Management
- React Context for global chat state
- Local state for UI components
- Optimistic updates for better UX

### Performance Optimizations
- **FlatList**: Virtualized list for message rendering
- **Memoization**: Prevent unnecessary re-renders
- **Lazy Loading**: Load chats on demand
- **Image Caching**: Cache user avatars and images
- **Background Processing**: DNS queries in background thread

## Security Considerations
- **Input Sanitization**: Clean user input before DNS queries
- **Content Security**: Sanitize AI responses before rendering
- **Data Encryption**: Consider encrypting stored chats
- **Rate Limiting**: Implement client-side rate limiting

## Error Handling
- **Network Errors**: Clear messaging for offline state
- **DNS Failures**: Fallback messages and retry options
- **Storage Errors**: Handle storage quota exceeded
- **Validation**: Input length limits and character validation

## Accessibility
- **Screen Reader Support**: Proper labels and hints
- **Keyboard Navigation**: Full keyboard support
- **Font Scaling**: Respect system font size preferences
- **Color Contrast**: WCAG AA compliance

## Future Enhancements
- Export chat history (JSON, PDF)
- Search within chats
- Voice input/output
- Share conversations
- Chat templates/prompts
- Multiple DNS server support
- Streaming responses
- File attachments