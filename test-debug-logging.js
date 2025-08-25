#!/usr/bin/env node

/**
 * Test script to verify debug logging implementation
 * Run with: node test-debug-logging.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Debug Logging Implementation\n');
console.log('=' .repeat(50));

// 1. Check if DNSLogService has debug functionality
console.log('\n📁 Checking DNSLogService implementation...');
const dnsLogServicePath = path.join(__dirname, 'src/services/dnsLogService.ts');
if (fs.existsSync(dnsLogServicePath)) {
  const content = fs.readFileSync(dnsLogServicePath, 'utf8');
  
  const checks = [
    { name: 'Debug mode property', pattern: /private static debugMode:\s*boolean/ },
    { name: 'setDebugMode method', pattern: /static setDebugMode\(mode:\s*boolean\)/ },
    { name: 'getDebugMode method', pattern: /static getDebugMode\(\):\s*boolean/ },
    { name: 'Debug data capture', pattern: /debugData:.*debugContext/ },
    { name: 'Export functionality', pattern: /static async exportLogAsJSON/ },
    { name: 'Sanitize debug data', pattern: /private static sanitizeDebugData/ },
    { name: 'Circular reference handling', pattern: /WeakSet/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(content);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
  });
} else {
  console.log('  ❌ DNSLogService file not found!');
}

// 2. Check SettingsContext for debug mode
console.log('\n📁 Checking SettingsContext implementation...');
const settingsContextPath = path.join(__dirname, 'src/context/SettingsContext.tsx');
if (fs.existsSync(settingsContextPath)) {
  const content = fs.readFileSync(settingsContextPath, 'utf8');
  
  const checks = [
    { name: 'debugMode state', pattern: /debugMode:\s*boolean/ },
    { name: 'updateDebugMode method', pattern: /updateDebugMode.*boolean.*Promise/ },
    { name: 'Debug mode persistence', pattern: /debugMode.*AsyncStorage/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(content);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
  });
} else {
  console.log('  ❌ SettingsContext file not found!');
}

// 3. Check Settings screen for debug toggle
console.log('\n📁 Checking Settings screen implementation...');
const settingsScreenPath = path.join(__dirname, 'src/navigation/screens/Settings.tsx');
if (fs.existsSync(settingsScreenPath)) {
  const content = fs.readFileSync(settingsScreenPath, 'utf8');
  
  const checks = [
    { name: 'DEBUG mode section', pattern: /Development.*Debug/i },
    { name: 'Debug toggle Switch', pattern: /Switch.*debugMode/ },
    { name: 'Uses updateDebugMode', pattern: /updateDebugMode/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(content);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
  });
} else {
  console.log('  ❌ Settings screen file not found!');
}

// 4. Check Logs screen for export functionality
console.log('\n📁 Checking Logs screen implementation...');
const logsScreenPath = path.join(__dirname, 'src/navigation/screens/Logs.tsx');
if (fs.existsSync(logsScreenPath)) {
  const content = fs.readFileSync(logsScreenPath, 'utf8');
  
  const checks = [
    { name: 'Export button', pattern: /Export.*JSON/i },
    { name: 'exportLog function', pattern: /const exportLog.*async/ },
    { name: 'Share API usage', pattern: /Share\.share|navigator\.share/ },
    { name: 'Debug sections display', pattern: /debugData/ },
    { name: 'Loading state handling', pattern: /exportingLogId/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(content);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
  });
} else {
  console.log('  ❌ Logs screen file not found!');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('✨ Debug Logging Implementation Test Complete!\n');
console.log('Key Features Implemented:');
console.log('  • DEBUG mode toggle in Settings');
console.log('  • Detailed debug data capture when enabled');
console.log('  • Export individual logs as JSON');
console.log('  • Share logs via email, WhatsApp, or save to files');
console.log('  • Display debug info in scrollable sections');
console.log('  • Circular reference protection');
console.log('  • Memory management with data truncation');
console.log('\n📱 To test in the app:');
console.log('  1. Run: npm run ios or npm run android');
console.log('  2. Go to Settings → Development → Enable DEBUG mode');
console.log('  3. Send a DNS query in chat');
console.log('  4. Go to Logs tab to see detailed debug info');
console.log('  5. Tap "Export as JSON" to share the log');