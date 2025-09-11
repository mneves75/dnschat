module.exports = {
  Platform: { OS: "ios", Version: "26.0" },
  NativeModules: {},
  Dimensions: {
    get: () => ({ width: 390, height: 844, scale: 3 }),
  },
  StyleSheet: { create: (s) => s },
  View: function View() { return null; },
  StatusBar: { setBarStyle: () => {}, setBackgroundColor: () => {} },
};
