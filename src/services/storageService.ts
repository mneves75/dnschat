import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Chat, Message } from "../types/chat";
import uuid from "react-native-uuid";
import { devLog, devLogLazy, devWarn, devWarnLazy } from "../utils/devLog";
import { decryptIfEncrypted, encryptString, isEncryptedPayload } from "./encryptionService";
import { STORAGE_CONSTANTS } from "../constants/appConstants";

const CHATS_KEY = STORAGE_CONSTANTS.CHATS_KEY;
const CHAT_BACKUP_KEY = STORAGE_CONSTANTS.CHAT_BACKUP_KEY;

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
   * PERFORMANCE: In-memory cache of the last known-good chats array.
   *
   * Every mutation used to do loadChats() → full AsyncStorage read → AES-GCM
   * decrypt → JSON.parse → full validation, so one sendMessage (3 mutations)
   * cost 6 full-history crypto passes. The cache lives strictly inside the
   * operation queue (which already serializes all read-modify-write access,
   * so the cache cannot race): the first mutation loads + caches, subsequent
   * mutations reuse the cache, and each successful save re-points the cache
   * at the persisted array.
   *
   * Invariants:
   * - Only assigned after a successful saveChats() inside a queued mutation
   *   (never from a failed/partial load, so decrypt errors can't poison it).
   * - Invalidated whenever storage may have diverged: mutation failure
   *   (in-place edits may have dirtied the cached array), clearAllChats(),
   *   and corruption recovery inside loadChats().
   * - Public loadChats() never reads or writes the cache — it runs outside
   *   the queue, and populating the cache there could race a queued mutation.
   */
  private static cachedChats: Chat[] | null = null;

  /**
   * Drops the in-memory chats cache so the next mutation re-reads
   * AsyncStorage. Call after any external write/clear/import of the chats
   * key that bypasses the mutation helpers (also used by tests to isolate
   * static state between cases).
   */
  static invalidateChatCache(): void {
    this.cachedChats = null;
  }

  /**
   * Returns the chats array for a queued mutation: the warm cache when
   * available, otherwise a fresh validated load. MUST only be called from
   * inside queueOperation() — the queue is what makes cache access safe.
   */
  private static async getChatsForMutation(): Promise<Chat[]> {
    if (this.cachedChats) {
      return this.cachedChats;
    }
    // Note: if this load throws (decrypt/parse failure), nothing is cached.
    return this.loadChats({ migratePlaintext: false });
  }

  /**
   * Single choke point for every read-modify-write on the chats array.
   * Applies the cache contract in one place: warm load, caller mutation,
   * save, cache commit on success, cache invalidation on any failure
   * (in-place edits may have dirtied the cached array before a failed save).
   */
  private static mutateChats<T>(
    label: string,
    mutate: (chats: Chat[]) => { chats: Chat[]; result: T },
  ): Promise<T> {
    return this.queueOperation(async () => {
      const startTime = Date.now();
      try {
        const loaded = await this.getChatsForMutation();
        const { chats, result } = mutate(loaded);
        await this.saveChats(chats);
        this.cachedChats = chats;
        devLogLazy(`[StorageService] ${label} completed`, () => ({
          duration: `${Date.now() - startTime}ms`,
        }));
        return result;
      } catch (error) {
        this.invalidateChatCache();
        devWarn(`[StorageService] ${label} failed`, error);
        throw error;
      }
    });
  }

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

  private static serializeChats(chats: Chat[]): string {
    return JSON.stringify(chats, (key, value) => {
      if (key === "createdAt" || key === "updatedAt" || key === "timestamp") {
        return new Date(value).toISOString();
      }
      return value;
    });
  }

  private static async createCorruptionBackupPayload(
    error: StorageCorruptionError,
    storedPayload: string,
  ): Promise<string> {
    const timestamp = new Date().toISOString();
    const payloadWasEncrypted = isEncryptedPayload(storedPayload);

    try {
      const protectedPayload = payloadWasEncrypted
        ? storedPayload
        : await encryptString(storedPayload);

      return JSON.stringify({
        timestamp,
        error: error.message,
        payload: protectedPayload,
        payloadWasEncrypted,
      });
    } catch (backupEncryptionError) {
      devWarn(
        "[StorageService] Failed to encrypt corrupted storage backup payload",
        backupEncryptionError,
      );
      return JSON.stringify({
        timestamp,
        error: error.message,
        payloadRedacted: true,
        payloadWasEncrypted,
      });
    }
  }

  static async saveChats(chats: Chat[]): Promise<void> {
    const startTime = Date.now();
    devLogLazy("[StorageService] saveChats called", () => ({
      chatCount: chats.length,
      chatIds: chats.map((c) => c.id),
    }));

    try {
      const serializedChats = this.serializeChats(chats);

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

  static async loadChats(options?: {
    migratePlaintext?: boolean;
    recoverOnCorruption?: boolean;
  }): Promise<Chat[]> {
    const startTime = Date.now();
    devLog("[StorageService] loadChats called");
    const migratePlaintext = options?.migratePlaintext !== false;
    const recoverOnCorruption = options?.recoverOnCorruption !== false;
    let serializedChats: string | null = null;

    try {
      serializedChats = await AsyncStorage.getItem(CHATS_KEY);

      // No data is valid (new user or cleared storage)
      if (!serializedChats) {
        devLog("[StorageService] No chats found in storage");
        return [];
      }

      devLog("[StorageService] Retrieved chats from storage", {
        dataSize: serializedChats.length,
      });

      let parsed: unknown;
      let decrypted = '';
      try {
        decrypted = await decryptIfEncrypted(serializedChats);
        parsed = JSON.parse(decrypted, (key, value) => {
          if (key === "createdAt" || key === "updatedAt" || key === "timestamp") {
            // SECURITY FIX: Validate date parsing to prevent Invalid Date propagation.
            // new Date('garbage') returns an Invalid Date object (not null),
            // which causes silent failures downstream.
            // Reject non-string/non-number values first: new Date(null) coerces to
            // the 1970 epoch (a *valid* Date), which would silently corrupt
            // timestamps and reorder chats instead of being caught below.
            if (typeof value !== "string" && typeof value !== "number") {
              throw new StorageCorruptionError(
                `Invalid date type for ${key}: ${value === null ? "null" : typeof value}`,
              );
            }
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
        const cause = parseError instanceof Error ? parseError : new Error(String(parseError));
        if (parseError instanceof StorageCorruptionError) {
          throw parseError;
        }
        let hint = '';
        const causeMessage = cause.message.toLowerCase();
        if (
          causeMessage.includes('ghash') ||
          causeMessage.includes('auth tag') ||
          causeMessage.includes('invalid tag') ||
          causeMessage.includes('decrypt')
        ) {
          hint = ' (likely encryption key mismatch)';
        }
        const payloadInfo = decrypted ? ` (decrypted length ${decrypted.length})` : '';
        throw new StorageCorruptionError(
          `Failed to parse chats JSON - storage may be corrupted${hint}${payloadInfo}`,
          cause,
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

      if (migratePlaintext && !isEncryptedPayload(serializedChats)) {
        const latestPayload = await AsyncStorage.getItem(CHATS_KEY);
        if (latestPayload === serializedChats) {
          const encryptedPayload = await encryptString(this.serializeChats(chats));
          await AsyncStorage.setItem(CHATS_KEY, encryptedPayload);
          devWarn("[StorageService] Migrated legacy plaintext chat storage to encrypted payload");
        } else {
          devWarn("[StorageService] Skipped plaintext migration because chat storage changed concurrently");
        }
      }

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
        if (recoverOnCorruption) {
          try {
            if (serializedChats) {
              const backupPayload = await this.createCorruptionBackupPayload(
                error,
                serializedChats,
              );
              await AsyncStorage.setItem(CHAT_BACKUP_KEY, backupPayload);
              devWarn("[StorageService] Corrupted storage backed up", {
                key: CHAT_BACKUP_KEY,
              });
            }
          } catch (backupError) {
            devWarn("[StorageService] Failed to backup corrupted storage", backupError);
          }

          try {
            await AsyncStorage.removeItem(CHATS_KEY);
            devWarn("[StorageService] Corrupted storage cleared", {
              key: CHATS_KEY,
            });
          } catch (clearError) {
            devWarn("[StorageService] Failed to clear corrupted storage", clearError);
          }
          // Storage content just changed underneath any warm mutation cache.
          this.invalidateChatCache();
          return [];
        }
        throw error;
      }
      // Other errors (network, permission) are also thrown - not swallowed
      devWarn("[StorageService] Error loading chats", error);
      throw error;
    }
  }

  static async createChat(title?: string): Promise<Chat> {
    return this.mutateChats("createChat", (chats) => {
      const newChat: Chat = {
        id: uuid.v4() as string,
        title: title || "New Chat",
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };
      chats.unshift(newChat);
      return { chats, result: newChat };
    });
  }

  static async updateChat(
    chatId: string,
    updates: Partial<Chat>,
  ): Promise<void> {
    return this.mutateChats("updateChat", (chats) => {
      const chatIndex = chats.findIndex((chat) => chat.id === chatId);
      const existingChat = chatIndex === -1 ? undefined : chats[chatIndex];
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
      return { chats, result: undefined };
    });
  }

  static async deleteChat(chatId: string): Promise<void> {
    return this.mutateChats("deleteChat", (chats) => ({
      chats: chats.filter((chat) => chat.id !== chatId),
      result: undefined,
    }));
  }

  static async addMessage(chatId: string, message: Message): Promise<void> {
    devLog("[StorageService] addMessage called", {
      chatId,
      messageId: message.id,
      messageRole: message.role,
      contentLength: message.content.length,
      status: message.status,
    });

    return this.mutateChats("addMessage", (chats) => {
      const chat = chats.find((candidate) => candidate.id === chatId);
      if (!chat) {
        devWarn("[StorageService] Chat not found", { chatId });
        throw new Error("Chat not found");
      }

      chat.messages.push(message);
      chat.updatedAt = new Date();

      // Generate title from first message if it's still "New Chat"
      if (chat.title === "New Chat" && chat.messages.length === 1) {
        const firstMessage = chat.messages[0];
        if (firstMessage && firstMessage.role === "user") {
          chat.title =
            firstMessage.content.slice(0, 50) +
            (firstMessage.content.length > 50 ? "..." : "");
        }
      }

      return { chats, result: undefined };
    });
  }

  static async updateMessage(
    chatId: string,
    messageId: string,
    updates: Partial<Message>,
  ): Promise<void> {
    devLog("[StorageService] updateMessage called", {
      chatId,
      messageId,
      updates: {
        hasContent: !!updates.content,
        contentLength: updates.content?.length || 0,
        status: updates.status,
      },
    });

    return this.mutateChats("updateMessage", (chats) => {
      const chat = chats.find((candidate) => candidate.id === chatId);
      if (!chat) {
        devWarn("[StorageService] Chat not found", { chatId });
        throw new Error("Chat not found");
      }

      const messageIndex = chat.messages.findIndex((msg) => msg.id === messageId);
      const existingMessage =
        messageIndex === -1 ? undefined : chat.messages[messageIndex];

      if (!existingMessage) {
        devWarnLazy("[StorageService] Message not found", () => ({
          chatId,
          messageId,
          availableMessageIds: chat.messages.map((m) => m.id),
        }));
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

      return { chats, result: undefined };
    });
  }

  static async clearAllChats(): Promise<void> {
    // Queue this even though it's write-only to ensure consistency
    // if clear happens while another operation is in progress
    return this.queueOperation(async () => {
      // Invalidate up front: even a partially failed clear means the cache
      // can no longer be trusted to mirror storage.
      this.invalidateChatCache();
      try {
        await Promise.all([
          AsyncStorage.removeItem(CHATS_KEY),
          AsyncStorage.removeItem(CHAT_BACKUP_KEY),
        ]);
      } catch (error) {
        devWarn("[StorageService] Error clearing chats", error);
        throw error;
      }
    });
  }
}
