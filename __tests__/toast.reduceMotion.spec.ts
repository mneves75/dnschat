import React from "react";
import { StyleSheet } from "react-native";
import { act } from "react-test-renderer";
import type { ReactTestInstance, ReactTestRenderer } from "react-test-renderer";
import type { ToastProps } from "../src/components/ui/Toast";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

/**
 * The shared reanimated mock resolves animations synchronously, which would
 * make "animated" and "snapped" indistinguishable. Here withSpring/withTiming
 * return an animation descriptor instead, so a shared value holding a plain
 * number proves the reduce-motion path skipped the animation, and the spring's
 * completion callback is captured so dismissal can be finished explicitly.
 * useAnimatedStyle reads lazily because the toast writes its shared values in
 * an effect, after the render that built the style object.
 */
type SpringDescriptor = {
  animation: "spring" | "timing";
  toValue: number;
  callback?: (finished: boolean) => void;
};

const mockSpringCallbacks: Array<(finished: boolean) => void> = [];

jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("./mocks/react-native-reanimated");
  return {
    ...actual,
    useAnimatedStyle: (factory: () => Record<string, unknown>) =>
      new Proxy({}, { get: (_target, key: string) => factory()[key] }),
    withSpring: (
      toValue: number,
      _config: unknown,
      callback?: (finished: boolean) => void,
    ) => {
      if (callback) mockSpringCallbacks.push(callback);
      return { animation: "spring", toValue, callback };
    },
    withTiming: (toValue: number) => ({ animation: "timing", toValue }),
  };
});

let mockReduceMotion = false;
jest.mock("../src/context/AccessibilityContext", () => ({
  useMotionReduction: () => ({ shouldReduceMotion: mockReduceMotion }),
}));
jest.mock("../src/utils/haptics", () => ({
  HapticFeedback: {
    light: jest.fn(),
    medium: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock("../src/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("../src/ui/hooks/useTypography", () => ({
  useTypography: () => ({ headline: {}, body: {}, callout: {} }),
}));
const mockPalette = {
  success: "#00aa00",
  warning: "#ffaa00",
  destructive: "#dd0000",
  accentTint: "#0a84ff",
  textOnChroma: "#123456",
};
jest.mock("../src/ui/theme/imessagePalette", () => ({
  useImessagePalette: () => mockPalette,
}));

const { Toast } =
  require("../src/components/ui/Toast") as typeof import("../src/components/ui/Toast");

const isHost = (node: ReactTestInstance, name: string) =>
  (node.type as unknown) === name;

type AnimatedStyle = {
  transform: [{ translateY: number | SpringDescriptor }];
  opacity: number | SpringDescriptor;
};

describe("Toast reduce-motion and bounded-content behavior", () => {
  let tree: ReactTestRenderer | undefined;

  const props = (overrides: Partial<ToastProps> = {}): ToastProps => ({
    message: "Resolver unreachable",
    title: "DNS",
    visible: true,
    onDismiss: jest.fn(),
    testID: "toast",
    ...overrides,
  });

  const render = (toastProps: ToastProps) => {
    act(() => {
      tree = createWithSuppressedWarnings(
        React.createElement(Toast, toastProps),
      );
    });
    return tree!;
  };

  const animatedStyle = (rendered: ReactTestRenderer): AnimatedStyle => {
    const container = rendered.root.find(
      (node) =>
        typeof node.type === "string" && node.props["testID"] === "toast",
    );
    const styles = container.props["style"] as unknown[];
    const live = styles[styles.length - 1] as AnimatedStyle;
    return { transform: live.transform, opacity: live.opacity };
  };

  const texts = (rendered: ReactTestRenderer) =>
    rendered.root.findAll((node) => isHost(node, "Text"));

  const textWithChild = (rendered: ReactTestRenderer, child: string) =>
    texts(rendered).find((node) => node.props["children"] === child)!;

  const dismissButton = (rendered: ReactTestRenderer): ReactTestInstance =>
    rendered.root.find(
      (node) =>
        isHost(node, "Pressable") &&
        node.props["accessibilityLabel"] === "common.close",
    );

  beforeEach(() => {
    mockReduceMotion = false;
    mockSpringCallbacks.length = 0;
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => tree?.unmount());
    tree = undefined;
    jest.useRealTimers();
  });

  it("jumps straight to the shown and hidden end states without spring/timing when motion is reduced", () => {
    mockReduceMotion = true;
    const onDismiss = jest.fn();
    const rendered = render(props({ onDismiss }));

    expect(animatedStyle(rendered)).toEqual({
      transform: [{ translateY: 0 }],
      opacity: 1,
    });

    act(() => dismissButton(rendered).props["onPress"]());

    // Dismissal is immediate: no spring completion is needed to notify.
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(mockSpringCallbacks).toHaveLength(0);
    expect(animatedStyle(rendered)).toEqual({
      transform: [{ translateY: -200 }],
      opacity: 0,
    });
  });

  it("springs in and notifies dismissal only after the exit spring finishes when motion is not reduced", () => {
    const onDismiss = jest.fn();
    const rendered = render(props({ onDismiss, position: "bottom" }));

    expect(animatedStyle(rendered).transform[0].translateY).toMatchObject({
      animation: "spring",
      toValue: 0,
    });
    expect(animatedStyle(rendered).opacity).toMatchObject({
      animation: "timing",
      toValue: 1,
    });

    act(() => dismissButton(rendered).props["onPress"]());
    expect(onDismiss).not.toHaveBeenCalled();
    expect(mockSpringCallbacks).toHaveLength(1);

    act(() => mockSpringCallbacks[0]!(true));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("auto-dismisses informational toasts but keeps error toasts until the user dismisses them", () => {
    mockReduceMotion = true;
    const infoDismiss = jest.fn();
    render(props({ variant: "info", duration: 1000, onDismiss: infoDismiss }));
    act(() => jest.advanceTimersByTime(1000));
    expect(infoDismiss).toHaveBeenCalledTimes(1);
    act(() => tree?.unmount());

    const errorDismiss = jest.fn();
    render(
      props({ variant: "error", duration: 1000, onDismiss: errorDismiss }),
    );
    act(() => jest.advanceTimersByTime(60_000));
    expect(errorDismiss).not.toHaveBeenCalled();
  });

  it.each([
    ["error", 3],
    ["info", 2],
  ] as const)(
    "bounds %s toast text to a single-line title and %i message lines inside a height cap",
    (variant, messageLines) => {
      const rendered = render(props({ variant }));

      expect(textWithChild(rendered, "DNS").props["numberOfLines"]).toBe(1);
      expect(
        textWithChild(rendered, "Resolver unreachable").props["numberOfLines"],
      ).toBe(messageLines);
      const card = rendered.root.find(
        (node) =>
          isHost(node, "View") &&
          StyleSheet.flatten(node.props["style"])?.maxHeight !== undefined,
      );
      expect(StyleSheet.flatten(card.props["style"]).maxHeight).toBe(168);
    },
  );

  it("caps font scaling on the fixed-size icon and dismiss glyphs", () => {
    const rendered = render(props({ variant: "warning" }));

    for (const glyph of ["!", "×"]) {
      const multiplier = textWithChild(rendered, glyph).props[
        "maxFontSizeMultiplier"
      ];
      expect(typeof multiplier).toBe("number");
      expect(multiplier).toBeLessThanOrEqual(1.2);
    }
  });

  it("draws every label on the chroma fill with the palette's textOnChroma token", () => {
    const rendered = render(
      props({ variant: "success", actionLabel: "Retry", onAction: jest.fn() }),
    );

    for (const label of ["DNS", "Resolver unreachable", "Retry", "×"]) {
      expect(
        StyleSheet.flatten(textWithChild(rendered, label).props["style"]).color,
      ).toBe(mockPalette.textOnChroma);
    }
  });
});
