import { execSync } from "node:child_process";
import fs from "node:fs";

const APP_ALERT_PATH = "src/utils/appAlert.ts";

function listRuntimeSourceFiles(): string[] {
  return execSync("git ls-files src app", { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
    .filter((file) => !file.startsWith("src/i18n/messages/"))
    .filter((file) => file !== APP_ALERT_PATH);
}

function stripLineComments(source: string): string {
  return source
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, ""))
    .join("\n");
}

describe("cross-platform alert policy", () => {
  it("provides a platform-aware alert utility that branches for web", () => {
    expect(fs.existsSync(APP_ALERT_PATH)).toBe(true);

    const source = fs.readFileSync(APP_ALERT_PATH, "utf8");
    expect(source).toContain('Platform.OS === "web"');
    expect(source).toMatch(/export function appAlert\(/);
  });

  it("keeps react-native Alert out of screens and services (no-op on web)", () => {
    const offenders = listRuntimeSourceFiles().filter((file) => {
      if (!fs.existsSync(file)) return false;
      const source = stripLineComments(fs.readFileSync(file, "utf8"));
      return (
        /\bAlert\.alert\s*\(/.test(source) ||
        /import\s*\{[^}]*\bAlert\b[^}]*\}\s*from\s*["']react-native["']/.test(
          source,
        )
      );
    });

    expect(offenders).toEqual([]);
  });
});
