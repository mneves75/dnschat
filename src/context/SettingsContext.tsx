import React, {
  createContext,
  use,
  useEffect,
  useRef,
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
  applyRecommendedNetworkSettings: (
    allowExperimentalTransports: boolean,
  ) => Promise<void>;
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
  const settingsRef = useRef<PersistedSettings>(DEFAULT_SETTINGS);
  const persistQueueRef = useRef<Promise<void>>(Promise.resolve());

  // Effect: load persisted settings on mount and migrate if needed.
  useEffect(() => {
    let isMounted = true;

    const loadSettings = () => {
      persistQueueRef.current = persistQueueRef.current.then(async () => {
        try {
          const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
          if (!settingsJson) {
            const next = { ...DEFAULT_SETTINGS };
            settingsRef.current = next;
            if (isMounted) {
              setSettings(next);
            }
            return;
          }

          const parsed = JSON.parse(settingsJson) as unknown;
          const migrated = migrateSettings(parsed);

          // Migration occurred - persist cleaned settings to remove legacy fields.
          const originalVersion = (parsed as { version?: number })?.version;
          if (originalVersion !== SETTINGS_VERSION) {
            await AsyncStorage.setItem(
              SETTINGS_STORAGE_KEY,
              JSON.stringify(migrated),
            );
          }

          settingsRef.current = migrated;
          if (isMounted) {
            setSettings(migrated);
          }
        } catch (error) {
          devWarn("[SettingsContext] Error loading settings", error);
          const next = { ...DEFAULT_SETTINGS };
          settingsRef.current = next;
          if (isMounted) {
            setSettings(next);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      });
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistSettings = async (
    updater: (previous: PersistedSettings) => PersistedSettings,
  ): Promise<{
    previous: PersistedSettings;
    next: PersistedSettings;
    changed: boolean;
  }> => {
    let outcome:
      | {
          previous: PersistedSettings;
          next: PersistedSettings;
          changed: boolean;
        }
      | null = null;

    const run = persistQueueRef.current.then(async () => {
      const previous = settingsRef.current;
      const next = updater(previous);
      const changed = next !== previous;
      outcome = { previous, next, changed };

      if (!changed) {
        return;
      }

      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(next),
      );
      settingsRef.current = next;
      setSettings(next);
    });

    persistQueueRef.current = run.catch(() => {});

    try {
      await run;
    } catch (error) {
      devWarn("[SettingsContext] Error saving settings", error);
      throw error;
    }

    if (!outcome) {
      const snapshot = settingsRef.current;
      return { previous: snapshot, next: snapshot, changed: false };
    }

    return outcome;
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
    const { previous, changed } = await persistSettings((current) =>
      current.dnsServer === validatedServer
        ? current
        : {
            ...current,
            dnsServer: validatedServer,
          },
    );
    if (!changed) {
      return;
    }
    await DNSLogService.recordSettingsEvent(
      `DNS server set to ${validatedServer}`,
      previous.dnsServer ? `previous: ${previous.dnsServer}` : undefined,
    );
  };

  const updateEnableMockDNS = async (enable: boolean) => {
    const { changed } = await persistSettings((current) =>
      current.enableMockDNS === enable
        ? current
        : {
            ...current,
            enableMockDNS: enable,
          },
    );
    if (!changed) {
      return;
    }
    await DNSLogService.recordSettingsEvent(
      `Mock DNS ${enable ? 'enabled' : 'disabled'}`,
    );
  };

  const updateAllowExperimentalTransports = async (enable: boolean) => {
    const { changed } = await persistSettings((current) =>
      current.allowExperimentalTransports === enable
        ? current
        : {
            ...current,
            allowExperimentalTransports: enable,
          },
    );
    if (!changed) {
      return;
    }
    await DNSLogService.recordSettingsEvent(
      `Experimental transports ${enable ? 'enabled' : 'disabled'}`,
    );
  };

  const applyRecommendedNetworkSettings = async (
    enableExperimentalTransports: boolean,
  ) => {
    const { previous, next, changed } = await persistSettings((current) => {
      const updated: PersistedSettings = {
        ...current,
        dnsServer: DEFAULT_SETTINGS.dnsServer,
        enableMockDNS: false,
        allowExperimentalTransports: enableExperimentalTransports,
      };

      return (
        current.dnsServer === updated.dnsServer &&
        current.enableMockDNS === updated.enableMockDNS &&
        current.allowExperimentalTransports ===
          updated.allowExperimentalTransports
      )
        ? current
        : updated;
    });

    if (!changed) {
      return;
    }

    await DNSLogService.recordSettingsEvent(
      `Recommended onboarding network profile applied`,
      `dnsServer: ${previous.dnsServer} -> ${next.dnsServer}; mockDNS: ${previous.enableMockDNS} -> ${next.enableMockDNS}; experimental: ${previous.allowExperimentalTransports} -> ${next.allowExperimentalTransports}`,
    );
  };

  const updateEnableHaptics = async (enable: boolean) => {
    const { changed } = await persistSettings((current) =>
      current.enableHaptics === enable
        ? current
        : {
            ...current,
            enableHaptics: enable,
          },
    );
    if (!changed) {
      return;
    }
    await DNSLogService.recordSettingsEvent(
      `Haptics ${enable ? 'enabled' : 'disabled'}`,
    );
  };

  const updateLocale = async (locale: string | null) => {
    const normalized = normalizePreferredLocale(locale);
    const { changed } = await persistSettings((current) =>
      current.preferredLocale === normalized
        ? current
        : {
            ...current,
            preferredLocale: normalized,
          },
    );
    if (!changed) {
      return;
    }
    await DNSLogService.recordSettingsEvent(
      `Preferred locale set to ${normalized ?? 'system default'}`,
    );
  };

  const updateAccessibility = async (accessibilityConfig: AccessibilityConfig) => {
    const { changed } = await persistSettings((current) =>
      areAccessibilityConfigsEqual(current.accessibility, accessibilityConfig)
        ? current
        : {
            ...current,
            accessibility: accessibilityConfig,
          },
    );
    if (!changed) {
      return;
    }
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
    applyRecommendedNetworkSettings,
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
