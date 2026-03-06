import React from "react";
import { act } from "react-test-renderer";
import { ChatProvider, useChat } from "../src/context/ChatContext";
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
    loadChats: jest.fn(async () => []),
    createChat: jest.fn(async (title?: string) => ({
      id: "chat-1",
      title: title ?? "New Chat",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    })),
    addMessage: jest.fn(async () => undefined),
    updateMessage: jest.fn(async () => undefined),
    deleteChat: jest.fn(async () => undefined),
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

let latestChat: ReturnType<typeof useChat> | null = null;
const { StorageService: mockStorageService } = jest.requireMock("../src/services/storageService") as {
  StorageService: {
    loadChats: jest.Mock;
    createChat: jest.Mock;
    addMessage: jest.Mock;
    updateMessage: jest.Mock;
    deleteChat: jest.Mock;
  };
};
const { DNSService: mockDNSService } = jest.requireMock("../src/services/dnsService") as {
  DNSService: {
    queryLLM: jest.Mock;
  };
};

function Harness() {
  latestChat = useChat();
  return null;
}

describe("ChatContext single-flight send protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latestChat = null;
  });

  it("prevents overlapping sends from starting a second DNS request", async () => {
    let resolveDns: ((value: string) => void) | null = null;
    mockDNSService.queryLLM.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveDns = resolve;
        }),
    );

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
    const initialChat = latestChat;

    await act(async () => {
      await initialChat.createChat("Test Chat");
    });

    if (!latestChat) {
      throw new Error("Chat context did not refresh after chat creation");
    }
    const chat = latestChat;

    let firstSend: Promise<void> | null = null;
    let secondSend: Promise<void> | null = null;
    await act(async () => {
      firstSend = chat.sendMessage("hello");
      secondSend = chat.sendMessage("world");
      await Promise.resolve();
    });

    expect(mockDNSService.queryLLM).toHaveBeenCalledTimes(1);
    expect(latestChat.error).toBe(
      "Please wait for the current response to finish before sending another message.",
    );

    if (!resolveDns) {
      throw new Error("Expected DNS request to be pending");
    }
    if (!firstSend || !secondSend) {
      throw new Error("Expected send promises to be created");
    }

    await act(async () => {
      resolveDns?.("reply");
      await firstSend;
      await secondSend;
    });

    expect(mockStorageService.addMessage).toHaveBeenCalledTimes(2);
  });
});
