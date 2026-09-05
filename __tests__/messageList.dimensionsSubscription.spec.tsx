/**
 * Regression: MessageBubble called useResponsiveLayout() (and therefore
 * useWindowDimensions()) once per row, so a 20-message thread opened 20
 * dimensions subscriptions for one value that only changes on rotation.
 * The list reads it once and passes the resolved pixel width down.
 */
import React from "react";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { useWindowDimensions } from "react-native";
import type { Message } from "../src/types/chat";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

jest.mock("react-native", () => {
  const ReactModule = require("react");
  const actual = jest.requireActual("./mocks/react-native");

  // The shared FlatList stub never renders rows; this one does, so per-row hook
  // calls are actually observable.
  const FlatList = ReactModule.forwardRef(
    (
      props: {
        data?: readonly unknown[];
        renderItem?: (info: unknown) => React.ReactNode;
        children?: React.ReactNode;
      },
      ref: React.Ref<unknown>,
    ) => {
      ReactModule.useImperativeHandle(ref, () => ({ scrollToEnd: () => {} }));
      return ReactModule.createElement(
        "FlatList",
        props,
        (props.data ?? []).map((item: unknown, index: number) =>
          ReactModule.createElement(
            "Cell",
            { key: index },
            props.renderItem?.({ item, index, separators: {} }),
          ),
        ),
      );
    },
  );
  FlatList.displayName = "FlatList";

  return {
    ...actual,
    Platform: {
      ...actual.Platform,
      select: (values: Record<string, unknown>) =>
        values["ios"] ?? values["default"],
    },
    FlatList,
    useWindowDimensions: jest.fn(() => ({
      width: 402,
      height: 874,
      scale: 3,
      fontScale: 1,
    })),
  };
});

jest.mock("../src/components/LiquidGlassWrapper", () => ({
  LiquidGlassWrapper: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useLiquidGlassCapabilities: () => ({ supportsLiquidGlass: false }),
}));

jest.mock("../src/components/SkeletonMessage", () => ({
  SkeletonMessage: () => null,
}));

jest.mock("../src/components/MessageContent", () => ({
  MessageContent: () => null,
}));

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../src/ui/hooks/useTypography", () => ({
  useTypography: () => ({
    body: { fontSize: 17 },
    footnote: { fontSize: 13 },
    title2: { fontSize: 22 },
    subheadline: { fontSize: 15 },
  }),
}));

jest.mock("../src/ui/theme/imessagePalette", () => ({
  useImessagePalette: () => ({}),
}));

jest.mock("../src/ui/theme/resolvedColorScheme", () => ({
  useResolvedColorScheme: () => "light",
}));

jest.mock("../src/context/SettingsContext", () => ({
  useLocale: () => "en-US",
}));

jest.mock("../src/context/AccessibilityContext", () => ({
  useMotionReduction: () => ({ shouldReduceMotion: true }),
}));

jest.mock("../src/utils/haptics", () => ({
  HapticFeedback: { light: jest.fn() },
}));
jest.mock("../src/services/ClipboardService", () => ({ ClipboardService: {} }));
jest.mock("../src/services/ShareService", () => ({ ShareService: {} }));

import { MessageList } from "../src/components/MessageList";

const messages: Message[] = Array.from({ length: 20 }, (_, index) => ({
  id: `m${index}`,
  role: index % 2 === 0 ? "user" : "assistant",
  content: `message ${index}`,
  timestamp: new Date("2026-09-05T12:00:00Z"),
  status: "sent",
}));

describe("MessageList window-dimensions subscriptions", () => {
  let tree: ReactTestRenderer;

  beforeAll(() => {
    global.requestAnimationFrame = (() => 0) as typeof requestAnimationFrame;
    global.cancelAnimationFrame = (() => {}) as typeof cancelAnimationFrame;
  });

  afterEach(() => act(() => tree?.unmount()));

  it("reads the window dimensions once for the whole list", () => {
    jest.mocked(useWindowDimensions).mockClear();

    act(() => {
      tree = createWithSuppressedWarnings(
        <MessageList messages={messages} testID="messages" />,
      );
    });

    expect(
      tree.root.findAll((node: { type: unknown }) => node.type === "Cell"),
    ).toHaveLength(20);
    expect(useWindowDimensions).toHaveBeenCalledTimes(1);
  });
});
