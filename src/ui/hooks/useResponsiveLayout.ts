/**
 * useResponsiveLayout - Adaptive sizing for phone / tablet / desktop-web
 *
 * Returns layout primitives derived from the current window dimensions so
 * screens can adapt without re-implementing the breakpoints inline.
 *
 * Breakpoints follow Material Design / Apple iPad guidance:
 *   - phone   : width < 600 (compact)
 *   - tablet  : 600 <= width < 1024 (medium / iPad)
 *   - desktop : width >= 1024 (web large)
 */

import { useWindowDimensions } from 'react-native';

export type ResponsiveSize = 'phone' | 'tablet' | 'desktop';

export interface ResponsiveLayout {
  size: ResponsiveSize;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** Width of the active window (kept for memoization friendliness). */
  width: number;
  height: number;
  /** Recommended max-width for chat bubbles (75% phone, 60% tablet, 560px desktop). */
  messageMaxWidth: number | `${number}%`;
  /** Recommended tab/icon size for the web tab bar. */
  tabIconSize: number;
}

const PHONE_BREAKPOINT = 600;
const DESKTOP_BREAKPOINT = 1024;

export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();

  const isPhone = width < PHONE_BREAKPOINT;
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const isTablet = !isPhone && !isDesktop;

  const size: ResponsiveSize = isDesktop
    ? 'desktop'
    : isTablet
      ? 'tablet'
      : 'phone';

  const messageMaxWidth: number | `${number}%` = isDesktop
    ? 560
    : isTablet
      ? '60%'
      : '75%';

  const tabIconSize = isDesktop ? 28 : isTablet ? 26 : 22;

  return {
    size,
    isPhone,
    isTablet,
    isDesktop,
    width,
    height,
    messageMaxWidth,
    tabIconSize,
  };
}

export default useResponsiveLayout;
