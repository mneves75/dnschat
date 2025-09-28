import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { Chat, Message } from '../types/chat';
import { DNSService } from '../services/dnsService';

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
  createChat: (title?: string) => Promise<Chat>;
  deleteChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  setCurrentChatId: (chatId: string | null) => void;
  clearError: () => void;
}

const reviveDate = (value: unknown) => {
  const revived = value ? new Date(value as string | number | Date) : new Date();
  return Number.isNaN(revived.getTime()) ? new Date() : revived;
};

const reviveChatPayload = (chat: Chat): Chat => ({
  ...chat,
  createdAt: reviveDate(chat.createdAt),
  updatedAt: reviveDate(chat.updatedAt),
  messages: chat.messages.map((msg: Message) => ({
    ...msg,
    timestamp: reviveDate(msg.timestamp),
  })),
});

const createChatState: StateCreator<ChatState> = (set, get) => ({
      chats: [],
      currentChatId: null,
      isLoading: false,
      error: null,

      setCurrentChatId: (chatId: string | null) => {
        set({ currentChatId: chatId });
      },

      createChat: async (title?: string) => {
        const newChat: Chat = {
          id: uuid.v4() as string,
          title: title || 'New Chat',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
        };
        set((state: ChatState) => ({ chats: [newChat, ...state.chats] }));
        return newChat;
      },

      deleteChat: async (chatId: string) => {
        set((state: ChatState) => {
          const remainingChats = state.chats.filter((chat) => chat.id !== chatId);
          const deletedActiveChat = state.currentChatId === chatId;
          const fallbackChatId = deletedActiveChat
            ? remainingChats.length > 0
              ? remainingChats[0]!.id
              : null
            : state.currentChatId;

          return {
            chats: remainingChats,
            currentChatId: fallbackChatId,
          };
        });
      },

      sendMessage: async (content: string) => {
        const chatId = get().currentChatId;
        if (!chatId) {
          set({ error: 'No active chat selected' });
          return;
        }

        const userMessage: Message = {
          id: uuid.v4() as string,
          role: 'user',
          content,
          timestamp: new Date(),
          status: 'sent',
        };

        // Add user message immediately
        set((state: ChatState) => ({
          isLoading: true,
          chats: state.chats.map((chat: Chat) =>
            chat.id === chatId
              ? { ...chat, messages: [...chat.messages, userMessage], updatedAt: new Date() }
              : chat,
          ),
        }));

        const assistantMessage: Message = {
          id: uuid.v4() as string,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          status: 'sending',
        };

        // Add assistant placeholder
        set((state: ChatState) => ({
          chats: state.chats.map((chat: Chat) =>
            chat.id === chatId
              ? { ...chat, messages: [...chat.messages, assistantMessage], updatedAt: new Date() }
              : chat,
          ),
        }));

        try {
          // For now, we get settings from outside, this can be improved later
          // by integrating the settings store.
          const response = await DNSService.queryLLM(
            content,
            undefined,
            undefined,
            undefined,
            false,
            false,
          );

          // Update assistant message with response
          set((state: ChatState) => ({
            isLoading: false,
            chats: state.chats.map((chat: Chat) => {
              if (chat.id !== chatId) return chat;
              return {
                ...chat,
                messages: chat.messages.map((msg: Message) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: response, status: 'sent' as const, timestamp: new Date() }
                    : msg,
                ),
                updatedAt: new Date(),
              };
            }),
          }));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
          set((state: ChatState) => ({
            isLoading: false,
            error: errorMessage,
            chats: state.chats.map((chat: Chat) => {
              if (chat.id !== chatId) return chat;
              return {
                ...chat,
                messages: chat.messages.map((msg: Message) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, status: 'error' as const, content: `Error: ${errorMessage}` }
                    : msg,
                ),
              };
            }),
          }));
        }
      },

      clearError: () => {
        set({ error: null });
      },
});

export const useChatStore = create<ChatState>()(
  persist(createChatState, {
      name: 'chat-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: async (state: any) => {
        if (!state) return state;
        return {
          ...state,
          chats: Array.isArray((state as any).chats)
            ? ((state as any).chats as Chat[]).map(reviveChatPayload)
            : [],
        } as ChatState;
      },
      onRehydrateStorage: () => (persistedState: ChatState | undefined) => {
        if (!persistedState?.chats) return;
        (persistedState as ChatState).chats = persistedState.chats.map(reviveChatPayload);
      },
    }),
);
