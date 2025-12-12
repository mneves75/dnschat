function decideIosPodsPostinstallAction({
  platform,
  skipPodInstallEnv,
  hasIosDir,
  hasPodfile,
  outOfSyncCount,
  hasPodCommand,
}) {
  if (skipPodInstallEnv) return { action: "skip", reason: "SKIP_IOS_POD_INSTALL" };
  if (platform !== "darwin") return { action: "skip", reason: "NOT_DARWIN" };
  if (!hasIosDir || !hasPodfile) return { action: "skip", reason: "NO_IOS_PROJECT" };

  if (!outOfSyncCount || outOfSyncCount <= 0) {
    // Key invariant: never require CocoaPods if we don't need to run it.
    return { action: "skip", reason: "IN_SYNC" };
  }

  if (!hasPodCommand) return { action: "error", reason: "MISSING_COCOAPODS" };
  return { action: "run_pod_install", reason: "DRIFT_DETECTED" };
}

module.exports = { decideIosPodsPostinstallAction };

