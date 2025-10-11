/**
 * i18n Module - Barrel Exports
 *
 * Centralized exports for internationalization functionality.
 *
 * USAGE:
 * ```tsx
 * import { useTranslation, SupportedLocale, translations } from '@/i18n';
 *
 * function MyComponent() {
 *   const { t, locale } = useTranslation();
 *   return <Text>{t('tabs.chat')}</Text>;
 * }
 * ```
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router + Glass Migration)
 */

// Hook
export { useTranslation } from './useTranslation';
export type { UseTranslationReturn, TranslationKey } from './useTranslation';

// Translations
export {
  translations,
  resolveLocale,
  isSupportedLocale,
  SUPPORTED_LOCALE_OPTIONS,
} from './translations';
export type {
  SupportedLocale,
  SupportedLocaleOption,
  TranslationStrings,
} from './translations';
