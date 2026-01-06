import { NativeModules } from "react-native";
import { getNativeSanitizerConfig, getServerPort, DNS_CONSTANTS } from "./constants";
import type { NativeSanitizerConfig } from "./constants";

const isJestRuntime = (): boolean => {
  try {
    return (
      typeof process !== "undefined" &&
      typeof process.env === "object" &&
      process.env !== null &&
      typeof process.env["JEST_WORKER_ID"] === "string"
    );
  } catch {
    return false;
  }
};

const isExplicitDebugEnabled = (): boolean => {
  try {
    const globalRecord = globalThis as Record<string, unknown>;
    if (globalRecord["__DNSCHAT_NATIVE_DEBUG__"] === true) return true;
  } catch {}
  try {
    if (typeof process !== "undefined" && process.env?.["DNSCHAT_NATIVE_DEBUG"] === "1") {
      return true;
    }
  } catch {}
  return false;
};

const isNativeDebugEnabled = (): boolean => {
  const dev = typeof __DEV__ !== "undefined" ? Boolean(__DEV__) : false;
  const explicit = isExplicitDebugEnabled();

  if (isJestRuntime()) {
    return explicit;
  }

  if (!dev) return false;
  return explicit;
};
const debugLog = (...args: unknown[]) => {
  if (isNativeDebugEnabled()) {
    console.log(...args);
  }
};
const debugWarn = (...args: unknown[]) => {
  if (isNativeDebugEnabled()) {
    console.warn(...args);
  }
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record["message"] === "string") return record["message"];
  }
  return "Unknown DNS error occurred";
};

const getErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") return undefined;
  const record = error as Record<string, unknown>;
  return typeof record["code"] === "string" ? record["code"] : undefined;
};

const getErrorDetails = (error: unknown): { message: string; code?: string } => {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  return code ? { message, code } : { message };
};

export interface DNSCapabilities {
  available: boolean;
  platform: "ios" | "android" | "web";
  supportsCustomServer: boolean;
  supportsAsyncQuery: boolean;
  apiLevel?: number; // Android only
}

export interface NativeDNSModule {
  /**
   * Query TXT records from a DNS server
   * @param domain - DNS server hostname (e.g., 'llm.pieter.com', 'ch.at')
   * @param message - Fully qualified domain name to query (already sanitized)
   * @param port - DNS port (9000 for llm.pieter.com, 53 for standard DNS)
   * @returns Promise resolving to array of TXT record strings
   */
  queryTXT(domain: string, message: string, port: number): Promise<string[]>;

  /**
   * Check if native DNS functionality is available on this platform
   * @returns Promise resolving to platform capabilities
   */
  isAvailable(): Promise<DNSCapabilities>;
  configureSanitizer?(config: NativeSanitizerConfig): void | Promise<boolean>;
  debugSanitizeLabel?(label: string): Promise<string>;
}

export enum DNSErrorType {
  PLATFORM_UNSUPPORTED = "PLATFORM_UNSUPPORTED",
  NETWORK_UNAVAILABLE = "NETWORK_UNAVAILABLE",
  DNS_SERVER_UNREACHABLE = "DNS_SERVER_UNREACHABLE",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  TIMEOUT = "TIMEOUT",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  DNS_QUERY_FAILED = "DNS_QUERY_FAILED",
}

export class DNSError extends Error {
  constructor(
    public readonly type: DNSErrorType,
    message: string,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = "DNSError";
  }
}

export class NativeDNS implements NativeDNSModule {
  private readonly nativeModule: NativeDNSModule | null;
  private capabilities: DNSCapabilities | null = null;
  private capabilitiesTimestamp = 0;
  // RACE CONDITION FIX: Promise lock to prevent concurrent isAvailable() calls
  // from all bypassing the cache and making redundant native module calls.
  private capabilitiesPromise: Promise<DNSCapabilities> | null = null;
  // SECURITY: TTL prevents stale network configuration from persisting forever.
  // 30 seconds is long enough to avoid repeated native calls but short enough
  // to detect network changes (e.g., WiFi to cellular, VPN connection).
  private static readonly CAPABILITIES_TTL_MS = 30000;

  private configureSanitizerIfNeeded(): void {
    if (!this.nativeModule) return;
    debugLog("[NativeDNS] RNDNSModule methods:", Object.keys(this.nativeModule));
    try {
      const maybeResult = this.nativeModule.configureSanitizer?.(
        getNativeSanitizerConfig(),
      );

      if (maybeResult && typeof (maybeResult as Promise<unknown>).then === "function") {
        (maybeResult as Promise<boolean>)
          .then((didUpdate) => {
            if (didUpdate) {
              debugLog("[NativeDNS] Sanitizer configured via shared constants");
            } else {
              debugLog("[NativeDNS] Sanitizer already up to date; skipped reconfiguration");
            }
          })
          .catch((error: unknown) => {
            debugWarn("[NativeDNS] Failed to configure sanitizer:", error);
          });
      } else if (maybeResult !== undefined) {
        debugLog("[NativeDNS] Sanitizer configured via shared constants");
      }
    } catch (error) {
      debugWarn("[NativeDNS] Failed to configure sanitizer:", error);
    }
  }

  constructor(nativeModuleOverride?: NativeDNSModule | null) {
    // Try to get the native module, but don't crash if it's not available
    debugLog("[NativeDNS] constructor called");
    debugLog("[NativeDNS] Available NativeModules keys:", Object.keys(NativeModules));
    debugLog("[NativeDNS] Looking for RNDNSModule...");

    if (nativeModuleOverride !== undefined) {
      this.nativeModule = nativeModuleOverride;
      this.configureSanitizerIfNeeded();
      return;
    }

    try {
      this.nativeModule = NativeModules["RNDNSModule"] as NativeDNSModule;
      debugLog("[NativeDNS] RNDNSModule found:", !!this.nativeModule);
      this.configureSanitizerIfNeeded();
    } catch (error) {
      debugWarn("[NativeDNS] Native DNS module not available:", error);
      this.nativeModule = null;
    }
  }

  async queryTXT(domain: string, message: string, port?: number): Promise<string[]> {
    if (!this.nativeModule) {
      throw new DNSError(
        DNSErrorType.PLATFORM_UNSUPPORTED,
        "Native DNS module is not available on this platform",
      );
    }

    if (!message?.trim()) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        "Message cannot be empty",
      );
    }

    // Use provided port, or look up from server config, or default to 53
    const dnsPort = port ?? getServerPort(domain) ?? DNS_CONSTANTS.DNS_PORT;

    // SECURITY: Validate port is in valid range (1-65535)
    // Ports 0 and negative values are invalid; ports > 65535 don't exist
    if (dnsPort < 1 || dnsPort > 65535) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        `Invalid DNS port: ${dnsPort}. Must be between 1 and 65535.`,
      );
    }

    debugLog(`[NativeDNS] queryTXT: ${domain}:${dnsPort} - ${message.trim()}`);

    try {
      const result = await this.nativeModule.queryTXT(domain, message.trim(), dnsPort);

      if (!Array.isArray(result) || result.length === 0) {
        throw new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          "No TXT records received from DNS server",
        );
      }

      return result;
    } catch (error: unknown) {
      // Preserve already-classified DNSError types
      if (error instanceof DNSError) {
        throw error;
      }

      const details = getErrorDetails(error);
      const messageLower = details.message.toLowerCase();
      const cause = error instanceof Error ? error : undefined;

      // Map native errors to our error types
      if (details.code === "DNS_QUERY_FAILED") {
        throw new DNSError(
          DNSErrorType.DNS_QUERY_FAILED,
          details.message || "DNS query failed",
          cause,
        );
      }

      if (
        messageLower.includes("timeout") ||
        messageLower.includes("timed out")
      ) {
        throw new DNSError(DNSErrorType.TIMEOUT, "DNS query timed out", cause);
      }

      if (
        messageLower.includes("network") ||
        messageLower.includes("connectivity")
      ) {
        throw new DNSError(
          DNSErrorType.NETWORK_UNAVAILABLE,
          "Network unavailable for DNS query",
          cause,
        );
      }

      if (
        messageLower.includes("permission") ||
        messageLower.includes("denied")
      ) {
        throw new DNSError(
          DNSErrorType.PERMISSION_DENIED,
          "DNS query permission denied",
          cause,
        );
      }

      // Default to DNS query failed
      throw new DNSError(
        DNSErrorType.DNS_QUERY_FAILED,
        details.message || "Unknown DNS error occurred",
        cause,
      );
    }
  }

  async isAvailable(): Promise<DNSCapabilities> {
    const now = Date.now();

    // Return cached capabilities if still valid
    if (
      this.capabilities &&
      now - this.capabilitiesTimestamp < NativeDNS.CAPABILITIES_TTL_MS
    ) {
      return this.capabilities;
    }

    // RACE CONDITION FIX: If there's already a pending request, wait for it
    // instead of making a redundant native call. Multiple concurrent calls
    // would all bypass the cache check above simultaneously without this lock.
    if (this.capabilitiesPromise) {
      return this.capabilitiesPromise;
    }

    if (!this.nativeModule) {
      this.capabilities = {
        available: false,
        platform: "web",
        supportsCustomServer: false,
        supportsAsyncQuery: false,
      };
      this.capabilitiesTimestamp = now;
      return this.capabilities;
    }

    // RACE CONDITION FIX: Create promise lock before async operation
    this.capabilitiesPromise = (async () => {
      try {
        this.capabilities = await this.nativeModule!.isAvailable();
        this.capabilitiesTimestamp = Date.now();
        return this.capabilities;
      } catch (error) {
      debugWarn("Failed to check DNS availability:", error);
      this.capabilities = {
          available: false,
          platform: "web",
          supportsCustomServer: false,
          supportsAsyncQuery: false,
        };
        this.capabilitiesTimestamp = Date.now();
        return this.capabilities;
      } finally {
        // Clear the promise lock after completion
        this.capabilitiesPromise = null;
      }
    })();

    return this.capabilitiesPromise;
  }

  /**
   * Force refresh of capabilities on next isAvailable() call.
   * Call this when network conditions change (e.g., WiFi <-> cellular).
   */
  invalidateCapabilities(): void {
    this.capabilities = null;
    this.capabilitiesTimestamp = 0;
  }

  /**
   * Parse multi-part TXT responses (format: "1/3:", "2/3:", etc.)
   */
  parseMultiPartResponse(txtRecords: string[]): string {
    if (txtRecords.length === 0) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        "No TXT records to parse",
      );
    }

    const plainSegments: string[] = [];
    const parts: Array<{
      partNumber: number;
      totalParts: number;
      content: string;
    }> = [];

    for (const record of txtRecords) {
      const rawValue = String(record ?? '');
      const trimmedValue = rawValue.trim();
      if (!trimmedValue) {
        continue;
      }

      const match = rawValue.match(/^\s*(\d+)\/(\d+):(.*)$/);
      if (match && match[1] && match[2] && match[3] !== undefined) {
        parts.push({
          partNumber: parseInt(match[1], 10),
          totalParts: parseInt(match[2], 10),
          content: match[3],
        });
      } else {
        plainSegments.push(rawValue);
      }
    }

    if (plainSegments.length > 0) {
      const combined = plainSegments.join('');
      if (!combined.trim()) {
        throw new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          'Received empty response',
        );
      }
      return combined;
    }

    if (parts.length === 0) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        'No TXT records to parse',
      );
    }

    const expectedTotal = parts[0]?.totalParts || 0;
    const seen = new Map<number, string>();

    for (const part of parts) {
      if (part.totalParts !== expectedTotal) {
        throw new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          `Inconsistent total parts. Expected ${expectedTotal}, received ${part.totalParts}`,
        );
      }

      const existingContent = seen.get(part.partNumber);
      if (existingContent !== undefined) {
        if (existingContent === part.content) {
          // Harmless retransmission; skip duplicates with identical payloads
          continue;
        }

        throw new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          `Conflicting content for part ${part.partNumber}`,
        );
      }
      seen.set(part.partNumber, part.content);
    }

    if (expectedTotal <= 0 || seen.size !== expectedTotal) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        `Incomplete multi-part response: got ${seen.size} parts, expected ${expectedTotal}`,
      );
    }

    const ordered: string[] = [];
    for (let i = 1; i <= expectedTotal; i += 1) {
      const content = seen.get(i);
      if (typeof content !== 'string') {
        throw new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          `Incomplete multi-part response: missing part ${i}`,
        );
      }
      ordered.push(content);
    }

    const full = ordered.join('');
    if (!full.trim()) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        'Received empty response',
      );
    }

    return full;
  }

  /**
   * Reset cached capabilities (useful for testing)
   */
  resetCapabilities(): void {
    this.capabilities = null;
  }
}

// Export singleton instance
export const nativeDNS = new NativeDNS();
