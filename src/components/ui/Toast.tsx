import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import type { StyleProp, TextStyle } from "react-native";
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
import { useTranslation } from "../../i18n";
import { useMotionReduction } from "../../context/AccessibilityContext";

type ToastVariant = "success" | "warning" | "error" | "info";
type ToastPosition = "top" | "bottom";
const FIXED_GLYPH_MAX_FONT_SCALE = 1.2;
const TITLE_TRUNCATION_PROPS = { numberOfLines: 1 } as const;

export interface ToastProps {
  /** Toast message (required) */
  message: string;

  /** Toast title (optional) */
  title?: string;

  /** Visual variant */
  variant?: ToastVariant;

  /** Position on screen */
  position?: ToastPosition;

  /**
   * Duration before auto-dismiss (ms), 0 to disable. Ignored for the `error`
   * variant, which intentionally persists until the user dismisses it so a
   * critical failure is never auto-hidden before it can be read.
   */
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

function ToastIcon({ icon }: { icon: string }) {
  return (
    <View
      style={styles.iconContainer}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text
        style={styles.icon}
        maxFontSizeMultiplier={FIXED_GLYPH_MAX_FONT_SCALE}
      >
        {icon}
      </Text>
    </View>
  );
}

function ToastContent({
  title,
  message,
  titleStyle,
  messageStyle,
  variant,
  liveRegion,
}: {
  title?: string;
  message: string;
  titleStyle: StyleProp<TextStyle>;
  messageStyle: StyleProp<TextStyle>;
  variant: ToastVariant;
  liveRegion: "assertive" | "polite";
}) {
  const messageTruncationProps = {
    numberOfLines: variant === "error" ? 3 : 2,
  } as const;

  return (
    <View
      style={styles.content}
      accessible={true}
      accessibilityRole={variant === "error" ? "alert" : undefined}
      accessibilityLiveRegion={liveRegion}
      accessibilityLabel={`${title ? `${title} ` : ""}${message}`}
    >
      {Boolean(title) && (
        <Text
          style={titleStyle}
          {...TITLE_TRUNCATION_PROPS}
        >
          {title}
        </Text>
      )}
      <Text
        style={messageStyle}
        {...messageTruncationProps}
      >
        {message}
      </Text>
    </View>
  );
}

function ToastActionButton({
  actionLabel,
  actionTextStyle,
  onPress,
}: {
  actionLabel: string;
  actionTextStyle: StyleProp<TextStyle>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.actionButton}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={actionLabel}
      hitSlop={8}
    >
      <Text
        style={actionTextStyle}
        numberOfLines={1}
      >
        {actionLabel}
      </Text>
    </Pressable>
  );
}

function ToastDismissButton({
  color,
  label,
  onPress,
}: {
  color: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.dismissButton}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
    >
      <Text
        style={[styles.dismissText, { color }]}
        maxFontSizeMultiplier={FIXED_GLYPH_MAX_FONT_SCALE}
      >
        ×
      </Text>
    </Pressable>
  );
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
  const typography = useTypography();
  const palette = useImessagePalette();
  const { t } = useTranslation();
  const { shouldReduceMotion } = useMotionReduction();

  const hiddenTranslateY = position === "top" ? -200 : 200;
  const translateY = useSharedValue(hiddenTranslateY);
  const opacity = useSharedValue(0);
  const [isMounted, setIsMounted] = useState(visible);
  const visibleRef = useRef(visible);

  // Mount as soon as the toast becomes visible. Deriving this during render
  // (instead of a setState-in-effect) keeps the component React Compiler-clean.
  if (visible && !isMounted) {
    setIsMounted(true);
  }

  // Effect: keep the visibility ref in sync with the visible prop.
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  const finishHide = () => {
    if (!visibleRef.current) {
      setIsMounted(false);
    }
  };

  // Single hide path shared by manual dismiss, auto-dismiss, and the
  // `visible` prop turning false. Reduce-motion short-circuits straight to the
  // end state; otherwise the spring/timing pair runs and notifies on the JS
  // thread once finished. `notifyDismiss` controls whether onDismiss fires
  // (the visible->false path must not re-notify the owner).
  const hideToast = (notifyDismiss: boolean) => {
    visibleRef.current = false;
    if (shouldReduceMotion) {
      translateY.set(hiddenTranslateY);
      opacity.set(0);
      if (notifyDismiss) {
        onDismiss();
      }
      finishHide();
      return;
    }

    translateY.set(withSpring(
      hiddenTranslateY,
      SpringConfig.stiff,
      (finished) => {
        if (finished) {
          if (notifyDismiss) {
            runOnJS(onDismiss)();
          }
          runOnJS(finishHide)();
        }
      }
    ));
    opacity.set(withTiming(0, TimingConfig.quick));
  };

  const handleDismiss = () => {
    hideToast(true);
    HapticFeedback.light();
  };

  // Get variant-specific colors and icon. Pull from palette so dark mode
  // and high-contrast modes are respected.
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: palette.success,
          icon: "OK",
          textColor: palette.textOnChroma,
        };
      case "warning":
        return {
          backgroundColor: palette.warning,
          icon: "!",
          textColor: palette.textOnChroma,
        };
      case "error":
        return {
          backgroundColor: palette.destructive,
          icon: "X",
          textColor: palette.textOnChroma,
        };
      case "info":
      default:
        return {
          backgroundColor: palette.accentTint,
          icon: "i",
          textColor: palette.textOnChroma,
        };
    }
  };

  const variantStyle = getVariantStyles();
  const liveRegion = variant === "error" ? "assertive" : "polite";
  // Error toasts persist (no auto-dismiss) so a critical failure stays on screen
  // until acknowledged; all other variants honour `duration`.
  const autoDismissDuration = variant === "error" ? 0 : duration;

  // Effect: animate toast visibility and manage the auto-dismiss timer.
  useEffect(() => {
    if (visible) {
      visibleRef.current = true;
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

      if (shouldReduceMotion) {
        translateY.set(0);
        opacity.set(1);
      } else {
        // Slide in
        translateY.set(withSpring(0, SpringConfig.bouncy));
        opacity.set(withTiming(1, TimingConfig.quick));
      }

      // Auto-dismiss behaves exactly like a manual dismiss
      if (autoDismissDuration > 0) {
        const timer = setTimeout(handleDismiss, autoDismissDuration);

        return () => clearTimeout(timer);
      }
    } else {
      // Slide out (or jump to end state under reduce motion); the owner
      // already knows the toast is hidden, so do not re-notify onDismiss.
      hideToast(false);
    }
    return undefined;
  }, [
    visible,
    variant,
    autoDismissDuration,
    hiddenTranslateY,
    onDismiss,
    opacity,
    shouldReduceMotion,
    translateY,
  ]);

  // Handle action
  const handleAction = () => {
    HapticFeedback.medium();
    onAction?.();
    handleDismiss();
  };

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }],
    opacity: opacity.get(),
  }));

  if (!isMounted) {
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
        accessible={false}
      >
        <ToastIcon icon={variantStyle.icon} />

        <ToastContent
          {...(title ? { title } : {})}
          message={message}
          titleStyle={[
            styles.title,
            typography.headline,
            { color: variantStyle.textColor },
          ]}
          messageStyle={[
            styles.message,
            typography.body,
            { color: variantStyle.textColor },
          ]}
          variant={variant}
          liveRegion={liveRegion}
        />

        {Boolean(actionLabel) && onAction && (
          <ToastActionButton
            actionLabel={actionLabel ?? ""}
            actionTextStyle={[
              styles.actionText,
              typography.callout,
              { color: variantStyle.textColor },
            ]}
            onPress={handleAction}
          />
        )}

        <ToastDismissButton
          color={variantStyle.textColor}
          label={t("common.close")}
          onPress={handleDismiss}
        />
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
    alignItems: "flex-start",
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm,
    borderRadius: getCornerRadius("button"),
    maxHeight: 168,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)" }
      : {
          shadowColor: "#111827",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }),
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: LiquidGlassSpacing.sm,
    marginTop: 1,
  },
  icon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    minWidth: 0,
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
    maxWidth: 150,
    flexShrink: 1,
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
