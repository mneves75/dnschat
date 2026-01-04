# Engineering Execution Plan: v3.4.0 Security & Reliability Hardening

**Version**: 3.4.0
**Date**: 2025-12-16
**Author**: Engineering Agent (Fresh Eyes Review)
**Status**: Complete
**Reviewer**: John Carmack Standards

## Executive Summary

Fresh eyes code review identified **20 issues** across security, reliability, and code quality. This plan addresses the **8 critical/high severity** issues that could cause data loss, security vulnerabilities, or resource exhaustion in production.

## Goal

Harden DNSChat security and reliability:
1. Eliminate cryptographic weaknesses in DNS ID generation
2. Prevent memory exhaustion from malicious DNS responses
3. Fix race conditions in state management
4. Eliminate resource leaks (event listeners, sockets)
5. Improve error handling to prevent silent data loss

## Non-Goals

- UI/UX changes
- New features
- Performance optimizations (except where security-related)
- Refactoring for style

---

## CRITICAL ISSUES (Must Fix)

### Issue #1: Weak DNS ID Randomness
**Severity**: CRITICAL | **Risk**: DNS Cache Poisoning
**Location**: `src/services/dnsService.ts:633, 839`

**Current Code**:
```typescript
id: Math.floor(Math.random() * 65536),
```

**Problem**: `Math.random()` is not cryptographically secure. RFC 5452 requires unpredictable DNS transaction IDs to prevent cache poisoning attacks.

**Fix**:
```typescript
// Secure DNS ID generation using crypto API
function generateSecureDNSId(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint16Array(1);
    crypto.getRandomValues(arr);
    return arr[0];
  }
  // Fallback for environments without crypto (should not happen in RN)
  return Math.floor(Math.random() * 65536);
}
```

**Test**:
```typescript
it('generates cryptographically secure DNS IDs', () => {
  const ids = new Set();
  for (let i = 0; i < 1000; i++) {
    ids.add(generateSecureDNSId());
  }
  // Should have high entropy (most IDs unique)
  expect(ids.size).toBeGreaterThan(950);
});
```

---

### Issue #2: Unbounded TCP Response Buffer
**Severity**: CRITICAL | **Risk**: Memory Exhaustion DoS
**Location**: `src/services/dnsService.ts:918-968`

**Current Code**:
```typescript
socket.on('data', (data: Buffer) => {
  responseBuffer = Buffer.concat([responseBuffer, data]);
  // No size limit - malicious server could exhaust memory
```

**Problem**: A malicious DNS server could send unlimited data, causing OOM crash.

**Fix**:
```typescript
const MAX_DNS_RESPONSE_SIZE = 65535; // RFC 1035 max UDP size, generous for TCP

socket.on('data', (data: Buffer) => {
  if (responseBuffer.length + data.length > MAX_DNS_RESPONSE_SIZE) {
    cleanup();
    reject(new Error(`DNS response exceeds maximum size (${MAX_DNS_RESPONSE_SIZE} bytes)`));
    return;
  }
  responseBuffer = Buffer.concat([responseBuffer, data]);
```

**Test**:
```typescript
it('rejects DNS responses exceeding size limit', async () => {
  // Mock server sending oversized response
  await expect(queryTCPWithOversizedResponse()).rejects.toThrow('exceeds maximum size');
});
```

---

### Issue #3: Silent Storage Error Swallowing
**Severity**: CRITICAL | **Risk**: Silent Data Loss
**Location**: `src/services/storageService.ts:103-106`

**Current Code**:
```typescript
} catch (error) {
  devWarn("[StorageService] Error loading chats", error);
  return [];  // MASKS ALL ERRORS
}
```

**Problem**: Storage corruption causes silent data loss. User sees empty chat list with no indication of error.

**Fix**:
```typescript
// Define error types for distinguishing "no data" from "corrupted data"
class StorageCorruptionError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'StorageCorruptionError';
  }
}

static async loadChats(): Promise<Chat[]> {
  return this.queueOperation(async () => {
    try {
      const chatsJson = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);

      // No data is valid (new user)
      if (!chatsJson) {
        return [];
      }

      // Parse with validation
      const parsed = JSON.parse(chatsJson);
      if (!Array.isArray(parsed)) {
        throw new StorageCorruptionError('Chats data is not an array');
      }

      return parsed as Chat[];
    } catch (error) {
      if (error instanceof SyntaxError) {
        // JSON parse failure = corruption
        throw new StorageCorruptionError('Failed to parse chats JSON', error);
      }
      throw error; // Re-throw other errors (network, permission, etc.)
    }
  });
}
```

**Test**:
```typescript
it('throws StorageCorruptionError on invalid JSON', async () => {
  AsyncStorage.getItem.mockResolvedValue('not valid json');
  await expect(StorageService.loadChats()).rejects.toThrow(StorageCorruptionError);
});

it('returns empty array when no data exists', async () => {
  AsyncStorage.getItem.mockResolvedValue(null);
  const result = await StorageService.loadChats();
  expect(result).toEqual([]);
});
```

---

### Issue #4: AppState Listener Memory Leak
**Severity**: CRITICAL | **Risk**: Event Handler Accumulation
**Location**: `src/services/dnsService.ts:376-384`

**Current Code**:
```typescript
this.appStateSubscription = AppState.addEventListener('change', ...);
// Only cleaned up via destroyBackgroundListener() which is never called
```

**Problem**: AppState listener registered but never cleaned up in normal app lifecycle.

**Fix**:
```typescript
// Singleton pattern with lazy initialization
private static appStateSubscription: NativeEventSubscription | null = null;
private static isAppStateListenerInitialized = false;

private static initializeAppStateListener(): void {
  if (this.isAppStateListenerInitialized) return;

  this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
    this.currentAppState = nextAppState;
  });

  this.isAppStateListenerInitialized = true;
}

// Call once at app startup, not per-query
static initialize(): void {
  this.initializeAppStateListener();
}
```

**Test**:
```typescript
it('initializes AppState listener only once', () => {
  DNSService.initialize();
  DNSService.initialize();
  DNSService.initialize();
  expect(AppState.addEventListener).toHaveBeenCalledTimes(1);
});
```

---

### Issue #5: ChatContext Race Condition
**Severity**: HIGH | **Risk**: Wrong Chat Updated on Error
**Location**: `src/context/ChatContext.tsx:291-323`

**Current Code**:
```typescript
// In error handler:
if (currentChat) {
  const messageToUpdate = currentChat.messages[currentChat.messages.length - 1];
  await StorageService.updateMessage(currentChat.id, messageToUpdate.id, ...);
```

**Problem**: `currentChat` is captured from closure at error time, may be stale if user switched chats during async operation.

**Fix**:
```typescript
const sendMessage = async (content: string) => {
  // Capture chat ID at function entry
  const chatIdAtSend = currentChat?.id;
  if (!chatIdAtSend) {
    throw new Error('No active chat');
  }

  try {
    // ... send logic
  } catch (err) {
    // Use captured ID, not current state
    if (chatIdAtSend) {
      const chat = chats.find(c => c.id === chatIdAtSend);
      if (chat) {
        const messageToUpdate = chat.messages[chat.messages.length - 1];
        if (messageToUpdate?.id) {
          await StorageService.updateMessage(chatIdAtSend, messageToUpdate.id, {
            status: "error",
            content: `Error: ${errorMessage}`,
          });
        }
      }
    }
  }
};
```

**Test**:
```typescript
it('updates correct chat on error even if user switched chats', async () => {
  // Start send on chat A
  const sendPromise = sendMessage('test');
  // Switch to chat B before error
  setCurrentChat(chatB);
  // Simulate error
  mockDNSError();
  await sendPromise;
  // Chat A should have error, not chat B
  expect(chatA.messages[0].status).toBe('error');
  expect(chatB.messages).toHaveLength(0);
});
```

---

### Issue #6: Socket Listener Cleanup Incomplete
**Severity**: HIGH | **Risk**: Zombie Listeners on Dead Sockets
**Location**: `src/services/dnsService.ts:651-686`

**Current Code**:
```typescript
socket.once('error', onError);
socket.once('message', ...);
// cleanup() called in some paths but not guaranteed
```

**Problem**: If error occurs in certain code paths, cleanup function may not execute.

**Fix**:
```typescript
// Use try/finally pattern for guaranteed cleanup
const queryUDP = async (...): Promise<string[]> => {
  const socket = dgram.createSocket({ type: 'udp4' });
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let settled = false;

  const cleanup = () => {
    if (settled) return;
    settled = true;
    if (timeoutId) clearTimeout(timeoutId);
    try {
      socket.removeAllListeners();
      socket.close();
    } catch (e) {
      // Socket may already be closed
    }
  };

  try {
    return await new Promise((resolve, reject) => {
      // ... socket logic
    });
  } finally {
    cleanup();  // GUARANTEED to run
  }
};
```

---

### Issue #7: Fire-and-Forget Async in OnboardingContext
**Severity**: HIGH | **Risk**: Lost Onboarding Progress
**Location**: `src/context/OnboardingContext.tsx:147-148, 155-157`

**Current Code**:
```typescript
saveOnboardingState(false, newStep, completedSteps);  // NOT AWAITED
```

**Problem**: If storage fails, onboarding state is lost without user notification.

**Fix**:
```typescript
const goToNextStep = useCallback(async () => {
  if (currentStep < steps.length - 1) {
    const newStep = currentStep + 1;
    setCurrentStep(newStep);
    const completedSteps = steps.slice(0, newStep).map((s) => s.id);

    try {
      await saveOnboardingState(false, newStep, completedSteps);
    } catch (error) {
      // Log error but don't block UI - user can retry
      devWarn('[OnboardingContext] Failed to save progress', error);
      // Optionally: show toast notification
    }
  }
}, [currentStep, steps, saveOnboardingState]);
```

---

### Issue #8: Native Capabilities Cached Forever
**Severity**: HIGH | **Risk**: Stale Network Configuration
**Location**: `modules/dns-native/index.ts:89, 213-240`

**Current Code**:
```typescript
if (this.capabilities) {
  return this.capabilities;  // CACHED FOREVER
}
```

**Problem**: If user changes network settings, cached capabilities may be wrong.

**Fix**:
```typescript
private capabilities: DNSCapabilities | null = null;
private capabilitiesTimestamp: number = 0;
private static readonly CAPABILITIES_TTL_MS = 30000; // 30 seconds

async isAvailable(): Promise<DNSCapabilities> {
  const now = Date.now();

  // Return cached if still valid
  if (this.capabilities && (now - this.capabilitiesTimestamp) < DNSNative.CAPABILITIES_TTL_MS) {
    return this.capabilities;
  }

  // Refresh capabilities
  this.capabilities = await this.checkCapabilities();
  this.capabilitiesTimestamp = now;
  return this.capabilities;
}

// Force refresh (call when network changes)
invalidateCapabilities(): void {
  this.capabilities = null;
  this.capabilitiesTimestamp = 0;
}
```

---

## MEDIUM PRIORITY ISSUES (Should Fix)

| # | Issue | Location | Fix Summary |
|---|-------|----------|-------------|
| 9 | Polling screen reader (battery drain) | AccessibilityContext.tsx:74 | Use AccessibilityInfo event listeners |
| 10 | Weak equality check (JSON.stringify) | SettingsContext.tsx:224 | Implement deep equality |
| 11 | Missing input validation rollback | SettingsContext.tsx:127 | Validate before state changes |
| 12 | ErrorBoundary console.error in prod | ErrorBoundary.tsx:30 | Use devWarn |
| 13 | No post-sanitization length check | dnsService.ts:153 | Validate after sanitization |
| 14 | No read caching in storage | storageService.ts | Add read-through cache |

## LOW PRIORITY ISSUES (Nice to Have)

| # | Issue | Location | Fix Summary |
|---|-------|----------|-------------|
| 15 | Type-unsafe Buffer polyfill | dnsService.ts:73 | Use proper polyfill library |
| 16 | Missing JSDoc for DNSQueryContext | dnsService.ts:35 | Add documentation |
| 17 | Test coverage gaps | Various | Add error scenario tests |
| 18 | Native module contract undocumented | dns-native/index.ts | Add response format docs |

---

## Implementation Phases

### Phase 1: Critical Security (v3.4.0-rc1)
**Duration**: 1 day
**Changes**:
- [x] Issue #1: Secure DNS ID generation
- [x] Issue #2: TCP response size limit
- [x] Tests for both fixes

### Phase 2: Data Integrity (v3.4.0-rc2)
**Duration**: 1 day
**Changes**:
- [x] Issue #3: Storage error handling
- [x] Issue #7: Await async operations
- [x] Tests for error scenarios

### Phase 3: Resource Management (v3.4.0-rc3)
**Duration**: 1 day
**Changes**:
- [x] Issue #4: AppState listener singleton
- [x] Issue #6: Socket cleanup guarantees
- [x] Issue #8: Capabilities TTL
- [x] Tests for cleanup/caching

### Phase 4: State Management (v3.4.0-rc4)
**Duration**: 1 day
**Changes**:
- [x] Issue #5: ChatContext race condition
- [x] Integration tests

### Phase 5: Verification & Release
**Duration**: 1 day
**Changes**:
- [x] Full test suite
- [x] Manual testing on iOS/Android
- [x] CHANGELOG update
- [x] Version bump to 3.4.0

---

## Testing Strategy

### Unit Tests (Required)
- Secure DNS ID entropy test
- TCP buffer overflow test
- Storage corruption handling test
- AppState singleton test
- ChatContext race condition test
- Socket cleanup test
- Capabilities TTL test

### Integration Tests (Required)
- End-to-end DNS query with all transports
- Storage persistence across app restarts
- Onboarding state persistence

### Manual Tests (Required)
- [x] Send message, switch chat quickly, verify error updates correct chat
- [x] Background/foreground app, verify no listener accumulation
- [x] Simulate network change, verify DNS routing updates

---

## Rollback Plan

If v3.4.0 causes issues:
1. Revert to v3.3.0 tag
2. Cherry-pick only non-problematic fixes
3. Release as v3.3.1 patch

---

## Success Metrics

- [x] All 8 critical/high issues resolved
- [x] 100% of new code has test coverage
- [x] Zero regressions in existing tests
- [x] Manual testing passes on iOS + Android
- [x] Lint passes
- [x] Gradle builds succeed

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Crypto API unavailable in some RN configs | Low | High | Fallback to Math.random with warning |
| Storage error handling breaks existing data | Medium | High | Test with corrupted data samples |
| Socket cleanup affects happy path timing | Low | Medium | Thorough integration testing |
| Capabilities TTL too short/long | Medium | Low | Make configurable, tune after monitoring |

## Verification Notes (2026-01-04)

This plan was executed for the 3.4.0 release. The checklist reflects shipped work; this pass re-verifies that current code still contains the fixes and tests. Manual device tests were not re-run during this verification pass.

Evidence (2026-01-04):

    bun run lint
    Result: PASS

    bun run test
    Result: PASS (64 suites, 1 skipped, 702 tests)

    bun run verify:android
    Result: PASS with warnings (local SDK path, Metro not running, no devices)
