import { useColorScheme } from "react-native";
import { useAccessibility } from "../../context/AccessibilityContext";

export interface IMessagePalette {
  background: string;
  backgroundSecondary: string;
  surface: string;
  accentSurface: string;
  solid: string;
  border: string;
  accentBorder: string;
  tint: string;
  accentTint: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  highlight: string;
  destructive: string;
  success: string;
  warning: string;
  separator: string;
  transparent: string;
}

export const IMESSAGE_LIGHT: IMessagePalette = {
  background: "#F2F2F7", // systemGroupedBackground
  backgroundSecondary: "#FFFFFF", // grouped cell background
  surface: "rgba(255,255,255,0.82)",
  accentSurface: "rgba(10,132,255,0.32)",
  solid: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
  accentBorder: "rgba(10,132,255,0.35)",
  tint: "rgba(255,255,255,0.65)",
  accentTint: "rgba(10,132,255,0.55)",
  textPrimary: "#000000",
  textSecondary: "#6D6D70",
  textTertiary: "#8E8E93",
  highlight: "rgba(0,0,0,0.04)",
  destructive: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
  separator: "rgba(60,60,67,0.15)",
  transparent: "transparent",
};

export const IMESSAGE_DARK: IMessagePalette = {
  background: "#000000", // systemGroupedBackground Dark
  backgroundSecondary: "#1C1C1E", // grouped cell background dark
  surface: "rgba(44,44,46,0.75)",
  accentSurface: "rgba(10,132,255,0.40)",
  solid: "#1C1C1E",
  border: "rgba(235,235,245,0.12)",
  accentBorder: "rgba(10,132,255,0.55)",
  tint: "rgba(76,76,80,0.55)",
  accentTint: "rgba(10,132,255,0.65)",
  textPrimary: "#FFFFFF",
  textSecondary: "#AEAEB2",
  textTertiary: "#8E8E93",
  highlight: "rgba(255,255,255,0.06)",
  destructive: "#FF453A",
  success: "#32D74B",
  warning: "#FF9F0A",
  separator: "rgba(84,84,88,0.6)",
  transparent: "transparent",
};

export interface GetPaletteOptions {
  highContrast?: boolean;
}

export const getImessagePalette = (
  isDark: boolean,
  options: GetPaletteOptions = {},
): IMessagePalette => {
  const base = isDark ? IMESSAGE_DARK : IMESSAGE_LIGHT;

  if (!options.highContrast) {
    return base;
  }

  // Slightly boost contrast for high contrast accessibility mode.
  return {
    ...base,
    surface: isDark ? "rgba(44,44,46,0.9)" : "rgba(255,255,255,0.92)",
    accentSurface: isDark
      ? "rgba(10,132,255,0.55)"
      : "rgba(10,132,255,0.45)",
    border: isDark ? "rgba(235,235,245,0.25)" : "rgba(0,0,0,0.18)",
    accentBorder: isDark
      ? "rgba(10,132,255,0.75)"
      : "rgba(10,132,255,0.55)",
    tint: isDark ? "rgba(76,76,80,0.75)" : "rgba(255,255,255,0.85)",
    accentTint: isDark
      ? "rgba(10,132,255,0.85)"
      : "rgba(10,132,255,0.75)",
  };
};

export const useImessagePalette = () => {
  const colorScheme = useColorScheme();
  const { isHighContrastEnabled } = useAccessibility();
  const isDark = colorScheme === "dark";

  return getImessagePalette(isDark, { highContrast: isHighContrastEnabled });
};
