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
  storeLoaded: boolean;
  pendingPurgedChatIds: Set<string>;
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
    dnsLogServiceInternals.storeLoaded = false;
    dnsLogServiceInternals.pendingPurgedChatIds = new Set();
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
      expect.stringContaining("redacted len:"),
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
    expect(exposed).toContain("redacted len:");
    expect(migratedPlaintext).toContain("redacted len:");
    expect(migratedPlaintext).not.toContain("sha256:");
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

  describe("stored history before initialization completes", () => {
    const storedHistory = JSON.stringify([
      {
        id: "stored-log",
        query: "redacted len:3",
        startTime: "2026-09-10T12:00:00.000Z",
        finalStatus: "success",
        finalMethod: "native",
        entries: [],
      },
    ]);
    // An earlier test leaves encryptString prefixing its input.
    const lastPrimaryWrite = (): string | undefined =>
      mockAsyncStorage.setItem.mock.calls
        .filter(([key]) => key === STORAGE_CONSTANTS.LOGS_KEY)
        .at(-1)?.[1]
        ?.replace(/^enc:v1:/, "");

    it("does not replace stored logs after a failed initialization", async () => {
      const { EncryptionKeyUnavailableError } = jest.requireMock(
        "../src/services/encryptionService",
      );
      mockAsyncStorage.getItem.mockResolvedValue("enc:v1:history");
      decryptIfEncrypted.mockRejectedValue(
        new EncryptionKeyUnavailableError("keychain locked"),
      );
      await expect(DNSLogService.initialize()).rejects.toBeInstanceOf(
        EncryptionKeyUnavailableError,
      );

      const queryId = DNSLogService.startQuery("hello");
      await DNSLogService.endQuery(queryId, true, "response", "native");
      await dnsLogServiceInternals.persistenceQueue;

      // The key is still unavailable: nothing may be written over the history.
      expect(lastPrimaryWrite()).toBeUndefined();
      expect(DNSLogService.getLogs().map((log) => log.id)).toEqual([queryId]);

      // Once the key is back, the next write reads the history and keeps it.
      decryptIfEncrypted.mockResolvedValue(storedHistory);
      await DNSLogService.recordSettingsEvent("key recovered");
      const persisted = JSON.parse(lastPrimaryWrite() ?? "[]") as Array<{
        id: string;
      }>;
      expect(persisted.map((log) => log.id)).toEqual(
        expect.arrayContaining([queryId, "stored-log"]),
      );
    });

    it("keeps a chat deletion made while stored logs were unavailable", async () => {
      // Autoreview P2: the purge must survive the later merge with storage.
      const { EncryptionKeyUnavailableError } = jest.requireMock(
        "../src/services/encryptionService",
      );
      const historyWithChat = JSON.stringify([
        ...(JSON.parse(storedHistory) as unknown[]),
        {
          id: "deleted-chat-log",
          chatId: "chat-gone",
          query: "redacted len:4",
          startTime: "2026-09-11T12:00:00.000Z",
          finalStatus: "success",
          finalMethod: "native",
          entries: [],
        },
      ]);
      mockAsyncStorage.getItem.mockResolvedValue("enc:v1:history");
      decryptIfEncrypted.mockRejectedValue(
        new EncryptionKeyUnavailableError("keychain locked"),
      );
      await expect(DNSLogService.initialize()).rejects.toBeInstanceOf(
        EncryptionKeyUnavailableError,
      );

      await DNSLogService.purgeChat("chat-gone");
      expect(lastPrimaryWrite()).toBeUndefined();

      decryptIfEncrypted.mockResolvedValue(historyWithChat);
      await DNSLogService.recordSettingsEvent("key recovered");

      const ids = DNSLogService.getLogs().map((log) => log.id);
      expect(ids).toContain("stored-log");
      expect(ids).not.toContain("deleted-chat-log");
      expect(lastPrimaryWrite()).not.toContain("chat-gone");
    });

    it("keeps the store in place when the one-time digest rewrite cannot be written", async () => {
      // A transient write failure is not corruption: nothing may be moved to
      // the backup or removed, and the next launch retries the rewrite.
      const digest = "a".repeat(64);
      const withDigest = JSON.stringify([
        {
          id: "old-log",
          query: `sha256:${digest} len:3`,
          startTime: "2026-09-10T12:00:00.000Z",
          finalStatus: "success",
          entries: [],
        },
      ]);
      mockAsyncStorage.getItem.mockResolvedValue("enc:v1:history");
      decryptIfEncrypted.mockResolvedValue(withDigest);
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error("disk full"));

      await DNSLogService.initialize();

      expect(mockAsyncStorage.setItem).not.toHaveBeenCalledWith(
        STORAGE_CONSTANTS.LOGS_BACKUP_KEY,
        expect.anything(),
      );
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalled();
      expect(JSON.stringify(DNSLogService.getLogs())).not.toContain("sha256:");
    });

    it("drops log records of chats that no longer exist, keeping unattached records", async () => {
      // Reconciling against the loaded chat list also finishes a deletion made
      // while the log store could not be read in an earlier session.
      const history = JSON.stringify([
        {
          id: "kept-chat-log",
          chatId: "chat-kept",
          query: "redacted len:3",
          startTime: "2026-09-12T12:00:00.000Z",
          finalStatus: "success",
          entries: [],
        },
        {
          id: "deleted-chat-log",
          chatId: "chat-gone",
          query: "redacted len:4",
          startTime: "2026-09-11T12:00:00.000Z",
          finalStatus: "success",
          entries: [],
        },
        {
          id: "settings-log",
          query: "[settings] Mock DNS enabled",
          startTime: "2026-09-10T12:00:00.000Z",
          finalStatus: "success",
          entries: [],
        },
      ]);
      mockAsyncStorage.getItem.mockResolvedValue("enc:v1:history");
      decryptIfEncrypted.mockResolvedValue(history);
      await DNSLogService.initialize();

      await DNSLogService.retainChats(new Set(["chat-kept"]));

      expect(DNSLogService.getLogs().map((log) => log.id)).toEqual([
        "kept-chat-log",
        "settings-log",
      ]);
      expect(lastPrimaryWrite()).not.toContain("chat-gone");
    });

    it("drops a query still in flight for a chat that no longer exists", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await DNSLogService.initialize();
      const inFlight = DNSLogService.startQuery("gone", {
        chatId: "chat-gone",
      });

      await DNSLogService.retainChats(new Set());
      await DNSLogService.endQuery(inFlight, true, "late", "native");
      await dnsLogServiceInternals.persistenceQueue;

      expect(DNSLogService.getLogs()).toEqual([]);
      expect(lastPrimaryWrite() ?? "").not.toContain("chat-gone");
    });

    it("keeps a query that finished while the initial read was in flight", async () => {
      let releaseRead: (value: string) => void = () => {};
      mockAsyncStorage.getItem.mockImplementationOnce(
        () =>
          new Promise<string>((resolve) => {
            releaseRead = resolve;
          }),
      );
      decryptIfEncrypted.mockResolvedValue(storedHistory);

      const initialization = DNSLogService.initialize();
      const queryId = DNSLogService.startQuery("hello");
      await DNSLogService.endQuery(queryId, true, "response", "native");
      releaseRead("enc:v1:history");
      await initialization;
      await dnsLogServiceInternals.persistenceQueue;

      expect(DNSLogService.getLogs().map((log) => log.id)).toEqual([
        queryId,
        "stored-log",
      ]);
      const persisted = JSON.parse(lastPrimaryWrite() ?? "[]") as Array<{
        id: string;
      }>;
      expect(persisted.map((log) => log.id)).toEqual([queryId, "stored-log"]);
    });
  });

  it("stores content as length only and strips digests from older logs", async () => {
    const digest = "a".repeat(64);
    mockAsyncStorage.getItem.mockResolvedValue("enc:v1:history");
    decryptIfEncrypted.mockResolvedValue(
      JSON.stringify([
        {
          id: "old-log",
          chatTitle: `sha256:${digest} len:5`,
          query: `sha256:${digest} len:3`,
          response: `sha256:${digest} len:8`,
          startTime: "2026-09-10T12:00:00.000Z",
          finalStatus: "success",
          entries: [
            {
              id: "old-entry",
              timestamp: "2026-09-10T12:00:00.000Z",
              message: "Starting DNS query",
              method: "native",
              status: "attempt",
              details: `query=sha256:${digest} len:3`,
            },
          ],
        },
      ]),
    );

    await DNSLogService.initialize();
    const queryId = DNSLogService.startQuery("secret prompt");
    await DNSLogService.endQuery(queryId, true, "secret response", "native");
    await dnsLogServiceInternals.persistenceQueue;

    const persisted = String(
      mockAsyncStorage.setItem.mock.calls
        .filter(([key]) => key === STORAGE_CONSTANTS.LOGS_KEY)
        .at(-1)?.[1],
    );
    expect(persisted).not.toContain("sha256:");
    expect(persisted).toContain("query=redacted len:3");
    expect(persisted).toContain('"query":"redacted len:13"');
  });

  it("purges every log record of a deleted chat, including an in-flight query", async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    await DNSLogService.initialize();
    const kept = DNSLogService.startQuery("keep", { chatId: "chat-keep" });
    await DNSLogService.endQuery(kept, true, "ok", "native");
    const done = DNSLogService.startQuery("gone", { chatId: "chat-gone" });
    await DNSLogService.endQuery(done, true, "ok", "native");
    const inFlight = DNSLogService.startQuery("gone again", {
      chatId: "chat-gone",
    });

    await DNSLogService.purgeChat("chat-gone");
    await DNSLogService.endQuery(inFlight, true, "late", "native");
    await dnsLogServiceInternals.persistenceQueue;

    expect(DNSLogService.getLogs().map((log) => log.id)).toEqual([kept]);
    const persisted = String(
      mockAsyncStorage.setItem.mock.calls
        .filter(([key]) => key === STORAGE_CONSTANTS.LOGS_KEY)
        .at(-1)?.[1],
    );
    expect(persisted).not.toContain("chat-gone");
  });
});
