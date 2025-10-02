export type SupportedLocale = 'en' | 'pt' | 'es';

export interface SupportedLocaleOption {
  locale: SupportedLocale;
  label: string;
  languageTag: string;
}

export const SUPPORTED_LOCALE_OPTIONS: SupportedLocaleOption[] = [
  { locale: 'en', label: 'English', languageTag: 'en-US' },
  { locale: 'pt', label: 'Português', languageTag: 'pt-BR' },
  { locale: 'es', label: 'Español', languageTag: 'es-ES' },
];

const DEFAULT_LOCALE: SupportedLocale = 'en';

export function resolveLocale(localeTag?: string | null): SupportedLocale {
  if (!localeTag) {
    return DEFAULT_LOCALE;
  }

  const normalized = localeTag.toLowerCase();

  for (const option of SUPPORTED_LOCALE_OPTIONS) {
    if (
      option.locale === normalized ||
      option.languageTag.toLowerCase() === normalized ||
      normalized.startsWith(option.locale + '-')
    ) {
      return option.locale;
    }
  }

  return DEFAULT_LOCALE;
}

export const translations: Record<SupportedLocale, Record<string, string>> = {
  en: {
    onboarding_welcome_title: 'Welcome to DNS Chat',
    onboarding_welcome_subtitle:
      'Chat with AI securely using DNS TXT records and resilient networking.',
  },
  pt: {
    onboarding_welcome_title: 'Bem-vindo ao DNS Chat',
    onboarding_welcome_subtitle:
      'Converse com IA usando registros TXT de DNS de forma segura e resiliente.',
  },
  es: {
    onboarding_welcome_title: 'Bienvenido a DNS Chat',
    onboarding_welcome_subtitle:
      'Chatea con IA de forma segura usando registros TXT de DNS resistentes.',
  },
};

export function t(locale: SupportedLocale, key: string): string {
  const table = translations[locale] ?? translations[DEFAULT_LOCALE];
  return table[key] ?? translations[DEFAULT_LOCALE][key] ?? key;
}
