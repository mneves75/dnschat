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

function parseJavaMajorVersion(versionOutput) {
  const raw = String(versionOutput || "");
  const match = raw.match(/version\s+"(\d+)(?:\.\d+)?/i);
  if (!match) return null;
  const major = Number(match[1]);
  return Number.isFinite(major) ? major : null;
}

function isSupportedAndroidJavaMajor(major) {
  return Number.isFinite(major) && major >= 17 && major <= 21;
}

function getJavaMajorVersionForHome({
  javaHomeDir,
  spawnSyncImpl = spawnSync,
} = {}) {
  if (!isNonEmptyString(javaHomeDir)) return null;
  try {
    const result = spawnSyncImpl(path.join(javaHomeDir, "bin", "java"), ["-version"], {
      encoding: "utf8",
      stdio: "pipe",
    });
    const output = `${result.stdout || ""}\n${result.stderr || ""}`;
    return parseJavaMajorVersion(output);
  } catch {
    return null;
  }
}

function getCurrentJavaMajorVersion({
  spawnSyncImpl = spawnSync,
} = {}) {
  try {
    const result = spawnSyncImpl("java", ["-version"], {
      encoding: "utf8",
      stdio: "pipe",
    });
    const output = `${result.stdout || ""}\n${result.stderr || ""}`;
    return parseJavaMajorVersion(output);
  } catch {
    return null;
  }
}

function resolveJava17Home({
  platform = process.platform,
  env = process.env,
  execFileSyncImpl = execFileSync,
  spawnSyncImpl = spawnSync,
  existsSyncImpl = fs.existsSync,
} = {}) {
  // Honor explicit JAVA_HOME when it exists and is supported.
  if (isNonEmptyString(env.JAVA_HOME) && isDirectoryExists(existsSyncImpl, env.JAVA_HOME)) {
    const major = getJavaMajorVersionForHome({
      javaHomeDir: env.JAVA_HOME,
      spawnSyncImpl,
    });
    if (isSupportedAndroidJavaMajor(major)) {
      return { source: "JAVA_HOME", dir: env.JAVA_HOME, major };
    }
  }

  // macOS: prefer the system selector for supported LTS versions.
  if (platform === "darwin") {
    for (const version of ["17", "21"]) {
      try {
        const resolved = execFileSyncImpl("/usr/libexec/java_home", ["-v", version], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim();

        if (isDirectoryExists(existsSyncImpl, resolved)) {
          const major = getJavaMajorVersionForHome({
            javaHomeDir: resolved,
            spawnSyncImpl,
          });
          if (isSupportedAndroidJavaMajor(major)) {
            return { source: `/usr/libexec/java_home -v ${version}`, dir: resolved, major };
          }
        }
      } catch {
        // ignore and continue to next candidate
      }
    }
  }

  // Homebrew: support both Apple Silicon and Intel default prefixes for JDK 17/21.
  const brewCandidates = [
    "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
    "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home",
    "/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
    "/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home",
  ];

  for (const candidate of brewCandidates) {
    if (isDirectoryExists(existsSyncImpl, candidate)) {
      const major = getJavaMajorVersionForHome({
        javaHomeDir: candidate,
        spawnSyncImpl,
      });
      if (isSupportedAndroidJavaMajor(major)) {
        return { source: "homebrew supported OpenJDK", dir: candidate, major };
      }
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
    console.log(
      `[run-android] Using Java ${javaHomeResult.major ?? "supported"} from ${javaHomeResult.source}`,
    );
    console.log(`[run-android] JAVA_HOME=${javaHomeResult.dir}`);
  } else {
    const currentMajor = getCurrentJavaMajorVersion();
    if (isSupportedAndroidJavaMajor(currentMajor)) {
      console.log(`[run-android] Using system Java ${currentMajor} from PATH`);
    } else {
      const reason = isNonEmptyString(process.env.JAVA_HOME)
        ? `[run-android] JAVA_HOME is set but unsupported: ${process.env.JAVA_HOME}`
        : "[run-android] JAVA_HOME is not set and no supported Java (17/21) was auto-detected.";
      console.error(reason);
      console.error(
        "[run-android] Android native build requires JDK 17 or 21. " +
          "Set JAVA_HOME to a supported JDK and retry.",
      );
      process.exit(1);
    }
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
    parseJavaMajorVersion,
    isSupportedAndroidJavaMajor,
    getJavaMajorVersionForHome,
    getCurrentJavaMajorVersion,
    prependPath,
    isNonEmptyString,
    isDirectoryExists,
  },
};

if (require.main === module) {
  main();
}
