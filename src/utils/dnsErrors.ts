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
 * consumed by the thread screen and related tests.
 */
export function resolveDnsErrorMessage(candidate?: unknown): string {
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
 * Helper to guarantee we always hand back an Error instance.
 */
export function normalizeDnsError(candidate?: unknown): Error {
  if (candidate instanceof Error) {
    return candidate;
  }

  return new Error(resolveDnsErrorMessage(candidate));
}
