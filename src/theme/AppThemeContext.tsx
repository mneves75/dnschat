import React, { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { ColorSchemeName, useColorScheme, Platform } from "react-native";
import { useLiquidGlassCapabilities } from "../components/LiquidGlassWrapper";

// Glass color calculation utility
const calculateGlassColors = (isDark: boolean, glassAvailable: boolean) => {
  if (!glassAvailable) {
    return {
      glassTint: isDark ? "rgba(28, 28, 30, 0.55)" : "rgba(255, 255, 255, 0.45)",
      glassHighlight: isDark ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.75)",
    };
  }

  return {
    glassTint: isDark ? "rgba(28, 28, 30, 0.55)" : "rgba(255, 255, 255, 0.45)",
    glassHighlight: isDark ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.75)",
  };
};

export interface AppThemeColors {
  background: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  glassTint: string;
  glassHighlight: string;
}

export interface AppTheme {
  isDark: boolean;
  colors: AppThemeColors;
}

const lightPalette: Omit<AppThemeColors, 'glassTint' | 'glassHighlight'> = {
  background: "#F2F2F7",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#D1D1D6",
  text: "#1C1C1E",
  muted: "#6E6E73",
  accent: "#0060DF",
  success: "#34C759",
  warning: "#FF9F0A",
  danger: "#FF453A",
};

const darkPalette: Omit<AppThemeColors, 'glassTint' | 'glassHighlight'> = {
  background: "#000000",
  surface: "#1C1C1E",
  card: "#1C1C1E",
  border: "#2C2C2E",
  text: "#F2F2F7",
  muted: "#8E8E93",
  accent: "#0A84FF",
  success: "#30D158",
  warning: "#FFD60A",
  danger: "#FF453A",
};

function selectPalette(colorScheme: ColorSchemeName, glassAvailable: boolean = false): AppTheme {
  const isDark = colorScheme === "dark";
  const baseColors = isDark ? darkPalette : lightPalette;

  // Dynamically calculate glass colors based on availability
  const glassColors = calculateGlassColors(isDark, glassAvailable);

  return {
    isDark,
    colors: {
      ...baseColors,
      ...glassColors,
    },
  };
}

const AppThemeContext = createContext<AppTheme>(selectPalette("light"));

export function AppThemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const { isSupported, supportsSwiftUIGlass } = useLiquidGlassCapabilities();
  const glassAvailable = Platform.OS === "ios" && Boolean(isSupported || supportsSwiftUIGlass);

  const theme = useMemo(() => selectPalette(colorScheme, glassAvailable), [colorScheme, glassAvailable]);

  return (
    <AppThemeContext.Provider value={theme}>{children}</AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppTheme {
  const theme = useContext(AppThemeContext);
  if (!theme) {
    throw new Error("useAppTheme must be used within an AppThemeProvider");
  }
  return theme;
}

export function createNavigationTheme(appTheme: AppTheme) {
  return {
    dark: appTheme.isDark,
    colors: {
      background: appTheme.colors.background,
      card: appTheme.colors.card,
      border: appTheme.colors.border,
      text: appTheme.colors.text,
      notification: appTheme.colors.accent,
      primary: appTheme.colors.accent,
    },
  };
}

export function useLegacyNavigationTheme() {
  const appTheme = useAppTheme();
  return useMemo(() => createNavigationTheme(appTheme), [appTheme]);
}
