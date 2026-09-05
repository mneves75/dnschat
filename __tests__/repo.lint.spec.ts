import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const projectRoot = process.cwd();

const EXPECTED_OXLINT_PLUGINS = [
  "eslint",
  "typescript",
  "unicorn",
  "oxc",
  "jest",
  "react",
  "import",
  "promise",
  "node",
] as const;

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
      ["scripts/run-ast-grep.js", "--config", "sgconfig.yml", sourcePath],
      {
        cwd: projectRoot,
        encoding: "utf8",
      },
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

// Fixture -> the rule it must trip. Shared with the valid-control test, which
// asserts none of these rule ids appear for a clean file.
const OXLINT_VIOLATION_FIXTURES: ReadonlyArray<readonly [string, string]> = [
  ["unused-variable.ts.txt", "no-unused-vars"],
  ["confusing-timeout.ts.txt", "no-confusing-set-timeout"],
  ["duplicate-hooks.ts.txt", "no-duplicate-hooks"],
  ["focused-test.ts.txt", "no-focused-tests"],
  ["identical-title.ts.txt", "no-identical-title"],
  ["invalid-describe.ts.txt", "valid-describe-callback"],
  ["self-compare.ts.txt", "no-self-compare"],
  ["unobserved-promise-expect.ts.txt", "valid-expect-in-promise"],
];

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

function runOxfmtOnFixture(fixtureName: string) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dnschat-oxfmt-"));
  const sourcePath = path.join(
    tempDir,
    fixtureName.replace(/\.ts\.txt$/, ".ts"),
  );
  const oxfmtBin = path.join(
    projectRoot,
    "node_modules",
    "oxfmt",
    "bin",
    "oxfmt",
  );

  try {
    fs.copyFileSync(
      path.join(projectRoot, "__tests__", "fixtures", "oxfmt", fixtureName),
      sourcePath,
    );

    return spawnSync(
      process.execPath,
      [
        oxfmtBin,
        "--check",
        "--config",
        path.join(projectRoot, ".oxfmtrc.json"),
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
    const usesDeterministicRunner = lintScripts.includes(
      "scripts/run-ast-grep.js",
    );

    expect(usesDirectAstGrep || usesDeterministicRunner).toBe(true);
    expect(lintScripts).toContain("sgconfig.yml");
    const deterministicRunnerExists =
      !usesDeterministicRunner || fs.existsSync("scripts/run-ast-grep.js");
    expect(deterministicRunnerExists).toBe(true);

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

    const config = JSON.parse(fs.readFileSync(".oxlintrc.json", "utf8")) as {
      categories?: Record<string, string>;
      plugins?: string[];
    };

    expect(config.categories?.["correctness"]).toBe("error");
    expect(config.plugins).toEqual(EXPECTED_OXLINT_PLUGINS);
  });

  it("does not retain the obsolete dns-native ESLint toolchain", () => {
    const nativePkg = JSON.parse(
      fs.readFileSync("modules/dns-native/package.json", "utf8"),
    ) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(nativePkg.scripts?.["lint"]).toBeUndefined();
    expect(nativePkg.devDependencies?.["eslint"]).toBeUndefined();
    expect(
      nativePkg.devDependencies?.["@typescript-eslint/eslint-plugin"],
    ).toBeUndefined();
    expect(
      nativePkg.devDependencies?.["@typescript-eslint/parser"],
    ).toBeUndefined();
  });

  it("uses Oxfmt from devDependencies with checked-in write and check commands", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(pkg.devDependencies?.["oxfmt"]).toBeDefined();
    expect(pkg.scripts?.["fmt"]).toBe("oxfmt .");
    expect(pkg.scripts?.["fmt:check"]).toBe("oxfmt --check .");
    expect(pkg.scripts?.["verify:fast"]).toContain("pnpm run fmt:check");
    expect(pkg.scripts?.["verify:all"]).toContain("pnpm run fmt:check");
    expect(fs.existsSync(".oxfmtrc.json")).toBe(true);
  });

  // Each rule family must be caught in BOTH .ts and .tsx sources. ast-grep
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
      "direct-markdown-import.ts.txt",
      "direct-markdown-import.ts",
      "no-direct-markdown-renderer-imports-ts",
    ],
    [
      "direct-markdown-import.tsx.txt",
      "direct-markdown-import.tsx",
      "no-direct-markdown-renderer-imports",
    ],
    // The rules match distinct AST alternatives (import_statement vs
    // call_expression; identifier vs member vs subscript). Each alternative
    // keeps its own planted violation so a narrowed rule cannot pass silently.
    [
      "direct-markdown-require.ts.txt",
      "direct-markdown-require.ts",
      "no-direct-markdown-renderer-imports-ts",
    ],
    [
      "direct-markdown-dynamic.tsx.txt",
      "direct-markdown-dynamic.tsx",
      "no-direct-markdown-renderer-imports",
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
  ])("rejects %s with %s", (fixtureName, sourceName, ruleId) => {
    const result = runLintOnFixture(fixtureName, sourceName);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.error).toBeUndefined();
    expect(result.status).not.toBe(0);
    expect(output).toContain(ruleId);
  });

  it.each([
    ["valid-glass-import.ts.txt", "valid-glass-import.ts"],
    ["valid-glass-import.tsx.txt", "valid-glass-import.tsx"],
    ["valid-native-module.ts.txt", "valid-native-module.ts"],
    ["valid-native-module.tsx.txt", "valid-native-module.tsx"],
    ["valid-markdown-import.ts.txt", "valid-markdown-import.ts"],
    ["valid-markdown-import.tsx.txt", "valid-markdown-import.tsx"],
    ["valid-call-expect.ts.txt", "valid-call-expect.ts"],
    ["valid-call-expect.tsx.txt", "valid-call-expect.tsx"],
  ])("accepts the valid ast-grep control %s", (fixtureName, sourceName) => {
    const result = runLintOnFixture(fixtureName, sourceName);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(output).not.toMatch(
      /no-(legacy-liquid-glass|native-liquid-glass|direct-markdown-renderer|tautological-jest)/,
    );
  });

  it.each(OXLINT_VIOLATION_FIXTURES)(
    "rejects Oxlint fixture %s with %s",
    (fixtureName, ruleId) => {
      const result = runOxlintOnFixture(fixtureName);
      const output = `${result.stdout}${result.stderr}`;

      expect(result.error).toBeUndefined();
      expect(result.status).not.toBe(0);
      expect(output).toContain(ruleId);
    },
  );

  it("accepts the valid Oxlint control", () => {
    const result = runOxlintOnFixture("valid.ts.txt");
    const output = `${result.stdout}${result.stderr}`;

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);

    // Assert on the reported diagnostic count, not the substring "error".
    // A clean run prints nothing on the darwin-arm64 binding and
    // "Found 0 warnings and 0 errors." on linux-x64, and that success
    // summary itself contains "errors" -- so a substring check passes on a
    // developer laptop and fails in CI for a passing lint run.
    const summary = output.match(/Found \d+ warnings? and (\d+) errors?/);
    expect(Number(summary?.[1] ?? 0)).toBe(0);
    // No rule violation was reported for any of the rules the sibling
    // fixtures assert on.
    for (const [, ruleId] of OXLINT_VIOLATION_FIXTURES) {
      expect(output).not.toContain(ruleId);
    }
  });

  it("rejects an unformatted Oxfmt fixture", () => {
    const result = runOxfmtOnFixture("unformatted.ts.txt");

    expect(result.error).toBeUndefined();
    expect(result.status).not.toBe(0);
  });

  it("accepts a formatted Oxfmt fixture", () => {
    const result = runOxfmtOnFixture("formatted.ts.txt");
    const output = `${result.stdout}${result.stderr}`;

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(output).not.toContain("unformatted");
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
  it("runs formatting, TypeScript, and Android 16KB checks in verify:all", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(pkg.scripts?.["typecheck"]).toBe("tsc --noEmit -p tsconfig.json");

    const verifyAll = pkg.scripts?.["verify:all"] ?? "";
    expect(verifyAll).toContain("pnpm run fmt:check");
    expect(verifyAll).toContain("pnpm run typecheck");
    expect(verifyAll).toContain("pnpm run verify:android-16kb");
  });
});
