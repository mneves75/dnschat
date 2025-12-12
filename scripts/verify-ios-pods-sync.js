#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const { getIosPodfileLockPath, getOutOfSyncPods } = require("./iosPodsSync");

function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const iosDir = path.join(projectRoot, "ios");
  const podfilePath = path.join(iosDir, "Podfile");
  const lockPath = getIosPodfileLockPath(projectRoot);

  if (!fs.existsSync(iosDir) || !fs.existsSync(podfilePath)) {
    process.stdout.write("verify-ios-pods-sync: no ios/Podfile, skipping\n");
    process.exit(0);
  }

  if (!fs.existsSync(lockPath)) {
    process.stderr.write(
      "verify-ios-pods-sync: missing ios/Podfile.lock (run `pnpm ios` or `cd ios && pod install`)\n"
    );
    process.exit(1);
  }

  const lockfileText = fs.readFileSync(lockPath, "utf8");
  const outOfSync = getOutOfSyncPods({ projectRoot, lockfileText });

  if (outOfSync.length === 0) {
    process.stdout.write("verify-ios-pods-sync: OK\n");
    process.exit(0);
  }

  process.stderr.write("verify-ios-pods-sync: iOS pods out of sync\n");
  for (const entry of outOfSync) {
    process.stderr.write(
      `- ${entry.podName}: lock=${entry.lockfileVersion} installed=${entry.installedVersion}\n`
    );
  }
  process.stderr.write(
    `Fix: run \`npm run ios\` (recommended) or \`cd ios && pod install\`, then commit the updated \`ios/Podfile.lock\`.\n`
  );
  if (process.platform !== "darwin") {
    process.stderr.write(
      "Note: CocoaPods runs on macOS. If you are on another OS, ask a macOS teammate to run pod install and commit the lockfile.\n"
    );
  }
  process.exit(1);
}

main();
