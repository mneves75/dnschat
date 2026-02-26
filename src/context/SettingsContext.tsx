import React, {
  createContext,
  use,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  SETTINGS_VERSION,
  SUPPORTED_LOCALE_OPTIONS,
  migrateSettings,
  sanitizeDnsServer,
  resolveLocale,
  normalizePreferredLocale,
  areAccessibilityConfigsEqual,
} from "./settingsStorage";
import type {
  PersistedSettings,
  SupportedLocale,
  SupportedLocaleOption,
} from "./settingsStorage";
import type { AccessibilityConfig } from "./AccessibilityContext";
import { DNSLogService } from "../services/dnsLogService";
import { validateDNSServer } from "../services/dnsService";
import { devWarn } from "../utils/devLog";

interface SettingsContextValue {
  dnsServer: string;
  updateDnsServer: (server: string) => Promise<void>;
  enableMockDNS: boolean;
  updateEnableMockDNS: (enable: boolean) => Promise<void>;
  allowExperimentalTransports: boolean;
  updateAllowExperimentalTransports: (enable: boolean) => Promise<void>;
  enableHaptics: boolean;
  updateEnableHaptics: (enable: boolean) => Promise<void>;
  locale: SupportedLocale;
  systemLocale: SupportedLocale;
  preferredLocale: string | null;
  availableLocales: SupportedLocaleOption[];
  updateLocale: (locale: string | null) => Promise<void>;
  accessibility: AccessibilityConfig;
  updateAccessibility: (config: AccessibilityConfig) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const localizationLocales = Localization.getLocales();
  const defaultSystemLocale = resolveLocale(
    localizationLocales[0]?.languageTag ?? localizationLocales[0]?.languageCode,
  );

  const [systemLocale] = useState<SupportedLocale>(defaultSystemLocale);
  const [settings, setSettings] = useState<PersistedSettings>(
    () => DEFAULT_SETTINGS,
  );
  const [loading, setLoading] = useState(true);

  // Effect: load persisted settings on mount and migrate if needed.
  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!settingsJson) {
          if (isMounted) {
            setSettings({ ...DEFAULT_SETTINGS });
          }
          return;
        }

        const parsed = JSON.parse(settingsJson) as unknown;
        const migrated = migrateSettings(parsed);

        // Clean up legacy fields from AsyncStorage after migration
        const originalVersion = (parsed as { version?: number })?.version;
        if (originalVersion !== SETTINGS_VERSION) {
          // Migration occurred - persist cleaned settings to remove legacy fields
          await AsyncStorage.setItem(
            SETTINGS_STORAGE_KEY,
            JSON.stringify(migrated),
          );
        }

        if (isMounted) {
          setSettings(migrated);
        }
      } catch (error) {
        devWarn("[SettingsContext] Error loading settings", error);
        if (isMounted) {
          setSettings({ ...DEFAULT_SETTINGS });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistSettings = async (next: PersistedSettings) => {
    setSettings(next);
    try {
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(next),
      );
    } catch (error) {
      devWarn("[SettingsContext] Error saving settings", error);
      throw error;
    }
  };

  const updateDnsServer = async (server: string) => {
    const cleaned = sanitizeDnsServer(server);
    let validatedServer: string;
    try {
      validatedServer = validateDNSServer(cleaned);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "Validation failed");
      await DNSLogService.recordSettingsEvent(
        `DNS server validation failed for input '${server}'`,
        message,
      );
      throw error;
    }
    if (settings.dnsServer === validatedServer) {
      return;
    }
    await persistSettings({
      ...settings,
      dnsServer: validatedServer,
    });
    await DNSLogService.recordSettingsEvent(
      `DNS server set to ${validatedServer}`,
      settings.dnsServer ? `previous: ${settings.dnsServer}` : undefined,
    );
  };

  const updateEnableMockDNS = async (enable: boolean) => {
    if (settings.enableMockDNS === enable) {
      return;
    }
    await persistSettings({
      ...settings,
      enableMockDNS: enable,
    });
    await DNSLogService.recordSettingsEvent(
      `Mock DNS ${enable ? 'enabled' : 'disabled'}`,
    );
  };

  const updateAllowExperimentalTransports = async (enable: boolean) => {
    if (settings.allowExperimentalTransports === enable) {
      return;
    }
    await persistSettings({
      ...settings,
      allowExperimentalTransports: enable,
    });
    await DNSLogService.recordSettingsEvent(
      `Experimental transports ${enable ? 'enabled' : 'disabled'}`,
    );
  };

  const updateEnableHaptics = async (enable: boolean) => {
    if (settings.enableHaptics === enable) {
      return;
    }
    await persistSettings({
      ...settings,
      enableHaptics: enable,
    });
    await DNSLogService.recordSettingsEvent(
      `Haptics ${enable ? 'enabled' : 'disabled'}`,
    );
  };

  const updateLocale = async (locale: string | null) => {
    const normalized = normalizePreferredLocale(locale);
    if (settings.preferredLocale === normalized) {
      return;
    }
    await persistSettings({
      ...settings,
      preferredLocale: normalized,
    });
    await DNSLogService.recordSettingsEvent(
      `Preferred locale set to ${normalized ?? 'system default'}`,
    );
  };

  const updateAccessibility = async (accessibilityConfig: AccessibilityConfig) => {
    if (areAccessibilityConfigsEqual(settings.accessibility, accessibilityConfig)) {
      return;
    }
    await persistSettings({
      ...settings,
      accessibility: accessibilityConfig,
    });
    await DNSLogService.recordSettingsEvent(
      `Accessibility settings updated: ${JSON.stringify(accessibilityConfig)}`,
    );
  };

  const activeLocale = resolveLocale(settings.preferredLocale ?? systemLocale);

  const contextValue: SettingsContextValue = {
    dnsServer: settings.dnsServer,
    updateDnsServer,
    enableMockDNS: settings.enableMockDNS,
    updateEnableMockDNS,
    allowExperimentalTransports: settings.allowExperimentalTransports,
    updateAllowExperimentalTransports,
    enableHaptics: settings.enableHaptics,
    updateEnableHaptics,
    locale: activeLocale,
    systemLocale,
    preferredLocale: settings.preferredLocale,
    availableLocales: SUPPORTED_LOCALE_OPTIONS,
    updateLocale,
    accessibility: settings.accessibility,
    updateAccessibility,
    loading,
  };

  return (
    <SettingsContext value={contextValue}>
      {children}
    </SettingsContext>
  );
}

export function useSettings() {
  const context = use(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

export type {
  PersistedSettings as SettingsStorageSnapshot,
  SupportedLocale,
  SupportedLocaleOption,
} from "./settingsStorage";
