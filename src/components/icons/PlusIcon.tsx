import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface PlusIconProps {
  size?: number;
  color?: string;
  circleColor?: string;
}

export function PlusIcon({ 
  size = 24, 
  color = '#FFFFFF', 
  circleColor = '#007AFF' 
}: PlusIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Circular background */}
      <Circle
        cx="12"
        cy="12"
        r="11"
        fill={circleColor}
      />
      {/* Plus symbol */}
      <Path
        d="M12 7v10M7 12h10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}