import React, { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

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

const lightPalette: AppThemeColors = {
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
  glassTint: "rgba(255, 255, 255, 0.45)",
  glassHighlight: "rgba(255, 255, 255, 0.75)",
};

const darkPalette: AppThemeColors = {
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
  glassTint: "rgba(28, 28, 30, 0.55)",
  glassHighlight: "rgba(255, 255, 255, 0.18)",
};

function selectPalette(colorScheme: ColorSchemeName): AppTheme {
  const isDark = colorScheme === "dark";
  return {
    isDark,
    colors: isDark ? darkPalette : lightPalette,
  };
}

const AppThemeContext = createContext<AppTheme>(selectPalette("light"));

export function AppThemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();

  const theme = useMemo(() => selectPalette(colorScheme), [colorScheme]);

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
