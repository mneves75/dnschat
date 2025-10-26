import React, { useEffect, useMemo, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  View,
  ViewProps,
  useColorScheme,
} from "react-native";
import {
  GlassView,
  GlassContainer,
  isLiquidGlassAvailable as expoIsLiquidGlassAvailable,
} from "expo-glass-effect";
import { getImessagePalette } from "../ui/theme/imessagePalette";

type GlassVariant = "regular" | "prominent" | "interactive";

type GlassShape = "capsule" | "rect" | "roundedRect";

export interface LiquidGlassProps extends ViewProps {
  variant?: GlassVariant;
  shape?: GlassShape;
  cornerRadius?: number;
  tintColor?: string;
  isInteractive?: boolean;
  enableContainer?: boolean;
  containerSpacing?: number;
  children?: React.ReactNode;
}

const shapeRadius = (shape: GlassShape, explicit?: number) => {
  switch (shape) {
    case "capsule":
      return 24;
    case "rect":
      return 0;
    case "roundedRect":
      return explicit ?? 16;
    default:
      return explicit ?? 16;
  }
};

const ensureOpaqueColor = (color: string) => {
  const match = color
    .trim()
    .match(
      /^rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i,
    );

  if (!match) {
    return color;
  }

  const [, r, g, b] = match;

  return `rgb(${r.trim()}, ${g.trim()}, ${b.trim()})`;
};

export const buildFallbackStyle = (
  variant: GlassVariant,
  isDark: boolean,
  shape: GlassShape,
  cornerRadius?: number,
  isInteractive?: boolean,
  options: { forceOpaque?: boolean } = {},
) => {
  const palette = getImessagePalette(isDark);
  const forceOpaque = options.forceOpaque ?? false;
  const backgroundColor =
    variant === "interactive" || variant === "prominent"
      ? palette.accentSurface
      : palette.surface;
  const borderColor =
    variant === "interactive" || variant === "prominent"
      ? palette.accentBorder
      : palette.border;

  const normalizeColor = (value: string) =>
    forceOpaque ? ensureOpaqueColor(value) : value;

  return {
    backgroundColor: normalizeColor(backgroundColor),
    borderRadius: shapeRadius(shape, cornerRadius),
    borderWidth: 1,
    borderColor: normalizeColor(borderColor),
    overflow: "hidden" as const,
    ...(isInteractive
      ? {
          shadowColor: "#0A84FF",
          shadowOpacity: isDark ? 0.35 : 0.25,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 10 },
        }
      : {
          shadowColor: "#000000",
          shadowOpacity: isDark ? 0.4 : 0.12,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: isDark ? 12 : 8 },
        }),
  };
};

const glassEffectForVariant = (variant: GlassVariant): "regular" | "clear" => {
  switch (variant) {
    case "regular":
      return "regular";
    case "prominent":
    case "interactive":
      return "regular";
    default:
      return "regular";
  }
};

const tintForVariant = (
  variant: GlassVariant,
  isDark: boolean,
  override?: string,
) => {
  if (override) return override;
  const palette = getImessagePalette(isDark);
  if (variant === "interactive" || variant === "prominent") {
    return palette.accentTint;
  }
  return palette.tint;
};

export const shouldUseGlassEffect = (reduceTransparency: boolean) => {
  if (reduceTransparency) return false;
  if (Platform.OS !== "ios") return false;
  // Expo API synchronous boolean; safe to call every render.
  if (!expoIsLiquidGlassAvailable()) return false;
  return true;
};

export const LiquidGlassWrapper: React.FC<LiquidGlassProps> = ({
  variant = "regular",
  shape = "roundedRect",
  cornerRadius,
  tintColor,
  isInteractive = false,
  enableContainer = false,
  containerSpacing = 12,
  style,
  children,
  ...rest
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    let isMounted = true;

    AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      if (isMounted) {
        setReduceTransparency(Boolean(value));
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparency,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const glassKey = isInteractive ? "interactive" : "static";
  const radius = shapeRadius(shape, cornerRadius);

  const baseContainerStyle = useMemo(
    () => ({
      borderRadius: radius,
    }),
    [radius],
  );

  const fallbackStyle = useMemo(
    () =>
      buildFallbackStyle(variant, isDark, shape, cornerRadius, isInteractive, {
        forceOpaque: reduceTransparency,
      }),
    [variant, isDark, shape, cornerRadius, isInteractive, reduceTransparency],
  );

  const tint = tintForVariant(variant, isDark, tintColor);
  const glassEffect = glassEffectForVariant(variant);

  const useGlass = shouldUseGlassEffect(reduceTransparency);

  if (!useGlass) {
    return (
      <View style={[baseContainerStyle, fallbackStyle, style]} {...rest}>
        {children}
      </View>
    );
  }

  const glassContent = (
    <GlassView
      key={glassKey}
      glassEffectStyle={glassEffect}
      isInteractive={isInteractive}
      tintColor={tint}
      style={[baseContainerStyle, style]}
      {...rest}
    >
      {children}
    </GlassView>
  );

  if (enableContainer) {
    return (
      <GlassContainer
        spacing={containerSpacing}
        style={[baseContainerStyle, style]}
      >
        {glassContent}
      </GlassContainer>
    );
  }

  return glassContent;
};

export const LiquidGlassButton: React.FC<LiquidGlassProps> = ({
  variant = "interactive",
  shape = "capsule",
  isInteractive = true,
  ...rest
}) => (
  <LiquidGlassWrapper
    variant={variant}
    shape={shape}
    isInteractive={isInteractive}
    {...rest}
  />
);

export const LiquidGlassCard: React.FC<LiquidGlassProps> = ({
  variant = "regular",
  shape = "roundedRect",
  cornerRadius = 16,
  enableContainer = true,
  ...rest
}) => (
  <LiquidGlassWrapper
    variant={variant}
    shape={shape}
    cornerRadius={cornerRadius}
    enableContainer={enableContainer}
    {...rest}
  />
);

export const LiquidGlassNavBar: React.FC<LiquidGlassProps> = ({
  variant = "prominent",
  shape = "rect",
  ...rest
}) => (
  <LiquidGlassWrapper
    variant={variant}
    shape={shape}
    enableContainer={true}
    containerSpacing={8}
    {...rest}
  />
);

export const useLiquidGlassCapabilities = () => {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(Platform.OS === "ios");
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      setAvailable(false);
      setLoading(false);
      return;
    }

    setAvailable(expoIsLiquidGlassAvailable());
    setLoading(false);

    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparency,
    );

    AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      setReduceTransparency(Boolean(value));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    available: available && !reduceTransparency,
    loading,
    isSupported: Platform.OS === "ios" && available && !reduceTransparency,
    supportsLiquidGlass: available && !reduceTransparency,
  };
};

export { expoIsLiquidGlassAvailable as isLiquidGlassAvailable };

export default LiquidGlassWrapper;
