import fs from "fs";

describe("marketing video product claims", () => {
  it("depicts the implemented history list without claiming search", () => {
    const sourceFiles = fs
      .readdirSync("marketing/video/src", { recursive: true })
      .filter(
        (entry): entry is string =>
          typeof entry === "string" && entry.endsWith(".tsx"),
      );
    const historySurface = sourceFiles
      .map((entry) =>
        fs.readFileSync(`marketing/video/src/${entry}`, "utf8"),
      )
      .join("\n");

    expect(historySurface).toContain("Conversas recentes");
    expect(historySurface).not.toMatch(/pesquisável|buscar conversas|\bbusca\b/i);
  });

  it("does not expose prompt-derived DNS labels in the Logs mock", () => {
    const appMocks = fs.readFileSync(
      "marketing/video/src/shared/AppMocks.tsx",
      "utf8",
    );

    expect(appMocks).toContain("[conteúdo redigido]");
    expect(appMocks).not.toContain("explique-cache-dns-brevemente");
  });
});
