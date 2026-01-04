import { execSync } from "node:child_process";
import fs from "node:fs";

function listTrackedFiles(): string[] {
  return execSync("git ls-files", { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function isPrivateIPv4(hostname: string): boolean {
  const parts = hostname.split(".");
  if (parts.length !== 4) return false;
  const octets = parts.map((p) => Number(p));
  if (octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;

  const a = octets[0];
  const b = octets[1];
  if (a == null || b == null) return false;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost") return true;
  if (host.endsWith(".local")) return true;
  if (host.endsWith(".internal")) return true;
  if (host.endsWith(".corp")) return true;
  if (host.endsWith(".lan")) return true;
  if (host.endsWith(".home")) return true;
  if (host.endsWith(".home.arpa")) return true;
  if (isPrivateIPv4(host)) return true;
  return false;
}

function extractUrls(content: string): string[] {
  // Conservative URL matcher: we only enforce policy on explicit absolute URLs.
  // Avoids false positives on version strings, regexes, etc.
  const matches = content.matchAll(/\bhttps?:\/\/[^\s"'()<>]+/g);
  return Array.from(matches, (m) => m[0] ?? "").filter(Boolean);
}

describe("repo policy: no private URLs", () => {
  it("does not include localhost/private network URLs in tracked files", () => {
    const relevant = listTrackedFiles().filter((file) => {
      return (
        file.startsWith("src/") ||
        file.startsWith("docs/") ||
        file.startsWith("__tests__/") ||
        file.endsWith(".md") ||
        file.endsWith(".ts") ||
        file.endsWith(".tsx") ||
        file.endsWith(".js") ||
        file.endsWith(".json") ||
        file.endsWith(".yml") ||
        file.endsWith(".yaml")
      );
    });

    const offenders: { file: string; url: string; hostname: string }[] = [];
    for (const file of relevant) {
      if (!fs.existsSync(file)) continue;
      if (fs.statSync(file).isDirectory()) continue;
      const content = fs.readFileSync(file, "utf8");
      for (const url of extractUrls(content)) {
        let hostname = "";
        try {
          hostname = new URL(url).hostname;
        } catch {
          // If it's not parseable as a URL, skip it (we only enforce on valid absolute URLs).
          continue;
        }
        if (isPrivateHostname(hostname)) {
          offenders.push({ file, url, hostname });
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
