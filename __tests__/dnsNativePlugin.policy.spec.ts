import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const plugin = require("../plugins/dns-native-plugin.js");
const {
  applyAndroidBuildGradlePolicy,
  applyMainApplicationKotlinPolicy,
  applyIosProjectVersionPolicy,
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
      expect(transformed).toContain("if (hasReleaseSigning) {");
      expect(transformed).toContain("signingConfig signingConfigs.release");

      const releaseBlock = transformed.match(/release\s*\{[\s\S]*?\n\s*\}/)?.[0] ?? "";
      expect(releaseBlock).not.toContain("signingConfig signingConfigs.debug");
    });

    it("is idempotent", () => {
      const once = applyAndroidBuildGradlePolicy(baselineGradle);
      const twice = applyAndroidBuildGradlePolicy(once);
      expect(twice).toBe(once);
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
