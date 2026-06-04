import fs from "node:fs";

describe("root layout routing policy", () => {
  const source = fs.readFileSync("app/_layout.tsx", "utf8");

  it("keeps the navigator mounted while onboarding redirect settles", () => {
    expect(source).toContain("hasSettledInitialRoute");
    expect(source).not.toContain("if (!hasSettledInitialRoute) return null");
    expect(source).toContain('<Stack.Screen name="chat/[threadId]"');
  });

  it("keeps the splash screen visible until DNS log storage initialization settles", () => {
    expect(source).toContain("hasInitializedLogs");
    expect(source).toContain("DNSLogService.initialize()");
    expect(source).toContain("setHasInitializedLogs(true)");
  });

  it("guards Appearance.setColorScheme for web runtimes that do not expose it", () => {
    expect(source).toContain('typeof Appearance.setColorScheme !== "function"');
  });
});
