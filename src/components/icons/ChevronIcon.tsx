import React from "react";
import Svg, { Path } from "react-native-svg";

interface ChevronIconProps {
  size?: number;
  color?: string;
  /** Chevron direction. Defaults to "right" (disclosure indicator). */
  direction?: "right" | "left" | "up" | "down";
}

const ROTATION: Record<NonNullable<ChevronIconProps["direction"]>, string> = {
  right: "0deg",
  left: "180deg",
  up: "-90deg",
  down: "90deg",
};

/**
 * Disclosure chevron matching the SF Symbol `chevron.right` proportions.
 *
 * Replaces the literal "›" text glyph used across list rows so the indicator
 * has proper optical alignment, a stroke weight that tracks adjacent text, and
 * a size that scales predictably with Dynamic Type (drive `size` from the
 * caption line height). Uses the repo's react-native-svg icon convention
 * (see TrashIcon/SendIcon).
 */
export function ChevronIcon({
  size = 16,
  color = "#8E8E93",
  direction = "right",
}: ChevronIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: [{ rotate: ROTATION[direction] }] }}
    >
      <Path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
