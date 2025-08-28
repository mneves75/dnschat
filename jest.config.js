/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/services/__tests__/**/*.test.ts',
    '<rootDir>/modules/dns-native/__tests__/**/*.test.ts',
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/src/services/__tests__/__mocks__/react-native.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/src/services/__tests__/__mocks__/@react-native-async-storage/async-storage.ts',
    '^react-native-udp$': '<rootDir>/src/services/__tests__/__mocks__/react-native-udp.js',
    '^react-native-tcp-socket$': '<rootDir>/src/services/__tests__/__mocks__/react-native-tcp-socket.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.tests.json',
        isolatedModules: true,
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/test.setup.ts'],
};
