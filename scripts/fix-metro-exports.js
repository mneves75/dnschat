#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to Metro package.json
const metroPackagePath = path.join(__dirname, '..', 'node_modules', 'metro', 'package.json');

try {
  // Read the current Metro package.json
  const metroPackage = JSON.parse(fs.readFileSync(metroPackagePath, 'utf8'));
  
  // Add the missing exports
  if (metroPackage.exports) {
    metroPackage.exports['./src/lib/TerminalReporter'] = './src/lib/TerminalReporter.js';
    metroPackage.exports['./src/lib/JsonReporter'] = './src/lib/JsonReporter.js';
  } else {
    metroPackage.exports = {
      ".": "./src/index.js",
      "./package.json": "./package.json", 
      "./private/*": "./src/*.js",
      "./src/lib/TerminalReporter": "./src/lib/TerminalReporter.js",
      "./src/lib/JsonReporter": "./src/lib/JsonReporter.js"
    };
  }
  
  // Write back the modified package.json
  fs.writeFileSync(metroPackagePath, JSON.stringify(metroPackage, null, 2));
  console.log('✅ Fixed Metro package exports');
} catch (error) {
  console.error('❌ Failed to fix Metro package exports:', error.message);
  process.exit(1);
}
