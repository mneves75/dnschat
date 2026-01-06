/**
 * GlassBottomSheet - Modal presentations with glass overlay
 *
 * Implements iOS-style bottom sheets with translucent glass backgrounds,
 * inspired by Evan Bacon's Glass UI demo and Apple's design system.
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support + Evan Bacon Glass UI)
 */

import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  useColorScheme,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import type { ViewStyle } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import type { PanGestureHandlerStateChangeEvent } from "react-native-gesture-handler";
import { LiquidGlassWrapper } from "../LiquidGlassWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ==================================================================================
// TYPES AND INTERFACES
// ==================================================================================

interface GlassBottomSheetProps {
  /** Sheet visibility */
  visible: boolean;
  /** Close handler */
  onClose: () => void;
  /** Sheet content */
  children: React.ReactNode;
  /** Sheet title */
  title?: string;
  /** Sheet subtitle */
  subtitle?: string;
  /** Custom sheet style */
  style?: ViewStyle;
  /** Sheet height (percentage of screen) */
  height?: number;
  /** Enable drag to dismiss */
  dragToDismiss?: boolean;
  /** Disable backdrop tap to dismiss */
  disableBackdropDismiss?: boolean;
  /** Custom backdrop opacity */
  backdropOpacity?: number;
  /** Animation duration */
  animationDuration?: number;
  /** Show close button */
  showCloseButton?: boolean;
  /** Custom header content */
  headerContent?: React.ReactNode;
}

interface GlassSheetAction {
  /** Action title */
  title: string;
  /** Action handler */
  onPress: () => void;
  /** Action style */
  style?: "default" | "destructive" | "cancel";
  /** Disabled state */
  disabled?: boolean;
  /** Custom icon */
  icon?: React.ReactNode;
}

interface GlassActionSheetProps
  extends Omit<GlassBottomSheetProps, "children"> {
  /** Sheet actions */
  actions: GlassSheetAction[];
  /** Sheet message */
  message?: string;
}

// ==================================================================================
// ADAPTIVE GLASS COLOR SYSTEM
// ==================================================================================

const useGlassSheetColors = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    // Backdrop
    backdrop: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.4)",

    // Sheet background
    sheetBackground: isDark
      ? "rgba(28, 28, 30, 0.95)"
      : "rgba(255, 255, 255, 0.95)",

    // Sheet border
    sheetBorder: isDark ? "rgba(84, 84, 88, 0.4)" : "rgba(198, 198, 200, 0.3)",

    // Handle
    handle: isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)",

    // Text colors
    textPrimary: isDark ? "#FFFFFF" : "#000000",
    textSecondary: isDark ? "#AEAEB2" : "#6D6D70",
    textTertiary: isDark ? "#8E8E93" : "#8E8E93",

    // Action colors
    actionDefault: isDark ? "#007AFF" : "#007AFF",
    actionDestructive: isDark ? "#FF453A" : "#FF3B30",
    actionDisabled: isDark ? "#8E8E93" : "#8E8E93",

    // Separators
    separator: isDark ? "rgba(84, 84, 88, 0.6)" : "rgba(60, 60, 67, 0.15)",

    // Pressed state
    pressedOverlay: isDark
      ? "rgba(255, 255, 255, 0.04)"
      : "rgba(0, 0, 0, 0.04)",
  };
};

// ==================================================================================
// ANIMATION HOOKS
// ==================================================================================

const useSheetAnimation = (
  visible: boolean,
  animationDuration: number = 300,
) => {
  const translateY = React.useRef(new Animated.Value(1000)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 1000,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity, scale, animationDuration]);

  return { translateY, backdropOpacity, scale };
};

// ==================================================================================
// GLASS BOTTOM SHEET COMPONENTS
// ==================================================================================

/**
 * Main Glass Bottom Sheet Component
 */
export const GlassBottomSheet: React.FC<GlassBottomSheetProps> = ({
  visible,
  onClose,
  children,
  title,
  subtitle,
  style,
  height = 0.6,
  dragToDismiss = true,
  disableBackdropDismiss = false,
  backdropOpacity = 1,
  animationDuration = 300,
  showCloseButton = true,
  headerContent,
}) => {
  const colors = useGlassSheetColors();
  const insets = useSafeAreaInsets();
  const {
    translateY,
    backdropOpacity: animatedBackdropOpacity,
    scale,
  } = useSheetAnimation(visible, animationDuration);
  const { height: screenHeight } = Dimensions.get("window");

  const sheetHeight = screenHeight * height;
  const dragY = React.useRef(new Animated.Value(0)).current;

  const handleBackdropPress = () => {
    if (!disableBackdropDismiss) {
      onClose();
    }
  };

  const handleClosePress = () => {
    // Haptic feedback
    if (Platform.OS === "ios") {
    }
    onClose();
  };

  // Drag gesture handling
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: false },
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;

      if (translationY > 100 || velocityY > 500) {
        // Close the sheet
        onClose();
      } else {
        // Snap back
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const sheetStyle: ViewStyle = {
    backgroundColor: colors.sheetBackground,
    borderTopColor: colors.sheetBorder,
    transform: [
      { translateY: translateY },
      { scale: scale },
      ...(dragToDismiss ? [{ translateY: dragY }] : []),
    ],
  };

  const backdropStyle = {
    opacity: Animated.multiply(animatedBackdropOpacity, backdropOpacity),
    backgroundColor: colors.backdrop,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          sheetStyle,
          { height: sheetHeight + insets.bottom },
          style,
        ]}
      >
        <LiquidGlassWrapper
          variant="prominent"
          shape="roundedRect"
          cornerRadius={16}
          enableContainer={true}
          style={styles.sheetContent}
        >
          {/* Drag Handle */}
          {dragToDismiss && (
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Animated.View style={styles.handleContainer}>
                <View
                  style={[styles.handle, { backgroundColor: colors.handle }]}
                />
              </Animated.View>
            </PanGestureHandler>
          )}

          {/* Header */}
          {(title || subtitle || showCloseButton || headerContent) && (
            <View style={styles.header}>
              {headerContent || (
                <>
                  <View style={styles.headerText}>
                    {title && (
                      <Text
                        style={[styles.title, { color: colors.textPrimary }]}
                      >
                        {title}
                      </Text>
                    )}
                    {subtitle && (
                      <Text
                        style={[
                          styles.subtitle,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {subtitle}
                      </Text>
                    )}
                  </View>

                  {showCloseButton && (
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleClosePress}
                    >
                      <Text
                        style={[
                          styles.closeButtonText,
                          { color: colors.actionDefault },
                        ]}
                      >
                        X
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>{children}</View>

          {/* Safe area bottom */}
          <View style={{ height: insets.bottom }} />
        </LiquidGlassWrapper>
      </Animated.View>
    </Modal>
  );
};

/**
 * Glass Action Sheet Component
 */
export const GlassActionSheet: React.FC<GlassActionSheetProps> = ({
  actions,
  message,
  title,
  ...props
}) => {
  const colors = useGlassSheetColors();

  return (
    <GlassBottomSheet
      {...props}
      {...(title ? { title } : {})}
      {...(message ? { subtitle: message } : {})}
      height={Math.min(0.8, 0.2 + actions.length * 0.06)}
      showCloseButton={false}
    >
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={[
                styles.actionItem,
                action.disabled && styles.actionDisabled,
              ]}
              onPress={() => {
                if (!action.disabled) {
                  action.onPress();
                  props.onClose();
                }
              }}
              disabled={action.disabled}
            >
              <View style={styles.actionContent}>
                {action.icon && (
                  <View style={styles.actionIcon}>{action.icon}</View>
                )}
                <Text
                  style={[
                    styles.actionText,
                    {
                      color: action.disabled
                        ? colors.actionDisabled
                        : action.style === "destructive"
                          ? colors.actionDestructive
                          : action.style === "cancel"
                            ? colors.textSecondary
                            : colors.actionDefault,
                    },
                    action.style === "cancel" && styles.actionCancelText,
                  ]}
                >
                  {action.title}
                </Text>
              </View>
            </TouchableOpacity>

            {index < actions.length - 1 && (
              <View
                style={[
                  styles.actionSeparator,
                  { backgroundColor: colors.separator },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </GlassBottomSheet>
  );
};

// ==================================================================================
// CONVENIENCE HOOKS
// ==================================================================================

/**
 * Hook for managing bottom sheet state
 */
export const useGlassBottomSheet = () => {
  const [visible, setVisible] = React.useState(false);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);
  const toggle = () => setVisible((prev) => !prev);

  return { visible, show, hide, toggle };
};

// ==================================================================================
// COMPONENT EXPORTS
// ==================================================================================

export type { GlassBottomSheetProps, GlassSheetAction, GlassActionSheetProps };

// ==================================================================================
// STYLES
// ==================================================================================

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  sheetContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
  handleContainer: {
    paddingVertical: 8,
    alignItems: "center",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(84, 84, 88, 0.3)",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.38,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: -0.32,
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "400",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  actionsContainer: {
    paddingVertical: 8,
  },
  actionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    marginRight: 12,
    width: 24,
    alignItems: "center",
  },
  actionText: {
    fontSize: 17,
    fontWeight: "400",
    letterSpacing: -0.43,
  },
  actionCancelText: {
    fontWeight: "600",
  },
  actionSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 20,
  },
});
