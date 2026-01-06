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

            // Add dnsjava dependency if not already present
            if (!buildGradleContent.includes("dnsjava:dnsjava")) {
              buildGradleContent = buildGradleContent.replace(
                /(dependencies\s*\{)/,
                `$1\n    // DNS Java library for legacy DNS support (API < 29)\n    implementation("dnsjava:dnsjava:3.5.2")\n`,
              );
              fs.writeFileSync(appBuildGradlePath, buildGradleContent);
            }
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

            // Add import (Kotlin uses same import syntax as Java)
            const importPattern = isKotlin
              ? /(import com\.facebook\.react\.ReactPackage)/
              : /(import com\.facebook\.react\.ReactPackage;)/;
            const importStatement = isKotlin
              ? "$1\nimport com.dnsnative.DNSNativePackage"
              : "$1\nimport com.dnsnative.DNSNativePackage;";

            if (!content.includes("import com.dnsnative.DNSNativePackage")) {
              content = content.replace(importPattern, importStatement);
            }

            // Add package to list
            if (isKotlin) {
              // Kotlin with modern Expo SDK 54+: PackageList(this).packages.apply { add(DNSNativePackage()) }
              if (!content.includes("add(DNSNativePackage())")) {
                // Try modern Expo SDK 54+ pattern first
                if (content.includes("PackageList(this).packages.apply")) {
                  content = content.replace(
                    /(PackageList\(this\)\.packages\.apply\s*\{[^}]*)(\/\/[^\n]*\n\s*\/\/[^\n]*\n\s*\})/,
                    "$1// DNS native module (not auto-linked)\n              add(DNSNativePackage())\n            }",
                  );
                } else {
                  // Fallback: older Expo pattern
                  content = content.replace(
                    /(packages\.add\(ModuleRegistryAdapter\(manualExpoPackages\)\))/,
                    "$1\n            packages.add(DNSNativePackage())",
                  );
                }
              }
            } else {
              // Java: packages.add(new DNSNativePackage())
              if (!content.includes("new DNSNativePackage()")) {
                content = content.replace(
                  /(new MainReactPackage\(\)[,\s]*)/,
                  "$1\nnew DNSNativePackage(),",
                );
              }
            }

            fs.writeFileSync(mainAppPath, content);
          }

          return config;
        },
      ]),
  ]);
};

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
