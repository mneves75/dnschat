import { readFileSync } from "node:fs";

describe("haptics copy", () => {
  const english = readFileSync("src/i18n/messages/en-US.ts", "utf8");
  const portuguese = readFileSync("src/i18n/messages/pt-BR.ts", "utf8");

  it("does not claim that Reduce Motion suppresses haptics", () => {
    expect(english).not.toMatch(
      /haptic[^\n]*(?:respects|suppressed)[^\n]*Reduce Motion/i,
    );
    expect(portuguese).not.toMatch(/háptic[^\n]*Reduzir Movimento/i);
  });

  it("states that haptics can be disabled independently in both locales", () => {
    expect(english).toContain("disabled independently");
    expect(portuguese).toContain("desativado de forma independente");
  });
});
