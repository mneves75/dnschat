import * as SecureStore from "expo-secure-store";
import { getRandomBytesAsync, getRandomValues } from "expo-crypto";
import { Platform } from "react-native";
import { gcm } from "@noble/ciphers/aes.js";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";
import { ENCRYPTION_CONSTANTS } from "../constants/appConstants";
import { devWarn } from "../utils/devLog";

// SecureStore keys must be alphanumeric plus ., -, _ (no @ or /)
const KEY_STORAGE_KEY = "dnschat.encryption_key";
const ENCRYPTION_PREFIX = "enc:v1:";
const GCM_AUTH_TAG_LENGTH = 16;

export class EncryptionKeyCorruptionError extends Error {
  readonly code = "ENCRYPTION_KEY_CORRUPTION";

  constructor(
    message: string,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = "EncryptionKeyCorruptionError";
  }
}

export class EncryptionKeyUnavailableError extends Error {
  readonly code = "ENCRYPTION_KEY_UNAVAILABLE";

  constructor(
    message: string,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = "EncryptionKeyUnavailableError";
  }
}

export class EncryptionPayloadCorruptionError extends Error {
  readonly code = "ENCRYPTION_PAYLOAD_CORRUPTION";

  constructor(
    message: string,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = "EncryptionPayloadCorruptionError";
  }
}

let cachedKey: Uint8Array | null = null;
let keyLoadInFlight: Promise<Uint8Array> | null = null;
let cachedDecoder: TextDecoder | null = null;
let warnedWebKeyPersisted = false;

const getRandomBytes = async (size: number): Promise<Uint8Array> => {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.getRandomValues === "function"
    ) {
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

const isWebRuntime = (): boolean => Platform.OS === "web";

const getKeyStorageName = (): string =>
  isWebRuntime() ? "web fallback key storage" : "SecureStore";

const getWebStoredKey = (): string | null => {
  if (!isWebRuntime()) return null;
  try {
    const localStorage = globalThis.localStorage;
    if (!localStorage || typeof localStorage.getItem !== "function")
      return null;
    return localStorage.getItem(KEY_STORAGE_KEY);
  } catch (error) {
    devWarn(
      "[EncryptionService] Failed to read web fallback key storage",
      error,
    );
    return null;
  }
};

const setWebStoredKey = (key: string): boolean => {
  if (!isWebRuntime()) return false;
  try {
    const localStorage = globalThis.localStorage;
    if (!localStorage || typeof localStorage.setItem !== "function")
      return false;
    localStorage.setItem(KEY_STORAGE_KEY, key);
    if (!warnedWebKeyPersisted) {
      warnedWebKeyPersisted = true;
      // Web preview stores the key in same-origin browser storage, which is not a
      // secure production at-rest boundary (see SECURITY.md / docs/data-inventory.md).
      // Surface this at runtime so it is never silently treated as native SecureStore.
      devWarn(
        "[EncryptionService] Web preview persists the encryption key in browser storage; this is not a secure at-rest boundary.",
      );
    }
    return true;
  } catch (error) {
    devWarn(
      "[EncryptionService] Failed to persist web fallback key storage",
      error,
    );
    return false;
  }
};

const decodeStoredKey = (stored: string): Uint8Array => {
  let decoded: Uint8Array;
  try {
    decoded = hexToBytes(stored);
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(String(error));
    devWarn(
      "[EncryptionService] Stored key is malformed; preserving existing key material",
      cause,
    );
    throw new EncryptionKeyCorruptionError(
      "Stored encryption key is malformed",
      cause,
    );
  }

  if (decoded.length !== ENCRYPTION_CONSTANTS.KEY_LENGTH) {
    const cause = new Error(`Stored key has invalid length: ${decoded.length}`);
    devWarn(
      "[EncryptionService] Stored key has invalid length; preserving existing key material",
      cause,
    );
    throw new EncryptionKeyCorruptionError(
      "Stored encryption key has invalid length",
      cause,
    );
  }

  return decoded;
};

const decodeUtf8 = (payload: Uint8Array): string => {
  try {
    if (typeof TextDecoder !== "undefined") {
      cachedDecoder = cachedDecoder ?? new TextDecoder();
      return cachedDecoder.decode(payload);
    }
  } catch {}
  let out = "";
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
        "[EncryptionService] Web key fallback is session-only because localStorage is unavailable",
      );
    }
    cachedKey = generated;
    return generated;
  }

  // THIS_DEVICE_ONLY keeps the key out of iCloud/device backups, preserving the
  // key/ciphertext separation: chat payloads live in AsyncStorage (which IS
  // backed up), so the key must never travel with them. Existing keys written
  // with the library default (WHEN_UNLOCKED) remain readable because the
  // read path does not filter by kSecAttrAccessible.
  await SecureStore.setItemAsync(KEY_STORAGE_KEY, encoded, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  cachedKey = generated;
  return generated;
};

const loadEncryptionKey = async (): Promise<Uint8Array> => {
  if (cachedKey) return cachedKey;
  if (keyLoadInFlight) return keyLoadInFlight;

  keyLoadInFlight = (async () => {
    const stored = await (async () => {
      try {
        return isWebRuntime()
          ? getWebStoredKey()
          : await SecureStore.getItemAsync(KEY_STORAGE_KEY);
      } catch (error) {
        const cause = error instanceof Error ? error : new Error(String(error));
        devWarn(
          `[EncryptionService] Failed to read key from ${getKeyStorageName()}`,
          cause,
        );
        throw new EncryptionKeyUnavailableError(
          "Encryption key is unavailable",
          cause,
        );
      }
    })();

    if (stored !== null) {
      const decoded = decodeStoredKey(stored);
      cachedKey = decoded;
      return decoded;
    }

    try {
      return await generateAndPersistKey();
    } catch (error) {
      devWarn(
        `[EncryptionService] Failed to persist key in ${getKeyStorageName()}`,
        error,
      );
      throw new Error("Encryption key could not be persisted");
    }
  })();

  try {
    return await keyLoadInFlight;
  } finally {
    keyLoadInFlight = null;
  }
};

export const isEncryptedPayload = (value: string): boolean =>
  typeof value === "string" && value.startsWith(ENCRYPTION_PREFIX);

export const encryptString = async (plaintext: string): Promise<string> => {
  // Every payload gets a fresh random nonce. AES-GCM nonce reuse under one key
  // is catastrophic (it leaks the authentication key, not just plaintext), so
  // there is deliberately no branch here that can produce a constant nonce.
  // The key load and the nonce do not depend on each other, so they run
  // together rather than making every write wait for both in turn.
  const [key, nonce] = await Promise.all([
    loadEncryptionKey(),
    getRandomBytes(ENCRYPTION_CONSTANTS.IV_LENGTH),
  ]);
  const cipher = gcm(key, nonce).encrypt(utf8ToBytes(plaintext));
  return `${ENCRYPTION_PREFIX}${bytesToHex(nonce)}:${bytesToHex(cipher)}`;
};

export const decryptString = async (payload: string): Promise<string> => {
  if (!payload.startsWith(ENCRYPTION_PREFIX)) {
    throw new EncryptionPayloadCorruptionError(
      "Invalid encrypted payload format",
    );
  }

  const remainder = payload.slice(ENCRYPTION_PREFIX.length);
  const fields = remainder.split(":");
  if (fields.length !== 2) {
    throw new EncryptionPayloadCorruptionError(
      "Invalid encrypted payload format",
    );
  }

  const [nonceHex, cipherHex] = fields;
  if (!nonceHex || !cipherHex) {
    throw new EncryptionPayloadCorruptionError(
      "Invalid encrypted payload format",
    );
  }

  let nonce: Uint8Array;
  let cipher: Uint8Array;
  try {
    nonce = hexToBytes(nonceHex);
    cipher = hexToBytes(cipherHex);
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(String(error));
    throw new EncryptionPayloadCorruptionError(
      "Encrypted payload contains invalid hexadecimal data",
      cause,
    );
  }

  if (nonce.length !== ENCRYPTION_CONSTANTS.IV_LENGTH) {
    throw new EncryptionPayloadCorruptionError(
      `Encrypted payload nonce must be ${ENCRYPTION_CONSTANTS.IV_LENGTH} bytes`,
    );
  }
  if (cipher.length < GCM_AUTH_TAG_LENGTH) {
    throw new EncryptionPayloadCorruptionError(
      `Encrypted payload ciphertext must include at least the ${GCM_AUTH_TAG_LENGTH}-byte authentication tag`,
    );
  }

  const key = await loadEncryptionKey();
  try {
    const plaintext = gcm(key, nonce).decrypt(cipher);
    return decodeUtf8(plaintext);
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(String(error));
    throw new EncryptionPayloadCorruptionError(
      "Failed to decrypt encrypted payload",
      cause,
    );
  }
};

export const decryptIfEncrypted = async (payload: string): Promise<string> => {
  if (!isEncryptedPayload(payload)) {
    return payload;
  }
  return decryptString(payload);
};
