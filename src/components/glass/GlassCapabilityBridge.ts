import { useMemo } from "react";
import { Platform } from "react-native";
import { useLiquidGlassCapabilities } from "../LiquidGlassWrapper";
import type { LiquidGlassCapabilities } from "../../utils/liquidGlass";

export type LiquidGlassVersion = "ios26" | "ios17" | "fallback";

export interface LiquidGlassAvailability {
  available: boolean;
  loading: boolean;
  version: LiquidGlassVersion;
  supportsNativeGlass: boolean;
  supportsSwiftUIGlass: boolean;
  capabilities: LiquidGlassCapabilities | null;
}

export const useLiquidGlassAvailability = (): LiquidGlassAvailability => {
  const { capabilities, loading, supportsSwiftUIGlass } = useLiquidGlassCapabilities();

  return useMemo(() => {
    if (loading) {
      const availability: LiquidGlassAvailability = {
        available: false,
        loading: true,
        version: "fallback",
        supportsNativeGlass: false,
        supportsSwiftUIGlass: false,
        capabilities: capabilities ?? null,
      };
      return availability;
    }

    const normalizedCapabilities: LiquidGlassCapabilities | null = capabilities ?? null;

    if (
      !normalizedCapabilities ||
      Platform.OS !== "ios" ||
      normalizedCapabilities.platform !== "ios"
    ) {
      const availability: LiquidGlassAvailability = {
        available: false,
        loading: false,
        version: "fallback",
        supportsNativeGlass: false,
        supportsSwiftUIGlass: false,
        capabilities: normalizedCapabilities,
      };
      return availability;
    }

    const { apiLevel, isSupported } = normalizedCapabilities;

    if (apiLevel >= 260 && isSupported) {
      const availability: LiquidGlassAvailability = {
        available: true,
        loading: false,
        version: "ios26",
        supportsNativeGlass: true,
        supportsSwiftUIGlass,
        capabilities: normalizedCapabilities,
      };
      return availability;
    }

    if (apiLevel >= 170) {
      const availability: LiquidGlassAvailability = {
        available: true,
        loading: false,
        version: "ios17",
        supportsNativeGlass: false,
        supportsSwiftUIGlass: false,
        capabilities: normalizedCapabilities,
      };
      return availability;
    }

    const availability: LiquidGlassAvailability = {
      available: false,
      loading: false,
      version: "fallback",
      supportsNativeGlass: false,
      supportsSwiftUIGlass: false,
      capabilities: normalizedCapabilities,
    };
    return availability;
  }, [capabilities, loading, supportsSwiftUIGlass]);
};
