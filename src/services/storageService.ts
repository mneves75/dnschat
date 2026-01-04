import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Chat, Message } from "../types/chat";
import uuid from "react-native-uuid";
import { devLog, devWarn } from "../utils/devLog";
import { decryptIfEncrypted, encryptString } from "./encryptionService";

const CHATS_KEY = "@chat_dns_chats";

/**
 * Error thrown when storage data is corrupted and cannot be recovered.
 * This distinguishes recoverable "no data" from unrecoverable "bad data".
 */
export class StorageCorruptionError extends Error {
  constructor(
    message: string,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = "StorageCorruptionError";
  }
}

export class StorageService {
  /**
   * Operation queue ensures serialized access to AsyncStorage.
   * All read-modify-write operations MUST go through queueOperation()
   * to prevent race conditions from concurrent calls.
   *
   * Without this queue, the following race condition occurs:
   *   Call A: loadChats() → [chat1]
   *   Call B: loadChats() → [chat1] (stale!)
   *   Call A: push(msg1), saveChats([chat1 with msg1])
   *   Call B: push(msg2), saveChats([chat1 with msg2]) → msg1 LOST!
   */
  private static operationQueue: Promise<void> = Promise.resolve();

  /**
   * Queues an operation to run after all previous operations complete.
   * The queue continues even if individual operations fail - errors
   * are propagated to the caller but don't break the chain.
   *
   * SECURITY FIX: Uses Promise.resolve().then() pattern to catch synchronous
   * throws from operation(). Previous async/try-catch pattern could miss sync
   * throws that occurred before any await, breaking the queue chain permanently.
   */
  private static queueOperation<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.operationQueue = this.operationQueue.then(() =>
        Promise.resolve()
          .then(() => operation())
          .then(resolve, reject)
      );
    });
  }
  static async saveChats(chats: Chat[]): Promise<void> {
    const startTime = Date.now();
    devLog("[StorageService] saveChats called", {
      chatCount: chats.length,
      chatIds: chats.map((c) => c.id),
    });

    try {
      const serializedChats = JSON.stringify(chats, (key, value) => {
        if (key === "createdAt" || key === "updatedAt" || key === "timestamp") {
          return new Date(value).toISOString();
        }
        return value;
      });

      devLog("[StorageService] Serialized chats", {
        dataSize: serializedChats.length,
      });

      const encryptedPayload = await encryptString(serializedChats);
      await AsyncStorage.setItem(CHATS_KEY, encryptedPayload);

      const duration = Date.now() - startTime;
      devLog("[StorageService] saveChats completed", {
        duration: `${duration}ms`,
      });
    } catch (error) {
      // Persisting chat state failures are important during development, but
      // noisy (and sometimes privacy-sensitive) in production logs.
      devWarn("[StorageService] Error saving chats", error);
      throw error;
    }
  }

  static async loadChats(): Promise<Chat[]> {
    const startTime = Date.now();
    devLog("[StorageService] loadChats called");

    try {
      const serializedChats = await AsyncStorage.getItem(CHATS_KEY);

      // No data is valid (new user or cleared storage)
      if (!serializedChats) {
        devLog("[StorageService] No chats found in storage");
        return [];
      }

      devLog("[StorageService] Retrieved chats from storage", {
        dataSize: serializedChats.length,
      });

      let parsed: unknown;
      try {
        const decrypted = await decryptIfEncrypted(serializedChats);
        parsed = JSON.parse(decrypted, (key, value) => {
          if (key === "createdAt" || key === "updatedAt" || key === "timestamp") {
            // SECURITY FIX: Validate date parsing to prevent Invalid Date propagation.
            // new Date('garbage') returns an Invalid Date object (not null),
            // which causes silent failures downstream.
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              throw new StorageCorruptionError(
                `Invalid date value for ${key}: ${String(value).slice(0, 50)}`
              );
            }
            return date;
          }
          return value;
        });
      } catch (parseError) {
        // JSON parse failure = data corruption
        throw new StorageCorruptionError(
          "Failed to parse chats JSON - storage may be corrupted",
          parseError instanceof Error ? parseError : new Error(String(parseError)),
        );
      }

      // Validate structure
      if (!Array.isArray(parsed)) {
        throw new StorageCorruptionError(
          `Chats data is not an array (got ${typeof parsed})`,
        );
      }

      // SECURITY FIX: Validate each chat object structure to prevent runtime crashes
      // from corrupted or malicious data. Unsafe type casts like `parsed as Chat[]`
      // skip runtime validation and can cause crashes when accessing expected properties.
      for (let i = 0; i < parsed.length; i++) {
        const chat = parsed[i] as Record<string, unknown>;
        if (!chat || typeof chat !== 'object') {
          throw new StorageCorruptionError(
            `Chat at index ${i} is not an object`
          );
        }
        const chatId = chat['id'];
        if (typeof chatId !== 'string' || !chatId) {
          throw new StorageCorruptionError(
            `Chat at index ${i} has invalid id: ${String(chatId).slice(0, 50)}`
          );
        }
        const messages = chat['messages'];
        if (!Array.isArray(messages)) {
          throw new StorageCorruptionError(
            `Chat "${chatId}" has invalid messages array`
          );
        }
        // Validate messages structure
        for (let j = 0; j < messages.length; j++) {
          const msg = messages[j] as Record<string, unknown>;
          if (!msg || typeof msg !== 'object') {
            throw new StorageCorruptionError(
              `Message at index ${j} in chat "${chatId}" is not an object`
            );
          }
          const messageId = msg['id'];
          if (typeof messageId !== 'string' || !messageId) {
            throw new StorageCorruptionError(
              `Message at index ${j} in chat "${chatId}" has invalid id`
            );
          }
          const role = msg['role'];
          if (typeof role !== 'string' || !['user', 'assistant'].includes(role)) {
            throw new StorageCorruptionError(
              `Message "${messageId}" has invalid role: ${String(role)}`
            );
          }
          const content = msg['content'];
          if (typeof content !== 'string') {
            throw new StorageCorruptionError(
              `Message "${messageId}" has invalid content type: ${typeof content}`
            );
          }
        }
      }

      const chats = parsed as Chat[];

      const duration = Date.now() - startTime;
      devLog("[StorageService] loadChats completed", {
        chatCount: chats.length,
        duration: `${duration}ms`,
      });

      return chats;
    } catch (error) {
      // Re-throw StorageCorruptionError - caller needs to handle it
      if (error instanceof StorageCorruptionError) {
        devWarn("[StorageService] Storage corruption detected", error);
        throw error;
      }
      // Other errors (network, permission) are also thrown - not swallowed
      devWarn("[StorageService] Error loading chats", error);
      throw error;
    }
  }

  static async createChat(title?: string): Promise<Chat> {
    return this.queueOperation(async () => {
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
        devWarn("[StorageService] Error creating chat", error);
        throw error;
      }
    });
  }

  static async updateChat(
    chatId: string,
    updates: Partial<Chat>,
  ): Promise<void> {
    return this.queueOperation(async () => {
      try {
        const chats = await this.loadChats();
        const chatIndex = chats.findIndex((chat) => chat.id === chatId);

        if (chatIndex === -1) {
          throw new Error("Chat not found");
        }

        const existingChat = chats[chatIndex];
        if (!existingChat) {
          throw new Error("Chat not found");
        }

        const updatedChat: Chat = {
          ...existingChat,
          ...updates,
          id: existingChat.id,
          createdAt: existingChat.createdAt,
          messages: updates.messages ?? existingChat.messages,
          title: updates.title ?? existingChat.title,
          updatedAt: new Date(),
        };

        chats[chatIndex] = updatedChat;

        await this.saveChats(chats);
      } catch (error) {
        devWarn("[StorageService] Error updating chat", error);
        throw error;
      }
    });
  }

  static async deleteChat(chatId: string): Promise<void> {
    return this.queueOperation(async () => {
      try {
        const chats = await this.loadChats();
        const filteredChats = chats.filter((chat) => chat.id !== chatId);
        await this.saveChats(filteredChats);
      } catch (error) {
        devWarn("[StorageService] Error deleting chat", error);
        throw error;
      }
    });
  }

  static async addMessage(chatId: string, message: Message): Promise<void> {
    return this.queueOperation(async () => {
      const startTime = Date.now();
      devLog("[StorageService] addMessage called", {
        chatId,
        messageId: message.id,
        messageRole: message.role,
        contentLength: message.content.length,
        status: message.status,
      });

      try {
        devLog("[StorageService] Loading chats for addMessage...");
        const chats = await this.loadChats();

        const chatIndex = chats.findIndex((chat) => chat.id === chatId);

        if (chatIndex === -1) {
          devWarn("[StorageService] Chat not found", { chatId });
          throw new Error("Chat not found");
        }

        const chat = chats[chatIndex];
        if (!chat) {
          devWarn("[StorageService] Chat missing after lookup", { chatId });
          throw new Error("Chat not found");
        }

        devLog("[StorageService] Found chat", {
          chatIndex,
          existingMessageCount: chat.messages.length,
        });

        chat.messages.push(message);
        chat.updatedAt = new Date();

        devLog("[StorageService] Message added to chat array", {
          newMessageCount: chat.messages.length,
        });

        // Generate title from first message if it's still "New Chat"
        if (chat.title === "New Chat" && chat.messages.length === 1) {
          const firstMessage = chat.messages[0];
          if (firstMessage && firstMessage.role === "user") {
            chat.title =
              firstMessage.content.slice(0, 50) +
              (firstMessage.content.length > 50 ? "..." : "");
            devLog("[StorageService] Updated chat title", {
              newTitle: chat.title,
            });
          }
        }

        devLog("[StorageService] Saving chats with new message...");
        await this.saveChats(chats);

        const duration = Date.now() - startTime;
        devLog("[StorageService] addMessage completed", {
          duration: `${duration}ms`,
        });
      } catch (error) {
        devWarn("[StorageService] Error adding message", error);
        throw error;
      }
    });
  }

  static async updateMessage(
    chatId: string,
    messageId: string,
    updates: Partial<Message>,
  ): Promise<void> {
    return this.queueOperation(async () => {
      const startTime = Date.now();
      devLog("[StorageService] updateMessage called", {
        chatId,
        messageId,
        updates: {
          hasContent: !!updates.content,
          contentLength: updates.content?.length || 0,
          status: updates.status,
        },
      });

      try {
        devLog("[StorageService] Loading chats for updateMessage...");
        const chats = await this.loadChats();

        const chatIndex = chats.findIndex((chat) => chat.id === chatId);

        if (chatIndex === -1) {
          devWarn("[StorageService] Chat not found", { chatId });
          throw new Error("Chat not found");
        }

        const chat = chats[chatIndex];
        if (!chat) {
          devWarn("[StorageService] Chat missing after lookup", { chatId });
          throw new Error("Chat not found");
        }

        const messageIndex = chat.messages.findIndex((msg) => msg.id === messageId);

        if (messageIndex === -1) {
          devWarn("[StorageService] Message not found", {
            chatId,
            messageId,
            availableMessageIds: chat.messages.map((m) => m.id),
          });
          throw new Error("Message not found");
        }

        devLog("[StorageService] Found message to update", {
          chatIndex,
          messageIndex,
          currentStatus: chat.messages[messageIndex]?.status,
        });

        const existingMessage = chat.messages[messageIndex];
        if (!existingMessage) {
          devWarn("[StorageService] Message missing after lookup", { chatId, messageId });
          throw new Error("Message not found");
        }

        const updatedMessage: Message = {
          ...existingMessage,
          ...updates,
          id: existingMessage.id,
          role: existingMessage.role,
          content: updates.content ?? existingMessage.content,
          timestamp: existingMessage.timestamp,
          status: updates.status ?? existingMessage.status,
        };

        chat.messages[messageIndex] = updatedMessage;

        chat.updatedAt = new Date();

        devLog("[StorageService] Message updated in array", {
          contentLength: updatedMessage.content.length,
          newStatus: updatedMessage.status,
        });

        devLog("[StorageService] Saving chats with updated message...");
        await this.saveChats(chats);

        const duration = Date.now() - startTime;
        devLog("[StorageService] updateMessage completed", {
          duration: `${duration}ms`,
        });
      } catch (error) {
        devWarn("[StorageService] Error updating message", error);
        throw error;
      }
    });
  }

  static async clearAllChats(): Promise<void> {
    // Queue this even though it's write-only to ensure consistency
    // if clear happens while another operation is in progress
    return this.queueOperation(async () => {
      try {
        await AsyncStorage.removeItem(CHATS_KEY);
      } catch (error) {
        devWarn("[StorageService] Error clearing chats", error);
        throw error;
      }
    });
  }
}
