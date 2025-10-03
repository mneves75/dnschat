/**
 * LiquidGlassWrapper - React Native component for iOS 17 SwiftUI Glass Effects
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
 * @since 1.8.0 (iOS 17 Liquid Glass Support)
 */

import React, { useMemo } from "react";
import {
  Platform,
  ViewProps,
  View,
  useColorScheme,
  StyleProp,
  ViewStyle,
} from "react-native";

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

const getVariantBackground = (
  variant: NonNullable<LiquidGlassProps["variant"]>,
  isDark: boolean,
) => {
  if (isDark) {
    switch (variant) {
      case "prominent":
        return "rgba(36,36,38,0.85)";
      case "interactive":
        return "rgba(255,69,58,0.25)";
      default:
        return "rgba(28,28,30,0.65)";
    }
  }

  switch (variant) {
    case "prominent":
      return "rgba(255,255,255,0.35)";
    case "interactive":
      return "rgba(0,122,255,0.18)";
    default:
      return "rgba(255,255,255,0.18)";
  }
};

const getShapeRadius = (
  shape: NonNullable<LiquidGlassProps["shape"]>,
  cornerRadius: number,
) => {
  switch (shape) {
    case "capsule":
      return 999;
    case "roundedRect":
      return cornerRadius;
    case "rect":
    default:
      return 0;
  }
};

export const LiquidGlassWrapper: React.FC<LiquidGlassProps> = ({
  variant = "regular",
  shape = "roundedRect",
  cornerRadius = 16,
  tintColor,
  isInteractive = false,
  children,
  style,
  ...rest
}) => {
  const isIOS = Platform.OS === "ios";
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const baseStyle = useMemo<StyleProp<ViewStyle>>(() => {
    const radius = getShapeRadius(shape, cornerRadius);
    return [
      {
        borderRadius: radius,
        padding: 12,
        backgroundColor: tintColor
          ? tintColor
          : getVariantBackground(variant, isDark),
        borderWidth: isIOS ? 1 : 0,
        borderColor: isDark
          ? "rgba(255,255,255,0.12)"
          : "rgba(0,0,0,0.06)",
        shadowColor: "#000",
        shadowOpacity: isInteractive ? 0.25 : 0.15,
        shadowRadius: isInteractive ? 18 : 14,
        shadowOffset: { width: 0, height: isInteractive ? 10 : 6 },
        elevation: isInteractive ? 10 : 6,
        overflow: Platform.OS === "web" ? "hidden" : undefined,
      },
    ];
  }, [cornerRadius, isDark, isInteractive, shape, tintColor, variant, isIOS]);

  if (!isIOS) {
    // ✅ Enhanced fallback for Android/Web with Material Design elevation
    const fallbackStyle = [
      {
        backgroundColor: getVariantBackground(variant, isDark),
        borderRadius: typeof cornerRadius === 'number' ? cornerRadius : 20,
        ...Platform.select({
          android: {
            elevation: isInteractive ? 8 : 4, // Material Design elevation
          },
          web: {
            boxShadow: isInteractive
              ? '0 8px 16px rgba(0,0,0,0.15)'
              : '0 2px 8px rgba(0,0,0,0.10)',
          },
          default: {},
        }),
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
      },
      style,
    ];
    return <View style={fallbackStyle} {...rest}>{children}</View>;
  }

  return (
    <View style={[baseStyle, style]} {...rest}>
      {children}
    </View>
  );
};

export const useLiquidGlassCapabilities = () => {
  const isIOS = Platform.OS === "ios";
  const majorVersion = (() => {
    const version = Platform.Version;
    if (typeof version === "string") {
      const maybe = parseInt(version.split(".")[0] ?? "", 10);
      return Number.isFinite(maybe) ? maybe : null;
    }
    if (typeof version === "number") {
      return Math.trunc(version);
    }
    return null;
  })();

  const supported = isIOS && (majorVersion ?? 0) >= 17;

  return {
    capabilities: {
      available: supported,
      platform: isIOS ? "ios" : Platform.OS,
      fallbackMode: !supported,
      iosVersion: majorVersion?.toString() ?? "unknown",
    },
    loading: false,
    isSupported: supported,
    supportsSwiftUIGlass: false,
    iosVersion: majorVersion?.toString() ?? "unknown",
  };
};

// ==================================================================================
// CONVENIENCE COMPONENTS
// ==================================================================================

/**
 * Pre-configured glass button
 */
export const LiquidGlassButton: React.FC<LiquidGlassProps> = ({
  style,
  ...rest
}) => (
  <LiquidGlassWrapper
    variant="interactive"
    shape="capsule"
    isInteractive
    style={[{ alignSelf: "flex-start", paddingHorizontal: 16 }, style]}
    {...rest}
  />
);

/**
 * Pre-configured glass card
 */
export const LiquidGlassCard: React.FC<LiquidGlassProps> = ({
  style,
  ...rest
}) => (
  <LiquidGlassWrapper
    variant="regular"
    shape="roundedRect"
    cornerRadius={16}
    style={[{ padding: 16 }, style]}
    {...rest}
  />
);

/**
 * Pre-configured glass navigation bar
 */
export const LiquidGlassNavBar: React.FC<LiquidGlassProps> = ({
  style,
  ...rest
}) => (
  <LiquidGlassWrapper
    variant="prominent"
    shape="rect"
    style={[{ paddingVertical: 12, paddingHorizontal: 20 }, style]}
    {...rest}
  />
);

// ==================================================================================
// EXPORTS
// ==================================================================================

export default LiquidGlassWrapper;
