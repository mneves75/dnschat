import * as WaitUtils from "../src/utils/wait";
jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native");
  return {
    ...actual,
    AppState: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
  };
});

import {
  DNSService,
  MockDNSService,
  parseTXTResponse,
  sanitizeDNSMessage,
  validateDNSMessage,
  validateDNSServer,
  composeDNSQueryName,
  generateSecureDNSId,
  validateDecodedDnsResponseForTxt,
  DNSErrorType,
} from "../src/services/dnsService";
import { Platform } from "react-native";
import { DNSLogService } from "../src/services/dnsLogService";
import { sanitizeDNSMessageReference } from "../modules/dns-native/constants";

// Access private methods for test via internal access
import * as DNSServiceModule from "../src/services/dnsService";

type DNSServiceModuleShape = {
  DNSService?: {
    getMethodOrder?: (
      enableMock?: boolean,
      allowExperimental?: boolean,
    ) => Array<"native" | "udp" | "tcp" | "mock">;
  };
};

type DNSServiceInternals = {
  queryWithServer: (
    ...args: unknown[]
  ) => Promise<{ response: string; method: string }>;
  tryMethod?: (
    ...args: unknown[]
  ) => Promise<{ response: string; method: string }>;
  captureLifecycleToken: () => number;
};

const dnsServiceInternals = DNSService as unknown as DNSServiceInternals;
const moduleWithService = DNSServiceModule as unknown as DNSServiceModuleShape;

describe("DNS Service helpers", () => {
  describe("parseTXTResponse", () => {
    it("parses single plain response", () => {
      const result = parseTXTResponse(["Hello world from AI"]);
      expect(result).toBe("Hello world from AI");
    });

    it("parses ordered multi-part response", () => {
      const input = ["1/3:Hello ", "2/3:from AI ", "3/3:assistant!"];
      const result = parseTXTResponse(input);
      expect(result).toBe("Hello from AI assistant!");
    });

    it("parses unordered multi-part response", () => {
      const input = ["3/3:assistant!", "1/3:Hello ", "2/3:from AI "];
      const result = parseTXTResponse(input);
      expect(result).toBe("Hello from AI assistant!");
    });

    it("reassembles multipart responses containing newlines", () => {
      const records = ["1/2:Hello\nWorld", "2/2:!"];
      const result = parseTXTResponse(records);
      expect(result).toBe("Hello\nWorld!");
    });

    it("throws on duplicate multipart part numbers", () => {
      const records = ["1/2:Hel", "1/2:lo"];
      expect(() => parseTXTResponse(records)).toThrow(
        /Conflicting content for part/,
      );
    });

    it("throws on incomplete multi-part response", () => {
      const input = ["1/3:Hello ", "3/3:assistant!"];
      expect(() => parseTXTResponse(input)).toThrow(
        "Incomplete multi-part response: got 2 parts, expected 3",
      );
    });

    it("throws on inconsistent multi-part totals", () => {
      const input = ["1/2:Hello ", "2/99:assistant!"];
      expect(() => parseTXTResponse(input)).toThrow(
        "Inconsistent multi-part response: expected 2 total parts but received 99 for part 2",
      );
    });

    it("rejects mixed plain and multipart records", () => {
      const input = ["Regular response without part format", "2/2:ignored"];
      expect(() => parseTXTResponse(input)).toThrow(
        "Mixed plain and multipart TXT records",
      );
    });

    it("concatenates plain TXT segments in order", () => {
      const input = ["Hello ", "world", "! from DNS"];
      const result = parseTXTResponse(input);
      expect(result).toBe("Hello world! from DNS");
    });

    it("throws on empty array", () => {
      expect(() => parseTXTResponse([])).toThrow("No TXT records to parse");
    });
  });

  describe("sanitizeDNSMessage / validateDNSMessage", () => {
    it("sanitizes message to dashed lowercase label", () => {
      const sanitized = sanitizeDNSMessage("   Hello!!   DNS   World  ");
      expect(sanitized).toBe("hello-dns-world");
    });

    it("folds common diacritics into ASCII-safe output", () => {
      const sanitized = sanitizeDNSMessage("ÁÉÍÓÚ ç ã");
      expect(sanitized).toBe("aeiou-c-a");
    });

    it("rejects inputs that lose all content after sanitization", () => {
      const smiley = String.fromCodePoint(0x1f642);
      expect(() => sanitizeDNSMessage("!!!")).toThrow(
        "Message must contain at least one letter or number after sanitization",
      );
      expect(() => sanitizeDNSMessage(smiley.repeat(2))).toThrow(
        "Message must contain at least one letter or number after sanitization",
      );
    });

    it("throws when sanitized label exceeds DNS length limit", () => {
      const long = "a".repeat(64);
      expect(() => sanitizeDNSMessage(long)).toThrow(
        "Message exceeds DNS label limit of 63 characters after sanitization",
      );
    });

    it("rejects control DNS characters", () => {
      const msg = "hello;you.there\nnow";
      expect(() => sanitizeDNSMessage(msg)).toThrow(
        "Message contains control characters that cannot be encoded safely",
      );
    });

    it("rejects empty or whitespace-only", () => {
      expect(() => validateDNSMessage("")).toThrow(
        "Message must be a non-empty string",
      );
      expect(() => validateDNSMessage("   ")).toThrow(
        "Message cannot be empty or contain only whitespace",
      );
    });

    it("rejects invalid control characters", () => {
      expect(() => validateDNSMessage("bad\x00msg")).toThrow(
        "Message contains control characters that cannot be encoded safely",
      );
    });

    it("rejects messages that exceed pre-sanitization limit", () => {
      const overlyLong = "b".repeat(121);
      expect(() => validateDNSMessage(overlyLong)).toThrow(
        "Message too long (maximum 120 characters before sanitization)",
      );
    });

    it("matches native reference sanitizer for representative inputs", () => {
      const cases = [
        "Hello DNS World",
        "   Hello!!   DNS   World  ",
        "ÁÉÍÓÚ ç ã",
        "Olá São Paulo",
        "numbers 123 456",
        "dashes---and   spaces",
        "MixedCASE and Punctuation!!!",
        "tabs\tand\nnewlines",
        "emoji are rejected",
      ];

      for (const input of cases) {
        // For valid inputs, the TS sanitizer must be identical to the native reference
        // implementation (shared contract).
        try {
          validateDNSMessage(input);
        } catch {
          continue;
        }

        let tsValue: string | null = null;
        let nativeValue: string | null = null;

        let tsRejected = false;
        let nativeRejected = false;

        try {
          tsValue = sanitizeDNSMessage(input);
        } catch {
          tsRejected = true;
        }
        try {
          nativeValue = sanitizeDNSMessageReference(input);
        } catch {
          nativeRejected = true;
        }

        expect({ tsRejected, tsValue }).toEqual({
          tsRejected: nativeRejected,
          tsValue: nativeValue,
        });
      }
    });
  });

  describe("composeDNSQueryName", () => {
    it("appends the DNS server hostname as zone", () => {
      const fqdn = composeDNSQueryName("hello-world", "ch.at");
      expect(fqdn).toBe("hello-world.ch.at");
    });

    it("falls back to default zone when server is IPv4", () => {
      const fqdn = composeDNSQueryName("test", "8.8.8.8");
      // Default zone is now llm.pieter.com (primary LLM server)
      expect(fqdn).toBe("test.llm.pieter.com");
    });
  });

  describe("validateDecodedDnsResponseForTxt", () => {
    const baseDecodedPacket = {
      id: 1234,
      type: "response",
      flags: 0x8100,
      rcode: "NOERROR",
      questions: [{ name: "hello.ch.at", type: "TXT", class: "IN" }],
      answers: [
        { name: "hello.ch.at", type: "TXT", class: "IN", data: ["ok"] },
      ],
    } as unknown as import("dns-packet").DecodedPacket;

    it("accepts a valid TXT response that matches the original query", () => {
      expect(() =>
        validateDecodedDnsResponseForTxt(baseDecodedPacket, {
          expectedQueryId: 1234,
          expectedQueryName: "hello.ch.at",
          expectedPort: 53,
          expectedServer: "1.1.1.1",
          sourceAddress: "1.1.1.1",
          sourcePort: 53,
        }),
      ).not.toThrow();
    });

    it("rejects question mismatches", () => {
      expect(() =>
        validateDecodedDnsResponseForTxt(
          {
            ...baseDecodedPacket,
            questions: [{ name: "other.ch.at", type: "TXT", class: "IN" }],
          } as unknown as import("dns-packet").DecodedPacket,
          {
            expectedQueryId: 1234,
            expectedQueryName: "hello.ch.at",
            expectedPort: 53,
            expectedServer: "ch.at",
          },
        ),
      ).toThrow("DNS response question name mismatch");
    });

    it("rejects unexpected UDP source metadata for IPv4 resolvers", () => {
      expect(() =>
        validateDecodedDnsResponseForTxt(baseDecodedPacket, {
          expectedQueryId: 1234,
          expectedQueryName: "hello.ch.at",
          expectedPort: 53,
          expectedServer: "1.1.1.1",
          sourceAddress: "8.8.8.8",
          sourcePort: 53,
        }),
      ).toThrow("DNS response from unexpected source address: 8.8.8.8");

      expect(() =>
        validateDecodedDnsResponseForTxt(baseDecodedPacket, {
          expectedQueryId: 1234,
          expectedQueryName: "hello.ch.at",
          expectedPort: 53,
          expectedServer: "1.1.1.1",
          sourceAddress: "1.1.1.1",
          sourcePort: 1053,
        }),
      ).toThrow("DNS response from unexpected source port: 1053");
    });
  });

  describe("validateDNSServer (allowlist + normalization)", () => {
    it("accepts allowlisted endpoints and returns canonical lowercase form", () => {
      expect(validateDNSServer("CH.AT")).toBe("ch.at");
      expect(validateDNSServer("  llm.pieter.com  ")).toBe("llm.pieter.com");
      expect(validateDNSServer("1.1.1.1")).toBe("1.1.1.1");
      expect(validateDNSServer("8.8.8.8")).toBe("8.8.8.8");
    });

    it("treats a trailing dot as equivalent for hostnames", () => {
      expect(validateDNSServer("ch.at.")).toBe("ch.at");
      expect(validateDNSServer("LLM.PIETER.COM.")).toBe("llm.pieter.com");
    });

    it("rejects non-allowlisted DNS servers", () => {
      expect(() => validateDNSServer("example.com")).toThrow(
        "DNS server not allowed",
      );
      expect(() => validateDNSServer("dns.google")).toThrow(
        "DNS server not allowed",
      );
    });

    it("rejects host:port style input (ports are not supported)", () => {
      expect(() => validateDNSServer("ch.at:53")).toThrow(
        "DNS server must be a valid allowlisted hostname or IP address",
      );
      expect(() => validateDNSServer("1.1.1.1:53")).toThrow(
        "DNS server must be a valid allowlisted hostname or IP address",
      );
    });
  });

  describe("getMethodOrder", () => {
    const rawGetOrder = moduleWithService.DNSService?.getMethodOrder?.bind(
      moduleWithService.DNSService,
    );

    const getOrder = (
      enableMock: boolean | undefined,
      allowExperimental: boolean = true,
    ) => {
      const order = rawGetOrder?.(enableMock, allowExperimental);
      if (!order) {
        throw new Error("Expected getMethodOrder to return a value");
      }
      return order;
    };

    it("returns native→udp→tcp when experimental transports enabled", () => {
      const order = getOrder(false, true);
      expect(order).toEqual(["native", "udp", "tcp"]);
    });

    it("returns native-only when experimental transports disabled", () => {
      const order = getOrder(false, false);
      expect(order).toEqual(["native"]);
    });

    it("appends mock when enableMock is true", () => {
      const order = getOrder(true, true);
      expect(order).toEqual(["native", "udp", "tcp", "mock"]);
    });

    it("appends mock to native-only when experimental disabled", () => {
      const order = getOrder(true, false);
      expect(order).toEqual(["native", "mock"]);
    });

    it("uses mock transport by default on web", async () => {
      const originalPlatform = Platform.OS;
      const mockQuery = jest
        .spyOn(MockDNSService, "queryLLM")
        .mockResolvedValue("web mock response");

      try {
        await DNSLogService.clearLogs();
        (Platform as { OS: string }).OS = "web";

        expect(getOrder(undefined, true)).toEqual(["mock"]);
        await expect(DNSService.queryLLM("web default query")).resolves.toBe(
          "web mock response",
        );

        expect(mockQuery).toHaveBeenCalledWith("web default query");
        expect(DNSLogService.getLogs()[0]?.finalMethod).toBe("mock");
      } finally {
        mockQuery.mockRestore();
        (Platform as { OS: string }).OS = originalPlatform;
        await DNSLogService.clearLogs();
      }
    });

    it("never includes https (removed in v3.0.0)", () => {
      const orderWithExperimental = getOrder(false, true);
      const orderWithoutExperimental = getOrder(false, false);
      const orderWithMock = getOrder(true, true);

      expect((orderWithExperimental as string[]).includes("https")).toBe(false);
      expect((orderWithoutExperimental as string[]).includes("https")).toBe(
        false,
      );
      expect((orderWithMock as string[]).includes("https")).toBe(false);
    });

    it("native is always first when available", () => {
      expect(getOrder(false, true)[0]).toBe("native");
      expect(getOrder(false, false)[0]).toBe("native");
      expect(getOrder(true, true)[0]).toBe("native");
    });
  });

  describe("generateSecureDNSId", () => {
    it("returns a valid 16-bit unsigned integer (0-65535)", () => {
      for (let i = 0; i < 100; i++) {
        const id = generateSecureDNSId();
        expect(Number.isInteger(id)).toBe(true);
        expect(id).toBeGreaterThanOrEqual(0);
        expect(id).toBeLessThan(65536);
      }
    });

    it("generates IDs with high entropy (most unique in sample)", () => {
      // RFC 5452 requires unpredictable DNS transaction IDs.
      // Cryptographically secure random should produce highly unique values.
      const ids = new Set<number>();
      const sampleSize = 1000;
      for (let i = 0; i < sampleSize; i++) {
        ids.add(generateSecureDNSId());
      }
      // With 65536 possible values and 1000 samples, collision probability
      // per ID is ~1.5%. Expected unique ~985+. We accept >950 as threshold.
      expect(ids.size).toBeGreaterThan(950);
    });

    it("does not produce sequential patterns", () => {
      // Sequential output would indicate broken randomness
      const ids: number[] = [];
      for (let i = 0; i < 10; i++) {
        ids.push(generateSecureDNSId());
      }
      // Check no sequential ascending or descending pairs (very unlikely with true random)
      let sequentialCount = 0;
      for (let i = 1; i < ids.length; i++) {
        const current = ids[i];
        const previous = ids[i - 1];
        if (current == null || previous == null) continue;
        if (current === previous + 1 || current === previous - 1) {
          sequentialCount++;
        }
      }
      // Allow at most 2 sequential pairs by chance in 10 samples
      expect(sequentialCount).toBeLessThanOrEqual(2);
    });

    it("uses global crypto.getRandomValues when available", () => {
      const globalWithCrypto = global as unknown as {
        crypto?: Crypto | undefined;
      };
      const originalCrypto = globalWithCrypto.crypto;
      let getRandomValuesCalled = false;
      const trackedGetRandomValues = <T extends ArrayBufferView>(
        array: T,
      ): T => {
        getRandomValuesCalled = true;
        if (array instanceof Uint16Array) {
          array[0] = 4242;
        }
        return array;
      };
      globalWithCrypto.crypto = {
        ...originalCrypto,
        getRandomValues: trackedGetRandomValues,
      } as unknown as Crypto;

      try {
        const id = generateSecureDNSId();
        expect(getRandomValuesCalled).toBe(true);
        expect(id).toBe(4242);
      } finally {
        globalWithCrypto.crypto = originalCrypto;
      }
    });

    it("uses expo-crypto fallback when global crypto is unavailable", () => {
      const globalWithCrypto = global as unknown as {
        crypto?: Crypto | undefined;
      };
      const originalCrypto = globalWithCrypto.crypto;
      globalWithCrypto.crypto = undefined;

      const expoCrypto = require("expo-crypto");

      try {
        const id = generateSecureDNSId();
        expect(expoCrypto.getRandomValues).toHaveBeenCalled();
        expect(id).toBe(1);
      } finally {
        globalWithCrypto.crypto = originalCrypto;
      }
    });
  });

  describe("server selection", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(DNSLogService, "startQuery").mockReturnValue("query-1");
      jest.spyOn(DNSLogService, "addLog").mockImplementation(() => undefined);
      jest
        .spyOn(DNSLogService, "logMethodFailure")
        .mockImplementation(() => undefined);
      jest
        .spyOn(DNSLogService, "logFallback")
        .mockImplementation(() => undefined);
      jest.spyOn(DNSLogService, "endQuery").mockResolvedValue(undefined);
    });

    afterEach(() => {
      DNSService.destroyBackgroundListener();
      jest.restoreAllMocks();
    });

    it("does not automatically fall back to offline ch.at when the primary fails", async () => {
      const querySpy = jest
        .spyOn(dnsServiceInternals, "queryWithServer")
        .mockRejectedValueOnce(new Error("Primary server down"));

      await expect(
        DNSService.queryLLM("test fallback", undefined, true, true),
      ).rejects.toThrow("Primary server down");

      expect(querySpy).toHaveBeenCalledTimes(1);
      const calls = querySpy.mock.calls as Array<
        [{ targetServer: string }, ...unknown[]]
      >;
      const firstContext = calls[0]?.[0] as { targetServer: string };
      expect(firstContext.targetServer).toBe("llm.pieter.com");
    });

    it("does not persist raw DNS query names derived from user prompts", async () => {
      const addLogSpy = jest.spyOn(DNSLogService, "addLog");
      jest
        .spyOn(dnsServiceInternals, "queryWithServer")
        .mockResolvedValueOnce({ response: "ok", method: "udp" });

      await DNSService.queryLLM("secret prompt", "llm.pieter.com", true, true);

      const serializedEntries = JSON.stringify(
        addLogSpy.mock.calls.map(([, entry]) => entry),
      );
      expect(serializedEntries).toContain("sha256:");
      expect(serializedEntries).not.toContain("secret-prompt.llm.pieter.com");
    });

    it("returns a successful DNS response when final query logging fails", async () => {
      jest
        .spyOn(DNSLogService, "endQuery")
        .mockRejectedValueOnce(new Error("log persistence failed"));
      jest
        .spyOn(dnsServiceInternals, "queryWithServer")
        .mockResolvedValueOnce({ response: "ok", method: "udp" });

      await expect(
        DNSService.queryLLM("logging failure", "llm.pieter.com", true, true),
      ).resolves.toBe("ok");
    });
  });

  describe("transport logging", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(DNSLogService, "addLog").mockImplementation(() => undefined);
      jest
        .spyOn(DNSLogService, "logFallback")
        .mockImplementation(() => undefined);
      jest.spyOn(WaitUtils, "wait").mockResolvedValue(undefined);
    });

    afterEach(() => {
      DNSService.destroyBackgroundListener();
      jest.restoreAllMocks();
    });

    it("logs one transport failure per retry when native-only mode is enabled", async () => {
      const failureSpy = jest
        .spyOn(DNSLogService, "logMethodFailure")
        .mockImplementation(() => undefined);
      jest
        .spyOn(dnsServiceInternals, "tryMethod")
        .mockImplementation(async (queryId, method) => {
          DNSLogService.logMethodFailure(
            queryId as string,
            method as "native" | "udp" | "tcp" | "mock",
            "transport failed",
            5,
          );
          throw new Error("transport failed");
        });

      await expect(
        dnsServiceInternals.queryWithServer(
          {
            queryName: "hello.ch.at",
            targetServer: "ch.at",
            targetPort: 53,
            originalMessage: "hello",
            label: "hello",
          },
          "query-1",
          false,
          false,
          // queryWithServer takes no defaults: the budget and lifecycle token
          // are passed explicitly so the test cannot silently inherit a fresh
          // full budget on every retry.
          Date.now() + 20_000,
          dnsServiceInternals.captureLifecycleToken(),
        ),
      ).rejects.toThrow("All 1 DNS transports failed for ch.at:53");

      expect(failureSpy).toHaveBeenCalledTimes(3);
    });

    it("tags retry log entries with the last attempted transport", async () => {
      jest
        .spyOn(dnsServiceInternals, "tryMethod")
        .mockRejectedValue(new Error("transport failed"));
      const addLogSpy = jest.spyOn(DNSLogService, "addLog");

      await expect(
        dnsServiceInternals.queryWithServer(
          {
            queryName: "hello.ch.at",
            targetServer: "ch.at",
            targetPort: 53,
            originalMessage: "hello",
            label: "hello",
          },
          "query-2",
          false,
          false,
          // queryWithServer takes no defaults: the budget and lifecycle token
          // are passed explicitly so the test cannot silently inherit a fresh
          // full budget on every retry.
          Date.now() + 20_000,
          dnsServiceInternals.captureLifecycleToken(),
        ),
      ).rejects.toThrow("All 1 DNS transports failed for ch.at:53");

      const retryEntries = addLogSpy.mock.calls
        .map(([, entry]) => entry)
        .filter(
          (entry) =>
            typeof entry === "object" &&
            entry !== null &&
            "message" in entry &&
            typeof entry.message === "string" &&
            entry.message.startsWith("Retrying"),
        ) as Array<{ message: string; method: string }>;

      expect(retryEntries).toHaveLength(2);
      expect(retryEntries.every((entry) => entry.method === "native")).toBe(
        true,
      );
    });
  });

  describe("query wall-clock budget", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.clearAllMocks();
      jest.spyOn(DNSLogService, "startQuery").mockReturnValue("query-budget");
      jest.spyOn(DNSLogService, "addLog").mockImplementation(() => undefined);
      jest
        .spyOn(DNSLogService, "logMethodAttempt")
        .mockImplementation(() => undefined);
      jest
        .spyOn(DNSLogService, "logMethodFailure")
        .mockImplementation(() => undefined);
      jest
        .spyOn(DNSLogService, "logFallback")
        .mockImplementation(() => undefined);
      jest.spyOn(DNSLogService, "endQuery").mockResolvedValue(undefined);
    });

    afterEach(() => {
      jest.useRealTimers();
      DNSService.destroyBackgroundListener();
      jest.restoreAllMocks();
    });

    it("rejects hanging transports when the query budget is exhausted", async () => {
      jest
        .spyOn(dnsServiceInternals, "tryMethod")
        .mockImplementation(() => new Promise(() => undefined));

      const query = DNSService.queryLLM(
        "budget timeout",
        "llm.pieter.com",
        false,
        true,
      );
      // oxlint-disable-next-line jest/valid-expect -- Awaited after fake timers advance so the timeout can settle.
      const assertion = expect(query).rejects.toMatchObject({
        type: DNSErrorType.TIMEOUT,
        message: "DNS query budget exhausted",
      });

      await jest.advanceTimersByTimeAsync(20000);

      await assertion;
    });

    it("falls back to UDP when the native transport exceeds its per-transport timeout", async () => {
      const attemptedMethods: string[] = [];
      jest
        .spyOn(dnsServiceInternals, "tryMethod")
        .mockImplementation((...args: unknown[]) => {
          const method = args[1];
          if (typeof method !== "string") {
            return Promise.reject(new Error("Expected a transport method"));
          }
          attemptedMethods.push(method);
          if (method === "native") {
            return new Promise(() => undefined);
          }
          if (method === "udp") {
            return Promise.resolve({
              response: "udp fallback ok",
              method: "udp",
            });
          }
          return Promise.reject(new Error(`Unexpected transport: ${method}`));
        });

      const query = DNSService.queryLLM(
        "native timeout fallback",
        "llm.pieter.com",
        false,
        true,
      );
      // oxlint-disable-next-line jest/valid-expect -- Awaited after fake timers advance so the fallback can settle.
      const assertion = expect(query).resolves.toBe("udp fallback ok");

      await jest.advanceTimersByTimeAsync(10000);

      await assertion;
      expect(attemptedMethods).toEqual(["native", "udp"]);
    });

    it("keeps fast successful responses on the same success path", async () => {
      jest.spyOn(dnsServiceInternals, "tryMethod").mockResolvedValueOnce({
        response: "fast ok",
        method: "native",
      });

      await expect(
        DNSService.queryLLM("fast response", "llm.pieter.com", false, true),
      ).resolves.toBe("fast ok");
    });
  });
});
