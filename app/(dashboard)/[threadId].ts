import { DNSError, DNSErrorType } from "../../modules/dns-native";

const DEFAULT_ERROR_MESSAGE = "Erro inesperado ao enviar mensagem.";

const ERROR_MESSAGES: Record<DNSErrorType, string> = {
  [DNSErrorType.PLATFORM_UNSUPPORTED]:
    "Módulo DNS nativo indisponível nesta plataforma.",
  [DNSErrorType.NETWORK_UNAVAILABLE]:
    "Sem conexão de rede para consultar o servidor DNS.",
  [DNSErrorType.TIMEOUT]:
    "Tempo limite esgotado ao consultar o servidor DNS.",
  [DNSErrorType.DNS_SERVER_UNREACHABLE]:
    "Servidor DNS inacessível. Verifique se a rede bloqueia a porta 53.",
  [DNSErrorType.INVALID_RESPONSE]: "Resposta DNS inválida recebida. Tente novamente.",
  [DNSErrorType.PERMISSION_DENIED]:
    "Permissão negada ao abrir o transporte DNS.",
  [DNSErrorType.DNS_QUERY_FAILED]: "Falha ao executar consulta DNS nativa.",
};

/**
 * Normalize arbitrary error-like values into the localized strings
 * consumed by the thread screen and related tests. We keep this logic
 * colocated with the Expo Router pseudo-route so any future migration
 * has a single source of truth for DNS error UX.
 */
export function resolveDnsErrorMessage(candidate?: unknown): string {
  // DNSError carries a typed classification from the native modules.
  if (candidate instanceof DNSError) {
    const classified = ERROR_MESSAGES[candidate.type];
    if (classified) {
      return classified;
    }

    if (candidate.message?.trim()) {
      return candidate.message;
    }
  }

  if (candidate instanceof Error && candidate.message?.trim()) {
    return candidate.message;
  }

  if (typeof candidate === "string" && candidate.trim()) {
    return candidate;
  }

  return DEFAULT_ERROR_MESSAGE;
}

/**
 * Helper to guarantee we always hand back an Error instance. This is
 * useful when plumbing errors into Promise chains that expect proper
 * Error objects while still respecting the localized messaging above.
 */
export function normalizeDnsError(candidate?: unknown): Error {
  if (candidate instanceof Error) {
    return candidate;
  }

  return new Error(resolveDnsErrorMessage(candidate));
}
