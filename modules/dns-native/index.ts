import { NativeModules, Platform } from "react-native";
import {
  getNativeSanitizerConfig,
  getServerPort,
  DNS_CONSTANTS,
} from "./constants";
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
    if (
      typeof process !== "undefined" &&
      process.env?.["DNSCHAT_NATIVE_DEBUG"] === "1"
    ) {
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

const getErrorDetails = (
  error: unknown,
): { message: string; code?: string } => {
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
   * @param port - DNS port (53 for the allowlisted resolvers)
   * @returns Promise resolving to array of TXT record strings
   */
  queryTXT(
    domain: string,
    message: string,
    port: number,
    deadlineEpochMs: number,
  ): Promise<string[]>;
  queryTXTUDP?(
    domain: string,
    message: string,
    port: number,
    deadlineEpochMs: number,
  ): Promise<string[]>;
  queryTXTTCP?(
    domain: string,
    message: string,
    port: number,
    deadlineEpochMs: number,
  ): Promise<string[]>;
  cancelActiveQueries(): Promise<number>;

  /**
   * Check if native DNS functionality is available on this platform
   * @returns Promise resolving to platform capabilities
   */
  isAvailable(): Promise<DNSCapabilities>;
  configureSanitizer?(config: NativeSanitizerConfig): void | Promise<boolean>;
  debugSanitizeLabel?(label: string): Promise<string>;
}

type NativeDNSQueryMethod = "queryTXT" | "queryTXTUDP" | "queryTXTTCP";

import {
  DNSError,
  DNSErrorType,
  parseMultiPartTXTResponse,
} from "./txtResponse";
export {
  DNSError,
  DNSErrorType,
  parseMultiPartTXTResponse,
  sanitizeLLMResponseText,
} from "./txtResponse";

export class NativeDNS implements NativeDNSModule {
  private readonly nativeModule: NativeDNSModule | null;
  private capabilities: DNSCapabilities | null = null;
  private capabilitiesTimestamp = 0;
  private sanitizerConfigurationPromise: Promise<void> | null = null;
  private sanitizerConfigurationError: Error | null = null;
  private sanitizerConfigurationPermanentFailure = false;
  // RACE CONDITION FIX: Promise lock to prevent concurrent isAvailable() calls
  // from all bypassing the cache and making redundant native module calls.
  private capabilitiesPromise: Promise<DNSCapabilities> | null = null;
  // SECURITY: TTL prevents stale network configuration from persisting forever.
  // 30 seconds is long enough to avoid repeated native calls but short enough
  // to detect network changes (e.g., WiFi to cellular, VPN connection).
  private static readonly CAPABILITIES_TTL_MS = 30000;

  private isPermanentSanitizerConfigurationError(error: unknown): boolean {
    const code = getErrorCode(error);
    if (code?.startsWith("SANITIZER_CONFIG_") === true) return true;

    return getErrorMessage(error).toUpperCase().includes("SANITIZER_CONFIG_");
  }

  private recordSanitizerConfigurationFailure(
    error: unknown,
    permanent = false,
  ): void {
    this.sanitizerConfigurationError =
      error instanceof Error ? error : new Error(String(error));
    this.sanitizerConfigurationPermanentFailure =
      permanent || this.isPermanentSanitizerConfigurationError(error);
    debugWarn("[NativeDNS] Failed to configure sanitizer:", error);
  }

  private configureSanitizerIfNeeded(): void {
    if (!this.nativeModule) return;
    if (
      this.sanitizerConfigurationPromise ||
      this.sanitizerConfigurationPermanentFailure
    ) {
      return;
    }
    debugLog(
      "[NativeDNS] RNDNSModule methods:",
      Object.keys(this.nativeModule),
    );
    if (typeof this.nativeModule.configureSanitizer !== "function") {
      this.recordSanitizerConfigurationFailure(
        new Error("Native DNS module does not expose sanitizer configuration"),
        true,
      );
      return;
    }

    let configurationAttempt: Promise<void>;
    try {
      const maybeResult = this.nativeModule.configureSanitizer(
        getNativeSanitizerConfig(),
      );

      configurationAttempt = Promise.resolve(maybeResult)
        .then((didUpdate) => {
          if (didUpdate) {
            debugLog("[NativeDNS] Sanitizer configured via shared constants");
          } else {
            debugLog(
              "[NativeDNS] Sanitizer already up to date; skipped reconfiguration",
            );
          }
          this.sanitizerConfigurationError = null;
          this.sanitizerConfigurationPermanentFailure = false;
        })
        .catch((error: unknown) => {
          this.recordSanitizerConfigurationFailure(error);
        })
        .then(() => {
          this.sanitizerConfigurationPromise = null;
        });
    } catch (error: unknown) {
      // Keep synchronous bridge failures in the same single-flight path as
      // rejected promises so concurrent queries cannot all retry at once.
      configurationAttempt = Promise.resolve()
        .then(() => {
          this.recordSanitizerConfigurationFailure(error);
        })
        .then(() => {
          this.sanitizerConfigurationPromise = null;
        });
    }

    this.sanitizerConfigurationPromise = configurationAttempt;
  }

  private async ensureSanitizerConfigured(): Promise<void> {
    if (!this.nativeModule) return;

    const currentConfigurationPromise = this.sanitizerConfigurationPromise;
    if (currentConfigurationPromise) {
      await currentConfigurationPromise;
    }

    if (
      this.sanitizerConfigurationError &&
      !this.sanitizerConfigurationPermanentFailure
    ) {
      // Configuration can fail transiently while the native bridge is starting
      // or reconnecting. Retry on the next query, sharing one in-flight attempt.
      if (!this.sanitizerConfigurationPromise) {
        this.configureSanitizerIfNeeded();
      }
      if (this.sanitizerConfigurationPromise) {
        await this.sanitizerConfigurationPromise;
      }
    }

    if (this.sanitizerConfigurationError) {
      throw new DNSError(
        DNSErrorType.PLATFORM_UNSUPPORTED,
        "Native DNS sanitizer configuration failed",
        this.sanitizerConfigurationError,
      );
    }
  }

  constructor(nativeModuleOverride?: NativeDNSModule | null) {
    // Try to get the native module, but don't crash if it's not available
    debugLog("[NativeDNS] constructor called");
    debugLog(
      "[NativeDNS] Available NativeModules keys:",
      Object.keys(NativeModules),
    );
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

  private async queryWithNativeMethod(
    method: NativeDNSQueryMethod,
    domain: string,
    message: string,
    port: number,
    deadlineEpochMs: number,
  ): Promise<string[]> {
    if (!this.nativeModule) {
      throw new DNSError(
        DNSErrorType.PLATFORM_UNSUPPORTED,
        "Native DNS module is not available on this platform",
      );
    }

    this.assertValidDeadline(deadlineEpochMs);
    await this.ensureSanitizerConfigured();

    const trimmedMessage = message?.trim();
    if (!trimmedMessage) {
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

    debugLog(`[NativeDNS] ${method}: ${domain}:${dnsPort}`, {
      queryNameLength: trimmedMessage.length,
    });

    try {
      const nativeQuery = this.nativeModule[method];
      if (typeof nativeQuery !== "function") {
        throw new DNSError(
          DNSErrorType.PLATFORM_UNSUPPORTED,
          `Native DNS module does not expose ${method}`,
        );
      }
      // Configuration and bridge startup can consume the caller's budget.
      // Never dispatch new native work after its deadline has expired.
      this.assertValidDeadline(deadlineEpochMs);
      const result = await nativeQuery(
        domain,
        trimmedMessage,
        dnsPort,
        deadlineEpochMs,
      );

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

      // Map native errors to our error types.
      // Substring classification runs BEFORE the generic DNS_QUERY_FAILED code
      // catch-all: native reject codes (TIMEOUT, CANCELLED, NO_RECORDS_FOUND,
      // QUERY_FAILED, RESOLVER_FAILED) do not separate network or permission
      // failures, so keying on the code first would collapse those into the
      // generic type and make these branches unreachable.
      // Permission first: a composed native message (e.g. the iOS
      // "UDP failed (…); TCP fallback failed: …" form) can carry a permission
      // indicator alongside timeout/network wording, and the permission
      // problem is the actionable one — retrying a denied query never helps.
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

      if (
        details.code === "TIMEOUT" ||
        details.code === "DNS_TIMEOUT" ||
        details.code === "DEADLINE_EXCEEDED" ||
        messageLower.includes("timeout") ||
        messageLower.includes("timed out") ||
        messageLower.includes("deadline") ||
        messageLower.includes("budget exhausted")
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

      if (details.code === "DNS_QUERY_FAILED") {
        throw new DNSError(
          DNSErrorType.DNS_QUERY_FAILED,
          details.message || "DNS query failed",
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

  private assertValidDeadline(deadlineEpochMs: number): void {
    if (
      !Number.isSafeInteger(deadlineEpochMs) ||
      deadlineEpochMs <= Date.now()
    ) {
      throw new DNSError(DNSErrorType.TIMEOUT, "DNS query deadline expired");
    }
  }

  async queryTXT(
    domain: string,
    message: string,
    port: number,
    deadlineEpochMs: number,
  ): Promise<string[]> {
    return this.queryWithNativeMethod(
      "queryTXT",
      domain,
      message,
      port,
      deadlineEpochMs,
    );
  }

  async queryTXTUDP(
    domain: string,
    message: string,
    port: number,
    deadlineEpochMs: number,
  ): Promise<string[]> {
    return this.queryWithNativeMethod(
      "queryTXTUDP",
      domain,
      message,
      port,
      deadlineEpochMs,
    );
  }

  async queryTXTTCP(
    domain: string,
    message: string,
    port: number,
    deadlineEpochMs: number,
  ): Promise<string[]> {
    return this.queryWithNativeMethod(
      "queryTXTTCP",
      domain,
      message,
      port,
      deadlineEpochMs,
    );
  }

  async cancelActiveQueries(): Promise<number> {
    if (!this.nativeModule) {
      return 0;
    }
    if (typeof this.nativeModule.cancelActiveQueries !== "function") {
      throw new DNSError(
        DNSErrorType.PLATFORM_UNSUPPORTED,
        "Native DNS module does not expose cancelActiveQueries",
      );
    }

    try {
      const cancelledCount = await this.nativeModule.cancelActiveQueries();
      if (!Number.isSafeInteger(cancelledCount) || cancelledCount < 0) {
        throw new DNSError(
          DNSErrorType.DNS_QUERY_FAILED,
          "Native DNS cancellation returned an invalid count",
        );
      }
      return cancelledCount;
    } catch (error: unknown) {
      if (error instanceof DNSError) throw error;
      throw new DNSError(
        DNSErrorType.DNS_QUERY_FAILED,
        "Failed to cancel active native DNS queries",
        error instanceof Error ? error : undefined,
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

    try {
      await this.ensureSanitizerConfigured();
    } catch (error) {
      debugWarn("Failed to check DNS availability:", error);
      const unavailableCapabilities: DNSCapabilities = {
        available: false,
        platform:
          Platform.OS === "ios" || Platform.OS === "android"
            ? Platform.OS
            : "web",
        supportsCustomServer: false,
        supportsAsyncQuery: false,
      };
      this.capabilities = unavailableCapabilities;
      this.capabilitiesTimestamp = now;
      return unavailableCapabilities;
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
   * Parse multi-part TXT responses (format: "1/3:", "2/3:", etc.).
   * Delegates to the shared parseMultiPartTXTResponse implementation.
   */
  parseMultiPartResponse(txtRecords: string[]): string {
    return parseMultiPartTXTResponse(txtRecords);
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
