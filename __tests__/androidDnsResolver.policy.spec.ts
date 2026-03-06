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
});
