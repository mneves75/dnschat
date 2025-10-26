import fs from "fs";
import path from "path";

describe("App safe area integration", () => {
  it("declares SafeAreaProvider wrapper", () => {
    const appPath = path.resolve(__dirname, "../src/App.tsx");
    const source = fs.readFileSync(appPath, "utf8");
    expect(source).toMatch(/<SafeAreaProvider>/);
  });
});
