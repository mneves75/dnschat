/**
 * Liquid Glass Expo Config Plugin
 *
 * DEPRECATED: This plugin is no longer needed as we now use the official
 * expo-glass-effect package which handles iOS 26 Liquid Glass integration
 * via Expo autolinking.
 *
 * Kept as a no-op for backwards compatibility during migration.
 */

module.exports = function withLiquidGlass(config) {
  // No-op: expo-glass-effect handles everything via autolinking
  return config;
};
