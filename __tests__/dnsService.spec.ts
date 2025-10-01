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
      preference: any,
      preferHttps?: boolean,
      enableMock?: boolean,
      allowExperimental: boolean = true,
    ) =>
      rawGetOrder?.(preference, preferHttps, enableMock, allowExperimental);

    if (typeof rawGetOrder !== "function") {
      it("exposes getMethodOrder for test via private access", () => {
        expect(typeof rawGetOrder).toBe("function");
      });
      return;
    }

    it("native-first preference with Mock", () => {
      const order = getOrder("native-first", undefined, true);
      expect(order[0]).toBe("native");
      expect(order.includes("mock")).toBe(true);
    });

    it("udp-only without Mock", () => {
      const order = getOrder("udp-only", undefined, false, true);
      expect(order).toEqual(["udp"]);
    });

    it("never-https forbids https", () => {
      const order = getOrder("never-https", undefined, false, true);
      expect(order.includes("https")).toBe(false);
    });

    it("prefer-https starts with https", () => {
      const order = getOrder("prefer-https", undefined, false, true);
      expect(order[0]).toBe("https");
    });

    it("automatic prefers native when experimental transports enabled", () => {
      const order = getOrder("automatic", false, false, true);
      expect(order).toEqual(["native", "udp", "tcp", "https"]);
    });

    it("automatic prefers https when privacy flag set", () => {
      const order = getOrder("automatic", true, false, true);
      expect(order).toEqual(["https", "native", "udp", "tcp"]);
    });

    it("mock appended when enabled", () => {
      const order = getOrder("native-first", false, true, true);
      expect(order[order.length - 1]).toBe("mock");
    });

    it("honors native-only mode when experimental disabled", () => {
      const order = getOrder("udp-only", undefined, false, false);
      expect(order).toEqual(["native"]);
    });
  });
});
