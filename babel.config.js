module.exports = function (api) {
  api.cache(true);

  return {
    presets: [["babel-preset-expo", { reactCompiler: true }]],
    plugins: [
      // Add module resolver for crypto polyfills
      // This allows seamless import of 'crypto', 'stream', 'buffer' modules
      [
        'module-resolver',
        {
          alias: {
            'crypto': 'react-native-quick-crypto',
            'stream': 'readable-stream',
            'buffer': '@craftzdog/react-native-buffer',
          },
        },
      ],
      // IMPORTANT: react-native-reanimated/plugin must be listed last
      "react-native-reanimated/plugin",
    ],
  };
};
