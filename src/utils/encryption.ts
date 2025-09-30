/**
 * Encryption Service for DNSChat
 *
 * Provides AES-256 encryption for conversation data with secure key management
 * using platform-specific keychain/keystore APIs.
 *
 * Security Features:
 * - AES-256-GCM encryption for conversation content
 * - PBKDF2 key derivation with salt
 * - Platform-specific secure key storage (Keychain/Keystore)
 * - Conversation-level encryption keys for data isolation
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { ENCRYPTION_CONSTANTS, ERROR_MESSAGES } from '../constants/appConstants';

// Web Crypto API is initialized in src/polyfills/webCrypto.ts
// which is imported at app startup in app/_layout.tsx
// The getWebCrypto() method validates crypto availability at runtime

// Keychain/Keystore interfaces
interface SecureStorage {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  migrateFromLegacy?(key: string): Promise<boolean>;
}

// PRODUCTION iOS Keychain implementation using react-native-keychain
// This provides REAL security using iOS Keychain Services
class IOSKeychain implements SecureStorage {
  private readonly SERVICE_PREFIX = 'com.dnschat.secure';

  async setItem(key: string, value: string): Promise<void> {
    try {
      await Keychain.setGenericPassword(key, value, {
        service: `${this.SERVICE_PREFIX}.${key}`,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
      });
    } catch (error) {
      throw new Error(
        `Failed to store key in iOS Keychain: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${this.SERVICE_PREFIX}.${key}`,
      });

      if (credentials && typeof credentials !== 'boolean') {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.warn(`Failed to retrieve key from iOS Keychain: ${error}`);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await Keychain.resetGenericPassword({
        service: `${this.SERVICE_PREFIX}.${key}`,
      });
    } catch (error) {
      console.warn(`Failed to remove key from iOS Keychain: ${error}`);
    }
  }

  /**
   * Migrate from legacy AsyncStorage-based "keychain" to real Keychain
   * This ensures existing users don't lose their encryption keys
   */
  async migrateFromLegacy(key: string): Promise<boolean> {
    try {
      // Check if real Keychain already has the key
      const existing = await this.getItem(key);
      if (existing) {
        return false; // Already migrated
      }

      // Try to read from legacy AsyncStorage location
      const legacyValue = await AsyncStorage.getItem(`keychain_${key}`);
      if (legacyValue) {
        // Migrate to real Keychain
        await this.setItem(key, legacyValue);

        // Remove from AsyncStorage
        await AsyncStorage.removeItem(`keychain_${key}`);

        console.log(`✅ Migrated key "${key}" from AsyncStorage to iOS Keychain`);
        return true;
      }

      return false; // No legacy key found
    } catch (error) {
      console.error(`Failed to migrate legacy key "${key}": ${error}`);
      return false;
    }
  }
}

// PRODUCTION Android Keystore implementation using react-native-keychain
// This provides REAL security using Android Keystore System
class AndroidKeystore implements SecureStorage {
  private readonly SERVICE_PREFIX = 'com.dnschat.secure';

  async setItem(key: string, value: string): Promise<void> {
    try {
      await Keychain.setGenericPassword(key, value, {
        service: `${this.SERVICE_PREFIX}.${key}`,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      throw new Error(
        `Failed to store key in Android Keystore: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${this.SERVICE_PREFIX}.${key}`,
      });

      if (credentials && typeof credentials !== 'boolean') {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.warn(`Failed to retrieve key from Android Keystore: ${error}`);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await Keychain.resetGenericPassword({
        service: `${this.SERVICE_PREFIX}.${key}`,
      });
    } catch (error) {
      console.warn(`Failed to remove key from Android Keystore: ${error}`);
    }
  }

  /**
   * Migrate from legacy AsyncStorage-based "keystore" to real Keystore
   * This ensures existing users don't lose their encryption keys
   */
  async migrateFromLegacy(key: string): Promise<boolean> {
    try {
      // Check if real Keystore already has the key
      const existing = await this.getItem(key);
      if (existing) {
        return false; // Already migrated
      }

      // Try to read from legacy AsyncStorage location
      const legacyValue = await AsyncStorage.getItem(`keystore_${key}`);
      if (legacyValue) {
        // Migrate to real Keystore
        await this.setItem(key, legacyValue);

        // Remove from AsyncStorage
        await AsyncStorage.removeItem(`keystore_${key}`);

        console.log(`✅ Migrated key "${key}" from AsyncStorage to Android Keystore`);
        return true;
      }

      return false; // No legacy key found
    } catch (error) {
      console.error(`Failed to migrate legacy key "${key}": ${error}`);
      return false;
    }
  }
}

class EncryptionService {
  private static secureStorage: SecureStorage;
  private static readonly SALT_LENGTH = ENCRYPTION_CONSTANTS.SALT_LENGTH;
  private static readonly KEY_LENGTH = ENCRYPTION_CONSTANTS.KEY_LENGTH;
  private static readonly IV_LENGTH = ENCRYPTION_CONSTANTS.IV_LENGTH;
  private static readonly PBKDF2_ITERATIONS = ENCRYPTION_CONSTANTS.PBKDF2_ITERATIONS;

  static {
    this.secureStorage = Platform.OS === 'ios' ? new IOSKeychain() : new AndroidKeystore();
  }

  /**
   * Generate a cryptographically secure random salt
   */
  private static async generateSalt(): Promise<Uint8Array> {
    const cryptoApi = this.getWebCrypto();
    const salt = new Uint8Array(this.SALT_LENGTH);
    cryptoApi.getRandomValues(salt);
    return salt;
  }

  /**
   * Derive an encryption key from a master password using PBKDF2
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
    const cryptoApi = this.getWebCrypto();
    const passwordBuffer = new TextEncoder().encode(password);

    const passwordKey = await cryptoApi.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await cryptoApi.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      passwordKey,
      this.KEY_LENGTH * 8 // 256 bits
    );

    return new Uint8Array(derivedBits);
  }

  /**
   * Generate a conversation-specific encryption key
   */
  static async generateConversationKey(conversationId: string): Promise<string> {
    const masterPassword = await this.getOrCreateMasterPassword();
    const salt = await this.generateSalt();
    const key = await this.deriveKey(masterPassword, salt);

    // Store salt and key in secure storage
    const keyData = {
      salt: Array.from(salt),
      key: Array.from(key),
      created: Date.now(),
    };

    await this.secureStorage.setItem(
      `conv_key_${conversationId}`,
      JSON.stringify(keyData)
    );

    return conversationId; // Return conversation ID as key reference
  }

  /**
   * Get or create a master password for key derivation
   */
  private static async getOrCreateMasterPassword(): Promise<string> {
    const stored = await this.secureStorage.getItem('master_password');
    if (stored) {
      return stored;
    }

    // Generate a random master password
    const masterPassword = this.generateRandomString(32);
    await this.secureStorage.setItem('master_password', masterPassword);
    return masterPassword;
  }

  /**
   * Generate a cryptographically secure random string
   */
  private static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    const values = this.getWebCrypto().getRandomValues(new Uint8Array(length));
    for (let i = 0; i < length; i++) {
      result += chars[values[i] % chars.length];
    }
    return result;
  }

  /**
   * Encrypt conversation data using AES-256-GCM
   */
  static async encryptConversation(data: string, conversationId: string): Promise<string> {
    const keyData = await this.getConversationKey(conversationId);
    if (!keyData) {
      throw new Error(`No encryption key found for conversation ${conversationId}`);
    }

    const cryptoApi = this.getWebCrypto();
    const key = await cryptoApi.subtle.importKey(
      'raw',
      new Uint8Array(keyData.key),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const iv = cryptoApi.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const encodedData = new TextEncoder().encode(data);

    const encrypted = await cryptoApi.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedData
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 safely using chunked encoding to avoid stack overflow
    // Using spread operator on large arrays causes "Maximum call stack size exceeded"
    const CHUNK_SIZE = ENCRYPTION_CONSTANTS.CHUNK_SIZE;
    const MAX_TOTAL_SIZE = ENCRYPTION_CONSTANTS.MAX_DATA_SIZE_BYTES;
    
    // SECURITY FIX: Add size limit to prevent memory exhaustion attacks
    if (combined.length > MAX_TOTAL_SIZE) {
      throw new Error(ERROR_MESSAGES.DATA_TOO_LARGE);
    }
    
    let base64 = '';
    for (let i = 0; i < combined.length; i += CHUNK_SIZE) {
      const chunk = combined.subarray(i, Math.min(i + CHUNK_SIZE, combined.length));
      const charArray = Array.from(chunk);
      base64 += btoa(String.fromCharCode.apply(null, charArray));
    }
    return base64;
  }

  /**
   * Decrypt conversation data using AES-256-GCM
   */
  static async decryptConversation(encryptedData: string, conversationId: string): Promise<string> {
    const keyData = await this.getConversationKey(conversationId);
    if (!keyData) {
      throw new Error(`No encryption key found for conversation ${conversationId}`);
    }

    const cryptoApi = this.getWebCrypto();
    const key = await cryptoApi.subtle.importKey(
      'raw',
      new Uint8Array(keyData.key),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Decode base64 efficiently without creating intermediate array
    // Using split('').map() for large data is inefficient
    const binaryString = atob(encryptedData);
    const combined = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }

    const iv = combined.slice(0, this.IV_LENGTH);
    const ciphertext = combined.slice(this.IV_LENGTH);

    const decrypted = await cryptoApi.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  }

  /**
   * Get conversation encryption key from secure storage
   * Automatically migrates from legacy AsyncStorage if needed
   */
  private static async getConversationKey(conversationId: string): Promise<{salt: number[], key: number[]} | null> {
    const keyName = `conv_key_${conversationId}`;

    // Try to get from secure storage first
    let stored = await this.secureStorage.getItem(keyName);

    // If not found and migration is available, try to migrate from legacy storage
    if (!stored && this.secureStorage.migrateFromLegacy) {
      const migrated = await this.secureStorage.migrateFromLegacy(keyName);
      if (migrated) {
        // Retry after migration
        stored = await this.secureStorage.getItem(keyName);
      }
    }

    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Migrate all encryption keys from legacy AsyncStorage to secure storage
   * This should be called once on app startup for existing users
   */
  static async migrateAllKeysToSecureStorage(): Promise<{
    migrated: number;
    failed: number;
    keys: string[];
  }> {
    const result = {
      migrated: 0,
      failed: 0,
      keys: [] as string[],
    };

    if (!this.secureStorage.migrateFromLegacy) {
      console.warn('Migration not supported on this platform');
      return result;
    }

    try {
      // Get all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();

      // Find all legacy encryption keys
      const prefix = Platform.OS === 'ios' ? 'keychain_' : 'keystore_';
      const legacyKeys = allKeys.filter(key => key.startsWith(prefix));

      for (const fullKey of legacyKeys) {
        const key = fullKey.replace(prefix, '');
        try {
          const migrated = await this.secureStorage.migrateFromLegacy(key);
          if (migrated) {
            result.migrated++;
            result.keys.push(key);
          }
        } catch (error) {
          console.error(`Failed to migrate key ${key}:`, error);
          result.failed++;
        }
      }

      if (result.migrated > 0) {
        console.log(
          `🔐 Migrated ${result.migrated} encryption keys to secure storage (${result.failed} failed)`
        );
      }
    } catch (error) {
      console.error('Failed to migrate encryption keys:', error);
    }

    return result;
  }

  /**
   * Check if conversation is encrypted
   */
  static async isConversationEncrypted(conversationId: string): Promise<boolean> {
    const keyData = await this.getConversationKey(conversationId);
    return keyData !== null;
  }

  /**
   * Delete conversation encryption key
   */
  static async deleteConversationKey(conversationId: string): Promise<void> {
    await this.secureStorage.removeItem(`conv_key_${conversationId}`);
  }

  /**
   * Rotate master password (for security maintenance)
   *
   * ⚠️ CRITICAL WARNING: This function is NOT IMPLEMENTED because it would cause
   * permanent data loss. Here's why:
   *
   * 1. Existing conversations are encrypted with AES keys derived from the OLD master password
   * 2. Simply rotating the master password would generate NEW AES keys
   * 3. The NEW keys cannot decrypt data encrypted with the OLD keys
   * 4. Result: All conversation history becomes permanently inaccessible
   *
   * To safely rotate the master password, we would need to:
   * 1. Load ALL conversations and decrypt with OLD keys
   * 2. Generate NEW keys from NEW master password
   * 3. Re-encrypt ALL conversations with NEW keys
   * 4. Save ALL conversations back to storage
   *
   * This cross-cuts StorageService and EncryptionService and is extremely risky.
   * For production use, rely on Keychain/Keystore security instead of rotation.
   *
   * @deprecated DO NOT USE - Will throw error
   * @throws {Error} Always throws - function not safely implementable
   */
  static async rotateMasterPassword(): Promise<void> {
    throw new Error(
      'Master password rotation is not implemented. ' +
      'Rotating would cause permanent data loss because existing encrypted ' +
      'conversations cannot be decrypted with new keys. ' +
      'Keychain/Keystore already provides secure storage without needing rotation.'
    );
  }

  private static getWebCrypto(): Crypto {
    const cryptoApi = globalThis.crypto as Crypto | undefined;
    if (!cryptoApi || !cryptoApi.subtle || !cryptoApi.getRandomValues) {
      // This should never happen if webCrypto.ts polyfill loaded correctly
      throw new Error(
        'CRITICAL: Web Crypto API became unavailable at runtime. ' +
        'This indicates a severe initialization failure. ' +
        'Ensure src/polyfills/webCrypto.ts is imported at app startup.'
      );
    }
    return cryptoApi;
  }
}

export { EncryptionService };
export type { SecureStorage };
