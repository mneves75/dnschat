import type * as SecureStore from "expo-secure-store";
import type AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: "whenUnlockedThisDeviceOnly",
}));

const launch = () => {
  jest.resetModules();
  const secureStore = require("expo-secure-store") as jest.Mocked<
    typeof SecureStore
  >;
  secureStore.getItemAsync.mockResolvedValue(null);
  const storage =
    require("@react-native-async-storage/async-storage") as jest.Mocked<
      typeof AsyncStorage
    >;
  const values = new Map<string, string>();
  storage.getItem.mockImplementation(async (key) => values.get(key) ?? null);
  storage.setItem.mockImplementation(async (key, value) => {
    values.set(key, value);
  });
  storage.removeItem.mockImplementation(async (key) => {
    values.delete(key);
  });
  const encryption =
    require("../src/services/encryptionService") as typeof import("../src/services/encryptionService");
  return { secureStore, storage, values, encryption };
};

// A valid envelope encrypted under a key absent from this launch. The precise
// ciphertext is irrelevant: failure must occur before trying authentication.
const existingPayload = `enc:v1:${"ab".repeat(12)}:${"cd".repeat(16)}`;

describe("missing encryption key preserves existing history", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does not create a key while decrypting an existing envelope", async () => {
    const { secureStore, encryption } = launch();

    await expect(
      encryption.decryptString(existingPayload),
    ).rejects.toBeInstanceOf(encryption.EncryptionKeyUnavailableError);
    expect(secureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it.each(["@chat_dns_chats", "@dns_query_logs"])(
    "refuses new encryption when %s still needs the missing key",
    async (key) => {
      const { secureStore, values, encryption } = launch();
      values.set(key, existingPayload);

      await expect(
        encryption.encryptString("new content"),
      ).rejects.toBeInstanceOf(encryption.EncryptionKeyUnavailableError);
      expect(secureStore.setItemAsync).not.toHaveBeenCalled();
      expect(values.get(key)).toBe(existingPayload);
    },
  );

  it.each(["@chat_dns_chats_backup", "@dns_query_logs_backup"])(
    "preserves key ownership when only %s remains",
    async (key) => {
      const { secureStore, values, encryption } = launch();
      values.set(key, JSON.stringify({ payload: existingPayload }));

      await expect(
        encryption.encryptString("new content"),
      ).rejects.toBeInstanceOf(encryption.EncryptionKeyUnavailableError);
      expect(secureStore.setItemAsync).not.toHaveBeenCalled();
    },
  );

  it("preserves chat ciphertext without quarantining it on repeated loads", async () => {
    const { secureStore, storage, values, encryption } = launch();
    values.set("@chat_dns_chats", existingPayload);
    const { StorageService } =
      require("../src/services/storageService") as typeof import("../src/services/storageService");

    for (let attempt = 0; attempt < 2; attempt++) {
      await expect(StorageService.loadChats()).rejects.toBeInstanceOf(
        encryption.EncryptionKeyUnavailableError,
      );
    }
    expect(values.get("@chat_dns_chats")).toBe(existingPayload);
    expect(storage.removeItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(secureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("preserves both a malformed encrypted envelope and its earlier backup when the key is missing", async () => {
    const { secureStore, storage, values, encryption } = launch();
    values.set("@chat_dns_chats", "enc:v1:truncated");
    values.set("@chat_dns_chats_backup", "previous encrypted backup");
    const { StorageService } =
      require("../src/services/storageService") as typeof import("../src/services/storageService");
    await expect(StorageService.loadChats()).rejects.toBeInstanceOf(
      encryption.EncryptionKeyUnavailableError,
    );
    expect(values.get("@chat_dns_chats")).toBe("enc:v1:truncated");
    expect(values.get("@chat_dns_chats_backup")).toBe(
      "previous encrypted backup",
    );
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
    expect(secureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("preserves DNS logs when initialization cannot find their key", async () => {
    const { secureStore, storage, values, encryption } = launch();
    values.set("@dns_query_logs", existingPayload);
    const { DNSLogService } =
      require("../src/services/dnsLogService") as typeof import("../src/services/dnsLogService");

    const initialization = DNSLogService.initialize();
    await initialization.catch(() => undefined);
    DNSLogService.stopCleanupScheduler();
    await expect(initialization).rejects.toBeInstanceOf(
      encryption.EncryptionKeyUnavailableError,
    );
    expect(values.get("@dns_query_logs")).toBe(existingPayload);
    expect(storage.removeItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(secureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("fails closed when existing storage cannot be checked", async () => {
    const { secureStore, storage, encryption } = launch();
    storage.getItem.mockRejectedValue(new Error("storage unavailable"));

    await expect(
      encryption.encryptString("new content"),
    ).rejects.toBeInstanceOf(encryption.EncryptionKeyUnavailableError);
    expect(secureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("still generates a key for a new install and round-trips", async () => {
    const { secureStore, encryption } = launch();
    const encrypted = await encryption.encryptString("new history");

    await expect(encryption.decryptString(encrypted)).resolves.toBe(
      "new history",
    );
    expect(secureStore.setItemAsync).toHaveBeenCalledWith(
      "dnschat.encryption_key",
      expect.any(String),
      { keychainAccessible: "whenUnlockedThisDeviceOnly" },
    );
  });
});
