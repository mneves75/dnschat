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
  return NORMALIZED_LOCALE_MAP[key] ?? DEFAULT_LOCALE;
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALE_OPTIONS.some((option) => option.locale === locale);
}

/**
 * Translation Dictionary
 *
 * CRITICAL: This dictionary provides locale-aware strings for all UI elements.
 * Each locale must have complete coverage of all translation keys.
 *
 * STRUCTURE:
 * - tabs: Native tab bar labels
 * - screens: Screen titles and headers
 * - common: Shared UI strings (buttons, labels, etc.)
 * - errors: Error messages
 * - settings: Settings screen strings
 * - chat: Chat-specific strings
 */
export interface TranslationStrings {
  // Tab Bar
  tabs: {
    chat: string;
    logs: string;
    about: string;
    devLogs: string;
  };

  // Screen Titles
  screens: {
    chatList: string;
    chatDetail: string;
    logs: string;
    about: string;
    settings: string;
    notFound: string;
    devLogs: string;
  };

  // Common UI
  common: {
    ok: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    loading: string;
    error: string;
    retry: string;
    done: string;
    search: string;
    noResults: string;
  };

  // Chat Specific
  chat: {
    newChat: string;
    deleteChat: string;
    clearHistory: string;
    sendMessage: string;
    messagePlaceholder: string;
    emptyState: string;
    errorSending: string;
    thinking: string;
  };

  // Logs Screen
  logs: {
    title: string;
    filter: string;
    clear: string;
    export: string;
    noLogs: string;
    queryTime: string;
    method: string;
    status: string;
  };

  // About Screen
  about: {
    title: string;
    version: string;
    description: string;
    credits: string;
    license: string;
    github: string;
    specialThanks: string;
  };

  // Settings Screen
  settings: {
    title: string;
    general: string;
    appearance: string;
    language: string;
    dns: string;
    dnsServer: string;
    dnsMethod: string;
    preferDnsOverHttps: string;
    enableMockDns: string;
    allowExperimental: string;
    accessibility: string;
    reduceTransparency: string;
  };

  // Errors
  errors: {
    generic: string;
    network: string;
    dnsQuery: string;
    storage: string;
    notFound: string;
  };
}

/**
 * English (US) Translations
 */
const enUS: TranslationStrings = {
  tabs: {
    chat: "Chat",
    logs: "Logs",
    about: "About",
    devLogs: "Dev Logs",
  },
  screens: {
    chatList: "Chats",
    chatDetail: "Chat",
    logs: "DNS Query Logs",
    about: "About DNSChat",
    settings: "Settings",
    notFound: "Page Not Found",
    devLogs: "Developer Logs",
  },
  common: {
    ok: "OK",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    back: "Back",
    loading: "Loading...",
    error: "Error",
    retry: "Retry",
    done: "Done",
    search: "Search",
    noResults: "No results found",
  },
  chat: {
    newChat: "New Chat",
    deleteChat: "Delete Chat",
    clearHistory: "Clear History",
    sendMessage: "Send Message",
    messagePlaceholder: "Type your message...",
    emptyState: "No chats yet. Start a new conversation!",
    errorSending: "Failed to send message",
    thinking: "Thinking...",
  },
  logs: {
    title: "Query Logs",
    filter: "Filter",
    clear: "Clear All",
    export: "Export",
    noLogs: "No logs to display",
    queryTime: "Query Time",
    method: "Method",
    status: "Status",
  },
  about: {
    title: "About",
    version: "Version",
    description: "ChatGPT-like interface powered by DNS TXT queries",
    credits: "Credits",
    license: "License",
    github: "View on GitHub",
    specialThanks: "Special Thanks",
  },
  settings: {
    title: "Settings",
    general: "General",
    appearance: "Appearance",
    language: "Language",
    dns: "DNS Configuration",
    dnsServer: "DNS Server",
    dnsMethod: "DNS Method",
    preferDnsOverHttps: "Prefer DNS over HTTPS",
    enableMockDns: "Enable Mock DNS (Development)",
    allowExperimental: "Allow Experimental Transports",
    accessibility: "Accessibility",
    reduceTransparency: "Reduce Transparency",
  },
  errors: {
    generic: "An error occurred. Please try again.",
    network: "Network error. Check your connection.",
    dnsQuery: "DNS query failed. Check your DNS server.",
    storage: "Storage error. Check device storage.",
    notFound: "The page you're looking for doesn't exist.",
  },
};

/**
 * Portuguese (Brazil) Translations
 */
const ptBR: TranslationStrings = {
  tabs: {
    chat: "Chat",
    logs: "Logs",
    about: "Sobre",
    devLogs: "Logs Dev",
  },
  screens: {
    chatList: "Conversas",
    chatDetail: "Conversa",
    logs: "Logs de Consulta DNS",
    about: "Sobre o DNSChat",
    settings: "Configurações",
    notFound: "Página Não Encontrada",
    devLogs: "Logs do Desenvolvedor",
  },
  common: {
    ok: "OK",
    cancel: "Cancelar",
    save: "Salvar",
    delete: "Excluir",
    edit: "Editar",
    close: "Fechar",
    back: "Voltar",
    loading: "Carregando...",
    error: "Erro",
    retry: "Tentar Novamente",
    done: "Concluído",
    search: "Buscar",
    noResults: "Nenhum resultado encontrado",
  },
  chat: {
    newChat: "Nova Conversa",
    deleteChat: "Excluir Conversa",
    clearHistory: "Limpar Histórico",
    sendMessage: "Enviar Mensagem",
    messagePlaceholder: "Digite sua mensagem...",
    emptyState: "Nenhuma conversa ainda. Inicie uma nova!",
    errorSending: "Falha ao enviar mensagem",
    thinking: "Pensando...",
  },
  logs: {
    title: "Logs de Consulta",
    filter: "Filtrar",
    clear: "Limpar Tudo",
    export: "Exportar",
    noLogs: "Nenhum log para exibir",
    queryTime: "Tempo de Consulta",
    method: "Método",
    status: "Status",
  },
  about: {
    title: "Sobre",
    version: "Versão",
    description: "Interface tipo ChatGPT alimentada por consultas DNS TXT",
    credits: "Créditos",
    license: "Licença",
    github: "Ver no GitHub",
    specialThanks: "Agradecimentos Especiais",
  },
  settings: {
    title: "Configurações",
    general: "Geral",
    appearance: "Aparência",
    language: "Idioma",
    dns: "Configuração DNS",
    dnsServer: "Servidor DNS",
    dnsMethod: "Método DNS",
    preferDnsOverHttps: "Preferir DNS sobre HTTPS",
    enableMockDns: "Ativar DNS Simulado (Desenvolvimento)",
    allowExperimental: "Permitir Transportes Experimentais",
    accessibility: "Acessibilidade",
    reduceTransparency: "Reduzir Transparência",
  },
  errors: {
    generic: "Ocorreu um erro. Por favor, tente novamente.",
    network: "Erro de rede. Verifique sua conexão.",
    dnsQuery: "Consulta DNS falhou. Verifique seu servidor DNS.",
    storage: "Erro de armazenamento. Verifique o armazenamento do dispositivo.",
    notFound: "A página que você está procurando não existe.",
  },
};

/**
 * Translation Dictionary by Locale
 *
 * CRITICAL: This is the main export for accessing translations.
 * Add new locales here when expanding language support.
 */
export const translations: Record<SupportedLocale, TranslationStrings> = {
  "en-US": enUS,
  "pt-BR": ptBR,
};
