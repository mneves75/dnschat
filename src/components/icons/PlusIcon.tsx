import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { devWarn } from "../../utils/devLog";

interface PlusIconProps {
  size?: number;
  /**
   * Color of the plus symbol. Defaults to white, which provides proper contrast
   * against the blue circular background in both light and dark modes.
   */
  color?: string;
  /**
   * @deprecated Use semantic colors from theme palette instead.
   * This prop is kept for backward compatibility but will be removed.
   * The icon now automatically uses palette.accentTint for iOS 26 HIG compliance.
   */
  circleColor?: string;
}

/**
 * Plus icon following iOS 26 Human Interface Guidelines.
 *
 * **Design System Compliance**:
 * - Uses semantic `accentTint` color that adapts to light/dark mode
 * - Light mode: rgba(10,132,255,0.55) - softer, matches systemBlue
 * - Dark mode: rgba(10,132,255,0.65) - more vibrant for better visibility
 * - High contrast mode: Automatically increased opacity for accessibility
 *
 * **Accessibility**:
 * - Minimum 44pt touch target required when used in buttons
 * - White plus symbol provides 4.5:1 contrast ratio against blue background
 * - Adapts to system color scheme and accessibility settings
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/color
 * @see src/ui/theme/imessagePalette.ts for semantic color definitions
 */
export function PlusIcon({
  size = 24,
  color = "#FFFFFF",
  circleColor: deprecatedCircleColor,
}: PlusIconProps) {
  const palette = useImessagePalette();

  // Use semantic color from palette, ignoring deprecated prop
  // This ensures proper light/dark mode and high contrast support
  const circleColor = palette.accentTint;

  if (deprecatedCircleColor) {
    devWarn(
      "[PlusIcon] circleColor prop is deprecated; icon now uses semantic colors from the theme palette.",
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Circular background - uses semantic accentTint for iOS 26 HIG compliance */}
      <Circle cx="12" cy="12" r="11" fill={circleColor} />
      {/* Plus symbol - white provides proper contrast in all modes */}
      <Path
        d="M12 7v10M7 12h10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
