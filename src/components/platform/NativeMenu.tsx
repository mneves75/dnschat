import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { MenuView } from "@expo/ui/community/menu";
import type {
  MenuAction,
  MenuComponentProps,
  NativeActionEvent,
} from "@expo/ui/community/menu";
import { useTranslation } from "../../i18n";

export type NativeMenuAction = MenuAction;
export type NativeMenuActionEvent = NativeActionEvent;

export interface NativeMenuProps
  extends Pick<
    MenuComponentProps,
    | "actions"
    | "children"
    | "onPressAction"
    | "shouldOpenOnLongPress"
    | "style"
    | "testID"
    | "title"
  > {}

export function createNativeMenuActionEvent(event: string): NativeMenuActionEvent {
  return { nativeEvent: { event } };
}

export function getNativeMenuActionId(action: NativeMenuAction): string {
  return action.id ?? action.title;
}

export function NativeMenu({
  actions,
  children,
  onPressAction,
  shouldOpenOnLongPress = false,
  style,
  testID,
  title,
}: NativeMenuProps) {
  if (Platform.OS !== "web") {
    const nativeProps = {
      actions,
      shouldOpenOnLongPress,
      ...(onPressAction ? { onPressAction } : {}),
      ...(style ? { style } : {}),
      ...(testID ? { testID } : {}),
      ...(title ? { title } : {}),
    };

    return (
      <MenuView {...nativeProps}>
        {children}
      </MenuView>
    );
  }

  return (
    <WebMenuFallback
      actions={actions}
      shouldOpenOnLongPress={shouldOpenOnLongPress}
      {...(onPressAction ? { onPressAction } : {})}
      {...(style ? { style } : {})}
      {...(testID ? { testID } : {})}
    >
      {children}
    </WebMenuFallback>
  );
}

function WebMenuFallback({
  actions,
  children,
  onPressAction,
  shouldOpenOnLongPress,
  style,
  testID,
}: NativeMenuProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [visible, setVisible] = React.useState(false);
  const visibleActions = React.useMemo(
    () => actions.filter((action) => !action.attributes?.hidden),
    [actions],
  );

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const fireAction = (action: NativeMenuAction) => {
    if (action.attributes?.disabled) {
      return;
    }
    onPressAction?.(createNativeMenuActionEvent(getNativeMenuActionId(action)));
    close();
  };

  const triggerProps = shouldOpenOnLongPress
    ? { onLongPress: open }
    : { onPress: open };

  return (
    <>
      <Pressable
        {...triggerProps}
        style={style}
        testID={testID}
        accessible={false}
      >
        {children}
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable
          style={styles.backdrop}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
        >
          <View
            style={[
              styles.menu,
              isDark ? styles.darkMenu : styles.lightMenu,
            ]}
          >
            {visibleActions.map((action) => (
              <Pressable
                key={getNativeMenuActionId(action)}
                onPress={() => fireAction(action)}
                disabled={action.attributes?.disabled}
                style={[
                  styles.menuItem,
                  action.attributes?.disabled && styles.disabledMenuItem,
                ]}
                accessibilityRole="button"
                accessibilityLabel={action.title}
                accessibilityState={{ disabled: action.attributes?.disabled }}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    isDark ? styles.darkMenuText : styles.lightMenuText,
                    action.attributes?.destructive && styles.destructiveText,
                  ]}
                >
                  {action.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.24)",
    padding: 24,
  },
  menu: {
    minWidth: 180,
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  lightMenu: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(60, 60, 67, 0.18)",
  },
  darkMenu: {
    backgroundColor: "#1C1C1E",
    borderColor: "rgba(84, 84, 88, 0.6)",
  },
  menuItem: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "400",
  },
  lightMenuText: {
    color: "#111827",
  },
  darkMenuText: {
    color: "#F9FAFB",
  },
  destructiveText: {
    color: "#FF3B30",
  },
});
