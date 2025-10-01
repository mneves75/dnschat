/**
 * P0 Security Fixes - Regression Tests
 *
 * These tests verify critical security fixes to prevent:
 * - P0-1: Race conditions in key generation
 * - P0-2: Race conditions in master password creation
 * - P0-3: Orphaned encryption keys (GDPR/compliance)
 * - P0-4: Data loss on device restore
 * - P0-5: Crashes from corrupted key data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EncryptionService } from '../src/utils/encryption';
import { StorageService } from '../src/services/storageService';

describe('P0 Security Fixes - Regression Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    // Reset any cached state in EncryptionService
    (EncryptionService as any).masterPasswordPromise = null;
    (EncryptionService as any).keyGenerationLocks.clear();
    // Reset TestSecureStorage instance
    const secureStorage = (EncryptionService as any).secureStorage;
    if (secureStorage && 'storage' in secureStorage) {
      secureStorage.storage.clear();
    }
  });

  describe('P0-1: Race Condition in Key Generation', () => {
    it('should handle concurrent key generation for same conversation', async () => {
      const conversationId = 'test-chat-concurrent';

      // Simulate 10 concurrent requests to generate the same key
      const promises = Array.from({ length: 10 }, () =>
        EncryptionService.generateConversationKey(conversationId)
      );

      const results = await Promise.all(promises);

      // All should return the same conversation ID
      expect(results.every(id => id === conversationId)).toBe(true);

      // Verify key is usable
      const testData = 'Hello, concurrent world!';
      const encrypted = await EncryptionService.encryptConversation(testData, conversationId);
      const decrypted = await EncryptionService.decryptConversation(encrypted, conversationId);

      expect(decrypted).toBe(testData);
    });

    it('should not create duplicate keys for concurrent requests', async () => {
      const conversationId = 'test-chat-no-duplicates';

      // Track all generated keys
      const secureStorage = (EncryptionService as any).secureStorage;
      const setItemSpy = jest.spyOn(secureStorage, 'setItem');

      // Make 5 concurrent requests
      await Promise.all([
        EncryptionService.generateConversationKey(conversationId),
        EncryptionService.generateConversationKey(conversationId),
        EncryptionService.generateConversationKey(conversationId),
        EncryptionService.generateConversationKey(conversationId),
        EncryptionService.generateConversationKey(conversationId),
      ]);

      // Should only have created the key once
      const keyCreationCalls = setItemSpy.mock.calls.filter(
        call => call[0] === `conv_key_${conversationId}`
      );

      expect(keyCreationCalls.length).toBe(1);

      setItemSpy.mockRestore();
    });

    it('should handle concurrent key generation for different conversations', async () => {
      const conversationIds = ['chat-1', 'chat-2', 'chat-3', 'chat-4', 'chat-5'];

      // Generate keys concurrently for different conversations
      await Promise.all(
        conversationIds.map(id => EncryptionService.generateConversationKey(id))
      );

      // Verify all keys work
      for (const id of conversationIds) {
        const testData = `Message for ${id}`;
        const encrypted = await EncryptionService.encryptConversation(testData, id);
        const decrypted = await EncryptionService.decryptConversation(encrypted, id);
        expect(decrypted).toBe(testData);
      }
    });
  });

  describe('P0-2: Race Condition in Master Password', () => {
    it('should handle concurrent master password creation', async () => {
      // Simulate app startup with many services requesting master password
      const promises = Array.from({ length: 50 }, () =>
        (EncryptionService as any).getOrCreateMasterPassword()
      );

      const passwords = await Promise.all(promises);

      // All should be identical
      const uniquePasswords = new Set(passwords);
      expect(uniquePasswords.size).toBe(1);

      // Password should be 32 characters
      expect(passwords[0]).toHaveLength(32);
    });

    it('should only create master password once despite concurrent access', async () => {
      const secureStorage = (EncryptionService as any).secureStorage;
      const setItemSpy = jest.spyOn(secureStorage, 'setItem');

      // Make 100 concurrent requests
      await Promise.all(
        Array.from({ length: 100 }, () =>
          (EncryptionService as any).getOrCreateMasterPassword()
        )
      );

      // Should only have created master password once
      const masterPasswordCalls = setItemSpy.mock.calls.filter(
        call => call[0] === 'master_password'
      );

      expect(masterPasswordCalls.length).toBe(1);

      setItemSpy.mockRestore();
    });

    it('should use cached master password after creation', async () => {
      const secureStorage = (EncryptionService as any).secureStorage;

      // First call creates it
      const password1 = await (EncryptionService as any).getOrCreateMasterPassword();

      // Second call should use cached version (not read from storage)
      const getItemSpy = jest.spyOn(secureStorage, 'getItem');
      const password2 = await (EncryptionService as any).getOrCreateMasterPassword();

      expect(password1).toBe(password2);
      expect(getItemSpy).not.toHaveBeenCalled();

      getItemSpy.mockRestore();
    });
  });

  describe('P0-3: Encryption Key Cleanup', () => {
    it('should delete encryption key when deleting chat', async () => {
      // Create a chat with encrypted messages
      const chat = await StorageService.createChat('Test Chat');
      await StorageService.addMessage(chat.id, {
        id: 'msg-1',
        role: 'user',
        content: 'Test message',
        status: 'sent',
        timestamp: new Date(),
      });

      // Verify key exists
      const hasKeyBefore = await EncryptionService.isConversationEncrypted(chat.id);
      expect(hasKeyBefore).toBe(true);

      // Delete the chat
      await StorageService.deleteChat(chat.id);

      // Verify key is removed
      const hasKeyAfter = await EncryptionService.isConversationEncrypted(chat.id);
      expect(hasKeyAfter).toBe(false);
    });

    it('should not fail chat deletion if key cleanup fails', async () => {
      const chat = await StorageService.createChat('Test Chat');

      // Mock key deletion to fail
      const deleteKeySpy = jest
        .spyOn(EncryptionService, 'deleteConversationKey')
        .mockRejectedValue(new Error('Keychain error'));

      // Chat deletion should still succeed
      await expect(StorageService.deleteChat(chat.id)).resolves.not.toThrow();

      // Chat should be gone
      const chats = await StorageService.loadChats();
      expect(chats.find(c => c.id === chat.id)).toBeUndefined();

      deleteKeySpy.mockRestore();
    });
  });

  describe('P0-4: Key Recovery Mechanism', () => {
    it('should export and import recovery bundle', async () => {
      // Generate some encryption keys
      await EncryptionService.generateConversationKey('chat-1');
      await EncryptionService.generateConversationKey('chat-2');

      // Export recovery bundle
      const userPassword = 'MySecurePassword123!';
      const bundle = await EncryptionService.exportRecoveryBundle(userPassword);

      expect(bundle).toBeTruthy();
      expect(typeof bundle).toBe('string');

      // Verify bundle is valid JSON
      const parsed = JSON.parse(bundle);
      expect(parsed.version).toBe(1);
      expect(parsed.created).toBeLessThanOrEqual(Date.now());
      expect(Array.isArray(parsed.userSalt)).toBe(true);
      expect(Array.isArray(parsed.iv)).toBe(true);
      expect(Array.isArray(parsed.encryptedMasterPassword)).toBe(true);
    });

    it('should restore master password from recovery bundle', async () => {
      // Create original master password and keys
      const originalPassword = await (EncryptionService as any).getOrCreateMasterPassword();
      await EncryptionService.generateConversationKey('test-chat');

      const testData = 'Important data';
      const encrypted = await EncryptionService.encryptConversation(testData, 'test-chat');

      // Export bundle
      const userPassword = 'RecoveryPassword456!';
      const bundle = await EncryptionService.exportRecoveryBundle(userPassword);

      // Simulate device restore by clearing storage
      await AsyncStorage.clear();
      (EncryptionService as any).masterPasswordPromise = null;

      // Import bundle
      await EncryptionService.importRecoveryBundle(bundle, userPassword);

      // Verify master password was restored
      const restoredPassword = await (EncryptionService as any).getOrCreateMasterPassword();
      expect(restoredPassword).toBe(originalPassword);

      // Verify we can still decrypt data (conversation keys would need to be re-created)
      // This test just verifies the master password is correct
    });

    it('should reject recovery bundle with wrong password', async () => {
      await EncryptionService.generateConversationKey('test-chat');

      const correctPassword = 'CorrectPassword789!';
      const wrongPassword = 'WrongPassword000!';

      const bundle = await EncryptionService.exportRecoveryBundle(correctPassword);

      await expect(
        EncryptionService.importRecoveryBundle(bundle, wrongPassword)
      ).rejects.toThrow('Incorrect recovery password');
    });

    it('should require minimum 8 character password', async () => {
      await expect(
        EncryptionService.exportRecoveryBundle('short')
      ).rejects.toThrow('at least 8 characters');
    });

    it('should detect if recovery bundle can be created', async () => {
      // Before any keys exist
      const canExportBefore = await EncryptionService.canExportRecoveryBundle();
      expect(canExportBefore).toBe(false);

      // After generating a key
      await EncryptionService.generateConversationKey('test-chat');
      const canExportAfter = await EncryptionService.canExportRecoveryBundle();
      expect(canExportAfter).toBe(true);
    });
  });

  describe('P0-5: Safe JSON Parsing', () => {
    it('should handle corrupted JSON in key data', async () => {
      const conversationId = 'test-corrupted-json';
      const secureStorage = (EncryptionService as any).secureStorage;

      // Store corrupted JSON
      await secureStorage.setItem(`conv_key_${conversationId}`, 'CORRUPTED{]}}');

      // Should not crash, should return null
      const key = await (EncryptionService as any).getConversationKey(conversationId);
      expect(key).toBeNull();

      // Corrupted key should be removed
      const stored = await secureStorage.getItem(`conv_key_${conversationId}`);
      expect(stored).toBeNull();
    });

    it('should handle invalid key structure', async () => {
      const conversationId = 'test-invalid-structure';
      const secureStorage = (EncryptionService as any).secureStorage;

      // Store valid JSON but invalid structure
      await secureStorage.setItem(
        `conv_key_${conversationId}`,
        JSON.stringify({ invalid: 'structure' })
      );

      // Should not crash, should return null
      const key = await (EncryptionService as any).getConversationKey(conversationId);
      expect(key).toBeNull();
    });

    it('should handle key with wrong salt length', async () => {
      const conversationId = 'test-wrong-salt-length';
      const secureStorage = (EncryptionService as any).secureStorage;

      // Store key with wrong salt length
      await secureStorage.setItem(
        `conv_key_${conversationId}`,
        JSON.stringify({
          salt: [1, 2, 3], // Too short
          key: new Array(32).fill(0),
          created: Date.now(),
        })
      );

      const key = await (EncryptionService as any).getConversationKey(conversationId);
      expect(key).toBeNull();
    });

    it('should handle key with wrong key length', async () => {
      const conversationId = 'test-wrong-key-length';
      const secureStorage = (EncryptionService as any).secureStorage;

      // Store key with wrong key length
      await secureStorage.setItem(
        `conv_key_${conversationId}`,
        JSON.stringify({
          salt: new Array(32).fill(0),
          key: [1, 2, 3], // Too short
          created: Date.now(),
        })
      );

      const key = await (EncryptionService as any).getConversationKey(conversationId);
      expect(key).toBeNull();
    });

    it('should handle key with non-numeric values', async () => {
      const conversationId = 'test-non-numeric';
      const secureStorage = (EncryptionService as any).secureStorage;

      // Store key with non-numeric values
      await secureStorage.setItem(
        `conv_key_${conversationId}`,
        JSON.stringify({
          salt: new Array(32).fill('not a number'),
          key: new Array(32).fill(0),
          created: Date.now(),
        })
      );

      const key = await (EncryptionService as any).getConversationKey(conversationId);
      expect(key).toBeNull();
    });

    it('should accept valid key structure', async () => {
      const conversationId = 'test-valid-key';

      // Generate a real key
      await EncryptionService.generateConversationKey(conversationId);

      // Should successfully retrieve it
      const key = await (EncryptionService as any).getConversationKey(conversationId);
      expect(key).not.toBeNull();
      expect(Array.isArray(key.salt)).toBe(true);
      expect(Array.isArray(key.key)).toBe(true);
      expect(key.salt.length).toBe(32);
      expect(key.key.length).toBe(32);
    });
  });

  describe('Integration: All P0 Fixes Together', () => {
    it('should handle end-to-end encryption lifecycle', async () => {
      // 1. Create multiple chats (sequential to avoid test flakiness)
      const chatIds = [];
      for (let i = 0; i < 5; i++) {
        const chat = await StorageService.createChat(`Chat ${i + 1}`);
        chatIds.push(chat.id);
      }

      // Reload chats to ensure they're properly persisted
      const loadedChats = await StorageService.loadChats();
      expect(loadedChats.length).toBe(5);

      // 2. Add messages to all chats
      for (const chat of loadedChats) {
        await StorageService.addMessage(chat.id, {
          id: 'msg-1',
          role: 'user',
          content: `Message in ${chat.title}`,
          status: 'sent',
          timestamp: new Date(),
        });
      }

      // 3. Export recovery bundle (tests P0-4)
      const recoveryPassword = 'MyRecoveryPassword123!';
      const bundle = await EncryptionService.exportRecoveryBundle(recoveryPassword);

      // 4. Delete one chat (tests P0-3)
      await StorageService.deleteChat(loadedChats[0].id);
      const hasKey = await EncryptionService.isConversationEncrypted(loadedChats[0].id);
      expect(hasKey).toBe(false);

      // 5. Simulate device restore
      const masterPasswordBefore = await (EncryptionService as any).getOrCreateMasterPassword();

      // Clear only the secure storage (simulating Keychain wipe on device restore)
      const secureStorage = (EncryptionService as any).secureStorage;
      if (secureStorage && 'storage' in secureStorage) {
        secureStorage.storage.clear();
      }
      (EncryptionService as any).masterPasswordPromise = null;

      // 6. Import recovery bundle
      await EncryptionService.importRecoveryBundle(bundle, recoveryPassword);
      const masterPasswordAfter = await (EncryptionService as any).getOrCreateMasterPassword();
      expect(masterPasswordAfter).toBe(masterPasswordBefore);

      // 7. Verify we can generate new keys with the restored master password
      await EncryptionService.generateConversationKey('restored-chat');
      const canEncrypt = await EncryptionService.isConversationEncrypted('restored-chat');
      expect(canEncrypt).toBe(true);

      // Note: Old chats would need their conversation keys regenerated after restore
      // This is a known limitation documented in the recovery mechanism
    });
  });
});
