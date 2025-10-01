/**
 * Platform utilities for cross-platform feature detection
 *
 * Provides centralized iOS version detection and capability checks
 * to avoid duplicated logic across components.
 *
 * @author DNSChat Team
 * @since 2.1.0
 */

import { Platform } from "react-native";

// ==================================================================================
// iOS VERSION DETECTION
// ==================================================================================

/**
 * Extracts the major version number from iOS Platform.Version
 *
 * @returns The major iOS version (e.g., 26 for iOS 26.1.2) or null if not iOS
 *
 * @example
 * ```typescript
 * const version = getIOSMajorVersion();
 * if (version && version >= 26) {
 *   // Use iOS 26+ features
 * }
 * ```
 */
export const getIOSMajorVersion = (): number | null => {
  if (Platform.OS !== "ios") return null;

  const version = Platform.Version;
  if (typeof version === "string") {
    const parsed = parseInt(version.split(".")[0], 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof version === "number") {
    return Math.floor(version);
  }
  return null;
};

/**
 * Checks if the current iOS version supports SwiftUI Liquid Glass effects
 *
 * SwiftUI glass effects (GlassBackgroundEffect, material modifiers) were
 * introduced in iOS 26. Earlier versions (17-25) only support basic blur.
 *
 * @returns true if iOS 26+, false otherwise
 *
 * @example
 * ```typescript
 * if (isIOSGlassCapable()) {
 *   // Safe to use GlassView, GlassContainer
 * }
 * ```
 */
export const isIOSGlassCapable = (): boolean => {
  const major = getIOSMajorVersion();
  // iOS 26+ supports SwiftUI glass effects (GlassBackgroundEffect API)
  // Earlier versions (iOS 17-25) only have basic blur, not true glass materiality
  return typeof major === "number" && major >= 26;
};

/**
 * Checks if the current iOS version supports basic blur effects
 *
 * iOS 17+ supports UIBlurEffect and basic blurring, but not the
 * advanced glass materiality of iOS 26+.
 *
 * @returns true if iOS 17+, false otherwise
 */
export const isIOSBlurCapable = (): boolean => {
  const major = getIOSMajorVersion();
  return typeof major === "number" && major >= 17;
};

// ==================================================================================
// PLATFORM CHECKS
// ==================================================================================

/**
 * Checks if running on iOS (any version)
 */
export const isIOS = (): boolean => {
  return Platform.OS === "ios";
};

/**
 * Checks if running on Android (any version)
 */
export const isAndroid = (): boolean => {
  return Platform.OS === "android";
};

/**
 * Checks if running on web
 */
export const isWeb = (): boolean => {
  return Platform.OS === "web";
};

// ==================================================================================
// FEATURE DETECTION
// ==================================================================================

/**
 * Platform capabilities object for easy feature detection
 */
export const platformCapabilities = {
  /** iOS 26+ glass effects support */
  glassEffects: isIOSGlassCapable(),
  /** iOS 17+ blur effects support */
  blurEffects: isIOSBlurCapable(),
  /** Current iOS major version (null if not iOS) */
  iosMajorVersion: getIOSMajorVersion(),
  /** Platform identifier */
  platform: Platform.OS,
  /** Platform version */
  version: Platform.Version,
} as const;
