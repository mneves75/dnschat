# Encryption System - Fix Action Plan

**Status:** 🔴 BLOCKING - Do not ship without addressing P0 issues
**Created:** 2025-09-30
**Target:** Complete all P0 fixes within 1 week

---

## 🔴 Phase 1: Critical Fixes (THIS WEEK)

### P0-1: Fix Race Condition in Key Generation ⚠️ DATA CORRUPTION RISK
**File:** `src/utils/encryption.ts:267-284`
**Estimated Time:** 4 hours
**Blocker:** YES

- [ ] Add `keyGenerationLocks` Map to track in-progress key generation
- [ ] Implement `generateConversationKey()` with mutex locking
- [ ] Extract implementation to `_generateConversationKeyImpl()`
- [ ] Add double-check after acquiring lock
- [ ] Write regression test for concurrent key generation
- [ ] Test with 10+ concurrent calls to same conversation ID

**Acceptance Criteria:**
- Multiple concurrent calls to `generateConversationKey('same-id')` produce identical keys
- No keys are overwritten
- All encrypted data remains decryptable

---

### P0-2: Fix Race Condition in Master Password ⚠️ CATASTROPHIC RISK
**File:** `src/utils/encryption.ts:290-300`
**Estimated Time:** 2 hours
**Blocker:** YES

- [ ] Add `masterPasswordPromise` static field
- [ ] Cache first master password creation promise
- [ ] Ensure all subsequent calls wait for same promise
- [ ] Never clear the promise (master password is stable)
- [ ] Write test for concurrent master password access
- [ ] Test with 100+ concurrent calls at app startup

**Acceptance Criteria:**
- Only one master password ever created
- All conversations use the same master password
- Concurrent access returns same password

---

### P0-3: Implement Key Cleanup on Chat Deletion ⚠️ SECURITY VIOLATION
**File:** `src/services/storageService.ts:367-376`
**Estimated Time:** 1 hour
**Blocker:** YES (GDPR/compliance)

- [ ] Add `await EncryptionService.deleteConversationKey(chatId)` to `deleteChat()`
- [ ] Add error handling and logging
- [ ] Write test verifying key is removed after chat deletion
- [ ] Test that deleted keys cannot decrypt old backups
- [ ] Add audit logging for key deletion

**Acceptance Criteria:**
- Deleting chat removes encryption key from Keychain
- `isConversationEncrypted(deletedChatId)` returns false
- No orphaned keys remain in Keychain

---

### P0-4: Implement Key Recovery Mechanism ⚠️ DATA LOSS RISK
**File:** `src/utils/encryption.ts` (new functionality)
**Estimated Time:** 8 hours
**Blocker:** YES (user data loss)

**Choose One Approach:**

#### Option A: User-Exportable Backup (RECOMMENDED)
- [ ] Implement `exportRecoveryBundle(userPassword: string): Promise<string>`
- [ ] Implement `importRecoveryBundle(bundle: string, userPassword: string): Promise<void>`
- [ ] Add UI for exporting recovery bundle (Settings screen)
- [ ] Add UI for importing recovery bundle (first launch after restore)
- [ ] Store recovery bundle version number
- [ ] Write tests for export/import flow
- [ ] Add warning: "Without this, you'll lose all chats on device restore"

#### Option B: Cloud Keychain Sync (iOS Only)
- [ ] Change `accessible` to `WHEN_UNLOCKED` (remove `THIS_DEVICE_ONLY`)
- [ ] Add `synchronizable: true` to Keychain options
- [ ] Test with iCloud Keychain enabled/disabled
- [ ] Add Android alternative (Firebase/CloudStore)
- [ ] Write tests for sync flow

#### Option C: Encrypted Cloud Backup (Cross-Platform)
- [ ] Set up Firebase/CloudStore for key backup
- [ ] Encrypt master password with device-specific key
- [ ] Implement automatic backup on key creation
- [ ] Implement automatic restore on app launch
- [ ] Add privacy policy disclosure
- [ ] Write tests for cloud backup/restore

**Acceptance Criteria (Option A):**
- User can export recovery bundle
- Recovery bundle is valid JSON with version number
- User can import bundle on new device and decrypt all chats
- Invalid password shows clear error message
- Missing recovery bundle shows clear warning

---

### P0-5: Add Safe JSON Parsing with Validation ⚠️ CRASH RISK
**File:** `src/utils/encryption.ts:429`
**Estimated Time:** 2 hours
**Blocker:** YES

- [ ] Wrap `JSON.parse()` in try-catch
- [ ] Validate parsed structure (has `salt` and `key` arrays)
- [ ] Log corruption errors with conversation ID
- [ ] Remove corrupted key and return null
- [ ] Add regeneration logic (with user warning)
- [ ] Write test with malformed JSON
- [ ] Write test with invalid structure (missing salt/key)

**Acceptance Criteria:**
- Malformed JSON doesn't crash app
- Invalid structure is detected and logged
- User sees warning about data corruption
- App continues to function with graceful degradation

---

## 🟡 Phase 2: Security Hardening (NEXT WEEK)

### M-1: Remove Unused Import
**File:** `src/utils/encryption.ts:14`
**Time:** 5 minutes
- [ ] Remove `NativeModules` from imports
- [ ] Run `npm run typecheck` to verify

### M-2: Fix TestSecureStorage Isolation
**File:** `src/utils/encryption.ts:40-59`
**Time:** 30 minutes
- [ ] Add static `reset()` method to TestSecureStorage
- [ ] Call reset in global `beforeEach()` in jest.setup.ts
- [ ] Verify tests don't interfere with each other

### M-3: Add User Notification for Recovery
**File:** `src/services/storageService.ts:159-164`
**Time:** 2 hours
- [ ] Return recovery stats from `loadChats()`
- [ ] Add banner component to show recovery status
- [ ] Add "Learn More" link to explain what happened
- [ ] Add "Dismiss" button with confirmation

### M-4: Optimize Backup Loading
**File:** `src/services/storageService.ts:119-120`
**Time:** 1 hour
- [ ] Move `loadBackupChatMap()` inside recovery code path
- [ ] Only load backup when decryption actually fails
- [ ] Add performance metrics to verify improvement

### M-5: Remove Unsafe Plaintext Fallback
**File:** `src/services/storageService.ts:304`
**Time:** 1 hour
- [ ] Remove plaintext fallback in `loadBackupChatMap()`
- [ ] Log error and return empty Map instead
- [ ] Update tests to expect no plaintext fallback
- [ ] Add warning in logs about encrypted backup requirement

### M-6: Add Backup Key Generation Error Handling
**File:** `src/services/storageService.ts:56-59`
**Time:** 30 minutes
- [ ] Wrap backup key generation in try-catch
- [ ] Show user warning if backup encryption fails
- [ ] Continue with save even if backup fails (don't block)
- [ ] Log error for debugging

### M-7: Align Test Mocks with Production
**File:** `__tests__/storageService.migration.spec.ts`
**Time:** 1 hour
- [ ] Replace custom mock with TestSecureStorage
- [ ] Ensure mock behavior matches production
- [ ] Verify all tests still pass

---

## 🟢 Phase 3: Code Quality & Testing (WEEK 3)

### Test Coverage Additions
**Estimated Time:** 6 hours total

- [ ] Add concurrent key generation test (P0-1 verification)
- [ ] Add concurrent master password test (P0-2 verification)
- [ ] Add key cleanup test (P0-3 verification)
- [ ] Add recovery bundle test (P0-4 verification)
- [ ] Add JSON corruption test (P0-5 verification)
- [ ] Add TestSecureStorage isolation test
- [ ] Add benchmark for key generation performance
- [ ] Add stress test with 1000+ concurrent operations

### Documentation Updates
**Estimated Time:** 2 hours

- [ ] Update `SECURITY.md` with new findings
- [ ] Document recovery mechanism in README
- [ ] Add JSDoc to all encryption methods
- [ ] Add architecture diagram to docs
- [ ] Update CHANGELOG.md with security fixes

---

## Success Metrics

### Before Fix
- **Race Condition Risk:** 🔴 HIGH (multiple unsynchronized async operations)
- **Data Loss Risk:** 🔴 HIGH (no key recovery on device restore)
- **Security Compliance:** 🔴 FAILING (orphaned keys not cleaned up)
- **Crash Risk:** 🔴 MEDIUM (unsafe JSON parsing)

### After Fix
- **Race Condition Risk:** 🟢 NONE (mutex locks prevent concurrent modification)
- **Data Loss Risk:** 🟢 LOW (user has recovery mechanism)
- **Security Compliance:** 🟢 PASSING (keys cleaned up on deletion)
- **Crash Risk:** 🟢 NONE (safe parsing with validation)

---

## Rollout Plan

### Week 1: Critical Fixes
1. **Day 1-2:** Implement P0-1 and P0-2 (race conditions)
2. **Day 3:** Implement P0-3 (key cleanup)
3. **Day 4-5:** Implement P0-4 (key recovery - most complex)
4. **Day 5:** Implement P0-5 (safe parsing)
5. **End of week:** Internal testing, code review

### Week 2: Security Hardening
1. **Day 1:** M-1, M-2 (quick wins)
2. **Day 2-3:** M-3, M-4 (user experience)
3. **Day 4-5:** M-5, M-6, M-7 (cleanup)
4. **End of week:** Security audit review

### Week 3: Testing & Documentation
1. **Day 1-3:** Write comprehensive tests
2. **Day 4-5:** Update documentation
3. **End of week:** Final review and staging deployment

### Week 4: Production Rollout
1. **Day 1-2:** Staged rollout (10% users)
2. **Day 3:** Monitor metrics, expand to 50%
3. **Day 4-5:** Full rollout if stable
4. **End of week:** Post-deployment review

---

## Risk Mitigation

### If P0 Fixes Cannot Be Completed in 1 Week
- **Temporary Fix:** Add global lock around all encryption operations
- **Impact:** Performance degradation, but prevents data corruption
- **Code:**
  ```typescript
  private static globalEncryptionLock = Promise.resolve();

  static async withLock<T>(fn: () => Promise<T>): Promise<T> {
    const current = this.globalEncryptionLock;
    let resolver: () => void;
    this.globalEncryptionLock = new Promise(resolve => resolver = resolve);

    try {
      await current;
      return await fn();
    } finally {
      resolver!();
    }
  }
  ```

### If Key Recovery Cannot Be Implemented
- **Fallback:** Disable encryption entirely (LAST RESORT)
- **Migration:** Decrypt all data, remove encryption, store plaintext
- **Warning:** Add prominent banner: "Encryption temporarily disabled"

---

## Approval Gates

### Gate 1: P0 Fixes Complete
**Required Approvals:** Lead Engineer, Security Lead
**Criteria:**
- All P0 tests passing
- No new race conditions introduced
- Key recovery mechanism functional

### Gate 2: Security Hardening Complete
**Required Approvals:** Security Lead, Product Manager
**Criteria:**
- All medium-priority security issues resolved
- Security audit findings addressed
- No regressions in existing functionality

### Gate 3: Production Ready
**Required Approvals:** Engineering Director, QA Lead
**Criteria:**
- All tests passing (100% of critical paths)
- Documentation complete
- Rollback plan documented
- Monitoring/alerting configured

---

## Contacts & Escalation

**Engineering Lead:** [Name]
**Security Lead:** [Name]
**Product Manager:** [Name]
**Escalation:** If any P0 fix is blocked, escalate immediately

---

## Notes

- This plan assumes full-time focus on encryption fixes
- If working part-time, multiply timelines by 2-3x
- Some fixes (especially P0-4) may require product decisions
- User testing recommended before full rollout
- Consider beta program for key recovery testing

**Last Updated:** 2025-09-30
**Next Review:** After Phase 1 completion
