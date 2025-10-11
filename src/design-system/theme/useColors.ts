/**
 * React hook for accessing theme colors
 * Automatically detects system color scheme
 */

import { useColorScheme } from 'react-native';
import { getColors, Colors, ColorScheme } from './colors';

export function useColors(): Colors {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  return getColors(scheme);
}

export type { Colors, ColorScheme };