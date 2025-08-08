# Junior Developer Guide - DNSChat

**Complete technical guide for new team members**

## Welcome to DNSChat Development!

This guide will help you understand the DNSChat codebase, architecture, and development practices. Read this first before diving into code.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Key Concepts](#key-concepts)
4. [Code Organization](#code-organization)
5. [Development Setup](#development-setup)
6. [Common Tasks](#common-tasks)
7. [Testing Strategy](#testing-strategy)
8. [Best Practices](#best-practices)
9. [Debugging Techniques](#debugging-techniques)
10. [Code Review Guidelines](#code-review-guidelines)

---

## Project Overview

### What is DNSChat?

DNSChat is a revolutionary mobile chat application that communicates with AI using DNS TXT queries instead of traditional HTTP APIs. Think "ChatGPT over DNS" - it's a unique approach that demonstrates creative problem-solving and low-level networking.

### Why DNS?

1. **Innovation**: Novel approach to AI communication
2. **Network Resilience**: DNS works even when HTTP is restricted
3. **Simplicity**: DNS is universal and lightweight
4. **Educational**: Teaches low-level networking concepts

### Tech Stack Summary

- **Framework**: React Native + Expo (v53)
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation v7
- **State Management**: React Context + AsyncStorage
- **Networking**: Native DNS modules + comprehensive fallbacks
- **Platforms**: iOS, Android, Web

---

## Architecture Deep Dive

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │  Native Modules │    │   DNS Servers   │
│       App       │◄──►│   (iOS/Android) │◄──►│    (ch.at)      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
    ┌────▼────┐              ┌───▼───┐              ┌────▼────┐
    │ Context │              │ UDP/  │              │  DNS    │
    │ Storage │              │ TCP   │              │  over   │
    │         │              │ HTTPS │              │  HTTPS  │
    └─────────┘              └───────┘              └─────────┘
```

### Data Flow

1. **User Input** → ChatInput component
2. **Message Creation** → ChatContext state management
3. **DNS Query** → Native modules or fallback services
4. **Response Processing** → Multi-part DNS response parsing
5. **UI Update** → Message list re-render
6. **Persistence** → AsyncStorage via StorageService

### Layer Breakdown

#### 1. Presentation Layer (`/src/components/`, `/src/navigation/`)
- **Components**: Reusable UI elements (MessageBubble, ChatInput, etc.)
- **Screens**: Full-screen components (Chat, Settings, About)
- **Navigation**: Route management and deep linking

#### 2. Business Logic Layer (`/src/services/`)
- **DNSService**: Core DNS communication logic
- **StorageService**: Data persistence management
- **Context Providers**: Global state management

#### 3. Native Layer (`/modules/dns-native/`, `/ios/`, `/android/`)
- **iOS**: Swift implementation using Network Framework
- **Android**: Kotlin implementation using DnsResolver API
- **Fallbacks**: UDP sockets, DNS-over-HTTPS

---

## Key Concepts

### DNS Communication Protocol

DNSChat uses a specific protocol for AI communication:

```typescript
// Query Format (what we send)
const query = `dig @ch.at "${userMessage}" TXT +short`;

// Response Format (what we receive)
const responses = [
  "1/3:Hello! This is the first part",
  "2/3:of the AI response message",
  "3/3:split across multiple DNS records."
];
```

**Key Points:**
- User message becomes DNS query domain
- Response split across multiple TXT records
- Format: `N/TOTAL:content` for multi-part responses
- Maximum ~250 chars per DNS TXT record

### Native Module Architecture

Each platform has optimized DNS implementations:

```typescript
// iOS - Uses Apple Network Framework
const resolver = nw_resolver_create(config);
nw_resolver_query(resolver, domain, NW_RESOLVER_TYPE_TXT, callback);

// Android - Uses DnsResolver API (Android 10+)
DnsResolver.getInstance().query(
  network, domain, RR_TYPE_TXT, 
  executor, cancellationSignal, callback
);

// Fallback - JavaScript UDP/TCP/HTTPS
// Automatic fallback chain when native unavailable
```

### State Management Pattern

DNSChat uses React Context for global state:

```typescript
// ChatContext - Manages conversations
interface ChatContextType {
  chats: Chat[];
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
}

// SettingsContext - Manages app configuration
interface SettingsContextType {
  dnsServer: string;
  updateSettings: (settings: Partial<Settings>) => void;
}
```

---

## Code Organization

### Directory Structure Explained

```
/src/
├── components/          # Reusable UI components
│   ├── ChatInput.tsx   # Message input with send button
│   ├── MessageBubble.tsx # Individual message display
│   ├── MessageList.tsx  # Virtualized message list
│   └── icons/          # SVG icon components
├── context/            # React Context providers
│   ├── ChatContext.tsx # Global chat state
│   └── SettingsContext.tsx # App settings
├── navigation/         # React Navigation setup
│   ├── index.tsx       # Navigation structure
│   └── screens/        # Screen components
├── services/           # Business logic services
│   ├── dnsService.ts   # DNS communication logic
│   └── storageService.ts # AsyncStorage wrapper
└── types/              # TypeScript definitions
    └── chat.ts         # Chat-related types
```

### Key Files to Understand

#### `/src/services/dnsService.ts` - Core DNS Logic
The heart of the application. Handles:
- Native DNS module detection
- Fallback chain management (Native → UDP → TCP → HTTPS → Mock)
- Response parsing and error handling
- Message sanitization and validation

#### `/src/context/ChatContext.tsx` - State Management
Global state for all chat functionality:
- Chat creation, updates, deletion
- Message management
- Storage integration
- Context provider for entire app

#### `/src/components/MessageList.tsx` - Performance Critical
Uses FlatList for efficient rendering:
- Virtualized list for thousands of messages
- Auto-scroll to bottom on new messages
- Optimized re-rendering patterns

### Naming Conventions

- **Components**: PascalCase (`MessageBubble.tsx`)
- **Services**: camelCase (`dnsService.ts`)
- **Types**: PascalCase interfaces (`Chat`, `Message`)
- **Constants**: UPPER_SNAKE_CASE (`DNS_TIMEOUT`)
- **Functions**: camelCase (`sendMessage`)

---

## Development Setup

### Prerequisites Checklist

```bash
# Required versions
node -v     # 18.0.0+
npm -v      # 9.0.0+
java -version  # OpenJDK 17 (for Android)

# Platform tools
xcode-select --install  # macOS only
# Android Studio with SDK 34+
```

### First-Time Setup

1. **Clone and Install**
```bash
git clone https://github.com/mneves75/dnschat.git
cd dnschat
npm install
```

2. **Platform Setup**
```bash
# iOS (macOS only)
cd ios && pod install && cd ..

# Android - ensure Java 17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

3. **Verify Installation**
```bash
# Test DNS connectivity
node test-dns.js "Hello world"

# Start development
npm start
# Then npm run ios or npm run android
```

### Development Environment

#### Recommended IDE Setup
- **Primary**: VS Code with React Native extensions
- **iOS Debugging**: Xcode (for native code)
- **Android Debugging**: Android Studio (for native code)

#### Essential Extensions
- ES7+ React/Redux/React-Native snippets
- TypeScript Hero
- React Native Tools
- Expo Tools

---

## Common Tasks

### Adding a New Feature

1. **Plan the Feature**
   - Identify which layer (UI, service, native)
   - Plan state management needs
   - Consider testing requirements

2. **Implementation Pattern**
```typescript
// 1. Add types (if needed)
interface NewFeature {
  id: string;
  name: string;
}

// 2. Update service layer
export const newFeatureService = {
  create: async (data: NewFeature) => { /* */ },
  update: async (id: string, data: Partial<NewFeature>) => { /* */ }
};

// 3. Update context (if global state needed)
const NewFeatureContext = createContext<NewFeatureContextType>();

// 4. Create components
const NewFeatureComponent: React.FC<Props> = ({ }) => {
  // Implementation
};

// 5. Add tests
describe('NewFeature', () => {
  it('should work correctly', () => {
    // Test implementation
  });
});
```

### Modifying DNS Communication

**⚠️ CRITICAL: DNS is the core functionality - test thoroughly!**

1. **Understand Current Flow**
```typescript
// dnsService.ts flow:
performDNSQuery() 
  → tryNativeDNS() 
  → tryUDPDNS() 
  → tryDNSOverHTTPS() 
  → tryMockService()
```

2. **Test at Each Layer**
```bash
# Test CLI first
node test-dns.js "test message"

# Test native modules
# (Check console logs for native DNS availability)

# Test in app
# Send actual messages and monitor console logs
```

3. **Common Modifications**
   - Adding new DNS servers: Update `SettingsContext`
   - Changing response parsing: Modify `parseMultiPartResponse()`
   - Adding fallback methods: Extend fallback chain
   - Error handling: Update `DNSError` types and handling

### Debugging Performance Issues

1. **Identify the Layer**
   - UI lag: Check React re-renders, FlatList performance
   - Network slow: Check DNS query times, server response
   - Storage slow: Check AsyncStorage operations

2. **Use Performance Tools**
```typescript
// React Native performance monitoring
import { unstable_trace as trace } from 'scheduler/tracing';

trace('DNS Query', performance.now(), () => {
  // DNS query code
});

// Console timing
console.time('DNS Query');
await performDNSQuery(message);
console.timeEnd('DNS Query');
```

---

## Testing Strategy

### Testing Pyramid

```
                    ┌─────────────┐
                    │ E2E Tests   │  ← Full app flows
                    └─────────────┘
                ┌─────────────────────┐
                │ Integration Tests   │  ← Service integration
                └─────────────────────┘
        ┌─────────────────────────────────┐
        │          Unit Tests              │  ← Individual functions
        └─────────────────────────────────┘
```

### Testing Levels

#### 1. Unit Tests (`__tests__/`)
Test individual functions and components:
```typescript
// Example: DNS response parsing
describe('parseMultiPartResponse', () => {
  it('should concatenate multi-part responses', () => {
    const responses = ['1/2:Hello ', '2/2:World'];
    const result = parseMultiPartResponse(responses);
    expect(result).toBe('Hello World');
  });
});
```

#### 2. Integration Tests
Test service integration:
```bash
# DNS service integration
npm test -- --testPathPattern=integration

# Native module integration
npm run ios  # Then test in simulator
npm run android  # Then test in emulator
```

#### 3. E2E Testing
Test complete user flows:
1. Create new chat
2. Send message
3. Receive response
4. Verify persistence
5. Test settings changes

### Testing Environments

- **Mock Service**: Fast, reliable, for UI testing
- **Native Modules**: Real DNS, platform-specific testing
- **CLI Tool**: Pure DNS testing without app complexity

---

## Best Practices

### Code Style

1. **TypeScript Strict Mode**
```typescript
// Always type everything
interface Props {
  message: string;
  onSend: (text: string) => void;
}

// Use readonly for immutable data
interface Chat {
  readonly id: string;
  readonly createdAt: Date;
  messages: readonly Message[];
}
```

2. **Error Handling**
```typescript
// Always handle errors explicitly
try {
  const response = await performDNSQuery(message);
  return response;
} catch (error) {
  console.error('DNS query failed:', error);
  throw new DNSError('Query failed', error);
}
```

3. **Async/Await Pattern**
```typescript
// Prefer async/await over promises
const sendMessage = async (text: string): Promise<void> => {
  try {
    const response = await dnsService.query(text);
    await storageService.saveMessage(response);
  } catch (error) {
    handleError(error);
  }
};
```

### Performance Guidelines

1. **Component Optimization**
```typescript
// Use React.memo for expensive components
const MessageBubble = React.memo<Props>(({ message }) => {
  return <View>{/* render */}</View>;
});

// Use useCallback for stable references
const handleSend = useCallback((text: string) => {
  sendMessage(text);
}, [sendMessage]);
```

2. **State Management**
```typescript
// Minimize context re-renders
const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  
  // Memoize context value
  const value = useMemo(() => ({
    ...state,
    dispatch
  }), [state]);
  
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
```

### Security Considerations

1. **Input Sanitization**
```typescript
// Always sanitize DNS inputs (already implemented)
const sanitizeMessage = (message: string): string => {
  return message
    .replace(/[^\x20-\x7E]/g, '') // Remove non-printable
    .replace(/[.;\\]/g, '_')      // Escape DNS control chars
    .substring(0, 63);            // DNS label limit
};
```

2. **Error Message Security**
```typescript
// Don't expose internal details in errors
const handleDNSError = (error: Error): string => {
  // Log full error internally
  console.error('Internal DNS error:', error);
  
  // Return sanitized message to user
  return 'Unable to send message. Please try again.';
};
```

---

## Debugging Techniques

### DNS Communication Debugging

1. **Layer-by-Layer Testing**
```bash
# 1. Test pure DNS connectivity
node test-dns.js "debug message"

# 2. Test native modules
# Look for console logs: "✅ Native DNS reports as available!"

# 3. Test fallback chain
# Temporarily disable native DNS to test fallbacks
```

2. **Console Logging Strategy**
```typescript
// dnsService.ts debugging points
console.log('🔍 Attempting native DNS query');
console.log('⚠️ Native DNS failed, trying UDP');
console.log('⚠️ UDP failed, trying DNS-over-HTTPS');
console.log('📥 Raw response received:', response);
```

### React Native Debugging

1. **Component Debugging**
```typescript
// Use React Developer Tools
// Add debug props to components
const MessageBubble = ({ message, ...props }) => {
  console.log('MessageBubble render:', message.id);
  return <View {...props}>{/* content */}</View>;
};
```

2. **State Debugging**
```typescript
// Debug Context state changes
const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  
  useEffect(() => {
    console.log('Chats state changed:', chats.length);
  }, [chats]);
};
```

### Network Debugging

1. **Traffic Analysis**
```bash
# Monitor DNS traffic (macOS)
sudo tcpdump -i any port 53

# Monitor HTTP traffic (for fallbacks)
sudo tcpdump -i any port 443
```

2. **Error Pattern Recognition**
- `ERR_SOCKET_BAD_PORT`: UDP port 53 blocked
- `NETWORK_REQUEST_FAILED`: Server unreachable
- `TIMEOUT`: Network latency or server overload
- `DNS_PARSE_ERROR`: Response format issue

---

## Code Review Guidelines

### What to Look For

1. **Functionality**
   - Does it work as expected?
   - Are edge cases handled?
   - Is error handling comprehensive?

2. **Performance**
   - Are there unnecessary re-renders?
   - Is the code efficient?
   - Are there memory leaks?

3. **Security**
   - Is user input sanitized?
   - Are errors properly handled without exposing internals?
   - Are permissions appropriate?

### Review Checklist

#### General Code Quality
- [ ] Code follows TypeScript strict mode
- [ ] Functions have proper error handling
- [ ] Components are properly typed
- [ ] No console.log statements in production code

#### DNS-Specific Changes
- [ ] DNS queries are properly sanitized
- [ ] Fallback chain is maintained
- [ ] Native modules are tested on both platforms
- [ ] CLI test passes: `node test-dns.js "test"`

#### React Native Specific
- [ ] Components use proper React patterns (hooks, memo, etc.)
- [ ] Navigation changes don't break deep linking
- [ ] AsyncStorage operations are error-handled
- [ ] Platform-specific code is properly conditionally executed

#### Testing
- [ ] Unit tests added for new functionality
- [ ] Integration tests pass
- [ ] App builds and runs on both iOS and Android
- [ ] No performance regressions

---

## Next Steps

After reading this guide:

1. **Set up your development environment** following the setup section
2. **Run the app** and send a few test messages
3. **Explore the codebase** starting with `/src/services/dnsService.ts`
4. **Try making a small change** (like modifying a UI component)
5. **Read the FAQ** for common issues you might encounter
6. **Start working on your first ticket!**

### Recommended Learning Path

1. **Week 1**: Environment setup, run app, understand DNS flow
2. **Week 2**: Explore React Native components, make UI changes
3. **Week 3**: Dive into services layer, understand state management
4. **Week 4**: Work on native modules, understand platform differences

### Resources for Continued Learning

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Navigation](https://reactnavigation.org/)
- [DNS Protocol Basics](https://tools.ietf.org/html/rfc1035)

---

**Welcome to the team!** 🚀

If you have questions not covered in this guide, check the [Tech FAQ](../TECH-FAQ.md) or ask a senior developer.

**Last Updated:** v1.5.0 - Production Ready Release