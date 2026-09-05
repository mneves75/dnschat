import AsyncStorage from "@react-native-async-storage/async-storage";
import { DNSLogService } from "../src/services/dnsLogService";
import { STORAGE_CONSTANTS } from "../src/constants/appConstants";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../src/services/encryptionService", () => {
  class EncryptionKeyCorruptionError extends Error {
    readonly code = "ENCRYPTION_KEY_CORRUPTION";
  }
  class EncryptionKeyUnavailableError extends Error {
    readonly code = "ENCRYPTION_KEY_UNAVAILABLE";
  }

  return {
    EncryptionKeyCorruptionError,
    EncryptionKeyUnavailableError,
    decryptIfEncrypted: jest.fn(),
    encryptString: jest.fn(async (payload: string) => payload),
    isEncryptedPayload: jest.fn((payload: string) =>
      payload.startsWith("enc:v1:"),
    ),
  };
});

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const { decryptIfEncrypted } = jest.requireMock(
  "../src/services/encryptionService",
);
const dnsLogServiceInternals = DNSLogService as unknown as {
  currentQueryLog: unknown;
  activeQueryLogs: Map<string, unknown>;
  queryLogs: unknown[];
  initialized: boolean;
  initializationInFlight: Promise<void> | null;
  persistenceQueue: Promise<void>;
};

describe("DNSLogService recovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dnsLogServiceInternals.currentQueryLog = null;
    dnsLogServiceInternals.activeQueryLogs = new Map();
    dnsLogServiceInternals.queryLogs = [];
    dnsLogServiceInternals.initialized = false;
    dnsLogServiceInternals.initializationInFlight = null;
    dnsLogServiceInternals.persistenceQueue = Promise.resolve();
  });

  afterEach(() => {
    DNSLogService.stopCleanupScheduler();
  });

  it("backs up and clears logs on decrypt error", async () => {
    mockAsyncStorage.getItem.mockResolvedValue("enc:v1:deadbeef:c0ffee");
    decryptIfEncrypted.mockRejectedValue(new Error("invalid ghash tag"));

    await DNSLogService.initialize();

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_CONSTANTS.LOGS_BACKUP_KEY,
      expect.stringContaining("sha256:"),
    );
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
      STORAGE_CONSTANTS.LOGS_KEY,
    );
    expect(DNSLogService.getLogs()).toEqual([]);
  });

  it("encrypts corrupted legacy plaintext logs before writing a backup", async () => {
    mockAsyncStorage.getItem.mockResolvedValue("{not json");
    decryptIfEncrypted.mockResolvedValue("{not json");
    const { encryptString } = jest.requireMock(
      "../src/services/encryptionService",
    );
    encryptString.mockImplementation(
      async (payload: string) => `enc:v1:${payload.length}`,
    );

    await DNSLogService.initialize();

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_CONSTANTS.LOGS_BACKUP_KEY,
      expect.not.stringContaining("{not json"),
    );
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_CONSTANTS.LOGS_BACKUP_KEY,
      expect.stringContaining("enc:v1:"),
    );
  });

  it.each([false, true])(
    "does not expose parser excerpts in backup metadata (encrypted: %s)",
    async (encrypted) => {
      const sensitivePayload = "SENSITIVE not JSON";
      let parserError: Error | undefined;
      try {
        JSON.parse(sensitivePayload);
      } catch (error) {
        parserError = error as Error;
      }
      expect(parserError?.message).toContain("SENSITIVE");
      mockAsyncStorage.getItem.mockResolvedValue(
        encrypted ? "enc:v1:protected" : sensitivePayload,
      );
      decryptIfEncrypted.mockResolvedValue(sensitivePayload);
      const { encryptString } = jest.requireMock(
        "../src/services/encryptionService",
      );
      encryptString.mockResolvedValue("enc:v1:protected");

      await DNSLogService.initialize();

      const backup = mockAsyncStorage.setItem.mock.calls.find(
        ([key]) => key === STORAGE_CONSTANTS.LOGS_BACKUP_KEY,
      );
      expect(backup).toBeDefined();
      expect(backup?.[1]).not.toContain("SENSITIVE");
      expect(JSON.parse(String(backup?.[1])).payload).toBe("enc:v1:protected");
    },
  );

  it("redacts every sensitive legacy field before exposing or persisting migrated logs", async () => {
    const legacyPayload = JSON.stringify([
      {
        id: "legacy-log",
        chatId: "chat-1",
        chatTitle: "raw legacy title",
        query: "raw legacy prompt",
        response: "raw legacy response",
        startTime: "2026-08-30T12:00:00.000Z",
        endTime: "2026-08-30T12:00:01.000Z",
        totalDuration: 1000,
        finalStatus: "failure",
        finalMethod: "udp",
        entries: [
          {
            id: "legacy-entry",
            timestamp: "2026-08-30T12:00:00.500Z",
            message: "UDP query failed",
            method: "udp",
            status: "failure",
            details: "raw legacy detail",
            error: "raw legacy error",
            duration: 500,
          },
        ],
      },
    ]);
    mockAsyncStorage.getItem.mockResolvedValue(legacyPayload);
    decryptIfEncrypted.mockResolvedValue(legacyPayload);
    const { encryptString } = jest.requireMock(
      "../src/services/encryptionService",
    );
    encryptString.mockImplementation(
      async (payload: string) => `enc:v1:${payload}`,
    );

    await DNSLogService.initialize();

    const exposed = JSON.stringify(DNSLogService.getLogs());
    const migratedPlaintext = String(encryptString.mock.calls.at(-1)?.[0]);
    for (const rawValue of [
      "raw legacy prompt",
      "raw legacy response",
      "raw legacy title",
      "raw legacy detail",
      "raw legacy error",
    ]) {
      expect(exposed).not.toContain(rawValue);
      expect(migratedPlaintext).not.toContain(rawValue);
    }
    expect(exposed).toContain("sha256:");
    expect(migratedPlaintext).toContain("sha256:");
  });

  it("backs up an invalid top-level shape before removing primary logs", async () => {
    const encryptedPayload = "enc:v1:invalid-shape";
    mockAsyncStorage.getItem.mockResolvedValue(encryptedPayload);
    decryptIfEncrypted.mockResolvedValue('{"logs":[]}');
    let finishBackup: (() => void) | undefined;
    const backupStarted = new Promise<void>((resolve) => {
      mockAsyncStorage.setItem.mockImplementationOnce(
        async () =>
          await new Promise<void>((backupResolve) => {
            finishBackup = backupResolve;
            resolve();
          }),
      );
    });

    const initialization = DNSLogService.initialize();
    await backupStarted;
    expect(mockAsyncStorage.removeItem).not.toHaveBeenCalled();

    finishBackup?.();
    await initialization;

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_CONSTANTS.LOGS_BACKUP_KEY,
      expect.stringContaining(encryptedPayload),
    );
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
      STORAGE_CONSTANTS.LOGS_KEY,
    );
  });

  it("preserves primary logs when quarantining an invalid entry cannot be backed up", async () => {
    const encryptedPayload = "enc:v1:invalid-entry";
    mockAsyncStorage.getItem.mockResolvedValue(encryptedPayload);
    decryptIfEncrypted.mockResolvedValue(
      JSON.stringify([
        {
          id: "bad-log",
          query: "sha256:abc len:3",
          startTime: "2026-08-30T12:00:00.000Z",
          finalStatus: "success",
          entries: [{ id: "bad-entry", timestamp: "not-a-date" }],
        },
      ]),
    );
    mockAsyncStorage.setItem.mockRejectedValueOnce(new Error("backup failed"));

    await expect(DNSLogService.initialize()).rejects.toThrow("backup failed");

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_CONSTANTS.LOGS_BACKUP_KEY,
      expect.any(String),
    );
    expect(mockAsyncStorage.removeItem).not.toHaveBeenCalledWith(
      STORAGE_CONSTANTS.LOGS_KEY,
    );
  });

  it("preserves encrypted logs and surfaces encryption key corruption", async () => {
    const encryptedPayload = "enc:v1:deadbeef:c0ffee";
    mockAsyncStorage.getItem.mockResolvedValue(encryptedPayload);
    const { EncryptionKeyCorruptionError } = jest.requireMock(
      "../src/services/encryptionService",
    );
    decryptIfEncrypted.mockRejectedValue(
      new EncryptionKeyCorruptionError("Stored encryption key is malformed"),
    );

    await expect(DNSLogService.initialize()).rejects.toBeInstanceOf(
      EncryptionKeyCorruptionError,
    );

    expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    expect(mockAsyncStorage.removeItem).not.toHaveBeenCalled();
  });

  it("preserves encrypted logs when SecureStore is temporarily unavailable", async () => {
    const encryptedPayload = "enc:v1:deadbeef:c0ffee";
    mockAsyncStorage.getItem.mockResolvedValue(encryptedPayload);
    const { EncryptionKeyUnavailableError } = jest.requireMock(
      "../src/services/encryptionService",
    );
    decryptIfEncrypted.mockRejectedValue(
      new EncryptionKeyUnavailableError("SecureStore read failed"),
    );

    await expect(DNSLogService.initialize()).rejects.toBeInstanceOf(
      EncryptionKeyUnavailableError,
    );

    expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    expect(mockAsyncStorage.removeItem).not.toHaveBeenCalled();
    expect(await mockAsyncStorage.getItem(STORAGE_CONSTANTS.LOGS_KEY)).toBe(
      encryptedPayload,
    );
  });

  it("retries initialization after a transient AsyncStorage read failure", async () => {
    mockAsyncStorage.getItem
      .mockRejectedValueOnce(new Error("storage unavailable"))
      .mockResolvedValueOnce(null);

    await expect(DNSLogService.initialize()).rejects.toThrow(
      "storage unavailable",
    );
    expect(dnsLogServiceInternals.initialized).toBe(false);

    await expect(DNSLogService.initialize()).resolves.toBeUndefined();
    expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(2);
    expect(dnsLogServiceInternals.initialized).toBe(true);
  });

  it("removes primary logs and corrupted log backups when clearing logs", async () => {
    await DNSLogService.clearLogs();

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
      STORAGE_CONSTANTS.LOGS_KEY,
    );
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
      STORAGE_CONSTANTS.LOGS_BACKUP_KEY,
    );
  });

  it("propagates clear failures so the UI does not report a false deletion", async () => {
    dnsLogServiceInternals.queryLogs = [
      {
        id: "log-1",
        query: "sha256:abc len:3",
        startTime: new Date(),
        finalStatus: "success",
        entries: [],
      },
    ];
    mockAsyncStorage.removeItem.mockRejectedValueOnce(
      new Error("remove failed"),
    );

    await expect(DNSLogService.clearLogs()).rejects.toThrow("remove failed");
    expect(DNSLogService.getLogs()).toHaveLength(1);
  });

  it("keeps successful query logging best-effort when persistence fails", async () => {
    mockAsyncStorage.setItem.mockRejectedValueOnce(new Error("quota exceeded"));

    const queryId = DNSLogService.startQuery("hello");
    await expect(
      DNSLogService.endQuery(queryId, true, "response", "native"),
    ).resolves.toBeUndefined();

    const logs = DNSLogService.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]?.finalStatus).toBe("success");
  });
});
