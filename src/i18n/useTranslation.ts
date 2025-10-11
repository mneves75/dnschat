/**
 * useTranslation Hook
 *
 * Provides type-safe access to localized strings for the entire application.
 * Integrates with SettingsContext to get the active locale.
 *
 * CRITICAL FEATURES:
 * - Type-safe translation key access via dot notation
 * - Automatic locale switching when user changes language
 * - Fallback to English if translation key missing
 * - Development warnings for missing keys
 *
 * USAGE:
 * ```tsx
 * import { useTranslation } from '@/i18n/useTranslation';
 *
 * function MyComponent() {
 *   const { t, locale } = useTranslation();
 *
 *   return (
 *     <View>
 *       <Text>{t('tabs.chat')}</Text>
 *       <Text>{t('common.loading')}</Text>
 *       <Text>{t('errors.network')}</Text>
 *     </View>
 *   );
 * }
 * ```
 *
 * DESIGN NOTES:
 * - Uses dot notation for nested key access (e.g., 'tabs.chat', 'common.ok')
 * - Returns key as fallback if translation missing (prevents blank UI)
 * - Logs warnings in __DEV__ for missing keys to aid translation coverage
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router + Glass Migration)
 */

import { useSettings } from '../context/SettingsContext';
import { translations, TranslationStrings, SupportedLocale } from './translations';

/**
 * Translation Key Type
 *
 * CRITICAL: This type ensures compile-time safety for translation keys.
 * It automatically generates all valid dot-notation paths from the
 * TranslationStrings interface.
 *
 * Examples:
 * - 'tabs.chat'
 * - 'screens.chatList'
 * - 'common.ok'
 * - 'errors.network'
 */
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<TranslationStrings>;

/**
 * Get Nested Translation Value
 *
 * Retrieves a value from nested object using dot notation path.
 *
 * IMPLEMENTATION NOTE: This uses a simple path traversal algorithm
 * that splits the key by '.' and walks the object tree. If any level
 * is missing, it returns undefined to trigger the fallback logic.
 *
 * @param obj - Translation object (e.g., translations['en-US'])
 * @param path - Dot notation path (e.g., 'tabs.chat')
 * @returns The translated string, or undefined if path invalid
 */
function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Translation Hook Return Type
 */
export interface UseTranslationReturn {
  /**
   * Translation Function
   *
   * Translates a key to the current locale's string.
   * Falls back to English if key missing, then returns key itself.
   *
   * @param key - Translation key in dot notation
   * @returns Translated string
   */
  t: (key: TranslationKey) => string;

  /**
   * Current Active Locale
   *
   * The locale currently in use (either user preference or system default).
   * Use this for conditional rendering based on locale.
   */
  locale: SupportedLocale;

  /**
   * System Locale
   *
   * The device's OS locale (for reference).
   */
  systemLocale: SupportedLocale;
}

/**
 * useTranslation Hook
 *
 * ARCHITECTURE:
 * 1. Retrieves current locale from SettingsContext
 * 2. Provides t() function for key-based translation
 * 3. Implements fallback chain: current locale → en-US → key itself
 * 4. Logs warnings in dev mode for missing keys
 *
 * PERFORMANCE:
 * - No memoization needed (React Compiler handles this)
 * - Translation lookup is O(n) where n = depth of key path (typically 2-3)
 * - Translations object is static, so no re-renders on locale change
 *
 * @returns Translation utilities and locale info
 */
export function useTranslation(): UseTranslationReturn {
  // Get current locale from settings
  const { locale, systemLocale } = useSettings();

  /**
   * Translation Function Implementation
   *
   * FALLBACK CHAIN:
   * 1. Try current locale (e.g., pt-BR)
   * 2. Try English (en-US) as universal fallback
   * 3. Return key itself (prevents blank UI, aids debugging)
   *
   * DEV WARNINGS:
   * - Logs warning if key missing in current locale
   * - Logs error if key missing in both current and English
   */
  const t = (key: TranslationKey): string => {
    // Try current locale
    const currentTranslation = getNestedValue(translations[locale], key);
    if (currentTranslation) {
      return currentTranslation;
    }

    // Dev warning: Missing in current locale
    if (__DEV__) {
      console.warn(
        `[i18n] Translation key '${key}' missing for locale '${locale}'. Falling back to en-US.`
      );
    }

    // Fallback to English
    if (locale !== 'en-US') {
      const englishTranslation = getNestedValue(translations['en-US'], key);
      if (englishTranslation) {
        return englishTranslation;
      }
    }

    // Dev error: Missing in both locales
    if (__DEV__) {
      console.error(
        `[i18n] Translation key '${key}' missing in both '${locale}' and 'en-US'. ` +
        'Returning key as fallback. This indicates incomplete translation coverage.'
      );
    }

    // Ultimate fallback: Return key itself
    return key;
  };

  return {
    t,
    locale,
    systemLocale,
  };
}
