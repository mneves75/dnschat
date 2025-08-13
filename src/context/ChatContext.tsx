import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import uuid from 'react-native-uuid';
import { Chat, Message, ChatContextType } from '../types/chat';
import { StorageService } from '../services/storageService';
import { DNSService } from '../services/dnsService';
import { useSettings } from './SettingsContext';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { dnsServer, preferDnsOverHttps, dnsMethodPreference, enableMockDNS } = useSettings();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedChats = await StorageService.loadChats();
      setChats(loadedChats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const createChat = useCallback(async (title?: string): Promise<Chat> => {
    try {
      const newChat = await StorageService.createChat(title);
      setChats(prevChats => [newChat, ...prevChats]);
      setCurrentChat(newChat);
      setError(null);
      return newChat;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat');
      throw err;
    }
  }, []);

  const deleteChat = async (chatId: string): Promise<void> => {
    try {
      await StorageService.deleteChat(chatId);
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      
      // If we deleted the current chat, clear it
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chat');
    }
  };

  const sendMessage = async (content: string): Promise<void> => {
    if (!currentChat) {
      setError('No active chat selected');
      return;
    }

    // Create user message
    const userMessage: Message = {
      id: uuid.v4() as string,
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sent',
    };

    try {
      // Add user message to storage and state
      await StorageService.addMessage(currentChat.id, userMessage);
      
      // Update current chat with user message
      const updatedChat: Chat = {
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
        updatedAt: new Date(),
      };
      setCurrentChat(updatedChat);
      
      // Update chats list
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === currentChat.id ? updatedChat : chat
        )
      );

      // Create assistant message with loading state
      const assistantMessage: Message = {
        id: uuid.v4() as string,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        status: 'sending',
      };

      // Add assistant message placeholder
      await StorageService.addMessage(currentChat.id, assistantMessage);
      
      const chatWithAssistantPlaceholder: Chat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: new Date(),
      };
      setCurrentChat(chatWithAssistantPlaceholder);
      
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === currentChat.id ? chatWithAssistantPlaceholder : chat
        )
      );

      // Get AI response using DNS service (respects enableMockDNS setting)
      setIsLoading(true);
      const response = await DNSService.queryLLM(content, dnsServer, preferDnsOverHttps, dnsMethodPreference, enableMockDNS);
      
      // Update assistant message with response
      const completedAssistantMessage: Message = {
        ...assistantMessage,
        content: response,
        status: 'sent',
      };

      await StorageService.updateMessage(currentChat.id, assistantMessage.id, {
        content: response,
        status: 'sent',
      });

      // Update state with completed response
      const finalChat: Chat = {
        ...chatWithAssistantPlaceholder,
        messages: [
          ...chatWithAssistantPlaceholder.messages.slice(0, -1),
          completedAssistantMessage,
        ],
        updatedAt: new Date(),
      };

      setCurrentChat(finalChat);
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === currentChat.id ? finalChat : chat
        )
      );

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      
      // Update assistant message with error status
      if (currentChat) {
        try {
          const messageToUpdate = currentChat.messages[currentChat.messages.length - 1];
          if (messageToUpdate?.id) {
            await StorageService.updateMessage(currentChat.id, messageToUpdate.id, {
              status: 'error',
              content: `Error: ${errorMessage}`,
            });
          }
          
          // Reload chats to reflect error state
          await loadChats();
        } catch (updateErr) {
          console.error('Failed to update message with error status:', updateErr);
        }
      }
    } finally {
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
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}