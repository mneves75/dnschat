import React from "react";
import { act } from "react-test-renderer";
import type { ReactTestInstance, ReactTestRenderer } from "react-test-renderer";
import type { Chat as ChatRecord } from "../src/types/chat";
import { createTranslator } from "../src/i18n";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

const h = React.createElement;

type Children = { children?: React.ReactNode };

jest.mock("expo-router", () => {
  const ReactModule = jest.requireActual<typeof import("react")>("react");
  const host =
    (name: string) =>
    ({ children, ...props }: Children & Record<string, unknown>) =>
      ReactModule.createElement(name, props, children);
  const Stack = Object.assign(host("Stack"), {
    Screen: Object.assign(host("StackScreen"), {
      Title: host("StackScreenTitle"),
    }),
    Toolbar: Object.assign(host("StackToolbar"), {
      Menu: host("StackToolbarMenu"),
      MenuAction: host("StackToolbarMenuAction"),
    }),
  });
  const Link = Object.assign(host("Link"), {
    AppleZoomTarget: host("LinkAppleZoomTarget"),
  });
  return {
    Stack,
    Link,
    useLocalSearchParams: () => mockRouteParams,
    useRouter: () => mockRouter,
  };
});
jest.mock("../src/i18n", () =>
  require("./utils/accessibilityHarness").englishI18nModule(),
);
jest.mock("../src/components/glass/GlassForm", () =>
  require("./utils/accessibilityHarness").glassFormModule(),
);
// Host stand-in so the rendered title and action handler are inspectable.
jest.mock("../src/components/EmptyState", () => ({
  EmptyState: (props: Record<string, unknown>) =>
    jest
      .requireActual<typeof import("react")>("react")
      .createElement("EmptyState", props),
}));
jest.mock("../src/navigation/screens/Chat", () => ({
  Chat: () =>
    jest
      .requireActual<typeof import("react")>("react")
      .createElement("ChatScreen"),
}));
jest.mock("../src/context/ChatContext", () => ({
  useChat: () => ({ ...mockChatState, ...mockChatActions }),
}));
jest.mock("../src/context/SettingsContext", () => ({
  SettingsContext: jest.requireActual("react").createContext(undefined),
  useSettings: () => ({ locale: "en-US" }),
  useLocale: () => "en-US",
}));
jest.mock("../src/services/ShareService", () => ({
  ShareService: { shareChat: jest.fn(async () => undefined) },
}));
jest.mock("../src/utils/appAlert", () => ({ appAlert: jest.fn() }));

let mockRouteParams: { threadId?: string | string[] } = {};
const mockRouter = { replace: jest.fn(), push: jest.fn(), back: jest.fn() };
let mockChatState: {
  chats: ChatRecord[];
  currentChat: ChatRecord | null;
  isLoading: boolean;
} = { chats: [], currentChat: null, isLoading: false };
const mockChatActions = {
  loadChats: jest.fn<Promise<void>, []>(),
  setCurrentChat: jest.fn<void, [ChatRecord | null]>(),
  createChat: jest.fn<Promise<ChatRecord>, []>(),
  deleteChat: jest.fn(),
};

const t = createTranslator("en-US");

const makeChat = (id: string, title = `Chat ${id}`): ChatRecord => ({
  id,
  title,
  createdAt: new Date("2026-09-15T12:00:00Z"),
  updatedAt: new Date("2026-09-15T12:00:00Z"),
  messages: [],
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

let trees: ReactTestRenderer[] = [];
const renderRoute = async () => {
  const { default: ChatRoute } =
    require("../app/chat/[threadId]") as typeof import("../app/chat/[threadId]");
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = createWithSuppressedWarnings(h(ChatRoute));
  });
  trees.push(tree);
  return tree;
};

const byTestID = (testID: string) => (node: ReactTestInstance) =>
  typeof node.type === "string" && node.props["testID"] === testID;
const missingStateCount = (tree: ReactTestRenderer) =>
  tree.root.findAll(byTestID("chat-route-missing")).length;
const chatScreenCount = (tree: ReactTestRenderer) =>
  tree.root.findAllByType("ChatScreen" as never).length;

beforeEach(() => {
  jest.clearAllMocks();
  mockRouteParams = {};
  mockChatState = { chats: [], currentChat: null, isLoading: false };
  mockChatActions.loadChats.mockResolvedValue(undefined);
});

afterEach(() => {
  act(() => trees.forEach((tree) => tree.unmount()));
  trees = [];
});

describe("chat route hydration", () => {
  it("loads stored chats once on a cold deep link and withholds the missing state while loading", async () => {
    mockRouteParams = { threadId: "stored-thread" };
    const load = deferred<void>();
    mockChatActions.loadChats.mockReturnValue(load.promise);

    const tree = await renderRoute();

    expect(mockChatActions.loadChats).toHaveBeenCalledTimes(1);
    expect(missingStateCount(tree)).toBe(0);
    expect(mockChatActions.createChat).not.toHaveBeenCalled();

    // The stored chat arrives with the load; the route must select it rather
    // than having already declared the thread missing.
    const stored = makeChat("stored-thread");
    mockChatState = { ...mockChatState, chats: [stored] };
    await act(async () => {
      load.resolve(undefined);
    });

    expect(mockChatActions.loadChats).toHaveBeenCalledTimes(1);
    expect(missingStateCount(tree)).toBe(0);
    expect(chatScreenCount(tree)).toBe(1);
    expect(mockChatActions.setCurrentChat).toHaveBeenCalledWith(stored);
  });

  it("shows the missing-conversation state for a stale thread id without creating a blank chat", async () => {
    mockRouteParams = { threadId: "deleted-thread" };

    const tree = await renderRoute();

    expect(mockChatActions.loadChats).toHaveBeenCalledTimes(1);
    expect(missingStateCount(tree)).toBe(1);
    expect(chatScreenCount(tree)).toBe(0);
    const emptyState = tree.root.findByType("EmptyState" as never);
    expect(emptyState.props["title"]).toBe(t("screen.chat.missing.title"));
    expect(mockChatActions.createChat).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(mockChatActions.setCurrentChat).not.toHaveBeenCalled();
  });

  it("starts a new chat from the missing state and replaces the route with its thread id", async () => {
    mockRouteParams = { threadId: "deleted-thread" };
    const created = makeChat("fresh-thread", "New Chat");
    mockChatActions.createChat.mockResolvedValue(created);

    const tree = await renderRoute();
    const emptyState = tree.root.findByType("EmptyState" as never);
    expect(emptyState.props["actionLabel"]).toBe(
      t("screen.chat.missing.startNew"),
    );

    await act(async () => {
      (emptyState.props["onAction"] as () => void)();
    });

    expect(mockChatActions.createChat).toHaveBeenCalledTimes(1);
    expect(mockChatActions.setCurrentChat).toHaveBeenCalledWith(created);
    expect(mockRouter.replace).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/chat/[threadId]",
      params: { threadId: "fresh-thread" },
    });
  });

  it("renders the chat screen and selects an existing thread that is not current", async () => {
    const other = makeChat("other-thread");
    const target = makeChat("target-thread", "Resolver notes");
    mockRouteParams = { threadId: "target-thread" };
    mockChatState = {
      chats: [other, target],
      currentChat: other,
      isLoading: false,
    };

    const tree = await renderRoute();

    expect(chatScreenCount(tree)).toBe(1);
    expect(missingStateCount(tree)).toBe(0);
    expect(mockChatActions.loadChats).not.toHaveBeenCalled();
    expect(mockChatActions.setCurrentChat).toHaveBeenCalledTimes(1);
    expect(mockChatActions.setCurrentChat).toHaveBeenCalledWith(target);
    expect(mockChatActions.createChat).not.toHaveBeenCalled();
    const title = tree.root.findByType("StackScreenTitle" as never);
    expect(title.props["children"]).toBe("Resolver notes");
  });
});
