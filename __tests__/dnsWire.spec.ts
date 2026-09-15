import { Buffer } from "buffer";
import {
  createTcpTxtDnsQueryFrame,
  decodeDnsPacket,
  encodeTxtDnsQuery,
  extractTxtRecordsFromDecodedResponse,
  readTcpFrameLength,
  validateDecodedDnsResponseForTxt,
  type BufferFactory,
} from "../src/services/dnsWire";
import type { DecodedPacket } from "dns-packet";
import * as dns from "dns-packet";

const bufferFactory = Buffer as unknown as BufferFactory;
const baseDecodedResponse = (): DecodedPacket =>
  ({
    id: 1111,
    type: "response",
    flags: 0x8100,
    rcode: "NOERROR",
    questions: [{ name: "hello.ch.at", type: "TXT", class: "IN" }],
    answers: [{ name: "hello.ch.at", type: "TXT", class: "IN", data: ["ok"] }],
  }) as unknown as DecodedPacket;

const validationOptions = {
  expectedQueryId: 1111,
  expectedQueryName: "hello.ch.at",
  expectedPort: 53,
  expectedServer: "ch.at",
};

describe("DNS wire helpers", () => {
  it("encodes TXT queries through one reusable wire interface", () => {
    const query = encodeTxtDnsQuery("hello.ch.at", 1234);
    const decoded = decodeDnsPacket(query, bufferFactory);

    expect(decoded.id).toBe(1234);
    expect(decoded.type).toBe("query");
    expect(decoded.questions).toEqual([
      {
        name: "hello.ch.at",
        type: "TXT",
        class: "IN",
      },
    ]);
  });

  it.each([
    ["a 63-byte label", `${"a".repeat(63)}.ch.at`],
    ["a long multi-label name", `${"a".repeat(63)}.${"b".repeat(57)}.ch.at`],
    [
      "a 120-character query prefix",
      `${"x".repeat(60)}.${"y".repeat(60)}.ch.at`,
    ],
  ])("round-trips %s", (_label, queryName) => {
    const query = encodeTxtDnsQuery(queryName, 2222);
    const decoded = decodeDnsPacket(query, bufferFactory);

    expect(decoded.id).toBe(2222);
    expect(decoded.questions?.[0]?.name).toBe(queryName);
  });

  it("rejects labels longer than the DNS 63-byte label limit", () => {
    expect(() => encodeTxtDnsQuery(`${"a".repeat(64)}.ch.at`, 2222)).toThrow(
      "DNS label exceeds 63 bytes: 64",
    );
  });

  it("frames DNS-over-TCP queries with the RFC length prefix", () => {
    const frame = createTcpTxtDnsQueryFrame("hello.ch.at", 4321, bufferFactory);
    const expectedLength = readTcpFrameLength(frame);
    const payload = frame.slice(2);
    const decoded = decodeDnsPacket(payload, bufferFactory);

    expect(expectedLength).toBe(payload.length);
    expect(decoded.id).toBe(4321);
    expect(decoded.questions?.[0]?.name).toBe("hello.ch.at");
  });

  it("validates a TXT response and extracts records in one step", () => {
    const decoded = {
      id: 1111,
      type: "response",
      flags: 0x8100,
      rcode: "NOERROR",
      questions: [{ name: "hello.ch.at", type: "TXT", class: "IN" }],
      answers: [
        { name: "hello.ch.at", type: "TXT", class: "IN", data: ["hello "] },
        {
          name: "hello.ch.at",
          type: "TXT",
          class: "IN",
          data: Buffer.from("world"),
        },
      ],
    } as unknown as import("dns-packet").DecodedPacket;

    expect(
      extractTxtRecordsFromDecodedResponse(
        decoded,
        {
          expectedQueryId: 1111,
          expectedQueryName: "hello.ch.at",
          expectedPort: 53,
          expectedServer: "ch.at",
        },
        bufferFactory,
      ),
    ).toEqual(["hello ", "world"]);
  });

  it("ignores TXT answers whose owner name or class does not match the original query", () => {
    const decoded = {
      id: 1111,
      type: "response",
      flags: 0x8100,
      rcode: "NOERROR",
      questions: [{ name: "hello.ch.at", type: "TXT", class: "IN" }],
      answers: [
        { name: "other.ch.at", type: "TXT", class: "IN", data: ["wrong-name"] },
        {
          name: "hello.ch.at",
          type: "TXT",
          class: "CH",
          data: ["wrong-class"],
        },
        { name: "hello.ch.at", type: "TXT", class: "IN", data: ["ok"] },
      ],
    } as unknown as import("dns-packet").DecodedPacket;

    expect(
      extractTxtRecordsFromDecodedResponse(
        decoded,
        {
          expectedQueryId: 1111,
          expectedQueryName: "hello.ch.at",
          expectedPort: 53,
          expectedServer: "ch.at",
        },
        bufferFactory,
      ),
    ).toEqual(["ok"]);
  });

  it("rejects responses with no matching TXT answers", () => {
    const decoded = {
      id: 1111,
      type: "response",
      flags: 0x8100,
      rcode: "NOERROR",
      questions: [{ name: "hello.ch.at", type: "TXT", class: "IN" }],
      answers: [
        { name: "other.ch.at", type: "TXT", class: "IN", data: ["wrong-name"] },
      ],
    } as unknown as import("dns-packet").DecodedPacket;

    expect(() =>
      extractTxtRecordsFromDecodedResponse(
        decoded,
        {
          expectedQueryId: 1111,
          expectedQueryName: "hello.ch.at",
          expectedPort: 53,
          expectedServer: "ch.at",
        },
        bufferFactory,
      ),
    ).toThrow("No matching TXT records found");
  });

  it.each([
    ["ID mismatch", { id: 2222 }, "DNS response ID mismatch"],
    [
      "missing QR flag",
      { type: "query", flags: 0, flag_qr: false },
      "DNS response missing QR flag",
    ],
    [
      "non-standard opcode",
      { opcode: "IQUERY" },
      "DNS response opcode not standard query",
    ],
    ["truncated response", { flag_tc: true }, "DNS response truncated (TC=1)"],
    [
      "error rcode",
      { rcode: "SERVFAIL" },
      "DNS query failed with rcode: SERVFAIL",
    ],
    ["wrong QDCOUNT", { questions: [] }, "DNS response QDCOUNT=0"],
  ])("rejects %s", (_label, packetUpdates, expectedError) => {
    const decoded = {
      ...baseDecodedResponse(),
      ...packetUpdates,
    } as unknown as DecodedPacket;

    expect(() =>
      validateDecodedDnsResponseForTxt(decoded, validationOptions),
    ).toThrow(expectedError);
  });
  describe("TXT character-strings split inside a UTF-8 sequence", () => {
    // RFC 1035 caps a character-string at 255 bytes, and a server may cut a long
    // answer at any byte, so a multibyte character can straddle two strings of
    // one RR. These packets go through the real dns-packet encoder and decoder.
    const queryName = "hello.llm.pieter.com";
    const extractFromChunks = (chunks: Buffer[]): string[] => {
      const packet = dns.encode({
        id: 42,
        type: "response",
        flags: dns.RECURSION_DESIRED,
        questions: [{ type: "TXT", class: "IN", name: queryName }],
        answers: [
          { type: "TXT", class: "IN", name: queryName, ttl: 1, data: chunks },
        ],
      } as unknown as Parameters<typeof dns.encode>[0]);
      const decoded = decodeDnsPacket(new Uint8Array(packet), bufferFactory);
      return extractTxtRecordsFromDecodedResponse(
        decoded,
        {
          expectedQueryId: 42,
          expectedQueryName: queryName,
          expectedPort: 53,
          expectedServer: "llm.pieter.com",
        },
        bufferFactory,
      );
    };
    const splitAt = (text: string, index: number): Buffer[] => {
      const bytes = Buffer.from(text, "utf8");
      return [bytes.subarray(0, index), bytes.subarray(index)];
    };

    it("decodes a 2-byte character whose bytes land in adjacent strings", () => {
      const text = `${"a".repeat(254)}\u00e7\u00e3o`;
      // Byte 254 is the lead byte of U+00E7; byte 255 starts the next string.
      expect(extractFromChunks(splitAt(text, 255))).toEqual([text]);
    });

    it("decodes a 4-byte emoji split two bytes into the next string", () => {
      const text = `${"b".repeat(253)}\u{1F600} ok`;
      expect(extractFromChunks(splitAt(text, 255))).toEqual([text]);
    });

    it("keeps U+FFFD replacement for bytes that are not valid UTF-8", () => {
      // JS transports stay lenient: invalid input decodes to U+FFFD rather than
      // failing the query, including an incomplete sequence at the end of the RR.
      expect(
        extractFromChunks([
          Buffer.from([0x61, 0xc3, 0x28]),
          Buffer.from([0x62, 0xc3]),
        ]),
      ).toEqual(["a\ufffd(b\ufffd"]);
    });
  });
});
