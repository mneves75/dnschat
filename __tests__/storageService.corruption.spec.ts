/**
 * StorageService Corruption Handling Tests
 *
 * These tests verify that the storage service properly distinguishes
 * between "no data" (valid for new users) and "corrupted data" (requires
 * user notification and potential recovery).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StorageService,
  StorageCorruptionError,
} from "../src/services/storageService";
import {
  EncryptionKeyCorruptionError,
  decryptIfEncrypted,
  encryptString,
} from "../src/services/encryptionService";
import * as encryptionService from "../src/services/encryptionService";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("StorageService Corruption Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // The deferred plaintext->encrypted migration populates the static chats
    // cache; clear it so migration writes in one test can't leak into the next.
    StorageService.invalidateChatCache();
  });

  describe("loadChats", () => {
    it("returns empty array when no data exists (new user)", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await StorageService.loadChats();

      expect(result).toEqual([]);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("@chat_dns_chats");
    });

    it("returns empty array for empty string (edge case)", async () => {
      // Empty string is falsy, treated same as null
      mockAsyncStorage.getItem.mockResolvedValue("");

      const result = await StorageService.loadChats();

      expect(result).toEqual([]);
    });

    it("recovers and returns empty array on invalid JSON by default", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("not valid json {{{");

      const result = await StorageService.loadChats();

      expect(result).toEqual([]);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "@chat_dns_chats_backup",
        expect.not.stringContaining("not valid json"),
      );
      const backupCall = mockAsyncStorage.setItem.mock.calls.find(
        ([key]) => key === "@chat_dns_chats_backup",
      );
      const backupPayload = String(backupCall?.[1]);
      expect(backupPayload).toContain("enc:v1:");
      expect(backupPayload).toContain('"payloadWasEncrypted":false');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
    });

    it.each([false, true])(
      "keeps malformed-schema content out of backup metadata (encrypted=%s)",
      async (encrypted) => {
        const marker = "PRIVATE_METADATA_SENTINEL";
        const originalPayload = JSON.stringify([
          {
            id: "fixture-chat",
            title: "Fixture",
            createdAt: "2026-09-01T00:00:00.000Z",
            updatedAt: "2026-09-01T00:00:00.000Z",
            messages: [
              {
                id: "fixture-message",
                role: marker,
                content: "Fixture",
                timestamp: "2026-09-01T00:00:00.000Z",
                status: "sent",
              },
            ],
          },
        ]);
        mockAsyncStorage.getItem.mockResolvedValue(
          encrypted ? await encryptString(originalPayload) : originalPayload,
        );

        await expect(
          StorageService.loadChats({ recoverOnCorruption: false }),
        ).rejects.toThrow(marker);
        const chats = await StorageService.loadChats();
        expect(chats).toHaveLength(1);
        expect(chats[0]?.messages).toEqual([]);
        const backupCall = mockAsyncStorage.setItem.mock.calls.find(
          ([key]) => key === "@chat_dns_chats_backup",
        );
        expect(backupCall).toBeDefined();
        const backup = JSON.parse(String(backupCall?.[1]));
        expect(backup.error).toMatch(/^sha256:[a-f0-9]{64}$/);
        expect(JSON.stringify(backup)).not.toContain(marker);
        await expect(decryptIfEncrypted(backup.payload)).resolves.toBe(
          originalPayload,
        );
      },
    );

    it("throws StorageCorruptionError on invalid JSON when recovery disabled", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("not valid json {{{");

      await expect(
        StorageService.loadChats({ recoverOnCorruption: false }),
      ).rejects.toThrow(StorageCorruptionError);
      await expect(
        StorageService.loadChats({ recoverOnCorruption: false }),
      ).rejects.toThrow(/Failed to parse chats JSON/);
    });

    it("recovers when data is not an array", async () => {
      // Object instead of array
      mockAsyncStorage.getItem.mockResolvedValue('{"id": "123"}');

      const result = await StorageService.loadChats();
      expect(result).toEqual([]);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
    });

    it("recovers when data is a string", async () => {
      mockAsyncStorage.getItem.mockResolvedValue('"just a string"');

      const result = await StorageService.loadChats();
      expect(result).toEqual([]);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
    });

    it("recovers when data is a number", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("42");

      const result = await StorageService.loadChats();
      expect(result).toEqual([]);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
    });

    it("returns parsed chats when data is valid", async () => {
      const validChats = [
        {
          id: "chat-1",
          title: "Test Chat",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
          messages: [],
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(validChats));

      const result = await StorageService.loadChats();

      expect(result).toHaveLength(1);
      const first = result[0];
      if (!first) throw new Error("Expected chat to exist");
      expect(first.id).toBe("chat-1");
      expect(first.title).toBe("Test Chat");
    });

    it("preserves encrypted chat storage when key material is corrupted", async () => {
      const encryptedPayload = "enc:v1:001122:334455";
      mockAsyncStorage.getItem.mockResolvedValue(encryptedPayload);
      const decryptSpy = jest
        .spyOn(encryptionService, "decryptIfEncrypted")
        .mockRejectedValueOnce(
          new EncryptionKeyCorruptionError(
            "Stored encryption key is malformed",
          ),
        );

      try {
        await expect(StorageService.loadChats()).rejects.toBeInstanceOf(
          EncryptionKeyCorruptionError,
        );
      } finally {
        decryptSpy.mockRestore();
      }

      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalled();
    });

    it("preserves a valid encrypted payload when SecureStore read is temporarily unavailable", async () => {
      const encryptedPayload = await encryptString(
        JSON.stringify([
          {
            id: "chat-1",
            title: "Test Chat",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z",
            messages: [],
          },
        ]),
      );
      const originalWorkerId = process.env["JEST_WORKER_ID"];
      delete process.env["JEST_WORKER_ID"];
      try {
        jest.resetModules();
        const {
          EncryptionKeyUnavailableError: FreshEncryptionKeyUnavailableError,
        } =
          require("../src/services/encryptionService") as typeof import("../src/services/encryptionService");
        const { StorageService: FreshStorageService } =
          require("../src/services/storageService") as typeof import("../src/services/storageService");
        const freshAsyncStorage =
          require("@react-native-async-storage/async-storage") as jest.Mocked<
            typeof AsyncStorage
          >;
        const secureStore = require("expo-secure-store") as {
          getItemAsync: jest.Mock;
          setItemAsync: jest.Mock;
          deleteItemAsync: jest.Mock;
        };
        freshAsyncStorage.getItem.mockResolvedValue(encryptedPayload);
        secureStore.getItemAsync.mockRejectedValueOnce(
          new Error("SecureStore read failed"),
        );

        await expect(FreshStorageService.loadChats()).rejects.toBeInstanceOf(
          FreshEncryptionKeyUnavailableError,
        );

        expect(freshAsyncStorage.setItem).not.toHaveBeenCalled();
        expect(freshAsyncStorage.removeItem).not.toHaveBeenCalled();
        expect(secureStore.setItemAsync).not.toHaveBeenCalled();
        expect(secureStore.deleteItemAsync).not.toHaveBeenCalled();
      } finally {
        if (originalWorkerId !== undefined) {
          process.env["JEST_WORKER_ID"] = originalWorkerId;
        }
      }
    });

    it("migrates a legacy plaintext payload to an encrypted payload through the mutation queue", async () => {
      // Encryption-at-rest must survive the corruption-quarantine refactor: a
      // read-only upgrade (open the app, never mutate) must still re-encrypt
      // legacy plaintext. loadChats performs no direct write; the encrypting
      // save runs inside the serialized mutation queue, so CACHE-01 stays closed.
      const legacyChats = [
        {
          id: "chat-1",
          title: "Legacy Chat",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
          messages: [],
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(legacyChats));

      const result = await StorageService.loadChats();

      expect(result[0]?.title).toBe("Legacy Chat");
      const migrationCall = mockAsyncStorage.setItem.mock.calls.find(
        ([key]) => key === "@chat_dns_chats",
      );
      expect(migrationCall).toBeDefined();
      const migratedPayload = String(migrationCall?.[1]);
      expect(migratedPayload).toContain("enc:v1:");
      expect(migratedPayload).not.toContain("Legacy Chat");
      const decrypted = await decryptIfEncrypted(migratedPayload);
      const migratedChats = JSON.parse(decrypted) as Array<{ id: string }>;
      expect(migratedChats.map((chat) => chat.id)).toEqual(["chat-1"]);
    });

    it("does not rewrite CHATS_KEY from the load path when quarantining an already-encrypted payload (CACHE-01)", async () => {
      // For an already-encrypted payload there is no migration to perform, so a
      // quarantine load returns survivors WITHOUT rewriting CHATS_KEY: a write
      // here would be non-queued and could clobber a concurrent mutation. It
      // only backs up the original; cleaned data is re-quarantined idempotently
      // until a real mutation persists it through the serialized queue.
      const encrypted = await encryptString(
        JSON.stringify([
          {
            id: "chat-good",
            title: "Good",
            createdAt: "2025-06-15T12:00:00.000Z",
            updatedAt: "2025-06-15T13:00:00.000Z",
            messages: [],
          },
          { id: "chat-corrupt", title: "Corrupt", messages: [] },
        ]),
      );
      mockAsyncStorage.getItem.mockResolvedValue(encrypted);

      const chats = await StorageService.loadChats();

      expect(chats.map(({ id }) => id)).toEqual(["chat-good"]);
      // A backup of the original is written (forensics, a different key)...
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "@chat_dns_chats_backup",
        expect.any(String),
      );
      // ...but CHATS_KEY itself is never written or wiped by the load.
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalledWith(
        "@chat_dns_chats",
        expect.anything(),
      );
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
    });

    it("converts date strings to Date objects", async () => {
      const chatsWithDates = [
        {
          id: "chat-1",
          title: "Test",
          createdAt: "2025-06-15T12:00:00.000Z",
          updatedAt: "2025-06-15T13:00:00.000Z",
          messages: [
            {
              id: "msg-1",
              content: "Hello",
              role: "user",
              timestamp: "2025-06-15T12:30:00.000Z",
            },
          ],
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(chatsWithDates),
      );

      const result = await StorageService.loadChats();

      const first = result[0];
      if (!first) throw new Error("Expected chat to exist");
      const firstMessage = first.messages[0];
      if (!firstMessage) throw new Error("Expected message to exist");
      expect(first.createdAt).toBeInstanceOf(Date);
      expect(first.updatedAt).toBeInstanceOf(Date);
      expect(firstMessage.timestamp).toBeInstanceOf(Date);
      expect(firstMessage.status).toBe("sent");
    });

    it("hydrates an interrupted sending response as a retry-eligible error", async () => {
      const interruptedChat = [
        {
          id: "chat-1",
          title: "Interrupted Chat",
          createdAt: "2025-06-15T12:00:00.000Z",
          updatedAt: "2025-06-15T13:00:00.000Z",
          messages: [
            {
              id: "msg-user",
              content: "Retry this prompt",
              role: "user",
              timestamp: "2025-06-15T12:30:00.000Z",
              status: "sent",
            },
            {
              id: "msg-assistant",
              content: "",
              role: "assistant",
              timestamp: "2025-06-15T12:30:01.000Z",
              status: "sending",
            },
          ],
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(interruptedChat),
      );

      const result = await StorageService.loadChats();
      const messages = result[0]?.messages;

      expect(messages).toMatchObject([
        { role: "user", content: "Retry this prompt", status: "sent" },
        { role: "assistant", status: "error" },
      ]);
      expect(messages?.[messages.length - 1]?.status).toBe("error");
      expect(messages?.[messages.length - 2]?.role).toBe("user");
    });

    it.each([
      ["title", 42, /invalid title/],
      ["createdAt", undefined, /missing or invalid timestamps/],
      ["updatedAt", undefined, /missing or invalid timestamps/],
    ])(
      "rejects a chat with invalid %s in strict mode",
      async (field, value, expectedError) => {
        const invalidChat: Record<string, unknown> = {
          id: "chat-1",
          title: "Test",
          createdAt: "2025-06-15T12:00:00.000Z",
          updatedAt: "2025-06-15T13:00:00.000Z",
          messages: [],
        };
        invalidChat[field] = value;
        mockAsyncStorage.getItem.mockResolvedValue(
          JSON.stringify([invalidChat]),
        );

        await expect(
          StorageService.loadChats({ recoverOnCorruption: false }),
        ).rejects.toThrow(expectedError);
      },
    );

    it("quarantines one invalid chat while preserving valid chats by default", async () => {
      const validChatA = {
        id: "chat-a",
        title: "Chat A",
        createdAt: "2025-06-15T12:00:00.000Z",
        updatedAt: "2025-06-15T13:00:00.000Z",
        messages: [],
      };
      const chatMissingTimestamps = {
        id: "chat-corrupted",
        title: "Corrupted Chat",
        messages: [],
      };
      const validChatB = {
        id: "chat-b",
        title: "Chat B",
        createdAt: "2025-06-16T12:00:00.000Z",
        updatedAt: "2025-06-16T13:00:00.000Z",
        messages: [],
      };
      const originalPayload = JSON.stringify([
        validChatA,
        chatMissingTimestamps,
        validChatB,
      ]);
      mockAsyncStorage.getItem.mockResolvedValue(originalPayload);

      const chats = await StorageService.loadChats();

      expect(chats.map(({ id }) => id)).toEqual(["chat-a", "chat-b"]);
      const backupCall = mockAsyncStorage.setItem.mock.calls.find(
        ([key]) => key === "@chat_dns_chats_backup",
      );
      const backup = JSON.parse(String(backupCall?.[1])) as Record<
        string,
        unknown
      >;
      expect(typeof backup["payload"]).toBe("string");
      await expect(decryptIfEncrypted(String(backup["payload"]))).resolves.toBe(
        originalPayload,
      );
      // The legacy plaintext payload is migrated through the serialized queue:
      // survivors are re-persisted encrypted (the migration re-quarantines the
      // bad record idempotently). loadChats never writes CHATS_KEY directly.
      const persistedCall = mockAsyncStorage.setItem.mock.calls.find(
        ([key]) => key === "@chat_dns_chats",
      );
      const persisted = await decryptIfEncrypted(String(persistedCall?.[1]));
      const persistedChats = JSON.parse(persisted) as Array<
        Record<string, unknown>
      >;
      expect(persistedChats.map((chat) => chat["id"])).toEqual([
        "chat-a",
        "chat-b",
      ]);
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
    });

    it("leaves the original payload intact when the quarantine backup write fails", async () => {
      const originalPayload = JSON.stringify([
        {
          id: "chat-corrupted",
          title: "Corrupted Chat",
          messages: [],
        },
      ]);
      mockAsyncStorage.getItem.mockResolvedValue(originalPayload);
      mockAsyncStorage.setItem.mockRejectedValueOnce(
        new Error("Backup write failed"),
      );

      await expect(StorageService.loadChats()).rejects.toThrow(
        "Backup write failed",
      );

      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "@chat_dns_chats_backup",
        expect.any(String),
      );
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
    });

    it("leaves an unparseable primary payload intact when backup encryption fails", async () => {
      const originalPayload = "not valid json {{{";
      mockAsyncStorage.getItem.mockResolvedValue(originalPayload);
      const encryptSpy = jest
        .spyOn(encryptionService, "encryptString")
        .mockRejectedValueOnce(new Error("Backup encryption failed"));

      try {
        await expect(StorageService.loadChats()).rejects.toThrow(
          "Backup encryption failed",
        );
      } finally {
        encryptSpy.mockRestore();
      }

      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
    });

    it("leaves an unparseable primary payload intact when the backup write exceeds quota", async () => {
      const originalPayload = "not valid json {{{";
      mockAsyncStorage.getItem.mockResolvedValue(originalPayload);
      mockAsyncStorage.setItem.mockRejectedValueOnce(
        new Error("AsyncStorage quota exceeded"),
      );

      await expect(StorageService.loadChats()).rejects.toThrow(
        "AsyncStorage quota exceeded",
      );

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "@chat_dns_chats_backup",
        expect.stringContaining('"payload"'),
      );
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
    });

    it("normalizes a legacy blank title without discarding valid history", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify([
          {
            id: "chat-1",
            title: "   ",
            createdAt: "2025-06-15T12:00:00.000Z",
            updatedAt: "2025-06-15T13:00:00.000Z",
            messages: [],
          },
        ]),
      );

      const chats = await StorageService.loadChats({
        recoverOnCorruption: false,
      });
      expect(chats[0]?.title).toBe("New Chat");
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
    });

    it("rejects a message with a missing timestamp in strict mode", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify([
          {
            id: "chat-1",
            title: "Test",
            createdAt: "2025-06-15T12:00:00.000Z",
            updatedAt: "2025-06-15T13:00:00.000Z",
            messages: [
              { id: "msg-1", role: "user", content: "Hello", status: "sent" },
            ],
          },
        ]),
      );

      await expect(
        StorageService.loadChats({ recoverOnCorruption: false }),
      ).rejects.toThrow(/missing or invalid timestamp/);
    });

    it("rejects an unknown message status in strict mode", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify([
          {
            id: "chat-1",
            title: "Test",
            createdAt: "2025-06-15T12:00:00.000Z",
            updatedAt: "2025-06-15T13:00:00.000Z",
            messages: [
              {
                id: "msg-1",
                role: "user",
                content: "Hello",
                timestamp: "2025-06-15T12:30:00.000Z",
                status: "unknown",
              },
            ],
          },
        ]),
      );

      await expect(
        StorageService.loadChats({ recoverOnCorruption: false }),
      ).rejects.toThrow(/invalid status/);
    });

    it("quarantines one bad message while preserving its chat and valid messages", async () => {
      const originalPayload = JSON.stringify([
        {
          id: "chat-1",
          title: "Test",
          createdAt: "2025-06-15T12:00:00.000Z",
          updatedAt: "2025-06-15T13:00:00.000Z",
          messages: [
            {
              id: "msg-good-a",
              role: "user",
              content: "Hello",
              timestamp: "2025-06-15T12:30:00.000Z",
              status: "sent",
            },
            {
              id: "msg-corrupted",
              role: "assistant",
              content: "Missing timestamp",
              status: "sent",
            },
            {
              id: "msg-good-b",
              role: "assistant",
              content: "World",
              timestamp: "2025-06-15T12:31:00.000Z",
              status: "sent",
            },
          ],
        },
      ]);
      mockAsyncStorage.getItem.mockResolvedValue(originalPayload);

      const chats = await StorageService.loadChats();

      expect(chats).toHaveLength(1);
      expect(chats[0]?.messages.map(({ id }) => id)).toEqual([
        "msg-good-a",
        "msg-good-b",
      ]);
      // Legacy plaintext is migrated through the queue: the surviving messages
      // are re-persisted encrypted, and the original is backed up for forensics.
      const persistedCall = mockAsyncStorage.setItem.mock.calls.find(
        ([key]) => key === "@chat_dns_chats",
      );
      const persisted = await decryptIfEncrypted(String(persistedCall?.[1]));
      const persistedChats = JSON.parse(persisted) as Array<
        Record<string, unknown>
      >;
      const persistedMessages = persistedChats[0]?.["messages"];
      expect(Array.isArray(persistedMessages)).toBe(true);
      expect(persistedMessages).toHaveLength(2);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "@chat_dns_chats_backup",
        expect.any(String),
      );
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
    });

    it("treats a null date as corruption instead of silently coercing to the 1970 epoch", async () => {
      // Regression: new Date(null) returns a *valid* Date (epoch 0), which would
      // silently corrupt timestamps and reorder the chat list rather than be caught.
      // The reviver returns the raw null (never coerces); the per-record loop then
      // rejects the record because null is not a Date instance.
      const chatsWithNullDate = [
        {
          id: "chat-1",
          title: "Test",
          createdAt: null,
          updatedAt: "2025-06-15T13:00:00.000Z",
          messages: [],
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(chatsWithNullDate),
      );

      await expect(
        StorageService.loadChats({ recoverOnCorruption: false }),
      ).rejects.toThrow(/missing or invalid timestamps/);
    });

    it("treats an object-valued timestamp as corruption", async () => {
      const chatsWithObjectDate = [
        {
          id: "chat-1",
          title: "Test",
          createdAt: "2025-06-15T12:00:00.000Z",
          updatedAt: "2025-06-15T13:00:00.000Z",
          messages: [
            {
              id: "msg-1",
              content: "Hello",
              role: "user",
              timestamp: { spoofed: true },
            },
          ],
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(chatsWithObjectDate),
      );

      await expect(
        StorageService.loadChats({ recoverOnCorruption: false }),
      ).rejects.toThrow(/missing or invalid timestamp/);
    });

    it("quarantines a present-but-invalid date string without wiping valid history", async () => {
      // Regression for the corruption blast-radius: an invalid *present* date
      // string (e.g. a partially corrupted payload) must drop only its own
      // record, not the entire chat history, under the default recovery mode.
      const validChatA = {
        id: "chat-a",
        title: "Chat A",
        createdAt: "2025-06-15T12:00:00.000Z",
        updatedAt: "2025-06-15T13:00:00.000Z",
        messages: [],
      };
      const chatWithBadDate = {
        id: "chat-corrupted",
        title: "Corrupted Chat",
        createdAt: "not-a-real-date",
        updatedAt: "2025-06-15T13:00:00.000Z",
        messages: [],
      };
      const validChatB = {
        id: "chat-b",
        title: "Chat B",
        createdAt: "2025-06-16T12:00:00.000Z",
        updatedAt: "2025-06-16T13:00:00.000Z",
        messages: [],
      };
      const originalPayload = JSON.stringify([
        validChatA,
        chatWithBadDate,
        validChatB,
      ]);
      mockAsyncStorage.getItem.mockResolvedValue(originalPayload);

      const chats = await StorageService.loadChats();

      expect(chats.map(({ id }) => id)).toEqual(["chat-a", "chat-b"]);
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
      const backupCall = mockAsyncStorage.setItem.mock.calls.find(
        ([key]) => key === "@chat_dns_chats_backup",
      );
      expect(backupCall).toBeDefined();
    });

    it("quarantines a message with a present-but-invalid timestamp string", async () => {
      const originalPayload = JSON.stringify([
        {
          id: "chat-1",
          title: "Test",
          createdAt: "2025-06-15T12:00:00.000Z",
          updatedAt: "2025-06-15T13:00:00.000Z",
          messages: [
            {
              id: "msg-good",
              role: "user",
              content: "Hello",
              timestamp: "2025-06-15T12:30:00.000Z",
              status: "sent",
            },
            {
              id: "msg-bad-date",
              role: "assistant",
              content: "Corrupt timestamp",
              timestamp: "definitely-not-a-date",
              status: "sent",
            },
          ],
        },
      ]);
      mockAsyncStorage.getItem.mockResolvedValue(originalPayload);

      const chats = await StorageService.loadChats();

      expect(chats).toHaveLength(1);
      expect(chats[0]?.messages.map(({ id }) => id)).toEqual(["msg-good"]);
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
    });

    it("preserves error cause when recovery disabled", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("{truncated json");

      await expect(
        StorageService.loadChats({ recoverOnCorruption: false }),
      ).rejects.toMatchObject({
        name: "StorageCorruptionError",
        cause: expect.objectContaining({
          message: expect.stringContaining("JSON"),
        }),
      } satisfies Partial<StorageCorruptionError>);
    });

    it("propagates AsyncStorage errors without masking them", async () => {
      const asyncStorageError = new Error("AsyncStorage quota exceeded");
      mockAsyncStorage.getItem.mockRejectedValue(asyncStorageError);

      await expect(
        StorageService.loadChats({ recoverOnCorruption: false }),
      ).rejects.toThrow("AsyncStorage quota exceeded");
    });
  });

  describe("StorageCorruptionError", () => {
    it("has correct name property", () => {
      const error = new StorageCorruptionError("test");
      expect(error.name).toBe("StorageCorruptionError");
    });

    it("extends Error", () => {
      const error = new StorageCorruptionError("test");
      expect(error).toBeInstanceOf(Error);
    });

    it("stores cause for debugging", () => {
      const cause = new Error("Original error");
      const error = new StorageCorruptionError("Wrapper", cause);
      expect(error.cause).toBe(cause);
    });
  });

  describe("clearAllChats", () => {
    it("removes primary chat storage and corrupted chat backups", async () => {
      await StorageService.clearAllChats();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        "@chat_dns_chats",
      );
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        "@chat_dns_chats_backup",
      );
    });
  });
});
