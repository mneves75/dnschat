import type { Locale } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";

import type { SupportedLocale } from "../context/settingsStorage";

export function getDateFnsLocale(locale: SupportedLocale): Locale {
  return locale === "pt-BR" ? ptBR : enUS;
}
