import React from "react";
import { Platform, Pressable } from "react-native";
import { act } from "react-test-renderer";
import type { ReactTestInstance } from "react-test-renderer";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";
import {
  NativeMenu,
  createNativeMenuActionEvent,
  getNativeMenuActionId,
} from "../src/components/platform/NativeMenu";

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const originalPlatform = Platform.OS;

const findHostType = (
  root: ReactTestInstance,
  type: string,
): ReactTestInstance => root.find((node) => node.type === type);

describe("NativeMenu", () => {
  afterEach(() => {
    Platform.OS = originalPlatform;
    jest.clearAllMocks();
  });

  it("passes actions through to Expo UI on native platforms", () => {
    Platform.OS = "ios";
    const onPressAction = jest.fn();

    let tree: ReturnType<typeof createWithSuppressedWarnings>;
    act(() => {
      tree = createWithSuppressedWarnings(
        <NativeMenu
          actions={[{ id: "copy", title: "Copy" }]}
          onPressAction={onPressAction}
          shouldOpenOnLongPress
          testID="message-menu"
        >
          <Pressable testID="message-content" />
        </NativeMenu>,
      );
    });

    const menu = findHostType(tree!.root, "MenuView");
    expect(menu.props["actions"]).toEqual([{ id: "copy", title: "Copy" }]);
    expect(menu.props["shouldOpenOnLongPress"]).toBe(true);
    expect(menu.props["testID"]).toBe("message-menu");

    menu.props["onPressAction"](createNativeMenuActionEvent("copy"));
    expect(onPressAction).toHaveBeenCalledWith({
      nativeEvent: { event: "copy" },
    });
  });

  it("keeps copy/share usable on web through an accessible fallback", () => {
    Platform.OS = "web";
    const onPressAction = jest.fn();

    let tree: ReturnType<typeof createWithSuppressedWarnings>;
    act(() => {
      tree = createWithSuppressedWarnings(
        <NativeMenu
          actions={[
            { id: "copy", title: "Copy" },
            { id: "share", title: "Share", attributes: { disabled: true } },
            { id: "hidden", title: "Hidden", attributes: { hidden: true } },
          ]}
          onPressAction={onPressAction}
          shouldOpenOnLongPress
          testID="message-menu"
        >
          <Pressable testID="message-content" />
        </NativeMenu>,
      );
    });

    const trigger = tree!.root.find(
      (node) =>
        node.props["testID"] === "message-menu" &&
        typeof node.props["onLongPress"] === "function",
    );
    act(() => {
      trigger.props["onLongPress"]();
    });

    const modal = findHostType(tree!.root, "Modal");
    expect(modal.props["visible"]).toBe(true);
    expect(tree!.root.findByProps({ accessibilityLabel: "common.close" })).toBeTruthy();
    expect(
      tree!.root.findAll((node) => node.props["accessibilityLabel"] === "Hidden"),
    ).toHaveLength(0);

    const disabledShare = tree!.root.findByProps({ accessibilityLabel: "Share" });
    act(() => {
      disabledShare.props["onPress"]();
    });
    expect(onPressAction).not.toHaveBeenCalled();

    const copy = tree!.root.findByProps({ accessibilityLabel: "Copy" });
    act(() => {
      copy.props["onPress"]();
    });

    expect(onPressAction).toHaveBeenCalledWith({
      nativeEvent: { event: "copy" },
    });
    expect(findHostType(tree!.root, "Modal").props["visible"]).toBe(false);
  });

  it("normalizes action identifiers to match Expo UI event payloads", () => {
    expect(getNativeMenuActionId({ id: "copy", title: "Copy" })).toBe("copy");
    expect(getNativeMenuActionId({ title: "Fallback title" })).toBe("Fallback title");
    expect(createNativeMenuActionEvent("share")).toEqual({
      nativeEvent: { event: "share" },
    });
  });
});
