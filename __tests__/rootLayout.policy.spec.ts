import fs from "node:fs";

describe("root layout routing policy", () => {
  const source = fs.readFileSync("app/_layout.tsx", "utf8");

  it("keeps the navigator mounted while onboarding redirect settles", () => {
    expect(source).toContain("hasSettledInitialRoute");
    expect(source).not.toContain("if (!hasSettledInitialRoute) return null");
    expect(source).toContain('<Stack.Screen name="chat/[threadId]"');
  });

  it("initializes DNS log storage without gating the splash screen on it", () => {
    // Log initialization decrypts the whole log store in JS; it must run on
    // mount but never hold the first frame hostage (4.0.29 startup fix).
    expect(source).toContain("DNSLogService.initialize()");
    expect(source).not.toContain("hasInitializedLogs");
  });

  it("guards Appearance.setColorScheme for web runtimes that do not expose it", () => {
    expect(source).toContain('typeof Appearance.setColorScheme !== "function"');
  });
});
