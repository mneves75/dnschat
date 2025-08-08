const { withDangerousMod, withPlugins } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const withDNSNativeModule = (config) => {
  return withPlugins(config, [
    // iOS native module integration
    (config) => withDangerousMod(config, [
      'ios',
      async (config) => {
        const projectRoot = config.modRequest.projectRoot;
        const iosSourcePath = path.join(projectRoot, 'modules', 'dns-native', 'ios');
        const iosDestPath = path.join(config.modRequest.platformProjectRoot, 'DNSNative');

        // Copy iOS native module files
        if (fs.existsSync(iosSourcePath)) {
          await copyDirectory(iosSourcePath, iosDestPath);
        }

        return config;
      },
    ]),

    // Android native module integration
    (config) => withDangerousMod(config, [
      'android',
      async (config) => {
        const projectRoot = config.modRequest.projectRoot;
        const androidSourcePath = path.join(projectRoot, 'modules', 'dns-native', 'android');
        const androidDestPath = path.join(
          config.modRequest.platformProjectRoot,
          'app', 'src', 'main', 'java', 'com', 'dnsnative'
        );

        // Copy Android native module files
        if (fs.existsSync(androidSourcePath)) {
          await copyDirectory(androidSourcePath, androidDestPath);
        }

        // Add to MainApplication.java
        const mainAppPath = path.join(
          config.modRequest.platformProjectRoot,
          'app', 'src', 'main', 'java', 'com', config.android?.package?.split('.').pop() || 'chatdns', 'MainApplication.java'
        );

        if (fs.existsSync(mainAppPath)) {
          let content = fs.readFileSync(mainAppPath, 'utf8');
          
          // Add import
          if (!content.includes('import com.dnsnative.DNSNativePackage;')) {
            content = content.replace(
              /(import com\.facebook\.react\.ReactPackage;)/,
              '$1\nimport com.dnsnative.DNSNativePackage;'
            );
          }

          // Add package to list
          if (!content.includes('new DNSNativePackage()')) {
            content = content.replace(
              /(new MainReactPackage\(\)[,\s]*)/,
              '$1\nnew DNSNativePackage(),'
            );
          }

          fs.writeFileSync(mainAppPath, content);
        }

        return config;
      },
    ]),
  ]);
};

async function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

module.exports = withDNSNativeModule;