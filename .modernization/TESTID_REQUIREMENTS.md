# TestID Requirements for E2E Tests

**Phase 4.2**
**Date:** 2025-10-03

## Overview

This document lists all `testID` attributes required in React Native components to support comprehensive Detox e2e testing. Each testID enables Detox selectors like `element(by.id('testID'))`.

---

## Current TestIDs (Already Implemented)

✅ **Onboarding** (`src/components/onboarding/OnboardingNavigation.tsx`)
- `onboarding-skip` - Skip button (line 59)
- `onboarding-back` - Back button (line 77)
- `onboarding-next` - Next button (non-final steps)
- `onboarding-finish` - Finish button (final step, line 98)

✅ **Chat List** (`src/navigation/screens/GlassChatList.tsx`)
- `chat-new` - New chat button (line 333)
- `chat-item-${chat.id}` - Individual chat list items (line 351)

✅ **Chat Input** (`src/components/ChatInput.tsx`)
- `chat-input` - Message input field (line 75)
- `chat-send` - Send button (line 100)

---

## Required TestIDs (Need to Add)

### 1. Navigation Tabs

**File:** `src/navigation/index.tsx` (or bottom tabs component)

```tsx
// Bottom tab navigation
<Tab.Screen
  name="Chats"
  component={ChatListScreen}
  options={{
    tabBarTestID: 'tab-chats',  // ADD THIS
  }}
/>

<Tab.Screen
  name="Settings"
  component={SettingsScreen}
  options={{
    tabBarTestID: 'tab-settings',  // ADD THIS
  }}
/>
```

**Priority:** HIGH (needed for navigation in all test suites)

---

### 2. Settings Screen

**File:** `src/navigation/screens/SettingsScreen.tsx` (or equivalent)

```tsx
// Main settings container
<View testID="settings-screen">  // ADD THIS

  // DNS Transport Section
  <View testID="dns-transport-section">  // ADD THIS

    // Transport options
    <Pressable testID="transport-native">  // ADD THIS
      {/* Native transport option */}
    </Pressable>

    <Pressable testID="transport-udp">  // ADD THIS
      {/* UDP transport option */}
    </Pressable>

    <Pressable testID="transport-tcp">  // ADD THIS
      {/* TCP transport option */}
    </Pressable>

    <Pressable testID="transport-doh">  // ADD THIS
      {/* DoH transport option */}
    </Pressable>

    // Selected state indicators
    <View testID="transport-native-selected">  // ADD THIS (show when selected)
    <View testID="transport-udp-selected">     // ADD THIS (show when selected)
    <View testID="transport-tcp-selected">     // ADD THIS (show when selected)
    <View testID="transport-doh-selected">     // ADD THIS (show when selected)
  </View>

  // Test Connection Button
  <Pressable testID="test-transport">  // ADD THIS
    <Text>Test Connection</Text>
  </Pressable>

  // Test Result Display
  <View testID="test-result">  // ADD THIS (show after test)
    <Text testID="test-result-text">Success / Failed</Text>
  </View>

  // Custom DNS Server Configuration
  <TextInput
    testID="dns-server-input"  // ADD THIS
    placeholder="Custom DNS Server (optional)"
  />

  <Pressable testID="dns-server-save">  // ADD THIS
    <Text>Save</Text>
  </Pressable>

  <Pressable testID="dns-server-reset">  // ADD THIS
    <Text>Reset to Default</Text>
  </Pressable>

  <Text testID="dns-server-error">  // ADD THIS (show on validation error)
    Invalid IP address
  </Text>

  // DNS Logs Viewer
  <Pressable testID="dns-logs-button">  // ADD THIS
    <Text>View DNS Logs</Text>
  </Pressable>
</View>
```

**Priority:** HIGH (critical for transport testing)

---

### 3. Message Components

**File:** `src/components/MessageBubble.tsx` (or `src/components/MessageList.tsx`)

```tsx
// User message
<View testID="message-user">  // ADD THIS
  <Text testID="message-user-text">{message.content}</Text>
</View>

// AI message
<View testID="message-ai">  // ADD THIS
  <Text testID="message-ai-text">{message.content}</Text>
</View>

// Loading indicator (while DNS query in progress)
<View testID="message-loading">  // ADD THIS
  <ActivityIndicator />
  <Text>Thinking...</Text>
</View>

// Error message
<View testID="message-error">  // ADD THIS
  <Text testID="message-error-text">{error.message}</Text>
  <Pressable testID="message-retry">  // ADD THIS
    <Text>Retry</Text>
  </Pressable>
</View>

// Sent/pending status
<View testID="message-sent">  // ADD THIS (show when delivered)
<View testID="message-pending">  // ADD THIS (show when queued)
```

**Priority:** HIGH (needed for message lifecycle tests)

---

### 4. Chat Management

**File:** `src/navigation/screens/GlassChatList.tsx` (or chat item component)

```tsx
// Chat item long-press menu
<Pressable
  onLongPress={() => showDeleteMenu()}
  testID={`chat-item-${chat.id}`}  // Already exists
>
  <Text>{chat.title}</Text>
</Pressable>

// Delete confirmation modal
<Modal>
  <View testID="chat-delete-modal">  // ADD THIS
    <Text>Delete this chat?</Text>
    <Pressable testID="chat-delete-confirm">  // ADD THIS
      <Text>Delete</Text>
    </Pressable>
    <Pressable testID="chat-delete-cancel">  // ADD THIS
      <Text>Cancel</Text>
    </Pressable>
  </View>
</Modal>
```

**Priority:** MEDIUM (needed for chat lifecycle tests)

---

### 5. Error & Rate Limiting

**File:** `src/components/ChatInput.tsx` or `src/components/MessageList.tsx`

```tsx
// Rate limit error
<View testID="rate-limit-error">  // ADD THIS
  <Text testID="rate-limit-text">
    Too many requests. Try again in {countdown} seconds.
  </Text>
</View>

// Network offline indicator
<View testID="offline-indicator">  // ADD THIS
  <Text>No internet connection</Text>
</View>
```

**Priority:** MEDIUM (needed for error handling tests)

---

### 6. DNS Logs Viewer

**File:** `src/navigation/screens/DNSLogsScreen.tsx` (if exists)

```tsx
<View testID="dns-logs-screen">  // ADD THIS
  <FlatList
    data={logs}
    renderItem={({ item, index }) => (
      <View testID={`log-entry-${index}`}>  // ADD THIS
        <Text testID={`log-entry-text-${index}`}>{item.message}</Text>
        <Text testID={`log-entry-time-${index}`}>{item.timestamp}</Text>
        <Text testID={`log-entry-status-${index}`}>{item.status}</Text>
      </View>
    )}
  />
</View>
```

**Priority:** LOW (nice-to-have for error logging tests)

---

## Implementation Checklist

### Phase 4.2 (Current)
- [ ] Add navigation tab testIDs (`tab-chats`, `tab-settings`)
- [ ] Add Settings screen testIDs (transport selection, test button, DNS server config)
- [ ] Add message component testIDs (`message-ai`, `message-error`, `message-loading`)
- [ ] Add chat deletion testIDs (`chat-delete-confirm`, `chat-delete-cancel`)
- [ ] Add rate limit error testIDs
- [ ] Add DNS logs viewer testIDs (optional, low priority)

### Verification
After adding testIDs, run existing tests to verify:

```bash
# iOS
npm run detox:build:ios
npm run detox:test:ios

# Android
npm run detox:build:android
npm run detox:test:android
```

---

## Best Practices

### 1. Naming Convention

Use kebab-case with descriptive, hierarchical names:

```tsx
// ✅ Good
testID="settings-transport-native"
testID="chat-delete-confirm"
testID="message-error-retry"

// ❌ Avoid
testID="btn1"
testID="transportNative"  // camelCase less readable in selectors
testID="native"  // Too generic
```

### 2. Dynamic TestIDs

For list items, use consistent patterns:

```tsx
// ✅ Good
testID={`chat-item-${chat.id}`}
testID={`log-entry-${index}`}

// ❌ Avoid
testID={chat.id}  // No context
testID={`item-${Math.random()}`}  // Non-deterministic
```

### 3. Conditional TestIDs

Show/hide elements with testIDs based on state:

```tsx
{isLoading && <View testID="message-loading">...</View>}
{error && <View testID="message-error">...</View>}
{isSelected && <View testID="transport-native-selected">...</View>}
```

### 4. Accessibility Alignment

testID should match accessibilityLabel when possible:

```tsx
<Pressable
  testID="onboarding-skip"
  accessibilityLabel="Skip onboarding tutorial"
  accessibilityRole="button"
>
```

---

## Coverage Report

| Category | Required | Implemented | Remaining |
|----------|----------|-------------|-----------|
| Navigation | 2 | 0 | 2 |
| Onboarding | 4 | 4 | 0 ✅ |
| Chat List | 2 | 2 | 0 ✅ |
| Chat Input | 2 | 2 | 0 ✅ |
| Messages | 8 | 0 | 8 |
| Settings | 15 | 0 | 15 |
| Errors | 3 | 0 | 3 |
| Logs | 4 | 0 | 4 |
| **Total** | **40** | **10 (25%)** | **30 (75%)** |

**Target:** 100% implementation before Phase 4.3 (CI integration)

---

## Next Steps

1. ✅ Document required testIDs (this file)
2. ⏳ Add testIDs to components (in-progress)
3. ⏳ Run smoke test to verify basic testIDs work
4. ⏳ Run full e2e suite to identify missing testIDs
5. ⏳ Iterate until all tests pass

**Estimated effort:** 2-3 hours to add all testIDs
