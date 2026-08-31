import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const plugin = require("../plugins/dns-native-plugin.js");
const {
  applyAndroidBuildGradlePolicy,
  applyIosAppDelegateScenePolicy,
  applyMainApplicationKotlinPolicy,
  applyIosProjectVersionPolicy,
  applyIosSceneManifestPolicy,
} = plugin.__test__;

describe("dns-native config plugin policies", () => {
  describe("applyAndroidBuildGradlePolicy", () => {
    const baselineGradle = `
def jscFlavor = 'io.github.react-native-community:jsc-android:2026004.+'

android {
  signingConfigs {
    debug {
      storeFile file('debug.keystore')
      storePassword 'android'
      keyAlias 'androiddebugkey'
      keyPassword 'android'
    }
  }
  buildTypes {
    debug {
      signingConfig signingConfigs.debug
    }
    release {
      // Caution! In production, you need to generate your own keystore file.
      // see https://reactnative.dev/docs/signed-apk-android.
      signingConfig signingConfigs.debug
      minifyEnabled false
    }
  }
}

dependencies {
}
`;

    it("injects release signing policy and removes debug signing from release", () => {
      const transformed = applyAndroidBuildGradlePolicy(baselineGradle);

      expect(transformed).toContain('rootProject.file("keystore.properties")');
      expect(transformed).toContain('new File(projectRoot, "keystore.properties")');
      expect(transformed).toContain(
        "keystorePropertiesBaseDir = keystorePropertiesFile.getParentFile()",
      );
      expect(transformed).toContain(
        "keystorePropertiesBaseDir = repoKeystorePropertiesFile.getParentFile()",
      );
      expect(transformed).toContain(
        "def configuredStoreFile = new File(keystoreProperties['storeFile'])",
      );
      expect(transformed).toContain(
        "storeFile(configuredStoreFile.isAbsolute() ? configuredStoreFile : new File(keystorePropertiesBaseDir, configuredStoreFile.path))",
      );
      expect(transformed).toContain("if (hasReleaseSigning) {");
      expect(transformed).toContain("signingConfig signingConfigs.release");

      const releaseBlock = transformed.match(/release\s*\{[\s\S]*?\n\s*\}/)?.[0] ?? "";
      expect(releaseBlock).not.toContain("signingConfig signingConfigs.debug");
    });

    it("upgrades dnsjava versions below the security floor", () => {
      const withVulnerableDnsjava = baselineGradle.replace(
        "dependencies {\n}",
        'dependencies {\n  implementation("dnsjava:dnsjava:3.5.2")\n}',
      );

      const transformed = applyAndroidBuildGradlePolicy(withVulnerableDnsjava);

      expect(transformed).toContain('implementation("dnsjava:dnsjava:3.6.2")');
      expect(transformed).not.toContain("dnsjava:dnsjava:3.5.2");
    });

    it("preserves dnsjava versions above the security floor", () => {
      const withNewerDnsjava = baselineGradle.replace(
        "dependencies {\n}",
        'dependencies {\n  implementation("dnsjava:dnsjava:3.7.0")\n}',
      );

      const transformed = applyAndroidBuildGradlePolicy(withNewerDnsjava);

      expect(transformed).toContain('implementation("dnsjava:dnsjava:3.7.0")');
      expect(transformed).not.toContain("dnsjava:dnsjava:3.6.2");
    });

    it("is idempotent", () => {
      const once = applyAndroidBuildGradlePolicy(baselineGradle);
      const twice = applyAndroidBuildGradlePolicy(once);
      expect(twice).toBe(once);
    });
  });

  describe("iOS scene lifecycle", () => {
    const cleanExpoAppDelegate = `internal import Expo
import React
import ReactAppDependencyProvider

@main
class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let factory = ExpoReactNativeFactory(delegate: ReactNativeDelegate())
    reactNativeFactory = factory

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
`;

    it("replaces direct window startup with one SceneDelegate bridge", () => {
      const transformed = applyIosAppDelegateScenePolicy(cleanExpoAppDelegate);

      expect(transformed).toContain("internal import ExpoModulesCore");
      expect(transformed).not.toContain("UIWindow(frame: UIScreen.main.bounds)");
      expect(transformed).toContain("UIWindow(windowScene: windowScene)");
      expect(transformed.match(/class SceneDelegate:/g)).toHaveLength(1);
      expect(applyIosAppDelegateScenePolicy(transformed)).toBe(transformed);
    });

    it("generates the single-window scene manifest without dropping unrelated keys", () => {
      const transformed = applyIosSceneManifestPolicy({
        CFBundleDisplayName: "DNS Chat",
      });

      expect(transformed.CFBundleDisplayName).toBe("DNS Chat");
      expect(transformed.UIApplicationSceneManifest).toEqual({
        UIApplicationSupportsMultipleScenes: false,
        UISceneConfigurations: {
          UIWindowSceneSessionRoleApplication: [
            {
              UISceneConfigurationName: "Default Configuration",
              UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
            },
          ],
        },
      });
    });
  });

  describe("applyMainApplicationKotlinPolicy", () => {
    const baselineMainApp = `
package org.mvneves.dnschat

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import expo.modules.ExpoReactHostFactory

class MainApplication : Application(), ReactApplication {
  override val reactHost: ReactHost by lazy {
    ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
        }
    )
  }
}
`;

    it("keeps ExpoLinking + DNS package registration in package list", () => {
      const transformed = applyMainApplicationKotlinPolicy(baselineMainApp);

      expect(transformed).toContain("ExpoLinkingPackage");
      expect(transformed).toContain("ModuleRegistryAdapter");
      expect(transformed).toContain("DNSNativePackage");
      expect(transformed).toContain("add(ModuleRegistryAdapter(manualExpoPackages))");
      expect(transformed).toContain("add(DNSNativePackage())");
    });
  });

  describe("applyIosProjectVersionPolicy", () => {
    it("rewrites MARKETING_VERSION and CURRENT_PROJECT_VERSION from config values", () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dnschat-plugin-test-"));
      const projectName = "DNSChat";
      const pbxprojDir = path.join(tmpDir, `${projectName}.xcodeproj`);
      const pbxprojPath = path.join(pbxprojDir, "project.pbxproj");
      fs.mkdirSync(pbxprojDir, { recursive: true });
      fs.writeFileSync(
        pbxprojPath,
        `
MARKETING_VERSION = 1.0;
CURRENT_PROJECT_VERSION = 1;
`,
      );

      applyIosProjectVersionPolicy(tmpDir, projectName, "4.0.5", "33");
      const updated = fs.readFileSync(pbxprojPath, "utf8");

      expect(updated).toContain("MARKETING_VERSION = 4.0.5;");
      expect(updated).toContain("CURRENT_PROJECT_VERSION = 33;");
    });
  });
});
