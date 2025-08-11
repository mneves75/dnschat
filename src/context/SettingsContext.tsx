import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
  dnsServer: string;
  updateDnsServer: (server: string) => Promise<void>;
  preferDnsOverHttps: boolean;
  updatePreferDnsOverHttps: (prefer: boolean) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = '@chat_dns_settings';
const DEFAULT_DNS_SERVER = 'ch.at';

interface Settings {
  dnsServer: string;
  preferDnsOverHttps?: boolean;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [dnsServer, setDnsServer] = useState<string>(DEFAULT_DNS_SERVER);
  const [preferDnsOverHttps, setPreferDnsOverHttps] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (settingsJson) {
        const settings: Settings = JSON.parse(settingsJson);
        setDnsServer(settings.dnsServer || DEFAULT_DNS_SERVER);
        setPreferDnsOverHttps(settings.preferDnsOverHttps ?? false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDnsServer = async (server: string) => {
    try {
      const cleanServer = server.trim() || DEFAULT_DNS_SERVER;
      setDnsServer(cleanServer);
      
      const settings: Settings = {
        dnsServer: cleanServer,
        preferDnsOverHttps,
      };
      
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving DNS server setting:', error);
      throw error;
    }
  };

  const updatePreferDnsOverHttps = async (prefer: boolean) => {
    try {
      setPreferDnsOverHttps(prefer);
      
      const settings: Settings = {
        dnsServer,
        preferDnsOverHttps: prefer,
      };
      
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving DNS over HTTPS preference:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      dnsServer, 
      updateDnsServer,
      preferDnsOverHttps,
      updatePreferDnsOverHttps,
      loading 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}