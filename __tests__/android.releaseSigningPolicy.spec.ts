import fs from "node:fs";

describe("android release policy: signing config", () => {
  it("does not sign release builds with the debug keystore", () => {
    const gradle = fs.readFileSync("android/app/build.gradle", "utf8");

    // We explicitly disallow debug signing for release builds.
    // Release artifacts must be signed via injected CI props or a local keystore.
    expect(gradle).not.toMatch(
      /buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?\bsigningConfig\s+signingConfigs\.debug\b/,
    );
  });

  it("wires release build type to a release signing config", () => {
    const gradle = fs.readFileSync("android/app/build.gradle", "utf8");
    expect(gradle).toMatch(
      /buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?\bhasReleaseSigning\b[\s\S]*?\bsigningConfig\s+signingConfigs\.release\b/,
    );
  });
});
