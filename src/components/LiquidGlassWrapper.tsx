/**
 * LiquidGlassWrapper - React Native component for iOS 26 SwiftUI Glass Effects
 *
 * Provides a simple wrapper around the native LiquidGlassView following
 * Apple's SwiftUI .glassEffect() patterns and modern Swift development.
 *
 * Usage:
 * <LiquidGlassWrapper variant="regular" shape="capsule">
 *   <Text>Your content</Text>
 * </LiquidGlassWrapper>
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

import React from "react";
import {
  Platform,
  ViewProps,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import {
  GlassContainer,
  GlassView,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import type { GlassStyle } from "expo-glass-effect";
import { useLiquidGlassCapabilities as useFallbackLiquidGlassCapabilities } from "./liquidGlass/LiquidGlassFallback";

// ==================================================================================
// TYPES AND INTERFACES
// ==================================================================================

export interface LiquidGlassProps extends ViewProps {
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

  /** Environmental sensor adaptation */
  sensorAware?: boolean;

  /** Use GlassEffectContainer for performance */
  enableContainer?: boolean;

  /** Container merge distance */
  containerSpacing?: number;

  /** Children to render inside glass effect */
  children?: React.ReactNode;
}

// ==================================================================================
// iOS VERSION DETECTION FOR LIQUID GLASS GUARANTEE
// ==================================================================================

/**
 * Checks if the current iOS version supports Liquid Glass features
 * This provides proper capability detection for different iOS versions
 * Memoized for performance optimization
 */
const getIOSMajorVersion = (): number | null => {
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

const isIOSGlassCapable = (() => {
  const major = getIOSMajorVersion();
  // iOS 17+ supports basic blur effects, iOS 26+ supports SwiftUI glass effects
  return typeof major === "number" && major >= 17;
})();

// ==================================================================================
// REACT COMPONENT
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
  // IMPORTANT: Always call useColorScheme at the top level to avoid hooks ordering issues
  const colorScheme = useColorScheme();
  const { supportsSwiftUIGlass } = useLiquidGlassCapabilities();

  const shouldUseNativeGlass =
    Platform.OS === "ios" &&
    isIOSGlassCapable &&
    supportsSwiftUIGlass &&
    isLiquidGlassAvailable();

  const resolvedGlassStyle: GlassStyle = variant === "prominent" ? "regular" : "clear";
  const resolvedCornerRadius = (() => {
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
  })();

  const resolvedTint = (() => {
    if (tintColor && tintColor.trim().length > 0) {
      return tintColor;
    }

    if (colorScheme === "dark") {
      switch (variant) {
        case "prominent":
          return "rgba(40, 40, 42, 0.45)";
        case "interactive":
          return "rgba(255, 69, 58, 0.35)";
        default:
          return "rgba(30, 30, 32, 0.35)";
      }
    }

    switch (variant) {
      case "prominent":
        return "rgba(255, 255, 255, 0.35)";
      case "interactive":
        return "rgba(0, 122, 255, 0.28)";
      default:
        return "rgba(248, 249, 250, 0.25)";
    }
  })();

  if (shouldUseNativeGlass) {
    const interactive = isInteractive || variant === "interactive";
    const nativeStyle: ViewStyle = {
      borderRadius: resolvedCornerRadius,
      overflow: "hidden",
    };

    const content = (
      <GlassView
        glassEffectStyle={resolvedGlassStyle}
        tintColor={resolvedTint}
        isInteractive={interactive}
        style={[nativeStyle, style]}
        {...props}
      >
        {children}
      </GlassView>
    );

    if (enableContainer) {
      return (
        <GlassContainer spacing={containerSpacing}>
          {content}
        </GlassContainer>
      );
    }

    return content;
  }

  // Non-iOS platforms get no glass effects
  if (Platform.OS !== "ios") {
    return <>{children}</>;
  }

  // Enhanced CSS fallback with glass-like effects
  const isDark = colorScheme === "dark";

  type GlassFallbackStyle = ViewStyle & { backdropFilter?: string };

  const glassStyle: GlassFallbackStyle = {
    backgroundColor: (() => {
      if (isDark) {
        switch (variant) {
          case "prominent":
            return "rgba(40, 40, 42, 0.98)"; // More opaque dark gray
          case "interactive":
            return "rgba(255, 69, 58, 0.3)"; // Stronger Notion red accent
          default:
            return "rgba(28, 28, 30, 0.95)"; // More opaque system dark
        }
      } else {
        switch (variant) {
          case "prominent":
            return "rgba(255, 255, 255, 0.15)"; // Translucent white glass
          case "interactive":
            return "rgba(0, 122, 255, 0.25)"; // iOS system blue accent
          default:
            return "rgba(248, 249, 250, 0.1)"; // Very translucent light glass
        }
      }
    })(),
    borderRadius: resolvedCornerRadius,
    borderWidth: isDark ? 2 : 1, // Stronger borders
    borderColor: isDark
      ? "rgba(255, 255, 255, 0.2)" // More visible white border in dark
      : "rgba(0, 0, 0, 0.12)", // More visible dark border in light
    shadowColor: isDark ? "#000000" : "#000000",
    shadowOffset: { width: 0, height: isDark ? 12 : 8 }, // Larger shadow offset
    shadowOpacity: isDark ? 0.6 : 0.15, // Much stronger shadows
    shadowRadius: isDark ? 24 : 18, // Larger blur radius
    elevation: 12, // Higher Android elevation
    // Add glassmorphism effect
    backdropFilter: "blur(20px)", // CSS glassmorphism (web/newer RN)
    ...(Platform.OS === "ios" && {
      // iOS-specific blur enhancement
      overflow: "hidden",
    }),
    // Modern interaction states with dramatic effects
    ...(isInteractive && {
      backgroundColor: isDark
        ? "rgba(255, 69, 58, 0.35)" // Stronger red interaction in dark
        : "rgba(0, 122, 255, 0.3)", // iOS system blue interaction in light
      shadowOpacity: isDark ? 0.7 : 0.2, // Much stronger interactive shadows
      shadowRadius: isDark ? 28 : 22, // Larger interactive blur
      elevation: 16, // Higher interactive elevation
      borderWidth: isDark ? 3 : 2, // Even stronger borders when interactive
    }),
    // Prominent variant gets dramatic elevation
    ...(variant === "prominent" && {
      shadowOffset: { width: 0, height: isDark ? 16 : 12 }, // Much larger prominent shadow
      shadowOpacity: isDark ? 0.7 : 0.2, // Stronger prominent shadows
      shadowRadius: isDark ? 32 : 24, // Largest blur radius for prominent
      elevation: 20, // Highest elevation for prominent
      borderWidth: isDark ? 3 : 2, // Stronger borders for prominent
    }),
  } as GlassFallbackStyle;

  return (
    <View style={[glassStyle, style]} {...props}>
      {children}
    </View>
  );
};

// ==================================================================================
// UTILITY HOOKS
// ==================================================================================

/**
 * Hook for accessing native glass capabilities with logging
 */
let hasLoggedCapabilities = false;

export const useLiquidGlassCapabilities = () => {
  const { capabilities, loading } = useFallbackLiquidGlassCapabilities();

  React.useEffect(() => {
    if (!loading && capabilities && !hasLoggedCapabilities) {
      console.log("💎 Liquid Glass capabilities", capabilities);
      hasLoggedCapabilities = true;
    }
  }, [loading, capabilities]);

  const isSupported = Boolean(capabilities?.available || capabilities?.isSupported);
  const supportsSwiftUIGlass = Boolean(capabilities?.supportsSwiftUIGlass);
  const supportsBasicBlur = Boolean(capabilities?.supportsBasicBlur);
  const iosVersion = capabilities?.apiLevel
    ? (capabilities.apiLevel / 10).toFixed(1)
    : null;

  return {
    capabilities,
    loading,
    isSupported,
    supportsSwiftUIGlass,
    supportsBasicBlur,
    iosVersion,
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
