import { useCallback } from "react";

import {
  DNSMethodPreference,
  SupportedLocale,
  SupportedLocaleOption,
  useSettings,
} from "../../context/SettingsContext";
import { useOnboarding } from "../../context/OnboardingContext";

export type SettingsUpdateResult =
  | { ok: true }
  | { ok: false; message: string };

export interface SettingsControlsState {
  dnsServer: string;
  preferDnsOverHttps: boolean;
  dnsMethodPreference: DNSMethodPreference;
  enableMockDNS: boolean;
  allowExperimentalTransports: boolean;
  locale: SupportedLocale;
  preferredLocale: string | null;
  availableLocales: SupportedLocaleOption[];
  systemLocale: SupportedLocale;
  loading: boolean;
}

export interface SettingsControlsActions {
  setDnsServer: (value: string) => Promise<SettingsUpdateResult>;
  setPreferDnsOverHttps: (value: boolean) => Promise<SettingsUpdateResult>;
  setDnsMethodPreference: (
    value: DNSMethodPreference,
  ) => Promise<SettingsUpdateResult>;
  setEnableMockDNS: (value: boolean) => Promise<SettingsUpdateResult>;
  setAllowExperimentalTransports: (
    value: boolean,
  ) => Promise<SettingsUpdateResult>;
  setLocale: (value: string | null) => Promise<SettingsUpdateResult>;
  resetOnboarding: () => Promise<void>;
}

export interface UseSettingsControlsResult {
  state: SettingsControlsState;
  actions: SettingsControlsActions;
}

function toResult(error: unknown): SettingsUpdateResult {
  const message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");
  return { ok: false, message };
}

export function useSettingsControls(): UseSettingsControlsResult {
  const settings = useSettings();
  const { resetOnboarding } = useOnboarding();

  const wrap = useCallback(
    <T,>(
      updater: (value: T) => Promise<void>,
    ): ((value: T) => Promise<SettingsUpdateResult>) => {
      return async (value: T) => {
        try {
          await updater(value);
          return { ok: true } as const;
        } catch (error) {
          return toResult(error);
        }
      };
    },
  []);

  const state: SettingsControlsState = {
    dnsServer: settings.dnsServer,
    preferDnsOverHttps: settings.preferDnsOverHttps,
    dnsMethodPreference: settings.dnsMethodPreference,
    enableMockDNS: settings.enableMockDNS,
    allowExperimentalTransports: settings.allowExperimentalTransports,
    locale: settings.locale,
    preferredLocale: settings.preferredLocale,
    availableLocales: settings.availableLocales,
    systemLocale: settings.systemLocale,
    loading: settings.loading,
  };

  const actions: SettingsControlsActions = {
    setDnsServer: wrap(settings.updateDnsServer),
    setPreferDnsOverHttps: wrap(settings.updatePreferDnsOverHttps),
    setDnsMethodPreference: wrap(settings.updateDnsMethodPreference),
    setEnableMockDNS: wrap(settings.updateEnableMockDNS),
    setAllowExperimentalTransports: wrap(
      settings.updateAllowExperimentalTransports,
    ),
    setLocale: wrap(settings.updateLocale),
    resetOnboarding,
  };

  return { state, actions };
}
