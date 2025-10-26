import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chat, Message } from "../types/chat";
import uuid from "react-native-uuid";

const CHATS_KEY = "@chat_dns_chats";

export class StorageService {
  static async saveChats(chats: Chat[]): Promise<void> {
    const startTime = Date.now();
    console.log('💾 [StorageService] saveChats called', {
      chatCount: chats.length,
      chatIds: chats.map(c => c.id),
    });

    try {
      const serializedChats = JSON.stringify(chats, (key, value) => {
        if (key === "createdAt" || key === "updatedAt" || key === "timestamp") {
          return new Date(value).toISOString();
        }
        return value;
      });

      console.log('💾 [StorageService] Serialized chats', {
        dataSize: serializedChats.length,
      });

      await AsyncStorage.setItem(CHATS_KEY, serializedChats);

      const duration = Date.now() - startTime;
      console.log('✅ [StorageService] saveChats completed', {
        duration: `${duration}ms`,
      });
    } catch (error) {
      console.error("❌ [StorageService] Error saving chats:", error);
      throw error;
    }
  }

  static async loadChats(): Promise<Chat[]> {
    const startTime = Date.now();
    console.log('📂 [StorageService] loadChats called');

    try {
      const serializedChats = await AsyncStorage.getItem(CHATS_KEY);

      if (!serializedChats) {
        console.log('📂 [StorageService] No chats found in storage');
        return [];
      }

      console.log('📂 [StorageService] Retrieved chats from storage', {
        dataSize: serializedChats.length,
      });

      const chats = JSON.parse(serializedChats, (key, value) => {
        if (key === "createdAt" || key === "updatedAt" || key === "timestamp") {
          return new Date(value);
        }
        return value;
      });

      const duration = Date.now() - startTime;
      console.log('✅ [StorageService] loadChats completed', {
        chatCount: chats.length,
        duration: `${duration}ms`,
      });

      return chats as Chat[];
    } catch (error) {
      console.error("❌ [StorageService] Error loading chats:", error);
      return [];
    }
  }

  static async createChat(title?: string): Promise<Chat> {
    const newChat: Chat = {
      id: uuid.v4() as string,
      title: title || "New Chat",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };

    try {
      const chats = await this.loadChats();
      chats.unshift(newChat);
      await this.saveChats(chats);
      return newChat;
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  }

  static async updateChat(
    chatId: string,
    updates: Partial<Chat>,
  ): Promise<void> {
    try {
      const chats = await this.loadChats();
      const chatIndex = chats.findIndex((chat) => chat.id === chatId);

      if (chatIndex === -1) {
        throw new Error("Chat not found");
      }

      chats[chatIndex] = {
        ...chats[chatIndex],
        ...updates,
        updatedAt: new Date(),
      };

      await this.saveChats(chats);
    } catch (error) {
      console.error("Error updating chat:", error);
      throw error;
    }
  }

  static async deleteChat(chatId: string): Promise<void> {
    try {
      const chats = await this.loadChats();
      const filteredChats = chats.filter((chat) => chat.id !== chatId);
      await this.saveChats(filteredChats);
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw error;
    }
  }

  static async addMessage(chatId: string, message: Message): Promise<void> {
    const startTime = Date.now();
    console.log('📝 [StorageService] addMessage called', {
      chatId,
      messageId: message.id,
      messageRole: message.role,
      contentLength: message.content.length,
      status: message.status,
    });

    try {
      console.log('📂 [StorageService] Loading chats for addMessage...');
      const chats = await this.loadChats();

      const chatIndex = chats.findIndex((chat) => chat.id === chatId);

      if (chatIndex === -1) {
        console.error('❌ [StorageService] Chat not found', { chatId });
        throw new Error("Chat not found");
      }

      console.log('📝 [StorageService] Found chat', {
        chatIndex,
        existingMessageCount: chats[chatIndex].messages.length,
      });

      chats[chatIndex].messages.push(message);
      chats[chatIndex].updatedAt = new Date();

      console.log('📝 [StorageService] Message added to chat array', {
        newMessageCount: chats[chatIndex].messages.length,
      });

      // Generate title from first message if it's still "New Chat"
      if (
        chats[chatIndex].title === "New Chat" &&
        chats[chatIndex].messages.length === 1
      ) {
        const firstMessage = chats[chatIndex].messages[0];
        if (firstMessage.role === "user") {
          chats[chatIndex].title =
            firstMessage.content.slice(0, 50) +
            (firstMessage.content.length > 50 ? "..." : "");
          console.log('📝 [StorageService] Updated chat title', {
            newTitle: chats[chatIndex].title,
          });
        }
      }

      console.log('💾 [StorageService] Saving chats with new message...');
      await this.saveChats(chats);

      const duration = Date.now() - startTime;
      console.log('✅ [StorageService] addMessage completed', {
        duration: `${duration}ms`,
      });
    } catch (error) {
      console.error("❌ [StorageService] Error adding message:", error);
      throw error;
    }
  }

  static async updateMessage(
    chatId: string,
    messageId: string,
    updates: Partial<Message>,
  ): Promise<void> {
    const startTime = Date.now();
    console.log('🔄 [StorageService] updateMessage called', {
      chatId,
      messageId,
      updates: {
        hasContent: !!updates.content,
        contentLength: updates.content?.length || 0,
        status: updates.status,
      },
    });

    try {
      console.log('📂 [StorageService] Loading chats for updateMessage...');
      const chats = await this.loadChats();

      const chatIndex = chats.findIndex((chat) => chat.id === chatId);

      if (chatIndex === -1) {
        console.error('❌ [StorageService] Chat not found', { chatId });
        throw new Error("Chat not found");
      }

      const messageIndex = chats[chatIndex].messages.findIndex(
        (msg) => msg.id === messageId,
      );

      if (messageIndex === -1) {
        console.error('❌ [StorageService] Message not found', {
          chatId,
          messageId,
          availableMessageIds: chats[chatIndex].messages.map(m => m.id),
        });
        throw new Error("Message not found");
      }

      console.log('🔄 [StorageService] Found message to update', {
        chatIndex,
        messageIndex,
        currentContent: chats[chatIndex].messages[messageIndex].content.substring(0, 50),
        currentStatus: chats[chatIndex].messages[messageIndex].status,
      });

      chats[chatIndex].messages[messageIndex] = {
        ...chats[chatIndex].messages[messageIndex],
        ...updates,
      };

      chats[chatIndex].updatedAt = new Date();

      console.log('🔄 [StorageService] Message updated in array', {
        newContent: chats[chatIndex].messages[messageIndex].content.substring(0, 50),
        newStatus: chats[chatIndex].messages[messageIndex].status,
      });

      console.log('💾 [StorageService] Saving chats with updated message...');
      await this.saveChats(chats);

      const duration = Date.now() - startTime;
      console.log('✅ [StorageService] updateMessage completed', {
        duration: `${duration}ms`,
      });
    } catch (error) {
      console.error("❌ [StorageService] Error updating message:", error);
      throw error;
    }
  }

  static async clearAllChats(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CHATS_KEY);
    } catch (error) {
      console.error("Error clearing chats:", error);
      throw error;
    }
  }
}
