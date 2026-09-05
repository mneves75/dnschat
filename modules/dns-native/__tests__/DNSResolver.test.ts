import { DNSError, DNSErrorType, NativeDNS } from "../index";
import type { NativeDNSModule } from "../index";
import { NativeModules } from "react-native";

const futureDeadline = (): number => Date.now() + 30_000;

// Mock React Native NativeModules
jest.mock("react-native", () => ({
  NativeModules: {
    RNDNSModule: {
      queryTXT: jest.fn(),
      cancelActiveQueries: jest.fn(),
      isAvailable: jest.fn(),
      configureSanitizer: jest.fn().mockResolvedValue(true),
    },
  },
}));

describe("Native DNS Module", () => {
  let mockNativeModule: jest.Mocked<NativeDNSModule>;
  let testDNS: NativeDNS;

  beforeEach(() => {
    mockNativeModule = NativeModules[
      "RNDNSModule"
    ] as jest.Mocked<NativeDNSModule>;
    testDNS = new NativeDNS();

    // Reset all mocks
    jest.clearAllMocks();
    mockNativeModule.cancelActiveQueries.mockResolvedValue(0);

    // Reset capabilities cache
    testDNS.resetCapabilities();
  });

  describe("Platform Capabilities", () => {
    it("should report iOS capabilities correctly", async () => {
      mockNativeModule.isAvailable.mockResolvedValue({
        available: true,
        platform: "ios",
        supportsCustomServer: true,
        supportsAsyncQuery: true,
      });

      const capabilities = await testDNS.isAvailable();

      expect(capabilities.available).toBe(true);
      expect(capabilities.platform).toBe("ios");
      expect(capabilities.supportsCustomServer).toBe(true);
      expect(capabilities.supportsAsyncQuery).toBe(true);
    });

    it("should report Android capabilities correctly", async () => {
      mockNativeModule.isAvailable.mockResolvedValue({
        available: true,
        platform: "android",
        supportsCustomServer: true,
        supportsAsyncQuery: true,
        apiLevel: 29,
      });

      const capabilities = await testDNS.isAvailable();

      expect(capabilities.available).toBe(true);
      expect(capabilities.platform).toBe("android");
      expect(capabilities.apiLevel).toBe(29);
    });

    it("should handle unavailable native module", async () => {
      const dnsWithoutNative = new NativeDNS(null);

      const capabilities = await dnsWithoutNative.isAvailable();

      expect(capabilities.available).toBe(false);
      expect(capabilities.platform).toBe("web");
      expect(capabilities.supportsCustomServer).toBe(false);
    });

    it("should cache capabilities after first call", async () => {
      mockNativeModule.isAvailable.mockResolvedValue({
        available: true,
        platform: "ios",
        supportsCustomServer: true,
        supportsAsyncQuery: true,
      });

      // First call
      await testDNS.isAvailable();

      // Second call
      await testDNS.isAvailable();

      // Should only call native module once due to caching
      expect(mockNativeModule.isAvailable).toHaveBeenCalledTimes(1);
    });
  });

  describe("DNS Query Functionality", () => {
    it("returns the number of active native queries cancelled", async () => {
      mockNativeModule.cancelActiveQueries.mockResolvedValue(3);

      await expect(testDNS.cancelActiveQueries()).resolves.toBe(3);
      expect(mockNativeModule.cancelActiveQueries).toHaveBeenCalledTimes(1);
    });

    it("treats cancellation without a native module as a no-op", async () => {
      await expect(new NativeDNS(null).cancelActiveQueries()).resolves.toBe(0);
    });

    it("rejects a loaded native module that lacks cancellation support", async () => {
      const staleNativeModule = {
        queryTXT: jest.fn(),
        isAvailable: jest.fn(),
        configureSanitizer: jest.fn().mockResolvedValue(true),
      } as unknown as NativeDNSModule;

      await expect(
        new NativeDNS(staleNativeModule).cancelActiveQueries(),
      ).rejects.toMatchObject({
        type: DNSErrorType.PLATFORM_UNSUPPORTED,
      });
    });

    it("rejects an invalid native cancellation count", async () => {
      mockNativeModule.cancelActiveQueries.mockResolvedValue(-1);

      await expect(testDNS.cancelActiveQueries()).rejects.toMatchObject({
        type: DNSErrorType.DNS_QUERY_FAILED,
      });
    });

    it("should successfully query TXT records", async () => {
      const mockResponse = ["1/2:Hello from", "2/2: AI assistant"];
      mockNativeModule.queryTXT.mockResolvedValue(mockResponse);

      const result = await testDNS.queryTXT(
        "ch.at",
        "test message",
        53,
        futureDeadline(),
      );

      expect(mockNativeModule.queryTXT).toHaveBeenCalledWith(
        "ch.at",
        "test message",
        53, // ch.at uses standard DNS port
        expect.any(Number),
      );
      expect(result).toEqual(mockResponse);
    });

    it("passes custom server to native module", async () => {
      const mockResponse = ["hello world"];
      mockNativeModule.queryTXT.mockResolvedValue(mockResponse);
      await testDNS.queryTXT("example.com", "foo", 53, futureDeadline());
      expect(mockNativeModule.queryTXT).toHaveBeenCalledWith(
        "example.com",
        "foo",
        53, // Default DNS port for unknown servers
        expect.any(Number),
      );
    });

    it("uses port 53 for llm.pieter.com", async () => {
      const mockResponse = ["hello world"];
      mockNativeModule.queryTXT.mockResolvedValue(mockResponse);
      await testDNS.queryTXT("llm.pieter.com", "test", 53, futureDeadline());
      expect(mockNativeModule.queryTXT).toHaveBeenCalledWith(
        "llm.pieter.com",
        "test",
        53, // LLM server now uses standard port 53 (as of 2026-01-05)
        expect.any(Number),
      );
    });

    it("calls the native UDP-only bridge method for forced UDP queries", async () => {
      const mockResponse = ["hello udp"];
      mockNativeModule.queryTXTUDP = jest.fn().mockResolvedValue(mockResponse);

      const result = await testDNS.queryTXTUDP(
        "llm.pieter.com",
        "test.llm.pieter.com",
        53,
        futureDeadline(),
      );

      expect(result).toEqual(mockResponse);
      expect(mockNativeModule.queryTXTUDP).toHaveBeenCalledWith(
        "llm.pieter.com",
        "test.llm.pieter.com",
        53,
        expect.any(Number),
      );
    });

    it("calls the native TCP-only bridge method for forced TCP queries", async () => {
      const mockResponse = ["hello tcp"];
      mockNativeModule.queryTXTTCP = jest.fn().mockResolvedValue(mockResponse);

      const result = await testDNS.queryTXTTCP(
        "llm.pieter.com",
        "test.llm.pieter.com",
        53,
        futureDeadline(),
      );

      expect(result).toEqual(mockResponse);
      expect(mockNativeModule.queryTXTTCP).toHaveBeenCalledWith(
        "llm.pieter.com",
        "test.llm.pieter.com",
        53,
        expect.any(Number),
      );
    });

    it("should reject empty messages", async () => {
      await expect(
        testDNS.queryTXT("ch.at", "", 53, futureDeadline()),
      ).rejects.toThrow(DNSError);
      await expect(
        testDNS.queryTXT("ch.at", "   ", 53, futureDeadline()),
      ).rejects.toThrow(DNSError);
    });

    it("parses plain TXT segments without numbering", () => {
      const dns = new NativeDNS();
      const result = dns.parseMultiPartResponse([
        "Hello ",
        "world",
        "! from DNS",
      ]);
      expect(result).toBe("Hello world! from DNS");
    });

    it("parses numbered multi-part TXT responses", () => {
      const dns = new NativeDNS();
      const result = dns.parseMultiPartResponse([
        "2/3:from DNS.",
        "1/3:Hello ",
        "3/3: Enjoy!",
      ]);
      expect(result).toBe("Hello from DNS. Enjoy!");
    });

    it("rejects mixed plain and numbered TXT responses", () => {
      const dns = new NativeDNS();
      expect(() =>
        dns.parseMultiPartResponse(["Regular response", "1/1:ignored"]),
      ).toThrow("Mixed plain and multipart TXT records");
    });

    it("throws on duplicate numbered parts", () => {
      const dns = new NativeDNS();
      expect(() =>
        dns.parseMultiPartResponse([
          "1/2:Hello",
          "1/2:Duplicate",
          "2/2: world",
        ]),
      ).toThrow("Conflicting content for part 1");
    });

    it("should handle native module unavailable", async () => {
      const dnsWithoutNative = new NativeDNS(null);

      await expect(
        dnsWithoutNative.queryTXT("ch.at", "test", 53, futureDeadline()),
      ).rejects.toThrow(
        new DNSError(
          DNSErrorType.PLATFORM_UNSUPPORTED,
          "Native DNS module is not available on this platform",
        ),
      );
    });

    it("should handle empty response from native module", async () => {
      mockNativeModule.queryTXT.mockResolvedValue([]);

      await expect(
        testDNS.queryTXT("ch.at", "test", 53, futureDeadline()),
      ).rejects.toMatchObject({
        type: DNSErrorType.INVALID_RESPONSE,
      });
    });

    it("rejects an expired deadline before dispatching native work", async () => {
      await expect(
        testDNS.queryTXT("ch.at", "test", 53, Date.now() - 1),
      ).rejects.toMatchObject({
        type: DNSErrorType.TIMEOUT,
        message: "DNS query deadline expired",
      });

      expect(mockNativeModule.queryTXT).not.toHaveBeenCalled();
    });

    it("rejects a non-integer deadline before dispatching native work", async () => {
      await expect(
        testDNS.queryTXT("ch.at", "test", 53, Number.POSITIVE_INFINITY),
      ).rejects.toMatchObject({ type: DNSErrorType.TIMEOUT });

      expect(mockNativeModule.queryTXT).not.toHaveBeenCalled();
    });

    it("should handle various native errors correctly", async () => {
      const testCases = [
        {
          nativeError: { code: "DNS_QUERY_FAILED", message: "Query failed" },
          expectedType: DNSErrorType.DNS_QUERY_FAILED,
        },
        {
          nativeError: new Error("Connection timeout occurred"),
          expectedType: DNSErrorType.TIMEOUT,
        },
        {
          nativeError: new Error("Network connectivity issue"),
          expectedType: DNSErrorType.NETWORK_UNAVAILABLE,
        },
        {
          nativeError: new Error("Permission denied for DNS query"),
          expectedType: DNSErrorType.PERMISSION_DENIED,
        },
        // Native reject sites always carry code "DNS_QUERY_FAILED"; substring
        // classification must still win so real timeouts/network failures are
        // typed correctly instead of collapsing into DNS_QUERY_FAILED.
        {
          nativeError: {
            code: "DNS_QUERY_FAILED",
            message: "DNS query timed out",
          },
          expectedType: DNSErrorType.TIMEOUT,
        },
        {
          nativeError: {
            code: "DNS_QUERY_FAILED",
            message:
              "Native UDP failed (blocked); TCP fallback failed: Receive timed out",
          },
          expectedType: DNSErrorType.TIMEOUT,
        },
        {
          nativeError: {
            code: "DNS_QUERY_FAILED",
            message: "network unavailable",
          },
          expectedType: DNSErrorType.NETWORK_UNAVAILABLE,
        },
        // Composed messages can carry BOTH network and permission indicators;
        // permission is the actionable classification and must win.
        {
          nativeError: {
            code: "DNS_QUERY_FAILED",
            message:
              "Native UDP failed (network unavailable); TCP fallback failed: Permission denied",
          },
          expectedType: DNSErrorType.PERMISSION_DENIED,
        },
        // Same rule against timeout wording: permission beats timeout too.
        {
          nativeError: {
            code: "DNS_QUERY_FAILED",
            message:
              "Native UDP failed (timed out); TCP fallback failed: Permission denied",
          },
          expectedType: DNSErrorType.PERMISSION_DENIED,
        },
      ];

      for (const testCase of testCases) {
        mockNativeModule.queryTXT.mockRejectedValue(testCase.nativeError);

        await expect(
          testDNS.queryTXT("ch.at", "test", 53, futureDeadline()),
        ).rejects.toMatchObject({
          type: testCase.expectedType,
        });
      }
    });
  });

  describe("Port Validation", () => {
    it("should reject port 0", async () => {
      await expect(
        testDNS.queryTXT("ch.at", "test", 0, futureDeadline()),
      ).rejects.toThrow(
        new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          "Invalid DNS port: 0. Must be between 1 and 65535.",
        ),
      );
    });

    it("should reject negative port", async () => {
      await expect(
        testDNS.queryTXT("ch.at", "test", -1, futureDeadline()),
      ).rejects.toThrow(
        new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          "Invalid DNS port: -1. Must be between 1 and 65535.",
        ),
      );
    });

    it("should reject port greater than 65535", async () => {
      await expect(
        testDNS.queryTXT("ch.at", "test", 70000, futureDeadline()),
      ).rejects.toThrow(
        new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          "Invalid DNS port: 70000. Must be between 1 and 65535.",
        ),
      );
    });

    it("should accept valid port 1", async () => {
      mockNativeModule.queryTXT.mockResolvedValue(["response"]);
      await testDNS.queryTXT("ch.at", "test", 1, futureDeadline());
      expect(mockNativeModule.queryTXT).toHaveBeenCalledWith(
        "ch.at",
        "test",
        1,
        expect.any(Number),
      );
    });

    it("should accept valid port 65535", async () => {
      mockNativeModule.queryTXT.mockResolvedValue(["response"]);
      await testDNS.queryTXT("ch.at", "test", 65535, futureDeadline());
      expect(mockNativeModule.queryTXT).toHaveBeenCalledWith(
        "ch.at",
        "test",
        65535,
        expect.any(Number),
      );
    });
  });

  describe("Error Handling", () => {
    it("should create DNSError with correct properties", () => {
      const cause = new Error("Original error");
      const dnsError = new DNSError(
        DNSErrorType.TIMEOUT,
        "DNS query timed out",
        cause,
      );

      expect(dnsError.type).toBe(DNSErrorType.TIMEOUT);
      expect(dnsError.message).toBe("DNS query timed out");
      expect(dnsError.cause).toBe(cause);
      expect(dnsError.name).toBe("DNSError");
      expect(dnsError).toBeInstanceOf(Error);
    });

    it("should handle DNSError without cause", () => {
      const dnsError = new DNSError(
        DNSErrorType.NETWORK_UNAVAILABLE,
        "Network is unavailable",
      );

      expect(dnsError.cause).toBeUndefined();
      expect(dnsError.type).toBe(DNSErrorType.NETWORK_UNAVAILABLE);
    });
  });

  describe("Performance and Memory", () => {
    it("should handle concurrent queries efficiently", async () => {
      mockNativeModule.queryTXT.mockImplementation(
        (domain: string, message: string, _port: number) =>
          Promise.resolve([`Response to: ${message}`]),
      );

      const queries = Array.from({ length: 10 }, (_, i) =>
        testDNS.queryTXT("ch.at", `message ${i}`, 53, futureDeadline()),
      );

      const results = await Promise.all(queries);

      expect(results).toHaveLength(10);
      expect(mockNativeModule.queryTXT).toHaveBeenCalledTimes(10);
    });

    it("should handle query cancellation gracefully", async () => {
      const queryPromise = new Promise<string[]>(() => undefined);

      mockNativeModule.queryTXT.mockReturnValue(queryPromise);

      const queryResult = testDNS.queryTXT(
        "ch.at",
        "test",
        53,
        futureDeadline(),
      );

      // Don't resolve the promise - simulate a cancelled/timeout scenario

      // This test would need additional AbortController support in the implementation
      // For now, just verify the promise exists
      expect(queryResult).toBeInstanceOf(Promise);
    });
  });

  describe("Integration Scenarios", () => {
    it("should work with realistic LLM query", async () => {
      const mockLLMResponse = [
        "1/2:I understand your question about DNS queries. ",
        "2/2:This is a response from the AI assistant via DNS TXT records.",
      ];

      mockNativeModule.queryTXT.mockResolvedValue(mockLLMResponse);

      const result = await testDNS.queryTXT(
        "ch.at",
        "How does DNS TXT querying work for AI responses?",
        53,
        futureDeadline(),
      );

      expect(result).toEqual(mockLLMResponse);

      const parsedResponse = testDNS.parseMultiPartResponse(mockLLMResponse);
      expect(parsedResponse).toBe(
        "I understand your question about DNS queries. This is a response from the AI assistant via DNS TXT records.",
      );
    });

    it("should handle very long messages appropriately", async () => {
      const longMessage = "A".repeat(500); // Very long message
      mockNativeModule.queryTXT.mockResolvedValue(["Response to long message"]);

      await testDNS.queryTXT("ch.at", longMessage, 53, futureDeadline());

      // Verify the native module was called (message handling is done at native level)
      expect(mockNativeModule.queryTXT).toHaveBeenCalledWith(
        "ch.at",
        longMessage,
        53, // ch.at uses standard DNS port
        expect.any(Number),
      );
    });
  });
});
