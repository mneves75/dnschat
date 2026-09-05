import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

describe("scripts/sync-versions.js", () => {
  it.each([
    "app.json",
    "ios/DNSChat.xcodeproj/project.pbxproj",
    "android/app/build.gradle",
  ])(
    "fails rather than reporting success when writing %s fails",
    (failedPath) => {
      const root = fs.mkdtempSync(
        path.join(os.tmpdir(), "dnschat-version-write-"),
      );
      try {
        for (const file of [
          "package.json",
          "app.json",
          "ios/DNSChat.xcodeproj/project.pbxproj",
          "android/app/build.gradle",
        ]) {
          const target = path.join(root, file);
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.copyFileSync(path.resolve(file), target);
        }
        const faultPath = path.join(root, "fault.cjs");
        fs.writeFileSync(
          faultPath,
          `const fs = require('node:fs');\nconst write = fs.writeFileSync;\nfs.writeFileSync = function(file, ...args) {\nif (file === ${JSON.stringify(failedPath)}) throw new Error('fixture write denied');\nreturn write.call(this, file, ...args);\n};\n`,
        );
        const result = spawnSync(
          process.execPath,
          [
            "--require",
            faultPath,
            path.resolve("scripts/sync-versions.js"),
            "--bump-build",
          ],
          { cwd: root, encoding: "utf8" },
        );
        expect(result.status).toBe(1);
        expect(result.stderr).toContain("fixture write denied");
        expect(result.stdout).not.toContain("Successfully updated");
        expect(result.stdout).not.toContain(
          "All versions are already synchronized",
        );
      } finally {
        fs.rmSync(root, { recursive: true, force: true });
      }
    },
  );
  it("does not propose changes when versions are already synchronized", () => {
    const scriptPath = path.resolve(__dirname, "../scripts/sync-versions.js");
    const output = execFileSync(process.execPath, [scriptPath, "--dry-run"], {
      encoding: "utf8",
    });

    expect(output).toContain("All versions are already synchronized.");
  });

  it("rejects partially numeric explicit build numbers", () => {
    const scriptPath = path.resolve(__dirname, "../scripts/sync-versions.js");

    expect(() =>
      execFileSync(
        process.execPath,
        [scriptPath, "--dry-run", "--build-number", "42abc"],
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      ),
    ).toThrow(/Invalid --build-number/);
  });
});
