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

  it('uses property-based hitSlop handling instead of removed setter method', () => {
    const contents = fs.readFileSync(menuViewPath, 'utf8');

    const hasDirectOverride = contents.includes('override var hitSlopRect');
    const hasBackedPropertySetter =
      contents.includes('private var mHitSlopRect') &&
      contents.includes('set(value) {') &&
      contents.includes('super.hitSlopRect = value');

    expect(hasDirectOverride || hasBackedPropertySetter).toBe(true);
    expect(contents).not.toContain('override fun setHitSlopRect');
  });

  it('uses property-based assignments for hitSlop and overflow on MenuViewManagerBase', () => {
    const contents = fs.readFileSync(menuViewManagerBasePath, 'utf8');

    expect(contents).toContain('view.hitSlopRect = null');
    expect(contents).toMatch(/view\.hitSlopRect\s*=\s*\(?\s*Rect\(/);
    expect(contents).toContain('view.overflow = overflow');
    expect(contents).not.toContain('view.setHitSlopRect');
    expect(contents).not.toContain('view.setOverflow(');
  });
});
