/**
 * useGlassTheme - Unified Glass Theme Hook
 *
 * Bridges Expo theme system with iOS 26 Liquid Glass material parameters.
 * Provides a single source of truth for glass-aware design tokens and styling.
 *
 * Architecture:
 * - Combines AppTheme colors with LiquidGlass capabilities
 * - Provides iOS 26-specific material parameters when available
 * - Falls back gracefully to standard blur effects on older iOS
 * - Returns non-glass surfaces on Android/Web
 *
 * Usage:
 * ```tsx
 * const { colors, glass, materials, getGlassStyle } = useGlassTheme();
 *
 * // Apply glass container with proper material
 * <View style={getGlassStyle('container', 'regular')} />
 *
 * // Check capability
 * if (glass.supportsLiquidGlass) { ... }
 * ```
 *
 * @author DNSChat Team
 * @since 2.1.0 (Phase 0 - Liquid Glass UI Redesign)
 */

import { useMemo } from "react";
import { Platform, ViewStyle } from "react-native";
import { useAppTheme, AppThemeColors } from "../theme/AppThemeContext";
import { useLiquidGlassAvailability, LiquidGlassVersion } from "../components/glass/GlassCapabilityBridge";

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

/**
 * iOS 26 Liquid Glass material variants
 * Aligned with Apple's SwiftUI .glassEffect() API
 */
export type GlassMaterial = "regular" | "prominent" | "interactive";

/**
 * Glass shape variants matching iOS design patterns
 */
export type GlassShape = "capsule" | "rect" | "roundedRect";

/**
 * Glass container types for different UI contexts
 */
export type GlassContainerType = "container" | "card" | "button" | "navbar" | "tabbar" | "sheet";

/**
 * iOS 26 material parameters
 * These map to native SwiftUI GlassEffect properties
 */
export interface GlassMaterialParameters {
  /** Base material variant */
  variant: GlassMaterial;

  /** Background tint color (RGBA) */
  tintColor: string;

  /** Border color for glass containers */
  borderColor: string;

  /** Shadow properties for depth */
  shadow: {
    color: string;
    offset: { width: number; height: number };
    opacity: number;
    radius: number;
  };

  /** Blur intensity (CSS px value for fallback) */
  blurRadius: number;

  /** Container spacing for glass merging */
  containerSpacing: number;
}

/**
 * Glass capability and theme integration
 */
export interface GlassThemeCapabilities {
  /** Whether any glass effects are available */
  available: boolean;

  /** iOS 26+ Liquid Glass specifically */
  supportsLiquidGlass: boolean;

  /** iOS 17-25 standard glass */
  supportsStandardGlass: boolean;

  /** Platform fallback mode */
  isFallback: boolean;

  /** Current glass version */
  version: LiquidGlassVersion;

  /** Loading state */
  loading: boolean;
}

/**
 * Complete glass theme context
 */
export interface GlassTheme {
  /** Standard app theme colors */
  colors: AppThemeColors;

  /** Glass capability information */
  glass: GlassThemeCapabilities;

  /** iOS 26 material parameter presets */
  materials: {
    regular: GlassMaterialParameters;
    prominent: GlassMaterialParameters;
    interactive: GlassMaterialParameters;
  };

  /** Helper to get glass style for a container type */
  getGlassStyle: (
    containerType: GlassContainerType,
    material?: GlassMaterial,
    shape?: GlassShape,
  ) => ViewStyle;

  /** Helper to determine if glass should be used */
  shouldUseGlass: () => boolean;
}

// ==================================================================================
// MATERIAL PARAMETER BUILDERS
// ==================================================================================

/**
 * Build iOS 26 material parameters for a given variant
 */
function buildMaterialParameters(
  variant: GlassMaterial,
  isDark: boolean,
  supportsLiquidGlass: boolean,
): GlassMaterialParameters {
  // iOS 26+ Liquid Glass materials
  if (supportsLiquidGlass) {
    switch (variant) {
      case "prominent":
        return {
          variant,
          tintColor: isDark ? "rgba(40, 40, 42, 0.98)" : "rgba(255, 255, 255, 0.88)",
          borderColor: isDark ? "rgba(255, 255, 255, 0.22)" : "rgba(0, 0, 0, 0.12)",
          shadow: {
            color: "#000000",
            offset: { width: 0, height: isDark ? 16 : 12 },
            opacity: isDark ? 0.7 : 0.2,
            radius: isDark ? 32 : 24,
          },
          blurRadius: 24,
          containerSpacing: 40,
        };

      case "interactive":
        return {
          variant,
          tintColor: isDark ? "rgba(255, 69, 58, 0.35)" : "rgba(0, 122, 255, 0.3)",
          borderColor: isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.15)",
          shadow: {
            color: isDark ? "#FF453A" : "#0A84FF",
            offset: { width: 0, height: isDark ? 12 : 8 },
            opacity: isDark ? 0.5 : 0.25,
            radius: isDark ? 28 : 22,
          },
          blurRadius: 20,
          containerSpacing: 40,
        };

      case "regular":
      default:
        return {
          variant,
          tintColor: isDark ? "rgba(28, 28, 30, 0.95)" : "rgba(248, 249, 250, 0.85)",
          borderColor: isDark ? "rgba(255, 255, 255, 0.18)" : "rgba(0, 0, 0, 0.1)",
          shadow: {
            color: "#000000",
            offset: { width: 0, height: isDark ? 12 : 8 },
            opacity: isDark ? 0.6 : 0.15,
            radius: isDark ? 24 : 18,
          },
          blurRadius: 20,
          containerSpacing: 40,
        };
    }
  }

  // iOS 17-25 standard glass fallback (less dramatic)
  switch (variant) {
    case "prominent":
      return {
        variant,
        tintColor: isDark ? "rgba(40, 40, 42, 0.92)" : "rgba(255, 255, 255, 0.78)",
        borderColor: isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.1)",
        shadow: {
          color: "#000000",
          offset: { width: 0, height: isDark ? 10 : 8 },
          opacity: isDark ? 0.5 : 0.15,
          radius: isDark ? 20 : 16,
        },
        blurRadius: 18,
        containerSpacing: 32,
      };

    case "interactive":
      return {
        variant,
        tintColor: isDark ? "rgba(255, 69, 58, 0.28)" : "rgba(0, 122, 255, 0.22)",
        borderColor: isDark ? "rgba(255, 255, 255, 0.18)" : "rgba(0, 0, 0, 0.12)",
        shadow: {
          color: isDark ? "#FF453A" : "#0A84FF",
          offset: { width: 0, height: isDark ? 8 : 6 },
          opacity: isDark ? 0.4 : 0.2,
          radius: isDark ? 20 : 16,
        },
        blurRadius: 16,
        containerSpacing: 32,
      };

    case "regular":
    default:
      return {
        variant,
        tintColor: isDark ? "rgba(28, 28, 30, 0.88)" : "rgba(248, 249, 250, 0.75)",
        borderColor: isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(0, 0, 0, 0.08)",
        shadow: {
          color: "#000000",
          offset: { width: 0, height: isDark ? 8 : 6 },
          opacity: isDark ? 0.4 : 0.12,
          radius: isDark ? 18 : 14,
        },
        blurRadius: 16,
        containerSpacing: 32,
      };
  }
}

/**
 * Get corner radius for a given shape
 */
function getShapeRadius(shape: GlassShape, containerType: GlassContainerType): number {
  switch (shape) {
    case "capsule":
      return containerType === "button" ? 24 : 28;
    case "roundedRect":
      return containerType === "card" ? 16 : containerType === "sheet" ? 20 : 12;
    case "rect":
      return 0;
    default:
      return 12;
  }
}

// ==================================================================================
// MAIN HOOK
// ==================================================================================

/**
 * Unified glass theme hook
 * Combines app theme with glass capabilities and iOS 26 material parameters
 */
export function useGlassTheme(): GlassTheme {
  const appTheme = useAppTheme();
  const glassAvailability = useLiquidGlassAvailability();

  // Build material parameters for each variant
  const materials = useMemo(() => {
    const supportsLiquidGlass = glassAvailability.version === "ios26";

    return {
      regular: buildMaterialParameters("regular", appTheme.isDark, supportsLiquidGlass),
      prominent: buildMaterialParameters("prominent", appTheme.isDark, supportsLiquidGlass),
      interactive: buildMaterialParameters("interactive", appTheme.isDark, supportsLiquidGlass),
    };
  }, [appTheme.isDark, glassAvailability.version]);

  // Build glass capabilities object
  const glass: GlassThemeCapabilities = useMemo(() => ({
    available: glassAvailability.available,
    supportsLiquidGlass: glassAvailability.version === "ios26",
    supportsStandardGlass: glassAvailability.version === "ios17",
    isFallback: glassAvailability.version === "fallback",
    version: glassAvailability.version,
    loading: glassAvailability.loading,
  }), [glassAvailability]);

  // Helper: Get glass style for a container type
  const getGlassStyle = useMemo(() => {
    return (
      containerType: GlassContainerType,
      material: GlassMaterial = "regular",
      shape: GlassShape = "roundedRect",
    ): ViewStyle => {
      // Non-iOS or fallback: return solid surface
      if (!glass.available || glass.isFallback) {
        const baseStyle: ViewStyle = {
          backgroundColor: appTheme.colors.card,
          borderRadius: getShapeRadius(shape, containerType),
          borderWidth: 1,
          borderColor: appTheme.colors.border,
        };

        // Add elevation for cards/sheets
        if (containerType === "card" || containerType === "sheet") {
          return {
            ...baseStyle,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: appTheme.isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 3,
          };
        }

        return baseStyle;
      }

      // Glass available: use material parameters
      const params = materials[material];

      const glassStyle: ViewStyle = {
        backgroundColor: params.tintColor,
        borderRadius: getShapeRadius(shape, containerType),
        borderWidth: glass.supportsLiquidGlass ? 2 : 1,
        borderColor: params.borderColor,
        shadowColor: params.shadow.color,
        shadowOffset: params.shadow.offset,
        shadowOpacity: params.shadow.opacity,
        shadowRadius: params.shadow.radius,
        elevation: glass.supportsLiquidGlass ? 12 : 8,
      };

      // Add iOS-specific overflow handling
      if (Platform.OS === "ios") {
        return {
          ...glassStyle,
          overflow: "hidden",
        };
      }

      return glassStyle;
    };
  }, [glass, materials, appTheme]);

  // Helper: Determine if glass should be used
  const shouldUseGlass = useMemo(() => {
    return () => {
      // Always respect loading state
      if (glass.loading) return false;

      // Use glass on iOS with capability support
      return Platform.OS === "ios" && glass.available && !glass.isFallback;
    };
  }, [glass]);

  return {
    colors: appTheme.colors,
    glass,
    materials,
    getGlassStyle,
    shouldUseGlass,
  };
}

// ==================================================================================
// CONVENIENCE HOOKS
// ==================================================================================

/**
 * Quick access to glass capabilities
 */
export function useGlassCapabilities(): GlassThemeCapabilities {
  const { glass } = useGlassTheme();
  return glass;
}

/**
 * Quick access to material parameters
 */
export function useGlassMaterials() {
  const { materials } = useGlassTheme();
  return materials;
}

/**
 * Quick access to glass style helper
 */
export function useGlassStyle() {
  const { getGlassStyle } = useGlassTheme();
  return getGlassStyle;
}
