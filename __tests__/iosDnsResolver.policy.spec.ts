import fs from "node:fs";

describe("iOS DNSResolver native policy", () => {
  const source = fs.readFileSync("modules/dns-native/ios/DNSResolver.swift", "utf8");

  it("rejects invalid bridge ports before converting to UInt16", () => {
    expect(source).toContain("let requestedPort = port.intValue");
    expect(source).toContain("requestedPort >= 1 && requestedPort <= Int(UInt16.max)");
    expect(source).toContain("let dnsPort = UInt16(requestedPort)");
    expect(source).not.toContain("port.uint16Value > 0 ? port.uint16Value");
  });

  it("validates TXT answer owner name and class before accepting record data", () => {
    expect(source).toContain("let (answerName, answerOffset) = try readName(bytes: bytes, offset: offset)");
    expect(source).toContain("let answerClass = Int(bytes[offset]) << 8 | Int(bytes[offset + 1])");
    expect(source).toContain("answerClass == 1 && answerName == expectedQueryName");
  });

  it("keeps native iOS DNS resilient with UDP-only, TCP-only, and UDP-then-TCP fallback paths", () => {
    expect(source).toContain("enum NativeTransport");
    expect(source).toContain("case udpOnly");
    expect(source).toContain("case tcpOnly");
    expect(source).toContain("case udpThenTCP");
    expect(source).toContain("performTCPQuery(server: server, queryName: queryName, port: port)");
    expect(source).toContain("withTimeout(seconds: Self.udpAttemptTimeout)");
    expect(source).toContain("withTimeout(seconds: Self.tcpAttemptTimeout)");
    expect(source).toContain("Native UDP blocked or timed out");
  });

  it("cleans up native TCP connections on every success and error path", () => {
    const functionStart = source.indexOf("nonisolated private func performTCPQueryInternal");
    const functionEnd = source.indexOf("@available(iOS 16.0, *)", functionStart + 1);
    const functionBody = source.slice(functionStart, functionEnd);

    expect(functionBody).toContain("defer {");
    expect(functionBody).toContain("connection.stateUpdateHandler = nil");
    expect(functionBody).toContain("connection.cancel()");
  });
});
