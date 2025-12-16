import { NativeModules, Platform } from "react-native";
import { getNativeSanitizerConfig, NativeSanitizerConfig } from "./constants";

const isJestRuntime = (): boolean => {
  try {
    return (
      typeof process !== "undefined" &&
      typeof process.env === "object" &&
      process.env !== null &&
      typeof process.env.JEST_WORKER_ID === "string"
    );
  } catch {
    return false;
  }
};

const isNativeDebugEnabled = (): boolean => {
  const dev = typeof __DEV__ !== "undefined" ? Boolean(__DEV__) : false;
  if (!dev) return false;
  if (isJestRuntime()) return false;

  try {
    if ((globalThis as any).__DNSCHAT_NATIVE_DEBUG__ === true) return true;
  } catch {}
  try {
    if (typeof process !== "undefined" && process.env?.DNSCHAT_NATIVE_DEBUG === "1") {
      return true;
    }
  } catch {}
  return false;
};

const DEV_LOGGING = isNativeDebugEnabled();
const debugLog = (...args: unknown[]) => {
  if (DEV_LOGGING) {
    console.log(...args);
  }
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
   * @param domain - DNS server hostname (e.g., 'ch.at')
   * @param message - Fully qualified domain name to query (already sanitized)
   * @returns Promise resolving to array of TXT record strings
   */
  queryTXT(domain: string, message: string): Promise<string[]>;

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
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "DNSError";
  }
}

export class NativeDNS implements NativeDNSModule {
  private readonly nativeModule: NativeDNSModule | null;
  private capabilities: DNSCapabilities | null = null;
  private capabilitiesTimestamp = 0;
  // SECURITY: TTL prevents stale network configuration from persisting forever.
  // 30 seconds is long enough to avoid repeated native calls but short enough
  // to detect network changes (e.g., WiFi to cellular, VPN connection).
  private static readonly CAPABILITIES_TTL_MS = 30000;

  constructor() {
    // Try to get the native module, but don't crash if it's not available
    debugLog("[NativeDNS] constructor called");
    debugLog("[NativeDNS] Available NativeModules keys:", Object.keys(NativeModules));
    debugLog("[NativeDNS] Looking for RNDNSModule...");

    try {
      this.nativeModule = NativeModules.RNDNSModule as NativeDNSModule;
      debugLog("[NativeDNS] RNDNSModule found:", !!this.nativeModule);
      if (this.nativeModule) {
        debugLog("[NativeDNS] RNDNSModule methods:", Object.keys(this.nativeModule));
        if (Platform?.OS === "android") {
          try {
            const maybeResult = this.nativeModule.configureSanitizer?.(
              getNativeSanitizerConfig(),
            );

            if (maybeResult && typeof (maybeResult as Promise<unknown>).then === "function") {
              (maybeResult as Promise<boolean>)
                .then((didUpdate) => {
                  if (didUpdate) {
                    debugLog("[NativeDNS] Android sanitizer configured via shared constants");
                  } else {
                    debugLog("[NativeDNS] Android sanitizer already up to date; skipped reconfiguration");
                  }
                })
                .catch((error: unknown) => {
                  console.warn("[NativeDNS] Failed to configure Android sanitizer:", error);
                });
            } else {
              debugLog("[NativeDNS] Android sanitizer configured via shared constants");
            }
          } catch (error) {
            console.warn("[NativeDNS] Failed to configure Android sanitizer:", error);
          }
        }
      }
    } catch (error) {
      console.warn("[NativeDNS] Native DNS module not available:", error);
      this.nativeModule = null;
    }
  }

  async queryTXT(domain: string, message: string): Promise<string[]> {
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

    try {
      const result = await this.nativeModule.queryTXT(domain, message.trim());

      if (!Array.isArray(result) || result.length === 0) {
        throw new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          "No TXT records received from DNS server",
        );
      }

      return result;
    } catch (error: any) {
      // Preserve already-classified DNSError types
      if (error instanceof DNSError) {
        throw error;
      }

      // Map native errors to our error types
      if (error?.code === "DNS_QUERY_FAILED") {
        throw new DNSError(
          DNSErrorType.DNS_QUERY_FAILED,
          error.message || "DNS query failed",
          error,
        );
      }

      if (
        error?.message?.includes("timeout") ||
        error?.message?.includes("timed out")
      ) {
        throw new DNSError(DNSErrorType.TIMEOUT, "DNS query timed out", error);
      }

      if (
        error?.message?.includes("network") ||
        error?.message?.includes("connectivity")
      ) {
        throw new DNSError(
          DNSErrorType.NETWORK_UNAVAILABLE,
          "Network unavailable for DNS query",
          error,
        );
      }

      if (
        error?.message?.includes("permission") ||
        error?.message?.includes("denied")
      ) {
        throw new DNSError(
          DNSErrorType.PERMISSION_DENIED,
          "DNS query permission denied",
          error,
        );
      }

      // Default to DNS query failed
      throw new DNSError(
        DNSErrorType.DNS_QUERY_FAILED,
        error?.message || "Unknown DNS error occurred",
        error,
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

    try {
      this.capabilities = await this.nativeModule.isAvailable();
      this.capabilitiesTimestamp = now;
      return this.capabilities;
    } catch (error) {
      console.warn("Failed to check DNS availability:", error);
      this.capabilities = {
        available: false,
        platform: "web",
        supportsCustomServer: false,
        supportsAsyncQuery: false,
      };
      this.capabilitiesTimestamp = now;
      return this.capabilities;
    }
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
