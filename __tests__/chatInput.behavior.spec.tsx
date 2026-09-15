import React from "react";
import { AccessibilityInfo, Platform } from "react-native";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { MESSAGE_CONSTANTS } from "../src/constants/appConstants";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  const AnimatedMock = {
    View,
    createAnimatedComponent: <P,>(Component: React.ComponentType<P>) =>
      Component,
    useSharedValue: (value: unknown) => {
      const sv = {
        value,
        get: () => sv.value,
        set: (next: unknown) => {
          sv.value = next;
        },
      };
      return sv;
    },
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
  LiquidGlassWrapper: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
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
    bubbleTextOnBlue: "#ffffff",
    tint: "#c7c7cc",
    isDark: true,
  }),
}));

const { ChatInput } =
  require("../src/components/ChatInput") as typeof import("../src/components/ChatInput");

function renderChatInput(
  props: Partial<React.ComponentProps<typeof ChatInput>> = {},
) {
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
    const onSendMessage = jest.fn(async () => true);
    const tree = renderChatInput({ onSendMessage });

    const sendBtn = () => tree.root.findByProps({ testID: "chat-input-send" });
    // Disc fill lives on the Animated.View wrapper; the pressable exposes state.
    expect(sendBtn().props["accessibilityState"]).toEqual({ disabled: true });

    act(() => {
      tree.root
        .findByProps({ testID: "chat-input-field" })
        .props["onChangeText"]("  hello dns  ");
    });

    expect(sendBtn().props["accessibilityState"]).toEqual({ disabled: false });

    act(() => {
      sendBtn().props["onPress"]();
    });

    expect(onSendMessage).toHaveBeenCalledTimes(1);
    expect(onSendMessage).toHaveBeenCalledWith("hello dns");
    expect(mockHaptics.medium).toHaveBeenCalledTimes(1);
    expect(
      tree.root.findByProps({ testID: "chat-input-field" }).props["value"],
    ).toBe("");
  });

  it("restores the text when the send is rejected before anything was sent", async () => {
    // A rejected send (validation, busy) stores and sends nothing, so wiping
    // the composer would silently discard what the user typed.
    const onSendMessage = jest.fn(async () => false);
    const tree = renderChatInput({ onSendMessage });
    const field = () => tree.root.findByProps({ testID: "chat-input-field" });

    act(() => {
      field().props["onChangeText"]("\u{1F600}\u{1F600}");
    });
    await act(async () => {
      await tree.root
        .findByProps({ testID: "chat-input-send" })
        .props["onPress"]();
    });

    expect(onSendMessage).toHaveBeenCalledWith("\u{1F600}\u{1F600}");
    expect(field().props["value"]).toBe("\u{1F600}\u{1F600}");
  });

  it("keeps a newer draft typed while a rejected send was settling", async () => {
    let settle: (accepted: boolean) => void = () => {};
    const onSendMessage = jest.fn(
      () =>
        new Promise<boolean>((resolve) => {
          settle = resolve;
        }),
    );
    const tree = renderChatInput({ onSendMessage });
    const field = () => tree.root.findByProps({ testID: "chat-input-field" });

    act(() => {
      field().props["onChangeText"]("first");
    });
    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = tree.root
        .findByProps({ testID: "chat-input-send" })
        .props["onPress"]();
    });
    // Typing a new draft happens well after the send's autocorrect echo window.
    const now = jest.spyOn(Date, "now").mockReturnValue(Date.now() + 5_000);
    act(() => {
      field().props["onChangeText"]("second");
    });
    await act(async () => {
      settle(false);
      await pending;
    });
    now.mockRestore();

    expect(field().props["value"]).toBe("second");
  });

  it("clears the autocorrect echo iOS reports right after a send, but not later typing", async () => {
    // Runtime finding on the iOS 27 simulator: sending with a suggestion
    // pending ("cao" -> "cão") put the corrected sent text back in the composer.
    const now = jest.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      const onSendMessage = jest.fn(async () => true);
      const tree = renderChatInput({ onSendMessage });
      const field = () => tree.root.findByProps({ testID: "chat-input-field" });

      act(() => {
        field().props["onChangeText"]("o que e um cao");
      });
      await act(async () => {
        await tree.root
          .findByProps({ testID: "chat-input-send" })
          .props["onPress"]();
      });
      now.mockReturnValue(1_050);
      act(() => {
        field().props["onChangeText"]("o que e um cão");
      });
      expect(field().props["value"]).toBe("");

      now.mockReturnValue(3_000);
      act(() => {
        field().props["onChangeText"]("next question");
      });
      expect(field().props["value"]).toBe("next question");
    } finally {
      now.mockRestore();
    }
  });

  it("keeps genuine input typed or pasted right after a send", async () => {
    // Only the native autocorrect echo of the sent text is suppressed; a new
    // draft that starts inside the echo window must survive.
    const now = jest.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      const onSendMessage = jest.fn(async () => true);
      const tree = renderChatInput({ onSendMessage });
      const field = () => tree.root.findByProps({ testID: "chat-input-field" });

      act(() => {
        field().props["onChangeText"]("o que e um cao");
      });
      await act(async () => {
        await tree.root
          .findByProps({ testID: "chat-input-send" })
          .props["onPress"]();
      });
      now.mockReturnValue(1_100);
      act(() => {
        field().props["onChangeText"]("o");
      });
      expect(field().props["value"]).toBe("o");
      act(() => {
        field().props["onChangeText"]("o que e um cao, e um gato?");
      });
      expect(field().props["value"]).toBe("o que e um cao, e um gato?");
    } finally {
      now.mockRestore();
    }
  });

  it.each(["h", "hello", "ha"])(
    "keeps %s typed or pasted right after sending a short single word",
    async (draft) => {
      const now = jest.spyOn(Date, "now").mockReturnValue(1_000);
      try {
        const onSendMessage = jest.fn(async () => true);
        const tree = renderChatInput({ onSendMessage });
        const field = () =>
          tree.root.findByProps({ testID: "chat-input-field" });

        act(() => {
          field().props["onChangeText"]("hi");
        });
        await act(async () => {
          await tree.root
            .findByProps({ testID: "chat-input-send" })
            .props["onPress"]();
        });
        now.mockReturnValue(1_050);
        act(() => {
          field().props["onChangeText"](draft);
        });
        expect(field().props["value"]).toBe(draft);
      } finally {
        now.mockRestore();
      }
    },
  );

  it("never suppresses input on platforms without the iOS autocorrect echo", async () => {
    const originalPlatform = Platform.OS;
    Platform.OS = "android";
    const now = jest.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      const onSendMessage = jest.fn(async () => true);
      const tree = renderChatInput({ onSendMessage });
      const field = () => tree.root.findByProps({ testID: "chat-input-field" });

      act(() => {
        field().props["onChangeText"]("o que e um cao");
      });
      await act(async () => {
        await tree.root
          .findByProps({ testID: "chat-input-send" })
          .props["onPress"]();
      });
      now.mockReturnValue(1_050);
      act(() => {
        field().props["onChangeText"]("o que e um cão");
      });
      expect(field().props["value"]).toBe("o que e um cão");
    } finally {
      now.mockRestore();
      Platform.OS = originalPlatform;
    }
  });

  it("does not send whitespace-only or loading messages", () => {
    const onSendMessage = jest.fn();
    const tree = renderChatInput({ onSendMessage });

    act(() => {
      tree.root
        .findByProps({ testID: "chat-input-field" })
        .props["onChangeText"]("   ");
      tree.root.findByProps({ testID: "chat-input-send" }).props["onPress"]();
    });

    expect(onSendMessage).not.toHaveBeenCalled();

    act(() => {
      tree.update(
        <ChatInput
          onSendMessage={onSendMessage}
          isLoading
          testID="chat-input"
        />,
      );
      tree.root
        .findByProps({ testID: "chat-input-field" })
        .props["onChangeText"]("send");
      tree.root.findByProps({ testID: "chat-input-send" }).props["onPress"]();
    });

    expect(onSendMessage).not.toHaveBeenCalled();
  });

  it("shows the counter after the documented threshold and announces only milestone remaining counts", () => {
    const announceSpy = jest.spyOn(
      AccessibilityInfo,
      "announceForAccessibility",
    );
    const tree = renderChatInput();
    const nearLimit = "x".repeat(MESSAGE_CONSTANTS.MAX_DNS_LABEL_LENGTH - 9);

    act(() => {
      tree.root
        .findByProps({ testID: "chat-input-field" })
        .props["onChangeText"](nearLimit);
    });

    const rendered = JSON.stringify(tree.toJSON());
    expect(rendered).toContain(String(nearLimit.length));
    expect(rendered).toContain(String(MESSAGE_CONSTANTS.MAX_DNS_LABEL_LENGTH));
    expect(announceSpy).not.toHaveBeenCalled();

    const milestone = "x".repeat(MESSAGE_CONSTANTS.MAX_DNS_LABEL_LENGTH - 5);
    act(() => {
      tree.root
        .findByProps({ testID: "chat-input-field" })
        .props["onChangeText"](milestone);
    });

    expect(announceSpy).toHaveBeenCalledWith(
      "components.chatInput.charactersRemaining:5",
    );
  });
});
