/**
 * DNS server input validation, extracted from dnsService.ts so that lightweight
 * consumers (settings storage/migration) can validate server strings without
 * evaluating the full DNS transport stack (react-native-udp / react-native-tcp-socket
 * are require()'d at dnsService module load).
 *
 * dnsService re-exports these for backwards compatibility.
 */
import { DNS_CONSTANTS } from '../../modules/dns-native/constants';
import { ERROR_MESSAGES } from '../constants/appConstants';

export function normalizeDNSServerInput(server: string): string {
  const normalized = server.trim().toLowerCase();
  return normalized.endsWith('.') ? normalized.replace(/\.+$/g, '') : normalized;
}

const ALLOWED_DNS_SERVER_SET = new Set(DNS_CONSTANTS.ALLOWED_DNS_SERVERS);

/**
 * Validate DNS server to prevent redirection attacks
 * SECURITY: Only allow known-safe DNS servers
 */
export function validateDNSServer(server: string): string {
  if (!server || typeof server !== 'string' || server.trim().length === 0) {
    throw new Error(ERROR_MESSAGES.DNS_SERVER_INVALID);
  }

  const normalizedServer = normalizeDNSServerInput(server);
  if (ALLOWED_DNS_SERVER_SET.has(normalizedServer)) {
    return normalizedServer;
  }

  // Disallow ports in the DNS server field.
  //
  // Rationale:
  // - App logic is explicitly defined around DNS port 53 (UDP/TCP).
  // - Allowing arbitrary ports is unnecessary and complicates validation, logging, and security review.
  // - Keeping this strict prevents accidental input like "1.1.1.1:53" which would otherwise
  //   propagate to socket calls as an invalid host string.
  let colonCount = 0; for (let i = 0; i < normalizedServer.length; i++) if (normalizedServer.charCodeAt(i) === 58) colonCount++;
  if (normalizedServer.includes('[') || normalizedServer.includes(']')) {
    throw new Error(ERROR_MESSAGES.DNS_SERVER_INVALID);
  }
  if (colonCount === 1 && /:\d+$/.test(normalizedServer)) {
    throw new Error(ERROR_MESSAGES.DNS_SERVER_INVALID);
  }

  const ipv4Pattern = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  const ipv6Pattern = /^([0-9a-f]{1,4}:){2,7}[0-9a-f]{1,4}$/i;
  const hostnamePattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*$/;

  const isIPAddress = ipv4Pattern.test(normalizedServer) || ipv6Pattern.test(normalizedServer);
  const isHostname = hostnamePattern.test(normalizedServer);

  if (!isIPAddress && !isHostname) {
    throw new Error(`DNS server '${server}' is not a valid hostname or IP address`);
  }

  if (isHostname) {
    const labels = normalizedServer.split('.');
    if (
      labels.some(
        (label) =>
          label.length === 0 ||
          label.length > DNS_CONSTANTS.MAX_DNS_LABEL_LENGTH,
      )
    ) {
      throw new Error(
        `DNS server '${server}' contains label exceeding ${DNS_CONSTANTS.MAX_DNS_LABEL_LENGTH} characters`,
      );
    }
  }

  // SECURITY: Allowlist only known-safe resolvers/endpoints.
  throw new Error(ERROR_MESSAGES.DNS_SERVER_NOT_ALLOWED);
}
