import type { SupportedLocale } from "../context/settingsStorage";
import type { MessageKey } from "./index";

export const LOCALE_LABEL_KEYS: Record<SupportedLocale, MessageKey> = {
  "en-US": "locales.enUS",
  "pt-BR": "locales.ptBR",
};
