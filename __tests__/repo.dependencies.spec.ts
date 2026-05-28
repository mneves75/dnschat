import fs from "node:fs";
import { execSync } from "node:child_process";

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  overrides?: Record<string, string>;
};

function readPackageJson(path = "package.json"): PackageJson {
  return JSON.parse(fs.readFileSync(path, "utf8")) as PackageJson;
}

function trackedSourceFiles(): string[] {
  return execSync("git ls-files app src", { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter((path) => path.endsWith(".ts") || path.endsWith(".tsx"));
}

describe("repo policy: dependency hygiene", () => {
  it("does not include heavyweight unused tooling dependencies", () => {
    const pkg = readPackageJson();
    const allDeps = new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ]);

    // Keep this list tight and obviously justified. These are large transitive graphs
    // that tend to bloat installs, slow CI, and broaden attack surface.
    const banned = [
      "playwright",
      "@playwright/test",
      "puppeteer",
      "cypress",
      "detox",
    ];

    const offenders = banned.filter((name) => allDeps.has(name));
    expect(offenders).toEqual([]);
  });

  it("does not use dynamic React Native versions in native Gradle modules", () => {
    const gradle = fs.readFileSync("modules/dns-native/android/build.gradle", "utf8");

    expect(gradle).toContain('implementation "com.facebook.react:react-android"');
    expect(gradle).not.toContain("react-native:+");
  });

  it("keeps security overrides compatible with Expo native tooling", () => {
    const pkg = readPackageJson();
    const nativePkg = readPackageJson("modules/dns-native/package.json");
    const uuid = require("uuid") as { v4?: unknown };
    const uuidPackage = require("uuid/package.json") as { version?: string };
    const xcode = require("xcode") as { project?: unknown };

    expect(pkg.overrides).toEqual(
      expect.objectContaining({
        "brace-expansion": "5.0.6",
        uuid: "11.1.1",
        ws: "8.20.1",
      }),
    );
    expect(nativePkg.overrides).toEqual(
      expect.objectContaining({
        "brace-expansion": "5.0.6",
      }),
    );
    expect(pkg.overrides?.["uuid"]).toBe("11.1.1");
    expect(uuidPackage.version).toBe("11.1.1");
    expect(typeof uuid.v4).toBe("function");
    expect(typeof xcode.project).toBe("function");
  });

  it("does not import native Expo modules unless their JS and iOS native dependencies are present", () => {
    const pkg = readPackageJson();
    const podfileLock = fs.existsSync("ios/Podfile.lock")
      ? fs.readFileSync("ios/Podfile.lock", "utf8")
      : "";
    const expoImageImports = trackedSourceFiles().filter((file) => {
      const content = fs.readFileSync(file, "utf8");
      return /from\s+["']expo-image["']|require\(["']expo-image["']\)/.test(content);
    });

    if (expoImageImports.length === 0) {
      expect(pkg.dependencies?.["expo-image"]).toBeUndefined();
      return;
    }

    expect(pkg.dependencies?.["expo-image"]).toBeDefined();
    expect(podfileLock).toContain("ExpoImage");
  });
});
