import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import type { BottomSheetMethods } from "@expo/ui/community/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "../../i18n";

export interface NativeBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  height?: number;
  dragToDismiss?: boolean;
  disableBackdropDismiss?: boolean;
  showCloseButton?: boolean;
  headerContent?: React.ReactNode;
  testID?: string;
}

export function NativeBottomSheet({
  visible,
  onClose,
  children,
  title,
  subtitle,
  style,
  height,
  dragToDismiss = true,
  disableBackdropDismiss = false,
  showCloseButton = true,
  headerContent,
  testID,
}: NativeBottomSheetProps) {
  const sheetRef = React.useRef<BottomSheetMethods>(null);
  const closingFromPropsRef = React.useRef(false);
  const insets = useSafeAreaInsets();
  const colors = useNativeSheetColors();
  const { t } = useTranslation();

  const snapPoints = React.useMemo(() => {
    if (height === undefined) {
      return undefined;
    }
    const percent = Math.max(10, Math.min(100, Math.round(height * 100)));
    return [`${percent}%`];
  }, [height]);

  React.useEffect(() => {
    if (visible) {
      closingFromPropsRef.current = false;
      sheetRef.current?.present();
      return;
    }

    closingFromPropsRef.current = true;
    sheetRef.current?.dismiss();
  }, [visible]);

  const handleSheetClose = () => {
    if (closingFromPropsRef.current) {
      closingFromPropsRef.current = false;
      return;
    }
    onClose();
  };

  // Expo UI exposes one native dismissal switch for pan, scrim/backdrop, and
  // Android back-button dismissal. Preserve the stricter legacy contract:
  // disabling backdrop dismissal also disables native interactive dismissal.
  const canDismissFromSheet = dragToDismiss && !disableBackdropDismiss;
  const sheetProps = {
    ref: sheetRef,
    index: 0,
    enablePanDownToClose: canDismissFromSheet,
    ...(dragToDismiss ? {} : { handleComponent: null }),
    onClose: handleSheetClose,
    backgroundStyle: { backgroundColor: colors.sheetBackground },
    ...(snapPoints ? { snapPoints } : {}),
  };

  return (
    <BottomSheetModal {...sheetProps}>
      <BottomSheetView
        style={[
          styles.sheetView,
          { paddingBottom: Math.max(insets.bottom, 16) },
          style,
        ]}
      >
        <View
          testID={testID}
          accessibilityViewIsModal
          style={styles.modalScope}
        >
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

          <View style={styles.content}>{children}</View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

function useNativeSheetColors() {
  const isDark = useColorScheme() === "dark";

  return {
    sheetBackground: isDark ? "#1C1C1E" : "#FFFFFF",
    textPrimary: isDark ? "#F9FAFB" : "#111827",
    textSecondary: isDark ? "#AEAEB2" : "#6D6D70",
    actionDefault: "#007AFF",
    separator: isDark ? "rgba(84, 84, 88, 0.6)" : "rgba(60, 60, 67, 0.15)",
    closeButtonBackground:
      Platform.OS === "ios"
        ? isDark
          ? "rgba(118, 118, 128, 0.24)"
          : "rgba(118, 118, 128, 0.12)"
        : "transparent",
  };
}

const styles = StyleSheet.create({
  sheetView: {
    paddingTop: 4,
  },
  modalScope: {
    minHeight: 1,
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
  },
});
