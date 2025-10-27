describe('expo-linking dependency contract', () => {
  it('pins expo-linking in package.json so Metro can resolve the native module', () => {
    const pkg = require('../package.json');
    const version = pkg.dependencies['expo-linking'];
    expect(typeof version).toBe('string');
    expect(version).toMatch(/^[~^]?\d/);
  });
});
