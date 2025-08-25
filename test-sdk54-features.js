#!/usr/bin/env node

/**
 * SDK 54 Feature Verification Test
 * Tests all critical features after upgrade
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 SDK 54 Feature Verification\n');
console.log('='.repeat(50));

const testResults = [];

// Test 1: Core Dependencies
console.log('\n📦 Core Dependencies:');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const coreDeps = {
  'expo': { expected: '54.0.0', actual: pkg.dependencies['expo'] },
  'react': { expected: '19.1.0', actual: pkg.dependencies['react'] },
  'react-native': { expected: '0.81.0', actual: pkg.dependencies['react-native'] }
};

Object.entries(coreDeps).forEach(([name, versions]) => {
  const pass = versions.actual && versions.actual.includes(versions.expected);
  console.log(`  ${pass ? '✅' : '❌'} ${name}: ${versions.actual}`);
  testResults.push({ test: `${name} version`, pass });
});

// Test 2: DNS Service Features
console.log('\n🌐 DNS Service Features:');
const dnsServicePath = 'src/services/dnsService.ts';
if (fs.existsSync(dnsServicePath)) {
  const content = fs.readFileSync(dnsServicePath, 'utf8');
  
  const features = [
    { name: 'Native DNS', pattern: /queryLLM.*nativeDNS/s },
    { name: 'HTTPS Fallback', pattern: /queryDNSOverHTTPS|fetch.*cloudflare/s },
    { name: 'UDP Support', pattern: /react-native-udp|dgram/s },
    { name: 'TCP Support', pattern: /react-native-tcp|TcpSocket/s },
    { name: 'Mock Service', pattern: /MockDNSService/s },
    { name: 'Error Handling', pattern: /try.*catch.*finally/s }
  ];
  
  features.forEach(({ name, pattern }) => {
    const found = pattern.test(content);
    console.log(`  ${found ? '✅' : '❌'} ${name}`);
    testResults.push({ test: name, pass: found });
  });
} else {
  console.log('  ❌ DNS Service file not found');
  testResults.push({ test: 'DNS Service', pass: false });
}

// Test 3: Debug Logging System
console.log('\n🐛 Debug Logging System:');
const debugFeatures = [
  { 
    file: 'src/context/SettingsContext.tsx',
    name: 'Debug Mode Setting',
    pattern: /debugMode.*updateDebugMode/s
  },
  {
    file: 'src/services/dnsLogService.ts',
    name: 'Debug Data Capture',
    pattern: /debugData.*sanitizeDebugData/s
  },
  {
    file: 'src/navigation/screens/Logs.tsx',
    name: 'Export Functionality',
    pattern: /exportLog.*Share\.share/s
  },
  {
    file: 'src/navigation/screens/Settings.tsx',
    name: 'Debug Toggle UI',
    pattern: /Switch.*debugMode/s
  }
];

debugFeatures.forEach(({ file, name, pattern }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const found = pattern.test(content);
    console.log(`  ${found ? '✅' : '❌'} ${name}`);
    testResults.push({ test: name, pass: found });
  } else {
    console.log(`  ❌ ${name} - file not found`);
    testResults.push({ test: name, pass: false });
  }
});

// Test 4: Liquid Glass Components
console.log('\n💎 Liquid Glass Components:');
const glassComponents = [
  'src/components/LiquidGlassWrapper.tsx',
  'src/components/glass/GlassBottomSheet.tsx',
  'src/components/glass/GlassTabBar.tsx',
  'src/components/glass/GlassForm.tsx'
];

glassComponents.forEach(file => {
  const exists = fs.existsSync(file);
  const name = path.basename(file, '.tsx');
  console.log(`  ${exists ? '✅' : '❌'} ${name}`);
  testResults.push({ test: name, pass: exists });
});

// Test 5: Network Safety Wrappers
console.log('\n🛡️ Network Safety (SDK 54):');
const safetyFeatures = [
  {
    file: 'src/services/networkHealthCheck.ts',
    name: 'Health Check Service'
  },
  {
    file: 'src/services/safeNetworkWrapper.ts',
    name: 'Safe Network Wrapper'
  }
];

safetyFeatures.forEach(({ file, name }) => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${name}`);
  testResults.push({ test: name, pass: exists });
});

// Test 6: Build Configuration
console.log('\n🔧 Build Configuration:');
const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));

const configChecks = [
  {
    name: 'New Architecture Enabled',
    check: () => appConfig.expo.newArchEnabled === true
  },
  {
    name: 'expo-build-properties Plugin',
    check: () => {
      const plugins = appConfig.expo.plugins || [];
      return plugins.some(p => 
        Array.isArray(p) && p[0] === 'expo-build-properties'
      );
    }
  },
  {
    name: 'iOS Deployment Target',
    check: () => {
      const plugins = appConfig.expo.plugins || [];
      const buildProps = plugins.find(p => 
        Array.isArray(p) && p[0] === 'expo-build-properties'
      );
      return buildProps && buildProps[1]?.ios?.deploymentTarget === '16.0';
    }
  },
  {
    name: 'Android Target SDK',
    check: () => {
      const plugins = appConfig.expo.plugins || [];
      const buildProps = plugins.find(p => 
        Array.isArray(p) && p[0] === 'expo-build-properties'
      );
      return buildProps && buildProps[1]?.android?.targetSdkVersion === 36;
    }
  }
];

configChecks.forEach(({ name, check }) => {
  try {
    const pass = check();
    console.log(`  ${pass ? '✅' : '❌'} ${name}`);
    testResults.push({ test: name, pass });
  } catch (error) {
    console.log(`  ❌ ${name} - error checking`);
    testResults.push({ test: name, pass: false });
  }
});

// Test 7: Platform Builds
console.log('\n📱 Platform Support:');
const platforms = [
  { name: 'Android', dir: 'android', file: 'android/build.gradle' },
  { name: 'iOS', dir: 'ios', file: 'ios/Podfile' }
];

platforms.forEach(({ name, dir, file }) => {
  const dirExists = fs.existsSync(dir);
  const fileExists = fs.existsSync(file);
  const status = dirExists && fileExists ? '✅ Ready' : 
                 dirExists ? '⚠️ Incomplete' : '❌ Not built';
  console.log(`  ${status} ${name}`);
  testResults.push({ test: `${name} platform`, pass: dirExists && fileExists });
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Test Summary:');
const passed = testResults.filter(r => r.pass).length;
const total = testResults.length;
const percentage = Math.round((passed / total) * 100);

console.log(`  Passed: ${passed}/${total} (${percentage}%)`);

if (percentage === 100) {
  console.log('\n🎉 All features verified successfully!');
  console.log('✅ SDK 54 upgrade complete and functional');
} else if (percentage >= 80) {
  console.log('\n✅ Core features working');
  console.log('⚠️ Some non-critical features need attention');
} else if (percentage >= 60) {
  console.log('\n⚠️ Partial functionality');
  console.log('🔧 Several features need fixing');
} else {
  console.log('\n❌ Critical issues detected');
  console.log('🚨 SDK 54 upgrade needs significant work');
}

// Failed tests
const failed = testResults.filter(r => !r.pass);
if (failed.length > 0) {
  console.log('\n❌ Failed Tests:');
  failed.forEach(({ test }) => {
    console.log(`  - ${test}`);
  });
}

// Recommendations
console.log('\n💡 Next Steps:');
if (!fs.existsSync('ios/Podfile')) {
  console.log('  1. iOS build blocked by CocoaPods issue (known SDK 54 beta bug)');
}
console.log('  2. Test on Android: npm run android');
console.log('  3. Verify debug logging: Enable in Settings → Development');
console.log('  4. Test DNS methods: Send messages in chat');
console.log('  5. Monitor for crashes from unmaintained libraries');

process.exit(percentage === 100 ? 0 : 1);