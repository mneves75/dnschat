const path = require("path");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Extract a pod version from a CocoaPods Podfile.lock text.
 *
 * Podfile.lock format example:
 *   PODS:
 *     - expo-dev-launcher (6.0.18):
 *
 * Returns null if the pod entry is not present.
 */
function getPodVersionFromLockfileText(lockfileText, podName) {
  if (typeof lockfileText !== "string") return null;
  if (!podName) return null;

  const podNamePattern = escapeRegExp(podName);
  const match = lockfileText.match(
    new RegExp(`^\\s*-\\s+${podNamePattern}\\s+\\(([^)]+)\\):\\s*$`, "m")
  );
  return match ? match[1].trim() : null;
}

/**
 * Resolve an installed npm package version from node_modules.
 *
 * Returns null if package.json cannot be resolved/read.
 */
function getInstalledPackageVersion(packageName, projectRoot) {
  try {
    const pkgJsonPath = require.resolve(`${packageName}/package.json`, {
      paths: [projectRoot],
    });
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const pkgJson = require(pkgJsonPath);
    return typeof pkgJson?.version === "string" ? pkgJson.version : null;
  } catch {
    return null;
  }
}

function defaultPodSyncTargets() {
  return [
    { packageName: "expo-dev-launcher", podName: "expo-dev-launcher" },
    { packageName: "expo-dev-client", podName: "expo-dev-client" },
    { packageName: "expo-dev-menu", podName: "expo-dev-menu" },
    { packageName: "expo", podName: "Expo" },
    { packageName: "expo-modules-core", podName: "ExpoModulesCore" },
  ];
}

/**
 * Compute pods that are out-of-sync between node_modules and ios/Podfile.lock.
 *
 * This is a *guardrail*, not a perfect model of CocoaPods resolution:
 * - Many Expo pods are path-based, but Podfile.lock still records their version.
 * - The invariant we want: when JS deps change (patch updates), Podfile.lock must
 *   be regenerated so the Pods project sources are refreshed.
 */
function getOutOfSyncPods({ projectRoot, lockfileText, targets }) {
  const resolvedProjectRoot = projectRoot || process.cwd();
  const resolvedTargets = targets?.length ? targets : defaultPodSyncTargets();

  return resolvedTargets
    .map(({ packageName, podName }) => {
      const installedVersion = getInstalledPackageVersion(
        packageName,
        resolvedProjectRoot
      );
      const lockfileVersion = getPodVersionFromLockfileText(lockfileText, podName);

      if (!installedVersion || !lockfileVersion) return null;
      if (installedVersion === lockfileVersion) return null;

      return {
        packageName,
        podName,
        installedVersion,
        lockfileVersion,
      };
    })
    .filter(Boolean);
}

function getIosPodfileLockPath(projectRoot) {
  return path.join(projectRoot, "ios", "Podfile.lock");
}

module.exports = {
  getPodVersionFromLockfileText,
  getInstalledPackageVersion,
  getOutOfSyncPods,
  getIosPodfileLockPath,
};

