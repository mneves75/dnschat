export type SupportedLocale = "en-US" | "pt-BR";

export interface SupportedLocaleOption {
  locale: SupportedLocale;
  label: string;
}

const DEFAULT_LOCALE: SupportedLocale = "en-US";

const NORMALIZED_LOCALE_MAP: Record<string, SupportedLocale> = {
  "en": "en-US",
  "en-us": "en-US",
  "en_us": "en-US",
  "pt": "pt-BR",
  "pt-br": "pt-BR",
  "pt_br": "pt-BR",
};

export const SUPPORTED_LOCALE_OPTIONS: SupportedLocaleOption[] = [
  { locale: "en-US", label: "English (United States)" },
  { locale: "pt-BR", label: "Português (Brasil)" },
];

/**
 * Resolves arbitrary BCP-47-like inputs into the closest supported locale.
 * The map intentionally accepts both hyphen and underscore variants so we
 * tolerate inconsistent OS/ExpoLocalizations payloads.
 */
export function resolveLocale(candidate?: string | null): SupportedLocale {
  if (!candidate) {
    return DEFAULT_LOCALE;
  }

  const key = candidate.toLowerCase();
  const normalized = NORMALIZED_LOCALE_MAP[key];
  if (normalized) {
    return normalized;
  }

  const language = key.split(/[-_]/)[0];
  if (language === "pt") {
    return "pt-BR";
  }
  if (language === "en") {
    return "en-US";
  }

  return DEFAULT_LOCALE;
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALE_OPTIONS.some((option) => option.locale === locale);
}
