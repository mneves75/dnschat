import React from "react";
import { AccessibilityInfo } from "react-native";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { MESSAGE_CONSTANTS } from "../src/constants/appConstants";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  const AnimatedMock = {
    View,
    createAnimatedComponent: <P,>(Component: React.ComponentType<P>) => Component,
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: (fn: () => Record<string, unknown>) => fn(),
    useAnimatedReaction: jest.fn(),
    withTiming: (value: unknown) => value,
    withSpring: (value: unknown) => value,
    runOnJS: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
    Easing: { out: (fn: unknown) => fn, cubic: jest.fn() },
  };
  return { __esModule: true, default: AnimatedMock, ...AnimatedMock };
});

jest.mock("../src/components/LiquidGlassWrapper", () => ({
  LiquidGlassWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLiquidGlassCapabilities: () => ({ supportsLiquidGlass: false }),
}));

jest.mock("../src/components/icons/SendIcon", () => ({
  SendIcon: () => null,
}));

const mockHaptics = {
  light: jest.fn(),
  medium: jest.fn(),
};

jest.mock("../src/utils/haptics", () => ({
  HapticFeedback: mockHaptics,
}));

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      typeof params?.["count"] === "number" ? `${key}:${params["count"]}` : key,
  }),
}));

jest.mock("../src/ui/hooks/useTypography", () => ({
  useTypography: () => ({
    body: { fontSize: 16, lineHeight: 22, letterSpacing: 0 },
  }),
}));

jest.mock("../src/ui/theme/imessagePalette", () => ({
  useImessagePalette: () => ({
    textPrimary: "#111111",
    textSecondary: "#444444",
    textTertiary: "#777777",
    userBubble: "#007aff",
    tint: "#c7c7cc",
  }),
}));

const { ChatInput } = require("../src/components/ChatInput") as typeof import("../src/components/ChatInput");

function renderChatInput(props: Partial<React.ComponentProps<typeof ChatInput>> = {}) {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = createWithSuppressedWarnings(
      <ChatInput onSendMessage={jest.fn()} testID="chat-input" {...props} />,
    );
  });
  return tree;
}

describe("ChatInput behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends one trimmed message and clears the input", () => {
    const onSendMessage = jest.fn();
    const tree = renderChatInput({ onSendMessage });

    act(() => {
      tree.root
        .findByProps({ testID: "chat-input-field" })
        .props["onChangeText"]("  hello dns  ");
    });

    act(() => {
      tree.root.findByProps({ testID: "chat-input-send" }).props["onPress"]();
    });

    expect(onSendMessage).toHaveBeenCalledTimes(1);
    expect(onSendMessage).toHaveBeenCalledWith("hello dns");
    expect(mockHaptics.medium).toHaveBeenCalledTimes(1);
    expect(tree.root.findByProps({ testID: "chat-input-field" }).props["value"]).toBe("");
  });

  it("does not send whitespace-only or loading messages", () => {
    const onSendMessage = jest.fn();
    const tree = renderChatInput({ onSendMessage });

    act(() => {
      tree.root.findByProps({ testID: "chat-input-field" }).props["onChangeText"]("   ");
      tree.root.findByProps({ testID: "chat-input-send" }).props["onPress"]();
    });

    expect(onSendMessage).not.toHaveBeenCalled();

    act(() => {
      tree.update(
        <ChatInput onSendMessage={onSendMessage} isLoading testID="chat-input" />,
      );
      tree.root.findByProps({ testID: "chat-input-field" }).props["onChangeText"]("send");
      tree.root.findByProps({ testID: "chat-input-send" }).props["onPress"]();
    });

    expect(onSendMessage).not.toHaveBeenCalled();
  });

  it("shows the counter after the documented threshold and announces the remaining count", () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, "announceForAccessibility");
    const tree = renderChatInput();
    const nearLimit = "x".repeat(Math.ceil(MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH * 0.92) + 1);

    act(() => {
      tree.root.findByProps({ testID: "chat-input-field" }).props["onChangeText"](nearLimit);
    });

    const rendered = JSON.stringify(tree.toJSON());
    expect(rendered).toContain(String(nearLimit.length));
    expect(rendered).toContain(String(MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH));
    expect(announceSpy).toHaveBeenCalledWith(
      `components.chatInput.charactersRemaining:${MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH - nearLimit.length}`,
    );
  });
});
