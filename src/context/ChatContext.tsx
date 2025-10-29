import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import uuid from "react-native-uuid";
import { Chat, Message, ChatContextType } from "../types/chat";
import { StorageService } from "../services/storageService";
import { DNSService, sanitizeDNSMessage } from "../services/dnsService";
import { useSettings } from "./SettingsContext";
import { isScreenshotMode, getMockConversations } from "../utils/screenshotMode";

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

  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);

      // SCREENSHOT MODE: Load mock conversations for App Store screenshots
      if (isScreenshotMode()) {
        console.log("📸 [ChatContext] Screenshot mode detected, loading mock conversations");
        const mockConversations = getMockConversations(settings.preferredLocale || "en-US");
        setChats(mockConversations as Chat[]);
        // Set first conversation as current chat
        if (mockConversations.length > 0) {
          setCurrentChat(mockConversations[0] as Chat);
        }
        setError(null);
        setIsLoading(false);
        return;
      }

      // NORMAL MODE: Load chats from storage
      const loadedChats = await StorageService.loadChats();
      setChats(loadedChats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chats");
    } finally {
      setIsLoading(false);
    }
  }, [settings.preferredLocale]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const createChat = useCallback(async (title?: string): Promise<Chat> => {
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
  }, []);

  const deleteChat = async (chatId: string): Promise<void> => {
    try {
      await StorageService.deleteChat(chatId);
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

      // If we deleted the current chat, clear it
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete chat");
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
    console.log('🚀 [ChatContext] sendMessage called', {
      content: content.substring(0, 50),
      currentChatId: currentChat?.id,
      currentMessageCount: currentChat?.messages.length,
    });

    if (!currentChat) {
      console.error('❌ [ChatContext] No active chat selected');
      setError("No active chat selected");
      return;
    }

    try {
      sanitizeDNSMessage(content);
    } catch (validationError) {
      const errorMessage =
        validationError instanceof Error
          ? validationError.message
          : "Failed to send message";
      console.error('❌ [ChatContext] Message validation failed:', {
        error: errorMessage,
        stack: validationError instanceof Error ? validationError.stack : undefined,
      });
      setError(errorMessage);
      return;
    }

    // Create user message
    const userMessage: Message = {
      id: uuid.v4() as string,
      role: "user",
      content,
      timestamp: new Date(),
      status: "sent",
    };

    console.log('📝 [ChatContext] Created user message', {
      messageId: userMessage.id,
      role: userMessage.role,
    });

    try {
      // Add user message to storage and state
      console.log('💾 [ChatContext] Adding user message to storage...');
      await StorageService.addMessage(currentChat.id, userMessage);
      console.log('✅ [ChatContext] User message added to storage');

      // Update current chat with user message
      const updatedChat: Chat = {
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
        updatedAt: new Date(),
      };

      console.log('🔄 [ChatContext] Updating currentChat state with user message', {
        chatId: updatedChat.id,
        messageCount: updatedChat.messages.length,
      });
      setCurrentChat(updatedChat);

      // Update chats list
      // CRITICAL FIX: Use updatedChat.id instead of stale currentChat.id closure
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === updatedChat.id ? updatedChat : chat,
        ),
      );
      console.log('✅ [ChatContext] State updated with user message');

      // Create assistant message with loading state
      const assistantMessage: Message = {
        id: uuid.v4() as string,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        status: "sending",
      };

      console.log('📝 [ChatContext] Created assistant placeholder', {
        messageId: assistantMessage.id,
        role: assistantMessage.role,
        status: assistantMessage.status,
      });

      // Add assistant message placeholder
      console.log('💾 [ChatContext] Adding assistant placeholder to storage...');
      await StorageService.addMessage(currentChat.id, assistantMessage);
      console.log('✅ [ChatContext] Assistant placeholder added to storage');

      const chatWithAssistantPlaceholder: Chat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: new Date(),
      };

      console.log('🔄 [ChatContext] Updating state with assistant placeholder', {
        messageCount: chatWithAssistantPlaceholder.messages.length,
      });
      setCurrentChat(chatWithAssistantPlaceholder);

      // CRITICAL FIX: Use chatWithAssistantPlaceholder.id instead of stale currentChat.id closure
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatWithAssistantPlaceholder.id ? chatWithAssistantPlaceholder : chat,
        ),
      );
      console.log('✅ [ChatContext] State updated with assistant placeholder');

      // Get AI response using DNS service (respects enableMockDNS setting)
      setIsLoading(true);
      console.log('🌐 [ChatContext] Starting DNS query...', {
        server: settings.dnsServer,
        enableMockDNS: settings.enableMockDNS,
      });

      const response = await DNSService.queryLLM(
        content,
        settings.dnsServer,
        settings.enableMockDNS,
        settings.allowExperimentalTransports,
      );

      console.log('✅ [ChatContext] DNS query completed', {
        responseLength: response.length,
        responsePreview: response.substring(0, 100),
      });

      // Update assistant message with response
      const completedAssistantMessage: Message = {
        ...assistantMessage,
        content: response,
        status: "sent",
      };

      console.log('💾 [ChatContext] Updating assistant message in storage with response...');
      await StorageService.updateMessage(currentChat.id, assistantMessage.id, {
        content: response,
        status: "sent",
      });
      console.log('✅ [ChatContext] Assistant message updated in storage');

      // Update state with completed response
      const finalChat: Chat = {
        ...chatWithAssistantPlaceholder,
        messages: [
          ...chatWithAssistantPlaceholder.messages.slice(0, -1),
          completedAssistantMessage,
        ],
        updatedAt: new Date(),
      };

      console.log('🔄 [ChatContext] Updating state with final response', {
        chatId: finalChat.id,
        messageCount: finalChat.messages.length,
        lastMessageContent: finalChat.messages[finalChat.messages.length - 1]?.content?.substring(0, 50),
      });

      setCurrentChat(finalChat);
      // CRITICAL FIX: Use finalChat.id instead of stale currentChat.id closure
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === finalChat.id ? finalChat : chat,
        ),
      );

      console.log('✅ [ChatContext] Final state update complete!');
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";

      console.error('❌ [ChatContext] Error in sendMessage:', {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
      });

      setError(errorMessage);

      // Update assistant message with error status
      if (currentChat) {
        try {
          const messageToUpdate =
            currentChat.messages[currentChat.messages.length - 1];

          console.log('🔧 [ChatContext] Updating message with error status', {
            messageId: messageToUpdate?.id,
          });

          if (messageToUpdate?.id) {
            await StorageService.updateMessage(
              currentChat.id,
              messageToUpdate.id,
              {
                status: "error",
                content: `Error: ${errorMessage}`,
              },
            );
          }

          // Reload chats to reflect error state
          console.log('🔄 [ChatContext] Reloading chats after error...');
          await loadChats();
          console.log('✅ [ChatContext] Chats reloaded after error');
        } catch (updateErr) {
          console.error(
            "❌ [ChatContext] Failed to update message with error status:",
            updateErr,
          );
        }
      }
    } finally {
      console.log('🏁 [ChatContext] sendMessage finally block', {
        settingIsLoadingToFalse: true,
      });
      setIsLoading(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: ChatContextType = {
    chats,
    currentChat,
    isLoading,
    error,
    createChat,
    deleteChat,
    sendMessage,
    loadChats,
    setCurrentChat,
    clearError,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
