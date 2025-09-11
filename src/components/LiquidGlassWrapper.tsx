/**
 * LiquidGlassWrapper - Official Expo GlassEffect wrapper (iOS 26+)
 *
 * Maps our lightweight props to Expo's GlassView so the rest of the
 * app can stay unchanged while using the official implementation.
 */

import React from "react";
import { Platform, View, ViewProps, StyleProp, ViewStyle } from "react-native";
import { GlassView } from "expo-glass-effect";

export interface LiquidGlassProps extends ViewProps {
  variant?: "regular" | "prominent" | "interactive";
  shape?: "capsule" | "rect" | "roundedRect";
  cornerRadius?: number;
  tintColor?: string;
  isInteractive?: boolean;
  children?: React.ReactNode;
}

const isIOS26Plus = (() => {
  if (Platform.OS !== "ios") return false;
  const v = Platform.Version as string | number;
  const major = typeof v === "string" ? parseInt(v.split(".")[0], 10) : v;
  return Number(major) >= 26;
})();

export const LiquidGlassWrapper: React.FC<LiquidGlassProps> = ({
  variant = "regular",
  shape = "capsule",
  cornerRadius = 12,
  tintColor,
  isInteractive = false,
  children,
  style,
  ...props
}) => {
  const radius = shape === "rect" ? 0 : shape === "capsule" ? 999 : cornerRadius;
  const borderStyle: StyleProp<ViewStyle> = [{ borderRadius: radius }, style];

  if (Platform.OS === "ios" && isIOS26Plus) {
    const glassEffectStyle: "regular" | "clear" = "regular"; // simple mapping for now
    return (
      <GlassView
        glassEffectStyle={glassEffectStyle}
        tintColor={tintColor}
        isInteractive={!!isInteractive}
        style={borderStyle}
        {...props}
      >
        {children}
      </GlassView>
    );
  }

  // Fallback: transparent wrapper on non‑iOS or older iOS
  return (
    <View style={borderStyle} {...props}>
      {children}
    </View>
  );
};

export const useLiquidGlassCapabilities = () => {
  const isSupported = Platform.OS === "ios" && isIOS26Plus;
  return {
    capabilities: {
      available: isSupported,
      supportsLiquidGlass: isSupported,
      supportsGlassEffectContainer: isSupported,
      supportsEnvironmentalAdaptation: isSupported,
    },
    loading: false,
    isSupported,
    supportsNativeLiquidGlass: isSupported,
    iosVersion: Platform.Version,
  } as const;
};

export const LiquidGlassButton: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassWrapper variant="interactive" shape="capsule" isInteractive {...props} />
);

export const LiquidGlassCard: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassWrapper variant="regular" shape="roundedRect" cornerRadius={16} {...props} />
);

export const LiquidGlassNavBar: React.FC<LiquidGlassProps> = (props) => (
  <LiquidGlassWrapper variant="prominent" shape="rect" {...props} />
);

