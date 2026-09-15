import React from "react";
import { act } from "react-test-renderer";
import type { ReactTestInstance, ReactTestRenderer } from "react-test-renderer";
import type { ReactElement } from "react";
import type { Chat, Message } from "../src/types/chat";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

const h = React.createElement;

jest.mock("react-native", () => {
  const ReactModule = jest.requireActual<typeof import("react")>("react");
  const actual = jest.requireActual("./mocks/react-native");
  // Resolve render-prop children the way the real Pressable does (unpressed).
  const Pressable = ReactModule.forwardRef(
    ({ children, ...props }: { children?: unknown }, ref: React.Ref<unknown>) =>
      ReactModule.createElement(
        "Pressable",
        { ...props, ref },
        typeof children === "function"
          ? children({ pressed: false })
          : children,
      ),
  );
  return {
    ...actual,
    Pressable,
    Platform: {
      ...actual.Platform,
      select: (values: Record<string, unknown>) =>
        values["ios"] ?? values["default"],
    },
  };
});
jest.mock("../src/i18n", () =>
  require("./utils/accessibilityHarness").englishI18nModule(),
);
jest.mock("../src/ui/theme/imessagePalette", () =>
  require("./utils/accessibilityHarness").tokenPaletteModule(),
);
jest.mock("../src/context/AccessibilityContext", () =>
  require("./utils/accessibilityHarness").accessibilityContextModule(),
);
jest.mock("../src/components/LiquidGlassWrapper", () =>
  require("./utils/accessibilityHarness").liquidGlassWrapperModule(),
);
jest.mock("../src/components/glass/GlassForm", () =>
  require("./utils/accessibilityHarness").glassFormModule(),
);
// Closed sheets are not under test here; GlassBottomSheet has its own spec.
jest.mock("../src/components/glass/GlassBottomSheet", () => ({
  GlassBottomSheet: () => null,
  GlassActionSheet: () => null,
  useGlassBottomSheet: () => ({
    visible: false,
    show: jest.fn(),
    hide: jest.fn(),
    toggle: jest.fn(),
  }),
}));
jest.mock("../src/ui/theme/resolvedColorScheme", () => ({
  useResolvedColorScheme: () => "light",
}));

const mockChats: Chat[] = [];
const mockChatContext = {
  chats: mockChats,
  createChat: jest.fn(),
  deleteChat: jest.fn(),
  setCurrentChat: jest.fn(),
  loadChats: jest.fn(async () => undefined),
  isLoading: false,
  error: null,
  clearError: jest.fn(),
};
jest.mock("../src/context/ChatContext", () => ({
  useChat: () => mockChatContext,
}));
jest.mock("../src/context/SettingsContext", () => ({
  SettingsContext: jest.requireActual("react").createContext(undefined),
  useSettings: () => ({
    dnsServer: "llm.pieter.com",
    updateDnsServer: jest.fn(async () => undefined),
    enableMockDNS: false,
    updateEnableMockDNS: jest.fn(async () => undefined),
    enableHaptics: true,
    updateEnableHaptics: jest.fn(async () => undefined),
    updateAccessibility: jest.fn(async () => undefined),
    locale: "en-US",
    systemLocale: "en-US",
    preferredLocale: null,
    availableLocales: [{ locale: "en-US", label: "English" }],
    updateLocale: jest.fn(async () => undefined),
    themePreference: "system",
    updateThemePreference: jest.fn(async () => undefined),
    loading: false,
  }),
  useLocale: () => "en-US",
}));
jest.mock("../src/context/OnboardingContext", () => ({
  useOnboarding: () => ({ resetOnboarding: jest.fn() }),
}));
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  ...jest.requireActual("./mocks/expo-router"),
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));
jest.mock("../src/ui/hooks/useTransportTestThrottle", () => ({
  useTransportTestThrottle: () => ({
    checkChainAvailability: () => null,
    checkForcedAvailability: () => null,
    registerChainRun: () => undefined,
    registerForcedRun: () => undefined,
  }),
}));
jest.mock("../src/ui/hooks/useScreenEntrance", () => ({
  useScreenEntrance: () => ({ animatedStyle: {} }),
}));
jest.mock("../src/ui/hooks/useStaggeredList", () => ({
  ...jest.requireActual("../src/ui/hooks/useStaggeredList"),
  useStaggeredListValues: () => ({ opacities: [], translates: [] }),
}));
jest.mock("../src/services/dnsService", () => ({
  DNSService: { testTransport: jest.fn(), queryLLM: jest.fn() },
}));
const mockQueryLogs: unknown[] = [];
jest.mock("../src/services/dnsLogService", () => ({
  DNSLogService: {
    initialize: jest.fn(async () => undefined),
    getLogs: () => mockQueryLogs,
    subscribe: () => () => undefined,
    formatDuration: (ms: number) => `${ms}ms`,
    getStatusIcon: () => "",
    getMethodColor: () => "#000000",
    clearLogs: jest.fn(async () => undefined),
  },
}));
jest.mock("../src/services/ShareService", () => ({
  ShareService: {
    shareMessage: jest.fn(async () => undefined),
    shareConversation: jest.fn(async () => undefined),
  },
}));
jest.mock("../src/services/ClipboardService", () => ({
  ClipboardService: { copy: jest.fn(async () => undefined) },
}));
jest.mock("../src/components/MessageContent", () => ({
  MessageContent: () => null,
}));
jest.mock("../src/utils/appAlert", () => ({ appAlert: jest.fn() }));
jest.mock("../src/utils/devLog", () => ({
  devLog: jest.fn(),
  devWarn: jest.fn(),
}));
jest.mock("../src/utils/haptics", () => ({
  HapticFeedback: new Proxy({}, { get: () => () => undefined }),
  persistHapticsPreference: jest.fn(async () => undefined),
  toggleSwitch: jest.fn(),
}));
jest.mock("../src/components/skeletons/LogsSkeleton", () => ({
  LogsSkeleton: () => null,
}));
jest.mock("../src/components/skeletons/ChatListSkeleton", () => ({
  ChatListSkeleton: () => null,
}));
jest.mock("../src/components/EmptyState", () => ({ EmptyState: () => null }));
// Loading every date-fns locale dominates this suite's runtime; relative time is
// not what these tests assert.
jest.mock("date-fns", () => ({ formatDistanceToNow: () => "1 hour ago" }));
jest.mock("../src/utils/dateLocale", () => ({
  getDateFnsLocale: () => undefined,
}));

const { ShareService } = jest.requireMock("../src/services/ShareService") as {
  ShareService: { shareMessage: jest.Mock; shareConversation: jest.Mock };
};
const { ClipboardService } = jest.requireMock(
  "../src/services/ClipboardService",
) as { ClipboardService: { copy: jest.Mock } };
const { appAlert } = jest.requireMock("../src/utils/appAlert") as {
  appAlert: jest.Mock;
};
const devLogModule = jest.requireMock("../src/utils/devLog") as {
  devLog: jest.Mock;
  devWarn: jest.Mock;
};

const byProps =
  (expected: Record<string, unknown>) => (node: ReactTestInstance) =>
    typeof node.type === "string" &&
    Object.entries(expected).every(([key, value]) => node.props[key] === value);

let trees: ReactTestRenderer[] = [];
const render = async (element: ReactElement) => {
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = createWithSuppressedWarnings(element);
  });
  trees.push(tree);
  return tree;
};
const accessibilityAction = (node: ReactTestInstance, actionName: string) =>
  act(async () => {
    node.props["onAccessibilityAction"]({ nativeEvent: { actionName } });
  });

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  act(() => trees.forEach((tree) => tree.unmount()));
  trees = [];
});

describe("accessibility action coverage", () => {
  it("names the Mock DNS and Haptics switches after their visible setting titles", async () => {
    const { GlassSettings } =
      require("../src/navigation/screens/GlassSettings") as typeof import("../src/navigation/screens/GlassSettings");
    const tree = await render(h(GlassSettings));

    const mockDns = tree.root.find(
      byProps({ testID: "settings-mock-dns-switch" }),
    );
    expect(mockDns.props["accessibilityLabel"]).toBe("Enable Mock DNS");
    expect(mockDns.props["accessibilityHint"]).toBe(
      "Use local mock responses when real DNS fails",
    );
    const haptics = tree.root.find(
      byProps({ testID: "settings-haptics-switch" }),
    );
    expect(haptics.props["accessibilityLabel"]).toBe("Enable Haptics");
  });

  describe("message bubble", () => {
    const message = (overrides: Partial<Message> = {}): Message => ({
      id: "m1",
      role: "assistant",
      content: "Resolved over UDP",
      timestamp: new Date("2026-09-15T12:00:00Z"),
      status: "sent",
      ...overrides,
    });
    const renderBubble = async (value: Message) => {
      const { MessageBubble } =
        require("../src/components/MessageBubble") as typeof import("../src/components/MessageBubble");
      return render(h(MessageBubble, { message: value, maxWidth: 300 }));
    };
    const bubble = (tree: ReactTestRenderer) =>
      tree.root.find(
        (node) => typeof node.type === "string" && "accessible" in node.props,
      );

    it("offers copy and share as screen-reader actions that run the message action", async () => {
      const sent = message();
      const tree = await renderBubble(sent);
      const node = bubble(tree);

      expect(node.props["accessible"]).toBe(true);
      expect(node.props["accessibilityLabel"]).toBe(
        "Assistant message: Resolved over UDP",
      );
      expect(node.props["accessibilityActions"]).toEqual([
        { name: "copy", label: "Copy" },
        { name: "share", label: "Share" },
      ]);

      await accessibilityAction(node, "copy");
      expect(ClipboardService.copy).toHaveBeenCalledWith("Resolved over UDP");

      await accessibilityAction(node, "share");
      expect(ShareService.shareMessage).toHaveBeenCalledWith(
        "Resolved over UDP",
        sent.timestamp,
        "en-US",
      );
    });

    it("withholds actions while the message is still loading", async () => {
      const tree = await renderBubble(message({ status: "sending" }));
      const node = bubble(tree);

      expect(node.props["accessibilityHint"]).toBe("Message is loading");
      expect(node.props["accessibilityActions"]).toBeUndefined();
      expect(node.props["onAccessibilityAction"]).toBeUndefined();
    });

    it("stops grouping the bubble when its markdown exposes a link, so the link stays focusable", async () => {
      const tree = await renderBubble(
        message({ content: "See [docs](https://example.com)" }),
      );
      const node = bubble(tree);

      expect(node.props["accessible"]).toBe(false);
      expect(node.props["accessibilityLabel"]).toBeUndefined();
    });
  });

  describe("chat list row", () => {
    const chat: Chat = {
      id: "c1",
      title: "Resolver notes",
      createdAt: new Date("2026-09-15T11:00:00Z"),
      updatedAt: new Date("2026-09-15T11:00:00Z"),
      messages: [
        {
          id: "m1",
          role: "user",
          content: "private prompt",
          timestamp: new Date("2026-09-15T11:00:00Z"),
          status: "sent",
        },
      ],
    };

    const renderRow = async () => {
      mockChats.splice(0, mockChats.length, chat);
      const { GlassChatList } =
        require("../src/navigation/screens/GlassChatList") as typeof import("../src/navigation/screens/GlassChatList");
      const tree = await render(h(GlassChatList));
      return tree.root.find(byProps({ testID: "chat-list-item-c1" }));
    };

    it("lets assistive tech open, share and delete a conversation without logging its content", async () => {
      const row = await renderRow();

      expect(row.props["accessibilityRole"]).toBe("button");
      expect(row.props["accessibilityHint"]).toBe(
        "Double tap to open. Use available actions to share or delete this conversation.",
      );
      expect(
        (row.props["accessibilityActions"] as Array<{ name: string }>).map(
          (action) => action.name,
        ),
      ).toEqual(["activate", "share", "delete"]);

      await accessibilityAction(row, "activate");
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/chat/[threadId]",
        params: { threadId: "c1" },
      });

      await accessibilityAction(row, "share");
      expect(ShareService.shareConversation).toHaveBeenCalledWith(
        ["private prompt"],
        "en-US",
      );

      await accessibilityAction(row, "delete");
      expect(appAlert).toHaveBeenCalledTimes(1);

      const logged = JSON.stringify([
        devLogModule.devLog.mock.calls,
        devLogModule.devWarn.mock.calls,
      ]);
      expect(logged).not.toContain("private prompt");
      expect(logged).not.toContain("Resolver notes");
    });
  });

  it("summarizes status, method and duration in each DNS log row label", async () => {
    const startTime = new Date("2026-09-15T12:00:00Z");
    mockQueryLogs.splice(
      0,
      mockQueryLogs.length,
      {
        id: "q1",
        query: "redacted",
        startTime,
        totalDuration: 5,
        finalStatus: "failure",
        finalMethod: "tcp",
        entries: [],
      },
      {
        id: "q2",
        query: "redacted",
        startTime,
        finalStatus: "pending",
        entries: [],
      },
    );
    const { Logs } =
      require("../src/navigation/screens/Logs") as typeof import("../src/navigation/screens/Logs");
    const tree = await render(h(Logs));
    const time = startTime.toLocaleTimeString();

    expect(
      tree.root.find(byProps({ testID: "logs-entry-q1" })).props[
        "accessibilityLabel"
      ],
    ).toBe(
      `DNS query. Status: Failed. Method: TCP. Started at ${time}. Duration: 5ms.`,
    );
    expect(
      tree.root.find(byProps({ testID: "logs-entry-q2" })).props[
        "accessibilityLabel"
      ],
    ).toBe(
      `DNS query. Status: Pending. Method: UNKNOWN. Started at ${time}. Duration: Duration pending.`,
    );
  });
});
