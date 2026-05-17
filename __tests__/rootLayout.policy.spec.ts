import fs from "node:fs";

describe("root layout routing policy", () => {
  const source = fs.readFileSync("app/_layout.tsx", "utf8");

  it("keeps the navigator mounted while onboarding redirect settles", () => {
    expect(source).toContain("hasSettledInitialRoute");
    expect(source).not.toContain("if (!hasSettledInitialRoute) return null");
    expect(source).toContain('<Stack.Screen name="chat/[threadId]"');
  });
});
