#!/usr/bin/env node
/**
 * Version Sync Script for DNSChat
 *
 * Automatically syncs version numbers across all project files:
 * - Uses CHANGELOG.md as the source of truth
 * - Updates package.json, app.json, iOS project, and Android project
 *
 * Usage: node scripts/sync-versions.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");

const isDryRun = process.argv.includes("--dry-run");

// File paths
const FILES = {
  changelog: "CHANGELOG.md",
  packageJson: "package.json",
  appJson: "app.json",
  iosProject: "ios/DNSChat.xcodeproj/project.pbxproj",
  androidBuild: "android/app/build.gradle",
};

/**
 * Extract the latest version from CHANGELOG.md
 */
function getLatestVersionFromChangelog() {
  try {
    const changelogContent = fs.readFileSync(FILES.changelog, "utf8");
    const versionMatch = changelogContent.match(
      /## \[(\d+\.\d+\.\d+)\] - \d{4}-\d{2}-\d{2}/,
    );

    if (!versionMatch) {
      throw new Error(
        "Could not find version in CHANGELOG.md format: ## [X.Y.Z] - YYYY-MM-DD",
      );
    }

    return versionMatch[1];
  } catch (error) {
    console.error("❌ Error reading CHANGELOG.md:", error.message);
    process.exit(1);
  }
}

/**
 * Get current build number and increment it
 */
function getNextBuildNumber() {
  try {
    const iosContent = fs.readFileSync(FILES.iosProject, "utf8");
    const buildMatch = iosContent.match(/CURRENT_PROJECT_VERSION = (\d+);/);

    if (!buildMatch) {
      console.warn(
        "⚠️  Could not find CURRENT_PROJECT_VERSION, defaulting to 1",
      );
      return 1;
    }

    return parseInt(buildMatch[1]) + 1;
  } catch (error) {
    console.warn(
      "⚠️  Could not read iOS project file, defaulting to build number 1",
    );
    return 1;
  }
}

/**
 * Update package.json version
 */
function updatePackageJson(version) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(FILES.packageJson, "utf8"));
    const oldVersion = packageJson.version;

    if (oldVersion === version) {
      console.log(`✅ package.json already at version ${version}`);
      return false;
    }

    packageJson.version = version;

    if (!isDryRun) {
      fs.writeFileSync(
        FILES.packageJson,
        JSON.stringify(packageJson, null, 2) + "\n",
      );
    }

    console.log(
      `📦 package.json: ${oldVersion} → ${version} ${isDryRun ? "(dry run)" : ""}`,
    );
    return true;
  } catch (error) {
    console.error("❌ Error updating package.json:", error.message);
    return false;
  }
}

/**
 * Update app.json version
 */
function updateAppJson(version) {
  try {
    const appJson = JSON.parse(fs.readFileSync(FILES.appJson, "utf8"));
    const oldVersion = appJson.expo.version;

    if (oldVersion === version) {
      console.log(`✅ app.json already at version ${version}`);
      return false;
    }

    appJson.expo.version = version;

    if (!isDryRun) {
      fs.writeFileSync(FILES.appJson, JSON.stringify(appJson, null, 2) + "\n");
    }

    console.log(
      `🎯 app.json: ${oldVersion} → ${version} ${isDryRun ? "(dry run)" : ""}`,
    );
    return true;
  } catch (error) {
    console.error("❌ Error updating app.json:", error.message);
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
        `✅ iOS project already at version ${version} (${buildNumber})`,
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

    console.log(
      `🍎 iOS: ${oldMarketingVersion} (${oldBuildNumber}) → ${version} (${buildNumber}) ${isDryRun ? "(dry run)" : ""}`,
    );
    return true;
  } catch (error) {
    console.error("❌ Error updating iOS project:", error.message);
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
    const versionNameMatch = androidContent.match(/versionName "([^"]+)"/);
    const versionCodeMatch = androidContent.match(/versionCode (\d+)/);

    const oldVersionName = versionNameMatch ? versionNameMatch[1] : "unknown";
    const oldVersionCode = versionCodeMatch ? parseInt(versionCodeMatch[1]) : 0;

    if (oldVersionName === version && oldVersionCode >= buildNumber) {
      console.log(`✅ Android already at version ${version} (${buildNumber})`);
      return false;
    }

    androidContent = androidContent.replace(
      /versionCode \d+/,
      `versionCode ${buildNumber}`,
    );

    androidContent = androidContent.replace(
      /versionName "[^"]+"/,
      `versionName "${version}"`,
    );

    if (!isDryRun) {
      fs.writeFileSync(FILES.androidBuild, androidContent);
    }

    console.log(
      `🤖 Android: ${oldVersionName} (${oldVersionCode}) → ${version} (${buildNumber}) ${isDryRun ? "(dry run)" : ""}`,
    );
    return true;
  } catch (error) {
    console.error("❌ Error updating Android build.gradle:", error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log("🚀 DNSChat Version Sync Script");
  console.log("================================\n");

  if (isDryRun) {
    console.log("🔍 Running in DRY RUN mode - no files will be modified\n");
  }

  // Get source of truth version from CHANGELOG.md
  const latestVersion = getLatestVersionFromChangelog();
  console.log(`📋 Latest version from CHANGELOG.md: ${latestVersion}\n`);

  // Get next build number
  const buildNumber = getNextBuildNumber();
  console.log(`🔢 Next build number: ${buildNumber}\n`);

  // Update all files
  const updates = [
    updatePackageJson(latestVersion),
    updateAppJson(latestVersion),
    updateIosProject(latestVersion, buildNumber),
    updateAndroidBuild(latestVersion, buildNumber),
  ];

  const updatedCount = updates.filter(Boolean).length;

  console.log("\n" + "=".repeat(50));

  if (updatedCount === 0) {
    console.log("✅ All versions are already synchronized!");
  } else {
    console.log(
      `🎉 Successfully ${isDryRun ? "would update" : "updated"} ${updatedCount} file(s) to version ${latestVersion}`,
    );

    if (!isDryRun) {
      console.log("\n📝 Next steps:");
      console.log("   1. Test the updated versions");
      console.log("   2. Commit the changes");
      console.log("   3. Build and deploy");
    }
  }

  if (isDryRun) {
    console.log("\n💡 Run without --dry-run to apply changes");
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { main, getLatestVersionFromChangelog };
