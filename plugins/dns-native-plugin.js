const { withDangerousMod, withPlugins } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

const withDNSNativeModule = (config) => {
  return withPlugins(config, [
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

  if (!next.includes("dnsjava:dnsjava")) {
    next = next.replace(
      /(dependencies\s*\{)/,
      `$1\n    // DNS Java library for legacy DNS support (API < 29)\n    implementation("dnsjava:dnsjava:3.5.2")\n`,
    );
  }

  if (!next.includes("def keystoreProperties = new Properties()")) {
    const keystorePolicyBlock = `
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file("keystore.properties")
def repoKeystorePropertiesFile = new File(projectRoot, "keystore.properties")
def hasReleaseSigning = false
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
    hasReleaseSigning = true
} else if (repoKeystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(repoKeystorePropertiesFile))
    hasReleaseSigning = true
}
`;
    next = next.replace(/^(\s*def jscFlavor = [^\n]+\n)/m, `$1${keystorePolicyBlock}\n`);
  }

  if (!/signingConfigs\s*\{[\s\S]*?\n\s*release\s*\{[\s\S]*?hasReleaseSigning/.test(next)) {
    next = next.replace(
      /(signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\n\s*\})/,
      `$1
        release {
            if (hasReleaseSigning) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }`,
    );
  }

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
  rewriteNamedBlock,
};
