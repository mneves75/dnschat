import React from "react";
import { StyleSheet } from "react-native";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

// Sentinel responsive width distinct from the legacy hardcoded "75%".
const SENTINEL_MAX_WIDTH = 560;

jest.mock("../src/ui/hooks/useResponsiveLayout", () => ({
  useResponsiveLayout: () => ({ messageMaxWidth: SENTINEL_MAX_WIDTH }),
}));

jest.mock("../src/ui/theme/imessagePalette", () => ({
  useImessagePalette: () => ({
    textPrimary: "#000000",
    userBubble: "#007AFF",
    assistantBubble: "#E5E5EA",
  }),
}));

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("react-native-reanimated", () => {
  const easingFn = () => 0;
  const Easing = {
    linear: easingFn,
    ease: easingFn,
    quad: easingFn,
    cubic: easingFn,
    bezier: () => easingFn,
    in: () => easingFn,
    out: () => easingFn,
    inOut: () => easingFn,
  };
  return {
    __esModule: true,
    default: { View: "Animated.View" },
    useSharedValue: () => ({ value: 0 }),
    useAnimatedStyle: (factory: () => unknown) => factory(),
    withRepeat: (value: unknown) => value,
    withTiming: (value: unknown) => value,
    Easing,
  };
});

import { SkeletonMessage } from "../src/components/SkeletonMessage";

describe("SkeletonMessage responsive width", () => {
  function render(element: React.ReactElement) {
    let tree!: ReactTestRenderer;
    act(() => {
      tree = createWithSuppressedWarnings(element);
    });
    return tree;
  }

  it("uses the responsive messageMaxWidth instead of a hardcoded percentage", () => {
    const tree = render(<SkeletonMessage />);

    const container = tree.root.find(
      (node: { props: Record<string, unknown> }) =>
        node.props["accessibilityRole"] === "progressbar",
    );

    const flattened = StyleSheet.flatten(container.props["style"]);
    expect(flattened.maxWidth).toBe(SENTINEL_MAX_WIDTH);
    expect(flattened.maxWidth).not.toBe("75%");
  });
});
