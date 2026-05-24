import fs from "fs";
import path from "path";

describe("App safe area integration", () => {
  it("declares SafeAreaProvider wrapper", () => {
    const appPath = path.resolve(__dirname, "../app/_layout.tsx");
    const source = fs.readFileSync(appPath, "utf8");
    expect(source).toMatch(/<SafeAreaProvider>/);
  });

  it("wraps the native stack with the app palette navigation theme", () => {
    const appPath = path.resolve(__dirname, "../app/_layout.tsx");
    const source = fs.readFileSync(appPath, "utf8");

    expect(source).toContain("createNavigationTheme(palette, isDark)");
    expect(source).toContain("<ThemeProvider value={navigationTheme}>");
  });
});
