import React from "react";
import { useSettings } from "../context/SettingsContext";
import { enUS } from "./messages/en-US";
import { ptBR } from "./messages/pt-BR";
import type { SupportedLocale } from "./translations";
import { devWarn } from "../utils/devLog";

type Messages = typeof enUS;

type Join<P extends string, K extends string> = P extends "" ? K : `${P}.${K}`;

type NestedKeys<T, P extends string = ""> = T extends string
  ? P
  : {
      [K in Extract<keyof T, string>]: NestedKeys<T[K], Join<P, K>>;
    }[Extract<keyof T, string>];

export type MessageKey = Exclude<NestedKeys<Messages>, "">;

export type TranslationParams = Record<string, string | number>;

type Dictionaries = Record<SupportedLocale, Messages>;

const dictionaries: Dictionaries = {
  "en-US": enUS,
  "pt-BR": ptBR,
};

const getMessage = (messages: Messages, key: MessageKey): string | undefined => {
  return key.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, messages) as string | undefined;
};

const formatMessage = (message: string, params?: TranslationParams): string => {
  if (!params) {
    return message;
  }

  return message.replace(/\{\{(.*?)\}\}/g, (_, token) => {
    const value = params[token.trim()];
    return value !== undefined ? String(value) : "";
  });
};

type I18nValue = {
  locale: SupportedLocale;
  t: (key: MessageKey, params?: TranslationParams) => string;
};

const I18nContext = React.createContext<I18nValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { locale } = useSettings();

  const value = React.useMemo<I18nValue>(() => {
    const activeLocale = locale;
    const fallback = enUS;
    const dictionary = dictionaries[activeLocale] ?? fallback;

    const translate = (key: MessageKey, params?: TranslationParams) => {
      const message = getMessage(dictionary, key) ?? getMessage(fallback, key);
      if (typeof message !== "string") {
        devWarn(`[i18n] Missing translation for key: ${key}`);
        return key;
      }
      return formatMessage(message, params);
    };

    return {
      locale: activeLocale,
      t: translate,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};

export const useTranslation = () => useI18n();

export const createTranslator = (locale: SupportedLocale) => {
  const fallback = enUS;
  const dictionary = dictionaries[locale] ?? fallback;

  return (key: MessageKey, params?: TranslationParams) => {
    const message = getMessage(dictionary, key) ?? getMessage(fallback, key);
    if (typeof message !== "string") {
      return key;
    }
    return formatMessage(message, params);
  };
};
