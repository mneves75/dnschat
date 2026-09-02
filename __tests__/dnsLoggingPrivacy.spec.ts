import fs from "node:fs";

import { DNSLogService } from "../src/services/dnsLogService";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../src/services/encryptionService", () => ({
  decryptIfEncrypted: jest.fn(),
  encryptString: jest.fn(async (payload: string) => payload),
  isEncryptedPayload: jest.fn((payload: string) =>
    payload.startsWith("enc:v1:"),
  ),
}));

function readSource(path: string): string {
  return fs.readFileSync(path, "utf8");
}

describe("DNS logging privacy", () => {
  it("does not emit prompt-derived query names or TXT payloads in DNSService verbose logs", () => {
    const source = readSource("src/services/dnsService.ts");

    expect(source).not.toContain("NATIVE: Query name:");
    expect(source).not.toContain("Forced query name:");
    expect(source).not.toContain("Raw TXT records received:");
    expect(source).not.toContain("Parsed response preview:");
    expect(source).not.toContain("transport test successful: ${response}");
    expect(source).toContain("queryNameLength");
    expect(source).toContain("responseLength");
  });

  it("does not emit prompt-derived query names from the native module bridge debug log", () => {
    const source = readSource("modules/dns-native/index.ts");

    expect(source).not.toContain("- ${message.trim()}");
    expect(source).toContain("queryNameLength");
  });
});

describe("DNS logging redaction — sanitized label", () => {
  const internals = DNSLogService as unknown as {
    currentQueryLog: unknown;
    activeQueryLogs: Map<string, { entries: Array<{ error?: string }> }>;
    queryLogs: unknown[];
  };

  beforeEach(() => {
    jest.clearAllMocks();
    internals.currentQueryLog = null;
    internals.activeQueryLogs = new Map();
    internals.queryLogs = [];
  });

  afterEach(() => {
    DNSLogService.stopCleanupScheduler();
  });

  it("redacts a bare sanitized label embedded in a method-failure error", () => {
    const sanitizedLabel = "secret-prompt-here";
    const queryId = DNSLogService.startQuery("secret prompt here");
    DNSLogService.registerSensitiveValues(queryId, [sanitizedLabel]);

    DNSLogService.logMethodFailure(
      queryId,
      "native",
      `DNS label exceeds 63 bytes: ${sanitizedLabel}`,
    );

    const entries = internals.activeQueryLogs.get(queryId)?.entries ?? [];
    const failure = entries.find((entry) => entry.error !== undefined);
    expect(failure).toBeDefined();
    expect(failure?.error).not.toContain(sanitizedLabel);
  });
});
