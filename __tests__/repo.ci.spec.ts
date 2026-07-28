import { execFileSync } from "node:child_process";
import fs from "node:fs";

function read(path: string): string {
  return fs.readFileSync(path, "utf8");
}

describe("repo policy: CI configuration exists and matches spec", () => {
  const expectOneOf = (content: string, candidates: string[]) => {
    const found = candidates.some((candidate) => content.includes(candidate));
    expect(found).toBe(true);
  };

  it("has CI workflow that runs lint + unit tests on PRs and main", () => {
    const workflow = ".github/workflows/ci.yml";
    expect(fs.existsSync(workflow)).toBe(true);
    const content = read(workflow);

    expect(content).toContain("on:");
    expect(content).toContain("pull_request");
    expect(content).toContain("push:");
    expect(content).toContain("branches:");
    expect(content).toContain("- main");

    expectOneOf(content, ["npm ci", "pnpm install --frozen-lockfile"]);
    expectOneOf(content, ["npm run verify:ios-pods", "pnpm run verify:ios-pods"]);
    expectOneOf(content, ["npm run verify:expo-doctor", "pnpm run verify:expo-doctor"]);
    expectOneOf(content, ["npm run verify:sdk-alignment", "pnpm run verify:sdk-alignment"]);
    expectOneOf(content, ["npm run verify:typed-routes", "pnpm run verify:typed-routes"]);
    expectOneOf(content, ["npm run verify:dnsresolver-sync", "pnpm run verify:dnsresolver-sync"]);
    expectOneOf(content, ["npm run verify:react-compiler", "pnpm run verify:react-compiler"]);
    expectOneOf(content, ["npm run lint", "pnpm run lint"]);
    expectOneOf(content, ["npm test", "pnpm run test"]);
  });

  it("runs dns-native module tests in CI (release verification invariant)", () => {
    const workflow = ".github/workflows/ci.yml";
    expect(fs.existsSync(workflow)).toBe(true);
    const content = read(workflow);

    // The public release hardening spec requires the `modules/dns-native` package
    // to stay tested and independently installable.
    expect(content).toContain("dns-native:");
    expect(content).toContain("working-directory: modules/dns-native");
    expect(content).toContain("Install (modules/dns-native)");
    expect(content).toContain("Test (modules/dns-native)");
  });

  it("has gitleaks workflow that uses repo config", () => {
    const workflow = ".github/workflows/gitleaks.yml";
    expect(fs.existsSync(workflow)).toBe(true);
    const content = read(workflow);

    expect(content).toContain("gitleaks/gitleaks-action@");
    expect(content).toContain("GITLEAKS_CONFIG: .gitleaks.toml");
    expect(fs.existsSync(".gitleaks.toml")).toBe(true);
  });

  it("has CodeQL workflow (optional hardening) checked in", () => {
    const workflow = ".github/workflows/codeql.yml";
    expect(fs.existsSync(workflow)).toBe(true);
    const content = read(workflow);

    expect(content).toContain("github/codeql-action/");
  });

  it("generates SBOM artifacts in CI (supply-chain requirement)", () => {
    const workflow = ".github/workflows/ci.yml";
    expect(fs.existsSync(workflow)).toBe(true);
    const content = read(workflow);

    expect(content).toContain("sbom:");
    expect(content).toContain("anchore/sbom-action@");
    expect(content).toContain("artifacts/sbom/");
  });

  it("runs Android Gradle builds in CI (prevents build.gradle regressions)", () => {
    const workflow = ".github/workflows/ci.yml";
    expect(fs.existsSync(workflow)).toBe(true);
    const content = read(workflow);

    // Android job must exist with Java 17 setup and Gradle builds
    expect(content).toContain("android:");
    expect(content).toContain("timeout-minutes: 75");
    expect(content).toContain("actions/setup-java@");
    expect(content).toContain("java-version: 17");
    expect(content).toMatch(/node-version: '?22[.']/);
    expect(content).toContain("gradle/actions/setup-gradle@");
    expect(content).toContain("assembleDebug");
    expect(content).toContain("assembleRelease");
    expect(content).toContain("verify:android-16kb");
  });

  it("discovers at least 100 test files", () => {
    const output = execFileSync(
      process.execPath,
      [require.resolve("jest/bin/jest"), "--listTests", "--json"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    const testPaths = JSON.parse(output) as string[];

    expect(testPaths.length).toBeGreaterThanOrEqual(100);
  });
});
