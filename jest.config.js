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
    "^react-native-safe-area-context$":
      "<rootDir>/__tests__/mocks/react-native-safe-area-context.js",
    "^@expo/ui/community/menu$":
      "<rootDir>/__tests__/mocks/expo-ui-community-menu.js",
    "^@expo/ui/community/bottom-sheet$":
      "<rootDir>/__tests__/mocks/expo-ui-community-bottom-sheet.js",
    "^react-native-udp$": "<rootDir>/__tests__/mocks/react-native-udp.js",
    "^react-native-tcp-socket$":
      "<rootDir>/__tests__/mocks/react-native-tcp-socket.js",
    "^expo-localization$":
      "<rootDir>/__tests__/mocks/expo-localization.js",
    "^expo-haptics$": "<rootDir>/__tests__/mocks/expo-haptics.js",
    "^expo-constants$": "<rootDir>/__tests__/mocks/expo-constants.js",
    "^expo-router$": "<rootDir>/__tests__/mocks/expo-router.js",
    "^expo-router/react-navigation$":
      "<rootDir>/__tests__/mocks/expo-router-react-navigation.js",
    "\\.xml$": "<rootDir>/__tests__/mocks/fileMock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ["<rootDir>/__tests__/setup.jest.js"],
};
