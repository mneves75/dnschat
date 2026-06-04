import { getDateFnsLocale } from "../src/utils/dateLocale";

describe("date-fns locale mapping", () => {
  it("maps app locales to date-fns locale objects for relative timestamps", () => {
    expect(getDateFnsLocale("en-US").code).toBe("en-US");
    expect(getDateFnsLocale("pt-BR").code).toBe("pt-BR");
  });
});
