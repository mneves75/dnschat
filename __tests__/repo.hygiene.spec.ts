import { execSync } from "node:child_process";

function listTrackedFiles(): string[] {
  return execSync("git ls-files", { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function isEnvExample(path: string): boolean {
  if (!path.includes(".env")) return false;
  return path.endsWith(".example") || path.endsWith(".example.local");
}

describe("repo hygiene", () => {
  it("does not track macOS metadata files", () => {
    const tracked = listTrackedFiles();
    const offenders = tracked.filter((p) => p.endsWith("/.DS_Store") || p === ".DS_Store");
    expect(offenders).toEqual([]);
  });

  it("does not track store-release doc dumps under docs/", () => {
    const tracked = listTrackedFiles();
    const offenders = tracked.filter((p) => p.startsWith("docs/App_store/"));
    expect(offenders).toEqual([]);
  });

  it("does not track repo-internal planning folders", () => {
    const tracked = listTrackedFiles();
    const offenders = tracked.filter(
      (p) => p.startsWith("agent_planning/") || p.startsWith(".claude/") || p.startsWith(".cursor/")
    );
    expect(offenders).toEqual([]);
  });

  it("does not track store automation outputs", () => {
    const tracked = listTrackedFiles();
    const offenders = tracked.filter(
      (p) =>
        p.startsWith("ios/fastlane/")
    );
    expect(offenders).toEqual([]);
  });

  it("does not track credential material or local env files", () => {
    const tracked = listTrackedFiles();

    const offenders = tracked.filter((p) => {
      const lower = p.toLowerCase();

      // Environment files: allow only explicit examples.
      if (lower === ".env" || lower.startsWith(".env.")) {
        return !isEnvExample(lower);
      }

      // Common credential material / private keys.
      if (
        lower.endsWith(".p8") ||
        lower.endsWith(".p12") ||
        lower.endsWith(".pem") ||
        lower.endsWith(".key") ||
        lower.endsWith(".keystore") ||
        lower.endsWith(".jks") ||
        lower.endsWith(".mobileprovision")
      ) {
        return true;
      }

      // Known service config files that often include secrets.
      if (lower.endsWith("/google-services.json") || lower.endsWith("/googleservice-info.plist")) {
        return true;
      }

      // Token-bearing dotfiles.
      if (lower === ".npmrc" || lower === ".netrc") {
        return true;
      }

      return false;
    });

    expect(offenders).toEqual([]);
  });
});
