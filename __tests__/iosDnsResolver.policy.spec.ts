import fs from "node:fs";

describe("iOS DNSResolver native policy", () => {
  const source = fs.readFileSync(
    "modules/dns-native/ios/DNSResolver.swift",
    "utf8",
  );

  it("pins the bridge port to 53 and rejects anything else", () => {
    // Stricter than a 1...65535 range check: JS only ever sends 53 (every
    // DNS_SERVERS entry uses it and validateDNSServer rejects "host:port"),
    // so a non-53 port can only come from a tampered bundle aiming an
    // allowlisted host at another service.
    expect(source).toContain("private static let allowedDnsPort: UInt16 = 53");
    expect(source).toContain("let requestedPort = port.intValue");
    expect(source).toContain(
      "guard requestedPort == Int(Self.allowedDnsPort) else {",
    );
    expect(source).toContain("let dnsPort = Self.allowedDnsPort");
    // The rejected shapes: the old permissive range check and the even older
    // silent uint16 coercion must both stay gone.
    expect(source).not.toContain(
      "requestedPort >= 1 && requestedPort <= Int(UInt16.max)",
    );
    expect(source).not.toContain("port.uint16Value > 0 ? port.uint16Value");
  });

  it("pins every query to one label under the selected resolver's zone", () => {
    // Android asserts this in androidDnsResolver.policy.spec.ts; iOS had the
    // guard but no gate, so it could have been deleted silently. The label cap
    // is part of the contract: both platforms must reject an over-long label,
    // or the same tampered bundle behaves differently per OS.
    expect(source).toContain(
      "guard Self.isQueryName(queryName, inZone: normalizedDomain) else {",
    );
    expect(source).toContain("DNS query name is outside the allowed zone");
    expect(source).toContain(
      'return !label.isEmpty && label.count <= maxLabelLength && !label.contains(".")',
    );
  });

  it("validates TXT answer owner name and class before accepting record data", () => {
    expect(source).toContain(
      "let (answerName, answerOffset) = try readName(bytes: bytes, offset: offset)",
    );
    expect(source).toContain(
      "let answerClass = Int(bytes[offset]) << 8 | Int(bytes[offset + 1])",
    );
    expect(source).toContain(
      "answerClass == 1 && answerName == expectedQueryName",
    );
  });

  it("keeps native iOS DNS resilient with UDP-only, TCP-only, and UDP-then-TCP fallback paths", () => {
    expect(source).toContain("enum NativeTransport");
    expect(source).toContain("case udpOnly");
    expect(source).toContain("case tcpOnly");
    expect(source).toContain("case udpThenTCP");
    expect(source).toContain("let udpDeadline = try Self.stageDeadline(");
    expect(source).toContain("maxSeconds: Self.udpAttemptTimeout");
    expect(source).toContain("let tcpDeadline = try Self.stageDeadline(");
    expect(source).toContain("maxSeconds: Self.tcpAttemptTimeout");
    expect(source).toContain("withDeadline(deadline: udpDeadline)");
    expect(source).toContain("withDeadline(deadline: tcpDeadline)");
    expect(source).toContain("deadline: tcpDeadline");
    expect(source).not.toContain("withTimeout(seconds:");
    // Composed from the real UDP/TCP causes — must NOT hardcode "timed out",
    // which would force a wrong TIMEOUT classification in the JS error mapper.
    expect(source).toContain(
      "Native UDP failed (\\(udpFailure)); TCP fallback failed:",
    );
  });

  it("cleans up native TCP connections on every success and error path", () => {
    const functionStart = source.indexOf(
      "nonisolated private func performTCPQueryInternal",
    );
    const functionEnd = source.indexOf(
      "@available(iOS 16.0, *)",
      functionStart + 1,
    );
    const functionBody = source.slice(functionStart, functionEnd);

    expect(functionBody).toContain("defer {");
    expect(functionBody).toContain("connection.stateUpdateHandler = nil");
    expect(functionBody).toContain("connection.cancel()");
  });

  it("owns each invocation independently instead of coalescing query tasks", () => {
    expect(source).toContain("activeQueries");
    expect(source).not.toContain("cacheKey");
    expect(source).not.toContain("existingQuery");
  });
});
