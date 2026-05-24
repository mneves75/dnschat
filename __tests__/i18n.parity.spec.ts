import { enUS } from "../src/i18n/messages/en-US";
import { ptBR } from "../src/i18n/messages/pt-BR";

type MessageTree = Record<string, unknown>;

function collectKeys(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") {
    return [prefix];
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value as MessageTree).flatMap(([key, child]) =>
    collectKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("i18n message parity", () => {
  it("keeps en-US and pt-BR key sets identical across the app", () => {
    const enKeys = collectKeys(enUS).sort();
    const ptKeys = collectKeys(ptBR).sort();

    expect(ptKeys).toEqual(enKeys);
  });
});
