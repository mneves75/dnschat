# EXECPLAN — Storage Corruption Recovery + SecureStore Key Fix + DNS Native Timeout

Date: 2026-01-04
Owner: Codex (autonomous execution)
Status: Complete (code + tests)

## Context
Recent runtime logs show:
- SecureStore key errors: invalid key name causes key persistence to fail.
- AES-GCM decryption failures (`invalid ghash tag`) and chat JSON parse errors.
- StorageService throws `StorageCorruptionError`, leading to unhandled promise crashes in UI.
- DNS native query can hang without resolution (native promise never resolves).

## Goals
1. Make encryption key persistence reliable across sessions (valid SecureStore key name, validate key length).
2. Prevent storage corruption from crashing the app.
3. Provide deterministic recovery path (clear corrupted storage and allow app to continue).
4. Ensure DNS log storage can recover from decryption/parse failures.
5. Ensure UI code never throws unhandled promise errors when storage fails.
6. Keep DNS transport robust (native query timeout fallback already implemented).

## Non-Goals
- Cross-device data migration.
- Server-side recovery of chat history.
- Introducing new encryption formats or key rotation beyond this fix.

## Root Cause Summary
- `encryptionService` uses `KEY_STORAGE_KEY = '@dnschat/encryption-key'`, which violates SecureStore key constraints (only alphanumeric, `.`, `-`, `_`).
- SecureStore fails to persist the key; a new key is generated each run.
- Existing encrypted chat payloads cannot be decrypted on restart, causing AES-GCM failures and JSON parse errors.
- Storage corruption errors propagate to UI and create unhandled promise rejections (e.g., `Chat` screen calling `createChat()` without awaiting/catching).

## Design Overview
### Encryption Key Fix
- Replace SecureStore key with a valid identifier (e.g., `dnschat.encryption_key`).
- Validate stored key length (must match `ENCRYPTION_CONSTANTS.KEY_LENGTH`), otherwise regenerate and overwrite.
- Continue to encrypt/decrypt payloads with AES-GCM, preserving the existing `enc:v1:` format.

### Storage Corruption Recovery
- Provide a recovery path when `StorageCorruptionError` occurs:
  - Clear corrupted chat storage.
  - Return an empty chat list so the app can continue.
  - Log a warning for diagnostics.
- Keep the ability to *detect* corruption in tests by supporting an option to disable recovery.

### UI/Caller Hardening
- Ensure UI code does not generate unhandled promise rejections when createChat fails.
- Where appropriate, catch and surface errors to the existing error alert UI.

## Implementation Plan (Multi-Phase)
### Phase 1 — Spec + Audit
- [x] Inspect encryption, storage, DNS services.
- [x] Identify SecureStore key constraints and failure points.
- [x] Draft this execution plan.

### Phase 2 — Core Fixes
- [x] Update SecureStore key to a valid identifier.
- [x] Validate stored key length and regenerate if invalid.
- [x] Add recovery mode to `StorageService.loadChats` (default on; tests can disable).
- [x] On corruption recovery: clear chats storage and return `[]`.
- [x] Back up corrupted chats payloads before clearing.
- [x] Add DNS log recovery with backup + clear on decrypt/parse failure.

### Phase 3 — Caller Hardening
- [x] Update `Chat` screen to handle `createChat()` promise rejection.
- [x] Ensure `ChatContext` (load/create) handles corruption by clearing storage and proceeding safely.
- [x] Show error alert in chat list screens to surface storage reset.

### Phase 4 — Tests + Verification
- [x] Update storage corruption tests for recovery option.
- [x] Run targeted tests for storage service.
- [x] Add DNS log recovery tests.
- [x] Add encryption key persistence tests.
- [x] Validate app startup path for unhandled promise errors via code review + tests.

## Detailed Task Breakdown
1. **EncryptionService**
   - Change key name constant to `dnschat.encryption_key`.
   - Add validation: decoded key length must equal `ENCRYPTION_CONSTANTS.KEY_LENGTH`.
   - If invalid: log warning and regenerate + persist.

2. **StorageService**
   - Add `loadChats({ recoverOnCorruption = true })` option.
   - On `StorageCorruptionError` and `recoverOnCorruption === true`:
     - Back up the raw payload to `CHAT_BACKUP_KEY` with timestamp + error.
     - Clear `@chat_dns_chats` via AsyncStorage.
     - Return `[]`.
   - Preserve previous throwing behavior when `recoverOnCorruption === false` for tests.

3. **DNSLogService**
   - Use `STORAGE_CONSTANTS.LOGS_KEY` for storage key.
   - On decrypt/parse failure:
     - Back up raw payload to `LOGS_BACKUP_KEY` with timestamp + error.
     - Clear `LOGS_KEY` from AsyncStorage.
     - Reset logs to empty in memory.

4. **ChatContext**
   - When `loadChats()` fails with `StorageCorruptionError`:
     - Set error message explaining that storage was reset.
     - Reset state to empty chats and null currentChat.

5. **Chat Screen**
   - Handle `createChat()` errors in `useEffect` to avoid unhandled promises.

6. **Tests**
   - Update corruption tests:
     - Default loadChats should recover (no throw) and clear storage.
     - Add tests using `recoverOnCorruption: false` to assert detection still works.

## Risks / Edge Cases
- Existing encrypted data cannot be recovered because the old key was never persisted.
- Clearing corrupted storage is destructive but necessary for stability.
- SecureStore may be unavailable on some platforms; in that case key persistence still fails but will log and continue.

## Verification Checklist
- [x] SecureStore key name now valid; persistence verified by unit tests.
- [x] No unhandled promise paths in chat creation (reviewed call sites + tests).
- [x] `StorageService.loadChats()` returns `[]` on corrupted data by default.
- [x] Unit tests updated and passing (targeted: storage corruption + DNS log recovery + encryption key).

## Optional QA (Recommended)
- Device/simulator smoke test to confirm no runtime warnings on startup.

## Evidence
- `npm test -- __tests__/storageService.corruption.spec.ts __tests__/dnsLogService.recovery.spec.ts __tests__/encryptionService.key.spec.ts` (PASS; console.warn emitted for invalid key length test)
