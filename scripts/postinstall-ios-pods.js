#!/usr/bin/env node

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const { getIosPodfileLockPath, getOutOfSyncPods } = require("./iosPodsSync");

function hasCommand(command) {
  const result = spawnSync(command, ["--version"], { stdio: "ignore" });
  return result.status === 0;
}

function runOrThrow(command, args, options) {
  const result = spawnSync(command, args, {
    ...options,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `Command failed: ${command} ${args.join(" ")} (exit ${result.status})`
    );
  }
}

function main() {
  // Allow explicit opt-out for CI or non-iOS workflows.
  if (process.env.SKIP_IOS_POD_INSTALL === "1") {
    process.stdout.write("postinstall-ios-pods: SKIP_IOS_POD_INSTALL=1, skipping\n");
    return;
  }

  // Only attempt CocoaPods automation on macOS.
  if (process.platform !== "darwin") return;

  const projectRoot = path.resolve(__dirname, "..");
  const iosDir = path.join(projectRoot, "ios");
  const podfilePath = path.join(iosDir, "Podfile");
  const lockPath = getIosPodfileLockPath(projectRoot);

  if (!fs.existsSync(iosDir) || !fs.existsSync(podfilePath)) return;

  if (!hasCommand("pod")) {
    // Fail hard: on macOS with an iOS project present, missing CocoaPods means
    // iOS builds are not viable, and leaving Pods/lock stale is worse.
    process.stderr.write(
      "postinstall-ios-pods: CocoaPods not found (`pod`). Install it, or set SKIP_IOS_POD_INSTALL=1.\n"
    );
    process.exit(1);
  }

  const lockfileText = fs.existsSync(lockPath) ? fs.readFileSync(lockPath, "utf8") : "";
  const outOfSync = getOutOfSyncPods({ projectRoot, lockfileText });

  if (outOfSync.length === 0) return;

  process.stdout.write("postinstall-ios-pods: detected out-of-sync pods\n");
  for (const entry of outOfSync) {
    process.stdout.write(
      `- ${entry.podName}: lock=${entry.lockfileVersion} installed=${entry.installedVersion}\n`
    );
  }

  process.stdout.write("postinstall-ios-pods: running `pod install` (ios/)\n");
  runOrThrow("pod", ["install"], { cwd: iosDir });
}

main();
