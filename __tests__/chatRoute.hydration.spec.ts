import fs from "node:fs";

describe("chat route hydration", () => {
  const source = fs.readFileSync("app/chat/[threadId].tsx", "utf8");

  it("loads stored chats before creating a replacement for a cold deep link", () => {
    expect(source).toContain("isRouteHydrating");
    expect(source).toContain("hasAttemptedRouteLoad");
    expect(source).toContain("setIsRouteHydrating(true)");
    expect(source).toContain("if (targetId && chats.length === 0 && !hasAttemptedRouteLoad)");
    expect(source).toContain("createChat()");
  });
});
