import {
  parseTXTResponse,
  sanitizeDNSMessage,
  validateDNSMessage,
  validateDNSServer,
  composeDNSQueryName,
  generateSecureDNSId,
} from "../src/services/dnsService";
import { sanitizeDNSMessageReference } from "../modules/dns-native/constants";

// Access private methods for test via any-cast
import * as DNSServiceModule from "../src/services/dnsService";

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

    it("throws on incomplete multi-part response", () => {
      const input = ["1/3:Hello ", "3/3:assistant!"];
      expect(() => parseTXTResponse(input)).toThrow(
        "Incomplete multi-part response: got 2 parts, expected 3",
      );
    });

    it("prefers plain record when mixed with multipart", () => {
      const input = ["Regular response without part format", "2/2:ignored"];
      const result = parseTXTResponse(input);
      expect(result).toBe("Regular response without part format");
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
      const smiley = String.fromCodePoint(0x1F642);
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

        try {
          tsValue = sanitizeDNSMessage(input);
        } catch (error) {
          // If TS rejects, native must reject with the same contract.
          expect(() => sanitizeDNSMessageReference(input)).toThrow();
          continue;
        }

        nativeValue = sanitizeDNSMessageReference(input);
        expect(tsValue).toBe(nativeValue);
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
      expect(fqdn).toBe("test.ch.at");
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
      expect(() => validateDNSServer("example.com")).toThrow("DNS server not allowed");
      expect(() => validateDNSServer("dns.google")).toThrow("DNS server not allowed");
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
    const rawGetOrder = (DNSServiceModule as any).DNSService?.getMethodOrder?.bind(
      (DNSServiceModule as any).DNSService,
    );

    const getOrder = (
      enableMock: boolean | undefined,
      allowExperimental: boolean = true,
    ) =>
      rawGetOrder?.(enableMock, allowExperimental);

    if (typeof rawGetOrder !== "function") {
      it("exposes getMethodOrder for test via private access", () => {
        expect(typeof rawGetOrder).toBe("function");
      });
      return;
    }

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

    it("never includes https (removed in v3.0.0)", () => {
      const orderWithExperimental = getOrder(false, true);
      const orderWithoutExperimental = getOrder(false, false);
      const orderWithMock = getOrder(true, true);

      expect(orderWithExperimental.includes("https" as any)).toBe(false);
      expect(orderWithoutExperimental.includes("https" as any)).toBe(false);
      expect(orderWithMock.includes("https" as any)).toBe(false);
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
        if (ids[i] === ids[i - 1] + 1 || ids[i] === ids[i - 1] - 1) {
          sequentialCount++;
        }
      }
      // Allow at most 2 sequential pairs by chance in 10 samples
      expect(sequentialCount).toBeLessThanOrEqual(2);
    });
  });
});
