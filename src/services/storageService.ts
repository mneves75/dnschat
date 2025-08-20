import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, Message } from '../types/chat';
import uuid from 'react-native-uuid';

const CHATS_KEY = '@chat_dns_chats';

export class StorageService {
  static async saveChats(chats: Chat[]): Promise<void> {
    try {
      const serializedChats = JSON.stringify(chats, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt' || key === 'timestamp') {
          return new Date(value).toISOString();
        }
        return value;
      });
      await AsyncStorage.setItem(CHATS_KEY, serializedChats);
    } catch (error) {
      console.error('Error saving chats:', error);
      throw error;
    }
  }

  static async loadChats(): Promise<Chat[]> {
    try {
      const serializedChats = await AsyncStorage.getItem(CHATS_KEY);
      if (!serializedChats) {
        return [];
      }
      
      const chats = JSON.parse(serializedChats, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt' || key === 'timestamp') {
          return new Date(value);
        }
        return value;
      });
      
      return chats as Chat[];
    } catch (error) {
      console.error('Error loading chats:', error);
      return [];
    }
  }

  static async createChat(title?: string): Promise<Chat> {
    const newChat: Chat = {
      id: uuid.v4() as string,
      title: title || 'New Chat',
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
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  static async updateChat(chatId: string, updates: Partial<Chat>): Promise<void> {
    try {
      const chats = await this.loadChats();
      const chatIndex = chats.findIndex(chat => chat.id === chatId);
      
      if (chatIndex === -1) {
        throw new Error('Chat not found');
      }

      chats[chatIndex] = { 
        ...chats[chatIndex], 
        ...updates, 
        updatedAt: new Date() 
      };
      
      await this.saveChats(chats);
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    }
  }

  static async deleteChat(chatId: string): Promise<void> {
    try {
      const chats = await this.loadChats();
      const filteredChats = chats.filter(chat => chat.id !== chatId);
      await this.saveChats(filteredChats);
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }

  static async deleteMessage(chatId: string, messageId: string): Promise<void> {
    try {
      const chats = await this.loadChats();
      const chat = chats.find(c => c.id === chatId);
      
      if (!chat) {
        throw new Error('Chat not found');
      }
      
      // Remove the message from the chat
      chat.messages = chat.messages.filter(message => message.id !== messageId);
      chat.updatedAt = new Date();
      
      await this.saveChats(chats);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  static async addMessage(chatId: string, message: Message): Promise<void> {
    try {
      const chats = await this.loadChats();
      const chatIndex = chats.findIndex(chat => chat.id === chatId);
      
      if (chatIndex === -1) {
        throw new Error('Chat not found');
      }

      chats[chatIndex].messages.push(message);
      chats[chatIndex].updatedAt = new Date();
      
      // Generate title from first message if it's still "New Chat"
      if (chats[chatIndex].title === 'New Chat' && chats[chatIndex].messages.length === 1) {
        const firstMessage = chats[chatIndex].messages[0];
        if (firstMessage.role === 'user') {
          chats[chatIndex].title = firstMessage.content.slice(0, 50) + 
            (firstMessage.content.length > 50 ? '...' : '');
        }
      }
      
      await this.saveChats(chats);
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  static async updateMessage(chatId: string, messageId: string, updates: Partial<Message>): Promise<void> {
    try {
      const chats = await this.loadChats();
      const chatIndex = chats.findIndex(chat => chat.id === chatId);
      
      if (chatIndex === -1) {
        throw new Error('Chat not found');
      }

      const messageIndex = chats[chatIndex].messages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex === -1) {
        throw new Error('Message not found');
      }

      chats[chatIndex].messages[messageIndex] = {
        ...chats[chatIndex].messages[messageIndex],
        ...updates,
      };
      
      chats[chatIndex].updatedAt = new Date();
      await this.saveChats(chats);
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  static async clearAllChats(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CHATS_KEY);
    } catch (error) {
      console.error('Error clearing chats:', error);
      throw error;
    }
  }
}