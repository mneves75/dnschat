import React from "react";
import Svg, { Path } from "react-native-svg";

interface CheckmarkIconProps {
  size?: number;
  color?: string;
}

/**
 * Selection checkmark matching the SF Symbol `checkmark` proportions.
 *
 * Replaces the literal "•" bullet used as a selection indicator in the settings
 * pickers (theme / language / DNS server). A checkmark is the iOS-standard
 * affordance for "selected row" and reads correctly to VoiceOver when paired
 * with `accessibilityState={{ selected: true }}` on the row. Uses the repo's
 * react-native-svg icon convention.
 */
export function CheckmarkIcon({
  size = 18,
  color = "#0A84FF",
}: CheckmarkIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 13l4 4L19 7"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
