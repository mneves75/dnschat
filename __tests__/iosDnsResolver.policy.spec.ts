import fs from "node:fs";

describe("iOS DNSResolver native policy", () => {
  const source = fs.readFileSync("modules/dns-native/ios/DNSResolver.swift", "utf8");

  it("rejects invalid bridge ports before converting to UInt16", () => {
    expect(source).toContain("let requestedPort = port.intValue");
    expect(source).toContain("requestedPort >= 1 && requestedPort <= Int(UInt16.max)");
    expect(source).toContain("let dnsPort = UInt16(requestedPort)");
    expect(source).not.toContain("port.uint16Value > 0 ? port.uint16Value");
  });
});
