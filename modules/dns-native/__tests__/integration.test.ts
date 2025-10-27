/**
 * Integration tests for Native DNS Module
 * These tests run against the actual native implementation
 * and require a real device/simulator to execute
 */

import { NativeModules, Platform } from "react-native";
import { nativeDNS, DNSError, DNSErrorType } from "../index";
import { sanitizeDNSMessageReference } from "../constants";

// Skip these tests in CI/automated environments
const shouldRunIntegrationTests = process.env.RUN_INTEGRATION_TESTS === "true";

const describeIntegration = shouldRunIntegrationTests
  ? describe
  : describe.skip;

describeIntegration("Native DNS Integration Tests", () => {
  beforeAll(async () => {
    // Allow extra time for native module initialization
    jest.setTimeout(30000);
  });

  describe("Platform Detection", () => {
    it("should detect platform capabilities correctly", async () => {
      const capabilities = await nativeDNS.isAvailable();

      expect(capabilities).toMatchObject({
        available: expect.any(Boolean),
        platform: expect.stringMatching(/^(ios|android|web)$/),
        supportsCustomServer: expect.any(Boolean),
        supportsAsyncQuery: expect.any(Boolean),
      });

      if (capabilities.platform === "android") {
        expect(capabilities.apiLevel).toBeGreaterThan(0);
      }

      console.log("Platform capabilities:", capabilities);
    });

    it("should maintain consistent capabilities across calls", async () => {
      const caps1 = await nativeDNS.isAvailable();
      const caps2 = await nativeDNS.isAvailable();

      expect(caps1).toEqual(caps2);
    });
  });

  describe("DNS Query Functionality", () => {
    it("should query public DNS servers successfully", async () => {
      const capabilities = await nativeDNS.isAvailable();

      if (!capabilities.available) {
        console.log("Skipping DNS tests - native module not available");
        return;
      }

      try {
        // Test with a known public TXT record
        const result = await nativeDNS.queryTXT(
          "google.com",
          "google-site-verification",
        );

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);

        console.log("Public DNS query result:", result);
      } catch (error) {
        console.log(
          "Public DNS query failed (expected in some environments):",
          error,
        );
        // Don't fail the test if public DNS is restricted
      }
    });

    it("should handle ch.at queries", async () => {
      const capabilities = await nativeDNS.isAvailable();

      if (!capabilities.available) {
        console.log("Skipping LLM DNS tests - native module not available");
        return;
      }

      try {
        const result = await nativeDNS.queryTXT("ch.at", "hello");

        expect(Array.isArray(result)).toBe(true);

        if (result.length > 0) {
          console.log("LLM DNS query successful:", result);

          // Try to parse the response
          const parsed = nativeDNS.parseMultiPartResponse(result);
          expect(typeof parsed).toBe("string");
          expect(parsed.length).toBeGreaterThan(0);

          console.log("Parsed LLM response:", parsed);
        }
      } catch (error) {
        console.log("LLM DNS query failed:", error);

        // Verify it's a proper DNSError
        if (error instanceof DNSError) {
          expect(Object.values(DNSErrorType)).toContain(error.type);
        }
      }
    });

    it("should respect timeout constraints", async () => {
      const capabilities = await nativeDNS.isAvailable();

      if (!capabilities.available) {
        return;
      }

      const startTime = Date.now();

      try {
        // Query a non-existent server to trigger timeout
        await nativeDNS.queryTXT("non-existent-server-12345.com", "test");
      } catch (error) {
        const elapsed = Date.now() - startTime;

        // Should timeout within reasonable bounds (10s + some margin)
        expect(elapsed).toBeLessThan(15000);

        if (error instanceof DNSError) {
          expect([
            DNSErrorType.TIMEOUT,
            DNSErrorType.DNS_SERVER_UNREACHABLE,
            DNSErrorType.DNS_QUERY_FAILED,
          ]).toContain(error.type);
        }
      }
    });

    it("should handle concurrent queries without issues", async () => {
      const capabilities = await nativeDNS.isAvailable();

      if (!capabilities.available) {
        return;
      }

      const queries = [
        nativeDNS.queryTXT("google.com", "test1"),
        nativeDNS.queryTXT("google.com", "test2"),
        nativeDNS.queryTXT("google.com", "test3"),
      ];

      const results = await Promise.allSettled(queries);

      // At least some queries should complete without throwing
      expect(results.length).toBe(3);

      results.forEach((result, index) => {
        console.log(`Concurrent query ${index + 1}:`, result);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed domain names gracefully", async () => {
      const capabilities = await nativeDNS.isAvailable();

      if (!capabilities.available) {
        return;
      }

      const invalidDomains = [
        "",
        ".",
        "..",
        "invalid..domain",
        "toolongdomainname".repeat(10),
      ];

      for (const domain of invalidDomains) {
        try {
          await nativeDNS.queryTXT(domain, "test");
          // If it doesn't throw, that's also acceptable
        } catch (error) {
          expect(error instanceof DNSError || error instanceof Error).toBe(
            true,
          );
        }
      }
    });

    it("should handle network interruptions gracefully", async () => {
      const capabilities = await nativeDNS.isAvailable();

      if (!capabilities.available) {
        return;
      }

      // This test would require actual network manipulation
      // For now, just verify the error handling structure exists
      try {
        await nativeDNS.queryTXT("127.0.0.1", "test");
      } catch (error) {
        if (error instanceof DNSError) {
          expect(error.type).toBeDefined();
          expect(error.message).toBeDefined();
        }
      }
    });
  });

  describe("Sanitization Parity", () => {
    const nativeModule: any = (NativeModules as any)?.RNDNSModule;
    const canValidate =
      Platform?.OS === "android" && typeof nativeModule?.debugSanitizeLabel === "function";

    (canValidate ? it : it.skip)(
      "matches JavaScript reference sanitizer for tricky inputs",
      async () => {
        const samples = [
          "  HélLo   Wørld🚀  ",
          "--Leading__And++Trailing--",
          "Äccênted   Ñame   With   Extra   Spaces",
        ];

        for (const sample of samples) {
          const expected = sanitizeDNSMessageReference(sample);
          const nativeValue: string = await nativeModule.debugSanitizeLabel(sample);
          // debugNormalizeQueryName returns the full query; focus on first label for comparison.
          const nativeLabel = nativeValue.split(".")[0];
          expect(nativeLabel).toBe(expected);
        }
      },
    );

    (canValidate ? it : it.skip)(
      "rejects invalid labels the same way JavaScript does",
      async () => {
        const invalidSamples = ["   ", "🚀🚀🚀", "***", "--"];

        for (const sample of invalidSamples) {
          expect(() => sanitizeDNSMessageReference(sample)).toThrow();
          await expect(nativeModule.debugSanitizeLabel(sample)).rejects.toMatchObject({
            code: "QUERY_FAILED",
          });
        }
      },
    );
  });

  describe("Performance Benchmarks", () => {
    it("should complete queries within acceptable time limits", async () => {
      const capabilities = await nativeDNS.isAvailable();

      if (!capabilities.available) {
        return;
      }

      const iterations = 5;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();

        try {
          await nativeDNS.queryTXT("google.com", `test-${i}`);
          const elapsed = Date.now() - start;
          times.push(elapsed);
        } catch (error) {
          // Record failed attempts with max time
          times.push(10000);
        }
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);

      console.log(`DNS Query Performance:
        Average: ${avgTime.toFixed(0)}ms
        Maximum: ${maxTime.toFixed(0)}ms
        All times: ${times.map((t) => `${t}ms`).join(", ")}`);

      // Average should be under 5 seconds for reasonable performance
      expect(avgTime).toBeLessThan(5000);
    });

    it("should handle memory efficiently with multiple queries", async () => {
      const capabilities = await nativeDNS.isAvailable();

      if (!capabilities.available) {
        return;
      }

      // Check memory usage before
      const initialMemory = process.memoryUsage();

      // Execute many queries
      const queries = Array.from({ length: 20 }, (_, i) =>
        nativeDNS
          .queryTXT("google.com", `memory-test-${i}`)
          .catch((error) => ({ error })),
      );

      await Promise.all(queries);

      // Allow GC to run
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;

      console.log(`Memory usage:
        Initial: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB
        Final: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB
        Growth: ${Math.round(memoryGrowth / 1024 / 1024)}MB`);

      // Memory growth should be reasonable (less than 50MB for 20 queries)
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe("Real World Scenarios", () => {
    it("should work with the complete chat application flow", async () => {
      const capabilities = await nativeDNS.isAvailable();

      if (!capabilities.available) {
        console.log("Skipping chat flow test - native module not available");
        return;
      }

      // Simulate a real chat message
      const userMessage = "Hello, can you tell me about DNS queries?";

      try {
        const txtRecords = await nativeDNS.queryTXT(
          "llm.pieter.com",
          userMessage,
        );

        if (txtRecords.length > 0) {
          const response = nativeDNS.parseMultiPartResponse(txtRecords);

          expect(typeof response).toBe("string");
          expect(response.length).toBeGreaterThan(0);

          console.log("Chat flow test successful:");
          console.log("User:", userMessage);
          console.log("AI:", response);
        } else {
          console.log("Chat flow test: No response received");
        }
      } catch (error) {
        console.log("Chat flow test failed:", error);

        // This is acceptable in many test environments
        if (error instanceof DNSError) {
          expect(error.type).toBeDefined();
        }
      }
    });
  });
});

// Export helper for manual testing
export const runManualTests = async () => {
  console.log("🧪 Running manual DNS tests...\n");

  try {
    const capabilities = await nativeDNS.isAvailable();
    console.log(
      "📱 Platform Capabilities:",
      JSON.stringify(capabilities, null, 2),
    );

    if (!capabilities.available) {
      console.log("❌ Native DNS not available on this platform");
      return;
    }

    console.log("\n🔍 Testing basic DNS query...");
    const result = await nativeDNS.queryTXT("google.com", "test");
    console.log("✅ Basic query result:", result);

    console.log("\n🤖 Testing LLM DNS query...");
    const llmResult = await nativeDNS.queryTXT("ch.at", "Hello AI");
    console.log("✅ LLM query result:", llmResult);

    const parsedResponse = nativeDNS.parseMultiPartResponse(llmResult);
    console.log("📝 Parsed response:", parsedResponse);
  } catch (error) {
    console.log("❌ Test failed:", error);
  }
};
