import fs from "node:fs";

describe("chat route hydration", () => {
  const source = fs.readFileSync("app/chat/[threadId].tsx", "utf8");

  it("loads stored chats before deciding a cold deep link is missing", () => {
    expect(source).toContain("isRouteHydrating");
    expect(source).toContain("hasAttemptedRouteLoad");
    expect(source).toContain("setIsRouteHydrating(true)");
    expect(source).toContain("if (targetId && chats.length === 0 && !hasAttemptedRouteLoad)");
    expect(source).toContain("isMissingRouteChat");
    expect(source).toContain('testID="chat-route-missing"');
  });

  it("does not silently replace stale thread links with a blank chat", () => {
    expect(source).toContain("screen.chat.missing.title");
    expect(source).toContain("handleStartNewChat");
    expect(source).not.toContain("[ChatRoute] Failed to recover chat");
  });
});
