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
});
