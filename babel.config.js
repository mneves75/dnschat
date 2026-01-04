module.exports = function (api) {
  api.cache(true);
  const isProd = process.env.NODE_ENV === "production";
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["babel-plugin-react-compiler", {}],
      ...(isProd
        ? [["transform-remove-console", { exclude: ["error", "warn"] }]]
        : []),
      "react-native-reanimated/plugin",
    ],
  };
};
