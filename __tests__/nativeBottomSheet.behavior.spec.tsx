import React from "react";
import { Text } from "react-native";
import { act } from "react-test-renderer";
import type { ReactTestInstance } from "react-test-renderer";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";
import { NativeBottomSheet } from "../src/components/platform/NativeBottomSheet";

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const findHostType = (
  root: ReactTestInstance,
  type: string,
): ReactTestInstance => root.find((node) => node.type === type);

describe("NativeBottomSheet", () => {
  it("maps the existing sheet contract to Expo UI bottom sheet props", () => {
    const onClose = jest.fn();

    let tree: ReturnType<typeof createWithSuppressedWarnings>;
    act(() => {
      tree = createWithSuppressedWarnings(
        <NativeBottomSheet
          visible
          onClose={onClose}
          title="DNS"
          subtitle="Resolver"
          height={0.7}
          testID="dns-sheet"
        >
          <Text>Content</Text>
        </NativeBottomSheet>,
      );
    });

    const modal = findHostType(tree!.root, "BottomSheetModal");
    expect(modal.props["snapPoints"]).toEqual(["70%"]);
    expect(modal.props["enablePanDownToClose"]).toBe(true);

    const scope = tree!.root.find(
      (node) =>
        node.props["testID"] === "dns-sheet" &&
        node.props["accessibilityViewIsModal"] === true,
    );
    expect(scope.props["accessibilityViewIsModal"]).toBe(true);

    const closeButton = tree!.root.findByProps({ accessibilityLabel: "common.close" });
    act(() => {
      closeButton.props["onPress"]();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides the native handle and dismissal gestures when drag dismiss is disabled", () => {
    let tree: ReturnType<typeof createWithSuppressedWarnings>;
    act(() => {
      tree = createWithSuppressedWarnings(
        <NativeBottomSheet visible onClose={jest.fn()} dragToDismiss={false}>
          <Text>Content</Text>
        </NativeBottomSheet>,
      );
    });

    const modal = findHostType(tree!.root, "BottomSheetModal");
    expect(modal.props["enablePanDownToClose"]).toBe(false);
    expect(modal.props["handleComponent"]).toBeNull();
  });

  it("documents Expo UI's shared native dismiss switch for backdrop and pan", () => {
    let tree: ReturnType<typeof createWithSuppressedWarnings>;
    act(() => {
      tree = createWithSuppressedWarnings(
        <NativeBottomSheet
          visible
          onClose={jest.fn()}
          dragToDismiss
          disableBackdropDismiss
        >
          <Text>Content</Text>
        </NativeBottomSheet>,
      );
    });

    expect(findHostType(tree!.root, "BottomSheetModal").props["enablePanDownToClose"]).toBe(false);
  });
});
