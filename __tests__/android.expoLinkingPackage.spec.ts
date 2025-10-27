import fs from 'fs';
import path from 'path';

describe('Android ExpoLinking registration', () => {
  it('keeps ExpoLinkingPackage attached to the React package list through a ModuleRegistryAdapter', () => {
    const mainAppPath = path.join(
      __dirname,
      '..',
      'android',
      'app',
      'src',
      'main',
      'java',
      'org',
      'mvneves',
      'dnschat',
      'MainApplication.kt'
    );

    const file = fs.readFileSync(mainAppPath, 'utf8');
    expect(file.includes('ExpoLinkingPackage')).toBe(true);
    expect(file.includes('ModuleRegistryAdapter')).toBe(true);
    expect(file.includes('manualExpoPackages')).toBe(true);
  });
});
