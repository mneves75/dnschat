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
  hits: string[]
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
    if (!fs.existsSync(pbxproj)) return;

    const content = fs.readFileSync(pbxproj, "utf8");
    // `DEVELOPMENT_TEAM = "<TEAMID>";` makes the repo non-portable for others.
    // Keep it empty (`""`) and let developers configure signing locally.
    const matches = content.matchAll(/DEVELOPMENT_TEAM\s*=\s*([^;]+);/g);

    for (const match of matches) {
      const configured = (match[1] ?? "").trim();
      if (configured !== '""') {
        throw new Error(
          "ios/DNSChat.xcodeproj/project.pbxproj contains DEVELOPMENT_TEAM entries; keep it empty for public repos",
        );
      }
    }
  });
});
