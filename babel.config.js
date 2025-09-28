module.exports = function (api) {
  api.cache(true);

  return {
    presets: [["babel-preset-expo", { reactCompiler: true }]],
    plugins: [
      "react-native-reanimated/plugin",
    ],
  };
};
