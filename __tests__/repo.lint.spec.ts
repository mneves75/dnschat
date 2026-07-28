import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const projectRoot = process.cwd();

function runLintOnFixture(fixtureName: string, sourceName: string) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dnschat-astgrep-"));
  const sourcePath = path.join(tempDir, sourceName);

  try {
    fs.copyFileSync(
      path.join(projectRoot, "__tests__", "fixtures", "astgrep", fixtureName),
      sourcePath,
    );

    return spawnSync(
      process.execPath,
      [
        "scripts/run-ast-grep.js",
        "--config",
        "sgconfig.yml",
        sourcePath,
      ],
      {
        cwd: projectRoot,
        encoding: "utf8",
      },
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

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
    expect(lintScripts).toContain("sgconfig.yml");
    if (usesDeterministicRunner) {
      expect(fs.existsSync("scripts/run-ast-grep.js")).toBe(true);
    }

    expect(fs.existsSync("sgconfig.yml")).toBe(true);
    expect(fs.existsSync("project-rules/astgrep-liquid-glass.yml")).toBe(true);
  });

  // Both banned patterns must be caught in BOTH .ts and .tsx sources. ast-grep
  // treats Tsx and TypeScript as separate languages, so a single-language rule
  // silently misses half the codebase - which is how this gate first shipped.
  it.each([
    [
      "legacy-import.tsx.txt",
      "legacy-import.tsx",
      "no-legacy-liquid-glass-imports",
    ],
    [
      "legacy-import.ts.txt",
      "legacy-import.ts",
      "no-legacy-liquid-glass-imports-ts",
    ],
    [
      "native-module.ts.txt",
      "native-module.ts",
      "no-native-liquid-glass-module",
    ],
    [
      "native-module.tsx.txt",
      "native-module.tsx",
      "no-native-liquid-glass-module-tsx",
    ],
  ])("rejects %s with %s", (fixtureName, sourceName, ruleId) => {
    const result = runLintOnFixture(fixtureName, sourceName);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.error).toBeUndefined();
    expect(result.status).not.toBe(0);
    expect(output).toContain(ruleId);
  });

  it("loads at least four effective ast-grep rules", () => {
    const result = spawnSync(
      process.execPath,
      [
        "scripts/run-ast-grep.js",
        "--config",
        "sgconfig.yml",
        "--inspect",
        "summary",
      ],
      {
        cwd: projectRoot,
        encoding: "utf8",
      },
    );
    const output = `${result.stdout}${result.stderr}`;
    const effectiveRuleCount = output.match(/effectiveRuleCount=(\d+)/)?.[1];

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(effectiveRuleCount).toBeDefined();
    expect(Number(effectiveRuleCount)).toBeGreaterThanOrEqual(4);
  });
});

describe("repo policy: full verification gate covers release-critical checks", () => {
  it("runs TypeScript and Android 16KB checks in verify:all", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(pkg.scripts?.["typecheck"]).toBe("tsc --noEmit -p tsconfig.json");

    const verifyAll = pkg.scripts?.["verify:all"] ?? "";
    expect(verifyAll).toContain("pnpm run typecheck");
    expect(verifyAll).toContain("pnpm run verify:android-16kb");
  });
});
