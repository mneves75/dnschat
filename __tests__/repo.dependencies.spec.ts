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

/**
 * pnpm ignores npm-style `overrides` in package.json; the security floors live in
 * pnpm-workspace.yaml. Parsed with a narrow reader so the repo keeps no YAML dep.
 */
function readPnpmOverrides(path = "pnpm-workspace.yaml"): Record<string, string> {
  const overrides: Record<string, string> = {};
  let inOverrides = false;

  for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    if (/^\S/.test(line)) {
      inOverrides = line.startsWith("overrides:");
      continue;
    }
    if (!inOverrides) continue;

    const match = line.match(/^\s{2}(\S+):\s*(.+?)\s*$/);
    if (!match?.[1] || !match[2]) continue;
    const name = match[1].replace(/^['"]|['"]$/g, "");
    overrides[name] = match[2].replace(/^['"]|['"]$/g, "");
  }

  return overrides;
}

function parseVersion(version: string): [number, number, number] {
  const match = version.trim().match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) throw new Error(`unparseable version: ${version}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function satisfiesFloor(installed: string, floor: string): boolean {
  const [iMajor, iMinor, iPatch] = parseVersion(installed);
  const [fMajor, fMinor, fPatch] = parseVersion(floor.replace(/^[>=^~\s]+/, ""));
  if (iMajor !== fMajor) return iMajor > fMajor;
  if (iMinor !== fMinor) return iMinor > fMinor;
  return iPatch >= fPatch;
}

function trackedSourceFiles(): string[] {
  return execSync("git ls-files app src", { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (path) =>
        (path.endsWith(".ts") || path.endsWith(".tsx")) &&
        fs.existsSync(path),
    );
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

  it("declares security overrides where pnpm actually reads them", () => {
    const pkg = readPackageJson();
    const overrides = readPnpmOverrides();

    // npm-style overrides in package.json are silently ignored by pnpm — a floor
    // declared there would look enforced while resolving to a vulnerable version.
    expect(pkg.overrides).toBeUndefined();

    for (const name of ["brace-expansion", "js-yaml", "uuid", "ws"]) {
      expect(overrides[name]).toBeDefined();
    }
  });

  it("keeps installed transitive versions at or above their security floors", () => {
    const overrides = readPnpmOverrides();

    for (const [name, floor] of Object.entries(overrides)) {
      let installed: string;
      try {
        installed = (require(`${name}/package.json`) as { version: string }).version;
      } catch {
        // Not every floored package is present in every install graph.
        continue;
      }

      expect({ name, installed, floor, ok: satisfiesFloor(installed, floor) }).toEqual({
        name,
        installed,
        floor,
        ok: true,
      });
    }
  });

  it("keeps the native module inside the shared pnpm security graph", () => {
    const nativePkg = readPackageJson("modules/dns-native/package.json");
    const workspace = fs.readFileSync("pnpm-workspace.yaml", "utf8");

    expect(workspace).toContain("- 'modules/dns-native'");
    expect(nativePkg.overrides).toBeUndefined();
    expect(fs.existsSync("modules/dns-native/package-lock.json")).toBe(false);
  });

  it("keeps security overrides compatible with Expo native tooling", () => {
    const uuid = require("uuid") as { v4?: unknown };
    const xcode = require("xcode") as { project?: unknown };

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
