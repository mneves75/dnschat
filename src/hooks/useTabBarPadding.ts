/**
 * useTabBarPadding - Calculate bottom padding to clear FloatingGlassTabBar
 *
 * Provides dynamic bottom padding that accounts for:
 * - Floating glass tab bar height (49px)
 * - Bottom margin from screen edge (12px)
 * - iOS extra offset (12px)
 * - Breathing room above tab bar (8px)
 * - Device safe area insets (varies)
 *
 * Calculation:
 * Tab bar is positioned at: bottom = margin (12) + bottomInset + iOSOffset (12)
 * Tab bar height: 49px
 * Breathing room: 8px
 * Total: 12 + 12 + 49 + 8 + insets = 81 + insets
 *
 * @param enabled - Whether glass tab bar is active (default: auto-detect)
 * @returns Object with paddingBottom value
 *
 * @example
 * const padding = useTabBarPadding();
 * <FlashList contentContainerStyle={[styles.listContent, padding]} />
 *
 * @author DNSChat Team
 * @since 2.1.0 (Tab Bar Positioning Fix)
 */

import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLiquidGlassCapabilities } from '../components/LiquidGlassWrapper';
import { TAB_BAR_DIMENSIONS } from '../components/glass/GlassTabBar';

// Visual breathing room between content and tab bar
const BREATHING_ROOM = 8;

export function useTabBarPadding(enabled?: boolean) {
  const insets = useSafeAreaInsets();
  const { isSupported } = useLiquidGlassCapabilities();

  // Auto-detect if glass tab bar is enabled
  const glassEnabled = enabled ?? (Platform.OS === 'ios' && Boolean(isSupported));

  if (!glassEnabled) {
    // Standard bottom padding when glass tab bar is not used
    return { paddingBottom: 16 };
  }

  // Calculate total clearance needed for floating tab bar
  // Tab bar bottom position: margin + iOSOffset + insets
  // Tab bar height: 49px
  // Plus breathing room: 8px
  const paddingBottom =
    TAB_BAR_DIMENSIONS.BASE_MARGIN +           // Bottom margin (12)
    TAB_BAR_DIMENSIONS.IOS_EXTRA_OFFSET +      // iOS positioning offset (12)
    TAB_BAR_DIMENSIONS.HEIGHT +                // Tab bar height (49)
    BREATHING_ROOM +                           // Visual spacing (8)
    insets.bottom;                             // Device safe area inset

  return { paddingBottom };
}
