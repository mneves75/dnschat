const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable SDK 54 optimizations
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['react-native', 'browser', 'require'];

// Enable experimental import support (default in SDK 54)
config.transformer.experimentalImportSupport = true;

// Enable live bindings for ECMAScript compliance
if (process.env.EXPO_UNSTABLE_LIVE_BINDINGS !== 'false') {
  config.transformer.unstable_liveBindings = true;
}

// Enable better error reporting with import stack traces
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;