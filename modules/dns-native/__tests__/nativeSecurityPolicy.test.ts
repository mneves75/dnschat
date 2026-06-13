import fs from "fs";
import path from "path";

const moduleRoot = path.join(__dirname, "..");
const repoRoot = path.join(moduleRoot, "..", "..");

const read = (filePath: string): string => fs.readFileSync(filePath, "utf-8");

describe("native security policy", () => {
  describe("dnsjava dependency (CVE-2024-25638)", () => {
    const gradleFiles = [
      path.join(moduleRoot, "android", "build.gradle"),
      path.join(repoRoot, "android", "app", "build.gradle"),
    ];

    it.each(gradleFiles)("pins dnsjava to 3.6.2 or higher in %s", (gradlePath) => {
      const content = read(gradlePath);
      const match = content.match(/dnsjava:dnsjava:(\d+)\.(\d+)\.(\d+)/);

      expect(match).not.toBeNull();
      const [major = 0, minor = 0, patch = 0] = match!.slice(1).map(Number);
      const version = major * 10000 + minor * 100 + patch;
      // 3.6.2 fixed improper DNS response validation (CVE-2024-25638).
      expect(version).toBeGreaterThanOrEqual(3 * 10000 + 6 * 100 + 2);
    });
  });

  describe("server allowlist subset-only narrowing", () => {
    it("iOS intersects supplied allowedServers with the compiled-in defaults", () => {
      const swift = read(path.join(moduleRoot, "ios", "DNSResolver.swift"));

      // The supplied list must never widen the compiled-in allowlist.
      expect(swift).toContain("Set(filtered).intersection(defaultAllowedServers)");
      expect(swift).toContain(
        "Allowed DNS servers must be a subset of the built-in allowlist",
      );
    });

    it("Android intersects supplied allowedServers with the compiled-in defaults", () => {
      const java = read(path.join(moduleRoot, "android", "DNSResolver.java"));

      // The supplied list must never widen the compiled-in allowlist.
      expect(java).toContain("normalized.retainAll(DEFAULT_ALLOWED_SERVERS);");
      expect(java).toContain(
        "allowedServers must be a subset of the built-in allowlist",
      );
    });

    it("compiled-in native allowlists are set-equal to ALLOWED_DNS_SERVERS", () => {
      // The actual invariant behind subset-only narrowing: with intersection
      // on native, a TS-only allowlist change is silently dropped — so the
      // three lists must move together (see contract in constants.ts).
      const { DNS_CONSTANTS } = require("../constants") as {
        DNS_CONSTANTS: { ALLOWED_DNS_SERVERS: string[] };
      };
      const expected = [...DNS_CONSTANTS.ALLOWED_DNS_SERVERS].sort();

      const swift = read(path.join(moduleRoot, "ios", "DNSResolver.swift"));
      const swiftBlock = swift.match(
        /defaultAllowedServers: Set<String> = \[([^\]]+)\]/,
      );
      expect(swiftBlock).not.toBeNull();
      const swiftServers = [...swiftBlock![1]!.matchAll(/"([^"]+)"/g)]
        .map((m) => m[1]!)
        .sort();
      expect(swiftServers).toEqual(expected);

      const java = read(path.join(moduleRoot, "android", "DNSResolver.java"));
      const javaBlock = java.match(
        /DEFAULT_ALLOWED_SERVERS = Collections\.unmodifiableSet\(\s*new HashSet<>\(Arrays\.asList\(([\s\S]*?)\)\)/,
      );
      expect(javaBlock).not.toBeNull();
      const javaServers = [...javaBlock![1]!.matchAll(/"([^"]+)"/g)]
        .map((m) => m[1]!)
        .sort();
      expect(javaServers).toEqual(expected);
    });
  });
});
