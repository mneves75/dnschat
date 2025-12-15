import { execSync } from "node:child_process";
import fs from "node:fs";

/**
 * Repo policy: keep source + docs free of emoji / pictographic glyphs.
 *
 * Rationale:
 * - Avoids inconsistent rendering across platforms/fonts.
 * - Keeps logs and UI symbols deterministic and localizable.
 * - Prevents "cute" debug output from leaking into production UX.
 *
 * Implementation detail:
 * - Use `git ls-files` so the check only applies to tracked files and stays fast.
 * - Prefer explicit ranges over `\p{Extended_Pictographic}` to avoid false positives.
 */
describe("repo policy: no emoji characters", () => {
  it("contains no emoji in tracked source/docs files", () => {
    const trackedFiles = execSync("git ls-files", { encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const relevant = trackedFiles.filter((file) => {
      // Keep this strict: only human-readable text files we expect to be scanned.
      return (
        file.endsWith(".ts") ||
        file.endsWith(".tsx") ||
        file.endsWith(".js") ||
        file.endsWith(".json") ||
        file.endsWith(".md") ||
        file.endsWith(".java") ||
        file.endsWith(".kt") ||
        file.endsWith(".swift") ||
        file.endsWith(".m") ||
        file.endsWith(".mm") ||
        file.endsWith(".gradle") ||
        file.endsWith(".rb") ||
        file.endsWith(".podspec") ||
        file.endsWith(".plist") ||
        file.endsWith(".pbxproj") ||
        file.endsWith(".xml") ||
        file.endsWith(".html") ||
        file.endsWith(".yml") ||
        file.endsWith(".yaml") ||
        file.endsWith(".sh")
      );
    });

    // Prefer explicit ranges over `\p{Extended_Pictographic}`:
    // - Avoids false positives on symbols like © that are not emojis in this repo.
    // - Keeps the rule aligned to the practical "emoji blocks" we want to ban.
    const emojiPattern =
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const offenders: { file: string; sample: string }[] = [];

    for (const file of relevant) {
      // When running in a working tree with uncommitted deletions, `git ls-files`
      // can still include paths that no longer exist on disk.
      if (!fs.existsSync(file)) continue;
      const content = fs.readFileSync(file, "utf8");
      const match = content.match(emojiPattern);
      if (match) {
        const sample = match[0];
        const sampleCodepoints = Array.from(sample)
          .map((ch) => ch.codePointAt(0))
          .filter((cp): cp is number => typeof cp === "number")
          .map(
            (cp) =>
              `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`
          )
          .join(" ");

        offenders.push({ file, sample: sampleCodepoints });
      }
    }

    expect(offenders).toEqual([]);
  });
});
