/* eslint-disable @typescript-eslint/no-var-requires */

const { getPodVersionFromLockfileText } = require("../scripts/iosPodsSync");

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
});

