import fs from "node:fs";

const read = (filePath: string): string => fs.readFileSync(filePath, "utf8");

const swiftSource = read("modules/dns-native/ios/DNSResolver.swift");
const swiftPrebuildSource = read("ios/DNSNative/DNSResolver.swift");
const javaSource = read("modules/dns-native/android/DNSResolver.java");
const javaPrebuildSource = read(
  "android/app/src/main/java/com/dnsnative/DNSResolver.java",
);

const between = (source: string, start: string, end: string): string => {
  const startIndex = source.indexOf(start);
  expect(startIndex).toBeGreaterThanOrEqual(0);
  const endIndex = source.indexOf(end, startIndex + start.length);
  expect(endIndex).toBeGreaterThan(startIndex);
  return source.slice(startIndex, endIndex);
};

describe("native DNS resolver hardening policy", () => {
  it("keeps the module and generated native resolver copies byte-identical", () => {
    expect(swiftSource).toContain("final class DNSResolver");
    expect(javaSource).toContain("public class DNSResolver");
    expect(swiftPrebuildSource).toBe(swiftSource);
    expect(javaPrebuildSource).toBe(javaSource);
  });

  it("rejects the entire iOS response when any declared answer or TXT RDATA is malformed", () => {
    const parser = between(
      swiftSource,
      "private func parseDnsTxtResponse(",
      "private func readName(",
    );

    expect(parser).toContain("guard offset + 10 <= bytes.count else");
    expect(parser).toContain("DNS response answer header truncated");
    expect(parser).toContain("guard rdLength <= bytes.count - offset else");
    expect(parser).toContain("DNS response RDATA truncated");
    expect(parser).toContain("var recordResults: [String] = []");
    expect(parser).toContain("guard txtLen <= end - p else");
    expect(parser).toContain("DNS TXT character-string truncated");
    expect(parser).toContain("DNS TXT character-string is not valid UTF-8");
    expect(parser).toContain("results.append(contentsOf: recordResults)");
    expect(parser).not.toContain("break");
  });

  it("rejects the entire Android response when any declared answer or TXT RDATA is malformed", () => {
    const parser = between(
      javaSource,
      "private List<String> parseDnsTxtResponse(",
      "private static final class NameParseResult",
    );

    expect(parser).toContain("DNS response answer header truncated");
    expect(parser).toContain("rdLength > data.length - offset");
    expect(parser).toContain("DNS response RDATA truncated");
    expect(parser).toContain("List<String> recordResults = new ArrayList<>()");
    expect(parser).toContain("txtLen > end - p");
    expect(parser).toContain("DNS TXT character-string truncated");
    expect(parser).toContain("decodeUtf8Strict(data, p, txtLen)");
    expect(parser).toContain("results.addAll(recordResults)");
    expect(parser).not.toContain("break;");
    expect(javaSource).toContain("CodingErrorAction.REPORT");
    expect(javaSource).toContain("DNS TXT character-string is not valid UTF-8");
  });

  it("settles the iOS connection-ready continuation from the cancellation handler", () => {
    const udpQuery = between(
      swiftSource,
      "nonisolated private func performUDPQuery(",
      "nonisolated private func performTCPQuery(",
    );
    const tcpQuery = between(
      swiftSource,
      "nonisolated private func performTCPQuery(",
      "nonisolated private func performUDPQueryInternal(",
    );

    for (const query of [udpQuery, tcpQuery]) {
      expect(query).toContain("let connectionReadyGate = ContinuationResumeGate<Void>()");
      expect(query).toContain("connectionReadyGate.resume(throwing: DNSError.cancelled)");
      expect(query.indexOf("connectionReadyGate.resume(throwing: DNSError.cancelled)"))
        .toBeLessThan(query.indexOf("connection.stateUpdateHandler = nil"));
    }
    expect(swiftSource).toContain("internal final class ContinuationResumeGate<Value>");
    expect(swiftSource).toContain("func install(_ continuation: CheckedContinuation<Value, Error>)");
  });

  it("wires one monotonic deadline and one resolved address through the Android chain", () => {
    expect(javaSource).toContain("private static final int QUERY_TIMEOUT_MS = 9500;");
    expect(javaSource).toContain("long deadlineNanos = newQueryDeadlineNanos();");
    expect(javaSource).toContain("TimeUnit.MILLISECONDS.toNanos(queryTimeoutMillis)");
    expect(javaSource).toContain("deadlineNanos - SystemClock.elapsedRealtimeNanos()");
    expect(javaSource).toContain("CompletableFuture<InetAddress> serverAddressFuture");
    expect(javaSource).toContain("queryTXTRawUDP(queryName, serverAddress, port, deadlineNanos)");
    expect(javaSource).toContain("queryTXTDNSOverHTTPS(queryName, deadlineNanos)");
    expect(javaSource).toContain("queryTXTLegacy(serverAddress, queryName, port, deadlineNanos)");
    expect(javaSource).toContain("private static final int MAX_HOST_RESOLVER_THREADS = 2;");
    expect(javaSource).toContain("HOST_RESOLVER_EXECUTOR.submit");
    expect(javaSource).toContain("new SynchronousQueue<>()");
    expect(javaSource).toContain("lookup.get(");
    expect(javaSource).toContain("new SimpleResolver(serverAddress)");
    expect(javaSource).not.toContain("new SimpleResolver(domain)");
    expect(javaSource).toContain("result.whenComplete((ignoredRecords, ignoredError) ->");
    expect(javaSource).not.toContain("setSoTimeout(QUERY_TIMEOUT_MS)");
    expect(javaSource).not.toContain("setConnectTimeout(QUERY_TIMEOUT_MS)");
    expect(javaSource).not.toContain("setReadTimeout(QUERY_TIMEOUT_MS)");
    expect(javaSource).not.toContain("Duration.ofMillis(QUERY_TIMEOUT_MS)");
  });

  it("routes DoH bodies through the DNS wire-size guard", () => {
    const doh = between(
      javaSource,
      "private CompletableFuture<List<String>> queryTXTDNSOverHTTPS(",
      "private Network getActiveNetwork()",
    );
    const bodyReader = between(
      javaSource,
      "static byte[] readDnsMessageBody(",
      "private CompletableFuture<List<String>> queryTXTDNSOverHTTPS(",
    );

    expect(javaSource).toContain("private static final int MAX_DNS_MESSAGE_BYTES = 65535;");
    expect(doh).toContain("readDnsMessageBody(");
    expect(bodyReader).toContain("contentLength > MAX_DNS_MESSAGE_BYTES");
    expect(bodyReader).toContain("responseSize > MAX_DNS_MESSAGE_BYTES - read");
    expect(bodyReader).toContain("DNS-over-HTTPS response exceeds 65535 bytes");
  });
});
