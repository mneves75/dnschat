import React, {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import uuid from "react-native-uuid";
import type { Chat, Message, ChatContextType } from "../types/chat";
import { StorageService, StorageCorruptionError } from "../services/storageService";
import { DNSService, sanitizeDNSMessage } from "../services/dnsService";
import { useSettings } from "./SettingsContext";
import { isScreenshotMode, getMockConversations } from "../utils/screenshotMode";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendInFlightRef = useRef(false);

  const replaceChatInState = (chatId: string, replacement: Chat) => {
    setChats((prevChats) =>
      prevChats.map((chat) => (chat.id === chatId ? replacement : chat)),
    );
    setCurrentChat((previous) => (previous?.id === chatId ? replacement : previous));
  };

  const loadChats = async (options?: {
    preserveChatId?: string | null;
    preserveError?: string | null;
    clearError?: boolean;
  }) => {
    try {
      setIsLoading(true);

      // SCREENSHOT MODE: Load mock conversations for deterministic UI captures
      if (isScreenshotMode()) {
        devLog("[ChatContext] Screenshot mode detected, loading mock conversations");
        const mockConversations = getMockConversations(settings.preferredLocale || "en-US");
        setChats(mockConversations as Chat[]);
        const preferredChat = options?.preserveChatId
          ? (mockConversations.find((chat) => chat.id === options.preserveChatId) ?? null)
          : null;
        setCurrentChat((preferredChat ?? mockConversations[0] ?? null) as Chat | null);
        setError(options?.clearError === false ? options?.preserveError ?? null : null);
        setIsLoading(false);
        return;
      }

      // NORMAL MODE: Load chats from storage
      const loadedChats = await StorageService.loadChats({
        recoverOnCorruption: false,
      });
      setChats(loadedChats);
      const preferredChat = options?.preserveChatId
        ? (loadedChats.find((chat) => chat.id === options.preserveChatId) ?? null)
        : null;
      setCurrentChat((preferredChat ?? loadedChats[0] ?? null) as Chat | null);
      setError(options?.clearError === false ? options?.preserveError ?? null : null);
    } catch (err) {
      if (err instanceof StorageCorruptionError) {
        await StorageService.loadChats();
        setChats([]);
        setCurrentChat(null);
        setError(
          options?.clearError === false
            ? options?.preserveError ?? "Chat storage was corrupted and has been reset."
            : "Chat storage was corrupted and has been reset.",
        );
      } else {
        setError(err instanceof Error ? err.message : "Failed to load chats");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Effect: load chats on mount and when the locale changes.
  useEffect(() => {
    loadChats();
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

  /**
   * CRITICAL BUG FIX (v3.0.0):
   *
   * This function previously had a stale closure bug where the `currentChat` variable
   * captured at line 81 was used throughout the function, even after calling setCurrentChat
   * multiple times. When updating the chats array via setChats(), the code compared against
   * currentChat.id (the OLD/original value), but tried to update with new chat objects
   * (updatedChat, chatWithAssistantPlaceholder, finalChat).
   *
   * This caused the chats array to NEVER update because:
   * 1. currentChat.id was the ID from the START of the function
   * 2. setCurrentChat() is async/batched, so currentChat doesn't update immediately
   * 3. The map() comparison `chat.id === currentChat.id` would match the OLD chat
   * 4. But we were trying to replace it with a NEW chat object with NEW messages
   * 5. Result: Messages appeared in storage but NOT in the UI
   *
   * FIX: Use the freshly created chat object's ID instead of the stale currentChat.id:
   * - Line 124: currentChat.id → updatedChat.id
   * - Line 163: currentChat.id → chatWithAssistantPlaceholder.id
   * - Line 222: currentChat.id → finalChat.id
   *
   * This ensures the chats array properly updates when messages are added.
   */
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
      setError("Please wait for the current response to finish before sending another message.");
      return;
    }

    // SECURITY: Capture chat ID at function entry to prevent race conditions.
    // If user switches chats during async operations, error handling should
    // still update the correct chat, not the newly selected one.
    const chatIdAtSend = currentChat.id;
    const chatTitleAtSend =
      currentChat.title === "New Chat" && currentChat.messages.length === 0
        ? `${content.slice(0, MESSAGE_CONSTANTS.TITLE_MAX_LENGTH)}${
            content.length > MESSAGE_CONSTANTS.TITLE_MAX_LENGTH ? "..." : ""
          }`
        : currentChat.title;
    const chatTitleForLog =
      currentChat.title === "New Chat" && currentChat.messages.length === 0
        ? `${content.slice(0, MESSAGE_CONSTANTS.TITLE_MAX_LENGTH)}${
            content.length > MESSAGE_CONSTANTS.TITLE_MAX_LENGTH ? "..." : ""
          }`
        : currentChat.title;

    // SECURITY: Track assistant message ID for error handling.
    // Must be declared outside try block so it's accessible in catch block.
    // Avoids stale closure bug where 'chats' array would be captured at function
    // definition time, not at error time.
    let assistantMessage: Message | null = null;
    let assistantMessageId: string | null = null;
    let assistantMessagePersisted = false;
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
        stack: validationError instanceof Error ? validationError.stack : undefined,
      });
      setError(errorMessage);
      return;
    }

    sendInFlightRef.current = true;

    // Create user message
    const userMessage: Message = {
      id: uuid.v4() as string,
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
      // Add user message to storage and state
      devLog("[ChatContext] Adding user message to storage...");
      await StorageService.addMessage(chatIdAtSend, userMessage);
      userMessagePersisted = true;
      devLog("[ChatContext] User message added to storage");

      // Update current chat with user message
      const updatedChat: Chat = {
        ...currentChat,
        title: chatTitleAtSend,
        messages: [...currentChat.messages, userMessage],
        updatedAt: new Date(),
      };

      devLog("[ChatContext] Updating currentChat state with user message", {
        chatId: updatedChat.id,
        messageCount: updatedChat.messages.length,
      });
      replaceChatInState(updatedChat.id, updatedChat);
      devLog("[ChatContext] State updated with user message");

      // Create assistant message with loading state
      assistantMessage = {
        id: uuid.v4() as string,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        status: "sending",
      };

      // SECURITY: Capture message ID for error handling (see declaration above try block)
      assistantMessageId = assistantMessage.id;

      devLog("[ChatContext] Created assistant placeholder", {
        messageId: assistantMessage.id,
        role: assistantMessage.role,
        status: assistantMessage.status,
      });

      // Add assistant message placeholder
      devLog("[ChatContext] Adding assistant placeholder to storage...");
      await StorageService.addMessage(chatIdAtSend, assistantMessage);
      assistantMessagePersisted = true;
      devLog("[ChatContext] Assistant placeholder added to storage");

      const chatWithAssistantPlaceholder: Chat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: new Date(),
      };

      devLog("[ChatContext] Updating state with assistant placeholder", {
        messageCount: chatWithAssistantPlaceholder.messages.length,
      });
      replaceChatInState(chatWithAssistantPlaceholder.id, chatWithAssistantPlaceholder);
      devLog("[ChatContext] State updated with assistant placeholder");

      // Get AI response using DNS service (respects enableMockDNS setting)
      setIsLoading(true);
      devLog("[ChatContext] Starting DNS query...", {
        server: settings.dnsServer,
        enableMockDNS: settings.enableMockDNS,
      });

      const response = await DNSService.queryLLM(
        content,
        settings.dnsServer,
        settings.enableMockDNS,
        settings.allowExperimentalTransports,
        {
          chatId: chatIdAtSend,
          chatTitle: chatTitleForLog,
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

      devLog("[ChatContext] Updating assistant message in storage with response...");
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

      // Update assistant message with error status
      // CRITICAL: Use captured chatIdAtSend and assistantMessageId to prevent race conditions.
      // Both values were captured at creation time, eliminating stale closure bugs where:
      // - currentChat could change if user switches chats during async operation
      // - chats array could be stale (captured at function definition, not error time)
      if (chatIdAtSend && assistantMessage && userMessagePersisted) {
        try {
          if (!assistantMessagePersisted) {
            devLog("[ChatContext] Persisting failed assistant message after placeholder write error", {
              messageId: assistantMessage.id,
              chatId: chatIdAtSend,
            });

            await StorageService.addMessage(chatIdAtSend, {
              ...assistantMessage,
              status: "error",
              content: `Error: ${errorMessage}`,
            });
            assistantMessagePersisted = true;
          } else if (assistantMessageId) {
            devLog("[ChatContext] Updating message with error status", {
              messageId: assistantMessageId,
              chatId: chatIdAtSend,
            });

            await StorageService.updateMessage(
              chatIdAtSend,
              assistantMessageId,
              {
                status: "error",
                content: `Error: ${errorMessage}`,
              },
            );
          }

          // Reload chats to reflect error state while preserving the selected thread.
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
      }
    } finally {
      sendInFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const createAndNavigateToChat = async (): Promise<void> => {
    const newChat = await createChat();
    setCurrentChat(newChat);
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
    createAndNavigateToChat,
  };

  return (
    <ChatContext value={contextValue}>{children}</ChatContext>
  );
}

export function useChat() {
  const context = use(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
