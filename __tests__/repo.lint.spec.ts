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

function runOxlintOnFixture(fixtureName: string) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dnschat-oxlint-"));
  const sourcePath = path.join(
    tempDir,
    fixtureName.replace(/\.ts\.txt$/, ".test.ts"),
  );
  const oxlintBin = path.join(
    projectRoot,
    "node_modules",
    "oxlint",
    "bin",
    "oxlint",
  );

  try {
    fs.copyFileSync(
      path.join(projectRoot, "__tests__", "fixtures", "oxlint", fixtureName),
      sourcePath,
    );

    return spawnSync(
      process.execPath,
      [
        oxlintBin,
        "--config",
        path.join(projectRoot, ".oxlintrc.json"),
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

  it("uses Oxlint from devDependencies with a checked-in config", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(pkg.devDependencies?.["oxlint"]).toBeDefined();
    expect(pkg.scripts?.["lint:oxlint"]).toBe("oxlint .");
    expect(pkg.scripts?.["lint"]).toContain("pnpm run lint:oxlint");
    expect(pkg.scripts?.["lint"]).toContain("pnpm run lint:ast-grep");
    expect(fs.existsSync(".oxlintrc.json")).toBe(true);
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
    [
      "tautological-expect.ts.txt",
      "tautological-expect.ts",
      "no-tautological-jest-equality-ts",
    ],
    [
      "tautological-expect.tsx.txt",
      "tautological-expect.tsx",
      "no-tautological-jest-equality",
    ],
    [
      "tautological-member-expect.ts.txt",
      "tautological-member-expect.ts",
      "no-tautological-jest-equality-ts",
    ],
    [
      "tautological-subscript-expect.tsx.txt",
      "tautological-subscript-expect.tsx",
      "no-tautological-jest-equality",
    ],
    [
      "direct-markdown-import.ts.txt",
      "direct-markdown-import.ts",
      "no-direct-markdown-renderer-imports-ts",
    ],
    [
      "direct-markdown-import.tsx.txt",
      "direct-markdown-import.tsx",
      "no-direct-markdown-renderer-imports",
    ],
    [
      "direct-markdown-require.ts.txt",
      "direct-markdown-require.ts",
      "no-direct-markdown-renderer-imports-ts",
    ],
    [
      "direct-markdown-require.tsx.txt",
      "direct-markdown-require.tsx",
      "no-direct-markdown-renderer-imports",
    ],
    [
      "direct-markdown-dynamic.ts.txt",
      "direct-markdown-dynamic.ts",
      "no-direct-markdown-renderer-imports-ts",
    ],
    [
      "direct-markdown-dynamic.tsx.txt",
      "direct-markdown-dynamic.tsx",
      "no-direct-markdown-renderer-imports",
    ],
  ])("rejects %s with %s", (fixtureName, sourceName, ruleId) => {
    const result = runLintOnFixture(fixtureName, sourceName);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.error).toBeUndefined();
    expect(result.status).not.toBe(0);
    expect(output).toContain(ruleId);
  });

  it("accepts a Jest equality assertion with an independent expected value", () => {
    const result = runLintOnFixture(
      "valid-independent-expect.ts.txt",
      "valid-independent-expect.ts",
    );
    const output = `${result.stdout}${result.stderr}`;

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(output).not.toContain("no-tautological-jest-equality");
  });

  it.each([
    ["valid-call-expect.ts.txt", "valid-call-expect.ts"],
    ["valid-call-expect.tsx.txt", "valid-call-expect.tsx"],
  ])(
    "accepts a relationship asserted across separate call evaluations in %s",
    (fixtureName, sourceName) => {
      const result = runLintOnFixture(fixtureName, sourceName);
      const output = `${result.stdout}${result.stderr}`;

      expect(result.error).toBeUndefined();
      expect(result.status).toBe(0);
      expect(output).not.toContain("no-tautological-jest-equality");
    },
  );

  it.each([
    ["confusing-timeout.ts.txt", "no-confusing-set-timeout"],
    ["duplicate-hooks.ts.txt", "no-duplicate-hooks"],
    ["focused-test.ts.txt", "no-focused-tests"],
    ["identical-title.ts.txt", "no-identical-title"],
    ["invalid-describe.ts.txt", "valid-describe-callback"],
    ["self-compare.ts.txt", "no-self-compare"],
    ["unobserved-promise-expect.ts.txt", "valid-expect-in-promise"],
  ])("rejects Oxlint fixture %s with %s", (fixtureName, ruleId) => {
    const result = runOxlintOnFixture(fixtureName);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.error).toBeUndefined();
    expect(result.status).not.toBe(0);
    expect(output).toContain(ruleId);
  });

  it("accepts the valid Oxlint control", () => {
    const result = runOxlintOnFixture("valid.ts.txt");
    const output = `${result.stdout}${result.stderr}`;

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(output).not.toContain("error");
  });

  it("loads at least eight effective ast-grep rules", () => {
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
    expect(Number(effectiveRuleCount)).toBeGreaterThanOrEqual(8);
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
