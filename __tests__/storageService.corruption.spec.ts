/**
 * StorageService Corruption Handling Tests
 *
 * These tests verify that the storage service properly distinguishes
 * between "no data" (valid for new users) and "corrupted data" (requires
 * user notification and potential recovery).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageService, StorageCorruptionError } from "../src/services/storageService";

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

    it("throws StorageCorruptionError on invalid JSON", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("not valid json {{{");

      await expect(StorageService.loadChats()).rejects.toThrow(StorageCorruptionError);
      await expect(StorageService.loadChats()).rejects.toThrow(
        /Failed to parse chats JSON/,
      );
    });

    it("throws StorageCorruptionError when data is not an array", async () => {
      // Object instead of array
      mockAsyncStorage.getItem.mockResolvedValue('{"id": "123"}');

      await expect(StorageService.loadChats()).rejects.toThrow(StorageCorruptionError);
      await expect(StorageService.loadChats()).rejects.toThrow(/not an array/);
    });

    it("throws StorageCorruptionError when data is a string", async () => {
      mockAsyncStorage.getItem.mockResolvedValue('"just a string"');

      await expect(StorageService.loadChats()).rejects.toThrow(StorageCorruptionError);
      await expect(StorageService.loadChats()).rejects.toThrow(/not an array/);
    });

    it("throws StorageCorruptionError when data is a number", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("42");

      await expect(StorageService.loadChats()).rejects.toThrow(StorageCorruptionError);
      await expect(StorageService.loadChats()).rejects.toThrow(/not an array/);
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
      expect(result[0].id).toBe("chat-1");
      expect(result[0].title).toBe("Test Chat");
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
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(chatsWithDates));

      const result = await StorageService.loadChats();

      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].updatedAt).toBeInstanceOf(Date);
      expect(result[0].messages[0].timestamp).toBeInstanceOf(Date);
    });

    it("preserves error cause in StorageCorruptionError", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("{truncated json");

      try {
        await StorageService.loadChats();
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(StorageCorruptionError);
        expect((error as StorageCorruptionError).cause).toBeDefined();
        expect((error as StorageCorruptionError).cause?.message).toContain("JSON");
      }
    });

    it("propagates AsyncStorage errors without masking them", async () => {
      const asyncStorageError = new Error("AsyncStorage quota exceeded");
      mockAsyncStorage.getItem.mockRejectedValue(asyncStorageError);

      await expect(StorageService.loadChats()).rejects.toThrow(
        "AsyncStorage quota exceeded",
      );
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
});
