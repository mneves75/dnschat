import fs from "fs";
import path from "path";

describe("Android DNSResolver native policy", () => {
  const resolverPath = path.resolve(
    __dirname,
    "../modules/dns-native/android/DNSResolver.java",
  );
  const source = fs.readFileSync(resolverPath, "utf8");

  it("only allows Cloudflare DoH fallback when Cloudflare is the selected resolver", () => {
    expect(source).toContain("shouldUseCloudflareDohFallback");
    expect(source).toContain('return port == 53 && "1.1.1.1".equals(normalizedDomain);');
    expect(source).toContain("Skipping Cloudflare DoH, trying legacy DNS on the selected resolver");
  });

  it("rejects malformed short DNS responses instead of treating them as empty answers", () => {
    expect(source).toContain("Response too short:");
    expect(source).toContain("minimum 12 required");
    expect(source).not.toContain("if (data == null || data.length < 12) {\n            return results;");
  });

  it("validates TXT answer owner name and class before accepting record data", () => {
    expect(source).toContain("NameParseResult answerName = readName(data, offset);");
    expect(source).toContain("answerClass == 1");
    expect(source).toContain("answerName.name.equals(expectedQueryName)");
  });

  it("does not log prompt-derived DNS query names", () => {
    expect(source).toContain("DNS: Creating new query for selected resolver");
    expect(source).toContain("DNS-over-HTTPS: Querying Cloudflare for selected DNS name");
    expect(source).not.toContain('"DNS: Creating new query for: " + key');
    expect(source).not.toContain('"DNS-over-HTTPS: Querying Cloudflare for: " + message');
  });

  it("does not run blocking DNS work on the React Native caller thread under backpressure", () => {
    expect(source).toContain("new ThreadPoolExecutor.AbortPolicy()");
    expect(source).toContain("RejectedExecutionException");
    expect(source).toContain("DNS resolver is busy; retry shortly");
    expect(source).not.toContain("CallerRunsPolicy");
  });

  it("keeps active query ownership scoped to each resolver instance", () => {
    expect(source).toContain("private final Map<String, CompletableFuture<List<String>>> activeQueries");
    expect(source).toContain("activeQueries.remove(queryId, result)");
    expect(source).not.toContain("private static final Map<String, CompletableFuture<List<String>>> activeQueries");
  });

  it("rejects invalid bridge ports instead of silently substituting port 53", () => {
    expect(source).toContain("final int dnsPort = port;");
    expect(source).not.toContain("port > 0 ? port : DNS_PORT");
    expect(source).toContain("Invalid DNS port:");
  });
});
