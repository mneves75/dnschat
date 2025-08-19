/**
 * iOS 26 Liquid Glass Detection and Capability Management
 * 
 * This module provides comprehensive detection and capability management for iOS 26's
 * Liquid Glass design system. It implements a robust fallback strategy for cross-platform
 * compatibility while maximizing native iOS experience when available.
 * 
 * Architecture Philosophy:
 * - Performance-first: Lazy evaluation with memoization
 * - Extensible: Easy to add new capabilities as iOS evolves
 * - Defensive: Graceful degradation for unknown/future iOS versions
 * - Type-safe: Full TypeScript coverage with strict typing
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

/**
 * Comprehensive capabilities analysis for Liquid Glass features
 */
export interface LiquidGlassCapabilities {
  /** Overall Liquid Glass support status */
  isSupported: boolean;
  
  /** iOS API level (160 = iOS 16.0, 260 = iOS 26.0, etc.) */
  apiLevel: number;
  
  /** Platform identification */
  platform: 'ios' | 'android' | 'web' | 'unknown';
  
  /** Detailed feature support matrix */
  features: {
    /** Basic UIGlassEffect API availability */
    basicGlass: boolean;
    
    /** Advanced sensor-aware glass responses */
    sensorAware: boolean;
    
    /** 3D depth containers with spatial awareness */
    depthContainers: boolean;
    
    /** Environmental light/motion adaptation */
    environmentalCues: boolean;
    
    /** Haptic feedback integration with glass */
    hapticsIntegration: boolean;
    
    /** Real-time glass intensity adjustment */
    dynamicIntensity: boolean;
  };
  
  /** Performance characteristics for optimization */
  performance: {
    /** Estimated glass rendering performance tier */
    tier: 'high' | 'medium' | 'low' | 'fallback';
    
    /** Maximum recommended glass elements */
    maxGlassElements: number;
    
    /** Supports 60fps glass animations */
    supports60fps: boolean;
    
    /** Metal shader acceleration available */
    metalAcceleration: boolean;
  };
  
  /** Device-specific optimizations */
  device: {
    /** Device model family */
    family: 'iPhone' | 'iPad' | 'Mac' | 'AppleTV' | 'AppleWatch' | 'unknown';
    
    /** Thermal management recommendations */
    thermalGuidance: 'aggressive' | 'moderate' | 'conservative';
    
    /** Memory pressure considerations */
    memoryProfile: 'high' | 'medium' | 'low';
  };
}

/**
 * Glass effect intensity levels
 */
export type GlassIntensity = 'ultraThin' | 'thin' | 'regular' | 'thick' | 'ultraThick';

/**
 * Glass effect styles matching iOS 26 system materials
 */
export type GlassStyle = 
  | 'systemMaterial'
  | 'systemThinMaterial' 
  | 'systemUltraThinMaterial'
  | 'systemThickMaterial'
  | 'hudMaterial'
  | 'menuMaterial'
  | 'popoverMaterial'
  | 'sidebarMaterial'
  | 'headerMaterial'
  | 'footerMaterial';

/**
 * Environmental adaptation parameters
 */
export interface EnvironmentalContext {
  /** Ambient light level (0.0 - 1.0) */
  ambientLight: number;
  
  /** Device orientation */
  orientation: 'portrait' | 'landscape' | 'faceUp' | 'faceDown';
  
  /** Motion state for dynamic adjustments */
  motionState: 'static' | 'gentle' | 'active' | 'rapid';
  
  /** Proximity detection for interaction hints */
  proximityDetected: boolean;
  
  /** User interface style */
  userInterfaceStyle: 'light' | 'dark' | 'unspecified';
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
      
      if (platform !== 'ios') {
        return this._getFallbackCapabilities(platform);
      }

      // iOS-specific detection
      const systemVersion = await DeviceInfo.getSystemVersion();
      const apiLevel = this._parseIOSVersion(systemVersion);
      const deviceModel = await DeviceInfo.getModel();
      const deviceFamily = this._getDeviceFamily(deviceModel);

      // Feature detection based on iOS version and device capabilities
      const features = this._detectFeatures(apiLevel, deviceFamily);
      const performance = this._analyzePerformance(apiLevel, deviceFamily);
      const device = this._analyzeDevice(deviceFamily, apiLevel);

      const capabilities: LiquidGlassCapabilities = {
        isSupported: apiLevel >= 260, // iOS 26.0+
        apiLevel,
        platform: 'ios',
        features,
        performance,
        device,
      };

      // Log detection results for debugging
      this._logCapabilities(capabilities);

      return capabilities;

    } catch (error) {
      console.warn('LiquidGlass: Detection failed, using fallback', error);
      return this._getFallbackCapabilities('unknown');
    }
  }

  /**
   * Detect current platform
   */
  private _detectPlatform(): 'ios' | 'android' | 'web' | 'unknown' {
    if (Platform.OS === 'ios') return 'ios';
    if (Platform.OS === 'android') return 'android';
    if (Platform.OS === 'web') return 'web';
    return 'unknown';
  }

  /**
   * Parse iOS version string to numeric API level
   * Examples: "16.0" -> 160, "26.1" -> 261, "17.4.1" -> 174
   */
  private _parseIOSVersion(versionString: string): number {
    try {
      const parts = versionString.split('.');
      const major = parseInt(parts[0], 10);
      const minor = parseInt(parts[1] || '0', 10);
      
      // Convert to API level: iOS 16.0 = 160, iOS 26.1 = 261
      return major * 10 + minor;
    } catch {
      // Default to iOS 16.0 if parsing fails
      return 160;
    }
  }

  /**
   * Determine device family from model string
   */
  private _getDeviceFamily(model: string): LiquidGlassCapabilities['device']['family'] {
    const modelLower = model.toLowerCase();
    
    if (modelLower.includes('iphone')) return 'iPhone';
    if (modelLower.includes('ipad')) return 'iPad';
    if (modelLower.includes('mac')) return 'Mac';
    if (modelLower.includes('apple tv')) return 'AppleTV';
    if (modelLower.includes('watch')) return 'AppleWatch';
    
    return 'unknown';
  }

  /**
   * Detect available features based on iOS version and device
   */
  private _detectFeatures(
    apiLevel: number, 
    deviceFamily: LiquidGlassCapabilities['device']['family']
  ): LiquidGlassCapabilities['features'] {
    
    // iOS 26+ gets full Liquid Glass support
    if (apiLevel >= 260) {
      return {
        basicGlass: true,
        sensorAware: true,
        depthContainers: true,
        environmentalCues: true,
        hapticsIntegration: true,
        dynamicIntensity: true,
      };
    }

    // iOS 17+ gets enhanced blur support
    if (apiLevel >= 170) {
      return {
        basicGlass: false, // No UIGlassEffect
        sensorAware: false,
        depthContainers: false,
        environmentalCues: false,
        hapticsIntegration: true, // Basic haptics available
        dynamicIntensity: false,
      };
    }

    // iOS 16+ gets basic blur fallback
    if (apiLevel >= 160) {
      return {
        basicGlass: false,
        sensorAware: false,
        depthContainers: false,
        environmentalCues: false,
        hapticsIntegration: false,
        dynamicIntensity: false,
      };
    }

    // No support for older iOS
    return {
      basicGlass: false,
      sensorAware: false,
      depthContainers: false,
      environmentalCues: false,
      hapticsIntegration: false,
      dynamicIntensity: false,
    };
  }

  /**
   * Analyze performance characteristics
   */
  private _analyzePerformance(
    apiLevel: number,
    deviceFamily: LiquidGlassCapabilities['device']['family']
  ): LiquidGlassCapabilities['performance'] {
    
    // High-end devices with iOS 26+
    if (apiLevel >= 260 && (deviceFamily === 'iPhone' || deviceFamily === 'iPad' || deviceFamily === 'Mac')) {
      return {
        tier: 'high',
        maxGlassElements: 50,
        supports60fps: true,
        metalAcceleration: true,
      };
    }

    // Medium performance for iOS 17-25
    if (apiLevel >= 170 && deviceFamily !== 'AppleWatch') {
      return {
        tier: 'medium',
        maxGlassElements: 20,
        supports60fps: true,
        metalAcceleration: true,
      };
    }

    // Low performance for iOS 16
    if (apiLevel >= 160) {
      return {
        tier: 'low',
        maxGlassElements: 5,
        supports60fps: false,
        metalAcceleration: false,
      };
    }

    // Fallback for unsupported versions
    return {
      tier: 'fallback',
      maxGlassElements: 0,
      supports60fps: false,
      metalAcceleration: false,
    };
  }

  /**
   * Analyze device-specific characteristics
   */
  private _analyzeDevice(
    deviceFamily: LiquidGlassCapabilities['device']['family'],
    apiLevel: number
  ): LiquidGlassCapabilities['device'] {
    
    let thermalGuidance: LiquidGlassCapabilities['device']['thermalGuidance'] = 'moderate';
    let memoryProfile: LiquidGlassCapabilities['device']['memoryProfile'] = 'medium';

    // Device-specific optimizations
    switch (deviceFamily) {
      case 'iPhone':
        thermalGuidance = 'moderate';
        memoryProfile = apiLevel >= 260 ? 'high' : 'medium';
        break;
      
      case 'iPad':
        thermalGuidance = 'aggressive'; // iPads have better cooling
        memoryProfile = 'high';
        break;
      
      case 'Mac':
        thermalGuidance = 'aggressive'; // Macs have active cooling
        memoryProfile = 'high';
        break;
      
      case 'AppleWatch':
        thermalGuidance = 'conservative'; // Limited thermal headroom
        memoryProfile = 'low';
        break;
      
      default:
        thermalGuidance = 'conservative';
        memoryProfile = 'low';
    }

    return {
      family: deviceFamily,
      thermalGuidance,
      memoryProfile,
    };
  }

  /**
   * Get fallback capabilities for non-iOS platforms
   */
  private _getFallbackCapabilities(platform: 'android' | 'web' | 'unknown'): LiquidGlassCapabilities {
    return {
      isSupported: false,
      apiLevel: 0,
      platform,
      features: {
        basicGlass: false,
        sensorAware: false,
        depthContainers: false,
        environmentalCues: false,
        hapticsIntegration: platform === 'android', // Android has haptics
        dynamicIntensity: false,
      },
      performance: {
        tier: 'fallback',
        maxGlassElements: 0,
        supports60fps: true, // Assume modern devices
        metalAcceleration: false,
      },
      device: {
        family: 'unknown',
        thermalGuidance: 'conservative',
        memoryProfile: 'medium',
      },
    };
  }

  /**
   * Log capability detection results for debugging
   */
  private _logCapabilities(capabilities: LiquidGlassCapabilities): void {
    if (__DEV__) {
      console.log('🔍 LiquidGlass Capabilities Detected:', {
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
 * Check if basic Liquid Glass support is available
 */
export async function isLiquidGlassSupported(): Promise<boolean> {
  const capabilities = await getLiquidGlassCapabilities();
  return capabilities.isSupported;
}

/**
 * Get optimal glass style for current device capabilities
 */
export async function getOptimalGlassStyle(): Promise<GlassStyle> {
  const capabilities = await getLiquidGlassCapabilities();
  
  if (!capabilities.isSupported) {
    return 'systemMaterial'; // Fallback
  }

  // Choose style based on performance tier
  switch (capabilities.performance.tier) {
    case 'high':
      return 'systemMaterial';
    case 'medium':
      return 'systemThinMaterial';
    case 'low':
      return 'systemUltraThinMaterial';
    default:
      return 'systemMaterial';
  }
}

/**
 * Get recommended glass intensity for current device
 */
export async function getRecommendedIntensity(): Promise<GlassIntensity> {
  const capabilities = await getLiquidGlassCapabilities();
  
  if (!capabilities.isSupported) {
    return 'thin'; // Fallback blur intensity
  }

  // Adjust intensity based on device capabilities
  if (capabilities.performance.tier === 'high') {
    return 'regular';
  } else if (capabilities.performance.tier === 'medium') {
    return 'thin';
  } else {
    return 'ultraThin';
  }
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
  intensity: GlassIntensity;
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
    warnings.push(`Element count (${config.elementCount}) exceeds device limit (${capabilities.performance.maxGlassElements})`);
    recommendations.push(`Reduce glass elements to ${capabilities.performance.maxGlassElements} or use lazy loading`);
  }

  // Check intensity vs performance tier
  if (capabilities.performance.tier === 'low' && (config.intensity === 'thick' || config.intensity === 'ultraThick')) {
    warnings.push('High intensity glass may impact performance on this device');
    recommendations.push('Consider using "thin" or "ultraThin" intensity for better performance');
  }

  // Check if requesting features not supported
  if (!capabilities.isSupported && config.style !== 'systemMaterial') {
    warnings.push('Advanced glass styles not supported, will fall back to basic blur');
    recommendations.push('Use "systemMaterial" for consistent experience across devices');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations,
  };
}

// ==================================================================================
// PERFORMANCE MONITORING
// ==================================================================================

interface PerformanceMetrics {
  glassRenderTime: number;
  frameDrops: number;
  memoryUsage: number;
  thermalState: 'nominal' | 'fair' | 'serious' | 'critical';
}

/**
 * Monitor glass rendering performance
 */
export class LiquidGlassPerformanceMonitor {
  private metrics: PerformanceMetrics = {
    glassRenderTime: 0,
    frameDrops: 0,
    memoryUsage: 0,
    thermalState: 'nominal',
  };

  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    // Implementation would integrate with React Native performance APIs
    if (__DEV__) {
      console.log('🎯 LiquidGlass Performance Monitoring Started');
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if performance is within acceptable bounds
   */
  public isPerformanceAcceptable(): boolean {
    return (
      this.metrics.glassRenderTime < 16.67 && // 60fps target
      this.metrics.frameDrops < 5 &&
      this.metrics.thermalState !== 'critical'
    );
  }
}

export default {
  getLiquidGlassCapabilities,
  isLiquidGlassSupported,
  getOptimalGlassStyle,
  getRecommendedIntensity,
  refreshLiquidGlassCapabilities,
  validateGlassConfig,
  LiquidGlassPerformanceMonitor,
};