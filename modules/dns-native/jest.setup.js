// Keep dns-native tests self-contained; CI installs only module dependencies.
if (typeof global.IS_REACT_ACT_ENVIRONMENT === 'undefined') {
  global.IS_REACT_ACT_ENVIRONMENT = true;
}

if (typeof global.__DEV__ === 'undefined') {
  global.__DEV__ = true;
}

if (typeof global.crypto === 'undefined') {
  const { webcrypto } = require('crypto');
  global.crypto = webcrypto;
}

jest.mock(
  'expo-crypto',
  () => ({
    __esModule: true,
    getRandomValues: jest.fn((array) => {
      if (!array || typeof array.length !== 'number') return array;
      if (global.crypto?.getRandomValues) {
        return global.crypto.getRandomValues(array);
      }
      for (let i = 0; i < array.length; i += 1) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
  }),
  { virtual: true },
);
