import React, { createContext, use, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as Crypto from "expo-crypto";
import type { Chat, Message, ChatContextType } from "../types/chat";
import {
  StorageService,
  StorageCorruptionError,
} from "../services/storageService";
import { DNSService, sanitizeDNSMessage } from "../services/dnsService";
import { useSettings } from "./SettingsContext";
import { createTranslator } from "../i18n";
import {
  isScreenshotMode,
  getMockConversations,
} from "../utils/screenshotMode";
import { MESSAGE_CONSTANTS } from "../constants/appConstants";
import { devLog, devWarn } from "../utils/devLog";

const ChatContext = createContext<ChatContextType | undefined>(undefined);
interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const settings = useSettings();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sendInFlightRef = useRef(false);

  // PERFORMANCE: mirror settings into a ref so sendMessage/loadChats read them
  // at call time instead of closing over the settings object. Without this,
  // any settings change (theme, haptics, …) gave those functions a new
  // identity, recreating contextValue and re-rendering every useChat()
  // consumer. Behavior note: reading settingsRef.current at call time is
  // equivalent-or-fresher than closure capture — the value is at least as new
  // as the one the closure would have seen.
  // React Compiler: the ref is written only inside an effect (never during
  // render) and read only inside event handlers / async functions.
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const replaceChatInState = (chatId: string, replacement: Chat) => {
    setChats((prevChats) =>
      prevChats.map((chat) => (chat.id === chatId ? replacement : chat)),
    );
    setCurrentChat((previous) =>
      previous?.id === chatId ? replacement : previous,
    );
  };

  const loadChats = async (options?: {
    preserveChatId?: string | null;
    preserveError?: string | null;
    clearError?: boolean;
  }) => {
    setIsLoading(true);

    // SCREENSHOT MODE: Load mock conversations for deterministic UI captures
    if (isScreenshotMode()) {
      devLog(
        "[ChatContext] Screenshot mode detected, loading mock conversations",
      );
      const mockConversations = getMockConversations(
        settingsRef.current.preferredLocale,
      );
      setChats(mockConversations as Chat[]);
      const preferredChat = options?.preserveChatId
        ? (mockConversations.find(
            (chat) => chat.id === options.preserveChatId,
          ) ?? null)
        : null;
      setCurrentChat(
        (preferredChat ?? mockConversations[0] ?? null) as Chat | null,
      );
      setError(
        options?.clearError === false ? (options?.preserveError ?? null) : null,
      );
      setIsLoading(false);
      return;
    }

    try {
      // NORMAL MODE: Load chats from storage
      const loadedChats = await StorageService.loadChats({
        recoverOnCorruption: false,
      });
      setChats(loadedChats);
      const preferredChat = options?.preserveChatId
        ? (loadedChats.find((chat) => chat.id === options.preserveChatId) ??
          null)
        : null;
      setCurrentChat((preferredChat ?? loadedChats[0] ?? null) as Chat | null);
      setError(
        options?.clearError === false ? (options?.preserveError ?? null) : null,
      );
    } catch (err) {
      if (err instanceof StorageCorruptionError) {
        // Best-effort recovery: a recovery failure must still reset state and
        // clear loading below (it must not escape and skip cleanup).
        const translate = createTranslator(settingsRef.current.locale);
        let recoveryMessage = translate("screen.chat.storageRecovery.reset");
        try {
          const recoveredChats = await StorageService.loadChats();
          setChats(recoveredChats);
          const preferredChat = options?.preserveChatId
            ? (recoveredChats.find(
                (chat) => chat.id === options.preserveChatId,
              ) ?? null)
            : null;
          setCurrentChat(
            (preferredChat ?? recoveredChats[0] ?? null) as Chat | null,
          );
          if (recoveredChats.length > 0) {
            recoveryMessage = translate(
              "screen.chat.storageRecovery.recovered",
            );
          }
        } catch {
          setChats([]);
          setCurrentChat(null);
        }
        setError(
          options?.clearError === false
            ? (options?.preserveError ?? recoveryMessage)
            : recoveryMessage,
        );
      } else {
        setError(err instanceof Error ? err.message : "Failed to load chats");
      }
    }
    // Replaces `finally`; the early screenshot-mode path clears loading itself.
    setIsLoading(false);
  };

  // Effect: load chats on mount. Only the screenshot-mode mock-conversation
  // path consumes the locale (getMockConversations above), so a locale change
  // only triggers a reload while screenshot mode is active — normal storage
  // loads are locale-independent and would be redundant full decrypt passes.
  const hasHydratedChatsRef = useRef(false);
  useEffect(() => {
    if (!hasHydratedChatsRef.current || isScreenshotMode()) {
      hasHydratedChatsRef.current = true;
      loadChats();
    }
  }, [settings.preferredLocale]);

  const createChat = async (title?: string): Promise<Chat> => {
    try {
      const newChat = await StorageService.createChat(title);
      setChats((prevChats) => [newChat, ...prevChats]);
      setCurrentChat(newChat);
      setError(null);
      return newChat;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create chat");
      throw err;
    }
  };

  const deleteChat = async (chatId: string): Promise<void> => {
    try {
      await StorageService.deleteChat(chatId);
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

      setCurrentChat((previous) => (previous?.id === chatId ? null : previous));

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete chat");
    }
  };

  const clearAllChats = async (): Promise<void> => {
    try {
      await StorageService.clearAllChats();
      setChats([]);
      setCurrentChat(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear chats");
      throw err;
    }
  };

  const sendMessage = async (content: string): Promise<void> => {
    devLog("[ChatContext] sendMessage called", {
      contentLength: content.length,
      currentChatId: currentChat?.id,
      currentMessageCount: currentChat?.messages.length,
    });

    if (!currentChat) {
      devWarn("[ChatContext] No active chat selected");
      setError("No active chat selected");
      return;
    }

    if (sendInFlightRef.current) {
      setError(
        "Please wait for the current response to finish before sending another message.",
      );
      return;
    }

    // SECURITY: Capture chat ID at function entry to prevent race conditions.
    // If user switches chats during async operations, error handling should
    // still update the correct chat, not the newly selected one.
    const chatIdAtSend = currentChat.id;
    // Single derived title, used both for the optimistic UI update and as the
    // chatTitle DNS-log context (the previous chatTitleForLog duplicate was
    // the identical expression).
    const chatTitleAtSend =
      currentChat.title === "New Chat" && currentChat.messages.length === 0
        ? `${content.slice(0, MESSAGE_CONSTANTS.TITLE_MAX_LENGTH)}${
            content.length > MESSAGE_CONSTANTS.TITLE_MAX_LENGTH ? "..." : ""
          }`
        : currentChat.title;

    // Keep the placeholder available to persist a failed response.
    let assistantMessage: Message | null = null;
    let userMessagePersisted = false;

    try {
      sanitizeDNSMessage(content);
    } catch (validationError) {
      const errorMessage =
        validationError instanceof Error
          ? validationError.message
          : "Failed to send message";
      devWarn("[ChatContext] Message validation failed", {
        error: errorMessage,
        stack:
          validationError instanceof Error ? validationError.stack : undefined,
      });
      setError(errorMessage);
      return;
    }

    sendInFlightRef.current = true;
    setIsLoading(true);

    const userMessage: Message = {
      id: Crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
      status: "sent",
    };

    devLog("[ChatContext] Created user message", {
      messageId: userMessage.id,
      role: userMessage.role,
    });

    try {
      const updatedChat: Chat = {
        ...currentChat,
        title: chatTitleAtSend,
        messages: [...currentChat.messages, userMessage],
        updatedAt: new Date(),
      };

      assistantMessage = {
        id: Crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        status: "sending",
      };

      const assistantPlaceholder = assistantMessage;

      devLog("[ChatContext] Created assistant placeholder", {
        messageId: assistantMessage.id,
        role: assistantMessage.role,
        status: assistantMessage.status,
      });

      const chatWithAssistantPlaceholder: Chat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantPlaceholder],
        updatedAt: new Date(),
      };

      devLog("[ChatContext] Updating state with assistant placeholder", {
        messageCount: chatWithAssistantPlaceholder.messages.length,
      });
      replaceChatInState(
        chatWithAssistantPlaceholder.id,
        chatWithAssistantPlaceholder,
      );
      devLog("[ChatContext] State updated with assistant placeholder");

      devLog(
        "[ChatContext] Persisting user message and assistant placeholder...",
      );
      await StorageService.appendAndUpdateMessages(chatIdAtSend, (chat) => {
        chat.messages.push(userMessage);
        if (chat.title === "New Chat" && chat.messages.length === 1) {
          chat.title =
            userMessage.content.slice(0, 50) +
            (userMessage.content.length > 50 ? "..." : "");
        }
        chat.messages.push(assistantPlaceholder);
      });
      userMessagePersisted = true;
      devLog("[ChatContext] User message and assistant placeholder persisted");

      // Get AI response using DNS service (respects enableMockDNS setting).
      // Settings are read from the ref at call time (see settingsRef above).
      const { dnsServer, enableMockDNS, allowExperimentalTransports } =
        settingsRef.current;
      devLog("[ChatContext] Starting DNS query...", {
        server: dnsServer,
        enableMockDNS,
      });

      const response = await DNSService.queryLLM(
        content,
        dnsServer,
        enableMockDNS,
        allowExperimentalTransports,
        {
          chatId: chatIdAtSend,
          chatTitle: chatTitleAtSend,
        },
      );

      devLog("[ChatContext] DNS query completed", {
        responseLength: response.length,
      });

      // Update assistant message with response
      const completedAssistantMessage: Message = {
        ...assistantMessage,
        content: response,
        status: "sent",
      };

      devLog(
        "[ChatContext] Updating assistant message in storage with response...",
      );
      await StorageService.updateMessage(chatIdAtSend, assistantMessage.id, {
        content: response,
        status: "sent",
      });
      devLog("[ChatContext] Assistant message updated in storage");

      // Update state with completed response
      const finalChat: Chat = {
        ...chatWithAssistantPlaceholder,
        messages: [
          ...chatWithAssistantPlaceholder.messages.slice(0, -1),
          completedAssistantMessage,
        ],
        updatedAt: new Date(),
      };

      devLog("[ChatContext] Updating state with final response", {
        chatId: finalChat.id,
        messageCount: finalChat.messages.length,
      });

      replaceChatInState(finalChat.id, finalChat);

      devLog("[ChatContext] Final state update complete");
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";

      devWarn("[ChatContext] Error in sendMessage", {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
      });

      setError(errorMessage);

      // Persist failures against the chat captured before the request.
      if (chatIdAtSend && assistantMessage && userMessagePersisted) {
        try {
          await StorageService.updateMessage(
            chatIdAtSend,
            assistantMessage.id,
            {
              status: "error",
              content: `Error: ${errorMessage}`,
            },
          );

          // Reload chats to reflect error state while preserving the selected thread.
          // DECISION (perf review): keep this full reload rather than patching
          // local state. The failure may have happened at any of several
          // persistence points (user write, placeholder write, response
          // update), so storage is the only authoritative record of what was
          // actually persisted — and this is a rare error path where the extra
          // read is an acceptable price for guaranteed state/storage agreement.
          devLog("[ChatContext] Reloading chats after error...");
          await loadChats({
            preserveChatId: chatIdAtSend,
            preserveError: errorMessage,
            clearError: false,
          });
          devLog("[ChatContext] Chats reloaded after error");
        } catch (updateErr) {
          devWarn(
            "[ChatContext] Failed to update message with error status",
            updateErr,
          );
        }
      } else {
        try {
          await loadChats({
            preserveChatId: chatIdAtSend,
            preserveError: errorMessage,
            clearError: false,
          });
        } catch (reloadErr) {
          devWarn(
            "[ChatContext] Failed to reload chats after send persistence error",
            reloadErr,
          );
        }
      }
    }
    // Replaces `finally`; the catch handles send errors without rethrowing, so
    // this cleanup runs on both the success and error paths.
    sendInFlightRef.current = false;
    setIsLoading(false);
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: ChatContextType = {
    chats,
    currentChat,
    isLoading,
    error,
    createChat,
    deleteChat,
    clearAllChats,
    sendMessage,
    loadChats,
    setCurrentChat,
    clearError,
  };

  return <ChatContext value={contextValue}>{children}</ChatContext>;
}

export function useChat() {
  const context = use(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
