import {
  parseTXTResponse,
  sanitizeDNSMessage,
  validateDNSMessage,
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

    it("throws on empty array", () => {
      expect(() => parseTXTResponse([])).toThrow("No TXT records to parse");
    });
  });

  describe("sanitizeDNSMessage / validateDNSMessage", () => {
    it("sanitizes message and enforces 63-char label limit", () => {
      const long = "A".repeat(100);
      const sanitized = sanitizeDNSMessage(long);
      expect(sanitized.length).toBe(63);
    });

    it("replaces control DNS chars with underscore", () => {
      const msg = "hello;you.there\\now";
      const sanitized = sanitizeDNSMessage(msg);
      expect(sanitized).toBe("hello_you_there_now");
    });

    it("normalizes whitespace and trims", () => {
      const msg = "   hello    world   ";
      const sanitized = sanitizeDNSMessage(msg);
      expect(sanitized).toBe("hello world");
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
        "Message contains invalid characters",
      );
    });
  });

  describe("getMethodOrder", () => {
    const getOrder = (DNSServiceModule as any).DNSService?.getMethodOrder?.bind(
      (DNSServiceModule as any).DNSService,
    );

    if (typeof getOrder !== "function") {
      it("exposes getMethodOrder for test via private access", () => {
        expect(typeof getOrder).toBe("function");
      });
      return;
    }

    it("native-first preference with Mock", () => {
      const order = getOrder("native-first", undefined, true);
      expect(order[0]).toBe("native");
      expect(order.includes("mock")).toBe(true);
    });

    it("udp-only without Mock", () => {
      const order = getOrder("udp-only", undefined, false);
      expect(order).toEqual(["udp"]);
    });

    it("never-https forbids https", () => {
      const order = getOrder("never-https", undefined, false);
      expect(order.includes("https")).toBe(false);
    });

    it("prefer-https starts with https", () => {
      const order = getOrder("prefer-https", undefined, false);
      expect(order[0]).toBe("https");
    });

    it("automatic respects preferHttps flag", () => {
      const httpsFirst = getOrder("automatic", true, false);
      const normal = getOrder("automatic", false, false);
      expect(httpsFirst[0]).toBe("https");
      expect(normal[0] === "native" || normal[0] === "https").toBe(true);
    });
  });
});
