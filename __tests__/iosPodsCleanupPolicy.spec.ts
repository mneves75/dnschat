import fs from "node:fs";

describe("iOS pods cleanup policy", () => {
  it("does not delete ios/Podfile.lock in the default npm clean-ios script", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };
    const cleanScript = pkg.scripts?.["clean-ios"] ?? "";
    expect(cleanScript).not.toContain("Podfile.lock");
  });

  it("does not unconditionally delete ios/Podfile.lock in fix-cocoapods.sh", () => {
    const scriptPath = "scripts/fix-cocoapods.sh";
    const content = fs.readFileSync(scriptPath, "utf8");

    // The script may support an explicit reset flag, but lockfile deletion must never be the default behavior.
    // This keeps CocoaPods installs deterministic and consistent with ios/Podfile.lock being tracked.
    expect(content).toContain("--reset-lock");

    const lines = content.split(/\r?\n/);
    let insideResetLockBlock = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('if [ "$RESET_LOCK" -eq 1 ]; then')) {
        insideResetLockBlock = true;
        continue;
      }

      if (insideResetLockBlock && trimmed === "fi") {
        insideResetLockBlock = false;
        continue;
      }

      if (trimmed === "rm -rf Podfile.lock") {
        if (!insideResetLockBlock) {
          throw new Error(
            "scripts/fix-cocoapods.sh deletes Podfile.lock outside the --reset-lock guarded block",
          );
        }
      }
    }
  });
});
