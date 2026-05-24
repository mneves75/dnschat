/**
 * PressableRipple - Cross-platform pressable with Material 3 ripple on Android
 *
 * A drop-in replacement for TouchableOpacity that:
 * - Renders a proper Android ripple via Pressable's android_ripple prop.
 * - Provides iOS opacity dim that visually matches the previous activeOpacity.
 * - Preserves all standard PressableProps (accessibilityRole, accessibilityLabel,
 *   testID, hitSlop, onPress, onPressIn/Out, onLongPress, disabled, etc.).
 *
 * Variants determine sensible default ripple/feedback colors. Override via
 * `rippleColor` and `pressedOpacity` when a specific surface needs tuning.
 *
 * @author DNSChat Team
 */

import React, { forwardRef } from "react";
import { Platform, Pressable } from "react-native";
import type { PressableProps, View } from "react-native";

type RippleVariant = "surface" | "primary" | "destructive" | "icon";

export interface PressableRippleProps extends Omit<PressableProps, "android_ripple"> {
  /** Visual variant — determines default ripple colour on Android and opacity feedback on iOS. */
  variant?: RippleVariant;
  /** Override ripple colour (Android only). */
  rippleColor?: string;
  /** Ripple bounded to view bounds (false) or radial unbounded (true, for circular icons). */
  borderless?: boolean;
  /** Ripple radius for borderless / icon-button presses. */
  rippleRadius?: number;
  /** iOS activeOpacity-equivalent — applied to `style` via pressed state. */
  pressedOpacity?: number;
}

const DEFAULT_RIPPLE_COLOR: Record<RippleVariant, string> = {
  surface: "rgba(0,0,0,0.08)",
  primary: "rgba(255,255,255,0.3)",
  destructive: "rgba(255,59,48,0.18)",
  icon: "rgba(0,0,0,0.12)",
};

/**
 * Cross-platform pressable that gives Android a proper Material 3 ripple
 * and iOS its expected opacity dim. Use in place of TouchableOpacity for
 * any new interactive surface. Honours all standard PressableProps including
 * accessibilityRole, accessibilityLabel, hitSlop, etc.
 */
export const PressableRipple = forwardRef<View, PressableRippleProps>(
  (
    {
      variant = "surface",
      rippleColor,
      borderless = false,
      rippleRadius,
      pressedOpacity = 0.7,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const color = rippleColor ?? DEFAULT_RIPPLE_COLOR[variant];

    return (
      <Pressable
        ref={ref}
        android_ripple={
          Platform.OS === "android"
            ? { color, borderless, radius: rippleRadius }
            : undefined
        }
        style={(state) => {
          const resolvedStyle =
            typeof style === "function" ? style(state) : style;
          if (Platform.OS === "ios" && state.pressed) {
            return [resolvedStyle, { opacity: pressedOpacity }];
          }
          return resolvedStyle;
        }}
        {...rest}
      >
        {children}
      </Pressable>
    );
  },
);

PressableRipple.displayName = "PressableRipple";
