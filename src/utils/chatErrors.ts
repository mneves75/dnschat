import type { MessageKey } from "../i18n";
import type { ChatError, ChatErrorKind, Message } from "../types/chat";

const CHAT_ERROR_MESSAGE_KEYS: Record<ChatErrorKind, MessageKey> = {
  dns: "screen.chat.errorMessage",
  validation: "screen.chat.errors.validation",
  busy: "screen.chat.errors.busy",
  noChat: "screen.chat.errors.noChat",
  storage: "screen.chat.errors.storage",
  storageRecovered: "screen.chat.storageRecovery.recovered",
  storageReset: "screen.chat.storageRecovery.reset",
};

export const chatErrorMessageKey = (kind: ChatErrorKind): MessageKey =>
  CHAT_ERROR_MESSAGE_KEYS[kind];

/**
 * The prompt Retry may resend: only the one whose DNS request produced the
 * current error. An older failure elsewhere in the history is never resent.
 */
export function getRetryablePrompt(
  messages: Message[],
  error: ChatError | null,
): string | null {
  if (error?.kind !== "dns" || !error.failedMessageId) {
    return null;
  }
  const index = messages.findIndex(
    (message) => message.id === error.failedMessageId,
  );
  const failed = messages[index];
  const prompt = index > 0 ? messages[index - 1] : undefined;
  if (
    failed?.role !== "assistant" ||
    failed.status !== "error" ||
    prompt?.role !== "user" ||
    !prompt.content.trim()
  ) {
    return null;
  }
  return prompt.content;
}
