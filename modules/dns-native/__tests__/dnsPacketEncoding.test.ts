import dnsPacket from "dns-packet";
import { DNSError, DNSErrorType, NativeDNS } from "../index";
import { sanitizeDNSMessageReference } from "../constants";

function composeDNSQueryName(label: string, dnsServer: string): string {
  const trimmedLabel = label.replace(/\.+$/g, "").trim();
  if (!trimmedLabel) {
    throw new Error("DNS label must be non-empty when composing query name");
  }

  const zone = dnsServer.replace(/\.+$/g, "").trim().toLowerCase();
  if (!zone) {
    throw new Error("DNS server must be non-empty when composing query name");
  }

  return `${trimmedLabel}.${zone}`;
}

describe("DNS packet compatibility", () => {
  it("encodes sanitized prompts as multi-label FQDNs", () => {
    const label = sanitizeDNSMessageReference("Hello Swift DNS");
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

  it("should parse single response correctly", () => {
    const native = new NativeDNS();
    const txtRecords = ["Hello world from AI"];
    const result = native.parseMultiPartResponse(txtRecords);
    expect(result).toBe("Hello world from AI");
  });

  it("should handle unordered multi-part response", () => {
    const native = new NativeDNS();
    const txtRecords = ["3/3:assistant!", "1/3:Hello ", "2/3:from AI "];
    const result = native.parseMultiPartResponse(txtRecords);
    expect(result).toBe("Hello from AI assistant!");
  });

  it("should handle incomplete multi-part response", () => {
    const native = new NativeDNS();
    const txtRecords = [
      "1/3:Hello ",
      "3/3:assistant!", // Missing part 2/3
    ];

    expect(() => native.parseMultiPartResponse(txtRecords)).toThrow(
      new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        "Incomplete multi-part response: got 2 parts, expected 3",
      ),
    );
  });

  it("should handle empty response", () => {
    const native = new NativeDNS();
    expect(() => native.parseMultiPartResponse([])).toThrow(
      new DNSError(DNSErrorType.INVALID_RESPONSE, "No TXT records to parse"),
    );
  });

  it("rejects responses that become empty after sanitization", () => {
    const native = new NativeDNS();
    const cases = [
      ["\u202E"],
      ["\u0000"],
      ["\u202E", "\u0000"],
      ["1/2:\u202E", "2/2:\u2066"],
    ];

    for (const txtRecords of cases) {
      expect(() => native.parseMultiPartResponse(txtRecords)).toThrow(
        new DNSError(DNSErrorType.INVALID_RESPONSE, "Received empty response"),
      );
    }
  });

  it("sanitizes non-empty plain and multipart responses before returning", () => {
    const native = new NativeDNS();
    expect(native.parseMultiPartResponse(["\u202Eresponse"])).toBe("response");
    expect(native.parseMultiPartResponse(["1/1:\u2066response"])).toBe(
      "response",
    );
  });

  it("rejects mixed plain and numbered TXT records", () => {
    const native = new NativeDNS();
    expect(() =>
      native.parseMultiPartResponse(["plain response", "1/1:part"]),
    ).toThrow("Mixed plain and multipart TXT records");
  });

  it("keeps Unicode input DNS-safe by folding diacritics", () => {
    const label = sanitizeDNSMessageReference("Água São Paulo");
    expect(label).toBe("agua-sao-paulo");

    const fqdn = composeDNSQueryName(label, "ch.at");
    expect(fqdn).toBe("agua-sao-paulo.ch.at");
  });
});
