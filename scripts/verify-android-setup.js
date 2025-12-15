#!/usr/bin/env node

const { execSync } = require("node:child_process");
const fs = require("fs");
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

  // Check 1: ADB availability
  if (checkAdbAvailable()) {
    success("ADB is available");
  } else {
    warn("ADB not found in PATH (optional for file checks)");
  }

  // Check 2: DNS Native files exist
  log("\n--- DNS Native Module Files ---");
  if (!checkDNSNativeFiles()) {
    allChecksPassed = false;
    error("DNS native module files are missing. Run: npx expo prebuild");
  }

  // Check 3: MainApplication.kt registration
  log("\n--- MainApplication.kt Registration ---");
  if (!checkMainApplicationKt()) {
    allChecksPassed = false;
    error("DNS native module not properly registered in MainApplication.kt");
  }

  // Check 4: Metro bundler
  log("\n--- Metro Bundler ---");
  if (checkMetroPort()) {
    success("Metro bundler is running");
  } else {
    warn("Metro bundler not running on port 8081");
    info("Run: npm start");
  }

  // Check 5: ADB reverse (if adb available)
  if (checkAdbAvailable()) {
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

main();
