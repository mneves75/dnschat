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

import { Platform, NativeModules } from 'react-native';
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

// Detect test environment at module load time (not runtime)
// This ensures explicit test vs. production behavior
const isTestEnvironment =
  process.env.JEST_WORKER_ID !== undefined ||
  process.env.NODE_ENV === 'test';

// Test-only SecureStorage implementation
// Uses in-memory storage instead of native modules
// SECURITY: Never use this in production - only for Jest tests
class TestSecureStorage implements SecureStorage {
  private storage = new Map<string, string>();

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) ?? null;
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  // No migration needed in tests
  async migrateFromLegacy(): Promise<boolean> {
    return false;
  }
}

// PRODUCTION iOS Keychain implementation using react-native-keychain
// This provides REAL security using iOS Keychain Services
// SECURITY: Fails fast if Keychain unavailable - no silent degradation
class IOSKeychain implements SecureStorage {
  private readonly SERVICE_PREFIX = 'com.dnschat.secure';

  async setItem(key: string, value: string): Promise<void> {
    await Keychain.setGenericPassword(key, value, {
      service: `${this.SERVICE_PREFIX}.${key}`,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
    });
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
// SECURITY: Fails fast if Keystore unavailable - no silent degradation
class AndroidKeystore implements SecureStorage {
  private readonly SERVICE_PREFIX = 'com.dnschat.secure';

  async setItem(key: string, value: string): Promise<void> {
    await Keychain.setGenericPassword(key, value, {
      service: `${this.SERVICE_PREFIX}.${key}`,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
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

  // P0-1 FIX: Mutex locks to prevent race conditions in key generation
  // Maps conversation ID to in-progress key generation promise
  private static keyGenerationLocks = new Map<string, Promise<string>>();

  // P0-2 FIX: Cache master password creation to prevent race conditions
  // Only one master password should ever be created
  private static masterPasswordPromise: Promise<string> | null = null;

  static {
    // Environment-based storage selection at module load time
    // SECURITY: Explicit test vs. production behavior prevents silent degradation
    if (isTestEnvironment) {
      // Jest tests use in-memory storage (no native modules available)
      this.secureStorage = new TestSecureStorage();
    } else {
      // Production uses platform-specific secure storage (fails fast if unavailable)
      this.secureStorage = Platform.OS === 'ios' ? new IOSKeychain() : new AndroidKeystore();
    }
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
   *
   * P0-1 FIX: Uses mutex locking to prevent race conditions when multiple
   * concurrent calls try to generate the same key. Without this, two threads
   * could generate different keys and the last write would win, making data
   * encrypted with the first key permanently undecryptable.
   */
  static async generateConversationKey(conversationId: string): Promise<string> {
    // Check if key already exists (fast path, no lock needed)
    const existing = await this.getConversationKey(conversationId);
    if (existing) {
      return conversationId;
    }

    // Check if generation is already in progress
    const inProgress = this.keyGenerationLocks.get(conversationId);
    if (inProgress) {
      // Wait for the in-progress generation to complete
      await inProgress;
      return conversationId;
    }

    // Start new key generation and store the promise
    const promise = this._generateConversationKeyImpl(conversationId);
    this.keyGenerationLocks.set(conversationId, promise);

    try {
      await promise;
      return conversationId;
    } finally {
      // Clean up the lock when done
      this.keyGenerationLocks.delete(conversationId);
    }
  }

  /**
   * Internal implementation of key generation
   * Should only be called through generateConversationKey() which handles locking
   */
  private static async _generateConversationKeyImpl(conversationId: string): Promise<string> {
    // Double-check after acquiring lock (another thread might have created it)
    const existing = await this.getConversationKey(conversationId);
    if (existing) {
      return conversationId;
    }

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

    return conversationId;
  }

  /**
   * Get or create a master password for key derivation
   *
   * P0-2 FIX: Caches the promise to prevent race conditions when multiple
   * concurrent calls try to create the master password. Without this, two
   * threads could generate different passwords, and ALL conversations encrypted
   * with the first password would become permanently undecryptable.
   */
  private static async getOrCreateMasterPassword(): Promise<string> {
    // If creation is already in progress, wait for it
    if (this.masterPasswordPromise) {
      return this.masterPasswordPromise;
    }

    // Start master password creation and cache the promise
    this.masterPasswordPromise = (async () => {
      const stored = await this.secureStorage.getItem('master_password');
      if (stored) {
        return stored;
      }

      // Generate a random master password
      const masterPassword = this.generateRandomString(32);
      await this.secureStorage.setItem('master_password', masterPassword);
      console.log('✅ Generated new master password for encryption');
      return masterPassword;
    })();

    // Keep promise cached permanently (master password should be stable)
    return this.masterPasswordPromise;
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
   *
   * P0-5 FIX: Safe JSON parsing with validation to prevent crashes from
   * corrupted Keychain data. Validates structure and regenerates if corrupted.
   */
  private static async getConversationKey(conversationId: string): Promise<{salt: number[], key: number[], created?: number} | null> {
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

    if (!stored) {
      return null;
    }

    // P0-5 FIX: Safe JSON parsing with validation
    try {
      const parsed = JSON.parse(stored);

      // Validate structure
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid key data: not an object');
      }

      if (!Array.isArray(parsed.salt) || !Array.isArray(parsed.key)) {
        throw new Error('Invalid key data: salt and key must be arrays');
      }

      if (parsed.salt.length !== this.SALT_LENGTH) {
        throw new Error(`Invalid key data: salt length ${parsed.salt.length}, expected ${this.SALT_LENGTH}`);
      }

      if (parsed.key.length !== this.KEY_LENGTH) {
        throw new Error(`Invalid key data: key length ${parsed.key.length}, expected ${this.KEY_LENGTH}`);
      }

      // Validate array contents are numbers
      if (!parsed.salt.every((n: any) => typeof n === 'number')) {
        throw new Error('Invalid key data: salt contains non-numeric values');
      }

      if (!parsed.key.every((n: any) => typeof n === 'number')) {
        throw new Error('Invalid key data: key contains non-numeric values');
      }

      return parsed;
    } catch (error) {
      console.error(`❌ Corrupted encryption key for ${conversationId}:`, error);

      // Remove corrupted key to prevent future crashes
      try {
        await this.secureStorage.removeItem(keyName);
        console.warn(`⚠️ Removed corrupted key for ${conversationId}`);
      } catch (removeError) {
        console.error(`Failed to remove corrupted key for ${conversationId}:`, removeError);
      }

      // Return null to signal missing key
      // Caller will need to handle this (regenerate or recover from backup)
      return null;
    }
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
   * P0-4 FIX: Export recovery bundle for device restore
   *
   * Creates an encrypted bundle containing the master password, protected by
   * a user-provided password. This allows users to recover their encryption
   * keys when switching devices or restoring from backup.
   *
   * SECURITY: The recovery bundle should be stored securely by the user
   * (e.g., password manager, printed backup, secure cloud storage).
   *
   * @param userPassword - User-provided password to protect the bundle
   * @returns JSON string containing the encrypted recovery bundle
   */
  static async exportRecoveryBundle(userPassword: string): Promise<string> {
    if (!userPassword || userPassword.length < 8) {
      throw new Error('Recovery password must be at least 8 characters');
    }

    try {
      // Get the master password
      const masterPassword = await this.getOrCreateMasterPassword();

      // Generate a salt for the user's password
      const userSalt = await this.generateSalt();

      // Derive a key from the user's password
      const userKey = await this.deriveKey(userPassword, userSalt);

      // Encrypt the master password with the user's key
      const cryptoApi = this.getWebCrypto();
      const key = await cryptoApi.subtle.importKey(
        'raw',
        userKey as BufferSource,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const iv = cryptoApi.getRandomValues(new Uint8Array(this.IV_LENGTH));
      const encodedMasterPassword = new TextEncoder().encode(masterPassword);

      const encrypted = await cryptoApi.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedMasterPassword
      );

      // Create recovery bundle
      const bundle = {
        version: 1,
        created: Date.now(),
        userSalt: Array.from(userSalt),
        iv: Array.from(iv),
        encryptedMasterPassword: Array.from(new Uint8Array(encrypted)),
      };

      return JSON.stringify(bundle, null, 2);
    } catch (error) {
      console.error('Failed to create recovery bundle:', error);
      throw new Error(`Recovery bundle creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * P0-4 FIX: Import recovery bundle to restore encryption keys
   *
   * Decrypts a recovery bundle using the user's password and restores the
   * master password to the secure storage. This allows users to regain access
   * to their encrypted conversations after a device restore.
   *
   * CRITICAL: This will overwrite the current master password. Only use when
   * restoring to a new device or after losing encryption keys.
   *
   * @param bundleJson - JSON string containing the encrypted recovery bundle
   * @param userPassword - User's password used to create the bundle
   * @throws {Error} If password is incorrect or bundle is corrupted
   */
  static async importRecoveryBundle(bundleJson: string, userPassword: string): Promise<void> {
    if (!userPassword) {
      throw new Error('Recovery password is required');
    }

    try {
      // Parse and validate bundle
      const bundle = JSON.parse(bundleJson);

      if (bundle.version !== 1) {
        throw new Error(`Unsupported recovery bundle version: ${bundle.version}`);
      }

      if (!Array.isArray(bundle.userSalt) || !Array.isArray(bundle.iv) || !Array.isArray(bundle.encryptedMasterPassword)) {
        throw new Error('Invalid recovery bundle structure');
      }

      // Derive key from user's password
      const userSalt = new Uint8Array(bundle.userSalt);
      const userKey = await this.deriveKey(userPassword, userSalt);

      // Decrypt the master password
      const cryptoApi = this.getWebCrypto();
      const key = await cryptoApi.subtle.importKey(
        'raw',
        userKey as BufferSource,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const iv = new Uint8Array(bundle.iv);
      const encrypted = new Uint8Array(bundle.encryptedMasterPassword);

      const decrypted = await cryptoApi.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      const masterPassword = new TextDecoder().decode(decrypted);

      // Validate master password format (should be 32 character alphanumeric)
      if (masterPassword.length !== 32) {
        throw new Error('Invalid master password in bundle');
      }

      // Store the recovered master password
      await this.secureStorage.setItem('master_password', masterPassword);

      // Clear the cached promise so it reloads from storage
      this.masterPasswordPromise = null;

      console.log('✅ Recovery bundle imported successfully');
      console.log(`   Bundle created: ${new Date(bundle.created).toISOString()}`);
    } catch (error) {
      // Check for decryption failure (wrong password)
      // Web Crypto throws various error types for decryption failure
      const errorString = String(error);
      const errorName = error && typeof error === 'object' && 'name' in error ? (error as any).name : '';

      if (errorName === 'OperationError' ||
          errorString.includes('OperationError') ||
          errorString.includes('operation failed') ||
          errorString.includes('Cipher job failed') ||
          (error instanceof Error && error.message.includes('OperationError'))) {
        // Decryption failed - wrong password
        throw new Error('Incorrect recovery password');
      }

      console.error('Failed to import recovery bundle:', error);
      throw new Error(`Recovery bundle import failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if a recovery bundle can be created
   * (i.e., if a master password exists)
   */
  static async canExportRecoveryBundle(): Promise<boolean> {
    try {
      const stored = await this.secureStorage.getItem('master_password');
      return stored !== null;
    } catch {
      return false;
    }
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
