import type { ColorValue } from "react-native";

type SystemColors = Record<string, ColorValue | undefined>;

const EMPTY: SystemColors = {
  background: undefined,
  textPrimary: undefined,
  textSecondary: undefined,
  textTertiary: undefined,
  separator: undefined,
  destructive: undefined,
  success: undefined,
  warning: undefined,
};

function resolve(): SystemColors {
  try {
    const { Platform } = require("react-native");
    const { Color } = require("expo-router");
    if (!Color || typeof Platform?.select !== "function") return EMPTY;

    const ios = (Color["ios"] ?? {}) as SystemColors;
    const android = (Color["android"] ?? {}) as Record<string, unknown>;
    const dynamic = (android["dynamic"] ?? {}) as SystemColors;
    const attr = (android["attr"] ?? {}) as SystemColors;

    return {
      background: Platform.select({ ios: ios["systemGroupedBackground"], android: dynamic["surface"], default: undefined }),
      textPrimary: Platform.select({ ios: ios["label"], android: attr["colorOnSurface"], default: undefined }),
      textSecondary: Platform.select({ ios: ios["secondaryLabel"], default: undefined }),
      textTertiary: Platform.select({ ios: ios["tertiaryLabel"], default: undefined }),
      separator: Platform.select({ ios: ios["separator"], default: undefined }),
      destructive: Platform.select({ ios: ios["systemRed"], default: undefined }),
      success: Platform.select({ ios: ios["systemGreen"], default: undefined }),
      warning: Platform.select({ ios: ios["systemOrange"], default: undefined }),
    };
  } catch {
    return EMPTY;
  }
}

export const systemColors = resolve();
