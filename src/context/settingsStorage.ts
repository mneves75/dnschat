import { SUPPORTED_LOCALE_OPTIONS, SupportedLocale, resolveLocale } from "../i18n/translations";
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

export const DEFAULT_DNS_SERVER = "ch.at";
export const SETTINGS_STORAGE_KEY = "@chat_dns_settings";
export const SETTINGS_VERSION = 3;

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

function normalizePersistedDnsServer(candidate: unknown): string {
  const cleaned = sanitizeDnsServer(typeof candidate === "string" ? candidate : undefined);
  try {
    return validateDNSServer(cleaned);
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

  // Version 2 or earlier → Version 3: Remove HTTPS options, enable fallbacks
  if (typeof candidate.version === "number" && candidate.version < 3) {
    return {
      version: SETTINGS_VERSION,
      dnsServer: normalizePersistedDnsServer(candidate.dnsServer),
      enableMockDNS: Boolean(candidate.enableMockDNS),
      allowExperimentalTransports: true, // Always enable for v3 (UDP/TCP fallbacks)
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

  // Version 3+
  if (typeof candidate.version === "number") {
    return {
      version: SETTINGS_VERSION,
      dnsServer: normalizePersistedDnsServer(candidate.dnsServer),
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

  // Legacy v1 (no version field)
  const legacy = candidate as LegacySettingsV1;
  return {
    version: SETTINGS_VERSION,
    dnsServer: normalizePersistedDnsServer(legacy.dnsServer),
    enableMockDNS: Boolean(legacy.enableMockDNS),
    allowExperimentalTransports: true,
    enableHaptics: true,
    preferredLocale: null,
    accessibility: { ...DEFAULT_SETTINGS.accessibility },
  };
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
