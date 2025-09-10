import React, { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { darkColors, highContrastAdjust, lightColors, spacing, typography } from './tokens';
import { useThemeStore } from '../store/useSettingsStore';

export type AppTheme = {
  mode: 'light' | 'dark';
  highContrast: boolean;
  colors: typeof lightColors;
  spacing: typeof spacing;
  typography: typeof typography;
};

const ThemeContext = createContext<AppTheme | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useRNColorScheme();
  const selected = useThemeStore((s) => s.theme);
  const highContrast = useThemeStore((s) => s.highContrast);

  const mode = selected === 'system' ? (system === 'dark' ? 'dark' : 'light') : selected;
  const base = mode === 'dark' ? darkColors : lightColors;
  const colors = highContrast ? highContrastAdjust(base) : base;

  const value = useMemo<AppTheme>(
    () => ({ mode, highContrast, colors, spacing, typography }),
    [mode, highContrast, colors],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
