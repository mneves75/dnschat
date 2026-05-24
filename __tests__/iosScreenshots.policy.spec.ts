import fs from "node:fs";

describe("iOS screenshot UI test policy", () => {
  const source = fs.readFileSync("ios/DNSChatUITests/DNSChatUITests.swift", "utf8");

  it("reuses onboarding recovery after dark-mode relaunches", () => {
    expect(source).toContain("private func ensureNavigationReady");
    expect(source).toContain("XCTAssertTrue(ensureNavigationReady(timeout: 15)");
    expect(source).toContain("Navigation not found in dark mode after onboarding recovery");
  });
});
