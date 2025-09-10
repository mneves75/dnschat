import fs from 'fs';
import path from 'path';

const read = (p: string) => fs.readFileSync(p, 'utf8');

describe('Tooling scripts guards', () => {
  it('fix-cocoapods.sh invokes version check and wrapper installer', () => {
    const p = path.join(process.cwd(), 'scripts', 'fix-cocoapods.sh');
    const s = read(p);
    expect(s).toMatch(/check-cocoapods\.sh|CP 1\.15\.2/i);
    expect(s).toMatch(/pod-install\.sh|Installing pods \(CocoaPods 1\.15\.2/i);
  });

  it('pod-install.sh runs check-cocoapods and installs with pod _1.15.2_', () => {
    const p = path.join(process.cwd(), 'scripts', 'pod-install.sh');
    const s = read(p);
    expect(s).toMatch(/check-cocoapods\.sh/);
    expect(s).toMatch(/pod _1\.15\.2_ install|pod install/);
  });

  it('package.json has dev and cp scripts for DX', () => {
    const pkg = JSON.parse(read(path.join(process.cwd(), 'package.json')));
    expect(pkg.scripts).toBeTruthy();
    expect(pkg.scripts['cp:check']).toBeTruthy();
    expect(pkg.scripts['clean-ios']).toBeTruthy();
    expect(pkg.scripts['dev:ios']).toBeTruthy();
    expect(pkg.scripts['dev:android']).toBeTruthy();
  });
});

