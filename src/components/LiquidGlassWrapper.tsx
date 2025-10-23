/**
 * LiquidGlassWrapper - React Native wrapper for iOS 26 Liquid Glass effects
 *
 * Uses official expo-glass-effect package for iOS 26+ with graceful fallbacks
 * for older iOS versions, Android, and web platforms.
 *
 * Usage:
 * <LiquidGlassWrapper variant="regular" shape="capsule">
 *   <Text>Your content</Text>
 * </LiquidGlassWrapper>
 *
 * @author DNSChat Team
 * @since 2.2.0 (Migrated to expo-glass-effect)
 */

import React, { useMemo } from "react";
import {
  Platform,
  ViewProps,
  View,
  StyleSheet,
  AccessibilityInfo,
  useColorScheme,
} from "react-native";
import {
  GlassView,
  GlassContainer,
  isLiquidGlassAvailable,
  type GlassStyle as ExpoGlassStyle,
} from "expo-glass-effect";

// ==================================================================================
// TYPES AND INTERFACES
// ==================================================================================

interface LiquidGlassProps extends ViewProps {
  /** Glass variant: regular, prominent, interactive */
  variant?: "regular" | "prominent" | "interactive";

  /** Glass shape: capsule, rect, roundedRect */
  shape?: "capsule" | "rect" | "roundedRect";

  /** Corner radius for rect shapes */
  cornerRadius?: number;

  /** Tint color (hex string) */
  tintColor?: string;

  /** Interactive response to touch */
  isInteractive?: boolean;

  /** Environmental sensor adaptation (placeholder for future) */
  sensorAware?: boolean;

  /** Use GlassEffectContainer for performance (morphing animations) */
  enableContainer?: boolean;

  /** Container merge distance for morphing */
  containerSpacing?: number;

  /** Children to render inside glass effect */
  children?: React.ReactNode;
}

// ==================================================================================
// FALLBACK STYLES
// ==================================================================================

/**
 * Fallback styles for platforms/versions without Liquid Glass support
 */
const createFallbackStyles = (
  variant: string,
  shape: string,
  cornerRadius: number,
  isDark: boolean,
  isInteractive: boolean
) => {
  const baseStyle = {
    backgroundColor: (() => {
      if (isDark) {
        switch (variant) {
          case "prominent":
            return "rgba(40, 40, 42, 0.98)";
          case "interactive":
            return "rgba(255, 69, 58, 0.3)";
          default:
            return "rgba(28, 28, 30, 0.95)";
        }
      } else {
        switch (variant) {
          case "prominent":
            return "rgba(255, 255, 255, 0.15)";
          case "interactive":
            return "rgba(0, 122, 255, 0.25)";
          default:
            return "rgba(248, 249, 250, 0.1)";
        }
      }
    })(),
    borderRadius: (() => {
      switch (shape) {
        case "capsule":
          return 24;
        case "roundedRect":
          return cornerRadius || 16;
        case "rect":
          return 0;
        default:
          return 12;
      }
    })(),
    borderWidth: isDark ? 2 : 1,
    borderColor: isDark
      ? "rgba(255, 255, 255, 0.2)"
      : "rgba(0, 0, 0, 0.12)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: isDark ? 12 : 8 },
    shadowOpacity: isDark ? 0.6 : 0.15,
    shadowRadius: isDark ? 24 : 18,
    elevation: 12,
    overflow: "hidden" as const,
  };

  if (isInteractive) {
    return {
      ...baseStyle,
      backgroundColor: isDark
        ? "rgba(255, 69, 58, 0.35)"
        : "rgba(0, 122, 255, 0.3)",
      shadowOpacity: isDark ? 0.7 : 0.2,
      shadowRadius: isDark ? 28 : 22,
      elevation: 16,
      borderWidth: isDark ? 3 : 2,
    };
  }

  if (variant === "prominent") {
    return {
      ...baseStyle,
      shadowOffset: { width: 0, height: isDark ? 16 : 12 },
      shadowOpacity: isDark ? 0.7 : 0.2,
      shadowRadius: isDark ? 32 : 24,
      elevation: 20,
      borderWidth: isDark ? 3 : 2,
    };
  }

  return baseStyle;
};

// ==================================================================================
// MAIN COMPONENT
// ==================================================================================

/**
 * LiquidGlassWrapper - Main React Native component
 */
export const LiquidGlassWrapper: React.FC<LiquidGlassProps> = ({
  variant = "regular",
  shape = "capsule",
  cornerRadius = 12,
  tintColor = "",
  isInteractive = false,
  sensorAware = false,
  enableContainer = true,
  containerSpacing = 40,
  children,
  style,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Check if reduce transparency is enabled (accessibility)
  const [reduceTransparency, setReduceTransparency] = React.useState(false);

  React.useEffect(() => {
    if (Platform.OS === "ios") {
      AccessibilityInfo.isReduceTransparencyEnabled().then(
        setReduceTransparency
      );

      const subscription = AccessibilityInfo.addEventListener(
        "reduceTransparencyChanged",
        setReduceTransparency
      );

      return () => subscription.remove();
    }
  }, []);

  // Determine if we should use native glass
  const shouldUseNativeGlass = useMemo(() => {
    if (Platform.OS !== "ios") return false;
    if (reduceTransparency) return false; // Accessibility: no transparency
    return isLiquidGlassAvailable();
  }, [reduceTransparency]);

  // Map variant to expo-glass-effect glassEffectStyle
  const glassEffectStyle: ExpoGlassStyle = useMemo(() => {
    // expo-glass-effect supports: 'clear' | 'regular'
    // We map our variants to these two options
    switch (variant) {
      case "prominent":
      case "interactive":
        return "regular"; // Use regular for prominent/interactive
      default:
        return "regular"; // Default to regular
    }
  }, [variant]);

  // Apply shape styling
  const shapeStyle = useMemo(() => {
    return {
      borderRadius: (() => {
        switch (shape) {
          case "capsule":
            return 24;
          case "roundedRect":
            return cornerRadius || 16;
          case "rect":
            return 0;
          default:
            return 12;
        }
      })(),
    };
  }, [shape, cornerRadius]);

  // Non-iOS platforms: use fallback styles
  if (Platform.OS !== "ios") {
    const fallbackStyle = createFallbackStyles(
      variant,
      shape,
      cornerRadius,
      isDark,
      isInteractive
    );

    return (
      <View style={[fallbackStyle, style]} {...props}>
        {children}
      </View>
    );
  }

  // iOS with reduce transparency enabled: solid backgrounds
  if (reduceTransparency) {
    const solidStyle = {
      backgroundColor: isDark ? "rgb(28, 28, 30)" : "rgb(255, 255, 255)",
      ...shapeStyle,
    };

    return (
      <View style={[solidStyle, style]} {...props}>
        {children}
      </View>
    );
  }

  // iOS 26+ with Liquid Glass available
  if (shouldUseNativeGlass) {
    return (
      <GlassView
        glassEffectStyle={glassEffectStyle}
        isInteractive={isInteractive}
        tintColor={tintColor || undefined}
        style={[shapeStyle, style]}
        {...props}
      >
        {children}
      </GlassView>
    );
  }

  // iOS < 26: use fallback styles (blur-like appearance)
  const fallbackStyle = createFallbackStyles(
    variant,
    shape,
    cornerRadius,
    isDark,
    isInteractive
  );

  return (
    <View style={[fallbackStyle, style]} {...props}>
      {children}
    </View>
  );
};

// ==================================================================================
// UTILITY HOOKS
// ==================================================================================

/**
 * Hook for accessing liquid glass capabilities
 */
export const useLiquidGlassCapabilities = () => {
  const [available, setAvailable] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (Platform.OS === "ios") {
      const checkAvailability = async () => {
        try {
          const isAvailable = isLiquidGlassAvailable();
          setAvailable(isAvailable);
        } catch (error) {
          console.warn("Failed to check Liquid Glass availability", error);
          setAvailable(false);
        } finally {
          setLoading(false);
        }
      };

      checkAvailability();
    } else {
      setLoading(false);
      setAvailable(false);
    }
  }, []);

  return {
    available,
    loading,
    isSupported: Platform.OS === "ios" && available,
    supportsLiquidGlass: available,
  };
};

// ==================================================================================
// CONVENIENCE COMPONENTS
// ==================================================================================

/**
 * Pre-configured glass button
 */
export const LiquidGlassButton: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassWrapper
    variant="interactive"
    shape="capsule"
    isInteractive={true}
    {...props}
  />
);

/**
 * Pre-configured glass card
 */
export const LiquidGlassCard: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassWrapper
    variant="regular"
    shape="roundedRect"
    cornerRadius={16}
    enableContainer={true}
    {...props}
  />
);

/**
 * Pre-configured glass navigation bar
 */
export const LiquidGlassNavBar: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassWrapper
    variant="prominent"
    shape="rect"
    enableContainer={true}
    sensorAware={true}
    {...props}
  />
);

// ==================================================================================
// EXPORTS
// ==================================================================================

export default LiquidGlassWrapper;

export type { LiquidGlassProps };

// Re-export official expo-glass-effect components for direct usage
export { GlassView, GlassContainer, isLiquidGlassAvailable };
