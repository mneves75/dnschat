import React, { createContext, use, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as Crypto from "expo-crypto";
import type {
  Chat,
  ChatContextType,
  ChatError,
  ChatErrorKind,
  Message,
  SendMessageResult,
} from "../types/chat";
import {
  StorageService,
  StorageCorruptionError,
} from "../services/storageService";
import { DNSService, sanitizeDNSMessage } from "../services/dnsService";
import { useSettings } from "./SettingsContext";
import { DNSLogService } from "../services/dnsLogService";
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
  const [error, setError] = useState<ChatError | null>(null);
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
    preserveError?: ChatError | null;
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
      // Best-effort: a log store that cannot be read keeps its records until a
      // later load reconciles them.
      void DNSLogService.retainChats(
        new Set(loadedChats.map((chat) => chat.id)),
      ).catch((reconcileError: unknown) => {
        devWarn("[ChatContext] Failed to reconcile DNS logs", reconcileError);
      });
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
        let recoveryError: ChatError = { kind: "storageReset" };
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
            recoveryError = { kind: "storageRecovered" };
          }
        } catch {
          setChats([]);
          setCurrentChat(null);
        }
        setError(
          options?.clearError === false
            ? (options?.preserveError ?? recoveryError)
            : recoveryError,
        );
      } else {
        devWarn("[ChatContext] Failed to load chats", err);
        setError({ kind: "storage" });
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
      devWarn("[ChatContext] Failed to create chat", err);
      setError({ kind: "storage" });
      throw err;
    }
  };

  const deleteChat = async (chatId: string): Promise<void> => {
    try {
      await StorageService.deleteChat(chatId);
      // Deleting a chat also removes its DNS log records. Best-effort: the chat
      // is already gone, and a failed log write keeps the previous log state.
      await DNSLogService.purgeChat(chatId).catch((purgeError: unknown) => {
        devWarn("[ChatContext] Failed to purge DNS logs for chat", purgeError);
      });
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

      setCurrentChat((previous) => (previous?.id === chatId ? null : previous));

      setError(null);
    } catch (err) {
      devWarn("[ChatContext] Failed to delete chat", err);
      setError({ kind: "storage" });
    }
  };

  const clearAllChats = async (): Promise<void> => {
    try {
      await StorageService.clearAllChats();
      await DNSLogService.retainChats(new Set()).catch(
        (reconcileError: unknown) => {
          devWarn("[ChatContext] Failed to reconcile DNS logs", reconcileError);
        },
      );
      setChats([]);
      setCurrentChat(null);
      setError(null);
    } catch (err) {
      devWarn("[ChatContext] Failed to clear chats", err);
      setError({ kind: "storage" });
      throw err;
    }
  };

  const sendMessage = async (content: string): Promise<SendMessageResult> => {
    devLog("[ChatContext] sendMessage called", {
      contentLength: content.length,
      currentChatId: currentChat?.id,
      currentMessageCount: currentChat?.messages.length,
    });

    if (!currentChat) {
      devWarn("[ChatContext] No active chat selected");
      setError({ kind: "noChat" });
      return "rejected";
    }

    if (sendInFlightRef.current) {
      setError({ kind: "busy" });
      return "rejected";
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
    // Which step a thrown error came from: only the DNS request itself is a
    // DNS failure; every write around it is a storage failure.
    let failureKind: ChatErrorKind = "storage";
    let result: SendMessageResult = "sent";

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
      setError({ kind: "validation" });
      return "rejected";
    }

    sendInFlightRef.current = true;
    setIsLoading(true);
    // A new request supersedes the previous error and its Retry target.
    setError(null);

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
      const { dnsServer, enableMockDNS } = settingsRef.current;
      devLog("[ChatContext] Starting DNS query...", {
        server: dnsServer,
        enableMockDNS,
      });

      failureKind = "dns";
      const response = await DNSService.queryLLM(
        content,
        dnsServer,
        enableMockDNS,
        {
          chatId: chatIdAtSend,
          chatTitle: chatTitleAtSend,
        },
      );

      failureKind = "storage";
      devLog("[ChatContext] DNS query completed", {
        responseLength: response.length,
      });

      // Update assistant message with response
      const completedAssistantMessage: Message = {
        ...assistantMessage,
        content: response,
        status: "sent",
      };

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

      // PERFORMANCE: paint the answer before persisting it. updateMessage
      // serializes the whole chat history, encrypts it with AES-GCM and writes
      // it to AsyncStorage; awaiting that first put the entire write on the
      // path between the DNS response arriving and the bubble appearing. The
      // write stays inside this try, so a failed write still lands in the catch
      // below, which persists the error status and reloads from storage.
      replaceChatInState(finalChat.id, finalChat);
      setError(null);

      devLog(
        "[ChatContext] Updating assistant message in storage with response...",
      );
      await StorageService.updateMessage(chatIdAtSend, assistantMessage.id, {
        content: response,
        status: "sent",
      });
      devLog("[ChatContext] Assistant message updated in storage");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";

      devWarn("[ChatContext] Error in sendMessage", {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
      });

      result = "failed";
      const sendError: ChatError =
        failureKind === "dns" && assistantMessage
          ? { kind: "dns", failedMessageId: assistantMessage.id }
          : { kind: failureKind };
      setError(sendError);

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
            preserveError: sendError,
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
            preserveError: sendError,
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
    return result;
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
