import fs from "node:fs";

describe("repo policy: git hooks are installed and enforce gates", () => {
  it("installs repo-managed pre-commit hook via npm prepare", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };
    const prepare = pkg.scripts?.["prepare"] ?? "";
    expect(prepare).toContain("scripts/install-git-hooks.js");
  });

  it("pre-commit hook runs verify:ios-pods, lint, and tests", () => {
    const script = fs.readFileSync("scripts/install-git-hooks.js", "utf8");

    // Ensure the generated hook blocks commits when these gates fail.
    expect(script).toContain("pre-commit: verifying iOS pods lockfile");
    expect(script).toContain("bun run verify:ios-pods");

    expect(script).toContain("pre-commit: running lint");
    expect(script).toContain("bun run lint");

    expect(script).toContain("pre-commit: running unit tests");
    expect(script).toContain("bun run test -- --bail --passWithNoTests");
  });
});
