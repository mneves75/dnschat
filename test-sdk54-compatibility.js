#!/usr/bin/env node

/**
 * SDK 54 Compatibility Test Suite
 * Tests critical functionality after upgrade
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing SDK 54 Compatibility\n');
console.log('='.repeat(50));

// Test 1: Check package versions
console.log('\n📦 Package Version Compatibility:');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const criticalPackages = {
  'expo': { expected: '^54.0.0', actual: pkg.dependencies['expo'] },
  'react-native': { expected: '0.81.0', actual: pkg.dependencies['react-native'] },
  'react': { expected: '19.1.0', actual: pkg.dependencies['react'] },
  'react-native-udp': { expected: '4.1.7', actual: pkg.dependencies['react-native-udp'] },
  'react-native-tcp-socket': { expected: '6.3.0', actual: pkg.dependencies['react-native-tcp-socket'] },
  'dns-packet': { expected: '5.6.1', actual: pkg.dependencies['dns-packet'] }
};

let hasVersionIssues = false;
Object.entries(criticalPackages).forEach(([name, versions]) => {
  const isCorrect = versions.actual && versions.actual.includes(versions.expected.replace('^', ''));
  console.log(`  ${isCorrect ? '✅' : '⚠️'} ${name}: ${versions.actual || 'NOT FOUND'}`);
  if (!isCorrect) hasVersionIssues = true;
});

// Test 2: Check app.json schema
console.log('\n📋 App.json Schema Validation:');
const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));

const invalidFields = {
  ios: ['deploymentTarget', 'liquidGlassIcon'],
  android: ['targetSdkVersion', 'edgeToEdge', 'predictiveBackGesture']
};

let hasSchemaIssues = false;
Object.entries(invalidFields).forEach(([platform, fields]) => {
  fields.forEach(field => {
    const hasField = appConfig.expo[platform] && appConfig.expo[platform][field] !== undefined;
    console.log(`  ${hasField ? '❌' : '✅'} ${platform}.${field}: ${hasField ? 'SHOULD BE REMOVED' : 'OK'}`);
    if (hasField) hasSchemaIssues = true;
  });
});

// Test 3: Check for iOS directory issues
console.log('\n🍎 iOS Build Configuration:');
const iosExists = fs.existsSync('ios');
const podfileExists = fs.existsSync('ios/Podfile');
const podsExists = fs.existsSync('ios/Pods');

console.log(`  ${iosExists ? '✅' : '⚠️'} iOS directory: ${iosExists ? 'EXISTS' : 'NOT FOUND'}`);
if (iosExists) {
  console.log(`  ${podfileExists ? '✅' : '❌'} Podfile: ${podfileExists ? 'EXISTS' : 'NOT FOUND'}`);
  console.log(`  ${podsExists ? '⚠️' : '✅'} Pods directory: ${podsExists ? 'EXISTS (may need clean)' : 'CLEAN'}`);
}

// Test 4: Check DNS Service implementation
console.log('\n🌐 DNS Service Compatibility:');
const dnsServicePath = 'src/services/dnsService.ts';
if (fs.existsSync(dnsServicePath)) {
  const dnsContent = fs.readFileSync(dnsServicePath, 'utf8');
  
  const checks = [
    { name: 'UDP fallback', pattern: /queryDNSUDP/ },
    { name: 'TCP fallback', pattern: /queryDNSTCP/ },
    { name: 'HTTPS fallback', pattern: /queryDNSOverHTTPS/ },
    { name: 'Native DNS', pattern: /queryNativeDNS/ },
    { name: 'Error handling', pattern: /try.*catch/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(dnsContent);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
  });
}

// Test 5: Known SDK 54 Issues
console.log('\n⚠️ Known SDK 54 Beta Issues:');
const knownIssues = [
  { 
    issue: 'react-native-udp unmaintained',
    impact: 'DNS over UDP may fail',
    severity: 'HIGH',
    fix: 'Rely on native DNS or HTTPS fallback'
  },
  {
    issue: 'react-native-tcp-socket New Architecture',
    impact: 'TCP fallback might crash',
    severity: 'MEDIUM',
    fix: 'Test thoroughly, prepare HTTPS fallback'
  },
  {
    issue: 'CocoaPods XCFramework',
    impact: 'iOS build failures',
    severity: 'HIGH',
    fix: 'Clean build: rm -rf ios/Pods ios/build && cd ios && pod install'
  }
];

knownIssues.forEach(({ issue, impact, severity, fix }) => {
  console.log(`\n  🔸 ${issue}`);
  console.log(`     Impact: ${impact}`);
  console.log(`     Severity: ${severity}`);
  console.log(`     Fix: ${fix}`);
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Summary:');
if (hasVersionIssues) {
  console.log('  ⚠️ Package version mismatches detected');
}
if (hasSchemaIssues) {
  console.log('  ❌ App.json has invalid fields for SDK 54');
}
if (!hasVersionIssues && !hasSchemaIssues) {
  console.log('  ✅ Basic compatibility checks passed');
}

console.log('\n💡 Recommendations:');
console.log('  1. Clean iOS build: npm run clean-ios');
console.log('  2. Test DNS fallback chain thoroughly');
console.log('  3. Monitor for react-native-udp/tcp-socket crashes');
console.log('  4. Have HTTPS fallback ready as primary backup');
console.log('  5. Consider migrating to maintained networking libraries');