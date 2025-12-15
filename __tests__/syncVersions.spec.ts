import { execFileSync } from "node:child_process";
import path from "node:path";

describe("scripts/sync-versions.js", () => {
  it("does not propose changes when versions are already synchronized", () => {
    const scriptPath = path.resolve(__dirname, "../scripts/sync-versions.js");
    const output = execFileSync(process.execPath, [scriptPath, "--dry-run"], {
      encoding: "utf8",
    });

    expect(output).toContain("All versions are already synchronized.");
  });
});

