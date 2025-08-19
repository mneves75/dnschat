/**
 * Liquid Glass Components - Public API
 * 
 * Comprehensive iOS 26 Liquid Glass implementation with graceful fallbacks
 * for React Native applications. Provides platform-appropriate glass effects
 * across iOS 26+, iOS 16-25, Android, and Web.
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

// ==================================================================================
// MAIN COMPONENTS
// ==================================================================================

export {
  // Primary liquid glass component with automatic platform detection
  LiquidGlassView as default,
  
  // Specialized components for specific use cases
  LiquidGlassNavigation,
  LiquidGlassModal,
  LiquidGlassCard,
  LiquidGlassSidebar,
  
  // Component props and types
  type LiquidGlassProps,
} from './LiquidGlassFallback';

// ==================================================================================
// CORE UI COMPONENTS
// ==================================================================================

export {
  // Interactive UI components with glass effects
  LiquidGlassButton,
  LiquidGlassChatBubble,
  LiquidGlassInput,
  LiquidGlassContainer,
  
  // Component props and types
  type LiquidGlassButtonProps,
  type LiquidGlassChatBubbleProps,
  type LiquidGlassInputProps,
  type LiquidGlassCardProps,
  type LiquidGlassContainerProps,
} from './LiquidGlassUI';

// ==================================================================================
// DNS-SPECIFIC COMPONENTS
// ==================================================================================

export {
  // DNS-aware components for chat application
  LiquidGlassChatInterface,
  LiquidGlassDNSStatus,
  LiquidGlassQueryLog,
  LiquidGlassMethodBadge,
  LiquidGlassConnectionIndicator,
  LiquidGlassServerSelector,
  
  // DNS component props and types
  type LiquidGlassChatInterfaceProps,
  type LiquidGlassDNSStatusProps,
  type LiquidGlassQueryLogProps,
  type LiquidGlassMethodBadgeProps,
  type LiquidGlassConnectionIndicatorProps,
  type LiquidGlassServerSelectorProps,
  type DNSMethod,
  type DNSQuery,
  type DNSServer,
} from './LiquidGlassDNS';

// ==================================================================================
// NATIVE COMPONENTS (iOS 26+)
// ==================================================================================

export {
  // Direct native component access (iOS 26+ only)
  LiquidGlassNative,
  
  // Native component props and handle
  type LiquidGlassNativeProps,
  type LiquidGlassNativeHandle,
  
  // Native-specific hooks
  useLiquidGlassNative,
  useLiquidGlassPerformance,
  useLiquidGlassEnvironment,
  
  // Native utility functions
  isNativeGlassAvailable,
  getOptimalNativeConfig,
} from './LiquidGlassNative';

// ==================================================================================
// UTILITIES AND HOOKS
// ==================================================================================

export {
  // Capability detection and management
  getLiquidGlassCapabilities,
  isLiquidGlassSupported,
  getOptimalGlassStyle,
  getRecommendedIntensity,
  refreshLiquidGlassCapabilities,
  validateGlassConfig,
  
  // Performance monitoring
  LiquidGlassPerformanceMonitor,
  
  // Type definitions
  type LiquidGlassCapabilities,
  type GlassStyle,
  type GlassIntensity,
  type EnvironmentalContext,
} from '../../utils/liquidGlass';

export {
  // Cross-platform hooks
  useLiquidGlassCapabilities,
  useAdaptiveGlassIntensity,
} from './LiquidGlassFallback';

// ==================================================================================
// SENSOR-AWARE ADAPTATIONS
// ==================================================================================

export {
  // Sensor management and hooks
  LiquidGlassSensorManager,
  useLiquidGlassSensorAdaptation,
  useAmbientLightAdaptation,
  useBatteryOptimization,
  
  // Sensor types and interfaces
  type SensorData,
  type AdaptationConfig,
  type SensorCallbacks,
  type LiquidGlassSensorModule,
} from './LiquidGlassSensors';

// ==================================================================================
// DYNAMIC THEME SYSTEM
// ==================================================================================

export {
  // Theme provider and hooks
  LiquidGlassThemeProvider,
  useLiquidGlassTheme,
  
  // Theme types and interfaces
  type ThemeConfiguration,
  type ThemeColors,
  type EnvironmentalContext,
  type UserPreferences,
  type TimeOfDayPeriod,
  type ThemeContextValue,
} from './LiquidGlassTheme';

// ==================================================================================
// CONVENIENCE EXPORTS
// ==================================================================================

/**
 * Quick access to the main liquid glass component
 */
export { LiquidGlassView } from './LiquidGlassFallback';

/**
 * Quick access to native-only component (for advanced use cases)
 */
export { LiquidGlassNative } from './LiquidGlassNative';

// ==================================================================================
// VERSION INFO
// ==================================================================================

/**
 * Liquid Glass implementation version
 */
export const LIQUID_GLASS_VERSION = '1.8.0';

/**
 * Supported iOS versions
 */
export const SUPPORTED_IOS_VERSIONS = {
  native: '26.0+',
  enhanced: '17.0+',
  basic: '16.0+',
} as const;

/**
 * Supported platforms
 */
export const SUPPORTED_PLATFORMS = ['ios', 'android', 'web'] as const;