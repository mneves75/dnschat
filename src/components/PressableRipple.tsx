/**
 * PressableRipple - Cross-platform pressable with Material 3 ripple on Android
 *
 * A drop-in replacement for TouchableOpacity that:
 * - Renders a proper Android ripple via Pressable's android_ripple prop.
 * - Gives iOS button-like surfaces a tactile scale-on-press (0.96), and
 *   row/card surfaces a subtle opacity dim (matching the previous activeOpacity).
 * - Preserves all standard PressableProps (accessibilityRole, accessibilityLabel,
 *   testID, hitSlop, onPress, onPressIn/Out, onLongPress, disabled, etc.).
 *
 * Press-feedback model (iOS):
 * - Button variants ("primary" | "icon" | "destructive") scale to 0.96 on press.
 *   Scale is the right affordance for a discrete control and reads as tactile.
 * - Surface variant (rows, cards, list items) keeps an opacity dim only — scaling
 *   a full-width row looks cheap, so it is intentionally excluded.
 * - The per-variant default can be overridden per call site with `pressScale`.
 * - Reduce Motion and Android both fall back to the opacity dim (no scale), so a
 *   feedback signal is always present without motion.
 *
 * The scale spring is critically damped (SpringConfig.press, overshootClamping)
 * so the control never springs back above 1.0.
 *
 * @author DNSChat Team
 */

import React, { forwardRef } from "react";
import { Platform, Pressable } from "react-native";
import type {
  GestureResponderEvent,
  PressableProps,
  PressableStateCallbackType,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SpringConfig, buttonPressScale } from "../utils/animations";
import { useMotionReduction } from "../context/AccessibilityContext";

type RippleVariant = "surface" | "primary" | "destructive" | "icon";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableRippleProps extends Omit<PressableProps, "android_ripple"> {
  /** Visual variant — determines default ripple colour on Android, and whether iOS gets scale or opacity feedback. */
  variant?: RippleVariant;
  /** Override ripple colour (Android only). */
  rippleColor?: string;
  /** Ripple bounded to view bounds (false) or radial unbounded (true, for circular icons). */
  borderless?: boolean;
  /** Ripple radius for borderless / icon-button presses. */
  rippleRadius?: number;
  /** iOS activeOpacity-equivalent — applied to `style` via pressed state when scale is not active. */
  pressedOpacity?: number;
  /**
   * Force the iOS tactile scale-on-press on (true) or off (false), overriding the
   * per-variant default. Leave undefined to use the variant default
   * (buttons scale, surfaces do not). Set false on a control that already animates
   * its own scale to avoid compounding the transform.
   */
  pressScale?: boolean;
}

const DEFAULT_RIPPLE_COLOR: Record<RippleVariant, string> = {
  surface: "rgba(0,0,0,0.08)",
  primary: "rgba(255,255,255,0.3)",
  destructive: "rgba(255,59,48,0.18)",
  icon: "rgba(0,0,0,0.12)",
};

// Button-like variants read as discrete controls, so a scale press feels right.
// Surfaces (rows/cards) keep the opacity dim instead.
const SCALE_ON_PRESS_BY_VARIANT: Record<RippleVariant, boolean> = {
  surface: false,
  primary: true,
  destructive: true,
  icon: true,
};

/**
 * Cross-platform pressable that gives Android a proper Material 3 ripple, iOS
 * buttons a tactile scale-on-press, and iOS surfaces an opacity dim. Use in place
 * of TouchableOpacity for any new interactive surface. Honours all standard
 * PressableProps including accessibilityRole, accessibilityLabel, hitSlop, etc.
 */
export const PressableRipple = forwardRef<View, PressableRippleProps>(
  (
    {
      variant = "surface",
      rippleColor,
      borderless = false,
      rippleRadius,
      pressedOpacity = 0.7,
      pressScale,
      style,
      children,
      onPressIn,
      onPressOut,
      ...rest
    },
    ref,
  ) => {
    const color = rippleColor ?? DEFAULT_RIPPLE_COLOR[variant];
    const { shouldReduceMotion } = useMotionReduction();

    // Scale only on iOS, only for opted-in variants, never when reducing motion.
    const scaleEnabled =
      Platform.OS === "ios" &&
      !shouldReduceMotion &&
      (pressScale ?? SCALE_ON_PRESS_BY_VARIANT[variant]);

    const scale = useSharedValue(1);
    const animatedScaleStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.get() }],
    }));

    const handlePressIn = (event: GestureResponderEvent) => {
      if (scaleEnabled) {
        scale.set(withSpring(buttonPressScale, SpringConfig.press));
      }
      onPressIn?.(event);
    };

    const handlePressOut = (event: GestureResponderEvent) => {
      if (scaleEnabled) {
        scale.set(withSpring(1, SpringConfig.press));
      }
      onPressOut?.(event);
    };

    return (
      <AnimatedPressable
        ref={ref}
        android_ripple={
          Platform.OS === "android"
            ? { color, borderless, radius: rippleRadius }
            : undefined
        }
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={(state: PressableStateCallbackType) => {
          const resolvedStyle =
            typeof style === "function" ? style(state) : style;
          // iOS opacity dim only carries feedback when scale isn't.
          const withOpacity =
            Platform.OS === "ios" && state.pressed && !scaleEnabled
              ? [resolvedStyle, { opacity: pressedOpacity }]
              : resolvedStyle;
          return scaleEnabled ? [withOpacity, animatedScaleStyle] : withOpacity;
        }}
        {...rest}
      >
        {children}
      </AnimatedPressable>
    );
  },
);

PressableRipple.displayName = "PressableRipple";
