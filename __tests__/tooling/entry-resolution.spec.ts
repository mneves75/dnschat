import fs from 'fs';
import path from 'path';

describe('Expo entry resolution (sanity)', () => {
  it('package.json main is expo-router/entry', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    expect(pkg.main).toBe('expo-router/entry');
  });
});
