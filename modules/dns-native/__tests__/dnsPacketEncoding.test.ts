import dnsPacket from "dns-packet";
import { composeDNSQueryName, sanitizeDNSMessage } from "../../../src/services/dnsService";
import { NativeDNS } from "../index";

describe("DNS packet compatibility", () => {
  it("encodes sanitized prompts as multi-label FQDNs", () => {
    const label = sanitizeDNSMessage("Hello Swift DNS");
    const queryName = composeDNSQueryName(label, "ch.at");

    expect(queryName).toBe("hello-swift-dns.ch.at");

    const encoded = dnsPacket.encode({
      type: "query",
      id: 0x1234,
      flags: dnsPacket.RECURSION_DESIRED,
      questions: [
        {
          type: "TXT",
          name: queryName,
        },
      ],
    });

    const headerLength = 12;
    let offset = headerLength;

    const firstLabelLength = encoded[offset];
    if (firstLabelLength === undefined) {
      throw new Error("Missing first label length");
    }
    const firstLabel = Buffer.from(
      encoded.slice(offset + 1, offset + 1 + firstLabelLength),
    ).toString("ascii");
    expect(firstLabel).toBe(label);

    offset += 1 + firstLabelLength;

    const secondLabelLength = encoded[offset];
    if (secondLabelLength === undefined) {
      throw new Error("Missing second label length");
    }
    const secondLabel = Buffer.from(
      encoded.slice(offset + 1, offset + 1 + secondLabelLength),
    ).toString("ascii");
    expect(secondLabel).toBe("ch");

    offset += 1 + secondLabelLength;

    const thirdLabelLength = encoded[offset];
    if (thirdLabelLength === undefined) {
      throw new Error("Missing third label length");
    }
    const thirdLabel = Buffer.from(
      encoded.slice(offset + 1, offset + 1 + thirdLabelLength),
    ).toString("ascii");
    expect(thirdLabel).toBe("at");
  });

  it("parses multi-chunk TXT payloads over 255 bytes", () => {
    const native = new NativeDNS();

    const chunkA = "a".repeat(255);
    const chunkB = "b".repeat(64);
    const result = native.parseMultiPartResponse([chunkA, chunkB]);

    expect(result.length).toBe(319);
    expect(result.startsWith("a".repeat(200))).toBe(true);
    expect(result.endsWith("b".repeat(10))).toBe(true);
  });

  it("parses numbered TXT responses spanning multiple records", () => {
    const native = new NativeDNS();

    const payload = "x".repeat(300);
    const first = `1/2:${payload.slice(0, 200)}`;
    const second = `2/2:${payload.slice(200)}`;

    const result = native.parseMultiPartResponse([first, second]);

    expect(result).toBe(payload);
  });

  it("ignores duplicate numbered parts when payload matches", () => {
    const native = new NativeDNS();
    const payload = "duplicate-check";
    const part = `1/1:${payload}`;

    const result = native.parseMultiPartResponse([part, part]);
    expect(result).toBe(payload);
  });

  it("throws on conflicting duplicate numbered parts", () => {
    const native = new NativeDNS();

    expect(() =>
      native.parseMultiPartResponse(["1/2:hello", "1/2:hola", "2/2:world"]),
    ).toThrow(/Conflicting content/);
  });

  it("keeps Unicode input DNS-safe by folding diacritics", () => {
    const label = sanitizeDNSMessage("Água São Paulo");
    expect(label).toBe("agua-sao-paulo");

    const fqdn = composeDNSQueryName(label, "ch.at");
    expect(fqdn).toBe("agua-sao-paulo.ch.at");
  });
});
