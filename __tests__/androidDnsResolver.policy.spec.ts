import fs from "fs";
import path from "path";

describe("Android DNSResolver native policy", () => {
  const resolverPath = path.resolve(
    __dirname,
    "../modules/dns-native/android/DNSResolver.java",
  );
  const source = fs.readFileSync(resolverPath, "utf8");

  it("allowlists only the LLM DNS zones and never a public recursive resolver", () => {
    expect(source).toContain('"llm.pieter.com",\n            "ch.at"');
    expect(source).not.toMatch(
      /8\.8\.8\.8|1\.1\.1\.1|cloudflare-dns|HttpURLConnection/,
    );
  });

  it("pins every query to one label under the selected resolver's zone", () => {
    expect(source).toContain(
      "requireQueryNameInZone(queryName, normalizedDomain);",
    );
    expect(source).toContain("DNS query name is outside the allowed zone");
  });

  it("only exposes port 53 to the JavaScript bridge", () => {
    const bridge = fs.readFileSync(
      path.resolve(__dirname, "../modules/dns-native/android/RNDNSModule.java"),
      "utf8",
    );
    expect(source).toContain("static final int ALLOWED_DNS_PORT = 53;");
    expect(bridge).toContain("DNSResolver.requireAllowedPort(port);");
    expect(bridge).toContain(
      "promise.reject(error.getType().name(), error.getDetails(), error);",
    );
    expect(bridge).not.toContain(
      'promise.reject("DNS_QUERY_FAILED", errorMessage, throwable);\n            });',
    );
  });

  it("rejects malformed short DNS responses instead of treating them as empty answers", () => {
    expect(source).toContain("Response too short:");
    expect(source).toContain("minimum 12 required");
    expect(source).not.toContain(
      "if (data == null || data.length < 12) {\n            return results;",
    );
  });

  it("validates TXT answer owner name and class before accepting record data", () => {
    expect(source).toContain(
      "NameParseResult answerName = readName(data, offset);",
    );
    expect(source).toContain("answerClass == 1");
    expect(source).toContain("answerName.name.equals(expectedQueryName)");
  });

  it("applies owner-name and class validation to the legacy dnsjava fallback", () => {
    expect(source).toContain("isExpectedLegacyTxtRecord(record, queryName)");
    expect(source).toContain("record.getDClass() == DClass.IN");
    expect(source).toContain("normalizeDnsName(record.getName().toString())");
  });

  it("does not log prompt-derived DNS query names", () => {
    expect(source).toContain("DNS: Creating independent query operation");
    expect(source).not.toContain('"DNS: Creating new query for: " + key');
    // A throwable argument can carry the query name (dnsjava embeds the input
    // in TextParseException). Every Log call must be a two-argument call.
    const logCalls = source.match(/Log\.[dwei]\([^;]*\);/g) ?? [];
    expect(logCalls.length).toBeGreaterThan(0);
    const withThrowable = logCalls.filter((call) =>
      /,\s*(e|error|throwable|t|ex)\s*\)\s*;$/.test(call),
    );
    expect(withThrowable).toEqual([]);
  });

  it("does not run blocking DNS work on the React Native caller thread under backpressure", () => {
    expect(source).toContain("new ThreadPoolExecutor.AbortPolicy()");
    expect(source).toContain("RejectedExecutionException");
    expect(source).toContain("DNS resolver is busy; retry shortly");
    expect(source).not.toContain("CallerRunsPolicy");
  });

  it("does not coalesce independently owned native invocations", () => {
    expect(source).toContain("activeQueries");
    expect(source).not.toContain("activeQueries.compute(");
    expect(source).not.toContain("Reusing existing query");
  });

  it("uses cancellable platform hostname resolution on Android 10 and newer", () => {
    expect(source).toContain("Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q");
    expect(source).toContain("android.net.DnsResolver.getInstance().query(");
    expect(source).toContain("CancellationSignal");
  });

  it("rejects invalid bridge ports instead of silently substituting port 53", () => {
    expect(source).toContain("final int dnsPort = port;");
    expect(source).not.toContain("port > 0 ? port : DNS_PORT");
    expect(source).toContain("Invalid DNS port:");
  });
});
