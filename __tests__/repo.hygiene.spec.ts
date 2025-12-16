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

  it("tracks store metadata under docs/App_store as markdown only", () => {
    const tracked = listTrackedFiles();
    const storeFiles = tracked.filter((p) => p.startsWith("docs/App_store/"));

    const offenders = storeFiles.filter((p) => !p.endsWith(".md"));
    expect(offenders).toEqual([]);
  });

  it("does not track repo-internal planning folders", () => {
    const tracked = listTrackedFiles();
    const offenders = tracked.filter(
      (p) => p.startsWith("agent_planning/") || p.startsWith(".claude/") || p.startsWith(".cursor/")
    );
    expect(offenders).toEqual([]);
  });

  it("tracks fastlane config/screenshots but not generated reports", () => {
    const tracked = listTrackedFiles();
    const fastlaneFiles = tracked.filter((p) => p.startsWith("ios/fastlane/"));

    // Generated artifacts we do not want in git.
    const forbidden = fastlaneFiles.filter(
      (p) => p === "ios/fastlane/report.xml" || p.endsWith(".log"),
    );
    expect(forbidden).toEqual([]);

    const allowed = fastlaneFiles.filter((p) => {
      if (p === "ios/fastlane/Appfile") return true;
      if (p === "ios/fastlane/Fastfile") return true;
      if (p === "ios/fastlane/Snapfile") return true;
      if (p === "ios/fastlane/README.md") return true;
      if (p === "ios/fastlane/screenshots/screenshots.html") return true;
      if (p.startsWith("ios/fastlane/screenshots/") && p.endsWith(".png")) return true;
      return false;
    });

    const unknown = fastlaneFiles.filter((p) => !allowed.includes(p));
    expect(unknown).toEqual([]);
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
