import fs from "node:fs";

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function readPackageJson(): PackageJson {
  return JSON.parse(fs.readFileSync("package.json", "utf8")) as PackageJson;
}

describe("repo policy: dependency hygiene", () => {
  it("does not include heavyweight unused tooling dependencies", () => {
    const pkg = readPackageJson();
    const allDeps = new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ]);

    // Keep this list tight and obviously justified. These are large transitive graphs
    // that tend to bloat installs, slow CI, and broaden attack surface.
    const banned = [
      "playwright",
      "@playwright/test",
      "puppeteer",
      "cypress",
      "detox",
    ];

    const offenders = banned.filter((name) => allDeps.has(name));
    expect(offenders).toEqual([]);
  });
});

