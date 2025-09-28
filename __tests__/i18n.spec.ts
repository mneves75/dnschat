import { resolveLocale, translate, getTranslationsFor } from '../src/i18n/translations';

describe('localization helpers', () => {
  test('resolves supported locale tags', () => {
    expect(resolveLocale('pt-BR')).toBe('pt-BR');
    expect(resolveLocale('pt')).toBe('pt-BR');
    expect(resolveLocale('en-US')).toBe('en');
  });

  test('translates keys for English and Portuguese', () => {
    expect(translate('en', 'app.title')).toBe('DNS Chat');
    expect(translate('pt-BR', 'common.cancel')).toBe('Cancelar');
  });

  test('returns translation dictionary for locale', () => {
    const pt = getTranslationsFor('pt-BR');
    expect(pt['settings.title']).toBe('Configurações');
  });
});
