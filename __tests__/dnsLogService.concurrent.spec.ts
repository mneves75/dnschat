import AsyncStorage from "@react-native-async-storage/async-storage";
import { DNSLogService } from "../src/services/dnsLogService";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../src/services/encryptionService", () => ({
  encryptString: jest.fn(async (value: string) => value),
  decryptIfEncrypted: jest.fn(async (value: string) => value),
}));

jest.mock("../src/utils/screenshotMode", () => ({
  isScreenshotMode: jest.fn(() => false),
  getMockDNSLogs: jest.fn(() => []),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("DNSLogService concurrent query isolation", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await DNSLogService.clearLogs();
  });

  it("keeps overlapping queries isolated by query id", async () => {
    const queryOne = DNSLogService.startQuery("alpha");
    const queryTwo = DNSLogService.startQuery("beta");

    DNSLogService.logMethodAttempt(queryOne, "native", "alpha-attempt");
    DNSLogService.logMethodAttempt(queryTwo, "udp", "beta-attempt");

    await DNSLogService.endQuery(queryTwo, true, "beta-response", "udp");
    await DNSLogService.endQuery(queryOne, false, undefined, "native");

    const logs = DNSLogService.getLogs();
    const alphaLog = logs.find((log) => log.id === queryOne);
    const betaLog = logs.find((log) => log.id === queryTwo);

    expect(alphaLog).toBeDefined();
    expect(betaLog).toBeDefined();
    expect(alphaLog?.entries.some((entry) => entry.details === "alpha-attempt")).toBe(true);
    expect(alphaLog?.entries.some((entry) => entry.details === "beta-attempt")).toBe(false);
    expect(betaLog?.entries.some((entry) => entry.details === "beta-attempt")).toBe(true);
    expect(betaLog?.entries.some((entry) => entry.details === "alpha-attempt")).toBe(false);
    expect(mockAsyncStorage.setItem).toHaveBeenCalled();
  });

  it("serializes persistent log saves so older writes cannot overwrite newer state", async () => {
    const resolvers: Array<() => void> = [];
    let latestPersistedPayload = "";

    mockAsyncStorage.setItem.mockImplementation(
      async (_key: string, value: string | number | object) =>
        await new Promise<void>((resolve) => {
          resolvers.push(() => {
            latestPersistedPayload = String(value);
            resolve();
          });
        }),
    );

    const firstWrite = DNSLogService.recordSettingsEvent("first");
    const secondWrite = DNSLogService.recordSettingsEvent("second");

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);

    const resolveFirst = resolvers.shift();
    if (!resolveFirst) {
      throw new Error("Expected first queued log save");
    }
    resolveFirst();
    await firstWrite;
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(2);

    const resolveSecond = resolvers.shift();
    if (!resolveSecond) {
      throw new Error("Expected second queued log save");
    }
    resolveSecond();

    await Promise.all([firstWrite, secondWrite]);
    mockAsyncStorage.setItem.mockResolvedValue();

    const persistedLogs = JSON.parse(latestPersistedPayload) as Array<{ query: string }>;
    expect(persistedLogs).toHaveLength(2);
    expect(persistedLogs[0]?.query).toContain("[settings] second");
    expect(persistedLogs[1]?.query).toContain("[settings] first");
  });

  it("attributes failed queries to the last attempted transport instead of mock", async () => {
    const queryId = DNSLogService.startQuery("gamma");

    DNSLogService.logMethodAttempt(queryId, "tcp", "tcp-attempt");
    DNSLogService.logMethodFailure(queryId, "tcp", "socket timeout", 42);
    await DNSLogService.endQuery(queryId, false);

    const failedLog = DNSLogService.getLogs().find((log) => log.id === queryId);
    expect(failedLog?.finalMethod).toBe("tcp");
    expect(failedLog?.entries.at(-1)?.method).toBe("tcp");
  });

  it("redacts user prompt, chat title, and response content in persisted logs", async () => {
    const queryId = DNSLogService.startQuery("secret prompt", {
      chatId: "chat-1",
      chatTitle: "secret prompt",
    });

    await DNSLogService.endQuery(queryId, true, "secret response", "native");

    const log = DNSLogService.getLogs().find((entry) => entry.id === queryId);
    const serialized = JSON.stringify(log);

    expect(serialized).toContain("sha256:");
    expect(serialized).not.toContain("secret prompt");
    expect(serialized).not.toContain("secret response");
  });
});
