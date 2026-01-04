import fs from "node:fs";

describe("repo policy: lint is portable (no global installs)", () => {
  it("uses ast-grep from devDependencies and a checked-in config", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(pkg.devDependencies?.["@ast-grep/cli"]).toBeDefined();

    const lintScript = pkg.scripts?.["lint"] ?? "";
    expect(lintScript).toContain("lint:ast-grep");

    const lintAstGrep = pkg.scripts?.["lint:ast-grep"] ?? "";
    expect(lintAstGrep).toContain("ast-grep scan");
    expect(lintAstGrep).toContain("project-rules/astgrep-liquid-glass.yml");

    expect(fs.existsSync("project-rules/astgrep-liquid-glass.yml")).toBe(true);
  });
});
