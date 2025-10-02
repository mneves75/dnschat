// Mock AsyncStorage for node/Jest environment
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Keep default console behavior for debugging capability detection

// Provide Web Crypto API for Node test environment if not already present.
if (typeof global.crypto === 'undefined') {
  const { webcrypto } = require('crypto');
  global.crypto = webcrypto;
}
