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

// Records the assistant content as of each render. StorageService mutates the
// message objects held in state in place, so reading the object after the fact
// cannot tell when the UI actually received the answer - only a per-render
// snapshot of the string can.
const renderedAssistantContent: (string | undefined)[] = [];

function RenderRecordingHarness() {
  const chat = useChat();
  latestChat = chat;
  renderedAssistantContent.push(chat.currentChat?.messages.at(-1)?.content);
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

  it("shows the answer before the encrypted history write completes", async () => {
    renderedAssistantContent.length = 0;
    await act(async () => {
      createWithSuppressedWarnings(
        <ChatProvider>
          <RenderRecordingHarness />
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

    // Hold the response write open. The bubble must already carry the answer
    // while this write is still outstanding: serializing, encrypting and
    // writing the whole history is not allowed on the path between the DNS
    // response and the rendered message.
    // The stored payload is encrypted, so the write is identified by order:
    // the first write persists the user message plus the assistant
    // placeholder, the second persists the response.
    let releaseResponseWrite: (() => void) | undefined;
    let writeCount = 0;
    const originalSetItem = mockAsyncStorage.setItem.getMockImplementation();
    mockAsyncStorage.setItem.mockImplementation(async (key, value) => {
      writeCount += 1;
      if (writeCount === 2) {
        await new Promise<void>((resolve) => {
          releaseResponseWrite = resolve;
        });
      }
      return originalSetItem?.(key, value);
    });

    let sendCompleted = false;
    let pending: Promise<void> | undefined;

    // This act scope deliberately exits while the response write is still
    // blocked, so React flushes every render committed up to that point.
    await act(async () => {
      pending = latestChat?.sendMessage("hello dns").then(() => {
        sendCompleted = true;
      });

      for (let tick = 0; tick < 20 && !releaseResponseWrite; tick += 1) {
        await Promise.resolve();
      }
    });

    expect(releaseResponseWrite).toBeDefined();
    expect(sendCompleted).toBe(false);
    // A render already carried the answer while the write is outstanding.
    expect(renderedAssistantContent).toContain("assistant response");

    await act(async () => {
      releaseResponseWrite?.();
      await pending;
    });

    expect(sendCompleted).toBe(true);
  });
});
