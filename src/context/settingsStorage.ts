import { SUPPORTED_LOCALE_OPTIONS, SupportedLocale, resolveLocale } from "../i18n/translations";

export { SUPPORTED_LOCALE_OPTIONS, resolveLocale } from "../i18n/translations";
export type { SupportedLocaleOption } from "../i18n/translations";

export type DNSMethodPreference =
  | "automatic"
  | "prefer-https"
  | "udp-only"
  | "never-https"
  | "native-first";

export interface AccessibilityConfig {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
}

export interface PersistedSettings {
  version: number;
  dnsServer: string;
  preferDnsOverHttps: boolean;
  dnsMethodPreference: DNSMethodPreference;
  enableMockDNS: boolean;
  allowExperimentalTransports: boolean;
  preferredLocale: string | null;
  accessibility: AccessibilityConfig;
}

export interface LegacySettingsV1 {
  dnsServer?: string;
  preferDnsOverHttps?: boolean;
  dnsMethodPreference?: DNSMethodPreference;
  enableMockDNS?: boolean;
}

export const DEFAULT_DNS_SERVER = "ch.at";
export const SETTINGS_STORAGE_KEY = "@chat_dns_settings";
export const SETTINGS_VERSION = 2;

export const DEFAULT_SETTINGS: PersistedSettings = {
  version: SETTINGS_VERSION,
  dnsServer: DEFAULT_DNS_SERVER,
  preferDnsOverHttps: false,
  dnsMethodPreference: "native-first",
  enableMockDNS: false,
  allowExperimentalTransports: false,
  preferredLocale: null,
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
  },
};

export function sanitizeDnsServer(server: string | undefined): string {
  const cleaned = (server ?? DEFAULT_DNS_SERVER).trim();
  return cleaned.length === 0 ? DEFAULT_DNS_SERVER : cleaned;
}

export function coerceDnsMethodPreference(
  value: unknown,
): DNSMethodPreference {
  const allowed: DNSMethodPreference[] = [
    "automatic",
    "prefer-https",
    "udp-only",
    "never-https",
    "native-first",
  ];
  return allowed.includes(value as DNSMethodPreference)
    ? (value as DNSMethodPreference)
    : "native-first";
}

export function migrateSettings(raw: unknown): PersistedSettings {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_SETTINGS };
  }

  const candidate = raw as Partial<PersistedSettings> & LegacySettingsV1;

  const accessibilitySource = candidate.accessibility ?? DEFAULT_SETTINGS.accessibility;
  const resolvedAccessibility: AccessibilityConfig = {
    fontSize: accessibilitySource?.fontSize ?? 'medium',
    highContrast: Boolean(accessibilitySource?.highContrast),
    reduceMotion: Boolean(accessibilitySource?.reduceMotion),
    screenReader: Boolean(accessibilitySource?.screenReader),
  };

  if (typeof candidate.version === "number") {
    return {
      version: SETTINGS_VERSION,
      dnsServer: sanitizeDnsServer(candidate.dnsServer),
      preferDnsOverHttps: Boolean(candidate.preferDnsOverHttps),
      dnsMethodPreference: coerceDnsMethodPreference(
        candidate.dnsMethodPreference,
      ),
      enableMockDNS: Boolean(candidate.enableMockDNS),
      allowExperimentalTransports: Boolean(
        candidate.allowExperimentalTransports,
      ),
      preferredLocale:
        candidate.preferredLocale === undefined
          ? null
          : candidate.preferredLocale,
      accessibility: resolvedAccessibility,
    };
  }

  const legacy = candidate as LegacySettingsV1;
  return {
    version: SETTINGS_VERSION,
    dnsServer: sanitizeDnsServer(legacy.dnsServer),
    preferDnsOverHttps: Boolean(legacy.preferDnsOverHttps),
    dnsMethodPreference: coerceDnsMethodPreference(
      legacy.dnsMethodPreference,
    ),
    enableMockDNS: Boolean(legacy.enableMockDNS),
    allowExperimentalTransports: false,
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
  coerceDnsMethodPreference,
};

export type { SupportedLocale };
