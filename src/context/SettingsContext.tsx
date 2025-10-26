import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

import {
  DEFAULT_SETTINGS,
  PersistedSettings,
  SETTINGS_STORAGE_KEY,
  SUPPORTED_LOCALE_OPTIONS,
  SupportedLocale,
  SupportedLocaleOption,
  migrateSettings,
  sanitizeDnsServer,
  resolveLocale,
  normalizePreferredLocale,
} from "./settingsStorage";
import { AccessibilityConfig } from "./AccessibilityContext";
import { DNSLogService } from "../services/dnsLogService";
import { validateDNSServer } from "../services/dnsService";

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
        if (isMounted) {
          setSettings(migrated);
        }
      } catch (error) {
        console.error("❌ Error loading settings:", error);
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

  const persistSettings = useCallback(async (next: PersistedSettings) => {
    setSettings(next);
    try {
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(next),
      );
    } catch (error) {
      console.error("❌ Error saving settings:", error);
      throw error;
    }
  }, []);

  const updateDnsServer = useCallback(
    async (server: string) => {
      const cleaned = sanitizeDnsServer(server);
      try {
        validateDNSServer(cleaned);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error ?? "Validation failed");
        await DNSLogService.recordSettingsEvent(
          `DNS server validation failed for input '${server}'`,
          message,
        );
        throw error;
      }
      if (settings.dnsServer === cleaned) {
        return;
      }
      await persistSettings({
        ...settings,
        dnsServer: cleaned,
      });
      await DNSLogService.recordSettingsEvent(
        `DNS server set to ${cleaned}`,
        settings.dnsServer ? `previous: ${settings.dnsServer}` : undefined,
      );
    },
    [persistSettings, settings],
  );

  const updateEnableMockDNS = useCallback(
    async (enable: boolean) => {
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
    },
    [persistSettings, settings],
  );

  const updateAllowExperimentalTransports = useCallback(
    async (enable: boolean) => {
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
    },
    [persistSettings, settings],
  );

  const updateEnableHaptics = useCallback(
    async (enable: boolean) => {
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
    },
    [persistSettings, settings],
  );

  const updateLocale = useCallback(
    async (locale: string | null) => {
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
    },
    [persistSettings, settings],
  );

  const updateAccessibility = useCallback(
    async (accessibilityConfig: import("./AccessibilityContext").AccessibilityConfig) => {
      if (JSON.stringify(settings.accessibility) === JSON.stringify(accessibilityConfig)) {
        return;
      }
      await persistSettings({
        ...settings,
        accessibility: accessibilityConfig,
      });
      await DNSLogService.recordSettingsEvent(
        `Accessibility settings updated: ${JSON.stringify(accessibilityConfig)}`,
      );
    },
    [persistSettings, settings],
  );

  const activeLocale = useMemo(
    () => resolveLocale(settings.preferredLocale ?? systemLocale),
    [settings.preferredLocale, systemLocale],
  );

  const contextValue = useMemo<SettingsContextValue>(
    () => ({
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
    }),
    [
      activeLocale,
      loading,
      settings.accessibility,
      settings.allowExperimentalTransports,
      settings.dnsServer,
      settings.enableHaptics,
      settings.enableMockDNS,
      settings.preferredLocale,
      systemLocale,
      updateAccessibility,
      updateAllowExperimentalTransports,
      updateDnsServer,
      updateEnableHaptics,
      updateEnableMockDNS,
      updateLocale,
    ],
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
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
