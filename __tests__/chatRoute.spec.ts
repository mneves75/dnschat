import { resolveRouteChat } from "../src/utils/chatRoute";
import type { Chat } from "../src/types/chat";

function makeChat(id: string, title: string): Chat {
  return {
    id,
    title,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    messages: [],
  };
}

describe("resolveRouteChat", () => {
  it("does not expose stale current chat data for a different thread route", () => {
    const staleCurrentChat = makeChat("chat-a", "Chat A");

    expect(resolveRouteChat([], staleCurrentChat, "chat-b")).toBeNull();
  });

  it("resolves the route chat from cached chats before the current chat catches up", () => {
    const staleCurrentChat = makeChat("chat-a", "Chat A");
    const routeChat = makeChat("chat-b", "Chat B");

    expect(resolveRouteChat([routeChat], staleCurrentChat, "chat-b")).toBe(routeChat);
  });
});
