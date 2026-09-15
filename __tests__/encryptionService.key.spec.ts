import * as SecureStore from "expo-secure-store";
import { ENCRYPTION_CONSTANTS } from "../src/constants/appConstants";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: "whenUnlockedThisDeviceOnly",
}));

jest.mock("expo-crypto", () => ({
  getRandomBytesAsync: jest.fn(async (size: number) =>
    new Uint8Array(size).fill(7),
  ),
  getRandomValues: jest.fn((arr: Uint8Array) => arr.fill(9)),
}));

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

describe("encryptionService key handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.dontMock("react-native");
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });

  it("encrypts with AES-GCM, round-trips, and rejects tampered ciphertext", async () => {
    jest.resetModules();
    const { encryptString, decryptString, EncryptionPayloadCorruptionError } =
      require("../src/services/encryptionService") as typeof import("../src/services/encryptionService");
    // No stored key yet, so this exercises the real generate-persist-encrypt
    // path. The service has no test-only key or nonce branch: this is the same
    // code a release build runs.
    const mockSecureStore = require("expo-secure-store") as jest.Mocked<
      typeof SecureStore
    >;
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    const plaintext = "known plaintext for AES-GCM authentication";
    const encrypted = await encryptString(plaintext);
    const [prefix, version, nonceHex, cipherHex] = encrypted.split(":");
    const ciphertext = Buffer.from(cipherHex!, "hex");

    expect(ciphertext.subarray(0, Buffer.byteLength(plaintext))).not.toEqual(
      Buffer.from(plaintext),
    );
    expect(ciphertext).toHaveLength(Buffer.byteLength(plaintext) + 16);
    await expect(decryptString(encrypted)).resolves.toBe(plaintext);

    ciphertext[0] = ciphertext[0]! ^ 1;
    await expect(
      decryptString(
        `${prefix}:${version}:${nonceHex}:${ciphertext.toString("hex")}`,
      ),
    ).rejects.toBeInstanceOf(EncryptionPayloadCorruptionError);
  });

  it("uses a fresh nonce for every payload encrypted under one key", async () => {
    // The behavioral half of removing the shipped test-runtime branches: that
    // code returned a constant nonce, and AES-GCM nonce reuse under one key
    // leaks the authentication key rather than just plaintext. Real randomness
    // is mocked away here, so drive the nonce source directly and assert the
    // envelopes differ rather than trusting the mock.
    jest.resetModules();
    const { encryptString } =
      require("../src/services/encryptionService") as typeof import("../src/services/encryptionService");
    const mockSecureStore = require("expo-secure-store") as jest.Mocked<
      typeof SecureStore
    >;
    mockSecureStore.getItemAsync.mockResolvedValue(null);

    let counter = 0;
    const cryptoModule = require("expo-crypto") as {
      getRandomValues: jest.Mock;
    };
    cryptoModule.getRandomValues.mockImplementation((arr: Uint8Array) => {
      counter += 1;
      return arr.fill(counter);
    });

    const nonceOf = (payload: string) => payload.split(":")[2];
    const first = await encryptString("same plaintext");
    const second = await encryptString("same plaintext");

    expect(nonceOf(first)).not.toBe(nonceOf(second));
    expect(first).not.toBe(second);
  });

  it("persists generated key using a valid SecureStore key name", async () => {
    jest.resetModules();
    const { encryptString } = require("../src/services/encryptionService");
    const SecureStoreModule =
      require("expo-secure-store") as typeof SecureStore;
    const mockSecureStore = SecureStoreModule as jest.Mocked<
      typeof SecureStore
    >;
    mockSecureStore.getItemAsync.mockResolvedValue(null);

    await encryptString("hello");

    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
      "dnschat.encryption_key",
      expect.any(String),
      { keychainAccessible: "whenUnlockedThisDeviceOnly" },
    );
  });

  describe("device-only key protection", () => {
    // Keys written before 4.3.6 used the library default accessibility
    // (WHEN_UNLOCKED), which a backup restores onto another device, and
    // expo-secure-store's duplicate-item path only replaces the value. The key
    // is re-added under its own name as THIS_DEVICE_ONLY, staged through a
    // verified copy, so older builds (which read only that name) keep working
    // and no step leaves the key nowhere.
    const KEY = "dnschat.encryption_key";
    const STAGED = "dnschat.encryption_key.v2";
    const MARKER = "dnschat.encryption_key.protection";
    const DEVICE_ONLY = "whenUnlockedThisDeviceOnly";
    const keyHex = "ab".repeat(ENCRYPTION_CONSTANTS.KEY_LENGTH);
    const otherHex = "cd".repeat(ENCRYPTION_CONSTANTS.KEY_LENGTH);

    type Entry = { value: string; accessible: string | undefined };

    const launch = (store: Map<string, Entry>) => {
      jest.resetModules();
      const service =
        require("../src/services/encryptionService") as typeof import("../src/services/encryptionService");
      const secureStore = require("expo-secure-store") as jest.Mocked<
        typeof SecureStore
      >;
      secureStore.getItemAsync.mockImplementation(
        async (key: string) => store.get(key)?.value ?? null,
      );
      secureStore.setItemAsync.mockImplementation(
        async (key: string, value: string, options) => {
          // Like SecItemUpdate: an existing item keeps its accessibility.
          const existing = store.get(key);
          store.set(key, {
            value,
            accessible: existing
              ? existing.accessible
              : options?.keychainAccessible?.toString(),
          });
        },
      );
      secureStore.deleteItemAsync.mockImplementation(async (key: string) => {
        store.delete(key);
      });
      return { service, secureStore };
    };

    const legacyStore = () =>
      new Map<string, Entry>([[KEY, { value: keyHex, accessible: undefined }]]);

    const expectProtected = (store: Map<string, Entry>) => {
      expect(store.get(KEY)).toEqual({
        value: keyHex,
        accessible: DEVICE_ONLY,
      });
      expect(store.has(STAGED)).toBe(false);
      expect(store.get(MARKER)?.accessible).toBe(DEVICE_ONLY);
    };

    it("re-adds a legacy key under its own name as device-only, through a verified copy", async () => {
      const store = legacyStore();
      const { service } = launch(store);

      const encrypted = await service.encryptString("history");

      expectProtected(store);
      // An older build reading only the original name still decrypts history.
      const older = launch(store);
      await expect(older.service.decryptString(encrypted)).resolves.toBe(
        "history",
      );
    });

    it("does no keychain writes once protection is recorded", async () => {
      const store = legacyStore();
      await launch(store).service.encryptString("first");

      const { service, secureStore } = launch(store);
      await service.encryptString("second");

      expect(secureStore.setItemAsync).not.toHaveBeenCalled();
      expect(secureStore.deleteItemAsync).not.toHaveBeenCalled();
    });

    it.each([
      ["the staged copy write", 0, "set"],
      ["the legacy delete", 0, "delete"],
      ["the device-only re-add", 1, "set"],
      ["the marker write", 2, "set"],
      ["the staged copy cleanup", 1, "delete"],
    ] as const)(
      "keeps history readable and finishes on a later launch when %s fails",
      async (_step, callIndex, method) => {
        const store = legacyStore();
        const first = launch(store);
        const mock =
          method === "set"
            ? first.secureStore.setItemAsync
            : first.secureStore.deleteItemAsync;
        const real = mock.getMockImplementation()!;
        let calls = 0;
        mock.mockImplementation(async (...args: unknown[]) => {
          if (calls++ === callIndex) throw new Error("keychain busy");
          return (real as (...a: unknown[]) => Promise<void>)(...args);
        });

        const encrypted = await first.service.encryptString("history");

        const next = launch(store);
        await expect(next.service.decryptString(encrypted)).resolves.toBe(
          "history",
        );
        expectProtected(store);
      },
    );

    it("recovers the key from the staged copy when the app stopped after deleting the legacy entry", async () => {
      // Also the end state a 4.4.5 install leaves behind.
      const store = new Map<string, Entry>([
        [STAGED, { value: keyHex, accessible: DEVICE_ONLY }],
      ]);
      const { service } = launch(store);

      const encrypted = await service.encryptString("hello");

      expectProtected(store);
      await expect(
        launch(store).service.decryptString(encrypted),
      ).resolves.toBe("hello");
    });

    it("never overwrites either key when the staged copy and the legacy key differ", async () => {
      // A downgrade during an interrupted move can leave two different keys.
      // Choosing one could destroy the history encrypted under the other.
      const store = new Map<string, Entry>([
        [KEY, { value: keyHex, accessible: undefined }],
        [STAGED, { value: otherHex, accessible: DEVICE_ONLY }],
      ]);
      const { service, secureStore } = launch(store);

      await service.encryptString("hello");

      expect(store.get(KEY)?.value).toBe(keyHex);
      expect(store.get(STAGED)?.value).toBe(otherHex);
      expect(secureStore.deleteItemAsync).not.toHaveBeenCalled();
    });

    it("keeps the protected key when an older build ran after protection", async () => {
      // The older build reads and writes only the original name, which still
      // holds the same device-only key, so nothing needs to change.
      const store = legacyStore();
      await launch(store).service.encryptString("first");
      const snapshot = new Map(store);

      await launch(store).service.encryptString("again");

      expect(store).toEqual(snapshot);
    });

    it("generates a new install's key as device-only and records protection", async () => {
      const store = new Map<string, Entry>();
      const { service } = launch(store);

      await service.encryptString("hello");

      expect(store.get(KEY)?.accessible).toBe(DEVICE_ONLY);
      expect(store.get(MARKER)?.accessible).toBe(DEVICE_ONLY);
      expect(store.has(STAGED)).toBe(false);
    });
  });

  it("preserves an existing key with invalid length and surfaces typed corruption", async () => {
    jest.resetModules();
    const {
      EncryptionKeyCorruptionError,
      encryptString,
    } = require("../src/services/encryptionService");
    const SecureStoreModule =
      require("expo-secure-store") as typeof SecureStore;
    const mockSecureStore = SecureStoreModule as jest.Mocked<
      typeof SecureStore
    >;
    const badKey = new Uint8Array(ENCRYPTION_CONSTANTS.KEY_LENGTH - 1).fill(1);
    mockSecureStore.getItemAsync.mockResolvedValue(toHex(badKey));

    await expect(encryptString("hello")).rejects.toBeInstanceOf(
      EncryptionKeyCorruptionError,
    );

    expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(mockSecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it("preserves malformed stored key material and surfaces typed corruption", async () => {
    jest.resetModules();
    const {
      EncryptionKeyCorruptionError,
      encryptString,
    } = require("../src/services/encryptionService");
    const SecureStoreModule =
      require("expo-secure-store") as typeof SecureStore;
    const mockSecureStore = SecureStoreModule as jest.Mocked<
      typeof SecureStore
    >;
    mockSecureStore.getItemAsync.mockResolvedValue("not-hex-key-material");

    await expect(encryptString("hello")).rejects.toBeInstanceOf(
      EncryptionKeyCorruptionError,
    );

    expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(mockSecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it("rejects encrypted envelopes with extra fields as typed payload corruption", async () => {
    jest.resetModules();
    const {
      decryptString,
      EncryptionPayloadCorruptionError,
    } = require("../src/services/encryptionService");
    const nonceHex = "00".repeat(ENCRYPTION_CONSTANTS.IV_LENGTH);
    const cipherHex = "00".repeat(16);

    await expect(
      decryptString(`enc:v1:${nonceHex}:${cipherHex}:junk`),
    ).rejects.toBeInstanceOf(EncryptionPayloadCorruptionError);
  });

  it("rejects invalid nonce and too-short ciphertext lengths", async () => {
    jest.resetModules();
    const {
      decryptString,
      EncryptionPayloadCorruptionError,
    } = require("../src/services/encryptionService");
    const validNonceHex = "00".repeat(ENCRYPTION_CONSTANTS.IV_LENGTH);

    await expect(
      decryptString(
        `enc:v1:${"00".repeat(ENCRYPTION_CONSTANTS.IV_LENGTH - 1)}:${"00".repeat(16)}`,
      ),
    ).rejects.toBeInstanceOf(EncryptionPayloadCorruptionError);
    await expect(
      decryptString(`enc:v1:${validNonceHex}:0000`),
    ).rejects.toBeInstanceOf(EncryptionPayloadCorruptionError);
  });

  it("throws when a newly generated key cannot be persisted", async () => {
    jest.resetModules();
    const { encryptString } = require("../src/services/encryptionService");
    const SecureStoreModule =
      require("expo-secure-store") as typeof SecureStore;
    const mockSecureStore = SecureStoreModule as jest.Mocked<
      typeof SecureStore
    >;
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    mockSecureStore.setItemAsync.mockRejectedValue(
      new Error("SecureStore unavailable"),
    );

    await expect(encryptString("hello")).rejects.toThrow(
      "Encryption key could not be persisted",
    );
  });

  it("surfaces SecureStore read rejection as transient key unavailability", async () => {
    jest.resetModules();
    const {
      EncryptionKeyUnavailableError,
      encryptString,
    } = require("../src/services/encryptionService");
    const SecureStoreModule =
      require("expo-secure-store") as typeof SecureStore;
    const mockSecureStore = SecureStoreModule as jest.Mocked<
      typeof SecureStore
    >;
    mockSecureStore.getItemAsync.mockRejectedValue(
      new Error("SecureStore read failed"),
    );

    await expect(encryptString("hello")).rejects.toBeInstanceOf(
      EncryptionKeyUnavailableError,
    );
    expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(mockSecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it("uses web fallback storage instead of SecureStore when running on web", async () => {
    try {
      jest.resetModules();
      jest.doMock("react-native", () => ({
        Platform: { OS: "web" },
      }));
      const store = new Map<string, string>();
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: {
          getItem: jest.fn((key: string) => store.get(key) ?? null),
          setItem: jest.fn((key: string, value: string) => {
            store.set(key, value);
          }),
        },
      });

      const {
        encryptString,
        decryptIfEncrypted,
      } = require("../src/services/encryptionService");
      const SecureStoreModule =
        require("expo-secure-store") as typeof SecureStore;
      const mockSecureStore = SecureStoreModule as jest.Mocked<
        typeof SecureStore
      >;

      const encrypted = await encryptString("hello web encryption");
      await expect(decryptIfEncrypted(encrypted)).resolves.toBe(
        "hello web encryption",
      );

      expect(mockSecureStore.getItemAsync).not.toHaveBeenCalled();
      expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(
        "dnschat.encryption_key",
        expect.any(String),
      );
    } finally {
      jest.dontMock("react-native");
      delete (globalThis as { localStorage?: unknown }).localStorage;
    }
  });

  it("warns exactly once that web preview key storage is not a secure at-rest boundary", async () => {
    try {
      jest.resetModules();
      jest.doMock("react-native", () => ({
        Platform: { OS: "web" },
      }));
      const devWarn = jest.fn();
      jest.doMock("../src/utils/devLog", () => ({
        devWarn,
        devLog: jest.fn(),
      }));
      const store = new Map<string, string>();
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: {
          getItem: jest.fn((key: string) => store.get(key) ?? null),
          setItem: jest.fn((key: string, value: string) => {
            store.set(key, value);
          }),
        },
      });

      const { encryptString } = require("../src/services/encryptionService");

      await encryptString("first");
      await encryptString("second");

      const webWarnings = devWarn.mock.calls.filter(([message]) =>
        String(message).includes("not a secure at-rest boundary"),
      );
      expect(webWarnings).toHaveLength(1);
    } finally {
      jest.dontMock("../src/utils/devLog");
      jest.dontMock("react-native");
      delete (globalThis as { localStorage?: unknown }).localStorage;
    }
  });
});
