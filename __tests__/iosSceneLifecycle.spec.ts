import fs from "node:fs";

describe("iOS scene lifecycle", () => {
  const appDelegatePath = "ios/DNSChat/AppDelegate.swift";
  const infoPlistPath = "ios/DNSChat/Info.plist";

  it("declares a single-window scene backed by SceneDelegate", () => {
    const infoPlist = fs.readFileSync(infoPlistPath, "utf8");

    expect(infoPlist).toContain("<key>UIApplicationSceneManifest</key>");
    expect(infoPlist).toMatch(
      /<key>UIApplicationSupportsMultipleScenes<\/key>\s*<false\/>/,
    );
    expect(infoPlist).toContain("<key>UIWindowSceneSessionRoleApplication</key>");
    expect(infoPlist).toContain("$(PRODUCT_MODULE_NAME).SceneDelegate");
  });

  it("creates the React Native window from the connecting UIWindowScene", () => {
    const appDelegate = fs.readFileSync(appDelegatePath, "utf8");

    expect(appDelegate).toContain("class SceneDelegate: UIResponder, UIWindowSceneDelegate");
    expect(appDelegate).toContain("UIWindow(windowScene: windowScene)");
    expect(appDelegate).toContain("factory.startReactNative(");
    expect(appDelegate).not.toContain("UIWindow(frame: UIScreen.main.bounds)");
  });

  it("forwards scene lifecycle and linking events to Expo and React Native", () => {
    const appDelegate = fs.readFileSync(appDelegatePath, "utf8");

    expect(appDelegate).toContain(
      "ExpoAppDelegateSubscriberManager.applicationDidBecomeActive",
    );
    expect(appDelegate).toContain(
      "ExpoAppDelegateSubscriberManager.applicationDidEnterBackground",
    );
    expect(appDelegate).toContain("UIApplicationLaunchOptionsURLKey");
    expect(appDelegate).toContain("RCTLinkingManager.application(");
  });
});
