import { Platform } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

const IOS_TAB_BAR_HEIGHT = 49;

interface KeyboardOffsetOptions {
  /** Safe area values, typically from useSafeAreaInsets */
  insets?: EdgeInsets;
  /** Height of the tab bar if visible */
  tabBarHeight?: number;
  /** Additional manual offset */
  extraOffset?: number;
}

/**
 * Compute a keyboard avoiding offset that accounts for safe areas and tab bars.
 */
export function getKeyboardVerticalOffset({
  insets,
  tabBarHeight = IOS_TAB_BAR_HEIGHT,
  extraOffset = 0,
}: KeyboardOffsetOptions = {}): number {
  if (Platform.OS !== 'ios') {
    return extraOffset;
  }

  const bottomInset = insets?.bottom ?? 0;
  return bottomInset + tabBarHeight + extraOffset;
}
