import { execFileSync } from "node:child_process";
import fs from "node:fs";

function read(path: string): string {
  return fs.readFileSync(path, "utf8");
}

function findMutableActionRefs(content: string): string[] {
  return [...content.matchAll(/^\s*uses:\s*([^\s#]+)@([^\s#]+)/gm)]
    .filter((match) => !/^[a-f0-9]{40}$/.test(match[2] ?? ""))
    .map((match) => `${match[1]}@${match[2]}`);
}

describe("repo policy: CI configuration exists and matches spec", () => {
  it("has CI workflow that runs format, lint, and unit tests on PRs and main", () => {
    const workflow = ".github/workflows/ci.yml";
    expect(fs.existsSync(workflow)).toBe(true);
    const content = read(workflow);

    expect(content).toContain("on:");
    expect(content).toContain("pull_request");
    expect(content).toContain("push:");
    expect(content).toContain("branches:");
    expect(content).toContain("- main");

    expect(content).toContain("pnpm install --frozen-lockfile");
    expect(content).toContain("pnpm run verify:ios-pods");
    expect(content).toContain("pnpm run verify:expo-doctor");
    expect(content).toContain("pnpm run verify:sdk-alignment");
    expect(content).toContain("pnpm run verify:typed-routes");
    expect(content).toContain("pnpm run verify:dnsresolver-sync");
    expect(content).toContain("pnpm run verify:react-compiler");
    expect(content).toContain("pnpm run fmt:check");
    expect(content).toContain("pnpm run lint");
    expect(content).toContain("pnpm run test");
  });

  it("installs a pre-commit hook with the same formatting gate", () => {
    const content = read("scripts/install-git-hooks.js");

    expect(content).toContain("pnpm run fmt:check");
    expect(content).toContain("pnpm run lint");
    expect(content).toContain("pnpm run test --bail");
  });

  it("runs dns-native module tests in CI (release verification invariant)", () => {
    const workflow = ".github/workflows/ci.yml";
    expect(fs.existsSync(workflow)).toBe(true);
    const content = read(workflow);

    // The native package shares the root pnpm lock so audit and install evidence
    // cover the exact graph exercised by this job.
    expect(content).toContain("dns-native:");
    expect(content).toContain("corepack pnpm install --frozen-lockfile");
    expect(content).toContain("Test (modules/dns-native)");
    expect(content).toContain("pnpm --filter @dnschat/dns-native run test");
    expect(content).not.toContain("npm ci");
  });

  it("pins every GitHub Action to an immutable commit SHA", () => {
    expect(findMutableActionRefs("uses: actions/checkout@v6")).toEqual([
      "actions/checkout@v6",
    ]);
    expect(
      findMutableActionRefs(`uses: actions/checkout@${"a".repeat(40)} # v6`),
    ).toEqual([]);

    const offenders = fs
      .readdirSync(".github/workflows")
      .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
      .flatMap((file) =>
        findMutableActionRefs(read(`.github/workflows/${file}`)).map(
          (reference) => `${file}: ${reference}`,
        ),
      );

    expect(offenders).toEqual([]);
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
    expect(content).toContain("node-version-file: .node-version");
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
