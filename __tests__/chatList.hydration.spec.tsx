import React from "react";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { ChatProvider } from "../src/context/ChatContext";
import { GlassChatList } from "../src/navigation/screens/GlassChatList";
import { StorageService } from "../src/services/storageService";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

jest.mock("../src/context/SettingsContext", () => ({
  SettingsContext: require("react").createContext(undefined),
  useSettings: () => ({ preferredLocale: "en-US", locale: "en-US" }),
}));
jest.mock("../src/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  createTranslator: () => (key: string) => key,
}));
jest.mock("../src/services/storageService", () => ({
  StorageCorruptionError: class StorageCorruptionError extends Error {},
  StorageService: { loadChats: jest.fn(async () => []) },
}));
jest.mock("../src/services/dnsService", () => ({ DNSService: {} }));
jest.mock("../src/utils/screenshotMode", () => ({
  isScreenshotMode: () => false,
}));
jest.mock("../src/ui/hooks/useScreenEntrance", () => ({
  useScreenEntrance: () => ({ animatedStyle: {} }),
}));
jest.mock("../src/ui/hooks/useStaggeredList", () => ({
  useStaggeredListValues: () => ({ opacities: [], translates: [] }),
}));
jest.mock("../src/components/glass/GlassBottomSheet", () => ({
  useGlassBottomSheet: () => ({
    visible: false,
    show: jest.fn(),
    hide: jest.fn(),
  }),
  GlassActionSheet: () => null,
}));
jest.mock("../src/components/ui/Toast", () => ({ Toast: () => null }));
jest.mock("../src/components/skeletons/ChatListSkeleton", () => ({
  ChatListSkeleton: () => null,
}));
jest.mock("../src/components/EmptyState", () => ({ EmptyState: () => null }));

describe("chat list hydration", () => {
  it("loads storage once across list mounts and reloads only for explicit refresh", async () => {
    const loadChats = jest.mocked(StorageService.loadChats);
    loadChats.mockClear();
    let renderer: ReactTestRenderer;
    const tree = (visible: boolean) => (
      <ChatProvider>{visible ? <GlassChatList /> : null}</ChatProvider>
    );
    await act(async () => {
      renderer = createWithSuppressedWarnings(tree(true));
    });
    expect(loadChats).toHaveBeenCalledTimes(1);
    await act(async () => {
      renderer.update(tree(false));
    });
    await act(async () => {
      renderer.update(tree(true));
    });
    expect(loadChats).toHaveBeenCalledTimes(1);
    const list = renderer!.root.findAll(
      (node) =>
        node.props["testID"] === "chat-list" &&
        typeof node.props["onRefresh"] === "function",
    )[0];
    expect(list).toBeDefined();
    await act(async () => {
      await list!.props["onRefresh"]();
    });
    expect(loadChats).toHaveBeenCalledTimes(2);
    act(() => renderer!.unmount());
  });
});
