/**
 * GlassBottomSheet - native Expo UI bottom sheet facade.
 *
 * The public API stays stable for DNSChat screens, while modal presentation,
 * drag dismissal, scrim behavior, and platform sheet chrome are delegated to
 * Expo UI's SwiftUI / Jetpack Compose bottom sheet implementation.
 */

import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import type { NativeBottomSheetProps } from "../platform/NativeBottomSheet";
import { NativeBottomSheet } from "../platform/NativeBottomSheet";

interface GlassBottomSheetProps extends NativeBottomSheetProps {
  /** Retained for source compatibility; native sheet opacity is platform-owned. */
  backdropOpacity?: number;
  /** Retained for source compatibility; native sheet animation is platform-owned. */
  animationDuration?: number;
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
  backdropOpacity: _backdropOpacity,
  animationDuration: _animationDuration,
  ...props
}) => <NativeBottomSheet {...props} />;

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    textSecondary: isDark ? "#AEAEB2" : "#6D6D70",
    actionDefault: "#007AFF",
    actionDestructive: isDark ? "#FF453A" : "#FF3B30",
    actionDisabled: "#8E8E93",
    separator: isDark ? "rgba(84, 84, 88, 0.6)" : "rgba(60, 60, 67, 0.15)",
  };
}

export type { GlassBottomSheetProps, GlassSheetAction, GlassActionSheetProps };

const styles = StyleSheet.create({
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
