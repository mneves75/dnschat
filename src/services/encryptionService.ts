import * as SecureStore from 'expo-secure-store';
import { getRandomBytesAsync, getRandomValues } from 'expo-crypto';
import { Platform } from 'react-native';
import { gcm } from '@noble/ciphers/aes.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import { ENCRYPTION_CONSTANTS } from '../constants/appConstants';
import { devWarn } from '../utils/devLog';

// SecureStore keys must be alphanumeric plus ., -, _ (no @ or /)
const KEY_STORAGE_KEY = 'dnschat.encryption_key';
const ENCRYPTION_PREFIX = 'enc:v1:';

let cachedKey: Uint8Array | null = null;
let keyLoadInFlight: Promise<Uint8Array> | null = null;
let cachedDecoder: TextDecoder | null = null;

const isTestRuntime = () =>
  typeof process !== 'undefined' &&
  typeof process.env === 'object' &&
  process.env !== null &&
  typeof process.env['JEST_WORKER_ID'] === 'string';

const getRandomBytes = async (size: number): Promise<Uint8Array> => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(size);
      crypto.getRandomValues(bytes);
      return bytes;
    }
  } catch {}

  try {
    const bytes = new Uint8Array(size);
    getRandomValues(bytes);
    return bytes;
  } catch {}

  return getRandomBytesAsync(size);
};

const isWebRuntime = (): boolean => Platform.OS === 'web';

const getKeyStorageName = (): string => (isWebRuntime() ? 'web fallback key storage' : 'SecureStore');

const getWebStoredKey = (): string | null => {
  if (!isWebRuntime()) return null;
  try {
    const localStorage = globalThis.localStorage;
    if (!localStorage || typeof localStorage.getItem !== 'function') return null;
    return localStorage.getItem(KEY_STORAGE_KEY);
  } catch (error) {
    devWarn('[EncryptionService] Failed to read web fallback key storage', error);
    return null;
  }
};

const setWebStoredKey = (key: string): boolean => {
  if (!isWebRuntime()) return false;
  try {
    const localStorage = globalThis.localStorage;
    if (!localStorage || typeof localStorage.setItem !== 'function') return false;
    localStorage.setItem(KEY_STORAGE_KEY, key);
    return true;
  } catch (error) {
    devWarn('[EncryptionService] Failed to persist web fallback key storage', error);
    return false;
  }
};

const decodeStoredKey = async (stored: string): Promise<Uint8Array> => {
  let decoded: Uint8Array;
  try {
    decoded = hexToBytes(stored);
  } catch (error) {
    devWarn(
      '[EncryptionService] Stored key is malformed, rotating to a newly persisted key',
      error,
    );
    return generateAndPersistKey();
  }

  if (decoded.length !== ENCRYPTION_CONSTANTS.KEY_LENGTH) {
    devWarn(
      '[EncryptionService] Stored key has invalid length, rotating to a newly persisted key',
      new Error(`Stored key has invalid length: ${decoded.length}`),
    );
    return generateAndPersistKey();
  }

  return decoded;
};

const decodeUtf8 = (payload: Uint8Array): string => {
  try {
    if (typeof TextDecoder !== 'undefined') {
      cachedDecoder = cachedDecoder ?? new TextDecoder();
      return cachedDecoder.decode(payload);
    }
  } catch {}
  let out = '';
  for (const byte of payload) {
    out += String.fromCharCode(byte);
  }
  return out;
};

const generateAndPersistKey = async (): Promise<Uint8Array> => {
  const generated = await getRandomBytes(ENCRYPTION_CONSTANTS.KEY_LENGTH);
  const encoded = bytesToHex(generated);

  if (isWebRuntime()) {
    if (!setWebStoredKey(encoded)) {
      devWarn(
        '[EncryptionService] Web key fallback is session-only because localStorage is unavailable',
      );
    }
    cachedKey = generated;
    return generated;
  }

  await SecureStore.setItemAsync(KEY_STORAGE_KEY, encoded);
  cachedKey = generated;
  return generated;
};

const loadEncryptionKey = async (): Promise<Uint8Array> => {
  if (cachedKey) return cachedKey;
  if (keyLoadInFlight) return keyLoadInFlight;

  keyLoadInFlight = (async () => {
    if (isTestRuntime()) {
      const testKey = new Uint8Array(ENCRYPTION_CONSTANTS.KEY_LENGTH).fill(7);
      cachedKey = testKey;
      return testKey;
    }

    const stored = await (async () => {
      try {
        return isWebRuntime()
          ? getWebStoredKey()
          : await SecureStore.getItemAsync(KEY_STORAGE_KEY);
      } catch (error) {
        devWarn(
          `[EncryptionService] Failed to read key from ${getKeyStorageName()}`,
          error,
        );
        throw new Error('Encryption key is unavailable');
      }
    })();

    if (stored) {
      const decoded = await decodeStoredKey(stored);
      cachedKey = decoded;
      return decoded;
    }

    try {
      return await generateAndPersistKey();
    } catch (error) {
      devWarn(`[EncryptionService] Failed to persist key in ${getKeyStorageName()}`, error);
      throw new Error('Encryption key could not be persisted');
    }
  })();

  try {
    return await keyLoadInFlight;
  } finally {
    keyLoadInFlight = null;
  }
};

export const isEncryptedPayload = (value: string): boolean =>
  typeof value === 'string' && value.startsWith(ENCRYPTION_PREFIX);

export const encryptString = async (plaintext: string): Promise<string> => {
  const key = await loadEncryptionKey();
  const nonce = isTestRuntime()
    ? new Uint8Array(ENCRYPTION_CONSTANTS.IV_LENGTH).fill(9)
    : await getRandomBytes(ENCRYPTION_CONSTANTS.IV_LENGTH);
  const cipher = gcm(key, nonce).encrypt(utf8ToBytes(plaintext));
  return `${ENCRYPTION_PREFIX}${bytesToHex(nonce)}:${bytesToHex(cipher)}`;
};

export const decryptString = async (payload: string): Promise<string> => {
  if (!payload.startsWith(ENCRYPTION_PREFIX)) {
    throw new Error('Invalid encrypted payload format');
  }
  const remainder = payload.slice(ENCRYPTION_PREFIX.length);
  const [nonceHex, cipherHex] = remainder.split(':');
  if (!nonceHex || !cipherHex) {
    throw new Error('Invalid encrypted payload format');
  }

  const key = await loadEncryptionKey();
  const nonce = hexToBytes(nonceHex);
  const cipher = hexToBytes(cipherHex);
  const plaintext = gcm(key, nonce).decrypt(cipher);
  return decodeUtf8(plaintext);
};

export const decryptIfEncrypted = async (payload: string): Promise<string> => {
  if (!isEncryptedPayload(payload)) {
    return payload;
  }
  return decryptString(payload);
};
