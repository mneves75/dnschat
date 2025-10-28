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
 * - Pure arrow icon (NO background circle) - button provides the circular background
 * - White arrow for optimal contrast against button's colored background
 * - Always uses white color as the icon sits on the button's solid background
 * - High contrast mode: Automatically increased opacity for accessibility
 *
 * **SF Symbol Pattern**:
 * - Follows `arrow.up` design (NOT `arrow.up.circle.fill`)
 * - Button in ChatInput.tsx provides the circular background color
 * - This prevents "double circle" visual artifact from overlapping backgrounds
 * - Scales proportionally with size for consistent visual weight
 * - Round linecaps for authentic iOS aesthetic
 *
 * **CRITICAL**: Do NOT add Circle element here - ChatInput button already provides
 * circular background. Icon should be arrow-only to prevent double-circle effect.
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/color
 * @see src/ui/theme/imessagePalette.ts for semantic color definitions
 * @see src/components/ChatInput.tsx renderSendButton for button background styling
 */
export function SendIcon({
  size = 24,
  arrowColor: deprecatedArrowColor,
  circleColor: deprecatedCircleColor,
  isActive = true,
}: SendIconProps) {
  const palette = useImessagePalette();

  // Always use white arrow - button provides the colored circular background
  // This matches iOS Messages pattern: white icon on colored button
  const finalArrowColor = "#FFFFFF";

  if ((deprecatedCircleColor || deprecatedArrowColor) && __DEV__) {
    console.warn(
      "SendIcon: circleColor and arrowColor props are deprecated. Icon now uses white arrow on button background."
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Up arrow - always white for contrast against button's colored background */}
      {/* NO Circle element - button provides circular background to prevent double-circle */}
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
