import AsyncStorage from "@react-native-async-storage/async-storage";
import { DNSLogService } from "../src/services/dnsLogService";
import { STORAGE_CONSTANTS } from "../src/constants/appConstants";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../src/services/encryptionService", () => ({
  decryptIfEncrypted: jest.fn(),
  encryptString: jest.fn(async (payload: string) => payload),
  isEncryptedPayload: jest.fn((payload: string) => payload.startsWith("enc:v1:")),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const { decryptIfEncrypted } = jest.requireMock("../src/services/encryptionService");
const dnsLogServiceInternals = DNSLogService as unknown as {
  currentQueryLog: unknown;
  activeQueryLogs: Map<string, unknown>;
  queryLogs: unknown[];
};

describe("DNSLogService recovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dnsLogServiceInternals.currentQueryLog = null;
    dnsLogServiceInternals.activeQueryLogs = new Map();
    dnsLogServiceInternals.queryLogs = [];
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
      expect.stringContaining("invalid ghash tag"),
    );
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
      STORAGE_CONSTANTS.LOGS_KEY,
    );
    expect(DNSLogService.getLogs()).toEqual([]);
  });

  it("encrypts corrupted legacy plaintext logs before writing a backup", async () => {
    mockAsyncStorage.getItem.mockResolvedValue("{not json");
    decryptIfEncrypted.mockResolvedValue("{not json");
    const { encryptString } = jest.requireMock("../src/services/encryptionService");
    encryptString.mockImplementation(async (payload: string) => `enc:v1:${payload.length}`);

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
    mockAsyncStorage.removeItem.mockRejectedValueOnce(new Error("remove failed"));

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
