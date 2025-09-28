/** @type {import('jest').Config} */
module.exports = {
  preset: undefined,
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: [
    "<rootDir>/__tests__/**/*.spec.(ts|tsx|js)",
    "<rootDir>/modules/**/__tests__/**/*.test.(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
  },
  moduleNameMapper: {
    "^react-native$": "<rootDir>/__tests__/mocks/react-native.js",
    "^react-native-udp$": "<rootDir>/__tests__/mocks/react-native-udp.js",
    "^react-native-tcp-socket$":
      "<rootDir>/__tests__/mocks/react-native-tcp-socket.js",
  },
  setupFiles: ["<rootDir>/__tests__/setup.jest.js"],
};
