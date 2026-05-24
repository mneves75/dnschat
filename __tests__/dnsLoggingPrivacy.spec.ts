import fs from "node:fs";

function readSource(path: string): string {
  return fs.readFileSync(path, "utf8");
}

describe("DNS logging privacy", () => {
  it("does not emit prompt-derived query names or TXT payloads in DNSService verbose logs", () => {
    const source = readSource("src/services/dnsService.ts");

    expect(source).not.toContain("NATIVE: Query name:");
    expect(source).not.toContain("Forced query name:");
    expect(source).not.toContain("Raw TXT records received:");
    expect(source).not.toContain("Parsed response preview:");
    expect(source).not.toContain("transport test successful: ${response}");
    expect(source).toContain("queryNameLength");
    expect(source).toContain("responseLength");
  });

  it("does not emit prompt-derived query names from the native module bridge debug log", () => {
    const source = readSource("modules/dns-native/index.ts");

    expect(source).not.toContain("- ${message.trim()}");
    expect(source).toContain("queryNameLength");
  });
});
