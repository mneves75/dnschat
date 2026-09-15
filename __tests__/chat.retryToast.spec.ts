import { enUS } from "../src/i18n/messages/en-US";
import { ptBR } from "../src/i18n/messages/pt-BR";
import type { ChatErrorKind, Message } from "../src/types/chat";
import {
  chatErrorMessageKey,
  getRetryablePrompt,
} from "../src/utils/chatErrors";

const message = (
  id: string,
  role: Message["role"],
  content: string,
  status: Message["status"] = "sent",
): Message => ({ id, role, content, status, timestamp: new Date(0) });

const history: Message[] = [
  message("u1", "user", "what is dns"),
  message("a1", "assistant", "Error: timeout", "error"),
  message("u2", "user", "hello"),
  message("a2", "assistant", "Error: timeout", "error"),
];

const lookup = (dictionary: unknown, key: string): unknown =>
  key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined,
      dictionary,
    );

describe("Chat error toast retry", () => {
  it("resends only the prompt whose DNS request caused the current error", () => {
    expect(
      getRetryablePrompt(history, { kind: "dns", failedMessageId: "a1" }),
    ).toBe("what is dns");
    expect(
      getRetryablePrompt(history, { kind: "dns", failedMessageId: "a2" }),
    ).toBe("hello");
  });

  it("offers no retry for errors that did not come from a DNS request", () => {
    // Regression: a rejected emoji-only message used to offer Retry for an
    // older, unrelated failure found anywhere in the history.
    for (const kind of ["validation", "busy", "storage"] as const) {
      expect(getRetryablePrompt(history, { kind })).toBeNull();
    }
    expect(getRetryablePrompt(history, null)).toBeNull();
    expect(
      getRetryablePrompt(history, { kind: "dns", failedMessageId: "gone" }),
    ).toBeNull();
    expect(
      getRetryablePrompt(history, { kind: "dns", failedMessageId: "u2" }),
    ).toBeNull();
  });

  it("maps every error kind to localized copy in both locales", () => {
    const kinds: ChatErrorKind[] = [
      "dns",
      "validation",
      "busy",
      "noChat",
      "storage",
      "storageRecovered",
      "storageReset",
    ];
    for (const kind of kinds) {
      const key = chatErrorMessageKey(kind);
      const english = lookup(enUS, key);
      const portuguese = lookup(ptBR, key);
      expect(typeof english).toBe("string");
      expect(typeof portuguese).toBe("string");
      expect(portuguese).not.toBe(english);
    }
  });
});
