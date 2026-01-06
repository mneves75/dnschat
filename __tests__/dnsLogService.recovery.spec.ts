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
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const { decryptIfEncrypted } = jest.requireMock("../src/services/encryptionService");
const dnsLogServiceInternals = DNSLogService as unknown as {
  currentQueryLog: unknown;
  queryLogs: unknown[];
};

describe("DNSLogService recovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dnsLogServiceInternals.currentQueryLog = null;
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
});
