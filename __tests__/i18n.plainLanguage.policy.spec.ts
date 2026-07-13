import { enUS } from "../src/i18n/messages/en-US";
import { ptBR } from "../src/i18n/messages/pt-BR";

/**
 * DESIGN.md — The Plain Language Rule: prefer factual transport language
 * over promotional language such as "magic" or "revolutionary". Applies to
 * user-facing copy that describes the product or its transport.
 */
const BANNED_PATTERNS: RegExp[] = [
  /\bmagic\b/i,
  /\bmagia\b/i,
  /m[áa]gic[ao]s?\b/i,
  /revolution/i,
  /revolucion/i,
  /world's first/i,
  /primeiro .* do mundo/i,
  /\bamazing\b/i,
  /\bincr[íi]vel!\s/i,
];

function collectStrings(value: unknown, path: string): Array<[string, string]> {
  if (typeof value === "string") {
    return [[path, value]];
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, child]) => collectStrings(child, `${path}.${key}`),
    );
  }
  return [];
}

const GUARDED_SUBTREES: Array<[string, string]> = [
  ["onboarding", "onboarding"],
  ["glassChatList", "glassChatList"],
];

describe("i18n plain language policy", () => {
  const locales: Array<[string, unknown]> = [
    ["en-US", enUS],
    ["pt-BR", ptBR],
  ];

  it.each(locales)(
    "keeps %s onboarding and chat-list copy factual",
    (_locale, messages) => {
      const screen = (messages as Record<string, unknown>)["screen"] as
        | Record<string, unknown>
        | undefined;
      expect(screen).toBeDefined();

      const offenders = GUARDED_SUBTREES.flatMap(([key, path]) => {
        const subtree = screen?.[key];
        expect(subtree).toBeDefined();
        return collectStrings(subtree, path).filter(([, text]) =>
          BANNED_PATTERNS.some((pattern) => pattern.test(text)),
        );
      });

      expect(offenders).toEqual([]);
    },
  );
});
