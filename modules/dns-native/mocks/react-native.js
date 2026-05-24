const noop = () => {};
const createStubComponent = () => () => null;

module.exports = {
  Platform: { OS: "ios", Version: "26.0" },
  NativeModules: {},
  AccessibilityInfo: {
    isReduceTransparencyEnabled: async () => false,
    addEventListener: () => ({ remove: noop }),
  },
  StyleSheet: {
    create: (styles) => styles,
    flatten: (styles) => {
      if (!Array.isArray(styles)) {
        return styles || {};
      }
      return styles
        .filter(Boolean)
        .reduce((acc, style) => Object.assign(acc, style), {});
    },
  },
  View: createStubComponent(),
  Text: createStubComponent(),
  TextInput: createStubComponent(),
  ScrollView: createStubComponent(),
  KeyboardAvoidingView: createStubComponent(),
  TouchableOpacity: createStubComponent(),
  Switch: createStubComponent(),
  Alert: { alert: noop },
  Linking: { openURL: noop },
  Share: { share: async () => ({}) },
  useColorScheme: () => "light",
};
