import fs from "node:fs";

describe("repo policy: lint is portable (no global installs)", () => {
  it("uses ast-grep from devDependencies and a checked-in config", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(pkg.devDependencies?.["@ast-grep/cli"]).toBeDefined();

    const lintScript = pkg.scripts?.["lint"] ?? "";
    expect(lintScript).not.toContain("bun run");

    const lintAstGrep = pkg.scripts?.["lint:ast-grep"] ?? "";
    const lintScripts = [lintScript, lintAstGrep].join("\n");
    const usesDirectAstGrep = lintScripts.includes("ast-grep scan");
    const usesDeterministicRunner = lintScripts.includes("scripts/run-ast-grep.js");

    expect(usesDirectAstGrep || usesDeterministicRunner).toBe(true);
    expect(lintScripts).toContain("project-rules/astgrep-liquid-glass.yml");
    if (usesDeterministicRunner) {
      expect(fs.existsSync("scripts/run-ast-grep.js")).toBe(true);
    }

    expect(fs.existsSync("project-rules/astgrep-liquid-glass.yml")).toBe(true);
  });
});

describe("repo policy: full verification gate covers release-critical checks", () => {
  it("runs TypeScript and Android 16KB checks in verify:all", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(pkg.scripts?.["typecheck"]).toBe("tsc --noEmit -p tsconfig.json");

    const verifyAll = pkg.scripts?.["verify:all"] ?? "";
    expect(verifyAll).toContain("bun run typecheck");
    expect(verifyAll).toContain("bun run verify:android-16kb");
  });
});
