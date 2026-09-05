import React from "react";
import { act } from "react-test-renderer";
import { ChatProvider, useChat } from "../src/context/ChatContext";
import { DNSService } from "../src/services/dnsService";
import {
  StorageCorruptionError,
  StorageService,
} from "../src/services/storageService";
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

const makeRecoveredChat = (id: string, title: string): Chat => {
  const timestamp = new Date("2026-07-28T12:00:00.000Z");
  return {
    id,
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [],
  };
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
        const message = chat?.messages.find(
          (candidate) => candidate.id === messageId,
        );
        if (!message) {
          throw new Error("Message not found");
        }
        Object.assign(message, updates);
      },
    );
    mockStorageService.addMessage.mockImplementation(
      async (chatId, message) => {
        const chat = storedChats.find((candidate) => candidate.id === chatId);
        if (!chat) {
          throw new Error("Chat not found");
        }
        chat.messages.push(message);
      },
    );
    mockStorageService.deleteChat.mockResolvedValue(undefined);
    mockStorageService.clearAllChats.mockImplementation(async () => {
      storedChats = [];
    });
    mockDNSService.queryLLM.mockRejectedValue(new Error("DNS unavailable"));
  });

  it("exposes chats salvaged by corruption recovery", async () => {
    const recoveredChats = [
      makeRecoveredChat("chat-survivor-1", "First survivor"),
      makeRecoveredChat("chat-survivor-2", "Second survivor"),
    ];
    mockStorageService.loadChats
      .mockRejectedValueOnce(new StorageCorruptionError("Corrupted chat"))
      .mockResolvedValueOnce(recoveredChats);

    await renderProvider();

    expect(getLatestChat().chats).toEqual(recoveredChats);
    expect(getLatestChat().currentChat).toEqual(recoveredChats[0]);
    expect(getLatestChat().error).toBe(
      "Chat storage was corrupted. Chats that could be recovered are still available.",
    );
  });

  it("preserves a selected thread that survives corruption recovery", async () => {
    await renderProvider();
    const selectedChat = await createStoredChat("Selected survivor");
    await createStoredChat("Newer thread");
    act(() => {
      getLatestChat().setCurrentChat(selectedChat);
    });
    const recoveredChats = [
      makeRecoveredChat("chat-other", "Other survivor"),
      makeRecoveredChat(selectedChat.id, selectedChat.title),
    ];
    failInitialPersistAfterUser = true;
    mockStorageService.loadChats.mockReset();
    mockStorageService.loadChats
      .mockRejectedValueOnce(new StorageCorruptionError("Corrupted chat"))
      .mockResolvedValueOnce(recoveredChats);

    await act(async () => {
      await getLatestChat().sendMessage("stay selected");
    });

    expect(getLatestChat().chats).toEqual(recoveredChats);
    expect(getLatestChat().currentChat?.id).toBe(selectedChat.id);
  });

  it("falls back to the first survivor when the selected thread is quarantined", async () => {
    await renderProvider();
    const selectedChat = await createStoredChat("Quarantined selection");
    const recoveredChats = [
      makeRecoveredChat("chat-survivor-1", "First survivor"),
      makeRecoveredChat("chat-survivor-2", "Second survivor"),
    ];
    failInitialPersistAfterUser = true;
    mockStorageService.loadChats.mockReset();
    mockStorageService.loadChats
      .mockRejectedValueOnce(new StorageCorruptionError("Corrupted chat"))
      .mockResolvedValueOnce(recoveredChats);

    await act(async () => {
      await getLatestChat().sendMessage("fall back safely");
    });

    expect(getLatestChat().chats).toEqual(recoveredChats);
    expect(getLatestChat().currentChat?.id).not.toBe(selectedChat.id);
    expect(getLatestChat().currentChat).toEqual(recoveredChats[0]);
  });

  it("resets state and clears loading when corruption recovery also fails", async () => {
    mockStorageService.loadChats
      .mockRejectedValueOnce(new StorageCorruptionError("Corrupted chat"))
      .mockRejectedValueOnce(new Error("Recovery failed"));

    await renderProvider();

    expect(getLatestChat().chats).toEqual([]);
    expect(getLatestChat().currentChat).toBeNull();
    expect(getLatestChat().error).toBe(
      "Chat storage was corrupted and has been reset.",
    );
    expect(getLatestChat().isLoading).toBe(false);
  });

  it("records a failed response in its original thread after selecting another thread", async () => {
    await renderProvider();
    const otherChat = await createStoredChat("Other thread");
    const sendingChat = await createStoredChat("Sending thread");
    let rejectDns: (error: Error) => void = () => {
      throw new Error("DNS request did not start");
    };
    mockDNSService.queryLLM.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectDns = reject;
        }),
    );
    let pendingSend: Promise<void>;
    await act(async () => {
      pendingSend = getLatestChat().sendMessage("hello dns");
      await Promise.resolve();
    });
    expect(mockDNSService.queryLLM).toHaveBeenCalledTimes(1);
    act(() => {
      getLatestChat().setCurrentChat(otherChat);
    });
    await act(async () => {
      rejectDns(new Error("DNS unavailable"));
      await pendingSend;
    });
    expect(mockStorageService.updateMessage).toHaveBeenCalledWith(
      sendingChat.id,
      expect.any(String),
      { status: "error", content: "Error: DNS unavailable" },
    );
    expect(
      getLatestChat().chats.find((chat) => chat.id === otherChat.id)?.messages,
    ).toEqual([]);
    expect(
      getLatestChat().chats.find((chat) => chat.id === sendingChat.id)
        ?.messages,
    ).toMatchObject([
      { role: "user", content: "hello dns" },
      { role: "assistant", status: "error" },
    ]);
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
