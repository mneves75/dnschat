import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '..');
const menuAndroidSrc = path.join(
  repoRoot,
  'node_modules',
  '@react-native-menu',
  'menu',
  'android',
  'src',
  'main',
  'java',
  'com',
  'reactnativemenu'
);

describe('@react-native-menu/menu Android patch', () => {
  const menuViewPath = path.join(menuAndroidSrc, 'MenuView.kt');
  const menuViewManagerBasePath = path.join(menuAndroidSrc, 'MenuViewManagerBase.kt');

  it('overrides hitSlopRect property instead of calling removed setter', () => {
    const contents = fs.readFileSync(menuViewPath, 'utf8');

    expect(contents).toContain('override var hitSlopRect');
    expect(contents).toContain('set(value) {');
    expect(contents).not.toContain('override fun setHitSlopRect');
  });

  it('uses property-based assignments for hitSlop and overflow on MenuViewManagerBase', () => {
    const contents = fs.readFileSync(menuViewManagerBasePath, 'utf8');

    expect(contents).toContain('view.hitSlopRect = null');
    expect(contents).toContain('view.hitSlopRect = Rect(');
    expect(contents).toContain('view.overflow = overflow');
    expect(contents).not.toContain('view.setHitSlopRect');
    expect(contents).not.toContain('view.setOverflow(');
  });
});
