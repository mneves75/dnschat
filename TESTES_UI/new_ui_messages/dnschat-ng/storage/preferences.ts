import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_DNS_SERVER } from '@/constants/dns';

export type TransportPreferences = {
  native: boolean;
  udp: boolean;
  tcp: boolean;
  https: boolean;
};

export type Preferences = {
  onboardingCompleted: boolean;
  locale: 'system' | string;
  transport: TransportPreferences;
  serverHost: string;
  updatedAt: number;
};

const STORAGE_KEY = 'dnschat-ng/preferences/v1';

export const createDefaultPreferences = (): Preferences => ({
  onboardingCompleted: false,
  locale: 'system',
  transport: {
    native: true,
    udp: true,
    tcp: true,
    https: true
  },
  serverHost: DEFAULT_DNS_SERVER,
  updatedAt: Date.now()
});

type PersistedPreferences = Preferences & { updatedAt: string };

const serialize = (value: Preferences): PersistedPreferences => ({
  ...value,
  updatedAt: new Date(value.updatedAt).toISOString()
});

const deserialize = (value: PersistedPreferences): Preferences => ({
  ...value,
  serverHost: value.serverHost ?? DEFAULT_DNS_SERVER,
  updatedAt: Date.parse(value.updatedAt)
});

export async function loadPreferences(): Promise<Preferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultPreferences();
    const parsed = JSON.parse(raw) as PersistedPreferences;
    return deserialize(parsed);
  } catch (error) {
    console.warn('[PreferencesStorage] Failed to load preferences', error);
    return createDefaultPreferences();
  }
}

export async function savePreferences(preferences: Preferences): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(preferences)));
  } catch (error) {
    console.warn('[PreferencesStorage] Failed to persist preferences', error);
  }
}
