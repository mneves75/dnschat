/**
 * Color theme definitions for the app
 * Supports light/dark themes with proper contrast ratios
 */

export interface Colors {
  // Primary colors
  primary: string;
  primaryForeground: string;

  // Surface colors (for cards, backgrounds)
  surface: string;
  surfaceForeground: string;
  surfaceBorder: string;

  // Background colors
  background: string;
  foreground: string;

  // Secondary colors
  secondary: string;
  secondaryForeground: string;

  // Muted colors
  muted: string;
  mutedForeground: string;

  // Accent colors
  accent: string;
  accentForeground: string;

  // Status colors
  destructive: string;
  destructiveForeground: string;
  success: string;
  warning: string;

  // Glass specific colors
  glassBackground: string;
  glassBorder: string;

  // Platform specific
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
}

const lightColors: Colors = {
  primary: '#007AFF',
  primaryForeground: '#FFFFFF',

  surface: '#FFFFFF',
  surfaceForeground: '#000000',
  surfaceBorder: '#E5E5EA',

  background: '#F2F2F7',
  foreground: '#000000',

  secondary: '#F2F2F7',
  secondaryForeground: '#000000',

  muted: '#8E8E93',
  mutedForeground: '#8E8E93',

  accent: '#E5E5EA',
  accentForeground: '#000000',

  destructive: '#FF3B30',
  destructiveForeground: '#FFFFFF',
  success: '#34C759',
  warning: '#FF9500',

  glassBackground: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',

  tabBarBackground: 'rgba(255, 255, 255, 0.9)',
  tabBarActive: '#007AFF',
  tabBarInactive: '#8E8E93',
};

const darkColors: Colors = {
  primary: '#007AFF',
  primaryForeground: '#FFFFFF',

  surface: '#1C1C1E',
  surfaceForeground: '#FFFFFF',
  surfaceBorder: '#38383A',

  background: '#000000',
  foreground: '#FFFFFF',

  secondary: '#2C2C2E',
  secondaryForeground: '#FFFFFF',

  muted: '#8E8E93',
  mutedForeground: '#8E8E93',

  accent: '#38383A',
  accentForeground: '#FFFFFF',

  destructive: '#FF453A',
  destructiveForeground: '#FFFFFF',
  success: '#30D158',
  warning: '#FF9F0A',

  glassBackground: 'rgba(28, 28, 30, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  tabBarBackground: 'rgba(28, 28, 30, 0.9)',
  tabBarActive: '#007AFF',
  tabBarInactive: '#8E8E93',
};

export type ColorScheme = 'light' | 'dark';

export function getColors(scheme: ColorScheme): Colors {
  return scheme === 'dark' ? darkColors : lightColors;
}