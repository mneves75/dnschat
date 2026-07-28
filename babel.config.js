module.exports = function (api) {
  api.cache(true);
  const isProd = process.env.NODE_ENV === "production";
  return {
    presets: ["babel-preset-expo"],
    // babel-preset-expo auto-adds react-native-worklets/plugin when the package
    // is installed, which is exactly what react-native-reanimated/plugin now
    // re-exports — listing it here would run the same visitors twice.
    plugins: isProd
      ? [["transform-remove-console", { exclude: ["error", "warn"] }]]
      : [],
  };
};
