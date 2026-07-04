import React from "react";
import Svg, { Path } from "react-native-svg";

interface CloseIconProps {
  size?: number;
  color?: string;
}

/**
 * Close glyph matching the SF Symbol `xmark` proportions.
 *
 * Replaces the literal "X" text used on the bottom-sheet close button so the
 * control has proper optical centering and a consistent stroke weight. Uses the
 * repo's react-native-svg icon convention. Wrap in a >=44pt touch target at the
 * call site.
 */
export function CloseIcon({ size = 16, color = "#8E8E93" }: CloseIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6l12 12M18 6L6 18"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
