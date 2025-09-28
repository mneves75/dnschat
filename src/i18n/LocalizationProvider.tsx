import React, { createContext, PropsWithChildren, useContext, useMemo } from "react";

import { useSettings } from "../context/SettingsContext";
import {
  SupportedLocale,
  SupportedLocaleOption,
  TranslationKey,
  translate,
  resolveLocale,
} from "./translations";

interface LocalizationValue {
  locale: SupportedLocale;
  systemLocale: SupportedLocale;
  preferredLocale: string | null;
  availableLocales: SupportedLocaleOption[];
  t: (key: TranslationKey, replacements?: Record<string, string | number>) => string;
  setLocale: (locale: string | null) => Promise<void>;
}

const LocalizationContext = createContext<LocalizationValue | undefined>(
  undefined,
);

export function LocalizationProvider({ children }: PropsWithChildren) {
  const { locale, systemLocale, preferredLocale, updateLocale, availableLocales } =
    useSettings();

  const value = useMemo<LocalizationValue>(() => {
    const activeLocale = resolveLocale(locale);

    return {
      locale: activeLocale,
      systemLocale,
      preferredLocale,
      availableLocales,
      t: (key: TranslationKey, replacements?: Record<string, string | number>) =>
        translate(activeLocale, key, replacements),
      setLocale: updateLocale,
    };
  }, [locale, systemLocale, preferredLocale, availableLocales, updateLocale]);

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within a LocalizationProvider");
  }
  return context;
}
