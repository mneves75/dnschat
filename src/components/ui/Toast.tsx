import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useTypography } from "../../ui/hooks/useTypography";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { LiquidGlassSpacing, getCornerRadius } from "../../ui/theme/liquidGlassSpacing";
import { SpringConfig, TimingConfig } from "../../utils/animations";
import { HapticFeedback } from "../../utils/haptics";

type ToastVariant = "success" | "warning" | "error" | "info";
type ToastPosition = "top" | "bottom";

export interface ToastProps {
  /** Toast message (required) */
  message: string;

  /** Toast title (optional) */
  title?: string;

  /** Visual variant */
  variant?: ToastVariant;

  /** Position on screen */
  position?: ToastPosition;

  /** Duration before auto-dismiss (ms), 0 to disable */
  duration?: number;

  /** Show toast */
  visible: boolean;

  /** Callback when toast is dismissed */
  onDismiss: () => void;

  /** Optional action button */
  actionLabel?: string;

  /** Action button callback */
  onAction?: () => void;

  /** Test ID for testing */
  testID?: string;
}

export function Toast({
  message,
  title,
  variant = "info",
  position = "top",
  duration = 3000,
  visible,
  onDismiss,
  actionLabel,
  onAction,
  testID,
}: ToastProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const typography = useTypography();
  const palette = useImessagePalette();

  const translateY = useSharedValue(position === "top" ? -200 : 200);
  const opacity = useSharedValue(0);

  // Get variant-specific colors and icon
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: "#34C759",
          icon: "OK",
          textColor: "#FFFFFF",
        };
      case "warning":
        return {
          backgroundColor: "#FF9500",
          icon: "!",
          textColor: "#FFFFFF",
        };
      case "error":
        return {
          backgroundColor: "#FF3B30",
          icon: "X",
          textColor: "#FFFFFF",
        };
      case "info":
      default:
        return {
          backgroundColor: palette.accentTint,
          icon: "i",
          textColor: "#FFFFFF",
        };
    }
  };

  const variantStyle = getVariantStyles();

  // Show animation
  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      switch (variant) {
        case "success":
          HapticFeedback.success();
          break;
        case "warning":
          HapticFeedback.warning();
          break;
        case "error":
          HapticFeedback.error();
          break;
        default:
          HapticFeedback.light();
      }

      // Slide in
      translateY.value = withSpring(0, SpringConfig.bouncy);
      opacity.value = withTiming(1, TimingConfig.quick);

      // Auto-dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      // Slide out
      translateY.value = withSpring(
        position === "top" ? -200 : 200,
        SpringConfig.stiff
      );
      opacity.value = withTiming(0, TimingConfig.quick);
    }
    return undefined;
  }, [visible, variant, duration, position]);

  // Handle dismiss
  const handleDismiss = () => {
    translateY.value = withSpring(
      position === "top" ? -200 : 200,
      SpringConfig.stiff,
      (finished) => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      }
    );
    opacity.value = withTiming(0, TimingConfig.quick);
    HapticFeedback.light();
  };

  // Handle action
  const handleAction = () => {
    HapticFeedback.medium();
    onAction?.();
    handleDismiss();
  };

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible && translateY.value === (position === "top" ? -200 : 200)) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        position === "top" ? styles.containerTop : styles.containerBottom,
        animatedStyle,
      ]}
      testID={testID}
    >
      <View
        style={[
          styles.toast,
          { backgroundColor: variantStyle.backgroundColor },
        ]}
        accessible={true}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        accessibilityLabel={`${variant} notification: ${title || ""} ${message}`}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{variantStyle.icon}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {title && (
            <Text
              style={[
                styles.title,
                typography.headline,
                { color: variantStyle.textColor },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          <Text
            style={[
              styles.message,
              typography.body,
              { color: variantStyle.textColor },
            ]}
            numberOfLines={2}
          >
            {message}
          </Text>
        </View>

        {/* Action Button */}
        {actionLabel && onAction && (
          <Pressable
            onPress={handleAction}
            style={styles.actionButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            hitSlop={8}
          >
            <Text
              style={[
                styles.actionText,
                typography.callout,
                { color: variantStyle.textColor },
              ]}
            >
              {actionLabel}
            </Text>
          </Pressable>
        )}

        {/* Dismiss Button */}
        <Pressable
          onPress={handleDismiss}
          style={styles.dismissButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          hitSlop={8}
        >
          <Text style={[styles.dismissText, { color: variantStyle.textColor }]}>
            ×
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: LiquidGlassSpacing.md,
    right: LiquidGlassSpacing.md,
    zIndex: 9999,
  },
  containerTop: {
    top: Platform.OS === "ios" ? 60 : LiquidGlassSpacing.md, // Below status bar on iOS
  },
  containerBottom: {
    bottom: Platform.OS === "ios" ? 40 : LiquidGlassSpacing.md, // Above tab bar on iOS
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm,
    borderRadius: getCornerRadius("button"),
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: LiquidGlassSpacing.sm,
  },
  icon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    marginRight: LiquidGlassSpacing.xs,
  },
  title: {
    fontWeight: "600",
    marginBottom: LiquidGlassSpacing.xxs,
  },
  message: {
    // Typography applied inline
  },
  actionButton: {
    paddingHorizontal: LiquidGlassSpacing.sm,
    paddingVertical: LiquidGlassSpacing.xxs,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: getCornerRadius("button"),
    marginRight: LiquidGlassSpacing.xs,
  },
  actionText: {
    fontWeight: "600",
  },
  dismissButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissText: {
    fontSize: 24,
    fontWeight: "300",
    lineHeight: 28,
  },
});

export default Toast;
