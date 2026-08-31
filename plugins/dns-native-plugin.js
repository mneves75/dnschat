const {
  withAppDelegate,
  withDangerousMod,
  withInfoPlist,
  withPlugins,
} = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

const DNSJAVA_MIN_VERSION = "3.6.2";
const iosSceneDelegateTemplate = fs.readFileSync(
  path.join(__dirname, "templates", "ios", "SceneDelegate.swift"),
  "utf8",
);

const withDNSNativeModule = (config) => {
  return withPlugins(config, [
    (config) => {
      config = withInfoPlist(config, (config) => {
        config.modResults = applyIosSceneManifestPolicy(config.modResults);
        return config;
      });

      return withAppDelegate(config, (config) => {
        if (config.modResults.language !== "swift") {
          throw new Error("DNSChat's iOS scene lifecycle requires a Swift AppDelegate");
        }

        config.modResults.contents = applyIosAppDelegateScenePolicy(
          config.modResults.contents,
        );
        return config;
      });
    },

    // iOS native module integration
    (config) =>
      withDangerousMod(config, [
        "ios",
        async (config) => {
          const projectRoot = config.modRequest.projectRoot;
          const iosSourcePath = path.join(
            projectRoot,
            "modules",
            "dns-native",
            "ios",
          );
          const iosDestPath = path.join(
            config.modRequest.platformProjectRoot,
            "DNSNative",
          );

          // Copy iOS native module files
          if (fs.existsSync(iosSourcePath)) {
            await copyDirectory(iosSourcePath, iosDestPath);
          }

          const iosProjectName = config.modRequest.projectName;
          const desiredVersion = config.version;
          const desiredBuildNumber = config.ios?.buildNumber;
          applyIosProjectVersionPolicy(
            config.modRequest.platformProjectRoot,
            iosProjectName,
            desiredVersion,
            desiredBuildNumber,
          );

          return config;
        },
      ]),

    // Android native module integration
    (config) =>
      withDangerousMod(config, [
        "android",
        async (config) => {
          const projectRoot = config.modRequest.projectRoot;
          const androidSourcePath = path.join(
            projectRoot,
            "modules",
            "dns-native",
            "android",
          );
          const androidDestPath = path.join(
            config.modRequest.platformProjectRoot,
            "app",
            "src",
            "main",
            "java",
            "com",
            "dnsnative",
          );

          // Copy Android native module files (Java only, skip build.gradle etc)
          if (fs.existsSync(androidSourcePath)) {
            await copyDirectory(androidSourcePath, androidDestPath, { javaOnly: true });
          }

          // Add dnsjava dependency to app/build.gradle
          const appBuildGradlePath = path.join(
            config.modRequest.platformProjectRoot,
            "app",
            "build.gradle",
          );

          if (fs.existsSync(appBuildGradlePath)) {
            let buildGradleContent = fs.readFileSync(appBuildGradlePath, "utf8");
            buildGradleContent = applyAndroidBuildGradlePolicy(buildGradleContent);
            fs.writeFileSync(appBuildGradlePath, buildGradleContent);
          }

          // Add to MainApplication (.java or .kt)
          const packageName = config.android?.package || "org.mvneves.dnschat";
          const packagePath = packageName.split(".").join("/");
          const mainAppDir = path.join(
            config.modRequest.platformProjectRoot,
            "app",
            "src",
            "main",
            "java",
            packagePath,
          );

          // Try Kotlin first (modern Expo projects), then fallback to Java
          const mainAppKtPath = path.join(mainAppDir, "MainApplication.kt");
          const mainAppJavaPath = path.join(mainAppDir, "MainApplication.java");

          let mainAppPath = null;
          if (fs.existsSync(mainAppKtPath)) {
            mainAppPath = mainAppKtPath;
          } else if (fs.existsSync(mainAppJavaPath)) {
            mainAppPath = mainAppJavaPath;
          }

          if (mainAppPath) {
            let content = fs.readFileSync(mainAppPath, "utf8");
            const isKotlin = mainAppPath.endsWith(".kt");

            if (isKotlin) {
              content = applyMainApplicationKotlinPolicy(content);
            } else {
              // Java: packages.add(new DNSNativePackage())
              content = applyMainApplicationJavaPolicy(content);
            }

            fs.writeFileSync(mainAppPath, content);
          }

          return config;
        },
      ]),
  ]);
};

function applyAndroidBuildGradlePolicy(content) {
  let next = content;

  let foundDnsjavaDependency = false;
  next = next.replace(
    /(["']dnsjava:dnsjava:)(\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?)(["'])/g,
    (dependency, prefix, version, suffix) => {
      foundDnsjavaDependency = true;
      if (compareVersions(version, DNSJAVA_MIN_VERSION) < 0) {
        return prefix + DNSJAVA_MIN_VERSION + suffix;
      }
      return dependency;
    },
  );

  if (!foundDnsjavaDependency && !next.includes("dnsjava:dnsjava")) {
    next = next.replace(
      /(dependencies\s*\{)/,
      `$1\n    // DNS Java library for legacy DNS support (API < 29)\n    // 3.6.2+ fixes CVE-2024-25638 (improper DNS response validation)\n    implementation("dnsjava:dnsjava:${DNSJAVA_MIN_VERSION}")\n`,
    );
  }

  if (!next.includes("def keystoreProperties = new Properties()")) {
    const keystorePolicyBlock = `
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file("keystore.properties")
def repoKeystorePropertiesFile = new File(projectRoot, "keystore.properties")
def hasReleaseSigning = false
def keystorePropertiesBaseDir = null
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
    keystorePropertiesBaseDir = keystorePropertiesFile.getParentFile()
    hasReleaseSigning = true
} else if (repoKeystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(repoKeystorePropertiesFile))
    keystorePropertiesBaseDir = repoKeystorePropertiesFile.getParentFile()
    hasReleaseSigning = true
}
`;
    next = next.replace(/^(\s*def jscFlavor = [^\n]+\n)/m, `$1${keystorePolicyBlock}\n`);
  }

  if (!next.includes("def keystorePropertiesBaseDir = null")) {
    next = next.replace(
      /def hasReleaseSigning = false\n/,
      "def hasReleaseSigning = false\ndef keystorePropertiesBaseDir = null\n",
    );
  }
  if (!next.includes("keystorePropertiesBaseDir = keystorePropertiesFile.getParentFile()")) {
    next = next.replace(
      /(keystoreProperties\.load\(new FileInputStream\(keystorePropertiesFile\)\)\n)/,
      "$1    keystorePropertiesBaseDir = keystorePropertiesFile.getParentFile()\n",
    );
  }
  if (!next.includes("keystorePropertiesBaseDir = repoKeystorePropertiesFile.getParentFile()")) {
    next = next.replace(
      /(keystoreProperties\.load\(new FileInputStream\(repoKeystorePropertiesFile\)\)\n)/,
      "$1    keystorePropertiesBaseDir = repoKeystorePropertiesFile.getParentFile()\n",
    );
  }

  if (!/signingConfigs\s*\{[\s\S]*?\n\s*release\s*\{[\s\S]*?hasReleaseSigning/.test(next)) {
    next = next.replace(
      /(signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\n\s*\})/,
      `$1
        release {
            if (hasReleaseSigning) {
                def configuredStoreFile = new File(keystoreProperties['storeFile'])
                storeFile(configuredStoreFile.isAbsolute() ? configuredStoreFile : new File(keystorePropertiesBaseDir, configuredStoreFile.path))
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }`,
    );
  }

  next = next.replace(
    /storeFile\s+file\(keystoreProperties\[['"]storeFile['"]\]\)/g,
    "def configuredStoreFile = new File(keystoreProperties['storeFile'])\n                storeFile(configuredStoreFile.isAbsolute() ? configuredStoreFile : new File(keystorePropertiesBaseDir, configuredStoreFile.path))",
  );

  next = rewriteNamedBlock(next, "buildTypes", (buildTypesBody) => {
    let nextBuildTypesBody = buildTypesBody;

    nextBuildTypesBody = rewriteNamedBlock(nextBuildTypesBody, "debug", (debugBody) =>
      debugBody.replace(
        /\n\s*if \(hasReleaseSigning\)\s*\{[\s\S]*?signingConfig\s+signingConfigs\.release[\s\S]*?\n\s*\}/g,
        "",
      ),
    );

    nextBuildTypesBody = rewriteNamedBlock(nextBuildTypesBody, "release", (releaseBody) => {
      let nextReleaseBody = releaseBody;
      nextReleaseBody = nextReleaseBody.replace(
        /\n[ \t]*signingConfig\s+signingConfigs\.debug[ \t]*\n/g,
        "\n",
      );

      if (!/if \(hasReleaseSigning\)\s*\{[\s\S]*?signingConfig\s+signingConfigs\.release/.test(nextReleaseBody)) {
        nextReleaseBody = nextReleaseBody.replace(
          /(\n\s*\/\/ see https:\/\/reactnative\.dev\/docs\/signed-apk-android\.\n)/,
          `$1            if (hasReleaseSigning) {\n                signingConfig signingConfigs.release\n            }\n`,
        );
      }

      return nextReleaseBody;
    });

    return nextBuildTypesBody;
  });

  return next;
}

function compareVersions(left, right) {
  const parse = (version) => {
    const [core, qualifier = ""] = version.split(/(?=[-+])/u, 2);
    return {
      parts: core.split(".").map(Number),
      isPrerelease: qualifier.startsWith("-"),
    };
  };
  const leftVersion = parse(left);
  const rightVersion = parse(right);

  for (let i = 0; i < 3; i += 1) {
    const difference = leftVersion.parts[i] - rightVersion.parts[i];
    if (difference !== 0) return difference;
  }
  if (leftVersion.isPrerelease === rightVersion.isPrerelease) return 0;
  return leftVersion.isPrerelease ? -1 : 1;
}

function applyIosSceneManifestPolicy(infoPlist) {
  return {
    ...infoPlist,
    UIApplicationSceneManifest: {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
          },
        ],
      },
    },
  };
}

function applyIosAppDelegateScenePolicy(content) {
  let next = content;

  if (!next.includes("internal import ExpoModulesCore")) {
    next = next.replace(
      "internal import Expo\n",
      "internal import Expo\ninternal import ExpoModulesCore\n",
    );
  }

  next = next.replace(
    /\n#if os\(iOS\) \|\| os\(tvOS\)\n[\s\S]*?factory\.startReactNative\([\s\S]*?\n#endif\n/,
    "\n",
  );

  if (!next.includes("class SceneDelegate: UIResponder, UIWindowSceneDelegate")) {
    next = next.trimEnd() + "\n\n" + iosSceneDelegateTemplate.trim() + "\n";
  }

  return next;
}

function rewriteNamedBlock(content, blockName, rewriter) {
  const headerRegex = new RegExp(`\\b${blockName}\\s*\\{`);
  const headerMatch = headerRegex.exec(content);
  if (!headerMatch) return content;

  const openBraceIdx = content.indexOf("{", headerMatch.index);
  if (openBraceIdx < 0) return content;

  let depth = 0;
  let closeBraceIdx = -1;
  for (let i = openBraceIdx; i < content.length; i += 1) {
    const char = content[i];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        closeBraceIdx = i;
        break;
      }
    }
  }
  if (closeBraceIdx < 0) return content;

  const bodyStart = openBraceIdx + 1;
  const currentBody = content.slice(bodyStart, closeBraceIdx);
  const nextBody = rewriter(currentBody);
  return content.slice(0, bodyStart) + nextBody + content.slice(closeBraceIdx);
}

function insertImport(content, importLine) {
  if (content.includes(importLine)) return content;
  const lines = content.split("\n");
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith("import ")) {
      lastImportIdx = i;
    }
  }
  if (lastImportIdx >= 0) {
    lines.splice(lastImportIdx + 1, 0, importLine);
    return lines.join("\n");
  }
  return content;
}

function applyMainApplicationKotlinPolicy(content) {
  let next = content;

  next = insertImport(next, "import com.dnsnative.DNSNativePackage");
  next = insertImport(next, "import expo.modules.adapters.react.ModuleRegistryAdapter");
  next = insertImport(next, "import expo.modules.core.interfaces.Package");
  next = insertImport(next, "import expo.modules.linking.ExpoLinkingPackage");

  if (!next.includes("private val manualExpoPackages: List<Package> = listOf(ExpoLinkingPackage())")) {
    next = next.replace(
      /(class MainApplication[^\n]*\{\n)/,
      `$1  private val manualExpoPackages: List<Package> = listOf(ExpoLinkingPackage())\n\n`,
    );
  }

  if (next.includes("PackageList(this).packages.apply {")) {
    if (!next.includes("add(DNSNativePackage())")) {
      next = next.replace(
        "PackageList(this).packages.apply {",
        `PackageList(this).packages.apply {\n          // DNS native module (not auto-linked)\n          add(DNSNativePackage())`,
      );
    }
    if (!next.includes("add(ModuleRegistryAdapter(manualExpoPackages))")) {
      next = next.replace(
        "PackageList(this).packages.apply {",
        `PackageList(this).packages.apply {\n          // Manual Expo module registration (not auto-linked in some dev-client flows)\n          add(ModuleRegistryAdapter(manualExpoPackages))`,
      );
    }
  } else {
    // Fallback pattern for older templates.
    if (!next.includes("add(DNSNativePackage())")) {
      next = next.replace(
        /(packages\.add\(ModuleRegistryAdapter\(manualExpoPackages\)\))/,
        "$1\n            packages.add(DNSNativePackage())",
      );
    }
  }

  return next;
}

function applyMainApplicationJavaPolicy(content) {
  let next = content;

  if (!next.includes("import com.dnsnative.DNSNativePackage;")) {
    next = next.replace(
      /(import com\.facebook\.react\.ReactPackage;)/,
      "$1\nimport com.dnsnative.DNSNativePackage;",
    );
  }

  if (!next.includes("new DNSNativePackage()")) {
    next = next.replace(
      /(new MainReactPackage\(\)[,\s]*)/,
      "$1\nnew DNSNativePackage(),",
    );
  }

  return next;
}

function applyIosProjectVersionPolicy(
  platformProjectRoot,
  projectName,
  desiredVersion,
  desiredBuildNumber,
) {
  if (!projectName || !desiredVersion || !desiredBuildNumber) return;

  const pbxprojPath = path.join(
    platformProjectRoot,
    `${projectName}.xcodeproj`,
    "project.pbxproj",
  );
  if (!fs.existsSync(pbxprojPath)) return;

  let pbxproj = fs.readFileSync(pbxprojPath, "utf8");

  pbxproj = pbxproj.replace(
    /MARKETING_VERSION = [^;]+;/g,
    `MARKETING_VERSION = ${desiredVersion};`,
  );
  pbxproj = pbxproj.replace(
    /CURRENT_PROJECT_VERSION = \d+;/g,
    `CURRENT_PROJECT_VERSION = ${desiredBuildNumber};`,
  );

  fs.writeFileSync(pbxprojPath, pbxproj);
}

async function copyDirectory(src, dest, options = {}) {
  const { javaOnly = false } = options;

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip build artifacts and gradle files when copying Java sources
    if (javaOnly) {
      if (entry.name === 'build.gradle' ||
          entry.name === '.gradle' ||
          entry.name === 'build' ||
          entry.name.endsWith('.kt')) {
        continue;
      }
    }

    if (entry.isDirectory()) {
      // Skip .gradle and build directories
      if (entry.name === '.gradle' || entry.name === 'build') {
        continue;
      }
      await copyDirectory(srcPath, destPath, options);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

module.exports = withDNSNativeModule;
module.exports.__test__ = {
  applyAndroidBuildGradlePolicy,
  applyMainApplicationKotlinPolicy,
  applyMainApplicationJavaPolicy,
  applyIosProjectVersionPolicy,
  applyIosSceneManifestPolicy,
  applyIosAppDelegateScenePolicy,
  compareVersions,
  rewriteNamedBlock,
};
