/**
 * LiquidGlass Native Bridge Components
 * 
 * React Native TypeScript interface to the native iOS 26 UIGlassEffect module.
 * Provides type-safe access to native glass capabilities with automatic fallbacks.
 * 
 * Key Features:
 * - Direct UIGlassEffect integration for iOS 26+
 * - Type-safe props and methods
 * - Performance monitoring integration
 * - Graceful fallback handling
 * - Real-time capability detection
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import {
  Platform,
  UIManager,
  findNodeHandle,
  NativeModules,
  requireNativeComponent,
  ViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

import {
  LiquidGlassCapabilities,
  GlassStyle,
  GlassIntensity,
  getLiquidGlassCapabilities,
} from '../../utils/liquidGlass';

// ==================================================================================
// NATIVE MODULE INTERFACES
// ==================================================================================

/**
 * Native module interface for capability detection and control
 */
interface LiquidGlassNativeModuleInterface {
  getCapabilities(): Promise<LiquidGlassCapabilities>;
  startPerformanceMonitoring(): Promise<void>;
  getPerformanceMetrics(): Promise<{
    averageRenderTime: number;
    frameDropRate: number;
    isPerformanceAcceptable: boolean;
  }>;
  getEnvironmentalContext(): Promise<{
    ambientLight: number;
    deviceOrientation: string;
    motionState: string;
    thermalState: string;
  }>;
}

/**
 * Native view manager interface for direct view manipulation
 */
interface LiquidGlassViewManagerInterface {
  setIntensity(reactTag: number, intensity: GlassIntensity): void;
  setStyle(reactTag: number, style: GlassStyle): void;
  setSensorAware(reactTag: number, sensorAware: boolean): void;
}

// Get native modules with error handling
const LiquidGlassNativeModule = NativeModules.LiquidGlassNativeModule as LiquidGlassNativeModuleInterface | undefined;
const LiquidGlassViewManager = UIManager.getViewManagerConfig('LiquidGlassViewManager') as LiquidGlassViewManagerInterface | undefined;

// Check if native modules are available
const isNativeModuleAvailable = () => {
  return Platform.OS === 'ios' && LiquidGlassNativeModule && LiquidGlassViewManager;
};

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

/**
 * Props for the native LiquidGlassView component
 */
export interface LiquidGlassNativeProps extends ViewProps {
  /** Glass effect intensity */
  intensity?: GlassIntensity;
  
  /** Glass effect style */
  style?: GlassStyle;
  
  /** Enable sensor-aware environmental adaptation */
  sensorAware?: boolean;
  
  /** Enable environmental light/motion adaptation */
  environmentalAdaptation?: boolean;
  
  /** Enable dynamic intensity adjustment */
  dynamicIntensity?: boolean;
  
  /** Enable haptic feedback integration */
  hapticsEnabled?: boolean;
  
  /** Performance optimization mode */
  performanceMode?: 'auto' | 'performance' | 'quality' | 'battery';
  
  /** Custom container styling */
  containerStyle?: StyleProp<ViewStyle>;
  
  /** Callback when glass effect is successfully applied */
  onGlassEffectApplied?: () => void;
  
  /** Callback when glass effect fails to apply */
  onGlassEffectFailed?: (error: string) => void;
  
  /** Callback for performance monitoring updates */
  onPerformanceUpdate?: (metrics: {
    averageRenderTime: number;
    frameDropRate: number;
    isAcceptable: boolean;
  }) => void;
}

/**
 * Imperative handle interface for programmatic control
 */
export interface LiquidGlassNativeHandle {
  /** Update glass intensity programmatically */
  setIntensity(intensity: GlassIntensity): void;
  
  /** Update glass style programmatically */
  setStyle(style: GlassStyle): void;
  
  /** Toggle sensor awareness */
  setSensorAware(enabled: boolean): void;
  
  /** Get current performance metrics */
  getPerformanceMetrics(): Promise<{
    averageRenderTime: number;
    frameDropRate: number;
    isPerformanceAcceptable: boolean;
  }>;
  
  /** Get current environmental context */
  getEnvironmentalContext(): Promise<{
    ambientLight: number;
    deviceOrientation: string;
    motionState: string;
    thermalState: string;
  }>;
}

// ==================================================================================
// NATIVE COMPONENT REGISTRATION
// ==================================================================================

/**
 * Native UIView component registration
 */
const NativeLiquidGlassView = requireNativeComponent<LiquidGlassNativeProps>('LiquidGlassView');

// ==================================================================================
// REACT NATIVE BRIDGE COMPONENT
// ==================================================================================

/**
 * React Native bridge to native iOS 26 UIGlassEffect implementation
 */
export const LiquidGlassNative = forwardRef<LiquidGlassNativeHandle, LiquidGlassNativeProps>(
  (props, ref) => {
    const {
      intensity = 'regular',
      style = 'systemMaterial',
      sensorAware = false,
      environmentalAdaptation = false,
      dynamicIntensity = false,
      hapticsEnabled = false,
      performanceMode = 'auto',
      containerStyle,
      onGlassEffectApplied,
      onGlassEffectFailed,
      onPerformanceUpdate,
      children,
      ...otherProps
    } = props;

    // Refs and state
    const nativeViewRef = useRef<any>(null);
    const [isNativeAvailable, setIsNativeAvailable] = useState(false);
    const [capabilities, setCapabilities] = useState<LiquidGlassCapabilities | null>(null);
    const performanceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Check native availability on mount
    useEffect(() => {
      const checkAvailability = async () => {
        try {
          if (!isNativeModuleAvailable()) {
            onGlassEffectFailed?.('Native module not available');
            return;
          }

          const caps = await getLiquidGlassCapabilities();
          setCapabilities(caps);
          setIsNativeAvailable(caps.isSupported && caps.features.basicGlass);

          if (caps.isSupported && caps.features.basicGlass) {
            onGlassEffectApplied?.();
          } else {
            onGlassEffectFailed?.('iOS 26 not available or glass not supported');
          }
        } catch (error) {
          console.warn('LiquidGlassNative: Capability check failed', error);
          onGlassEffectFailed?.(error instanceof Error ? error.message : 'Unknown error');
        }
      };

      checkAvailability();
    }, [onGlassEffectApplied, onGlassEffectFailed]);

    // Start performance monitoring if requested
    useEffect(() => {
      if (!isNativeAvailable || !onPerformanceUpdate || !LiquidGlassNativeModule) {
        return;
      }

      const startMonitoring = async () => {
        try {
          await LiquidGlassNativeModule.startPerformanceMonitoring();
          
          // Poll performance metrics every second
          performanceTimerRef.current = setInterval(async () => {
            try {
              const metrics = await LiquidGlassNativeModule.getPerformanceMetrics();
              onPerformanceUpdate({
                averageRenderTime: metrics.averageRenderTime,
                frameDropRate: metrics.frameDropRate,
                isAcceptable: metrics.isPerformanceAcceptable,
              });
            } catch (error) {
              console.warn('Performance metrics fetch failed', error);
            }
          }, 1000);
        } catch (error) {
          console.warn('Performance monitoring start failed', error);
        }
      };

      startMonitoring();

      return () => {
        if (performanceTimerRef.current) {
          clearInterval(performanceTimerRef.current);
          performanceTimerRef.current = null;
        }
      };
    }, [isNativeAvailable, onPerformanceUpdate]);

    // Imperative handle implementation
    useImperativeHandle(ref, () => ({
      setIntensity: (newIntensity: GlassIntensity) => {
        if (!isNativeAvailable || !LiquidGlassViewManager || !nativeViewRef.current) {
          return;
        }

        const reactTag = findNodeHandle(nativeViewRef.current);
        if (reactTag) {
          LiquidGlassViewManager.setIntensity(reactTag, newIntensity);
        }
      },

      setStyle: (newStyle: GlassStyle) => {
        if (!isNativeAvailable || !LiquidGlassViewManager || !nativeViewRef.current) {
          return;
        }

        const reactTag = findNodeHandle(nativeViewRef.current);
        if (reactTag) {
          LiquidGlassViewManager.setStyle(reactTag, newStyle);
        }
      },

      setSensorAware: (enabled: boolean) => {
        if (!isNativeAvailable || !LiquidGlassViewManager || !nativeViewRef.current) {
          return;
        }

        const reactTag = findNodeHandle(nativeViewRef.current);
        if (reactTag) {
          LiquidGlassViewManager.setSensorAware(reactTag, enabled);
        }
      },

      getPerformanceMetrics: async () => {
        if (!isNativeAvailable || !LiquidGlassNativeModule) {
          throw new Error('Native module not available');
        }
        return LiquidGlassNativeModule.getPerformanceMetrics();
      },

      getEnvironmentalContext: async () => {
        if (!isNativeAvailable || !LiquidGlassNativeModule) {
          throw new Error('Native module not available');
        }
        return LiquidGlassNativeModule.getEnvironmentalContext();
      },
    }), [isNativeAvailable]);

    // Early return if native module is not available
    if (!isNativeModuleAvailable() || !isNativeAvailable) {
      // Return null - the fallback system will handle rendering
      return null;
    }

    // Render native view
    return (
      <NativeLiquidGlassView
        ref={nativeViewRef}
        intensity={intensity}
        style={style}
        sensorAware={sensorAware}
        environmentalAdaptation={environmentalAdaptation}
        dynamicIntensity={dynamicIntensity}
        hapticsEnabled={hapticsEnabled}
        performanceMode={performanceMode}
        {...otherProps}
        style={[containerStyle, otherProps.style]}
      >
        {children}
      </NativeLiquidGlassView>
    );
  }
);

LiquidGlassNative.displayName = 'LiquidGlassNative';

// ==================================================================================
// CONVENIENCE HOOKS
// ==================================================================================

/**
 * Hook for accessing native glass capabilities
 */
export const useLiquidGlassNative = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [capabilities, setCapabilities] = useState<LiquidGlassCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkNativeSupport = async () => {
      try {
        if (!isNativeModuleAvailable()) {
          setIsAvailable(false);
          setIsLoading(false);
          return;
        }

        const caps = await getLiquidGlassCapabilities();
        setCapabilities(caps);
        setIsAvailable(caps.isSupported && caps.features.basicGlass);
        setIsLoading(false);
      } catch (error) {
        console.warn('Native glass capability check failed', error);
        setIsAvailable(false);
        setCapabilities(null);
        setIsLoading(false);
      }
    };

    checkNativeSupport();
  }, []);

  return {
    isAvailable,
    capabilities,
    isLoading,
    isNativeModuleAvailable: isNativeModuleAvailable(),
  };
};

/**
 * Hook for monitoring glass performance
 */
export const useLiquidGlassPerformance = () => {
  const [metrics, setMetrics] = useState<{
    averageRenderTime: number;
    frameDropRate: number;
    isAcceptable: boolean;
  } | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { isAvailable } = useLiquidGlassNative();

  const startMonitoring = async () => {
    if (!isAvailable || !LiquidGlassNativeModule) {
      return;
    }

    try {
      await LiquidGlassNativeModule.startPerformanceMonitoring();
      setIsMonitoring(true);

      // Poll metrics every 2 seconds
      const interval = setInterval(async () => {
        try {
          const newMetrics = await LiquidGlassNativeModule.getPerformanceMetrics();
          setMetrics({
            averageRenderTime: newMetrics.averageRenderTime,
            frameDropRate: newMetrics.frameDropRate,
            isAcceptable: newMetrics.isPerformanceAcceptable,
          });
        } catch (error) {
          console.warn('Performance metrics update failed', error);
        }
      }, 2000);

      return () => {
        clearInterval(interval);
        setIsMonitoring(false);
      };
    } catch (error) {
      console.warn('Performance monitoring failed to start', error);
    }
  };

  return {
    metrics,
    isMonitoring,
    startMonitoring,
  };
};

/**
 * Hook for environmental context monitoring
 */
export const useLiquidGlassEnvironment = () => {
  const [context, setContext] = useState<{
    ambientLight: number;
    deviceOrientation: string;
    motionState: string;
    thermalState: string;
  } | null>(null);
  const { isAvailable } = useLiquidGlassNative();

  const updateContext = async () => {
    if (!isAvailable || !LiquidGlassNativeModule) {
      return;
    }

    try {
      const newContext = await LiquidGlassNativeModule.getEnvironmentalContext();
      setContext(newContext);
    } catch (error) {
      console.warn('Environmental context update failed', error);
    }
  };

  useEffect(() => {
    if (!isAvailable) return;

    // Update context immediately
    updateContext();

    // Update every 5 seconds
    const interval = setInterval(updateContext, 5000);

    return () => clearInterval(interval);
  }, [isAvailable]);

  return {
    context,
    updateContext,
  };
};

// ==================================================================================
// UTILITY FUNCTIONS
// ==================================================================================

/**
 * Check if iOS 26 native glass is available
 */
export const isNativeGlassAvailable = async (): Promise<boolean> => {
  try {
    if (!isNativeModuleAvailable()) {
      return false;
    }

    const capabilities = await getLiquidGlassCapabilities();
    return capabilities.isSupported && capabilities.features.basicGlass;
  } catch {
    return false;
  }
};

/**
 * Get optimal native glass configuration for current device
 */
export const getOptimalNativeConfig = async (): Promise<{
  intensity: GlassIntensity;
  style: GlassStyle;
  sensorAware: boolean;
  performanceMode: 'auto' | 'performance' | 'quality' | 'battery';
}> => {
  try {
    const capabilities = await getLiquidGlassCapabilities();
    
    if (!capabilities.isSupported) {
      throw new Error('Native glass not supported');
    }

    // Configure based on device performance tier
    const config = {
      intensity: 'regular' as GlassIntensity,
      style: 'systemMaterial' as GlassStyle,
      sensorAware: false,
      performanceMode: 'auto' as const,
    };

    switch (capabilities.performance.tier) {
      case 'high':
        config.intensity = 'regular';
        config.sensorAware = capabilities.features.sensorAware;
        config.performanceMode = 'quality';
        break;
      case 'medium':
        config.intensity = 'thin';
        config.sensorAware = false;
        config.performanceMode = 'auto';
        break;
      case 'low':
        config.intensity = 'ultraThin';
        config.sensorAware = false;
        config.performanceMode = 'performance';
        break;
      default:
        config.performanceMode = 'battery';
    }

    return config;
  } catch (error) {
    console.warn('Optimal config determination failed', error);
    return {
      intensity: 'thin',
      style: 'systemMaterial',
      sensorAware: false,
      performanceMode: 'auto',
    };
  }
};

export default LiquidGlassNative;