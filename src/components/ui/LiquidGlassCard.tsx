import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
import type { ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { LiquidGlassWrapper } from "../LiquidGlassWrapper";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { LiquidGlassSpacing, getCornerRadius } from "../../ui/theme/liquidGlassSpacing";
import { SpringConfig, buttonPressScale } from "../../utils/animations";
import { HapticFeedback } from "../../utils/haptics";

type CardVariant = "glass" | "solid" | "outlined" | "elevated";

export interface LiquidGlassCardProps {
  /** Card content */
  children: React.ReactNode;

  /** Visual style variant */
  variant?: CardVariant;

  /** Make card pressable/interactive */
  onPress?: () => void | Promise<void>;

  /** Disable press interactions */
  disabled?: boolean;

  /** Custom style override */
  style?: ViewStyle;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Accessibility hint */
  accessibilityHint?: string;

  /** Test ID for testing */
  testID?: string;

  /** Disable haptic feedback */
  disableHaptics?: boolean;

  /** Apply subtle press animation even for non-pressable cards */
  enablePressAnimation?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function LiquidGlassCard({
  children,
  variant = "solid",
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
  disableHaptics = false,
  enablePressAnimation = true,
}: LiquidGlassCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = useImessagePalette();
  const scale = useSharedValue(1);

  const isInteractive = !!onPress && !disabled;

  // Animated scale for press feedback
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Handle press in with animation and haptics
  const handlePressIn = () => {
    if (isInteractive && enablePressAnimation) {
      scale.value = withSpring(buttonPressScale, SpringConfig.bouncy);
      if (!disableHaptics) {
        HapticFeedback.light();
      }
    }
  };

  // Handle press out
  const handlePressOut = () => {
    if (isInteractive && enablePressAnimation) {
      scale.value = withSpring(1, SpringConfig.bouncy);
    }
  };

  // Handle actual press
  const handlePress = async () => {
    if (isInteractive) {
      if (!disableHaptics) {
        HapticFeedback.medium();
      }
      await onPress?.();
    }
  };

  // Get variant-specific styles
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case "glass":
        return {
          backgroundColor: "transparent",
        };

      case "solid":
        return {
          backgroundColor: palette.surface,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 4,
        };

      case "outlined":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: palette.border,
        };

      case "elevated":
        return {
          backgroundColor: palette.surface,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.4 : 0.15,
          shadowRadius: 12,
          elevation: 8,
        };

      default:
        return {
          backgroundColor: palette.surface,
        };
    }
  };

  const variantStyle = getVariantStyles();

  const containerStyle: ViewStyle = {
    ...styles.card,
    ...variantStyle,
    ...(disabled && { opacity: 0.5 }),
    ...style,
  };

  // Render glass variant with LiquidGlassWrapper
  if (variant === "glass") {
    return (
      <AnimatedPressable
        onPress={isInteractive ? handlePress : undefined}
        onPressIn={isInteractive ? handlePressIn : undefined}
        onPressOut={isInteractive ? handlePressOut : undefined}
        disabled={!isInteractive}
        accessible={true}
        accessibilityRole={isInteractive ? "button" : undefined}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        testID={testID}
        style={[enablePressAnimation && animatedStyle, style]}
      >
        <LiquidGlassWrapper
          variant="regular"
          shape="roundedRect"
          cornerRadius={getCornerRadius("card")}
          isInteractive={isInteractive}
          style={styles.glassContainer}
        >
          <View style={styles.content}>{children}</View>
        </LiquidGlassWrapper>
      </AnimatedPressable>
    );
  }

  // Render solid/outlined/elevated variants
  if (isInteractive) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        testID={testID}
        style={[enablePressAnimation && animatedStyle, containerStyle]}
      >
        <View style={styles.content}>{children}</View>
      </AnimatedPressable>
    );
  }

  // Non-interactive card
  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={containerStyle}
    >
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: getCornerRadius("card"),
    overflow: "hidden",
  },
  glassContainer: {
    borderRadius: getCornerRadius("card"),
  },
  content: {
    padding: LiquidGlassSpacing.md,
  },
});

export default LiquidGlassCard;
