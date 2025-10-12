/**
 * Glass Effect Utilities
 *
 * Platform detection and capability checking for expo-glass-effect.
 * Provides utilities to determine glass support and appropriate fallbacks.
 *
 * CRITICAL PLATFORM SUPPORT:
 * - iOS 26+: Native UIVisualEffectView (liquid glass)
 * - iOS <26: Styled View with blur-like appearance
 * - Android: Material 3 elevated surfaces
 * - Web: CSS backdrop-filter: blur(20px)
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router + Glass Migration)
 */

import { Platform, AccessibilityInfo } from 'react-native';
import * as Device from 'react-native-device-info';
import { isLiquidGlassAvailable } from 'expo-glass-effect';

/**
 * Glass Capabilities Interface
 *
 * Describes what glass features are available on the current platform.
 */
export interface GlassCapabilities {
  /** True if native glass effects are supported (iOS 26+) */
  isNativeGlassSupported: boolean;

  /** True if any glass effect can be rendered (with fallbacks) */
  canRenderGlass: boolean;

  /** True if user has "Reduce Transparency" enabled */
  shouldReduceTransparency: boolean;

  /** Platform-specific glass type */
  glassType: 'native' | 'blur' | 'material' | 'solid';

  /** Recommended max glass elements per screen */
  maxGlassElements: number;
}

/**
 * iOS Version Detection
 *
 * CRITICAL: iOS 26 introduced native liquid glass support via UIVisualEffectView.
 * Earlier iOS versions need fallback to blur-like styled views.
 *
 * @returns iOS major version number, or 0 if not iOS
 */
export function getIOSVersion(): number {
  if (Platform.OS !== 'ios') {
    return 0;
  }

  try {
    const systemVersion = Device.getSystemVersion();
    const majorVersion = parseInt(systemVersion.split('.')[0], 10);
    return isNaN(majorVersion) ? 0 : majorVersion;
  } catch (error) {
    // Only log in development to avoid polluting production logs
    if (__DEV__) {
      console.warn('[Glass] Failed to detect iOS version:', error);
    }
    return 0;
  }
}

/**
 * Native Glass Support Detection
 *
 * Uses the official expo-glass-effect API to determine if Liquid Glass is available.
 * This checks both platform support AND proper configuration (Info.plist, etc).
 *
 * OFFICIAL API: isLiquidGlassAvailable() from expo-glass-effect
 * - iOS 26+: Returns true when properly configured
 * - iOS <26: Returns false (use fallback)
 * - Android: Returns false (use Material 3)
 * - Web: Returns false (use CSS backdrop-filter)
 *
 * TESTING OVERRIDE (DEV ONLY):
 * Set environment variable or global flag to force enable on iOS < 26:
 * - Environment: LIQUID_GLASS_PRE_IOS26=1
 * - Global: global.__DEV_LIQUID_GLASS_PRE_IOS26__ = true
 *
 * @returns True if native glass is supported
 */
export function isNativeGlassSupported(): boolean {
  if (Platform.OS !== 'ios') {
    return false;
  }

  // Development testing override for iOS < 26
  if (__DEV__ && shouldForceGlassPreIOS26()) {
    console.log('[Glass] Force-enabling native glass for iOS < 26 testing');
    return true;
  }

  // Use official expo-glass-effect API
  // This checks iOS version AND proper configuration
  try {
    return isLiquidGlassAvailable();
  } catch (error) {
    // Only log in development - production should silently fall back
    if (__DEV__) {
      console.warn('[Glass] Failed to check liquid glass availability:', error);
    }
    // Fallback to version-based check
    const iosVersion = getIOSVersion();
    return iosVersion >= 26;
  }
}

/**
 * Check Force Enable Flag for iOS < 26
 *
 * TESTING FEATURE: Allows testing native glass effects on iOS < 26.
 * This is useful for development and testing liquid glass UI before iOS 26 release.
 *
 * ENABLE VIA:
 * 1. Environment variable: LIQUID_GLASS_PRE_IOS26=1
 * 2. Global flag: global.__DEV_LIQUID_GLASS_PRE_IOS26__ = true
 *
 * CRITICAL: Only works in __DEV__ mode for safety.
 *
 * @returns True if force enable is active
 */
function shouldForceGlassPreIOS26(): boolean {
  if (!__DEV__) {
    return false;
  }

  // Check global flag (set in app/_layout.tsx or other entry point)
  if ((global as any).__DEV_LIQUID_GLASS_PRE_IOS26__ === true) {
    return true;
  }

  // Check environment variable (from .env or Expo config)
  if (process.env.LIQUID_GLASS_PRE_IOS26 === '1') {
    return true;
  }

  return false;
}

/**
 * Check Reduce Transparency Accessibility Setting
 *
 * CRITICAL: Users with "Reduce Transparency" enabled should see solid backgrounds
 * instead of glass effects, per Apple Accessibility Guidelines.
 *
 * This is an async function that should be called on component mount.
 *
 * @returns Promise<boolean> - True if reduce transparency is enabled
 */
export async function shouldReduceTransparency(): Promise<boolean> {
  try {
    const enabled = await AccessibilityInfo.isReduceTransparencyEnabled();
    return enabled || false;
  } catch (error) {
    // Only log in development - production defaults to showing glass
    if (__DEV__) {
      console.warn('[Glass] Failed to check reduce transparency setting:', error);
    }
    return false; // Default to showing glass if check fails
  }
}

/**
 * Get Glass Capabilities
 *
 * Comprehensive capability detection for the current platform.
 * Call this once on app initialization to determine glass strategy.
 *
 * PERFORMANCE NOTE: This function is synchronous except for
 * accessibility checks. Cache the result to avoid repeated calculations.
 *
 * @param reduceTransparency - Result from shouldReduceTransparency() (optional)
 * @returns GlassCapabilities object
 */
export function getGlassCapabilities(
  reduceTransparency: boolean = false
): GlassCapabilities {
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  const isWeb = Platform.OS === 'web';

  // iOS 26+: Native liquid glass
  if (isIOS && isNativeGlassSupported() && !reduceTransparency) {
    return {
      isNativeGlassSupported: true,
      canRenderGlass: true,
      shouldReduceTransparency: false,
      glassType: 'native',
      maxGlassElements: 8, // Conservative for 60fps
    };
  }

  // iOS <26: Blur fallback
  if (isIOS && !reduceTransparency) {
    return {
      isNativeGlassSupported: false,
      canRenderGlass: true,
      shouldReduceTransparency: false,
      glassType: 'blur',
      maxGlassElements: 5, // More conservative (JS-based blur is expensive)
    };
  }

  // Android: Material Design 3 elevated surfaces
  if (isAndroid) {
    return {
      isNativeGlassSupported: false,
      canRenderGlass: true,
      shouldReduceTransparency: false,
      glassType: 'material',
      maxGlassElements: 12, // Material 3 elevation is GPU-accelerated
    };
  }

  // Web: CSS backdrop-filter
  if (isWeb) {
    return {
      isNativeGlassSupported: false,
      canRenderGlass: true,
      shouldReduceTransparency: false,
      glassType: 'blur',
      maxGlassElements: 10, // CSS backdrop-filter is GPU-accelerated
    };
  }

  // Fallback: Solid backgrounds (accessibility or unknown platform)
  return {
    isNativeGlassSupported: false,
    canRenderGlass: false,
    shouldReduceTransparency: reduceTransparency,
    glassType: 'solid',
    maxGlassElements: 999, // No limit for solid backgrounds
  };
}

/**
 * Get Recommended Glass Tint Color
 *
 * Returns platform-appropriate tint color for glass effects.
 *
 * DESIGN GUIDANCE:
 * - iOS: System blue (#007AFF) for interactive elements
 * - Android: Material You dynamic color
 * - Web: Primary brand color
 *
 * @param isDark - Dark mode enabled
 * @param variant - Glass variant ('regular' | 'prominent' | 'interactive')
 * @returns Tint color hex string
 */
export function getGlassTintColor(
  isDark: boolean,
  variant: 'regular' | 'prominent' | 'interactive' = 'regular'
): string {
  // iOS System Blue (works well with liquid glass)
  if (Platform.OS === 'ios') {
    if (variant === 'interactive') {
      return '#007AFF'; // iOS system blue
    }
    if (variant === 'prominent') {
      return isDark ? '#0A84FF' : '#007AFF'; // Lighter blue in dark mode
    }
    return 'transparent'; // Regular glass has no tint
  }

  // Android: Material Design 3 color tokens
  // Following Material You dynamic color system
  if (Platform.OS === 'android') {
    if (variant === 'interactive') {
      // Primary color for interactive elements
      return isDark
        ? '#D0BCFF' // Primary 80 (dark mode)
        : '#6750A4'; // Primary 40 (light mode)
    }
    if (variant === 'prominent') {
      // Tertiary color for prominent elements
      return isDark
        ? '#EFB8C8' // Tertiary 80 (dark mode)
        : '#7D5260'; // Tertiary 40 (light mode)
    }
    return 'transparent'; // Regular surfaces have no tint
  }

  // Web: Brand color
  return variant === 'interactive' ? '#007AFF' : 'transparent';
}

/**
 * Get Glass Background Color Fallback
 *
 * For platforms without native glass support, returns an appropriate
 * background color that mimics glass appearance.
 *
 * DESIGN: Uses semi-transparent backgrounds with slight blur simulation.
 *
 * @param isDark - Dark mode enabled
 * @param variant - Glass variant
 * @returns RGBA color string
 */
export function getGlassBackgroundFallback(
  isDark: boolean,
  variant: 'regular' | 'prominent' | 'interactive' = 'regular'
): string {
  // iOS <26: Blur-like semi-transparent backgrounds
  if (Platform.OS === 'ios') {
    if (variant === 'prominent') {
      return isDark
        ? 'rgba(28, 28, 30, 0.85)' // iOS dark surface
        : 'rgba(255, 255, 255, 0.85)'; // iOS light surface
    }
    if (variant === 'interactive') {
      return isDark
        ? 'rgba(0, 122, 255, 0.15)' // iOS blue tint
        : 'rgba(0, 122, 255, 0.1)';
    }
    // Regular
    return isDark
      ? 'rgba(28, 28, 30, 0.7)'
      : 'rgba(255, 255, 255, 0.7)';
  }

  // Android: Material Design 3 surface colors
  // Following Material You color system with proper elevation tints
  if (Platform.OS === 'android') {
    if (variant === 'prominent') {
      // Surface Container: Standard card background
      return isDark
        ? '#2B2B2F' // Surface container dark (elevation 3)
        : '#F3EDF7'; // Surface container light (elevation 3)
    }
    if (variant === 'interactive') {
      // Surface Container Low: Interactive elements
      return isDark
        ? '#26262A' // Surface container low dark (elevation 2)
        : '#F7F2FA'; // Surface container low light (elevation 2)
    }
    // Regular: Surface (base elevation)
    return isDark
      ? '#1C1B1F' // Surface dark (elevation 1)
      : '#FFFBFE'; // Surface light (elevation 1)
  }

  // Web: Semi-transparent with backdrop-filter support
  if (variant === 'prominent') {
    return isDark
      ? 'rgba(28, 28, 30, 0.9)'
      : 'rgba(255, 255, 255, 0.9)';
  }
  return isDark
    ? 'rgba(28, 28, 30, 0.8)'
    : 'rgba(255, 255, 255, 0.8)';
}

/**
 * Performance: Check if Glass Should Render
 *
 * Runtime check to disable glass effects during heavy operations.
 *
 * USE CASE: Disable glass during scrolling, animations, or when
 * there are too many glass elements on screen.
 *
 * @param glassCount - Current number of glass elements on screen
 * @param isScrolling - User is currently scrolling
 * @param isAnimating - Heavy animation in progress
 * @param capabilities - Current glass capabilities
 * @returns True if glass should render
 */
export function shouldRenderGlass(
  glassCount: number,
  isScrolling: boolean,
  isAnimating: boolean,
  capabilities: GlassCapabilities
): boolean {
  // Always render solid backgrounds
  if (capabilities.glassType === 'solid') {
    return true;
  }

  // Disable during heavy operations on iOS <26 (JS-based blur is expensive)
  if (capabilities.glassType === 'blur' && (isScrolling || isAnimating)) {
    return false;
  }

  // Enforce max element limit
  if (glassCount > capabilities.maxGlassElements) {
    return false;
  }

  return capabilities.canRenderGlass;
}

/**
 * Development: Force Glass Mode
 *
 * For testing glass effects on unsupported platforms.
 *
 * CRITICAL: Only use in __DEV__ mode!
 *
 * Set global.__DEV_FORCE_GLASS__ = true to enable.
 */
export function shouldForceGlassInDev(): boolean {
  if (!__DEV__) {
    return false;
  }

  return (global as any).__DEV_FORCE_GLASS__ === true;
}
