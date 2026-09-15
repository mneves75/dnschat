import React from "react";
import { act } from "react-test-renderer";
import type { ReactTestInstance, ReactTestRenderer } from "react-test-renderer";
import type { Message } from "../src/types/chat";
import { LiquidGlassSpacing } from "../src/ui/theme/liquidGlassSpacing";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

let mockPlatformOS = "ios";
jest.mock("react-native", () => {
  const actual = jest.requireActual("./mocks/react-native");
  return {
    ...actual,
    Platform: {
      ...actual.Platform,
      get OS() {
        return mockPlatformOS;
      },
    },
  };
});

jest.mock("../src/components/MessageBubble", () => ({
  MessageBubble: () => null,
}));
jest.mock("../src/components/SkeletonMessage", () => ({
  SkeletonMessage: () => null,
}));
jest.mock("../src/components/LiquidGlassWrapper", () => ({
  LiquidGlassWrapper: ({ children }: { children?: React.ReactNode }) =>
    children,
  useLiquidGlassCapabilities: () => ({ supportsLiquidGlass: false }),
}));
jest.mock("../src/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("../src/ui/hooks/useTypography", () => ({
  useTypography: () => ({ title2: {}, subheadline: {} }),
}));
jest.mock("../src/ui/theme/imessagePalette", () => ({
  useImessagePalette: () => ({}),
}));

let mockReduceMotion = false;
jest.mock("../src/context/AccessibilityContext", () => ({
  useMotionReduction: () => ({ shouldReduceMotion: mockReduceMotion }),
}));

const { MessageList } =
  require("../src/components/MessageList") as typeof import("../src/components/MessageList");

const assistant = (id: string, content = "hello"): Message => ({
  id,
  role: "assistant",
  content,
  timestamp: new Date("2026-09-15T12:00:00Z"),
  status: "sent",
});

type ScrollEndGlobal = typeof globalThis & {
  __RN_FLATLIST_SCROLL_TO_END?: jest.Mock;
};

describe("MessageList keyboard inset behavior", () => {
  let tree: ReactTestRenderer | undefined;
  let frames: FrameRequestCallback[];
  let scrollToEnd: jest.Mock;
  const originalRaf = global.requestAnimationFrame;
  const originalCancelRaf = global.cancelAnimationFrame;

  const element = (messages: Message[], bottomInset: number) =>
    React.createElement(MessageList, {
      messages,
      bottomInset,
      testID: "messages",
    });

  const render = (messages: Message[], bottomInset: number) => {
    act(() => {
      tree = createWithSuppressedWarnings(element(messages, bottomInset));
    });
    return tree!;
  };

  // The list scrolls after two animation frames; run until no frame is pending.
  const flushFrames = () => {
    for (let pass = 0; pass < 4 && frames.length > 0; pass++) {
      const pending = frames.splice(0);
      act(() => pending.forEach((callback) => callback(0)));
    }
  };

  const list = (rendered: ReactTestRenderer): ReactTestInstance =>
    rendered.root.find(
      (node) =>
        (node.type as unknown) === "FlatList" &&
        node.props["testID"] === "messages",
    );

  const footerHeight = (rendered: ReactTestRenderer) =>
    (
      list(rendered).props["ListFooterComponent"] as React.ReactElement<{
        style: { height: number };
      }>
    ).props.style.height;

  const scrollAwayFromBottom = (rendered: ReactTestRenderer) => {
    act(() =>
      list(rendered).props["onScroll"]({
        nativeEvent: {
          contentOffset: { y: 0 },
          contentSize: { height: 2000 },
          layoutMeasurement: { height: 600 },
        },
      }),
    );
  };

  beforeEach(() => {
    mockPlatformOS = "ios";
    mockReduceMotion = false;
    frames = [];
    scrollToEnd = jest.fn();
    (globalThis as ScrollEndGlobal).__RN_FLATLIST_SCROLL_TO_END = scrollToEnd;
    global.requestAnimationFrame = ((callback: FrameRequestCallback) =>
      frames.push(callback)) as typeof global.requestAnimationFrame;
    global.cancelAnimationFrame = () => undefined;
  });

  afterEach(() => {
    act(() => tree?.unmount());
    tree = undefined;
    global.requestAnimationFrame = originalRaf;
    global.cancelAnimationFrame = originalCancelRaf;
    delete (globalThis as ScrollEndGlobal).__RN_FLATLIST_SCROLL_TO_END;
  });

  it("reserves the keyboard/input inset as scrollable footer content and rescrolls when it changes", () => {
    const messages = [assistant("m1")];
    const rendered = render(messages, 0);
    flushFrames();
    expect(footerHeight(rendered)).toBe(LiquidGlassSpacing.xs);
    scrollToEnd.mockClear();

    act(() => rendered.update(element(messages, 320)));

    expect(footerHeight(rendered)).toBe(LiquidGlassSpacing.xs + 320);
    flushFrames();
    expect(scrollToEnd).toHaveBeenCalledTimes(1);
    expect(scrollToEnd).toHaveBeenCalledWith({ animated: true });
  });

  it("rescrolls without animation on an inset change when Reduce Motion is on", () => {
    mockReduceMotion = true;
    const messages = [assistant("m1")];
    const rendered = render(messages, 0);
    flushFrames();
    scrollToEnd.mockClear();

    act(() => rendered.update(element(messages, 280)));
    flushFrames();

    expect(scrollToEnd).toHaveBeenCalledWith({ animated: false });
  });

  it("does not yank a reader who scrolled up when only the inset changes, but follows a new message", () => {
    const messages = [assistant("m1")];
    const rendered = render(messages, 0);
    flushFrames();
    scrollAwayFromBottom(rendered);
    scrollToEnd.mockClear();

    act(() => rendered.update(element(messages, 320)));
    flushFrames();
    expect(scrollToEnd).not.toHaveBeenCalled();

    act(() =>
      rendered.update(element([...messages, assistant("m2", "reply")], 320)),
    );
    flushFrames();
    expect(scrollToEnd).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["ios", "interactive"],
    ["android", "on-drag"],
  ])(
    "lets a drag dismiss the keyboard on %s (%s)",
    (platform, expectedMode) => {
      mockPlatformOS = platform;
      const rendered = render([assistant("m1")], 0);

      expect(list(rendered).props["keyboardDismissMode"]).toBe(expectedMode);
      expect(list(rendered).props["keyboardShouldPersistTaps"]).toBe("handled");
    },
  );
});
