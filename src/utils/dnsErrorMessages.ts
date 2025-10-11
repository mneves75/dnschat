/**
 * DNS Error Message Localization Utilities
 *
 * Provides centralized error message resolution and normalization for DNS operations.
 * Used across thread screens, chat contexts, and test suites to ensure consistent
 * error messaging in Portuguese (pt-BR).
 *
 * CRITICAL: This file was moved from app/(dashboard)/[threadId].ts to eliminate
 * Expo Router warnings. It's a utility module, NOT a route component.
 *
 * @module dnsErrorMessages
 * @author DNSChat Team
 * @since 2.0.0
 */

import { DNSError, DNSErrorType } from "../../modules/dns-native";

/**
 * Default error message shown when no specific error type can be determined.
 * Portuguese localization for user-facing error displays.
 */
const DEFAULT_ERROR_MESSAGE = "Erro inesperado ao enviar mensagem.";

/**
 * Localized Portuguese error messages for each DNSErrorType.
 *
 * CRITICAL: These messages are shown directly to users in the chat interface.
 * Keep them concise, actionable, and user-friendly.
 *
 * Mapping Strategy:
 * - PLATFORM_UNSUPPORTED: Native module not available on this platform
 * - NETWORK_UNAVAILABLE: Device has no network connectivity
 * - TIMEOUT: DNS query exceeded configured timeout duration
 * - DNS_SERVER_UNREACHABLE: Cannot connect to DNS server (port 53 blocked)
 * - INVALID_RESPONSE: Received malformed DNS response packet
 * - PERMISSION_DENIED: OS denied network access permissions
 * - DNS_QUERY_FAILED: Generic native DNS operation failure
 */
const ERROR_MESSAGES: Record<DNSErrorType, string> = {
  [DNSErrorType.PLATFORM_UNSUPPORTED]:
    "Módulo DNS nativo indisponível nesta plataforma.",
  [DNSErrorType.NETWORK_UNAVAILABLE]:
    "Sem conexão de rede para consultar o servidor DNS.",
  [DNSErrorType.TIMEOUT]:
    "Tempo limite esgotado ao consultar o servidor DNS.",
  [DNSErrorType.DNS_SERVER_UNREACHABLE]:
    "Servidor DNS inacessível. Verifique se a rede bloqueia a porta 53.",
  [DNSErrorType.INVALID_RESPONSE]:
    "Resposta DNS inválida recebida. Tente novamente.",
  [DNSErrorType.PERMISSION_DENIED]:
    "Permissão negada ao abrir o transporte DNS.",
  [DNSErrorType.DNS_QUERY_FAILED]:
    "Falha ao executar consulta DNS nativa.",
};

/**
 * Resolves arbitrary error-like values into localized user-facing strings.
 *
 * TRICKY PART: Handles multiple error value types from different sources:
 * - DNSError instances with typed classification from native modules
 * - Standard Error instances from JavaScript/TypeScript code
 * - String error messages from legacy code or third-party libraries
 * - Undefined/null values from failed operations
 *
 * Resolution Priority:
 * 1. DNSError with recognized type → Localized message from ERROR_MESSAGES
 * 2. DNSError with message → Use error's message property
 * 3. Standard Error with message → Use error's message property
 * 4. String value → Return string directly
 * 5. Anything else → Return DEFAULT_ERROR_MESSAGE
 *
 * @param candidate - Unknown value that might be an error
 * @returns User-friendly localized error message
 *
 * @example
 * // Native DNS error
 * const err1 = new DNSError(DNSErrorType.TIMEOUT, "DNS timeout");
 * resolveDnsErrorMessage(err1); // → "Tempo limite esgotado..."
 *
 * // Standard error
 * const err2 = new Error("Network failure");
 * resolveDnsErrorMessage(err2); // → "Network failure"
 *
 * // String error
 * resolveDnsErrorMessage("Connection lost"); // → "Connection lost"
 *
 * // Unknown/undefined
 * resolveDnsErrorMessage(undefined); // → "Erro inesperado..."
 */
export function resolveDnsErrorMessage(candidate?: unknown): string {
  // CASE 1: DNSError with typed classification
  // Native modules use DNSError to provide structured error information
  if (candidate instanceof DNSError) {
    const classified = ERROR_MESSAGES[candidate.type];
    if (classified) {
      return classified;
    }

    // DNSError without recognized type - use its message if available
    if (candidate.message?.trim()) {
      return candidate.message;
    }
  }

  // CASE 2: Standard JavaScript Error
  // Handle errors from Promise chains, async operations, etc.
  if (candidate instanceof Error && candidate.message?.trim()) {
    return candidate.message;
  }

  // CASE 3: String error messages
  // Legacy code or third-party libraries may pass string errors
  if (typeof candidate === "string" && candidate.trim()) {
    return candidate;
  }

  // CASE 4: Unknown or undefined error
  // Safety fallback for unexpected error types
  return DEFAULT_ERROR_MESSAGE;
}

/**
 * Normalizes arbitrary error values into proper Error instances.
 *
 * TRICKY PART: JavaScript Promise chains and error handlers expect Error objects,
 * but we may receive various error types (strings, numbers, undefined, etc.).
 * This function guarantees an Error instance while preserving error messages.
 *
 * Use Cases:
 * - Promise rejection handlers: .catch(err => throw normalizeDnsError(err))
 * - Error boundaries: Need Error instances for stack traces
 * - Logging systems: Expect Error objects with stack information
 *
 * Normalization Strategy:
 * - If already an Error → Return as-is (preserves stack trace)
 * - Otherwise → Create new Error with localized message from resolveDnsErrorMessage
 *
 * @param candidate - Unknown value that might be an error
 * @returns Proper Error instance with localized message
 *
 * @example
 * // Already an Error
 * const err1 = new Error("Network failure");
 * normalizeDnsError(err1) === err1; // true (same instance)
 *
 * // String error
 * const err2 = normalizeDnsError("Connection lost");
 * err2 instanceof Error; // true
 * err2.message; // "Connection lost"
 *
 * // Unknown error
 * const err3 = normalizeDnsError(undefined);
 * err3 instanceof Error; // true
 * err3.message; // "Erro inesperado..."
 */
export function normalizeDnsError(candidate?: unknown): Error {
  // If already an Error, return as-is to preserve stack trace
  if (candidate instanceof Error) {
    return candidate;
  }

  // Otherwise, create new Error with localized message
  // This ensures Promise chains and error handlers receive proper Error instances
  return new Error(resolveDnsErrorMessage(candidate));
}
