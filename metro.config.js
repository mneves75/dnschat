const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable package exports to avoid module resolution issues
config.resolver.unstable_enablePackageExports = false;

// Web-specific configurations for worker handling
if (config.resolver.platforms.includes('web')) {
  // Ensure proper web worker support
  config.resolver.sourceExts = ['js', 'json', 'ts', 'tsx', 'jsx'];
  config.resolver.assetExts = ['bmp', 'gif', 'jpg', 'jpeg', 'png', 'psd', 'svg', 'webp'];
}

// Add crypto polyfill resolution for react-native-quick-crypto
// This allows 'crypto', 'stream', 'buffer' imports to resolve correctly
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: require.resolve('react-native-quick-crypto'),
  stream: require.resolve('readable-stream'),
  buffer: require.resolve('@craftzdog/react-native-buffer'),
};

module.exports = config;
