#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const CRITICAL_DEPENDENCIES = [
  "expo",
  "react",
  "react-native",
  "react-native-reanimated",
  "expo-router",
  "expo-glass-effect",
  "react-native-screens",
];

function parseLenientJson(raw) {
  // bun.lock uses JSON-like syntax with trailing commas; normalize before parse.
  return JSON.parse(raw.replace(/,\s*([}\]])/g, "$1"));
}

function parseSemver(version) {
  const cleaned = String(version).trim().replace(/^[=v]+/, "");
  const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function compareSemver(left, right) {
  if (left.major !== right.major) return left.major - right.major;
  if (left.minor !== right.minor) return left.minor - right.minor;
  return left.patch - right.patch;
}

function parseResolvedVersionFromLockEntry(lockEntry) {
  if (!Array.isArray(lockEntry) || typeof lockEntry[0] !== "string") {
    return null;
  }

  const descriptor = lockEntry[0];
  const idx = descriptor.lastIndexOf("@");
  if (idx < 0 || idx === descriptor.length - 1) return null;

  const version = descriptor.slice(idx + 1);
  return parseSemver(version) ? version : null;
}

function satisfiesRange(resolvedVersion, declaredRange) {
  const resolved = parseSemver(resolvedVersion);
  if (!resolved) return false;

  const range = String(declaredRange).trim();
  if (!range) return false;

  if (range.startsWith("^")) {
    const base = parseSemver(range.slice(1));
    return !!base && resolved.major === base.major && compareSemver(resolved, base) >= 0;
  }

  if (range.startsWith("~")) {
    const base = parseSemver(range.slice(1));
    return (
      !!base &&
      resolved.major === base.major &&
      resolved.minor === base.minor &&
      compareSemver(resolved, base) >= 0
    );
  }

  if (range.startsWith(">=")) {
    const base = parseSemver(range.slice(2));
    return !!base && compareSemver(resolved, base) >= 0;
  }

  const exact = parseSemver(range);
  return !!exact && compareSemver(resolved, exact) === 0;
}

function validateDependencyAlignment({
  packageJson,
  lockfile,
  dependencyNames = CRITICAL_DEPENDENCIES,
}) {
  const issues = [];
  const declaredDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };
  const packagesMap = lockfile.packages || {};

  for (const depName of dependencyNames) {
    const declaredRange = declaredDeps[depName];
    if (!declaredRange) {
      continue;
    }

    const lockEntry = packagesMap[depName];
    if (!lockEntry) {
      issues.push(
        `[MISSING] ${depName}: presente no package.json (${declaredRange}), ausente em bun.lock`,
      );
      continue;
    }

    const resolvedVersion = parseResolvedVersionFromLockEntry(lockEntry);
    if (!resolvedVersion) {
      issues.push(`[PARSE] ${depName}: não foi possível ler versão resolvida no bun.lock`);
      continue;
    }

    if (!satisfiesRange(resolvedVersion, declaredRange)) {
      issues.push(
        `[MISMATCH] ${depName}: declarado=${declaredRange} resolvido=${resolvedVersion}`,
      );
    }
  }

  return issues;
}

function validateInstalledDependencyAlignment({
  projectRoot,
  packageJson,
  lockfile,
  dependencyNames = CRITICAL_DEPENDENCIES,
  fsImpl = fs,
  pathImpl = path,
}) {
  const issues = [];
  const declaredDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };
  const packagesMap = lockfile.packages || {};

  for (const depName of dependencyNames) {
    const declaredRange = declaredDeps[depName];
    if (!declaredRange) {
      continue;
    }

    const installedPackageJsonPath = pathImpl.join(
      projectRoot,
      "node_modules",
      depName,
      "package.json",
    );

    if (!fsImpl.existsSync(installedPackageJsonPath)) {
      issues.push(`[INSTALLED_MISSING] ${depName}: ausente em node_modules`);
      continue;
    }

    let installedVersion = null;
    try {
      const installedPackageJson = JSON.parse(
        fsImpl.readFileSync(installedPackageJsonPath, "utf8"),
      );
      installedVersion =
        typeof installedPackageJson.version === "string" ? installedPackageJson.version : null;
    } catch {
      issues.push(
        `[INSTALLED_PARSE] ${depName}: falha ao ler ${pathImpl.relative(projectRoot, installedPackageJsonPath)}`,
      );
      continue;
    }

    if (!installedVersion || !parseSemver(installedVersion)) {
      issues.push(`[INSTALLED_PARSE] ${depName}: versão instalada inválida`);
      continue;
    }

    if (!satisfiesRange(installedVersion, declaredRange)) {
      issues.push(
        `[INSTALLED_MISMATCH] ${depName}: declarado=${declaredRange} instalado=${installedVersion}`,
      );
    }

    const lockEntry = packagesMap[depName];
    const resolvedVersion = parseResolvedVersionFromLockEntry(lockEntry);
    if (resolvedVersion && installedVersion !== resolvedVersion) {
      issues.push(
        `[LOCK_INSTALLED_MISMATCH] ${depName}: lock=${resolvedVersion} instalado=${installedVersion}`,
      );
    }
  }

  return issues;
}

function run() {
  const projectRoot = path.join(__dirname, "..");
  const packageJsonPath = path.join(projectRoot, "package.json");
  const lockfilePath = path.join(projectRoot, "bun.lock");

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const lockfileRaw = fs.readFileSync(lockfilePath, "utf8");
  const lockfile = parseLenientJson(lockfileRaw);

  const issues = [
    ...validateDependencyAlignment({ packageJson, lockfile }),
    ...validateInstalledDependencyAlignment({ projectRoot, packageJson, lockfile }),
  ];

  if (issues.length > 0) {
    console.error("[verify-sdk-alignment] Falha de alinhamento de dependências críticas:");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log("[verify-sdk-alignment] OK: package.json e bun.lock alinhados para dependências críticas.");
}

if (require.main === module) {
  run();
}

module.exports = {
  CRITICAL_DEPENDENCIES,
  compareSemver,
  parseLenientJson,
  parseResolvedVersionFromLockEntry,
  parseSemver,
  satisfiesRange,
  validateDependencyAlignment,
  validateInstalledDependencyAlignment,
};
