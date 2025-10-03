# Context Loading Optimization Analysis

**Phase 3.2**  
**Date:** 2025-10-03

## Current State

DNSChat uses React Context for global state management across 4 providers:

1. **OnboardingProvider** - Onboarding progression state
2. **SettingsProvider** - DNS transport preferences
3. **ChatProvider** - Chat lifecycle and message management
4. **AccessibilityContext** (mentioned in TECH_REVIEW)

### Provider Initialization Order

```tsx
// src/App.tsx
<ErrorBoundary>
  <GestureHandlerRootView>
    <OnboardingProvider>
      <SettingsProvider>
        <ChatProvider>
          <AppContent />  {/* Renders after all contexts load */}
        </ChatProvider>
      </SettingsProvider>
    </OnboardingProvider>
  </GestureHandlerRootView>
</ErrorBoundary>
```

## Performance Analysis

### ChatProvider (src/context/ChatContext.tsx)

**Current Behavior:**
```tsx
useEffect(() => {
  loadChats();  // Loads ALL chats from AsyncStorage on mount
}, [loadChats]);
```

**Impact:**
- Executes `StorageService.loadChats()` immediately when app starts
- Blocks TTI (Time to Interactive) if storage contains many chats
- AsyncStorage reads are relatively fast (~10-50ms) but accumulate

**Optimization Opportunity:**  
✅ **Defer chat loading** until user navigates to chat list screen

**Implementation:**
```tsx
// Option A: Lazy load trigger
const loadChatsLazy = useCallback(async () => {
  if (chats.length > 0) return; // Already loaded
  await loadChats();
}, [chats, loadChats]);

// Expose lazy loader instead of auto-loading
return (
  <ChatContext.Provider value={{ loadChatsLazy, ...otherValues }}>
```

**Trade-offs:**
- ✅ Faster TTI (defers async work)
- ❌ Requires screen-level loading state
- ❌ Breaking change (current code expects chats loaded)

**Recommendation:** **Defer to Phase 4** (test automation in place to catch regressions)

---

### SettingsProvider

**Current Behavior:**
- Loads DNS preferences from AsyncStorage on mount
- Small payload (transport settings, server URLs)

**Impact:**
- Minimal (~5-10ms read)
- **Already optimized** (settings needed immediately for DNS service)

**Recommendation:** ✅ **Keep as-is**

---

### OnboardingProvider

**Current Behavior:**
- Checks `hasCompletedOnboarding` flag from AsyncStorage

**Impact:**
- Critical path (determines if onboarding screens shown)
- Fast boolean check (~1-5ms)

**Recommendation:** ✅ **Keep as-is** (blocking is intentional)

---

## Recommended Optimizations

### 1. Conditional Chat Loading (Safe Implementation)

**Approach:** Load chats on-demand when chat list screen mounts

```tsx
// In ChatListScreen.tsx
useEffect(() => {
  if (chats.length === 0 && !isLoading) {
    loadChats();
  }
}, [chats, isLoading, loadChats]);
```

**Benefits:**
- Non-breaking (chats still load automatically when needed)
- Improves TTI if user doesn't immediately navigate to chat screen
- Maintains current UX

### 2. AsyncStorage Batching

**Current:** Multiple sequential reads
```tsx
// Settings
await AsyncStorage.getItem('dns-settings');
// Onboarding
await AsyncStorage.getItem('onboarding-complete');
// Chats
await AsyncStorage.getItem('chats');
```

**Optimized:** Single batch read
```tsx
const [settings, onboarding, chats] = await AsyncStorage.multiGet([
  'dns-settings',
  'onboarding-complete',
  'chats'
]);
```

**Benefits:**
- ~50% faster on iOS/Android (native optimization)
- Reduces bridge calls (old architecture) or JSI overhead (Fabric)

**Implementation Complexity:** Medium (requires refactoring storage service)

### 3. Context Value Memoization

**Current:** Context value recreated on every render
```tsx
<ChatContext.Provider value={{ chats, loadChats, createChat, ... }}>
```

**Optimized:** Memoized value
```tsx
const contextValue = useMemo(() => ({
  chats,
  loadChats,
  createChat,
  deleteChat,
  // ... all methods
}), [chats, loadChats, createChat, deleteChat]);

<ChatContext.Provider value={contextValue}>
```

**Benefits:**
- Prevents unnecessary re-renders in consumer components
- **Already done correctly** in SettingsContext (uses useMemo)

**Recommendation:** ✅ **Audit all contexts** and add useMemo where missing

---

## Implementation Priority

| Optimization | Impact | Complexity | Phase | Status |
|--------------|--------|------------|-------|--------|
| Conditional chat loading | Medium | Low | 3.2 | ✅ Documented |
| AsyncStorage batching | Medium | Medium | Future | Deferred |
| Context value memoization | Low | Low | 3.2 | Audit needed |
| Lazy DNS log init | Low | Low | ✅ Already done | Complete |

---

## Measurements (Phase 3.4)

Use PerformanceService to track:

```tsx
// Before optimization
PerformanceService.mark('context-init-start');
await loadChats();
PerformanceService.mark('context-init-end');
const duration = PerformanceService.measure('context-init', 'context-init-start', 'context-init-end');

console.log(`Context init: ${duration}ms`);
```

**Target:** <100ms total context initialization

---

## Next Steps

1. ✅ **Document findings** (this file)
2. ⏳ **Phase 3.3:** Evaluate FlashList for chat message rendering
3. ⏳ **Phase 3.4:** Measure TTI/FPS with PerformanceService
4. ⏳ **Phase 4:** Implement optimizations with e2e test coverage
