/**
 * GlassBottomSheet - React Native modal sheet.
 *
 * Keep this implementation independent of native Expo UI adapters. The iOS
 * TestFlight startup crash for build 47 occurred in a React Native fatal path
 * after the Expo UI bottom-sheet migration, and hidden per-row native sheets
 * made that startup surface too broad for production.
 */

import React from "react";
import {
  // react-doctor-disable-next-line react-doctor/rn-prefer-reanimated
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "../../i18n";
import { useMotionReduction } from "../../context/AccessibilityContext";
import { LiquidGlassWrapper } from "../LiquidGlassWrapper";

interface GlassBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  height?: number;
  dragToDismiss?: boolean;
  disableBackdropDismiss?: boolean;
  backdropOpacity?: number;
  animationDuration?: number;
  showCloseButton?: boolean;
  headerContent?: React.ReactNode;
  testID?: string;
}

interface GlassSheetAction {
  title: string;
  onPress: () => void;
  style?: "default" | "destructive" | "cancel";
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  icon?: React.ReactNode;
}

interface GlassActionSheetProps
  extends Omit<GlassBottomSheetProps, "children"> {
  actions: GlassSheetAction[];
  message?: string;
}

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
  testID,
}) => {
  const colors = useGlassSheetColors();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { t } = useTranslation();
  const { shouldReduceMotion } = useMotionReduction();
  const translateY = React.useRef(new Animated.Value(1000)).current;
  const animatedBackdropOpacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.96)).current;
  const useNativeDriver = Platform.OS !== "web";

  React.useEffect(() => {
    const duration = shouldReduceMotion ? 0 : animationDuration;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: visible ? 0 : 1000,
        duration,
        useNativeDriver,
      }),
      Animated.timing(animatedBackdropOpacity, {
        toValue: visible ? 1 : 0,
        duration,
        useNativeDriver,
      }),
      Animated.timing(scale, {
        toValue: visible ? 1 : 0.96,
        duration,
        useNativeDriver,
      }),
    ]).start();
  }, [
    animatedBackdropOpacity,
    animationDuration,
    scale,
    shouldReduceMotion,
    translateY,
    useNativeDriver,
    visible,
  ]);

  const handleBackdropPress = () => {
    if (!disableBackdropDismiss) {
      onClose();
    }
  };

  const sheetHeight = screenHeight * Math.max(0.1, Math.min(1, height));
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
      accessibilityViewIsModal
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View
          style={[styles.backdrop, backdropStyle]}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheetContainer,
          {
            backgroundColor: colors.sheetBackground,
            borderTopColor: colors.sheetBorder,
            height: sheetHeight + insets.bottom,
            transform: [{ translateY }, { scale }],
          },
          style,
        ]}
      >
        <LiquidGlassWrapper
          variant="prominent"
          shape="roundedRect"
          cornerRadius={16}
          enableContainer
          style={styles.sheetContent}
        >
          {dragToDismiss && (
            <View style={styles.handleContainer} accessible={false}>
              <View style={[styles.handle, { backgroundColor: colors.handle }]} />
            </View>
          )}

          {Boolean(title || subtitle || showCloseButton || headerContent) && (
            <View
              style={[
                styles.header,
                { borderBottomColor: colors.separator },
              ]}
            >
              {headerContent || (
                <>
                  <View style={styles.headerText}>
                    {Boolean(title) && (
                      <Text
                        style={[styles.title, { color: colors.textPrimary }]}
                      >
                        {title}
                      </Text>
                    )}
                    {Boolean(subtitle) && (
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
                      style={[
                        styles.closeButton,
                        { backgroundColor: colors.closeButtonBackground },
                      ]}
                      onPress={onClose}
                      accessibilityRole="button"
                      accessibilityLabel={t("common.close")}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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

          <View testID={testID} style={styles.content}>
            {children}
          </View>
          <View style={{ height: insets.bottom }} />
        </LiquidGlassWrapper>
      </Animated.View>
    </Modal>
  );
};

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
          <React.Fragment key={`${action.title}-${index}`}>
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
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel ?? action.title}
              accessibilityHint={action.accessibilityHint}
              accessibilityState={{ disabled: action.disabled }}
            >
              <View style={styles.actionContent}>
                {Boolean(action.icon) && (
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

export const useGlassBottomSheet = () => {
  const [visible, setVisible] = React.useState(false);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);
  const toggle = () => setVisible((prev) => !prev);

  return { visible, show, hide, toggle };
};

function useGlassSheetColors() {
  const isDark = useColorScheme() === "dark";

  return {
    backdrop: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.4)",
    sheetBackground: isDark ? "rgba(28, 28, 30, 0.95)" : "rgba(255, 255, 255, 0.95)",
    sheetBorder: isDark ? "rgba(84, 84, 88, 0.4)" : "rgba(198, 198, 200, 0.3)",
    handle: isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)",
    textPrimary: isDark ? "#F9FAFB" : "#111827",
    textSecondary: isDark ? "#AEAEB2" : "#6D6D70",
    actionDefault: "#007AFF",
    actionDestructive: isDark ? "#FF453A" : "#FF3B30",
    actionDisabled: "#8E8E93",
    separator: isDark ? "rgba(84, 84, 88, 0.6)" : "rgba(60, 60, 67, 0.15)",
    closeButtonBackground:
      Platform.OS === "ios"
        ? isDark
          ? "rgba(118, 118, 128, 0.24)"
          : "rgba(118, 118, 128, 0.12)"
        : "transparent",
  };
}

export type { GlassBottomSheetProps, GlassSheetAction, GlassActionSheetProps };

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  sheetContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
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
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    width: 24,
    marginRight: 12,
    alignItems: "center",
  },
  actionText: {
    fontSize: 17,
    fontWeight: "400",
    letterSpacing: 0,
  },
  actionCancelText: {
    fontWeight: "600",
  },
  actionSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 20,
  },
});
