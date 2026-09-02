import AsyncStorage from "@react-native-async-storage/async-storage";
import { DNSLogService } from "../src/services/dnsLogService";
import { parseTXTResponse } from "../src/services/dnsService";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../src/services/encryptionService", () => ({
  encryptString: jest.fn(async (value: string) => value),
  decryptIfEncrypted: jest.fn(async (value: string) => value),
  isEncryptedPayload: jest.fn((value: string) => value.startsWith("enc:v1:")),
}));

jest.mock("../src/utils/screenshotMode", () => ({
  isScreenshotMode: jest.fn(() => false),
  getMockDNSLogs: jest.fn(() => []),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const dnsLogServiceInternals = DNSLogService as unknown as {
  initialized: boolean;
  initializationInFlight: Promise<void> | null;
  persistenceQueue: Promise<void>;
  cleanupIntervalId: ReturnType<typeof setInterval> | null;
};

describe("DNSLogService concurrent query isolation", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await DNSLogService.clearLogs();
    dnsLogServiceInternals.initialized = false;
    dnsLogServiceInternals.initializationInFlight = null;
    dnsLogServiceInternals.persistenceQueue = Promise.resolve();
  });

  afterEach(() => {
    DNSLogService.stopCleanupScheduler();
    dnsLogServiceInternals.initialized = false;
    dnsLogServiceInternals.initializationInFlight = null;
    dnsLogServiceInternals.persistenceQueue = Promise.resolve();
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
    expect(
      alphaLog?.entries.some((entry) => entry.details === "alpha-attempt"),
    ).toBe(true);
    expect(
      alphaLog?.entries.some((entry) => entry.details === "beta-attempt"),
    ).toBe(false);
    expect(
      betaLog?.entries.some((entry) => entry.details === "beta-attempt"),
    ).toBe(true);
    expect(
      betaLog?.entries.some((entry) => entry.details === "alpha-attempt"),
    ).toBe(false);
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

    const persistedLogs = JSON.parse(latestPersistedPayload) as Array<{
      query: string;
    }>;
    expect(persistedLogs).toHaveLength(2);
    expect(persistedLogs[0]?.query).toContain("[settings] second");
    expect(persistedLogs[1]?.query).toContain("[settings] first");
  });

  it("single-flights initialization and preserves a mutation queued during its read", async () => {
    let releaseRead: ((value: string) => void) | undefined;
    const readStarted = new Promise<void>((resolve) => {
      mockAsyncStorage.getItem.mockImplementationOnce(
        () =>
          new Promise<string>((readResolve) => {
            releaseRead = readResolve;
            resolve();
          }),
      );
    });
    const storedLog = JSON.stringify([
      {
        id: "stored-log",
        query:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa len:3",
        startTime: "2026-08-30T12:00:00.000Z",
        finalStatus: "success",
        finalMethod: "native",
        entries: [],
      },
    ]);

    const firstInitialize = DNSLogService.initialize();
    const secondInitialize = DNSLogService.initialize();
    await readStarted;
    const concurrentMutation = DNSLogService.recordSettingsEvent("during init");

    expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(1);
    releaseRead?.(storedLog);
    await Promise.all([firstInitialize, secondInitialize, concurrentMutation]);

    const ids = DNSLogService.getLogs().map(({ id }) => id);
    expect(ids).toContain("stored-log");
    expect(
      DNSLogService.getLogs().some(({ query }) =>
        query.includes("during init"),
      ),
    ).toBe(true);

    const finalPrimaryWrite = mockAsyncStorage.setItem.mock.calls
      .filter(([key]) => key === "@dns_query_logs")
      .at(-1);
    expect(finalPrimaryWrite).toBeDefined();
    const persisted = JSON.parse(String(finalPrimaryWrite?.[1])) as Array<{
      id: string;
      query: string;
    }>;
    expect(persisted.map(({ id }) => id)).toContain("stored-log");
    expect(persisted.some(({ query }) => query.includes("during init"))).toBe(
      true,
    );
  });

  it("starts and stops the cleanup scheduler as part of initialization lifecycle", async () => {
    await DNSLogService.initialize();

    expect(dnsLogServiceInternals.cleanupIntervalId).not.toBeNull();

    DNSLogService.stopCleanupScheduler();

    expect(dnsLogServiceInternals.cleanupIntervalId).toBeNull();
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

  it("does not persist conflicting multipart TXT payload fragments in failure logs", async () => {
    const queryId = DNSLogService.startQuery("secret prompt");

    let errorMessage = "";
    try {
      parseTXTResponse([
        "1/2:secret-fragment",
        "1/2:different-secret",
        "2/2:tail",
      ]);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }

    DNSLogService.logMethodFailure(queryId, "tcp", errorMessage, 9);
    await DNSLogService.endQuery(queryId, false);

    const log = DNSLogService.getLogs().find((entry) => entry.id === queryId);
    const serialized = JSON.stringify(log);

    expect(serialized).toContain("Conflicting content for part 1");
    expect(serialized).not.toContain("secret-fragment");
    expect(serialized).not.toContain("different-secret");
  });

  it("redacts sensitive failure details at the logging boundary", async () => {
    const queryId = DNSLogService.startQuery("secret prompt", {
      chatTitle: "private chat",
    });

    DNSLogService.logMethodAttempt(
      queryId,
      "udp",
      "Query secret-prompt.llm.pieter.com for private chat",
    );
    DNSLogService.logMethodFailure(
      queryId,
      "udp",
      "UDP failed for secret prompt with TXT 1/2:secret-fragment",
      7,
    );
    await DNSLogService.endQuery(queryId, false, undefined, "udp");

    const log = DNSLogService.getLogs().find((entry) => entry.id === queryId);
    const serialized = JSON.stringify(log);

    expect(serialized).toContain("sha256:");
    expect(serialized).not.toContain("secret prompt");
    expect(serialized).not.toContain("private chat");
    expect(serialized).not.toContain("secret-prompt.llm.pieter.com");
    expect(serialized).not.toContain("secret-fragment");
  });

  it("redacts well-formed known DNS queries without over-redacting malformed fragments", async () => {
    const queryId = DNSLogService.startQuery("eta");

    DNSLogService.logMethodFailure(
      queryId,
      "udp",
      "resolve failed for hello-world.llm.pieter.com via fragment -broken.ch.at",
      11,
    );
    await DNSLogService.endQuery(queryId, false, undefined, "udp");

    const log = DNSLogService.getLogs().find((entry) => entry.id === queryId);
    const serialized = JSON.stringify(log);

    // A valid single-label query against a known zone is redacted.
    expect(serialized).not.toContain("hello-world.llm.pieter.com");
    // A malformed fragment (leading dash) is left intact so debug context is not
    // silently destroyed by an over-broad word-boundary match.
    expect(serialized).toContain("-broken.ch.at");
  });

  it("sends the current log snapshot when subscribing after async initialization", () => {
    const queryId = DNSLogService.startQuery("delta");
    const listener = jest.fn();

    const unsubscribe = DNSLogService.subscribe(listener);
    unsubscribe();

    expect(listener).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: queryId })]),
    );
  });
});
