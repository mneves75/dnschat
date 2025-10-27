import {
  parseTXTResponse,
  sanitizeDNSMessage,
  validateDNSMessage,
  composeDNSQueryName,
} from "../src/services/dnsService";

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
      expect(() => sanitizeDNSMessage("!!!")).toThrow(
        "Message must contain at least one letter or number after sanitization",
      );
      expect(() => sanitizeDNSMessage("🙂🙂")).toThrow(
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
});
