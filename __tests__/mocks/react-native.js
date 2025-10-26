const React = require("react");

const noop = () => {};
const createStubComponent = (name) => {
  const Comp = (props) => React.createElement(name, props, props?.children ?? null);
  Comp.displayName = name;
  return Comp;
};

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
  View: createStubComponent("View"),
  Text: createStubComponent("Text"),
  TextInput: createStubComponent("TextInput"),
  ScrollView: createStubComponent("ScrollView"),
  KeyboardAvoidingView: createStubComponent("KeyboardAvoidingView"),
  TouchableOpacity: createStubComponent("TouchableOpacity"),
  Switch: createStubComponent("Switch"),
  Alert: { alert: noop },
  Linking: { openURL: noop },
  Share: { share: async () => ({}) },
  useColorScheme: () => "light",
};
