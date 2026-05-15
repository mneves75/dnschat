import type { Chat } from "../types/chat";

export function resolveRouteChat(
  chats: Chat[],
  currentChat: Chat | null,
  threadId: string | null,
): Chat | null {
  if (!threadId) {
    return currentChat;
  }

  if (currentChat?.id === threadId) {
    return currentChat;
  }

  return chats.find((chat) => chat.id === threadId) ?? null;
}
