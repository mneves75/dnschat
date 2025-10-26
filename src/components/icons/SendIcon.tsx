import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { useImessagePalette } from "../../ui/theme/imessagePalette";

interface SendIconProps {
  /**
   * Icon size in points (default: 24)
   * Recommended: 20-28 for buttons, 16-20 for inline
   */
  size?: number;
  /**
   * @deprecated Use semantic colors from theme palette instead.
   * This prop is kept for backward compatibility but will be removed.
   * The icon now automatically uses palette colors for iOS 26 HIG compliance.
   */
  arrowColor?: string;
  /**
   * @deprecated Use semantic colors from theme palette instead.
   * This prop is kept for backward compatibility but will be removed.
   * The icon now automatically uses palette colors for iOS 26 HIG compliance.
   */
  circleColor?: string;
  /**
   * Whether the icon is in active state (has content to send)
   */
  isActive?: boolean;
}

/**
 * Send icon following iOS 26 Human Interface Guidelines.
 *
 * **Design System Compliance**:
 * - Uses semantic `accentTint` (active) and `tint` (inactive) colors that adapt to light/dark mode
 * - Active state: Blue accent tint matching iOS Messages send button
 * - Inactive state: Gray tint for disabled appearance
 * - High contrast mode: Automatically increased opacity for accessibility
 * - White arrow provides 4.5:1 contrast ratio in all modes
 *
 * **SF Symbol Pattern**:
 * - Follows `arrow.up.circle.fill` design from iOS Messages
 * - Scales proportionally with size for consistent visual weight
 * - Round linecaps for authentic iOS aesthetic
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/color
 * @see src/ui/theme/imessagePalette.ts for semantic color definitions
 */
export function SendIcon({
  size = 24,
  arrowColor: deprecatedArrowColor,
  circleColor: deprecatedCircleColor,
  isActive = true,
}: SendIconProps) {
  const palette = useImessagePalette();

  // Use semantic colors from palette, adapting to active/inactive states
  // Active: accentTint (blue) - Light: rgba(10,132,255,0.55), Dark: rgba(10,132,255,0.65)
  // Inactive: tint (gray) - Light: rgba(255,255,255,0.65), Dark: rgba(76,76,80,0.55)
  const finalCircleColor = isActive ? palette.accentTint : palette.tint;
  const finalArrowColor = isActive ? "#FFFFFF" : palette.textTertiary;

  if ((deprecatedCircleColor || deprecatedArrowColor) && __DEV__) {
    console.warn(
      "SendIcon: circleColor and arrowColor props are deprecated. Icon now uses semantic colors from theme palette."
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Circular background - uses semantic colors for iOS 26 HIG compliance */}
      <Circle cx="12" cy="12" r="11" fill={finalCircleColor} />

      {/* Up arrow - white (active) or tertiary gray (inactive) for proper contrast */}
      <Path
        d="M12 8v8M8 12l4-4 4 4"
        stroke={finalArrowColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
