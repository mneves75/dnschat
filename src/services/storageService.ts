import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

import { Chat, Message } from "../types/chat";
import { EncryptionService } from "../utils/encryption";

const CHATS_KEY = "@chat_dns_chats";
const ENCRYPTION_VERSION_KEY = "@chat_dns_encryption_version";
const CHAT_BACKUP_KEY = "@chat_dns_chats_backup";

interface SerializedMessage {
  id: string;
  role: Message["role"];
  content: string;
  timestamp: string;
  status: Message["status"];
}

interface SerializedChat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: SerializedMessage[];
}

interface EncryptedChatRecord {
  id: string;
  encryptionKeyId?: string;
  encryptedData: string;
  payloadVersion?: number;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EncryptedChatPayloadV1 {
  version: 1;
  chat: SerializedChat;
}

type RawChatRecord = EncryptedChatRecord | SerializedChat;

export class StorageService {
  private static readonly BACKUP_KEY_ID = '__backup_master__';

  static async saveChats(chats: Chat[]): Promise<void> {
    try {
      // SECURITY FIX: Encrypt the backup snapshot to prevent plaintext exposure
      // The backup is used for recovery when encryption keys are lost
      const plainSnapshot = JSON.stringify(
        chats.map((chat) => this.serializeChat(chat)),
      );

      // Ensure backup encryption key exists
      const hasBackupKey = await EncryptionService.isConversationEncrypted(this.BACKUP_KEY_ID);
      if (!hasBackupKey) {
        await EncryptionService.generateConversationKey(this.BACKUP_KEY_ID);
      }

      // Encrypt the backup snapshot
      const encryptedBackup = await EncryptionService.encryptConversation(
        plainSnapshot,
        this.BACKUP_KEY_ID
      );
      await AsyncStorage.setItem(CHAT_BACKUP_KEY, encryptedBackup);

      const encryptedRecords: EncryptedChatRecord[] = [];
      for (const chat of chats) {
        // Ensure each conversation has a key before encrypting
        const hasKey = await EncryptionService.isConversationEncrypted(chat.id);
        if (!hasKey) {
          await EncryptionService.generateConversationKey(chat.id);
        }

        const payload: EncryptedChatPayloadV1 = {
          version: 1,
          chat: this.serializeChat(chat),
        };

        const encryptedData = await EncryptionService.encryptConversation(
          JSON.stringify(payload),
          chat.id,
        );

        encryptedRecords.push({
          id: chat.id,
          encryptionKeyId: chat.id,
          encryptedData,
          payloadVersion: 1,
          title: chat.title,
          createdAt: chat.createdAt.toISOString(),
          updatedAt: chat.updatedAt.toISOString(),
        });
      }

      await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(encryptedRecords));
      await AsyncStorage.setItem(ENCRYPTION_VERSION_KEY, "1.0");
    } catch (error) {
      console.error("Error saving chats:", error);
      throw error;
    }
  }

  static async loadChats(): Promise<Chat[]> {
    const serializedChats = await AsyncStorage.getItem(CHATS_KEY);
    if (!serializedChats) {
      return [];
    }

    try {
      const rawRecords: RawChatRecord[] = JSON.parse(serializedChats);
      if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
        return [];
      }

      const resolvedChats: Chat[] = [];
      let legacyDetected = false;
      const failedDecryptions: string[] = [];
      const backupMap = await this.loadBackupChatMap();

      for (const record of rawRecords) {
        if (this.isEncryptedRecord(record)) {
          const encryptionKeyId = record.encryptionKeyId ?? record.id;
          if (!record.encryptedData || !encryptionKeyId) {
            legacyDetected = true;
            const legacyChat = this.deserializeLegacyChat(record as SerializedChat);
            resolvedChats.push(legacyChat);
            continue;
          }

          try {
            const decrypted = await EncryptionService.decryptConversation(
              record.encryptedData,
              encryptionKeyId,
            );
            const payload = JSON.parse(decrypted) as EncryptedChatPayloadV1;
            resolvedChats.push(this.deserializeChatPayload(payload));
          } catch (error) {
            failedDecryptions.push(record.id);
            const recovered = this.recoverChatFromBackup(record.id, backupMap);
            if (recovered) {
              resolvedChats.push(recovered);
              legacyDetected = true;
            } else if (this.looksLikeLegacyChat(record)) {
            const legacyChat = this.deserializeLegacyChat(
                record as unknown as SerializedChat,
              );
              resolvedChats.push(legacyChat);
              legacyDetected = true;
            }
          }
        } else if (this.looksLikeLegacyChat(record)) {
          legacyDetected = true;
          resolvedChats.push(this.deserializeLegacyChat(record));
        }
      }

      if (failedDecryptions.length > 0) {
        console.warn(
          "⚠️ Failed to decrypt chats, attempting migration for:",
          failedDecryptions,
        );
      }

      if (legacyDetected) {
        // Re-encrypt using the latest schema so we do not enter this path again
        await this.saveChats(resolvedChats);
      }

      return resolvedChats;
    } catch (error) {
      console.error("Error loading chats:", error);
      return this.loadChatsUnencrypted();
    }
  }

  /**
   * Backward compatibility: Load unencrypted chats from older versions
   * Also handles loading from encrypted backup
   */
  private static async loadChatsUnencrypted(): Promise<Chat[]> {
    try {
      const serializedChats = await AsyncStorage.getItem(CHAT_BACKUP_KEY);
      if (!serializedChats) {
        return [];
      }

      // Try to decrypt if this is an encrypted backup
      try {
        const decryptedBackup = await EncryptionService.decryptConversation(
          serializedChats,
          this.BACKUP_KEY_ID
        );
        const chats = JSON.parse(decryptedBackup) as SerializedChat[];
        return chats.map((chat) => this.deserializeLegacyChat(chat));
      } catch (decryptError) {
        // If decryption fails, this might be a legacy plaintext backup
        console.warn("⚠️ Backup decryption failed, trying plaintext:", decryptError);

        // Try parsing as plaintext (legacy backup)
        try {
          const chats = JSON.parse(serializedChats) as SerializedChat[];
          return chats.map((chat) => this.deserializeLegacyChat(chat));
        } catch (parseError) {
          console.error("Failed to parse backup as plaintext:", parseError);
          return [];
        }
      }
    } catch (error) {
      console.error("Error loading unencrypted chats:", error);
      return [];
    }
  }

  private static serializeChat(chat: Chat): SerializedChat {
    return {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
      messages: chat.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        status: message.status,
        timestamp: message.timestamp.toISOString(),
      })),
    };
  }

  private static deserializeChatPayload(payload: EncryptedChatPayloadV1): Chat {
    if (payload.version !== 1) {
      throw new Error(`Unsupported chat payload version: ${payload.version}`);
    }

    return this.deserializeLegacyChat(payload.chat);
  }

  private static deserializeLegacyChat(data: SerializedChat): Chat {
    return {
      id: data.id,
      title: data.title,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      messages: (data.messages ?? []).map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        status: message.status,
        timestamp: new Date(message.timestamp),
      })),
    };
  }

  private static looksLikeLegacyChat(record: any): record is SerializedChat {
    return (
      record &&
      typeof record === "object" &&
      typeof record.id === "string" &&
      typeof record.title === "string" &&
      typeof record.createdAt === "string" &&
      typeof record.updatedAt === "string"
    );
  }

  private static isEncryptedRecord(record: any): record is EncryptedChatRecord {
    return (
      record &&
      typeof record === "object" &&
      typeof record.id === "string" &&
      typeof record.encryptedData === "string"
    );
  }

  private static recoverChatFromBackup(
    chatId: string,
    backupMap: Map<string, SerializedChat>,
  ): Chat | null {
    const serialized = backupMap.get(chatId);
    if (!serialized) {
      return null;
    }

    return this.deserializeLegacyChat(serialized);
  }

  private static async loadBackupChatMap(): Promise<Map<string, SerializedChat>> {
    try {
      const serialized = await AsyncStorage.getItem(CHAT_BACKUP_KEY);
      if (!serialized) {
        return new Map();
      }

      // Try to decrypt the encrypted backup
      let plaintext: string;
      try {
        plaintext = await EncryptionService.decryptConversation(
          serialized,
          this.BACKUP_KEY_ID
        );
      } catch (decryptError) {
        // If decryption fails, might be legacy plaintext backup
        console.warn("⚠️ Backup decryption failed, trying plaintext");
        plaintext = serialized;
      }

      const parsed = JSON.parse(plaintext) as SerializedChat[];
      const map = new Map<string, SerializedChat>();
      for (const chat of parsed) {
        if (chat?.id) {
          map.set(chat.id, chat);
        }
      }
      return map;
    } catch (error) {
      console.warn("⚠️ Unable to read chat backup snapshot:", error);
      return new Map();
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

      // P0-3 FIX: Clean up encryption key to prevent security/compliance violations
      // Without this, deleted conversation keys remain accessible forever
      try {
        await EncryptionService.deleteConversationKey(chatId);
        console.log(`✅ Deleted encryption key for chat ${chatId}`);
      } catch (keyDeleteError) {
        // Log but don't fail the entire deletion if key cleanup fails
        console.error(`⚠️ Failed to delete encryption key for ${chatId}:`, keyDeleteError);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw error;
    }
  }

  static async addMessage(chatId: string, message: Message): Promise<void> {
    try {
      const chats = await this.loadChats();
      const chatIndex = chats.findIndex((chat) => chat.id === chatId);

      if (chatIndex === -1) {
        throw new Error("Chat not found");
      }

      chats[chatIndex].messages.push(message);
      chats[chatIndex].updatedAt = new Date();

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
        }
      }

      await this.saveChats(chats);
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  }

  static async updateMessage(
    chatId: string,
    messageId: string,
    updates: Partial<Message>,
  ): Promise<void> {
    try {
      const chats = await this.loadChats();
      const chatIndex = chats.findIndex((chat) => chat.id === chatId);

      if (chatIndex === -1) {
        throw new Error("Chat not found");
      }

      const messageIndex = chats[chatIndex].messages.findIndex(
        (msg) => msg.id === messageId,
      );

      if (messageIndex === -1) {
        throw new Error("Message not found");
      }

      chats[chatIndex].messages[messageIndex] = {
        ...chats[chatIndex].messages[messageIndex],
        ...updates,
      };

      chats[chatIndex].updatedAt = new Date();
      await this.saveChats(chats);
    } catch (error) {
      console.error("Error updating message:", error);
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
