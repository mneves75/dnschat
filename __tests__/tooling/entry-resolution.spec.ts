import fs from 'fs';
import path from 'path';

describe('Expo entry resolution (sanity)', () => {
  it('package.json main is a valid entry point', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    expect(['expo-router/entry', 'index.tsx']).toContain(pkg.main);
  });
});
