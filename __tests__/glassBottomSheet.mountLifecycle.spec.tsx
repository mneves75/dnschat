/**
 * Regression: GlassBottomSheet always rendered its <Modal>, so every closed
 * sheet still paid for a modal host, three Animated.Values, a window-dimensions
 * subscription and a mount animation. GlassSettings renders four of them.
 * A closed sheet must render nothing, and must stay mounted only until its exit
 * animation finishes.
 */
import React from "react";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";

const animationCompletions: Array<
  ((result: { finished: boolean }) => void) | undefined
> = [];

jest.mock("react-native", () => {
  const ReactModule = require("react");
  const actual = jest.requireActual("./mocks/react-native");
  const noop = () => {};
  const stub = (name: string) => {
    const Component = (props: { children?: React.ReactNode }) =>
      ReactModule.createElement(name, props, props?.children ?? null);
    Component.displayName = name;
    return Component;
  };

  return {
    ...actual,
    TouchableWithoutFeedback: stub("TouchableWithoutFeedback"),
    Animated: {
      Value: class AnimatedValue {
        setValue = noop;
        interpolate = () => 0;
      },
      View: stub("Animated.View"),
      timing: () => ({ start: noop, stop: noop }),
      parallel: () => ({
        start: (callback?: (result: { finished: boolean }) => void) => {
          animationCompletions.push(callback);
        },
        stop: noop,
      }),
      multiply: () => 0,
    },
  };
});

jest.mock("../src/components/LiquidGlassWrapper", () => ({
  LiquidGlassWrapper: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../src/ui/theme/imessagePalette", () => ({
  useImessagePalette: () => ({
    backgroundSecondary: "#f2f2f7",
    separator: "#c6c6c8",
    textTertiary: "#8e8e93",
    textPrimary: "#111111",
    textSecondary: "#444444",
    userBubble: "#007aff",
    destructive: "#ff3b30",
    highlight: "#e5e5ea",
    transparent: "transparent",
  }),
}));

jest.mock("../src/ui/theme/resolvedColorScheme", () => ({
  useResolvedColorScheme: () => "light",
}));

let mockReduceMotion = false;
jest.mock("../src/context/AccessibilityContext", () => ({
  useMotionReduction: () => ({ shouldReduceMotion: mockReduceMotion }),
}));

import { GlassBottomSheet } from "../src/components/glass/GlassBottomSheet";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

const sheet = (visible: boolean) => (
  <GlassBottomSheet visible={visible} onClose={() => {}} title="Sheet">
    <></>
  </GlassBottomSheet>
);

const countModals = (tree: ReactTestRenderer) =>
  tree.root.findAll((node: { type: unknown }) => node.type === "Modal", {
    deep: true,
  }).length;

const finishAnimations = () => {
  const pending = animationCompletions.splice(0);
  act(() => {
    pending.forEach((callback) => callback?.({ finished: true }));
  });
};

describe("GlassBottomSheet mount lifecycle", () => {
  let tree: ReactTestRenderer;

  beforeEach(() => {
    mockReduceMotion = false;
    animationCompletions.length = 0;
  });

  afterEach(() => act(() => tree?.unmount()));

  it("renders nothing while closed", () => {
    act(() => {
      tree = createWithSuppressedWarnings(sheet(false));
    });

    expect(countModals(tree)).toBe(0);
    expect(tree.toJSON()).toBeNull();
  });

  it("mounts on open and unmounts only after the exit animation finishes", () => {
    act(() => {
      tree = createWithSuppressedWarnings(sheet(false));
    });
    expect(countModals(tree)).toBe(0);

    act(() => tree.update(sheet(true)));
    expect(countModals(tree)).toBe(1);

    act(() => tree.update(sheet(false)));
    expect(countModals(tree)).toBe(1);

    finishAnimations();
    expect(countModals(tree)).toBe(0);
  });

  it("keeps the modal accessibility contract when open", () => {
    act(() => {
      tree = createWithSuppressedWarnings(sheet(true));
    });

    const modal = tree.root.find(
      (node: { type: unknown }) => node.type === "Modal",
    );
    expect(modal.props["visible"]).toBe(true);
    expect(modal.props["accessibilityViewIsModal"]).toBe(true);
    expect(modal.props["transparent"]).toBe(true);
    expect(typeof modal.props["onRequestClose"]).toBe("function");
  });
});
