#!/usr/bin/env node

const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isDirectoryExists(existsSyncImpl, dir) {
  if (!isNonEmptyString(dir)) return false;
  try {
    return existsSyncImpl(dir);
  } catch {
    return false;
  }
}

function prependPath({ basePath, binDir }) {
  const delimiter = path.delimiter;
  const parts = String(basePath || "")
    .split(delimiter)
    .filter(Boolean);

  const normalizedBinDir = String(binDir || "");
  if (!normalizedBinDir) return basePath || "";

  if (parts[0] === normalizedBinDir) return parts.join(delimiter);
  return [normalizedBinDir, ...parts].join(delimiter);
}

function resolveJava17Home({
  platform = process.platform,
  env = process.env,
  execFileSyncImpl = execFileSync,
  existsSyncImpl = fs.existsSync,
} = {}) {
  // Honor explicit JAVA_HOME when it exists. This keeps CI/dev overrides deterministic.
  if (isNonEmptyString(env.JAVA_HOME) && isDirectoryExists(existsSyncImpl, env.JAVA_HOME)) {
    return { source: "JAVA_HOME", dir: env.JAVA_HOME };
  }

  // macOS: prefer the system selector when available.
  if (platform === "darwin") {
    try {
      const resolved = execFileSyncImpl("/usr/libexec/java_home", ["-v", "17"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();

      if (isDirectoryExists(existsSyncImpl, resolved)) {
        return { source: "/usr/libexec/java_home -v 17", dir: resolved };
      }
    } catch {
      // ignore and fall back
    }
  }

  // Homebrew: support both Apple Silicon and Intel default prefixes.
  const brewCandidates = [
    "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
    "/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
  ];

  for (const candidate of brewCandidates) {
    if (isDirectoryExists(existsSyncImpl, candidate)) {
      return { source: "homebrew openjdk@17", dir: candidate };
    }
  }

  return null;
}

function buildAndroidEnv({
  baseEnv = process.env,
  javaHomeResult,
} = {}) {
  const env = { ...baseEnv };
  if (!javaHomeResult) return env;

  env.JAVA_HOME = javaHomeResult.dir;
  env.PATH = prependPath({
    basePath: env.PATH,
    binDir: path.join(javaHomeResult.dir, "bin"),
  });

  return env;
}

function runNodeScript(scriptPath, { env = process.env } = {}) {
  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: "inherit",
    env,
  });

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
}

function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const ensureReverseScript = path.join(__dirname, "ensure-adb-reverse.js");

  // Keep reverse behavior consistent with prior `npm run android`.
  runNodeScript(ensureReverseScript, { env: process.env });

  const javaHomeResult = resolveJava17Home();
  const env = buildAndroidEnv({ baseEnv: process.env, javaHomeResult });

  if (javaHomeResult) {
    // Visible, deterministic choice for local runs and CI logs.
    console.log(`[run-android] Using Java 17 from ${javaHomeResult.source}`);
    console.log(`[run-android] JAVA_HOME=${javaHomeResult.dir}`);
  } else if (!isNonEmptyString(process.env.JAVA_HOME)) {
    // Keep behavior non-blocking: some setups can build with newer JDKs, but we want to be explicit.
    console.warn(
      "[run-android] JAVA_HOME is not set and Java 17 could not be auto-detected. " +
        "If the build fails, set JAVA_HOME to a Java 17 installation and retry.",
    );
  }

  const expoArgs = process.argv.slice(2);
  const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

  const result = spawnSync(npxCmd, ["expo", "run:android", ...expoArgs], {
    cwd: repoRoot,
    stdio: "inherit",
    env,
  });

  if (typeof result.status === "number") {
    process.exit(result.status);
  }
  process.exit(1);
}

module.exports = {
  resolveJava17Home,
  buildAndroidEnv,
  // exported for unit tests
  _internal: {
    prependPath,
    isNonEmptyString,
    isDirectoryExists,
  },
};

if (require.main === module) {
  main();
}

