/**
 * iOS 26 Liquid Glass Detection and Capability Management
 *
 * Simplified utility aligned with official expo-glass-effect package.
 * Provides capability detection and performance guidance for iOS 26+ Liquid Glass.
 *
 * Architecture Philosophy:
 * - Use official expo-glass-effect APIs where possible
 * - Provide extended capability detection for optimization
 * - Graceful degradation for unsupported platforms
 * - Type-safe with strict TypeScript coverage
 *
 * @author DNSChat Team
 * @since 2.2.0 (Aligned with expo-glass-effect)
 */

import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { isLiquidGlassAvailable } from "expo-glass-effect";

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

/**
 * Glass effect styles from expo-glass-effect
 * Official API supports only: 'clear' | 'regular'
 */
export type GlassStyle = "clear" | "regular";

/**
 * Extended glass intensity levels for custom implementations
 */
export type GlassIntensity =
  | "ultraThin"
  | "thin"
  | "regular"
  | "thick"
  | "ultraThick";

/**
 * Comprehensive capabilities analysis for Liquid Glass features
 */
export interface LiquidGlassCapabilities {
  /** Overall Liquid Glass support status */
  isSupported: boolean;

  /** iOS API level (160 = iOS 16.0, 260 = iOS 26.0, etc.) */
  apiLevel: number;

  /** Platform identification */
  platform: "ios" | "android" | "web" | "unknown";

  /** Detailed feature support matrix */
  features: {
    /** Basic GlassView API availability (from expo-glass-effect) */
    basicGlass: boolean;

    /** Interactive glass (isInteractive prop) */
    interactiveGlass: boolean;

    /** GlassContainer for morphing animations */
    glassContainer: boolean;

    /** Reduce transparency accessibility support */
    reduceTransparency: boolean;
  };

  /** Performance characteristics for optimization */
  performance: {
    /** Estimated glass rendering performance tier */
    tier: "high" | "medium" | "low" | "fallback";

    /** Maximum recommended glass elements */
    maxGlassElements: number;

    /** Supports 60fps glass animations */
    supports60fps: boolean;
  };

  /** Device-specific optimizations */
  device: {
    /** Device model family */
    family: "iPhone" | "iPad" | "Mac" | "AppleTV" | "AppleWatch" | "unknown";

    /** Memory profile considerations */
    memoryProfile: "high" | "medium" | "low";
  };
}

// ==================================================================================
// SINGLETON CAPABILITY DETECTOR
// ==================================================================================

class LiquidGlassDetector {
  private static instance: LiquidGlassDetector;
  private _capabilities: LiquidGlassCapabilities | null = null;
  private _detectionPromise: Promise<LiquidGlassCapabilities> | null = null;

  /**
   * Singleton access to capability detector
   */
  public static getInstance(): LiquidGlassDetector {
    if (!LiquidGlassDetector.instance) {
      LiquidGlassDetector.instance = new LiquidGlassDetector();
    }
    return LiquidGlassDetector.instance;
  }

  /**
   * Get capabilities with memoization for performance
   */
  public async getCapabilities(): Promise<LiquidGlassCapabilities> {
    // Return cached result if available
    if (this._capabilities) {
      return this._capabilities;
    }

    // Return existing promise if detection is in progress
    if (this._detectionPromise) {
      return this._detectionPromise;
    }

    // Start new detection
    this._detectionPromise = this._detectCapabilities();
    this._capabilities = await this._detectionPromise;

    return this._capabilities;
  }

  /**
   * Force re-detection (useful for thermal state changes, etc.)
   */
  public async refreshCapabilities(): Promise<LiquidGlassCapabilities> {
    this._capabilities = null;
    this._detectionPromise = null;
    return this.getCapabilities();
  }

  /**
   * Core capability detection logic
   */
  private async _detectCapabilities(): Promise<LiquidGlassCapabilities> {
    try {
      // Platform detection
      const platform = this._detectPlatform();

      if (platform !== "ios") {
        return this._getFallbackCapabilities(platform);
      }

      // iOS-specific detection using official expo-glass-effect API
      const isSupported = isLiquidGlassAvailable();

      // Get iOS version
      let apiLevel = 0;
      try {
        const systemVersion = await DeviceInfo.getSystemVersion();
        apiLevel = this._parseIOSVersion(String(systemVersion || ""));
      } catch {
        // Fallback to Platform.Version
        const ver: any = (Platform as any).Version;
        const verStr = typeof ver === "string" ? ver : String(ver ?? "");
        apiLevel = this._parseIOSVersion(verStr);
      }

      // Get device model
      let deviceModel = "iPhone";
      try {
        deviceModel = await DeviceInfo.getModel();
      } catch {}
      const deviceFamily = this._getDeviceFamily(deviceModel);

      // Feature detection based on expo-glass-effect availability
      const features = this._detectFeatures(isSupported);
      const performance = this._analyzePerformance(apiLevel, deviceFamily);
      const device = this._analyzeDevice(deviceFamily, apiLevel);

      const capabilities: LiquidGlassCapabilities = {
        isSupported,
        apiLevel,
        platform: "ios",
        features,
        performance,
        device,
      };

      // Log detection results for debugging
      this._logCapabilities(capabilities);

      return capabilities;
    } catch (error) {
      console.warn("LiquidGlass: Detection failed, using fallback", error);
      return this._getFallbackCapabilities("ios");
    }
  }

  /**
   * Detect current platform
   */
  private _detectPlatform(): "ios" | "android" | "web" | "unknown" {
    if (Platform.OS === "ios") return "ios";
    if (Platform.OS === "android") return "android";
    if (Platform.OS === "web") return "web";
    return "unknown";
  }

  /**
   * Parse iOS version string to numeric API level
   * Examples: "16.0" -> 160, "26.1" -> 261, "17.4.1" -> 174
   */
  private _parseIOSVersion(versionString: string): number {
    try {
      const parts = String(versionString || "").split(".");
      const major = parseInt(parts[0], 10);
      const minor = parseInt(parts[1] || "0", 10);
      if (Number.isNaN(major) || major <= 0) return 160;
      if (Number.isNaN(minor) || minor < 0) return major * 10;
      return major * 10 + minor;
    } catch {
      return 160;
    }
  }

  /**
   * Determine device family from model string
   */
  private _getDeviceFamily(
    model: string
  ): LiquidGlassCapabilities["device"]["family"] {
    const modelLower = model.toLowerCase();

    if (modelLower.includes("iphone")) return "iPhone";
    if (modelLower.includes("ipad")) return "iPad";
    if (modelLower.includes("mac")) return "Mac";
    if (modelLower.includes("apple tv")) return "AppleTV";
    if (modelLower.includes("watch")) return "AppleWatch";

    return "unknown";
  }

  /**
   * Detect available features based on expo-glass-effect availability
   */
  private _detectFeatures(
    isSupported: boolean
  ): LiquidGlassCapabilities["features"] {
    // iOS 26+ with expo-glass-effect support
    if (isSupported) {
      return {
        basicGlass: true,
        interactiveGlass: true,
        glassContainer: true,
        reduceTransparency: true,
      };
    }

    // iOS < 26 or glass not available
    return {
      basicGlass: false,
      interactiveGlass: false,
      glassContainer: false,
      reduceTransparency: true, // Always available via AccessibilityInfo
    };
  }

  /**
   * Analyze performance characteristics
   */
  private _analyzePerformance(
    apiLevel: number,
    deviceFamily: LiquidGlassCapabilities["device"]["family"]
  ): LiquidGlassCapabilities["performance"] {
    // High-end devices with iOS 26+
    if (
      apiLevel >= 260 &&
      (deviceFamily === "iPhone" ||
        deviceFamily === "iPad" ||
        deviceFamily === "Mac")
    ) {
      return {
        tier: "high",
        maxGlassElements: 10, // Conservative limit per Apple guidelines
        supports60fps: true,
      };
    }

    // Medium performance for iOS 17-25
    if (apiLevel >= 170 && deviceFamily !== "AppleWatch") {
      return {
        tier: "medium",
        maxGlassElements: 5,
        supports60fps: true,
      };
    }

    // Low performance for iOS 16
    if (apiLevel >= 160) {
      return {
        tier: "low",
        maxGlassElements: 3,
        supports60fps: false,
      };
    }

    // Fallback for unsupported versions
    return {
      tier: "fallback",
      maxGlassElements: 0,
      supports60fps: false,
    };
  }

  /**
   * Analyze device-specific characteristics
   */
  private _analyzeDevice(
    deviceFamily: LiquidGlassCapabilities["device"]["family"],
    apiLevel: number
  ): LiquidGlassCapabilities["device"] {
    let memoryProfile: LiquidGlassCapabilities["device"]["memoryProfile"] =
      "medium";

    // Device-specific optimizations
    switch (deviceFamily) {
      case "iPhone":
        memoryProfile = apiLevel >= 260 ? "high" : "medium";
        break;

      case "iPad":
        memoryProfile = "high";
        break;

      case "Mac":
        memoryProfile = "high";
        break;

      case "AppleWatch":
        memoryProfile = "low";
        break;

      default:
        memoryProfile = "low";
    }

    return {
      family: deviceFamily,
      memoryProfile,
    };
  }

  /**
   * Get fallback capabilities for non-iOS platforms
   */
  private _getFallbackCapabilities(
    platform: "ios" | "android" | "web" | "unknown"
  ): LiquidGlassCapabilities {
    return {
      isSupported: false,
      apiLevel: 0,
      platform,
      features: {
        basicGlass: false,
        interactiveGlass: false,
        glassContainer: false,
        reduceTransparency: platform === "ios",
      },
      performance: {
        tier: "fallback",
        maxGlassElements: 0,
        supports60fps: true,
      },
      device: {
        family: "unknown",
        memoryProfile: "medium",
      },
    };
  }

  /**
   * Log capability detection results for debugging
   */
  private _logCapabilities(capabilities: LiquidGlassCapabilities): void {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("Liquid Glass Capabilities:", {
        supported: capabilities.isSupported,
        apiLevel: capabilities.apiLevel,
        platform: capabilities.platform,
        performanceTier: capabilities.performance.tier,
        deviceFamily: capabilities.device.family,
      });
    }
  }
}

// ==================================================================================
// PUBLIC API
// ==================================================================================

/**
 * Get comprehensive Liquid Glass capabilities for the current device
 */
export async function getLiquidGlassCapabilities(): Promise<LiquidGlassCapabilities> {
  return LiquidGlassDetector.getInstance().getCapabilities();
}

/**
 * Check if Liquid Glass is supported (wrapper around expo-glass-effect)
 */
export function isLiquidGlassSupported(): boolean {
  if (Platform.OS !== "ios") return false;
  return isLiquidGlassAvailable();
}

/**
 * Get optimal glass style for current device capabilities
 */
export async function getOptimalGlassStyle(): Promise<GlassStyle> {
  const capabilities = await getLiquidGlassCapabilities();

  if (!capabilities.isSupported) {
    return "regular";
  }

  // expo-glass-effect supports 'clear' | 'regular'
  // Use 'regular' for most cases, 'clear' for more transparent effects
  return capabilities.performance.tier === "high" ? "regular" : "regular";
}

/**
 * Force refresh capabilities (useful for thermal state changes)
 */
export async function refreshLiquidGlassCapabilities(): Promise<LiquidGlassCapabilities> {
  return LiquidGlassDetector.getInstance().refreshCapabilities();
}

/**
 * Validate glass configuration against device capabilities
 */
export async function validateGlassConfig(config: {
  style: GlassStyle;
  elementCount: number;
}): Promise<{
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
}> {
  const capabilities = await getLiquidGlassCapabilities();
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check element count against device limits
  if (config.elementCount > capabilities.performance.maxGlassElements) {
    warnings.push(
      `Element count (${config.elementCount}) exceeds device limit (${capabilities.performance.maxGlassElements})`
    );
    recommendations.push(
      `Reduce glass elements to ${capabilities.performance.maxGlassElements} or use lazy loading`
    );
  }

  // Check if requesting features not supported
  if (!capabilities.isSupported) {
    warnings.push(
      "Liquid Glass not supported, will fall back to standard styling"
    );
    recommendations.push(
      "Test fallback appearance on iOS < 26 and other platforms"
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations,
  };
}

// ==================================================================================
// RE-EXPORTS FROM EXPO-GLASS-EFFECT
// ==================================================================================

// Re-export official API for convenience
export { isLiquidGlassAvailable } from "expo-glass-effect";

export default {
  getLiquidGlassCapabilities,
  isLiquidGlassSupported,
  getOptimalGlassStyle,
  refreshLiquidGlassCapabilities,
  validateGlassConfig,
  isLiquidGlassAvailable,
};
