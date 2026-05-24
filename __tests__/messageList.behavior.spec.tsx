import React from "react";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { MessageList } from "../src/components/MessageList";
import { LiquidGlassSpacing } from "../src/ui/theme/liquidGlassSpacing";
import type { Message } from "../src/types/chat";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

jest.mock("../src/components/MessageBubble", () => ({
  MessageBubble: ({ message }: { message: Message }) => (
    React.createElement("message-bubble", { testID: `message-${message.id}` })
  ),
}));

jest.mock("../src/components/LiquidGlassWrapper", () => ({
  LiquidGlassWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLiquidGlassCapabilities: () => ({ supportsLiquidGlass: false }),
}));

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("../src/ui/hooks/useTypography", () => ({
  useTypography: () => ({
    title2: { fontSize: 22, lineHeight: 28, letterSpacing: 0 },
    subheadline: { fontSize: 15, lineHeight: 20, letterSpacing: 0 },
  }),
}));

jest.mock("../src/ui/theme/imessagePalette", () => ({
  useImessagePalette: () => ({
    accentTint: "#0a84ff",
    userBubble: "#007aff",
    surface: "#ffffff",
    textPrimary: "#111111",
    textSecondary: "#444444",
  }),
}));

const baseMessage: Message = {
  id: "m1",
  role: "assistant",
  content: "hello",
  timestamp: new Date(),
  status: "sent",
};

describe("MessageList behavior", () => {
  let originalRequestAnimationFrame: typeof global.requestAnimationFrame | undefined;
  let scrollToEnd: jest.Mock;

  beforeEach(() => {
    originalRequestAnimationFrame = global.requestAnimationFrame;
    scrollToEnd = jest.fn();
    (globalThis as typeof globalThis & {
      __RN_FLATLIST_SCROLL_TO_END?: jest.Mock;
    }).__RN_FLATLIST_SCROLL_TO_END = scrollToEnd;
    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    }) as typeof global.requestAnimationFrame;
  });

  afterEach(() => {
    if (originalRequestAnimationFrame) {
      global.requestAnimationFrame = originalRequestAnimationFrame;
    } else {
      delete (global as typeof globalThis & {
        requestAnimationFrame?: typeof global.requestAnimationFrame;
      }).requestAnimationFrame;
    }
    delete (globalThis as typeof globalThis & {
      __RN_FLATLIST_SCROLL_TO_END?: jest.Mock;
    }).__RN_FLATLIST_SCROLL_TO_END;
  });

  function render(messages: Message[], bottomInset = 0) {
    let tree!: ReactTestRenderer;
    act(() => {
      tree = createWithSuppressedWarnings(
        <MessageList messages={messages} bottomInset={bottomInset} testID="messages" />,
      );
    });
    return tree;
  }

  it("scrolls to the end when messages render or update", () => {
    const tree = render([baseMessage]);
    expect(scrollToEnd).toHaveBeenCalledWith({ animated: true });

    scrollToEnd.mockClear();
    act(() => {
      tree.update(
        <MessageList
          messages={[{ ...baseMessage, content: "hello again" }]}
          bottomInset={0}
          testID="messages"
        />,
      );
    });

    expect(scrollToEnd).toHaveBeenCalledWith({ animated: true });
  });

  it("includes the reserved bottom inset in the footer content", () => {
    const tree = render([baseMessage], 42);
    const flatList = tree.root.find(
      (node: { type: unknown; props: Record<string, unknown> }) =>
        node.type === "FlatList" && node.props["testID"] === "messages",
    );
    const footer = (flatList.props["ListFooterComponent"] as () => React.ReactElement)();
    const footerProps = footer.props as Record<string, unknown>;

    expect(footerProps["testID"]).toBe("message-list-footer");
    expect(footerProps["style"]).toEqual({ height: LiquidGlassSpacing.xs + 42 });
  });
});
