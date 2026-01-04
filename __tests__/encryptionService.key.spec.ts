import * as SecureStore from "expo-secure-store";
import { ENCRYPTION_CONSTANTS } from "../src/constants/appConstants";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock("expo-crypto", () => ({
  getRandomBytesAsync: jest.fn(async (size: number) => new Uint8Array(size).fill(7)),
  getRandomValues: jest.fn((arr: Uint8Array) => arr.fill(9)),
}));

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

describe("encryptionService key handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persists generated key using a valid SecureStore key name", async () => {
    const originalWorkerId = process.env["JEST_WORKER_ID"];
    delete process.env["JEST_WORKER_ID"];
    try {
      jest.resetModules();
      const { encryptString } = require("../src/services/encryptionService");
      const SecureStoreModule = require("expo-secure-store") as typeof SecureStore;
      const mockSecureStore = SecureStoreModule as jest.Mocked<typeof SecureStore>;
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      await encryptString("hello");

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        "dnschat.encryption_key",
        expect.any(String),
      );
    } finally {
      if (originalWorkerId !== undefined) {
        process.env["JEST_WORKER_ID"] = originalWorkerId;
      }
    }
  });

  it("regenerates when stored key length is invalid", async () => {
    const originalWorkerId = process.env["JEST_WORKER_ID"];
    delete process.env["JEST_WORKER_ID"];
    try {
      jest.resetModules();
      const { encryptString } = require("../src/services/encryptionService");
      const SecureStoreModule = require("expo-secure-store") as typeof SecureStore;
      const mockSecureStore = SecureStoreModule as jest.Mocked<typeof SecureStore>;
      const badKey = new Uint8Array(ENCRYPTION_CONSTANTS.KEY_LENGTH - 1).fill(1);
      mockSecureStore.getItemAsync.mockResolvedValue(toHex(badKey));

      await encryptString("hello");

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        "dnschat.encryption_key",
        expect.any(String),
      );
    } finally {
      if (originalWorkerId !== undefined) {
        process.env["JEST_WORKER_ID"] = originalWorkerId;
      }
    }
  });
});
