#!/usr/bin/env node
/**
 * Version Sync Script for DNSChat
 *
 * Automatically syncs version numbers across all project files:
 * - Uses package.json version as the source of truth
 * - Updates app.json, iOS project, and Android project
 *
 * Usage: node scripts/sync-versions.js [--dry-run] [--bump-build] [--build-number <n>]
 */

const fs = require("fs");

const isDryRun = process.argv.includes("--dry-run");
const shouldBumpBuild = process.argv.includes("--bump-build");
const buildNumberFlagIndex = process.argv.indexOf("--build-number");
const explicitBuildNumberRaw =
  buildNumberFlagIndex >= 0 ? process.argv[buildNumberFlagIndex + 1] : null;

// File paths
const FILES = {
  packageJson: "package.json",
  appJson: "app.json",
  iosProject: "ios/DNSChat.xcodeproj/project.pbxproj",
  androidBuild: "android/app/build.gradle",
};

/**
 * Read source-of-truth version from package.json
 */
function getSourceVersionFromPackageJson() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(FILES.packageJson, "utf8"));
    const version = packageJson?.version;

    if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version)) {
      throw new Error(`Invalid package.json version: ${JSON.stringify(version)}`);
    }

    return version;
  } catch (error) {
    console.error("[sync-versions] Error reading package.json version:", error.message);
    process.exit(1);
  }
}

function readAppConfigVersions() {
  const appJson = JSON.parse(fs.readFileSync(FILES.appJson, "utf8"));
  const appVersion = appJson?.expo?.version ?? null;
  const iosBuildRaw = appJson?.expo?.ios?.buildNumber ?? null;
  const androidBuildRaw = appJson?.expo?.android?.versionCode ?? null;

  const iosBuildNumber =
    typeof iosBuildRaw === "string" && /^\d+$/.test(iosBuildRaw)
      ? parseInt(iosBuildRaw, 10)
      : typeof iosBuildRaw === "number" && Number.isFinite(iosBuildRaw)
        ? iosBuildRaw
        : null;

  const androidVersionCode =
    typeof androidBuildRaw === "number" && Number.isFinite(androidBuildRaw)
      ? androidBuildRaw
      : typeof androidBuildRaw === "string" && /^\d+$/.test(androidBuildRaw)
        ? parseInt(androidBuildRaw, 10)
        : null;

  return { appVersion, iosBuildNumber, androidVersionCode };
}

/**
 * Parse iOS MARKETING_VERSION and CURRENT_PROJECT_VERSION from pbxproj text.
 */
function readIosVersions() {
  const iosContent = fs.readFileSync(FILES.iosProject, "utf8");
  const marketingMatch = iosContent.match(/MARKETING_VERSION = ([^;]+);/);
  const buildMatch = iosContent.match(/CURRENT_PROJECT_VERSION = (\d+);/);

  const marketingVersion = marketingMatch ? String(marketingMatch[1]).trim() : null;
  const buildNumber = buildMatch ? parseInt(buildMatch[1], 10) : null;

  return { iosContent, marketingVersion, buildNumber };
}

function assertIosDevelopmentTeamIsEmpty(iosContent) {
  // This repo is intentionally portable: don't commit a real signing team.
  const matches = iosContent.matchAll(/DEVELOPMENT_TEAM\s*=\s*([^;]+);/g);
  for (const match of matches) {
    const configured = (match[1] ?? "").trim();
    if (configured !== '""') {
      console.error(
        "[sync-versions] Refusing to proceed: iOS DEVELOPMENT_TEAM must be empty (\"\") for a portable public repo.",
      );
      console.error(
        "[sync-versions] Fix: in Xcode set Signing Team to \"None\" (or clear it), then ensure the pbxproj contains: DEVELOPMENT_TEAM = \"\";",
      );
      process.exit(1);
    }
  }
}

/**
 * Parse Android versionName and versionCode from build.gradle text.
 */
function readAndroidVersions() {
  const androidContent = fs.readFileSync(FILES.androidBuild, "utf8");
  const versionNameMatch = androidContent.match(/versionName\s*=?\s*"([^"]+)"/);
  const versionCodeMatch = androidContent.match(/versionCode\s*=?\s*(\d+)/);

  const versionName = versionNameMatch ? String(versionNameMatch[1]).trim() : null;
  const versionCode = versionCodeMatch ? parseInt(versionCodeMatch[1], 10) : null;

  return { androidContent, versionName, versionCode };
}

function parseExplicitBuildNumber(rawValue) {
  if (rawValue == null) return null;
  const parsed = Number.parseInt(String(rawValue), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.error(`[sync-versions] Invalid --build-number: ${JSON.stringify(rawValue)}`);
    process.exit(1);
  }
  return parsed;
}

/**
 * Update app.json version
 */
function updateAppJson(version, buildNumber) {
  try {
    const appJson = JSON.parse(fs.readFileSync(FILES.appJson, "utf8"));
    const oldVersion = appJson?.expo?.version ?? null;
    const oldIosBuild = appJson?.expo?.ios?.buildNumber ?? null;
    const oldAndroidBuild = appJson?.expo?.android?.versionCode ?? null;
    const desiredIosBuild = String(buildNumber);
    const desiredAndroidBuild = buildNumber;

    if (!appJson.expo) appJson.expo = {};
    if (!appJson.expo.ios) appJson.expo.ios = {};
    if (!appJson.expo.android) appJson.expo.android = {};

    const alreadySynced =
      oldVersion === version &&
      oldIosBuild === desiredIosBuild &&
      oldAndroidBuild === desiredAndroidBuild;

    if (alreadySynced) {
      console.log(
        `[sync-versions] app.json already at version ${version} (ios build ${desiredIosBuild}, android build ${desiredAndroidBuild})`,
      );
      return false;
    }

    appJson.expo.version = version;
    appJson.expo.ios.buildNumber = desiredIosBuild;
    appJson.expo.android.versionCode = desiredAndroidBuild;

    if (!isDryRun) {
      fs.writeFileSync(FILES.appJson, JSON.stringify(appJson, null, 2) + "\n");
    }

    console.log(
      `[sync-versions] app.json: version ${oldVersion} -> ${version}, iOS build ${oldIosBuild} -> ${desiredIosBuild}, Android build ${oldAndroidBuild} -> ${desiredAndroidBuild} ${isDryRun ? "(dry run)" : ""}`,
    );
    return true;
  } catch (error) {
    console.error("[sync-versions] Error updating app.json:", error.message);
    return false;
  }
}

/**
 * Update iOS project versions
 */
function updateIosProject(version, buildNumber) {
  try {
    let iosContent = fs.readFileSync(FILES.iosProject, "utf8");

    // Update MARKETING_VERSION
    const marketingMatch = iosContent.match(/MARKETING_VERSION = ([^;]+);/);
    const oldMarketingVersion = marketingMatch ? marketingMatch[1] : "unknown";

    // Update CURRENT_PROJECT_VERSION
    const buildMatch = iosContent.match(/CURRENT_PROJECT_VERSION = (\d+);/);
    const oldBuildNumber = buildMatch ? parseInt(buildMatch[1]) : 0;

    if (oldMarketingVersion === version && oldBuildNumber >= buildNumber) {
      console.log(
        `[sync-versions] iOS project already at version ${version} (${buildNumber})`,
      );
      return false;
    }

    iosContent = iosContent.replace(
      /MARKETING_VERSION = [^;]+;/g,
      `MARKETING_VERSION = ${version};`,
    );

    iosContent = iosContent.replace(
      /CURRENT_PROJECT_VERSION = \d+;/g,
      `CURRENT_PROJECT_VERSION = ${buildNumber};`,
    );

    if (!isDryRun) {
      fs.writeFileSync(FILES.iosProject, iosContent);
    }

    console.log(`[sync-versions] iOS: ${oldMarketingVersion} (${oldBuildNumber}) -> ${version} (${buildNumber}) ${isDryRun ? "(dry run)" : ""}`);
    return true;
  } catch (error) {
    console.error("[sync-versions] Error updating iOS project:", error.message);
    return false;
  }
}

/**
 * Update Android build.gradle versions
 */
function updateAndroidBuild(version, buildNumber) {
  try {
    let androidContent = fs.readFileSync(FILES.androidBuild, "utf8");

    // Extract current versions
    const versionNameMatch = androidContent.match(/versionName\s*=?\s*"([^"]+)"/);
    const versionCodeMatch = androidContent.match(/versionCode\s*=?\s*(\d+)/);

    const oldVersionName = versionNameMatch ? versionNameMatch[1] : "unknown";
    const oldVersionCode = versionCodeMatch ? parseInt(versionCodeMatch[1]) : 0;

    if (oldVersionName === version && oldVersionCode >= buildNumber) {
      console.log(`[sync-versions] Android already at version ${version} (${buildNumber})`);
      return false;
    }

    androidContent = androidContent.replace(
      /versionCode\s*=?\s*\d+/,
      `versionCode ${buildNumber}`,
    );

    androidContent = androidContent.replace(
      /versionName\s*=?\s*"[^"]+"/,
      `versionName "${version}"`,
    );

    if (!isDryRun) {
      fs.writeFileSync(FILES.androidBuild, androidContent);
    }

    console.log(`[sync-versions] Android: ${oldVersionName} (${oldVersionCode}) -> ${version} (${buildNumber}) ${isDryRun ? "(dry run)" : ""}`);
    return true;
  } catch (error) {
    console.error("[sync-versions] Error updating Android build.gradle:", error.message);
    return false;
  }
}

function getTargetBuildNumber({
  targetVersion,
  iosMarketingVersion,
  iosBuildNumber,
  androidVersionName,
  androidVersionCode,
  appIosBuildNumber,
  appAndroidVersionCode,
  explicitBuildNumber,
  bumpBuild,
}) {
  // Tricky policy: build numbers must be monotonic, but should not change when
  // nothing else changes. Default behavior:
  // - If any version field is out-of-sync, bump build by 1 (release-style).
  // - If everything is already in sync, do not bump build unless explicitly asked.
  const maxCurrentBuild = Math.max(
    iosBuildNumber ?? 0,
    androidVersionCode ?? 0,
    appIosBuildNumber ?? 0,
    appAndroidVersionCode ?? 0,
    0,
  );

  const versionsNeedUpdate =
    iosMarketingVersion !== targetVersion || androidVersionName !== targetVersion;

  if (explicitBuildNumber != null) {
    if (explicitBuildNumber <= maxCurrentBuild) {
      console.error(
        `[sync-versions] Refusing --build-number ${explicitBuildNumber}; must be > current max build ${maxCurrentBuild}`,
      );
      process.exit(1);
    }
    return { buildNumber: explicitBuildNumber, versionsNeedUpdate };
  }

  if (bumpBuild || versionsNeedUpdate) {
    return { buildNumber: maxCurrentBuild + 1, versionsNeedUpdate };
  }

  return { buildNumber: maxCurrentBuild, versionsNeedUpdate };
}

/**
 * Main execution
 */
function main() {
  console.log("DNSChat Version Sync Script");
  console.log("================================\n");

  if (isDryRun) {
    console.log("Running in DRY RUN mode - no files will be modified\n");
  }

  // Get source of truth version from package.json
  const latestVersion = getSourceVersionFromPackageJson();
  console.log(`Source version (package.json): ${latestVersion}\n`);

  const {
    appVersion,
    iosBuildNumber: appIosBuildNumber,
    androidVersionCode: appAndroidVersionCode,
  } = readAppConfigVersions();
  const {
    iosContent,
    marketingVersion: iosMarketingVersion,
    buildNumber: iosBuildNumber,
  } = readIosVersions();
  assertIosDevelopmentTeamIsEmpty(iosContent);
  const { versionName: androidVersionName, versionCode: androidVersionCode } =
    readAndroidVersions();

  const explicitBuildNumber = parseExplicitBuildNumber(explicitBuildNumberRaw);
  const { buildNumber, versionsNeedUpdate } = getTargetBuildNumber({
    targetVersion: latestVersion,
    iosMarketingVersion,
    iosBuildNumber,
    androidVersionName,
    androidVersionCode,
    appIosBuildNumber,
    appAndroidVersionCode,
    explicitBuildNumber,
    bumpBuild: shouldBumpBuild,
  });

  const buildPolicy =
    explicitBuildNumber != null
      ? "explicit"
      : shouldBumpBuild
        ? "bump-build flag"
        : versionsNeedUpdate
          ? "bump on version change"
          : "no bump";

  console.log(
    `[sync-versions] app.json current: version=${appVersion ?? "missing"} iosBuild=${appIosBuildNumber ?? "missing"} androidBuild=${appAndroidVersionCode ?? "missing"}`,
  );
  console.log(
    `[sync-versions] iOS current: version=${iosMarketingVersion ?? "missing"} build=${iosBuildNumber ?? "missing"}`,
  );
  console.log(
    `[sync-versions] Android current: version=${androidVersionName ?? "missing"} build=${androidVersionCode ?? "missing"}`,
  );
  console.log(`[sync-versions] Build policy: ${buildPolicy}`);
  console.log(`Target build number: ${buildNumber}\n`);

  // Update all files
  const updates = [
    updateAppJson(latestVersion, buildNumber),
    updateIosProject(latestVersion, buildNumber),
    updateAndroidBuild(latestVersion, buildNumber),
  ];

  const updatedCount = updates.filter(Boolean).length;

  console.log("\n" + "=".repeat(50));

  if (updatedCount === 0) {
    console.log("All versions are already synchronized.");
  } else {
    console.log(
      `Successfully ${isDryRun ? "would update" : "updated"} ${updatedCount} file(s) to version ${latestVersion}`,
    );

    if (!isDryRun) {
      console.log("\nNext steps:");
      console.log("   1. Test the updated versions");
      console.log("   2. Commit the changes");
      console.log("   3. Build and deploy");
    }
  }

  if (isDryRun) {
    console.log("\nRun without --dry-run to apply changes");
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { main, getSourceVersionFromPackageJson };
