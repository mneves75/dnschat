import fs from "node:fs";

/**
 * The user's theme preference (System/Light/Dark) must apply on every
 * platform. `Appearance.setColorScheme` does not affect react-native-web's
 * `useColorScheme()` (it only tracks the prefers-color-scheme media query),
 * so the palette must resolve the scheme through a hook that combines the
 * persisted preference with the system scheme.
 */
describe("theme preference resolution", () => {
  const HOOK_PATH = "src/ui/theme/resolvedColorScheme.ts";

  it("exposes a resolved color scheme hook", () => {
    expect(fs.existsSync(HOOK_PATH)).toBe(true);

    const source = fs.readFileSync(HOOK_PATH, "utf8");
    expect(source).toMatch(/export function useResolvedColorScheme\(/);
  });

  it("palette resolves scheme from the user preference, not raw useColorScheme", () => {
    const paletteSource = fs.readFileSync(
      "src/ui/theme/imessagePalette.ts",
      "utf8",
    );

    expect(paletteSource).toContain("useResolvedColorScheme");
    expect(paletteSource).not.toMatch(
      /import\s*\{[^}]*\buseColorScheme\b[^}]*\}\s*from\s*["']react-native["']/,
    );
  });
});
