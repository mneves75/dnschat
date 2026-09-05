import React from "react";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { MessageList } from "../src/components/MessageList";
import { LiquidGlassSpacing } from "../src/ui/theme/liquidGlassSpacing";
import type { Message } from "../src/types/chat";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

jest.mock("../src/components/MessageBubble", () => ({
  MessageBubble: ({ message }: { message: Message }) =>
    React.createElement("message-bubble", { testID: `message-${message.id}` }),
}));

jest.mock("../src/components/LiquidGlassWrapper", () => ({
  LiquidGlassWrapper: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useLiquidGlassCapabilities: () => ({ supportsLiquidGlass: false }),
}));

jest.mock("../src/components/SkeletonMessage", () => ({
  SkeletonMessage: () =>
    React.createElement("skeleton-message", { testID: "message-skeleton" }),
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

let mockReduceMotion = false;
jest.mock("../src/context/AccessibilityContext", () => ({
  useMotionReduction: () => ({ shouldReduceMotion: mockReduceMotion }),
}));

const baseMessage: Message = {
  id: "m1",
  role: "assistant",
  content: "hello",
  timestamp: new Date(),
  status: "sent",
};

describe("MessageList behavior", () => {
  let originalRequestAnimationFrame:
    | typeof global.requestAnimationFrame
    | undefined;
  let originalCancelAnimationFrame: typeof global.cancelAnimationFrame;
  let frames: Map<number, FrameRequestCallback>;
  let frameId: number;
  let trees: ReactTestRenderer[];
  let scrollToEnd: jest.Mock;

  beforeEach(() => {
    originalRequestAnimationFrame = global.requestAnimationFrame;
    originalCancelAnimationFrame = global.cancelAnimationFrame;
    mockReduceMotion = false;
    frames = new Map();
    frameId = 0;
    trees = [];
    scrollToEnd = jest.fn();
    (
      globalThis as typeof globalThis & {
        __RN_FLATLIST_SCROLL_TO_END?: jest.Mock;
      }
    ).__RN_FLATLIST_SCROLL_TO_END = scrollToEnd;
    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      frames.set(++frameId, callback);
      return frameId;
    }) as typeof global.requestAnimationFrame;
    global.cancelAnimationFrame = (id) => {
      if (typeof id === "number") frames.delete(id);
    };
  });

  afterEach(() => {
    act(() => trees.forEach((tree) => tree.unmount()));
    global.cancelAnimationFrame = originalCancelAnimationFrame;
    if (originalRequestAnimationFrame) {
      global.requestAnimationFrame = originalRequestAnimationFrame;
    } else {
      delete (
        global as typeof globalThis & {
          requestAnimationFrame?: typeof global.requestAnimationFrame;
        }
      ).requestAnimationFrame;
    }
    delete (
      globalThis as typeof globalThis & {
        __RN_FLATLIST_SCROLL_TO_END?: jest.Mock;
      }
    ).__RN_FLATLIST_SCROLL_TO_END;
  });

  function render(messages: Message[], bottomInset = 0) {
    let tree!: ReactTestRenderer;
    act(() => {
      tree = createWithSuppressedWarnings(
        <MessageList
          messages={messages}
          bottomInset={bottomInset}
          testID="messages"
        />,
      );
    });
    trees.push(tree);
    return tree;
  }

  function flushFrame() {
    const pending = Array.from(frames.values());
    frames.clear();
    act(() => pending.forEach((callback) => callback(0)));
  }

  it("scrolls to the end when messages render or update", () => {
    const tree = render([baseMessage]);
    flushFrame();
    flushFrame();
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

    flushFrame();
    flushFrame();
    expect(scrollToEnd).toHaveBeenCalledWith({ animated: true });
  });

  it("includes the reserved bottom inset in the footer content", () => {
    const tree = render([baseMessage], 42);
    const flatList = tree.root.find(
      (node: { type: unknown; props: Record<string, unknown> }) =>
        node.type === "FlatList" && node.props["testID"] === "messages",
    );
    // ListFooterComponent is an element (not a render function) so bottomInset
    // changes re-render the footer in place instead of remounting it.
    const footer = flatList.props["ListFooterComponent"] as React.ReactElement;
    const footerProps = footer.props as Record<string, unknown>;

    expect(footerProps["testID"]).toBe("message-list-footer");
    expect(footerProps["style"]).toEqual({
      height: LiquidGlassSpacing.xs + 42,
    });
  });

  it.each([0, 1])(
    "cancels an unmounted scroll after %i completed frames",
    (completedFrames) => {
      const tree = render([baseMessage]);
      for (let i = 0; i < completedFrames; i++) flushFrame();
      expect(frames.size).toBe(1);
      expect(scrollToEnd).not.toHaveBeenCalled();
      act(() => tree.unmount());
      expect(frames.size).toBe(0);
      flushFrame();
      flushFrame();
      expect(scrollToEnd).not.toHaveBeenCalled();
    },
  );

  it("scrolls without animation when reduced motion is enabled", () => {
    mockReduceMotion = true;
    render([baseMessage]);
    flushFrame();
    flushFrame();
    expect(scrollToEnd).toHaveBeenCalledWith({ animated: false });
  });

  it("renders the loading skeleton and then the empty-state text", () => {
    const tree = render([]);
    act(() =>
      tree.update(<MessageList messages={[]} isLoading testID="messages" />),
    );
    const list = () => tree.root.findByType("FlatList" as React.ElementType);
    let empty!: ReactTestRenderer;
    act(() => {
      empty = createWithSuppressedWarnings(list().props["ListEmptyComponent"]);
    });
    trees.push(empty);
    expect(
      empty.root.findByProps({ testID: "message-skeleton" }),
    ).toBeDefined();
    act(() => tree.update(<MessageList messages={[]} testID="messages" />));
    act(() => empty.update(list().props["ListEmptyComponent"]));
    expect(
      empty.root.findAllByProps({ testID: "message-skeleton" }),
    ).toHaveLength(0);
    expect(JSON.stringify(empty.toJSON())).toContain(
      "screen.chat.emptyState.title",
    );
    expect(JSON.stringify(empty.toJSON())).toContain(
      "screen.chat.emptyState.description",
    );
  });

  it("wires refresh state and callback into the refresh control", () => {
    const tree = render([]);
    const onRefresh = jest.fn();
    act(() =>
      tree.update(
        <MessageList
          messages={[]}
          onRefresh={onRefresh}
          isRefreshing
          testID="messages"
        />,
      ),
    );
    const list = tree.root.findByType("FlatList" as React.ElementType);
    const refresh = list.props["refreshControl"];
    expect(refresh.props.refreshing).toBe(true);
    act(() => refresh.props.onRefresh());
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
