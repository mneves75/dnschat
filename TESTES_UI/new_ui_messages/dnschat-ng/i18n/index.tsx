import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo
} from 'react';

import enUS from './en-US.json';
import ptBR from './pt-BR.json';

import { usePreferences } from '@/context/PreferencesProvider';

const dictionaries = {
  'en-US': enUS,
  'pt-BR': ptBR
} as const;

type SupportedLocale = keyof typeof dictionaries;
export type TranslationKey = keyof typeof enUS;

type I18nContextValue = {
  locale: SupportedLocale;
  t: (key: TranslationKey, replacements?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const FALLBACK_LOCALE: SupportedLocale = 'en-US';

function normalizeLocale(raw: string): SupportedLocale {
  const candidate = raw.toLowerCase();
  if (candidate.startsWith('pt')) return 'pt-BR';
  return 'en-US';
}

export function I18nProvider({ children }: PropsWithChildren) {
  const preferences = usePreferences();
  const resolvedLocale = useMemo(() => {
    if (preferences.locale !== 'system') return preferences.locale as SupportedLocale;
    try {
      const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;
      return normalizeLocale(systemLocale);
    } catch {
      return FALLBACK_LOCALE;
    }
  }, [preferences.locale]);

  const dictionary = dictionaries[resolvedLocale] ?? dictionaries[FALLBACK_LOCALE];
  const fallbackDictionary = dictionaries[FALLBACK_LOCALE];

  const translate = useMemo(
    () =>
      (key: TranslationKey, replacements?: Record<string, string | number>) => {
        const template = dictionary[key] ?? fallbackDictionary[key] ?? key;
        if (!replacements) return template;
        return Object.entries(replacements).reduce<string>((acc, [token, value]) => {
          const pattern = new RegExp(`{{${token}}}`, 'g');
          return acc.replace(pattern, String(value));
        }, template);
      },
    [dictionary, fallbackDictionary]
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale: resolvedLocale, t: translate }),
    [resolvedLocale, translate]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}
