import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MenuView } from "@expo/ui/community/menu";
import type {
  MenuAction,
  MenuComponentProps,
  NativeActionEvent,
} from "@expo/ui/community/menu";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
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
  const palette = useImessagePalette();
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
              {
                backgroundColor: palette.solid,
                borderColor: palette.border,
              },
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
                    {
                      color: action.attributes?.destructive
                        ? palette.destructive
                        : palette.textPrimary,
                    },
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
});
