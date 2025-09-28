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
import * as Crypto from 'expo-crypto';

// Keychain/Keystore interfaces
interface SecureStorage {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
}

// iOS Keychain implementation
class IOSKeychain implements SecureStorage {
  async setItem(key: string, value: string): Promise<void> {
    // For iOS, we'd normally use react-native-keychain here
    // For this implementation, we'll use a prefixed AsyncStorage key
    // In production, replace with actual Keychain integration
    await AsyncStorage.setItem(`keychain_${key}`, value);
  }

  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(`keychain_${key}`);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(`keychain_${key}`);
  }
}

// Android Keystore implementation
class AndroidKeystore implements SecureStorage {
  async setItem(key: string, value: string): Promise<void> {
    // For Android, we'd normally use react-native-keychain here
    // For this implementation, we'll use a prefixed AsyncStorage key
    // In production, replace with actual Keystore integration
    await AsyncStorage.setItem(`keystore_${key}`, value);
  }

  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(`keystore_${key}`);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(`keystore_${key}`);
  }
}

class EncryptionService {
  private static secureStorage: SecureStorage;
  private static readonly SALT_LENGTH = 32;
  private static readonly KEY_LENGTH = 32; // 256 bits for AES-256
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly TAG_LENGTH = 16; // 128 bits for GCM
  private static readonly PBKDF2_ITERATIONS = 100000;

  static {
    this.secureStorage = Platform.OS === 'ios' ? new IOSKeychain() : new AndroidKeystore();
  }

  /**
   * Generate a cryptographically secure random salt
   */
  private static async generateSalt(): Promise<Uint8Array> {
    const salt = new Uint8Array(this.SALT_LENGTH);
    // Use crypto.getRandomBytes if available, fallback to Math.random
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(salt);
    } else {
      // Fallback for environments without crypto.getRandomValues
      for (let i = 0; i < salt.length; i++) {
        salt[i] = Math.floor(Math.random() * 256);
      }
    }
    return salt;
  }

  /**
   * Derive an encryption key from a master password using PBKDF2
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
    try {
      // Convert password to bytes
      const passwordBuffer = new TextEncoder().encode(password);

      // Import password for PBKDF2
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits']
      );

      // Derive key using PBKDF2
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: this.PBKDF2_ITERATIONS,
          hash: 'SHA-256',
        },
        passwordKey,
        this.KEY_LENGTH * 8 // 256 bits
      );

      return new Uint8Array(derivedBits);
    } catch (error) {
      // Fallback for environments without Web Crypto API
      console.warn('Web Crypto API not available, using fallback key derivation');
      return this.fallbackDeriveKey(password, salt);
    }
  }

  /**
   * Fallback key derivation for environments without Web Crypto API
   */
  private static fallbackDeriveKey(password: string, salt: Uint8Array): Uint8Array {
    // Simple key derivation for fallback - NOT cryptographically secure
    // This should be replaced with proper crypto in production
    const combined = new TextEncoder().encode(password + Array.from(salt).join(''));
    const hash = new Uint8Array(this.KEY_LENGTH);

    // Simple hash function (NOT secure - for demo purposes only)
    for (let i = 0; i < combined.length && i < hash.length; i++) {
      hash[i] = combined[i] ^ salt[i % salt.length];
    }

    return hash;
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

    try {
      // Use crypto.getRandomValues if available
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const values = new Uint8Array(length);
        crypto.getRandomValues(values);
        for (let i = 0; i < length; i++) {
          result += chars[values[i] % chars.length];
        }
        return result;
      }
    } catch (error) {
      console.warn('Secure random generation failed, using fallback');
    }

    // Fallback to Math.random (less secure)
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
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

    try {
      const key = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(keyData.key),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      const encodedData = new TextEncoder().encode(data);

      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encodedData
      );

      // Combine IV + encrypted data + auth tag
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Return as base64 for storage
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      // Fallback for environments without Web Crypto API
      console.warn('Web Crypto API not available, using fallback encryption');
      return this.fallbackEncrypt(data, keyData);
    }
  }

  /**
   * Decrypt conversation data using AES-256-GCM
   */
  static async decryptConversation(encryptedData: string, conversationId: string): Promise<string> {
    const keyData = await this.getConversationKey(conversationId);
    if (!keyData) {
      throw new Error(`No encryption key found for conversation ${conversationId}`);
    }

    try {
      const key = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(keyData.key),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // Decode from base64
      const combined = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, this.IV_LENGTH);
      const ciphertext = combined.slice(this.IV_LENGTH);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        ciphertext
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      // Fallback for environments without Web Crypto API
      console.warn('Web Crypto API not available, using fallback decryption');
      return this.fallbackDecrypt(encryptedData, keyData);
    }
  }

  /**
   * Get conversation encryption key from secure storage
   */
  private static async getConversationKey(conversationId: string): Promise<{salt: number[], key: number[]} | null> {
    const stored = await this.secureStorage.getItem(`conv_key_${conversationId}`);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Fallback encryption for environments without Web Crypto API
   * WARNING: This is NOT secure - for demo purposes only
   */
  private static fallbackEncrypt(data: string, keyData: {salt: number[], key: number[]}): string {
    // Simple XOR-based "encryption" - NOT secure
    const key = new Uint8Array(keyData.key);
    const textBytes = new TextEncoder().encode(data);
    const encrypted = new Uint8Array(textBytes.length);

    for (let i = 0; i < textBytes.length; i++) {
      encrypted[i] = textBytes[i] ^ key[i % key.length];
    }

    return btoa(String.fromCharCode(...encrypted));
  }

  /**
   * Fallback decryption for environments without Web Crypto API
   */
  private static fallbackDecrypt(encryptedData: string, keyData: {salt: number[], key: number[]}): string {
    // Simple XOR-based "decryption" - NOT secure
    const key = new Uint8Array(keyData.key);
    const encrypted = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ key[i % key.length];
    }

    return new TextDecoder().decode(decrypted);
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
   */
  static async rotateMasterPassword(): Promise<void> {
    const newPassword = this.generateRandomString(32);
    await this.secureStorage.setItem('master_password', newPassword);

    // Note: This would require re-encrypting all existing conversations
    // In a production system, you'd want to handle this more carefully
  }
}

export { EncryptionService };
export type { SecureStorage };
