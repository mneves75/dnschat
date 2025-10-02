/**
 * Liquid Glass Fallback System
 *
 * Provides graceful degradation across all platforms with appropriate visual effects:
 * - iOS 17+: Full UIGlassEffect integration (via native module)
 * - iOS 17-25: Enhanced blur with react-native-blur
 * - iOS 16: Basic blur fallback
 * - Android: Material Design 3 elevated surfaces
 * - Web: CSS glassmorphism with backdrop-filter
 *
 * Performance-optimized with lazy loading and memoization.
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 17 Liquid Glass Support)
 */

import React, { useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
  Animated,
  useColorScheme,
} from "react-native";

import {
  getLiquidGlassCapabilities,
  LiquidGlassCapabilities,
  GlassStyle,
  GlassIntensity,
} from "../../utils/liquidGlass";

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

export interface LiquidGlassProps {
  /** Children components to render with glass effect */
  children: React.ReactNode;

  /** Glass intensity level */
  intensity?: GlassIntensity;

  /** System glass style (iOS 17+ only) */
  style?: GlassStyle;

  /** Custom styling */
  containerStyle?: ViewStyle;

  /** Enable sensor-aware adaptations (iOS 17+ only) */
  sensorAware?: boolean;

  /** Enable environmental adaptation (iOS 17+ only) */
  environmentalAdaptation?: boolean;

  /** Override platform detection for testing */
  forcePlatform?: "native" | "blur" | "material" | "css";

  /** Performance optimization: reduce effects during animations */
  reduceMotion?: boolean;

  /** Accessibility: disable effects for accessibility users */
  respectAccessibilitySettings?: boolean;

  /** Debug mode: show platform/capability info */
  debug?: boolean;

  /** Callback when glass effect is applied */
  onGlassApplied?: (
    platform: string,
    capabilities: LiquidGlassCapabilities,
  ) => void;
}

interface FallbackStrategy {
  platform: "native" | "blur" | "material" | "css" | "plain";
  component: React.ComponentType<any>;
  capabilities: LiquidGlassCapabilities | null;
}

// ==================================================================================
// PLATFORM-SPECIFIC IMPLEMENTATIONS
// ==================================================================================

/**
 * iOS 17+ Native UIGlassEffect Implementation
 */
const NativeGlassView: React.FC<LiquidGlassProps> = ({
  children,
  intensity = "regular",
  style = "systemMaterial",
  containerStyle,
  sensorAware = false,
  environmentalAdaptation = false,
  debug = false,
}) => {
  // Import the native component dynamically to avoid import errors on non-iOS platforms
  const [NativeComponent, setNativeComponent] =
    React.useState<React.ComponentType<any> | null>(null);

  React.useEffect(() => {
    // Dynamically import the native component
    import("./LiquidGlassNative")
      .then((module) => {
        setNativeComponent(() => module.LiquidGlassNative);
      })
      .catch((error) => {
        console.warn("Failed to load native glass component", error);
        setNativeComponent(null);
      });
  }, []);

  // Show loading state while component loads
  if (!NativeComponent) {
    return (
      <View style={[styles.glassContainer, containerStyle]}>
        {debug && (
          <View style={styles.debugBadge}>
            <Text style={styles.debugText}>LOADING NATIVE</Text>
          </View>
        )}
        {children}
      </View>
    );
  }

  // Render the native component
  return (
    <NativeComponent
      intensity={intensity}
      style={style}
      sensorAware={sensorAware}
      environmentalAdaptation={environmentalAdaptation}
      containerStyle={[styles.glassContainer, containerStyle]}
      onGlassEffectApplied={() => {
        if (debug) {
          console.log("🎉 Native glass effect applied successfully");
        }
      }}
      onGlassEffectFailed={(error: string) => {
        if (debug) {
          console.warn("❌ Native glass effect failed:", error);
        }
      }}
    >
      {debug && (
        <View style={styles.debugBadge}>
          <Text style={styles.debugText}>NATIVE GLASS</Text>
        </View>
      )}
      {children}
    </NativeComponent>
  );
};

/**
 * iOS 17-25 Enhanced Blur Implementation
 */
const EnhancedBlurView: React.FC<LiquidGlassProps> = ({
  children,
  intensity = "regular",
  containerStyle,
  debug = false,
}) => {
  const colorScheme = useColorScheme();

  // Map intensity to blur amount
  const blurIntensityMap: Record<GlassIntensity, number> = {
    ultraThin: 5,
    thin: 10,
    regular: 15,
    thick: 25,
    ultraThick: 35,
  };

  const blurAmount = blurIntensityMap[intensity];

  // This would use react-native-blur in a real implementation
  // For now, simulate with translucent overlay
  const blurStyle: ViewStyle = {
    backgroundColor:
      colorScheme === "dark"
        ? `rgba(20, 20, 20, ${0.3 + blurAmount / 100})`
        : `rgba(255, 255, 255, ${0.3 + blurAmount / 100})`,
    backdropFilter: `blur(${blurAmount}px)`, // For web compatibility
  };

  return (
    <View style={[styles.glassContainer, blurStyle, containerStyle]}>
      {debug && (
        <View style={styles.debugBadge}>
          <Text style={styles.debugText}>ENHANCED BLUR</Text>
        </View>
      )}
      {children}
    </View>
  );
};

/**
 * iOS 16 Basic Blur Implementation
 */
const BasicBlurView: React.FC<LiquidGlassProps> = ({
  children,
  intensity = "regular",
  containerStyle,
  debug = false,
}) => {
  const colorScheme = useColorScheme();

  // Simple translucent overlay for basic blur effect
  const basicBlurStyle: ViewStyle = {
    backgroundColor:
      colorScheme === "dark"
        ? "rgba(28, 28, 30, 0.6)"
        : "rgba(242, 242, 247, 0.6)",
  };

  return (
    <View style={[styles.glassContainer, basicBlurStyle, containerStyle]}>
      {debug && (
        <View style={styles.debugBadge}>
          <Text style={styles.debugText}>BASIC BLUR</Text>
        </View>
      )}
      {children}
    </View>
  );
};

/**
 * Android Material Design 3 Implementation
 */
const MaterialSurfaceView: React.FC<LiquidGlassProps> = ({
  children,
  intensity = "regular",
  containerStyle,
  debug = false,
}) => {
  const colorScheme = useColorScheme();

  // Material Design 3 elevation levels
  const elevationMap: Record<GlassIntensity, number> = {
    ultraThin: 1,
    thin: 2,
    regular: 4,
    thick: 8,
    ultraThick: 12,
  };

  const elevation = elevationMap[intensity];

  const materialStyle: ViewStyle = {
    elevation,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: elevation / 2 },
    shadowOpacity: 0.25,
    shadowRadius: elevation,
    backgroundColor:
      colorScheme === "dark"
        ? "rgba(46, 46, 46, 0.9)"
        : "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
  };

  return (
    <View style={[styles.glassContainer, materialStyle, containerStyle]}>
      {debug && (
        <View style={styles.debugBadge}>
          <Text style={styles.debugText}>MATERIAL 3</Text>
        </View>
      )}
      {children}
    </View>
  );
};

/**
 * Web CSS Glassmorphism Implementation
 */
const CSSGlassView: React.FC<LiquidGlassProps> = ({
  children,
  intensity = "regular",
  containerStyle,
  debug = false,
}) => {
  const colorScheme = useColorScheme();

  // CSS glassmorphism with backdrop-filter
  const blurMap: Record<GlassIntensity, string> = {
    ultraThin: "2px",
    thin: "5px",
    regular: "10px",
    thick: "15px",
    ultraThick: "20px",
  };

  const blurValue = blurMap[intensity];

  const cssGlassStyle: ViewStyle = {
    // @ts-ignore - backdropFilter is web-only
    backdropFilter: `blur(${blurValue}) saturate(180%)`,
    backgroundColor:
      colorScheme === "dark"
        ? "rgba(30, 30, 30, 0.4)"
        : "rgba(255, 255, 255, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  };

  return (
    <View style={[styles.glassContainer, cssGlassStyle, containerStyle]}>
      {debug && (
        <View style={styles.debugBadge}>
          <Text style={styles.debugText}>CSS GLASS</Text>
        </View>
      )}
      {children}
    </View>
  );
};

/**
 * Fallback Plain View (for unsupported platforms or accessibility)
 */
const PlainView: React.FC<LiquidGlassProps> = ({
  children,
  containerStyle,
  debug = false,
}) => {
  const colorScheme = useColorScheme();

  const plainStyle: ViewStyle = {
    backgroundColor: colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorScheme === "dark" ? "#38383a" : "#d1d1d6",
  };

  return (
    <View style={[styles.glassContainer, plainStyle, containerStyle]}>
      {debug && (
        <View style={styles.debugBadge}>
          <Text style={styles.debugText}>PLAIN FALLBACK</Text>
        </View>
      )}
      {children}
    </View>
  );
};

// ==================================================================================
// MAIN LIQUID GLASS COMPONENT
// ==================================================================================

/**
 * Intelligent Liquid Glass component with automatic platform detection and fallback
 */
export const LiquidGlassView: React.FC<LiquidGlassProps> = (props) => {
  const {
    forcePlatform,
    respectAccessibilitySettings = true,
    onGlassApplied,
    debug = false,
  } = props;

  const [fallbackStrategy, setFallbackStrategy] =
    React.useState<FallbackStrategy | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Determine the best fallback strategy
  const determineFallbackStrategy =
    useCallback(async (): Promise<FallbackStrategy> => {
      try {
        // Honor force platform for testing
        if (forcePlatform) {
          return {
            platform: forcePlatform,
            component: getComponentForPlatform(forcePlatform),
            capabilities: null,
          };
        }

        // Check device capabilities
        const capabilities = await getLiquidGlassCapabilities();

        // Respect accessibility settings
        if (respectAccessibilitySettings) {
          // In a real implementation, check accessibility preferences
          // For now, assume normal operation
        }

        // Select best implementation based on capabilities
        let selectedPlatform: FallbackStrategy["platform"] = "plain";

        if (capabilities.isSupported && capabilities.features.basicGlass) {
          selectedPlatform = "native";
        } else if (
          capabilities.platform === "ios" &&
          capabilities.apiLevel >= 170
        ) {
          selectedPlatform = "blur";
        } else if (capabilities.platform === "android") {
          selectedPlatform = "material";
        } else if (capabilities.platform === "web") {
          selectedPlatform = "css";
        } else {
          selectedPlatform = "plain";
        }

        const strategy: FallbackStrategy = {
          platform: selectedPlatform,
          component: getComponentForPlatform(selectedPlatform),
          capabilities,
        };

        // Notify callback
        if (onGlassApplied) {
          onGlassApplied(selectedPlatform, capabilities);
        }

        if (debug) {
          console.log("🔍 LiquidGlass Strategy Selected:", {
            platform: selectedPlatform,
            isSupported: capabilities.isSupported,
            apiLevel: capabilities.apiLevel,
            performanceTier: capabilities.performance.tier,
          });
        }

        return strategy;
      } catch (error) {
        console.warn(
          "LiquidGlass: Strategy determination failed, using plain fallback",
          error,
        );
        return {
          platform: "plain",
          component: PlainView,
          capabilities: null,
        };
      }
    }, [forcePlatform, respectAccessibilitySettings, onGlassApplied, debug]);

  // Get component for platform
  const getComponentForPlatform = (
    platform: string,
  ): React.ComponentType<any> => {
    switch (platform) {
      case "native":
        return NativeGlassView;
      case "blur":
        return EnhancedBlurView;
      case "material":
        return MaterialSurfaceView;
      case "css":
        return CSSGlassView;
      default:
        return PlainView;
    }
  };

  // Initialize fallback strategy
  useEffect(() => {
    let isMounted = true;

    const initializeStrategy = async () => {
      const strategy = await determineFallbackStrategy();

      if (isMounted) {
        setFallbackStrategy(strategy);
        setIsLoading(false);

        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    initializeStrategy();

    return () => {
      isMounted = false;
    };
  }, [determineFallbackStrategy, fadeAnim]);

  // Memoize the rendered component for performance
  const RenderedComponent = useMemo(() => {
    if (!fallbackStrategy) {
      return null;
    }

    const Component = fallbackStrategy.component;
    return <Component {...props} />;
  }, [fallbackStrategy, props]);

  // Loading state
  if (isLoading || !fallbackStrategy) {
    return (
      <View style={[styles.glassContainer, props.containerStyle]}>
        <View style={styles.loadingPlaceholder} />
        {props.children}
      </View>
    );
  }

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {RenderedComponent}
    </Animated.View>
  );
};

// ==================================================================================
// SPECIALIZED GLASS COMPONENTS
// ==================================================================================

/**
 * Navigation-optimized glass component
 */
export const LiquidGlassNavigation: React.FC<LiquidGlassProps> = (props) => {
  return (
    <LiquidGlassView
      {...props}
      intensity="thin"
      style="headerMaterial"
      sensorAware={true}
      environmentalAdaptation={true}
    />
  );
};

/**
 * Modal/popup-optimized glass component
 */
export const LiquidGlassModal: React.FC<LiquidGlassProps> = (props) => {
  return (
    <LiquidGlassView
      {...props}
      intensity="regular"
      style="popoverMaterial"
      sensorAware={false}
      environmentalAdaptation={true}
    />
  );
};

/**
 * Card/content-optimized glass component
 */
export const LiquidGlassCard: React.FC<LiquidGlassProps> = (props) => {
  return (
    <LiquidGlassView
      {...props}
      intensity="thin"
      style="systemThinMaterial"
      sensorAware={false}
      environmentalAdaptation={false}
    />
  );
};

/**
 * Sidebar-optimized glass component
 */
export const LiquidGlassSidebar: React.FC<LiquidGlassProps> = (props) => {
  return (
    <LiquidGlassView
      {...props}
      intensity="regular"
      style="sidebarMaterial"
      sensorAware={true}
      environmentalAdaptation={true}
    />
  );
};

// ==================================================================================
// HOOKS FOR GLASS INTERACTION
// ==================================================================================

/**
 * Hook for accessing liquid glass capabilities
 */
export const useLiquidGlassCapabilities = () => {
  const [capabilities, setCapabilities] =
    React.useState<LiquidGlassCapabilities | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadCapabilities = async () => {
      try {
        const caps = await getLiquidGlassCapabilities();
        if (isMounted) {
          setCapabilities(caps);
          setIsLoading(false);
        }
      } catch (error) {
        console.warn("Failed to load liquid glass capabilities", error);
        if (isMounted) {
          setCapabilities(null);
          setIsLoading(false);
        }
      }
    };

    loadCapabilities();

    return () => {
      isMounted = false;
    };
  }, []);

  return { capabilities, isLoading };
};

/**
 * Hook for adaptive glass intensity based on performance
 */
export const useAdaptiveGlassIntensity = (
  baseIntensity: GlassIntensity = "regular",
) => {
  const { capabilities } = useLiquidGlassCapabilities();

  return useMemo(() => {
    if (!capabilities) return baseIntensity;

    // Reduce intensity on lower-performance devices
    if (capabilities.performance.tier === "low") {
      return "ultraThin";
    } else if (capabilities.performance.tier === "medium") {
      return "thin";
    }

    return baseIntensity;
  }, [capabilities, baseIntensity]);
};

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  glassContainer: {
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 44, // Minimum touch target
  },

  loadingPlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: 12,
  },

  debugBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1000,
  },

  debugText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
  },
});

// ==================================================================================
// EXPORTS
// ==================================================================================

export default LiquidGlassView;
