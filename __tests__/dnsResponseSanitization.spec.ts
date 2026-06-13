import {
  sanitizeLLMResponseText,
  parseMultiPartTXTResponse,
  DNSError,
  DNSErrorType,
} from "../modules/dns-native";
import { DNS_CONSTANTS } from "../modules/dns-native/constants";
import { parseTXTResponse } from "../src/services/dnsService";

describe("sanitizeLLMResponseText", () => {
  it("strips C0 control characters but keeps newline and tab", () => {
    expect(sanitizeLLMResponseText("a\u0001b\u0007c\u001bd")).toBe("abcd");
    expect(sanitizeLLMResponseText("line1\nline2\tend")).toBe("line1\nline2\tend");
    expect(sanitizeLLMResponseText("a\rb")).toBe("ab");
    expect(sanitizeLLMResponseText("a\u0000b\u000bc")).toBe("abc");
  });

  it("strips C1 control characters", () => {
    expect(sanitizeLLMResponseText("a\u0080b\u009bc\u009fd")).toBe("abcd");
  });

  it("strips Unicode bidirectional control characters", () => {
    // U+202A..U+202E (LRE/RLE/PDF/LRO/RLO) and U+2066..U+2069 (LRI/RLI/FSI/PDI)
    expect(
      sanitizeLLMResponseText("a\u202ab\u202ec\u2066d\u2069e"),
    ).toBe("abcde");
  });

  it("leaves plain multilingual text untouched", () => {
    const text = "Olá! Здравствуйте — مرحبا 你好 :) 100% safe";
    expect(sanitizeLLMResponseText(text)).toBe(text);
  });
});

describe("multipart totalParts cap (MAX_TXT_PARTS)", () => {
  it("exposes the cap in DNS_CONSTANTS", () => {
    expect(DNS_CONSTANTS.MAX_TXT_PARTS).toBe(64);
  });

  it("rejects absurd declared totals deliberately instead of via RangeError", () => {
    expect(() => parseMultiPartTXTResponse(["1/999999999999999:boom"])).toThrow(
      /exceeding the maximum of 64/,
    );
  });

  it("throws DNSError(INVALID_RESPONSE) from the canonical parser", () => {
    try {
      parseMultiPartTXTResponse(["1/65:a"]);
      throw new Error("expected parseMultiPartTXTResponse to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(DNSError);
      expect((error as DNSError).type).toBe(DNSErrorType.INVALID_RESPONSE);
    }
  });

  it("still accepts sets at the cap boundary", () => {
    const records = Array.from({ length: 64 }, (_, i) => `${i + 1}/64:p${i + 1};`);
    const parsed = parseMultiPartTXTResponse(records);
    expect(parsed.startsWith("p1;p2;")).toBe(true);
    expect(parsed.endsWith("p64;")).toBe(true);
  });

  it("propagates the cap through dnsService.parseTXTResponse as a plain Error", () => {
    try {
      parseTXTResponse(["1/999999999999999:boom"]);
      throw new Error("expected parseTXTResponse to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).not.toBeInstanceOf(DNSError);
      expect((error as Error).message).toMatch(/exceeding the maximum of 64/);
    }
  });
});

describe("sanitization applied at the parse choke point", () => {
  it("sanitizes single-record responses", () => {
    expect(parseMultiPartTXTResponse(["hi there\u202e\u0007"])).toBe("hi there");
  });

  it("sanitizes assembled multipart responses", () => {
    expect(
      parseMultiPartTXTResponse(["1/2:hello\u0000 ", "2/2:world\u009c"]),
    ).toBe("hello world");
  });

  it("sanitizes via dnsService.parseTXTResponse (UDP/TCP path)", () => {
    expect(parseTXTResponse(["safe\u001b[31mred"])).toBe("safe[31mred");
  });
});
