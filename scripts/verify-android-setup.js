#!/usr/bin/env node

const { execSync } = require("node:child_process");
const fs = require("fs");
const os = require("node:os");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`[ERROR] ${message}`, colors.red);
}

function success(message) {
  log(`[OK] ${message}`, colors.green);
}

function warn(message) {
  log(`[WARN] ${message}`, colors.yellow);
}

function info(message) {
  log(`[INFO] ${message}`, colors.blue);
}

function checkAdbAvailable() {
  try {
    execSync("adb version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function checkMetroPort() {
  try {
    const { execSync } = require("node:child_process");
    const port = process.env.RCT_METRO_PORT || "8081";
    const result = execSync(`lsof -ti:${port}`, { encoding: "utf8" });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

function parseJavaProperties(raw) {
  const lines = String(raw)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#") && !line.startsWith("!"));

  const result = {};

  for (const line of lines) {
    // local.properties typically uses `key=value`, but Java properties allows `:` too.
    const sepIndex = (() => {
      const eq = line.indexOf("=");
      const colon = line.indexOf(":");
      if (eq === -1) return colon;
      if (colon === -1) return eq;
      return Math.min(eq, colon);
    })();

    if (sepIndex === -1) continue;

    const key = line.slice(0, sepIndex).trim();
    const valueRaw = line.slice(sepIndex + 1).trim();

    // Minimal unescape for common local.properties cases.
    const value = valueRaw
      .replaceAll("\\\\", "\\")
      .replaceAll("\\:", ":")
      .replaceAll("\\=", "=")
      .replaceAll("\\ ", " ");

    result[key] = value;
  }

  return result;
}

function resolveAndroidSdkDir({
  projectRoot,
  env = process.env,
  homedir = os.homedir(),
}) {
  const androidDir = path.join(projectRoot, "android");
  const localPropertiesPath = path.join(androidDir, "local.properties");

  const candidates = [];

  // 1) local.properties `sdk.dir`
  if (fs.existsSync(localPropertiesPath)) {
    const parsed = parseJavaProperties(fs.readFileSync(localPropertiesPath, "utf8"));
    if (typeof parsed["sdk.dir"] === "string" && parsed["sdk.dir"].trim() !== "") {
      candidates.push({ source: "android/local.properties sdk.dir", dir: parsed["sdk.dir"] });
    }
  }

  // 2) env vars (preferred for CI)
  if (env.ANDROID_SDK_ROOT) {
    candidates.push({ source: "ANDROID_SDK_ROOT", dir: env.ANDROID_SDK_ROOT });
  }
  if (env.ANDROID_HOME) {
    candidates.push({ source: "ANDROID_HOME", dir: env.ANDROID_HOME });
  }

  // 3) default macOS location
  candidates.push({ source: "default", dir: path.join(homedir, "Library", "Android", "sdk") });

  const existing = [];
  for (const candidate of candidates) {
    if (typeof candidate.dir !== "string" || candidate.dir.trim() === "") continue;
    const resolved = path.resolve(candidate.dir);
    try {
      const stat = fs.statSync(resolved);
      if (stat.isDirectory()) {
        existing.push({ ...candidate, dir: resolved });
      }
    } catch {
      // ignore
    }
  }

  const localSdkDirCandidate = candidates.find(
    (c) => c.source === "android/local.properties sdk.dir",
  );
  const localSdkDirIsInvalid =
    localSdkDirCandidate &&
    !existing.some((c) => c.source === "android/local.properties sdk.dir");

  if (existing.length > 0) {
    return {
      ok: true,
      sdkDir: existing[0].dir,
      source: existing[0].source,
      localPropertiesPath,
      localSdkDirIsInvalid,
      localSdkDir: localSdkDirCandidate?.dir ?? null,
    };
  }

  return {
    ok: false,
    sdkDir: null,
    source: null,
    localPropertiesPath,
    localSdkDirIsInvalid,
    localSdkDir: localSdkDirCandidate?.dir ?? null,
  };
}

function checkMainApplicationKt() {
  const mainAppPath = path.join(
    __dirname,
    "..",
    "android",
    "app",
    "src",
    "main",
    "java",
    "org",
    "mvneves",
    "dnschat",
    "MainApplication.kt",
  );

  if (!fs.existsSync(mainAppPath)) {
    error("MainApplication.kt not found");
    return false;
  }

  const content = fs.readFileSync(mainAppPath, "utf8");

  const checks = [
    {
      name: "DNSNativePackage import",
      pattern: /import com\.dnsnative\.DNSNativePackage/,
      failMessage: "Missing DNSNativePackage import",
    },
    {
      name: "DNSNativePackage registration",
      pattern: /packages\.add\(DNSNativePackage\(\)\)/,
      failMessage: "DNSNativePackage not added to packages list",
    },
  ];

  let allPassed = true;
  for (const check of checks) {
    if (check.pattern.test(content)) {
      success(check.name);
    } else {
      error(check.failMessage);
      allPassed = false;
    }
  }

  return allPassed;
}

function checkDNSNativeFiles() {
  const dnsNativeDir = path.join(
    __dirname,
    "..",
    "android",
    "app",
    "src",
    "main",
    "java",
    "com",
    "dnsnative",
  );

  const requiredFiles = [
    "DNSNativePackage.java",
    "RNDNSModule.java",
    "DNSResolver.java",
  ];

  let allExist = true;
  for (const file of requiredFiles) {
    const filePath = path.join(dnsNativeDir, file);
    if (fs.existsSync(filePath)) {
      success(`${file} exists`);
    } else {
      error(`${file} missing`);
      allExist = false;
    }
  }

  return allExist;
}

function checkAdbReverse() {
  try {
    const output = execSync("adb devices", { encoding: "utf8" });
    const devices = output
      .split("\n")
      .slice(1)
      .filter((line) => line.trim().length > 0 && line.includes("device"));

    if (devices.length === 0) {
      warn("No Android devices or emulators connected");
      return false;
    }

    const port = process.env.RCT_METRO_PORT || "8081";
    let allReversed = true;

    for (const deviceLine of devices) {
      const serial = deviceLine.split("\t")[0];
      try {
        const reverseOutput = execSync(
          `adb -s ${serial} reverse --list`,
          { encoding: "utf8" },
        );
        if (reverseOutput.includes(`tcp:${port}`)) {
          success(`Port ${port} reversed on ${serial}`);
        } else {
          warn(`Port ${port} not reversed on ${serial}`);
          info(`Run: adb -s ${serial} reverse tcp:${port} tcp:${port}`);
          allReversed = false;
        }
      } catch {
        warn(`Could not check reverse on ${serial}`);
        allReversed = false;
      }
    }

    return allReversed;
  } catch {
    warn("Could not check adb reverse (adb not available)");
    return false;
  }
}

function main() {
  log("\n=== Android Setup Verification ===\n");

  let allChecksPassed = true;
  const adbAvailable = checkAdbAvailable();
  const projectRoot = path.join(__dirname, "..");

  // Check 1: Android SDK configuration
  log("\n--- Android SDK ---");
  const sdk = resolveAndroidSdkDir({ projectRoot });
  if (sdk.ok) {
    success(`Android SDK found (${sdk.source})`);
    info(`SDK path: ${sdk.sdkDir}`);
    if (sdk.localSdkDirIsInvalid) {
      warn("android/local.properties sdk.dir points to a missing directory");
      info(`Check: ${sdk.localPropertiesPath}`);
      info(
        "Fix: update sdk.dir, or delete local.properties and let Android Studio regenerate it.",
      );
    }
  } else {
    allChecksPassed = false;
    error("Android SDK not found");
    info("Set ANDROID_SDK_ROOT or ANDROID_HOME, or install via Android Studio.");
    if (sdk.localSdkDirIsInvalid) {
      warn("android/local.properties sdk.dir points to a missing directory");
      info(`Check: ${sdk.localPropertiesPath}`);
    }
  }

  // Check 2: ADB availability
  if (adbAvailable) {
    success("ADB is available");
  } else {
    warn("ADB not found in PATH (optional for file checks)");
  }

  // Check 3: DNS Native files exist
  log("\n--- DNS Native Module Files ---");
  if (!checkDNSNativeFiles()) {
    allChecksPassed = false;
    error("DNS native module files are missing. Run: npx expo prebuild");
  }

  // Check 4: MainApplication.kt registration
  log("\n--- MainApplication.kt Registration ---");
  if (!checkMainApplicationKt()) {
    allChecksPassed = false;
    error("DNS native module not properly registered in MainApplication.kt");
  }

  // Check 5: Metro bundler
  log("\n--- Metro Bundler ---");
  const metroPort = process.env.RCT_METRO_PORT || "8081";
  if (checkMetroPort()) {
    success("Metro bundler is running");
  } else {
    warn(`Metro bundler not running on port ${metroPort}`);
    info("Run: npm start");
  }

  // Check 6: ADB reverse (if adb available)
  if (adbAvailable) {
    log("\n--- ADB Reverse ---");
    if (!checkAdbReverse()) {
      warn("ADB reverse not configured for all devices");
      info("Run: npm run android (automatically sets up reverse)");
    }
  }

  log("\n=== Verification Complete ===\n");

  if (allChecksPassed) {
    success("All critical checks passed!");
    log("You can now run: npm run android");
    process.exit(0);
  } else {
    error("Some checks failed. Please fix the issues above.");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseJavaProperties,
  resolveAndroidSdkDir,
};
