import fs from "node:fs";

const read = (filePath: string): string => fs.readFileSync(filePath, "utf8");

const swiftSource = read("modules/dns-native/ios/DNSResolver.swift");
const swiftPrebuildSource = read("ios/DNSNative/DNSResolver.swift");
const objcBridgeSource = read("modules/dns-native/ios/RNDNSModule.m");
const objcPrebuildBridgeSource = read("ios/DNSNative/RNDNSModule.m");
const javaSource = read("modules/dns-native/android/DNSResolver.java");
const javaPrebuildSource = read(
  "android/app/src/main/java/com/dnsnative/DNSResolver.java",
);
const javaModuleSource = read("modules/dns-native/android/RNDNSModule.java");
const javaPrebuildModuleSource = read(
  "android/app/src/main/java/com/dnsnative/RNDNSModule.java",
);

describe("native DNS resolver hardening policy", () => {
  it("keeps module and generated native sources byte-identical", () => {
    expect(swiftSource).toContain("final class DNSResolver");
    expect(javaSource).toContain("public class DNSResolver");
    expect(swiftPrebuildSource).toBe(swiftSource);
    expect(objcPrebuildBridgeSource).toBe(objcBridgeSource);
    expect(javaPrebuildSource).toBe(javaSource);
    expect(javaPrebuildModuleSource).toBe(javaModuleSource);
  });

  it("exports caller deadlines and reusable foreground cancellation on both bridges", () => {
    expect(objcBridgeSource).toContain("deadlineEpochMs:");
    expect(objcBridgeSource).toContain("cancelActiveQueries:");
    expect(javaModuleSource).toContain("double deadlineEpochMillis");
    expect(javaModuleSource).toContain("public void cancelActiveQueries");
    expect(swiftSource).toContain("func cancelActiveQueries() -> Int");
    expect(javaSource).toContain("public int cancelActiveQueries()");
  });

  it("keeps native invocations independently owned instead of query-key coalesced", () => {
    expect(swiftSource).toContain("activeQueries");
    expect(javaSource).toContain("activeQueries");

    expect(swiftSource).not.toContain("cacheKey");
    expect(swiftSource).not.toContain("existingQuery");
    expect(javaSource).not.toContain("activeQueries.compute(");
    expect(javaSource).not.toContain("Reusing existing query");
  });
});
