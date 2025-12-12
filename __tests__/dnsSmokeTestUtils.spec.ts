/* eslint-disable @typescript-eslint/no-var-requires */

const {
  composeQueryName,
  resolveTargetFromArgs,
  sanitizeMessage,
} = require("../scripts/dnsSmokeTestUtils");

describe("dnsSmokeTestUtils", () => {
  describe("sanitizeMessage", () => {
    it("sanitizes a message into a DNS label", () => {
      expect(sanitizeMessage("Hello world")).toBe("hello-world");
      expect(sanitizeMessage("  Hello   world  ")).toBe("hello-world");
      expect(sanitizeMessage("Hello, world!")).toBe("hello-world");
    });

    it("rejects empty messages", () => {
      expect(() => sanitizeMessage("   ")).toThrow("Message cannot be empty");
    });

    it("rejects messages that become empty after sanitization", () => {
      expect(() => sanitizeMessage("!!!")).toThrow(
        "Message must contain at least one letter or number after sanitization"
      );
    });

    it("enforces max DNS label length (63)", () => {
      // 64 ASCII chars should exceed label max after sanitization.
      const message = "a".repeat(64);
      expect(() => sanitizeMessage(message)).toThrow("Message too long after sanitization");
    });
  });

  describe("composeQueryName", () => {
    it("composes label + zone and strips trailing dots", () => {
      expect(composeQueryName("hello", "ch.at")).toBe("hello.ch.at");
      expect(composeQueryName("hello.", "ch.at.")).toBe("hello.ch.at");
    });

    it("requires non-empty label and zone", () => {
      expect(() => composeQueryName("", "ch.at")).toThrow("DNS label must be non-empty");
      expect(() => composeQueryName("hello", "   ")).toThrow("DNS zone must be non-empty");
    });
  });

  describe("resolveTargetFromArgs", () => {
    it("defaults resolver + zone to ch.at", () => {
      expect(resolveTargetFromArgs({ resolverArg: null, zoneArg: null, portArg: null })).toEqual({
        resolverHost: "ch.at",
        resolverPort: 53,
        zone: "ch.at",
      });
    });

    it("supports resolver host:port shorthand", () => {
      expect(resolveTargetFromArgs({ resolverArg: "8.8.8.8:5353", zoneArg: "ch.at", portArg: null })).toEqual(
        {
          resolverHost: "8.8.8.8",
          resolverPort: 5353,
          zone: "ch.at",
        }
      );
    });

    it("prefers explicit --port over resolver shorthand port", () => {
      expect(resolveTargetFromArgs({ resolverArg: "8.8.8.8:5353", zoneArg: "ch.at", portArg: 53 })).toEqual(
        {
          resolverHost: "8.8.8.8",
          resolverPort: 53,
          zone: "ch.at",
        }
      );
    });

    it("keeps default zone when resolver is IP and zone not provided", () => {
      expect(resolveTargetFromArgs({ resolverArg: "8.8.8.8", zoneArg: null, portArg: null })).toEqual({
        resolverHost: "8.8.8.8",
        resolverPort: 53,
        zone: "ch.at",
      });
    });

    it("uses zone when resolver is a domain and zone not provided", () => {
      expect(resolveTargetFromArgs({ resolverArg: "dns.example.com", zoneArg: null, portArg: null })).toEqual(
        {
          resolverHost: "dns.example.com",
          resolverPort: 53,
          zone: "ch.at",
        }
      );
    });
  });
});
