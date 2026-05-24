import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  parseLenientJson,
  parseResolvedVersionFromLockEntry,
  satisfiesRange,
  validateDependencyAlignment,
  validateInstalledDependencyAlignment,
} = require("../scripts/verify-sdk-alignment.js") as {
  parseLenientJson: (raw: string) => Record<string, unknown>;
  parseResolvedVersionFromLockEntry: (entry: unknown) => string | null;
  satisfiesRange: (resolvedVersion: string, declaredRange: string) => boolean;
  validateDependencyAlignment: (args: {
    packageJson: {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    lockfile: {
      packages?: Record<string, unknown>;
    };
    dependencyNames?: string[];
  }) => string[];
  validateInstalledDependencyAlignment: (args: {
    projectRoot: string;
    packageJson: {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    lockfile: {
      packages?: Record<string, unknown>;
    };
    dependencyNames?: string[];
  }) => string[];
};

describe("scripts/verify-sdk-alignment.js", () => {
  it("parses bun-style trailing commas", () => {
    const parsed = parseLenientJson('{"a": 1, "b": {"c": 2,},}');
    expect(parsed).toEqual({ a: 1, b: { c: 2 } });
  });

  it("parses a resolved version from bun lock package entries", () => {
    expect(parseResolvedVersionFromLockEntry(["expo@55.0.2"])).toBe("55.0.2");
    expect(parseResolvedVersionFromLockEntry(["@react-native-menu/menu@2.0.0"])).toBe("2.0.0");
    expect(parseResolvedVersionFromLockEntry(["expo@invalid"])).toBeNull();
  });

  it("validates semver compatibility for ^, ~, >= and exact", () => {
    expect(satisfiesRange("55.0.2", "^55.0.0")).toBe(true);
    expect(satisfiesRange("54.0.30", "^55.0.0")).toBe(false);
    expect(satisfiesRange("4.23.1", "~4.23.0")).toBe(true);
    expect(satisfiesRange("4.24.0", "~4.23.0")).toBe(false);
    expect(satisfiesRange("19.2.0", ">=19.0.0")).toBe(true);
    expect(satisfiesRange("19.2.0", "19.2.0")).toBe(true);
  });

  it("reports mismatches for critical dependencies", () => {
    const issues = validateDependencyAlignment({
      packageJson: {
        dependencies: {
          expo: "^55.0.0",
          react: "19.2.0",
        },
      },
      lockfile: {
        packages: {
          expo: ["expo@54.0.30"],
          react: ["react@19.2.0"],
        },
      },
      dependencyNames: ["expo", "react"],
    });

    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain("[MISMATCH] expo");
  });

  it("reports node_modules mismatch against lockfile", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-sdk-alignment-"));
    const depPackageJsonPath = path.join(tempDir, "node_modules", "expo", "package.json");

    try {
      fs.mkdirSync(path.dirname(depPackageJsonPath), { recursive: true });
      fs.writeFileSync(depPackageJsonPath, JSON.stringify({ name: "expo", version: "54.0.30" }));

      const issues = validateInstalledDependencyAlignment({
        projectRoot: tempDir,
        packageJson: {
          dependencies: {
            expo: "^55.0.0",
          },
        },
        lockfile: {
          packages: {
            expo: ["expo@55.0.2"],
          },
        },
        dependencyNames: ["expo"],
      });

      expect(issues).toContain("[INSTALLED_MISMATCH] expo: declarado=^55.0.0 instalado=54.0.30");
      expect(issues).toContain("[LOCK_INSTALLED_MISMATCH] expo: lock=55.0.2 instalado=54.0.30");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("passes when installed dependency matches lockfile and range", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-sdk-alignment-"));
    const depPackageJsonPath = path.join(tempDir, "node_modules", "expo", "package.json");

    try {
      fs.mkdirSync(path.dirname(depPackageJsonPath), { recursive: true });
      fs.writeFileSync(depPackageJsonPath, JSON.stringify({ name: "expo", version: "55.0.2" }));

      const issues = validateInstalledDependencyAlignment({
        projectRoot: tempDir,
        packageJson: {
          dependencies: {
            expo: "^55.0.0",
          },
        },
        lockfile: {
          packages: {
            expo: ["expo@55.0.2"],
          },
        },
        dependencyNames: ["expo"],
      });

      expect(issues).toHaveLength(0);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
