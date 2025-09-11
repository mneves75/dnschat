import fs from 'fs';
import path from 'path';

const readJSON = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));

describe('Project configuration guards', () => {
  const root = process.cwd();
  const pkgPath = path.join(root, 'package.json');
  const podfilePath = path.join(root, 'ios', 'Podfile');
  const gemfilePath = path.join(root, 'ios', 'Gemfile');

  it('package.json has valid entry and SDK 54 line', () => {
    const pkg = readJSON(pkgPath);
    expect(['expo-router/entry', 'index.tsx']).toContain(pkg.main);
    const expoVer: string = pkg.dependencies?.expo || pkg.devDependencies?.expo;
    expect(typeof expoVer).toBe('string');
    // Accept any 54.x line (caret optional, patch may vary)
    expect(expoVer).toMatch(/^\^?54\./);
    // Dev convenience scripts
    expect(pkg.scripts['dev:ios']).toBeTruthy();
    expect(pkg.scripts['dev:android']).toBeTruthy();
  });

  it('Podfile requires Expo and RN helpers', () => {
    const podfile = fs.readFileSync(podfilePath, 'utf8');
    expect(podfile).toMatch(/expo\/(package\.json).*scripts\/autolinking/);
    expect(podfile).toMatch(/react-native\/(package\.json).*scripts\/react_native_pods/);
  });

  it('ios/Gemfile pins CocoaPods 1.15.2', () => {
    const gem = fs.readFileSync(gemfilePath, 'utf8');
    expect(gem).toMatch(/gem\s+"cocoapods",\s*"1\.15\.2"/);
  });
});
