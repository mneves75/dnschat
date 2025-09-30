import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageService } from "../src/services/storageService";
import { Chat } from "../src/types/chat";
import { EncryptionService } from "../src/utils/encryption";

jest.mock("../src/utils/encryption", () => {
  const keys = new Set<string>();
  const payloads = new Map<string, string>();

  const api = {
    isConversationEncrypted: jest.fn(async (id: string) => keys.has(id)),
    generateConversationKey: jest.fn(async (id: string) => {
      keys.add(id);
      return id;
    }),
    encryptConversation: jest.fn(async (data: string, id: string) => {
      if (!keys.has(id)) {
        throw new Error(`Missing key for ${id}`);
      }
      payloads.set(id, data);
      return `encrypted::${id}`;
    }),
    decryptConversation: jest.fn(async (_encrypted: string, id: string) => {
      if (!keys.has(id)) {
        throw new Error(`No encryption key found for conversation ${id}`);
      }
      const payload = payloads.get(id);
      if (!payload) {
        throw new Error(`No payload stored for conversation ${id}`);
      }
      return payload;
    }),
    deleteConversationKey: jest.fn(async (id: string) => {
      keys.delete(id);
      payloads.delete(id);
    }),
    rotateMasterPassword: jest.fn(),
  };

  return {
    EncryptionService: Object.assign(api, {
      __testing: {
        reset() {
          keys.clear();
          payloads.clear();
          api.isConversationEncrypted.mockClear();
          api.generateConversationKey.mockClear();
          api.encryptConversation.mockClear();
          api.decryptConversation.mockClear();
          api.deleteConversationKey.mockClear();
        },
        removeKey(id: string) {
          keys.delete(id);
          payloads.delete(id);
        },
        hasKey(id: string) {
          return keys.has(id);
        },
        getPayload(id: string) {
          return payloads.get(id);
        },
      },
    }),
  };
});

const CHATS_KEY = "@chat_dns_chats";
const BACKUP_KEY = "@chat_dns_chats_backup";

const encryptionTesting = (EncryptionService as any).__testing;

const buildLegacyChat = () => {
  const now = new Date();
  return {
    id: "chat-legacy",
    title: "Legacy",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    messages: [
      {
        id: "msg-1",
        role: "user" as const,
        content: "hello legacy",
        status: "sent" as const,
        timestamp: now.toISOString(),
      },
    ],
  };
};

const buildChat = (): Chat => ({
  id: "chat-modern",
  title: "Modern",
  createdAt: new Date(),
  updatedAt: new Date(),
  messages: [
    {
      id: "msg-modern",
      role: "assistant",
      content: "hi",
      status: "sent",
      timestamp: new Date(),
    },
  ],
});

describe("StorageService encryption migration", () => {
  beforeEach(async () => {
    encryptionTesting.reset();
    await AsyncStorage.clear();
  });

  it("migrates legacy plaintext chats, encrypts, and preserves messages", async () => {
    const legacyChats = [buildLegacyChat()];
    await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(legacyChats));

    const chats = await StorageService.loadChats();

    expect(chats).toHaveLength(1);
    expect(chats[0].messages).toHaveLength(1);
    expect(chats[0].messages[0].content).toBe("hello legacy");

    const persisted = JSON.parse(
      (await AsyncStorage.getItem(CHATS_KEY)) ?? "[]",
    ) as Array<Record<string, unknown>>;
    expect(persisted[0]).toHaveProperty("encryptedData", "encrypted::chat-legacy");
    expect(encryptionTesting.hasKey("chat-legacy")).toBe(true);

    // SECURITY FIX: Backup is now encrypted, not plaintext
    // Verify backup exists but don't parse it (it's encrypted)
    const encryptedBackup = await AsyncStorage.getItem(BACKUP_KEY);
    expect(encryptedBackup).toBeTruthy();
    // Backup should start with encrypted format (not plain JSON)
    expect(encryptedBackup).toMatch(/^encrypted::/);
  });

  it("loads encrypted chats without triggering migration", async () => {
    const chat = buildChat();
    await StorageService.saveChats([chat]);

    const setItemMock = AsyncStorage.setItem as jest.Mock;
    const encryptMock = (EncryptionService as any).encryptConversation as jest.Mock;
    setItemMock.mockClear();
    encryptMock.mockClear();

    const loaded = await StorageService.loadChats();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe("Modern");
    expect(setItemMock).not.toHaveBeenCalled();
    expect(encryptMock).not.toHaveBeenCalled();
  });

  it("recovers from missing encryption key using backup snapshot", async () => {
    const chat = buildChat();
    await StorageService.saveChats([chat]);

    encryptionTesting.removeKey("chat-modern");

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const setItemMock = AsyncStorage.setItem as jest.Mock;
    const generateKeyMock = (EncryptionService as any)
      .generateConversationKey as jest.Mock;
    setItemMock.mockClear();
    generateKeyMock.mockClear();

    const recovered = await StorageService.loadChats();

    expect(recovered).toHaveLength(1);
    expect(recovered[0].messages[0].content).toBe("hi");
    expect(warnSpy).toHaveBeenCalledWith(
      "⚠️ Failed to decrypt chats, attempting migration for:",
      ["chat-modern"],
    );

    expect(generateKeyMock).toHaveBeenCalledWith("chat-modern");
    expect(setItemMock).toHaveBeenCalled();
    expect(encryptionTesting.hasKey("chat-modern")).toBe(true);

    warnSpy.mockRestore();
  });
});
