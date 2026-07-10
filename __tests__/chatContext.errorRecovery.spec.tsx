import React from "react";
import { act } from "react-test-renderer";
import { ChatProvider, useChat } from "../src/context/ChatContext";
import { DNSService } from "../src/services/dnsService";
import { StorageService } from "../src/services/storageService";
import type { Chat } from "../src/types/chat";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

jest.mock("../src/context/SettingsContext", () => ({
  useSettings: () => ({
    dnsServer: "llm.pieter.com",
    enableMockDNS: false,
    allowExperimentalTransports: true,
    preferredLocale: "en-US",
  }),
}));

jest.mock("../src/services/storageService", () => ({
  StorageCorruptionError: class StorageCorruptionError extends Error {},
  StorageService: {
    loadChats: jest.fn(),
    createChat: jest.fn(),
    addMessage: jest.fn(),
    appendAndUpdateMessages: jest.fn(),
    updateMessage: jest.fn(),
    deleteChat: jest.fn(),
    clearAllChats: jest.fn(),
  },
}));

jest.mock("../src/services/dnsService", () => ({
  DNSService: {
    queryLLM: jest.fn(),
  },
  sanitizeDNSMessage: jest.fn(),
}));

jest.mock("../src/utils/screenshotMode", () => ({
  isScreenshotMode: jest.fn(() => false),
  getMockConversations: jest.fn(() => []),
}));

const mockStorageService = jest.mocked(StorageService);
const mockDNSService = jest.mocked(DNSService);

let latestChat: ReturnType<typeof useChat> | null = null;
let storedChats: Chat[] = [];
let failInitialPersistAfterUser = false;
let chatCounter = 0;

const cloneChats = (): Chat[] =>
  storedChats.map((chat) => ({
    ...chat,
    messages: chat.messages.map((message) => ({ ...message })),
  }));

function Harness() {
  latestChat = useChat();
  return null;
}

const getLatestChat = (): ReturnType<typeof useChat> => {
  if (!latestChat) {
    throw new Error("Chat context failed to initialize");
  }
  return latestChat;
};

const renderProvider = async (): Promise<void> => {
  await act(async () => {
    createWithSuppressedWarnings(
      <ChatProvider>
        <Harness />
      </ChatProvider>,
    );
    await Promise.resolve();
  });
};

const createStoredChat = async (title: string): Promise<Chat> => {
  let created: Chat | null = null;
  await act(async () => {
    created = await getLatestChat().createChat(title);
  });
  if (!created) {
    throw new Error("Expected chat creation to complete");
  }
  return created;
};

describe("ChatContext error recovery", () => {
  beforeEach(() => {
    latestChat = null;
    storedChats = [];
    failInitialPersistAfterUser = false;
    chatCounter = 0;
    jest.clearAllMocks();

    mockStorageService.loadChats.mockImplementation(async () => cloneChats());
    mockStorageService.createChat.mockImplementation(async (title) => {
      chatCounter += 1;
      const now = new Date();
      const chat: Chat = {
        id: `chat-${chatCounter}`,
        title: title ?? "New Chat",
        createdAt: now,
        updatedAt: now,
        messages: [],
      };
      storedChats.unshift(chat);
      return { ...chat, messages: [] };
    });
    mockStorageService.appendAndUpdateMessages.mockImplementation(
      async (chatId, update) => {
        const chat = storedChats.find((candidate) => candidate.id === chatId);
        if (!chat) {
          throw new Error("Chat not found");
        }

        const draft: Chat = {
          ...chat,
          messages: chat.messages.map((message) => ({ ...message })),
        };
        update(draft);
        if (failInitialPersistAfterUser) {
          const userMessage = draft.messages[0];
          if (userMessage) {
            chat.messages.push(userMessage);
          }
          throw new Error("placeholder persist failed");
        }

        chat.title = draft.title;
        chat.messages = draft.messages;
        chat.updatedAt = new Date();
        return { ...chat, messages: [...chat.messages] };
      },
    );
    mockStorageService.updateMessage.mockImplementation(
      async (chatId, messageId, updates) => {
        const chat = storedChats.find((candidate) => candidate.id === chatId);
        const message = chat?.messages.find((candidate) => candidate.id === messageId);
        if (!message) {
          throw new Error("Message not found");
        }
        Object.assign(message, updates);
      },
    );
    mockStorageService.addMessage.mockImplementation(async (chatId, message) => {
      const chat = storedChats.find((candidate) => candidate.id === chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }
      chat.messages.push(message);
    });
    mockStorageService.deleteChat.mockResolvedValue(undefined);
    mockStorageService.clearAllChats.mockImplementation(async () => {
      storedChats = [];
    });
    mockDNSService.queryLLM.mockRejectedValue(new Error("DNS unavailable"));
  });

  it("updates a persisted assistant placeholder to error and reloads both messages", async () => {
    // Given
    await renderProvider();
    const chat = await createStoredChat("Active thread");

    // When
    await act(async () => {
      await getLatestChat().sendMessage("hello dns");
    });

    // Then
    expect(mockStorageService.updateMessage).toHaveBeenCalledWith(
      chat.id,
      expect.any(String),
      {
        status: "error",
        content: "Error: DNS unavailable",
      },
    );
    expect(mockStorageService.addMessage).not.toHaveBeenCalled();
    expect(getLatestChat().currentChat?.messages).toMatchObject([
      { role: "user", content: "hello dns", status: "sent" },
      { role: "assistant", content: "Error: DNS unavailable", status: "error" },
    ]);
  });

  it("reloads from storage without orphan writes when the atomic persist fails", async () => {
    // The user message and assistant placeholder are persisted in ONE atomic
    // appendAndUpdateMessages call (since the 4.2.0 write-coalescing change).
    // When that call rejects, NOTHING was persisted, so the correct recovery
    // is reload-from-storage + surface the error — writing an assistant error
    // message would create an orphan bubble with no user question. (The
    // `!assistantMessagePersisted` addMessage branch in the catch is
    // defensive dead code from the pre-coalescing flow: both persisted flags
    // are set together after the single atomic write.)
    // Given
    await renderProvider();
    await createStoredChat("Atomic persistence failure");
    failInitialPersistAfterUser = true;

    // When
    await act(async () => {
      await getLatestChat().sendMessage("hello dns");
    });

    // Then — no orphan assistant write, storage stays authoritative,
    // and the failure is surfaced to the UI error state.
    expect(mockStorageService.addMessage).not.toHaveBeenCalled();
    expect(mockStorageService.updateMessage).not.toHaveBeenCalled();
    expect(mockStorageService.loadChats).toHaveBeenCalled();
    expect(getLatestChat().error).toBe("placeholder persist failed");
  });

  it("preserves the selected thread after reloading recovered storage", async () => {
    // Given
    await renderProvider();
    const selectedChat = await createStoredChat("Selected thread");
    await createStoredChat("Newer thread");
    act(() => {
      getLatestChat().setCurrentChat(selectedChat);
    });

    // When
    await act(async () => {
      await getLatestChat().sendMessage("stay selected");
    });

    // Then
    expect(getLatestChat().currentChat?.id).toBe(selectedChat.id);
  });
});
