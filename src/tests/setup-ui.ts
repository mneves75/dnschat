import 'react-native-gesture-handler/jestSetup';

// Reanimated mock
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// RNGH: make root view a passthrough and ensure module shape
jest.mock('react-native-gesture-handler', () => {
  const actual = jest.requireActual('react-native-gesture-handler');
  return {
    ...actual,
    GestureHandlerRootView: ({ children }: any) => children,
    default: {
      ...('default' in actual ? (actual as any).default : {}),
      install: () => {},
    },
  } as any;
});

// Safe Area mock
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement(View, null, children),
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});
