import fs from 'fs';
import path from 'path';

function loadLocale(file: string) {
  const absolute = path.resolve(__dirname, '..', 'i18n', file);
  const contents = fs.readFileSync(absolute, 'utf8');
  return JSON.parse(contents) as Record<string, string>;
}

describe('i18n dictionaries', () => {
  test('all locale files are valid JSON', () => {
    expect(() => loadLocale('en-US.json')).not.toThrow();
    expect(() => loadLocale('pt-BR.json')).not.toThrow();
  });

  test('locale files expose the same translation keys', () => {
    const en = loadLocale('en-US.json');
    const pt = loadLocale('pt-BR.json');

    expect(Object.keys(pt).sort()).toEqual(Object.keys(en).sort());
  });
});
