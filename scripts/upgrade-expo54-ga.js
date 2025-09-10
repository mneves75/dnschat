#!/usr/bin/env node
const fs = require('fs');
const https = require('https');
const path = require('path');

const APPLY = process.argv.includes('--apply');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

function isStable54(v) {
  return /^54\.\d+\.\d+$/.test(v);
}

async function main() {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const current = pkg.dependencies?.expo || pkg.devDependencies?.expo;
  if (!current) {
    console.log('expo dependency not found in package.json');
    process.exit(1);
  }
  const registry = await fetchJson('https://registry.npmjs.org/expo');
  const versions = Object.keys(registry.versions || {});
  const stable = versions.filter(isStable54).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
  const latestStable = stable[stable.length - 1];
  if (!latestStable) {
    console.log('SDK 54 GA is not published yet.');
    process.exit(0);
  }
  const needsBump = /preview|canary/.test(current) || current.replace(/^\^/, '') !== latestStable;
  if (!needsBump) {
    console.log(`Already on stable Expo ${current}. Nothing to do.`);
    process.exit(0);
  }

  console.log(`Found Expo SDK 54 stable: ${latestStable}`);
  console.log(`Current expo in package.json: ${current}`);

  if (APPLY) {
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies.expo = `^${latestStable}`;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log('Updated package.json -> expo @ ^' + latestStable);
    console.log('\nNext steps:');
    console.log('  npm install');
    console.log('  npx expo install  # to align peer expo libs');
    console.log('  cd ios && pod _1.15.2_ install  # if you must run pods locally');
  } else {
    console.log('\nTo upgrade now run:');
    console.log('  npm run expo54:ga');
  }
}

main().catch((e) => {
  console.error('Failed:', e.message);
  process.exit(1);
});

