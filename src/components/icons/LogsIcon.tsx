import React from "react";
import Svg, { Path } from "react-native-svg";

interface LogsIconProps {
  size?: number;
  color?: string;
}

export function LogsIcon({ size = 24, color = "#8E8E93" }: LogsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h8v2H3v-2z"
        fill={color}
      />
      <Path d="M20 15l-3 3 3 3v-6z" fill={color} />
    </Svg>
  );
}
