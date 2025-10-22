import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Preferences,
  TransportPreferences,
  createDefaultPreferences,
  loadPreferences,
  savePreferences
} from '@/storage/preferences';
import { DEFAULT_DNS_SERVER, DNS_SERVER_WHITELIST } from '@/constants/dns';

type PreferencesContextValue = {
  preferences: Preferences;
  isHydrated: boolean;
  setOnboardingCompleted: (value: boolean) => void;
  setLocale: (value: Preferences['locale']) => void;
  setTransport: (value: Partial<TransportPreferences>) => void;
  setServerHost: (server: string) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<Preferences>(createDefaultPreferences);
  const [isHydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadPreferences();
      if (cancelled) return;
      setPreferences(stored);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void savePreferences(preferences);
  }, [isHydrated, preferences]);

  const setOnboardingCompleted = useCallback((value: boolean) => {
    setPreferences((current) => ({
      ...current,
      onboardingCompleted: value,
      updatedAt: Date.now()
    }));
  }, []);

  const setLocale = useCallback((value: Preferences['locale']) => {
    setPreferences((current) => ({
      ...current,
      locale: value,
      updatedAt: Date.now()
    }));
  }, []);

  const setTransport = useCallback((value: Partial<TransportPreferences>) => {
    setPreferences((current) => ({
      ...current,
      transport: { ...current.transport, ...value },
      updatedAt: Date.now()
    }));
  }, []);

  const setServerHost = useCallback((serverHost: string) => {
    setPreferences((current) => {
      const normalized = serverHost.trim().toLowerCase();
      const whitelistEntry =
        DNS_SERVER_WHITELIST[normalized] ??
        Object.values(DNS_SERVER_WHITELIST).find(
          (candidate) => candidate.host.toLowerCase() === normalized
        );
      // Defensive: Persisted settings can drift or be tampered with; clamp to whitelist so we never
      // point queries at an unexpected domain. Falls back to default if lookup fails.
      const resolvedHost = whitelistEntry?.host ?? DEFAULT_DNS_SERVER;
      return {
        ...current,
        serverHost: resolvedHost,
        updatedAt: Date.now()
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      preferences,
      isHydrated,
      setOnboardingCompleted,
      setLocale,
      setTransport,
      setServerHost
    }),
    [preferences, isHydrated, setOnboardingCompleted, setLocale, setTransport, setServerHost]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context.preferences;
}

export function usePreferencesActions() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferencesActions must be used within PreferencesProvider');
  }
  return {
    setOnboardingCompleted: context.setOnboardingCompleted,
    setLocale: context.setLocale,
    setTransport: context.setTransport,
    setServerHost: context.setServerHost
  };
}

export function usePreferencesHydration() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferencesHydration must be used within PreferencesProvider');
  }
  return context.isHydrated;
}
