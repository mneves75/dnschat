import React from "react";
import type { ReactTestRenderer } from "react-test-renderer";
import { act } from "react-test-renderer";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

let mockKeyboardHeight = 240;

jest.mock("react-native-keyboard-controller", () => {
  const React = require("react");

  return {
    KeyboardStickyView: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      offset?: { closed?: number; opened?: number };
      style?: unknown;
    }) => React.createElement("KeyboardStickyView", props, children),
    useKeyboardState: <T,>(selector: (state: Record<string, unknown>) => T) =>
      selector({
        height: mockKeyboardHeight,
        isVisible: mockKeyboardHeight > 0,
        duration: 0,
        timestamp: 0,
        target: -1,
        type: "default",
        appearance: "light",
      }),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 20, left: 0 }),
}));

jest.mock("../src/components/onboarding/OnboardingNavigation", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    OnboardingNavigation: () =>
      React.createElement(View, { testID: "mock-onboarding-navigation" }),
  };
});

jest.mock("../src/components/icons/SendIcon", () => ({
  SendIcon: () => null,
}));

jest.mock("../src/services/dnsService", () => ({
  DNSService: { queryLLM: jest.fn() },
}));

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("../src/ui/hooks/useTypography", () => ({
  useTypography: () => ({
    displayMedium: { fontSize: 14, lineHeight: 18, letterSpacing: 0 },
    title1: { fontSize: 28, lineHeight: 34, letterSpacing: 0 },
    callout: { fontSize: 16, lineHeight: 21, letterSpacing: 0 },
    footnote: { fontSize: 13, lineHeight: 18, letterSpacing: 0 },
    headline: { fontSize: 17, lineHeight: 22, letterSpacing: 0 },
    caption1: { fontSize: 12, lineHeight: 16, letterSpacing: 0 },
  }),
}));

jest.mock("../src/ui/theme/imessagePalette", () => ({
  useImessagePalette: () => ({
    accentTint: "#007aff",
    border: "#d1d1d6",
    solid: "#ffffff",
    surface: "#f2f2f7",
    textPrimary: "#111111",
    textSecondary: "#444444",
    textTertiary: "#777777",
    transparent: "transparent",
  }),
}));

const { FirstChatScreen } = require("../src/components/onboarding/screens/FirstChatScreen") as typeof import("../src/components/onboarding/screens/FirstChatScreen");

function renderFirstChatScreen() {
  let tree!: ReactTestRenderer;

  act(() => {
    tree = createWithSuppressedWarnings(<FirstChatScreen />);
  });

  return tree;
}

function findMessagesScrollView(tree: ReactTestRenderer) {
  return tree.root.find(
    (node: { type: unknown; props: Record<string, unknown> }) =>
      node.type === "ScrollView" &&
      Array.isArray(node.props["contentContainerStyle"]),
  );
}

function findNavigationLayoutHandler(tree: ReactTestRenderer) {
  return tree.root.find(
    (node: { props: Record<string, unknown> }) =>
      typeof node.props["onLayout"] === "function",
  ).props["onLayout"] as (event: {
    nativeEvent: { layout: { height: number } };
  }) => void;
}

function getScrollBottomPadding(tree: ReactTestRenderer) {
  const contentContainerStyle = findMessagesScrollView(tree).props[
    "contentContainerStyle"
  ] as Array<Record<string, unknown>>;

  return contentContainerStyle.find((style) =>
    Object.prototype.hasOwnProperty.call(style, "paddingBottom"),
  )?.["paddingBottom"];
}

function findKeyboardStickyView(tree: ReactTestRenderer) {
  return tree.root.find(
    (node: { type: unknown }) => node.type === "KeyboardStickyView",
  );
}

describe("FirstChatScreen keyboard behavior", () => {
  let originalRequestAnimationFrame: typeof global.requestAnimationFrame | undefined;
  let originalCancelAnimationFrame: typeof global.cancelAnimationFrame | undefined;
  let nextFrameId: number;
  let cancelledFrameIds: number[];

  beforeEach(() => {
    mockKeyboardHeight = 240;
    nextFrameId = 1;
    cancelledFrameIds = [];
    originalRequestAnimationFrame = global.requestAnimationFrame;
    originalCancelAnimationFrame = global.cancelAnimationFrame;
    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return nextFrameId++;
    }) as typeof global.requestAnimationFrame;
    global.cancelAnimationFrame = ((frameId: number) => {
      cancelledFrameIds.push(frameId);
    }) as typeof global.cancelAnimationFrame;
  });

  afterEach(() => {
    if (originalRequestAnimationFrame) {
      global.requestAnimationFrame = originalRequestAnimationFrame;
    } else {
      delete (global as typeof globalThis & {
        requestAnimationFrame?: typeof global.requestAnimationFrame;
      }).requestAnimationFrame;
    }

    if (originalCancelAnimationFrame) {
      global.cancelAnimationFrame = originalCancelAnimationFrame;
    } else {
      delete (global as typeof globalThis & {
        cancelAnimationFrame?: typeof global.cancelAnimationFrame;
      }).cancelAnimationFrame;
    }
  });

  it("offsets the sticky input by navigation height and reserves only remaining keyboard overlap", () => {
    const tree = renderFirstChatScreen();

    expect(getScrollBottomPadding(tree)).toBe(240);

    act(() => {
      findNavigationLayoutHandler(tree)({
        nativeEvent: { layout: { height: 72 } },
      });
    });

    expect(findKeyboardStickyView(tree).props["offset"]).toEqual({
      closed: 0,
      opened: 72,
    });
    expect(getScrollBottomPadding(tree)).toBe(168);

    mockKeyboardHeight = 40;
    act(() => {
      tree.update(<FirstChatScreen />);
    });

    expect(findKeyboardStickyView(tree).props["offset"]).toEqual({
      closed: 0,
      opened: 40,
    });
    expect(getScrollBottomPadding(tree)).toBe(0);
    expect(cancelledFrameIds).toEqual([1, 2]);
  });
});
