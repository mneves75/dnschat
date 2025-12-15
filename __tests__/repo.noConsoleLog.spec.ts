import { execSync } from "node:child_process";
import fs from "node:fs";

function listTrackedFiles(): string[] {
  return execSync("git ls-files", { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

describe("repo policy: minimize console.log usage", () => {
  it("does not use console.* in src/ (except approved utilities)", () => {
    const allowlist = new Set([
      "src/utils/devLog.ts",
      "src/utils/androidStartupDiagnostics.ts",
      "src/components/ErrorBoundary.tsx",
    ]);

    const offenders: string[] = [];
    for (const file of listTrackedFiles()) {
      if (!file.startsWith("src/")) continue;
      if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
      if (allowlist.has(file)) continue;
      if (!fs.existsSync(file)) continue;

      const content = fs.readFileSync(file, "utf8");
      if (
        content.includes("console.log(") ||
        content.includes("console.warn(") ||
        content.includes("console.error(")
      ) {
        offenders.push(file);
      }
    }

    expect(offenders).toEqual([]);
  });
});
