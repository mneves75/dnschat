import { execFileSync } from "node:child_process";
import fs from "node:fs";

function readJsonFile(path: string): unknown {
  const raw = fs.readFileSync(path, "utf8");
  return JSON.parse(raw) as unknown;
}

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function collectNonEmptyStringValues(
  value: Json,
  keyNames: Set<string>,
  prefix: string,
  hits: string[],
): void {
  if (value === null) return;

  if (typeof value === "string") return;
  if (typeof value === "number") return;
  if (typeof value === "boolean") return;

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const child = value[i];
      if (child === undefined) continue;
      collectNonEmptyStringValues(child, keyNames, `${prefix}[${i}]`, hits);
    }
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (keyNames.has(key) && typeof child === "string" && child.trim() !== "") {
      hits.push(path);
      continue;
    }
    collectNonEmptyStringValues(child, keyNames, path, hits);
  }
}

describe("repo policy: no release credentials", () => {
  it("does not commit EAS submit credentials in eas.json", () => {
    if (!fs.existsSync("eas.json")) return;

    const parsed = readJsonFile("eas.json") as Json;
    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      throw new Error("eas.json must be an object");
    }

    const submit = (parsed as { [key: string]: Json })["submit"];
    if (submit === undefined || submit === null) return;

    const sensitiveKeys = new Set(["appleId", "ascAppId", "appleTeamId"]);
    const hits: string[] = [];
    collectNonEmptyStringValues(submit, sensitiveKeys, "submit", hits);

    expect(hits).toEqual([]);
  });

  it("does not commit iOS code signing team identifiers", () => {
    const pbxproj = "ios/DNSChat.xcodeproj/project.pbxproj";
    const content = fs.existsSync(pbxproj)
      ? fs.readFileSync(pbxproj, "utf8")
      : "";
    // `DEVELOPMENT_TEAM = "<TEAMID>";` makes the repo non-portable for others.
    // Keep it empty (`""`) and let developers configure signing locally.
    const matches = content.matchAll(/DEVELOPMENT_TEAM\s*=\s*([^;]+);/g);

    const configuredTeams = [...matches]
      .map((match) => (match[1] ?? "").trim())
      .filter((configured) => configured !== '""');

    expect(configuredTeams).toEqual([]);
  });

  it("keeps iOS export compliance aligned for standard app encryption", () => {
    const infoPlist = "ios/DNSChat/Info.plist";
    if (!fs.existsSync(infoPlist)) return;

    const content = fs.readFileSync(infoPlist, "utf8");
    expect(content).toContain("<key>ITSAppUsesNonExemptEncryption</key>");
    expect(content).toMatch(
      /<key>ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/,
    );
  });

  it("ships no test-runtime branch that can weaken production crypto", () => {
    // encryptionService once returned a constant key and a constant AES-GCM
    // nonce whenever process.env.JEST_WORKER_ID was set. Metro only replaces
    // dot-notation process.env.NODE_ENV, so that bracket-notation check - and
    // both weakened branches - shipped in the release bundle. Reusing a GCM
    // nonce under one key leaks the authentication key, not just plaintext,
    // so tests must supply their inputs through mocks instead.
    const sources = execFileSync(
      "git",
      ["ls-files", "src", "modules", "app", "entry.tsx"],
      { encoding: "utf8" },
    )
      .split("\n")
      .filter((file) => /\.(ts|tsx)$/.test(file));

    // These two gate log verbosity only, and both sit behind a __DEV__ check
    // that is false in release, so no behavior they guard reaches production.
    // Anything else matching is a shipped test-runtime branch: reject it.
    const loggingOnly = new Set([
      "src/utils/devLog.ts",
      "modules/dns-native/index.ts",
    ]);

    const offenders = sources.filter(
      (file) =>
        !loggingOnly.has(file) &&
        /JEST_WORKER_ID|isTestRuntime/.test(fs.readFileSync(file, "utf8")),
    );

    expect(offenders).toEqual([]);
  });
});
