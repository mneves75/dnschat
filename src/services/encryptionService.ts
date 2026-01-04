import * as SecureStore from 'expo-secure-store';
import { getRandomBytesAsync } from 'expo-random';
import { gcm } from '@noble/ciphers/aes.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import { ENCRYPTION_CONSTANTS } from '../constants/appConstants';
import { devWarn } from '../utils/devLog';

const KEY_STORAGE_KEY = '@dnschat/encryption-key';
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
  return getRandomBytesAsync(size);
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

const loadEncryptionKey = async (): Promise<Uint8Array> => {
  if (cachedKey) return cachedKey;
  if (keyLoadInFlight) return keyLoadInFlight;

  keyLoadInFlight = (async () => {
    if (isTestRuntime()) {
      const testKey = new Uint8Array(ENCRYPTION_CONSTANTS.KEY_LENGTH).fill(7);
      cachedKey = testKey;
      return testKey;
    }

    try {
      const stored = await SecureStore.getItemAsync(KEY_STORAGE_KEY);
      if (stored) {
        const decoded = hexToBytes(stored);
        cachedKey = decoded;
        return decoded;
      }
    } catch (error) {
      devWarn('[EncryptionService] Failed to read key from SecureStore, falling back to new key', error);
    }

    const generated = await getRandomBytes(ENCRYPTION_CONSTANTS.KEY_LENGTH);
    cachedKey = generated;
    try {
      await SecureStore.setItemAsync(KEY_STORAGE_KEY, bytesToHex(generated));
    } catch (error) {
      devWarn('[EncryptionService] Failed to persist key in SecureStore', error);
    }
    return generated;
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
