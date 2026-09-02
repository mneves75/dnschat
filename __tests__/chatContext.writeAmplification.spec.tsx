import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { act } from "react-test-renderer";
import { ChatProvider, useChat } from "../src/context/ChatContext";
import { StorageService } from "../src/services/storageService";
import type { Chat } from "../src/types/chat";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";
import { parseStoredChats } from "./utils/storageTestUtils";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../src/context/SettingsContext", () => ({
  useSettings: () => ({
    dnsServer: "llm.pieter.com",
    enableMockDNS: false,
    allowExperimentalTransports: true,
    preferredLocale: "en-US",
  }),
}));

jest.mock("../src/services/dnsService", () => {
  const actual = jest.requireActual(
    "../src/services/dnsService",
  ) as typeof import("../src/services/dnsService");
  return {
    ...actual,
    DNSService: {
      queryLLM: jest.fn(),
    },
  };
});

jest.mock("../src/utils/screenshotMode", () => ({
  isScreenshotMode: jest.fn(() => false),
  getMockConversations: jest.fn(() => []),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const { DNSService: mockDNSService } = jest.requireMock(
  "../src/services/dnsService",
) as {
  DNSService: {
    queryLLM: jest.Mock<
      Promise<string>,
      [
        string,
        string | undefined,
        boolean | undefined,
        boolean,
        { chatId?: string; chatTitle?: string } | undefined,
      ]
    >;
  };
};

let latestChat: ReturnType<typeof useChat> | null = null;

function Harness() {
  latestChat = useChat();
  return null;
}

describe("ChatContext sendMessage persistence coalescing", () => {
  let currentStorage: string | null;

  beforeEach(() => {
    latestChat = null;
    currentStorage = null;
    jest.clearAllMocks();
    StorageService.invalidateChatCache();
    mockAsyncStorage.getItem.mockImplementation(async () => currentStorage);
    mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
      currentStorage = value;
      return undefined;
    });
    mockAsyncStorage.removeItem.mockImplementation(async () => {
      currentStorage = null;
      return undefined;
    });
    mockDNSService.queryLLM.mockResolvedValue("assistant response");
  });

  it("persists one send round trip in at most two chat writes", async () => {
    await act(async () => {
      createWithSuppressedWarnings(
        <ChatProvider>
          <Harness />
        </ChatProvider>,
      );
      await Promise.resolve();
    });

    if (!latestChat) {
      throw new Error("Chat context failed to initialize");
    }

    await act(async () => {
      await latestChat?.createChat("New Chat");
    });

    mockAsyncStorage.setItem.mockClear();

    await act(async () => {
      await latestChat?.sendMessage("hello dns");
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(2);
    if (!currentStorage) {
      throw new Error("Expected chats to be persisted");
    }
    const chats = (await parseStoredChats(currentStorage)) as Chat[];
    expect(chats).toHaveLength(1);
    expect(chats[0]?.messages).toMatchObject([
      {
        role: "user",
        content: "hello dns",
        status: "sent",
      },
      {
        role: "assistant",
        content: "assistant response",
        status: "sent",
      },
    ]);
  });
});
