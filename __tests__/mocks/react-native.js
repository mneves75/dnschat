const React = require("react");

const noop = () => {};
const createStubComponent = (name) => {
  const Comp = (props) => React.createElement(name, props, props?.children ?? null);
  Comp.displayName = name;
  return Comp;
};

const Pressable = React.forwardRef((props, ref) =>
  React.createElement("Pressable", { ...props, ref }, props?.children ?? null)
);
Pressable.displayName = "Pressable";

const FlatList = React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({
    scrollToEnd: (...args) => globalThis.__RN_FLATLIST_SCROLL_TO_END?.(...args),
  }));
  return React.createElement("FlatList", props, props?.children ?? null);
});
FlatList.displayName = "FlatList";

module.exports = {
  Platform: { OS: "ios", Version: "26.0" },
  NativeModules: {},
  AccessibilityInfo: {
    isReduceTransparencyEnabled: async () => false,
    addEventListener: () => ({ remove: noop }),
    announceForAccessibility: noop,
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
    hairlineWidth: 1,
  },
  View: createStubComponent("View"),
  Text: createStubComponent("Text"),
  TextInput: createStubComponent("TextInput"),
  Pressable,
  FlatList,
  RefreshControl: createStubComponent("RefreshControl"),
  ScrollView: createStubComponent("ScrollView"),
  KeyboardAvoidingView: createStubComponent("KeyboardAvoidingView"),
  TouchableOpacity: createStubComponent("TouchableOpacity"),
  Image: createStubComponent("Image"),
  ActivityIndicator: createStubComponent("ActivityIndicator"),
  Switch: createStubComponent("Switch"),
  Alert: { alert: noop },
  Linking: { openURL: noop },
  Share: { share: async () => ({}) },
  useColorScheme: () => "light",
  Dimensions: { get: () => ({ width: 375, height: 812 }) },
  Animated: { Value: function (v) { this.value = v; return { setValue: noop, interpolate: () => 0 }; }, timing: () => ({ start: noop, stop: noop }), parallel: () => ({ start: noop, stop: noop }) },
  Easing: { out: () => () => 0, cubic: () => 0 },
  BackHandler: {
    addEventListener: () => ({ remove: noop }),
    removeEventListener: noop,
    exitApp: noop,
  },
  InteractionManager: {
    runAfterInteractions: (cb) => {
      if (typeof cb === "function") cb();
      return { cancel: noop };
    },
  },
  DynamicColorIOS: (config) => config?.light ?? null,
  PlatformColor: (name) => name,
};
