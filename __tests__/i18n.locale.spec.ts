import { resolveLocale } from "../src/i18n/translations";
import { normalizePreferredLocale } from "../src/context/settingsStorage";

describe("locale helpers", () => {
  it("maps shorthand codes to supported locales", () => {
    expect(resolveLocale("pt")).toBe("pt-BR");
    expect(resolveLocale("EN_us")).toBe("en-US");
  });

  it("falls back to English when locale is unknown", () => {
    expect(resolveLocale("xx-YY")).toBe("en-US");
  });

  it("normalizes preferredLocale inputs", () => {
    expect(normalizePreferredLocale(" pt-br ")).toBe("pt-BR");
    expect(normalizePreferredLocale(null)).toBeNull();
    expect(normalizePreferredLocale("   ")).toBeNull();
  });
});
