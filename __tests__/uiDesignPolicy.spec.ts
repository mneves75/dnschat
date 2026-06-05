import { execSync } from "node:child_process";
import fs from "node:fs";

function listUiSourceFiles(): string[] {
  return execSync("git ls-files src/components src/navigation", { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"));
}

function stripLineComments(source: string): string {
  return source
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, ""))
    .join("\n");
}

describe("UI design policy", () => {
  const settingsSource = fs.readFileSync("src/navigation/screens/GlassSettings.tsx", "utf8");

  it("does not use pure black literals in component or screen implementation styles", () => {
    const offenders = listUiSourceFiles().filter((file) => {
      if (!fs.existsSync(file)) return false;
      const source = stripLineComments(fs.readFileSync(file, "utf8"));
      return /["']#000(?:000)?["']/.test(source);
    });

    expect(offenders).toEqual([]);
  });

  it("keeps app interactive surfaces on Pressable-based feedback primitives", () => {
    const offenders = listUiSourceFiles().filter((file) => {
      if (!fs.existsSync(file)) return false;
      const source = stripLineComments(fs.readFileSync(file, "utf8"));
      return /<TouchableOpacity\b/.test(source) ||
        /import\s*\{[^}]*\bTouchableOpacity\b[^}]*\}\s*from\s*["']react-native["']/.test(
          source,
        );
    });

    expect(offenders).toEqual([]);
  });

  it("keeps theme picker options accessible with option-level hints", () => {
    expect(settingsSource).toContain("hint: t(");
    expect(settingsSource).toContain('"screen.settings.sections.appearance.optionHint"');
    expect(settingsSource).toContain("accessibilityHint={option.hint}");
  });
});
