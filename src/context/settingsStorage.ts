import { SUPPORTED_LOCALE_OPTIONS, resolveLocale } from "../i18n/translations";
import type { SupportedLocale } from "../i18n/translations";
import { validateDNSServer } from "../services/dnsService";

export { SUPPORTED_LOCALE_OPTIONS, resolveLocale } from "../i18n/translations";
export type { SupportedLocaleOption } from "../i18n/translations";

export interface AccessibilityConfig {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
}

export interface PersistedSettings {
  version: number;
  dnsServer: string;
  enableMockDNS: boolean;
  allowExperimentalTransports: boolean;
  enableHaptics: boolean;
  preferredLocale: string | null;
  accessibility: AccessibilityConfig;
}

export interface LegacySettingsV1 {
  dnsServer?: string;
  enableMockDNS?: boolean;
}

export const DEFAULT_DNS_SERVER = "llm.pieter.com";
export const SETTINGS_STORAGE_KEY = "@chat_dns_settings";
export const SETTINGS_VERSION = 4;

/**
 * Migrate DNS server from ch.at (offline) to llm.pieter.com
 * This handles users who had ch.at saved before the server went offline.
 */
function migrateOfflineServer(server: string): string {
  // ch.at is offline - migrate to llm.pieter.com
  if (server.toLowerCase().trim() === 'ch.at') {
    return DEFAULT_DNS_SERVER;
  }
  return server;
}

export const DEFAULT_SETTINGS: PersistedSettings = {
  version: SETTINGS_VERSION,
  dnsServer: DEFAULT_DNS_SERVER,
  enableMockDNS: false,
  allowExperimentalTransports: true,
  enableHaptics: true,
  preferredLocale: null,
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
  },
};

function normalizePersistedDnsServer(candidate: unknown, applyOfflineMigration: boolean = false): string {
  const cleaned = sanitizeDnsServer(typeof candidate === "string" ? candidate : undefined);
  try {
    const validated = validateDNSServer(cleaned);
    // Apply offline server migration if requested (v3 → v4)
    return applyOfflineMigration ? migrateOfflineServer(validated) : validated;
  } catch {
    return DEFAULT_DNS_SERVER;
  }
}

export function sanitizeDnsServer(server: string | undefined): string {
  const cleaned = (server ?? DEFAULT_DNS_SERVER).trim();
  return cleaned.length === 0 ? DEFAULT_DNS_SERVER : cleaned;
}

export function normalizePreferredLocale(
  value: unknown,
): SupportedLocale | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return resolveLocale(trimmed);
}

export function migrateSettings(raw: unknown): PersistedSettings {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_SETTINGS };
  }

  const candidate = raw as Partial<PersistedSettings> & LegacySettingsV1 & {
    version?: number;
    preferDnsOverHttps?: boolean;
    dnsMethodPreference?: string;
  };

  const accessibilitySource = candidate.accessibility ?? DEFAULT_SETTINGS.accessibility;
  const resolvedAccessibility: AccessibilityConfig = {
    fontSize: accessibilitySource?.fontSize ?? 'medium',
    highContrast: Boolean(accessibilitySource?.highContrast),
    reduceMotion: Boolean(accessibilitySource?.reduceMotion),
    screenReader: Boolean(accessibilitySource?.screenReader),
  };

  // Version 2 or earlier → Version 4: Remove HTTPS options, enable fallbacks, migrate offline servers
  if (typeof candidate.version === "number" && candidate.version < 3) {
    return {
      version: SETTINGS_VERSION,
      dnsServer: normalizePersistedDnsServer(candidate.dnsServer, true), // Apply offline migration
      enableMockDNS: Boolean(candidate.enableMockDNS),
      allowExperimentalTransports: true, // Always enable for v3+ (UDP/TCP fallbacks)
      enableHaptics:
        typeof candidate.enableHaptics === "boolean"
          ? candidate.enableHaptics
          : true,
      preferredLocale:
        candidate.preferredLocale === undefined
          ? null
          : normalizePreferredLocale(candidate.preferredLocale),
      accessibility: resolvedAccessibility,
    };
  }

  // Version 3 → Version 4: Migrate ch.at (offline) to llm.pieter.com
  if (typeof candidate.version === "number" && candidate.version === 3) {
    return {
      version: SETTINGS_VERSION,
      dnsServer: normalizePersistedDnsServer(candidate.dnsServer, true), // Apply offline migration
      enableMockDNS: Boolean(candidate.enableMockDNS),
      allowExperimentalTransports: Boolean(
        candidate.allowExperimentalTransports ?? true,
      ),
      enableHaptics:
        typeof candidate.enableHaptics === "boolean"
          ? candidate.enableHaptics
          : true,
      preferredLocale:
        candidate.preferredLocale === undefined
          ? null
          : normalizePreferredLocale(candidate.preferredLocale),
      accessibility: resolvedAccessibility,
    };
  }

  // Version 4+: No migration needed, preserve settings
  if (typeof candidate.version === "number") {
    return {
      version: SETTINGS_VERSION,
      dnsServer: normalizePersistedDnsServer(candidate.dnsServer, false), // No migration for v4+
      enableMockDNS: Boolean(candidate.enableMockDNS),
      allowExperimentalTransports: Boolean(
        candidate.allowExperimentalTransports ?? true,
      ),
      enableHaptics:
        typeof candidate.enableHaptics === "boolean"
          ? candidate.enableHaptics
          : true,
      preferredLocale:
        candidate.preferredLocale === undefined
          ? null
          : normalizePreferredLocale(candidate.preferredLocale),
      accessibility: resolvedAccessibility,
    };
  }

  // Legacy v1 (no version field) → Version 4
  const legacy = candidate as LegacySettingsV1;
  return {
    version: SETTINGS_VERSION,
    dnsServer: normalizePersistedDnsServer(legacy.dnsServer, true), // Apply offline migration
    enableMockDNS: Boolean(legacy.enableMockDNS),
    allowExperimentalTransports: true,
    enableHaptics: true,
    preferredLocale: null,
    accessibility: { ...DEFAULT_SETTINGS.accessibility },
  };
}

export function areAccessibilityConfigsEqual(
  left: AccessibilityConfig | null | undefined,
  right: AccessibilityConfig | null | undefined,
): boolean {
  if (left === right) return true;
  if (!left || !right) return false;
  return (
    left.fontSize === right.fontSize &&
    left.highContrast === right.highContrast &&
    left.reduceMotion === right.reduceMotion &&
    left.screenReader === right.screenReader
  );
}

export const SettingsStorageHelpers = {
  DEFAULT_SETTINGS,
  DEFAULT_DNS_SERVER,
  SETTINGS_STORAGE_KEY,
  SETTINGS_VERSION,
  SUPPORTED_LOCALE_OPTIONS,
  resolveLocale,
  migrateSettings,
  sanitizeDnsServer,
  normalizePreferredLocale,
};

export type { SupportedLocale };
