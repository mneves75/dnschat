#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'android/app/src/main/java/com/dnsnative/DNSResolver.java');
const modulePath = path.join(repoRoot, 'modules/dns-native/android/DNSResolver.java');

const read = (filePath) => fs.readFileSync(filePath, 'utf8');

let appSource;
let moduleSource;

try {
  appSource = read(appPath);
} catch (error) {
  console.error(`[dnsresolver-sync] Failed to read app resolver: ${appPath}`);
  console.error(error.message);
  process.exit(1);
}

try {
  moduleSource = read(modulePath);
} catch (error) {
  console.error(`[dnsresolver-sync] Failed to read module resolver: ${modulePath}`);
  console.error(error.message);
  process.exit(1);
}

if (appSource !== moduleSource) {
  console.error('[dnsresolver-sync] DNSResolver.java copies are out of sync.');
  console.error(`- ${appPath}`);
  console.error(`- ${modulePath}`);
  console.error('Please sync the files before committing.');
  process.exit(1);
}

console.log('[dnsresolver-sync] DNSResolver.java copies are in sync.');
