import React from "react";
import { StyleSheet } from "react-native";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { MessageBubble } from "../src/components/MessageBubble";
import { NativeMenu } from "../src/components/platform/NativeMenu";
import { resolveMessageMaxWidth } from "../src/ui/hooks/useResponsiveLayout";
import type { Message } from "../src/types/chat";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

jest.mock("react-native", () => {
  const native = jest.requireActual("./mocks/react-native");
  return {
    ...native,
    Platform: {
      ...native.Platform,
      select: (values: Record<string, unknown>) =>
        values["ios"] ?? values["default"],
    },
  };
});
jest.mock("../src/ui/hooks/useTypography", () => ({
  useTypography: () => ({ body: { fontSize: 17 }, footnote: { fontSize: 13 } }),
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
jest.mock("../src/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("../src/utils/haptics", () => ({
  HapticFeedback: { light: jest.fn() },
}));
jest.mock("../src/services/ClipboardService", () => ({ ClipboardService: {} }));
jest.mock("../src/services/ShareService", () => ({ ShareService: {} }));
jest.mock("../src/components/MessageContent", () => ({
  MessageContent: () => null,
}));

const message: Message = {
  id: "wrapped-paragraph",
  role: "assistant",
  content: "Why don't scientists trust atoms? Because they make up everything!",
  timestamp: new Date("2026-09-05T12:00:00Z"),
  status: "sent",
};

describe("MessageBubble native hosted width", () => {
  let tree: ReactTestRenderer;

  afterEach(() => act(() => tree?.unmount()));

  it.each([
    [320, 240],
    [402, 301.5],
    [768, 460.8],
    [1200, 560],
  ])(
    "bounds independently measured menu content at viewport width %i",
    (width, maximum) => {
      // MessageList resolves the percentage once for the whole list; the bubble
      // receives the absolute value.
      expect(resolveMessageMaxWidth(width)).toBeCloseTo(maximum);

      act(() => {
        tree = createWithSuppressedWarnings(
          <MessageBubble
            message={message}
            maxWidth={resolveMessageMaxWidth(width)}
          />,
        );
      });

      const menu = tree.root.findByType(NativeMenu);
      const bubble = menu.props["children"];
      const style = StyleSheet.flatten(bubble.props.style);

      // SwiftUI measures this child in a separate Yoga root, without the outer percentage constraint.
      expect(style.maxWidth).toBeCloseTo(maximum);
      expect(style.width).toBeUndefined();
      expect(menu.props["shouldOpenOnLongPress"]).toBe(true);
      expect(
        menu.props["actions"].map((action: { id: string }) => action.id),
      ).toEqual(["copy", "share"]);
    },
  );
});
