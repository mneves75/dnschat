/* eslint-disable @typescript-eslint/no-var-requires */

const { getOutOfSyncPodsFromVersions, getPodVersionFromLockfileText } = require("../scripts/iosPodsSync");

describe("iosPodsSync", () => {
  describe("getPodVersionFromLockfileText", () => {
    it("extracts a pod version from Podfile.lock", () => {
      const lockText = `
PODS:
  - EXConstants (18.0.10):
    - ExpoModulesCore
  - expo-dev-launcher (6.0.18):
    - ExpoModulesCore

DEPENDENCIES:
  - expo-dev-launcher (from \`../node_modules/expo-dev-launcher\`)
`;

      expect(getPodVersionFromLockfileText(lockText, "expo-dev-launcher")).toBe("6.0.18");
      expect(getPodVersionFromLockfileText(lockText, "EXConstants")).toBe("18.0.10");
    });

    it("returns null when the pod entry is missing", () => {
      const lockText = `
PODS:
  - ExpoModulesCore (3.0.26):
    - React-Core
`;
      expect(getPodVersionFromLockfileText(lockText, "expo-dev-launcher")).toBeNull();
    });
  });

  describe("getOutOfSyncPodsFromVersions", () => {
    it("detects drift when installed versions do not match Podfile.lock", () => {
      const lockText = `
PODS:
  - expo-dev-launcher (6.0.18):
    - ExpoModulesCore
  - ExpoModulesCore (3.0.26):
    - React-Core
`;

      const installedVersions = {
        "expo-dev-launcher": "6.0.20",
        "expo-modules-core": "3.0.26",
      };

      const outOfSync = getOutOfSyncPodsFromVersions({
        lockfileText: lockText,
        installedVersions,
        targets: [
          { packageName: "expo-dev-launcher", podName: "expo-dev-launcher" },
          { packageName: "expo-modules-core", podName: "ExpoModulesCore" },
        ],
      });

      expect(outOfSync).toEqual([
        {
          packageName: "expo-dev-launcher",
          podName: "expo-dev-launcher",
          installedVersion: "6.0.20",
          lockfileVersion: "6.0.18",
          reason: "VERSION_MISMATCH",
        },
      ]);
    });

    it("treats installed packages missing from Podfile.lock as drift", () => {
      const lockText = `
PODS:
  - ExpoModulesCore (3.0.26):
    - React-Core
`;

      const installedVersions = {
        "expo-dev-launcher": "6.0.20",
      };

      const outOfSync = getOutOfSyncPodsFromVersions({
        lockfileText: lockText,
        installedVersions,
        targets: [{ packageName: "expo-dev-launcher", podName: "expo-dev-launcher" }],
      });

      expect(outOfSync).toEqual([
        {
          packageName: "expo-dev-launcher",
          podName: "expo-dev-launcher",
          installedVersion: "6.0.20",
          lockfileVersion: null,
          reason: "MISSING_LOCK_ENTRY",
        },
      ]);
    });
  });
});
