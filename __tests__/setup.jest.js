// Mock AsyncStorage for node/Jest environment
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    getItemAsync: jest.fn((key) => Promise.resolve(store.get(key) ?? null)),
    setItemAsync: jest.fn((key, value) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
});

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn((size) =>
    Promise.resolve(Uint8Array.from({ length: size }, (_, i) => (i + 1) % 256)),
  ),
  getRandomValues: jest.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = (i + 1) % 256;
    }
    return array;
  }),
}));

const bytesToHex = (bytes) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

const hexToBytes = (hex) => {
  const clean = (hex ?? '').trim();
  if (!clean) return new Uint8Array();
  const pairs = clean.match(/.{1,2}/g) ?? [];
  return Uint8Array.from(pairs.map((pair) => parseInt(pair, 16)));
};

const utf8ToBytes = (text) => Uint8Array.from(Buffer.from(text ?? '', 'utf8'));

jest.mock('@noble/hashes/utils.js', () => ({
  bytesToHex,
  hexToBytes,
  utf8ToBytes,
}));

jest.mock('@noble/hashes/sha2.js', () => {
  const { createHash } = require('node:crypto');
  return {
    sha256: (input) => {
      const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
      const hash = createHash('sha256').update(buffer).digest();
      return Uint8Array.from(hash);
    },
  };
});

jest.mock('@noble/ciphers/aes.js', () => ({
  gcm: () => ({
    encrypt: (plaintext) => Uint8Array.from(plaintext),
    decrypt: (ciphertext) => Uint8Array.from(ciphertext),
  }),
}));

// Keep default console behavior for debugging capability detection

// Provide Web Crypto API for Node test environment if not already present.
if (typeof global.crypto === 'undefined') {
  const { webcrypto } = require('crypto');
  global.crypto = webcrypto;
}

if (typeof global.IS_REACT_ACT_ENVIRONMENT === 'undefined') {
  global.IS_REACT_ACT_ENVIRONMENT = true;
}

if (typeof global.__DEV__ === 'undefined') {
  global.__DEV__ = true;
}
