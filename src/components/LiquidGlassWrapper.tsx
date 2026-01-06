import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  View,
  useColorScheme,
} from "react-native";
import type { ViewProps } from "react-native";
import {
  GlassView,
  GlassContainer,
  isLiquidGlassAvailable as expoIsLiquidGlassAvailable,
} from "expo-glass-effect";
import { getImessagePalette } from "../ui/theme/imessagePalette";

type GlassVariant = "regular" | "prominent" | "interactive";

type GlassShape = "capsule" | "rect" | "roundedRect";

const MIN_IOS_GLASS_VERSION = 26;

type GlassAvailabilityReason =
  | "expo"
  | "ios-version"
  | "ios-version-too-low"
  | "unsupported-platform";

interface GlassAvailability {
  available: boolean;
  reason: GlassAvailabilityReason;
  iosMajorVersion: number | null;
}

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

  const r = match[1];
  const g = match[2];
  const b = match[3];
  if (!r || !g || !b) {
    return color;
  }

  return `rgb(${r.trim()}, ${g.trim()}, ${b.trim()})`;
};

const parseIosMajorVersion = (): number => {
  if (Platform.OS !== "ios") {
    return 0;
  }

  const version = Platform.Version;

  if (typeof version === "string") {
    const match = version.match(/^(\d+)/);
    const raw = match?.[1];
    if (raw) {
      const parsed = parseInt(raw, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  if (typeof version === "number") {
    return Math.floor(version);
  }

  return 0;
};

const computeGlassAvailability = (): GlassAvailability => {
  if (Platform.OS !== "ios") {
    return {
      available: false,
      reason: "unsupported-platform",
      iosMajorVersion: null,
    };
  }

  const iosMajorVersion = parseIosMajorVersion();

  try {
    if (expoIsLiquidGlassAvailable()) {
      return {
        available: true,
        reason: "expo",
        iosMajorVersion,
      };
    }
  } catch {
    // expoIsLiquidGlassAvailable should be safe, but guard just in case.
  }

  if (iosMajorVersion >= MIN_IOS_GLASS_VERSION) {
    return {
      available: true,
      reason: "ios-version",
      iosMajorVersion,
    };
  }

  return {
    available: false,
    reason: "ios-version-too-low",
    iosMajorVersion,
  };
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
  // On Android, always use opaque colors since there's no glass blur effect
  // Semi-transparent colors without blur just look like gray boxes
  const forceOpaque = options.forceOpaque ?? Platform.OS === "android";

  // Use solid colors on Android for better appearance without glass effects
  const getBackgroundColor = () => {
    if (Platform.OS === "android") {
      // Android: use solid background colors
      if (variant === "interactive" || variant === "prominent") {
        return isDark ? "#1A3A5C" : "#E3F0FF"; // Solid accent surface
      }
      return palette.solid; // Solid surface (white or dark gray)
    }
    // iOS: use semi-transparent for potential glass effect fallback
    return variant === "interactive" || variant === "prominent"
      ? palette.accentSurface
      : palette.surface;
  };

  const getBorderColor = () => {
    if (Platform.OS === "android") {
      if (variant === "interactive" || variant === "prominent") {
        return isDark ? "#3A8FFF" : "#007AFF"; // Solid accent border
      }
      return isDark ? "#3A3A3C" : "#C6C6C8"; // Solid border
    }
    return variant === "interactive" || variant === "prominent"
      ? palette.accentBorder
      : palette.border;
  };

  const backgroundColor = getBackgroundColor();
  const borderColor = getBorderColor();

  const normalizeColor = (value: string) =>
    forceOpaque ? ensureOpaqueColor(value) : value;

  // Android-specific: use elevation instead of shadows
  if (Platform.OS === "android") {
    return {
      backgroundColor: normalizeColor(backgroundColor),
      borderRadius: shapeRadius(shape, cornerRadius),
      borderWidth: 1,
      borderColor: normalizeColor(borderColor),
      overflow: "hidden" as const,
      elevation: isInteractive ? 4 : 2,
    };
  }

  // iOS: use shadow properties
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
  return computeGlassAvailability().available;
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

  // Effect: sync reduce-transparency accessibility setting on iOS.
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

  const baseContainerStyle = { borderRadius: radius };

  const fallbackStyle = buildFallbackStyle(
    variant,
    isDark,
    shape,
    cornerRadius,
    isInteractive,
    { forceOpaque: reduceTransparency },
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
  const [availability, setAvailability] = useState<GlassAvailability>(
    () => computeGlassAvailability(),
  );
  const [loading, setLoading] = useState(Platform.OS === "ios");
  const [reduceTransparency, setReduceTransparency] = useState(false);

  // Effect: compute glass capability and watch reduce-transparency changes on iOS.
  useEffect(() => {
    if (Platform.OS !== "ios") {
      setAvailability({
        available: false,
        reason: "unsupported-platform",
        iosMajorVersion: null,
      });
      setLoading(false);
      return;
    }

    const updateAvailability = () => {
      setAvailability(computeGlassAvailability());
    };

    updateAvailability();
    setLoading(false);

    const handleReduceTransparency = (value: boolean) => {
      setReduceTransparency(Boolean(value));
    };

    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      handleReduceTransparency,
    );

    AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      handleReduceTransparency(Boolean(value));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const supports = availability.available && !reduceTransparency;

  return {
    available: supports,
    loading,
    isSupported: Platform.OS === "ios" && supports,
    supportsLiquidGlass: supports,
    capabilitySource: availability.reason,
    iosMajorVersion: availability.iosMajorVersion,
    reduceTransparencyEnabled: reduceTransparency,
  };
};

export { expoIsLiquidGlassAvailable as isLiquidGlassAvailable };

export default LiquidGlassWrapper;
