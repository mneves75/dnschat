/* eslint-disable @typescript-eslint/no-var-requires */

const { decideIosPodsPostinstallAction } = require("../scripts/iosPodsPostinstallPolicy");

describe("iosPodsPostinstallPolicy", () => {
  it("skips when SKIP_IOS_POD_INSTALL is set", () => {
    expect(
      decideIosPodsPostinstallAction({
        platform: "darwin",
        skipPodInstallEnv: true,
        hasIosDir: true,
        hasPodfile: true,
        outOfSyncCount: 1,
        hasPodCommand: true,
      })
    ).toEqual({ action: "skip", reason: "SKIP_IOS_POD_INSTALL" });
  });

  it("skips on non-darwin platforms", () => {
    expect(
      decideIosPodsPostinstallAction({
        platform: "linux",
        skipPodInstallEnv: false,
        hasIosDir: true,
        hasPodfile: true,
        outOfSyncCount: 1,
        hasPodCommand: false,
      })
    ).toEqual({ action: "skip", reason: "NOT_DARWIN" });
  });

  it("skips when there is no iOS project", () => {
    expect(
      decideIosPodsPostinstallAction({
        platform: "darwin",
        skipPodInstallEnv: false,
        hasIosDir: false,
        hasPodfile: false,
        outOfSyncCount: 1,
        hasPodCommand: false,
      })
    ).toEqual({ action: "skip", reason: "NO_IOS_PROJECT" });
  });

  it("does not require CocoaPods when everything is already in sync", () => {
    expect(
      decideIosPodsPostinstallAction({
        platform: "darwin",
        skipPodInstallEnv: false,
        hasIosDir: true,
        hasPodfile: true,
        outOfSyncCount: 0,
        hasPodCommand: false,
      })
    ).toEqual({ action: "skip", reason: "IN_SYNC" });
  });

  it("errors when drift exists but CocoaPods is missing", () => {
    expect(
      decideIosPodsPostinstallAction({
        platform: "darwin",
        skipPodInstallEnv: false,
        hasIosDir: true,
        hasPodfile: true,
        outOfSyncCount: 2,
        hasPodCommand: false,
      })
    ).toEqual({ action: "error", reason: "MISSING_COCOAPODS" });
  });

  it("runs pod install when drift exists and CocoaPods is available", () => {
    expect(
      decideIosPodsPostinstallAction({
        platform: "darwin",
        skipPodInstallEnv: false,
        hasIosDir: true,
        hasPodfile: true,
        outOfSyncCount: 2,
        hasPodCommand: true,
      })
    ).toEqual({ action: "run_pod_install", reason: "DRIFT_DETECTED" });
  });
});

