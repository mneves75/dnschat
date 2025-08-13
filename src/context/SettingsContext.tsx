import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DNSMethodPreference = 'automatic' | 'prefer-https' | 'udp-only' | 'never-https';

interface SettingsContextType {
  dnsServer: string;
  updateDnsServer: (server: string) => Promise<void>;
  preferDnsOverHttps: boolean;
  updatePreferDnsOverHttps: (prefer: boolean) => Promise<void>;
  dnsMethodPreference: DNSMethodPreference;
  updateDnsMethodPreference: (preference: DNSMethodPreference) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = '@chat_dns_settings';
const DEFAULT_DNS_SERVER = 'ch.at';

interface Settings {
  dnsServer: string;
  preferDnsOverHttps?: boolean;
  dnsMethodPreference?: DNSMethodPreference;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [dnsServer, setDnsServer] = useState<string>(DEFAULT_DNS_SERVER);
  const [preferDnsOverHttps, setPreferDnsOverHttps] = useState<boolean>(false);
  const [dnsMethodPreference, setDnsMethodPreference] = useState<DNSMethodPreference>('automatic');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      console.log('📥 Loading settings from storage:', settingsJson);
      if (settingsJson) {
        const settings: Settings = JSON.parse(settingsJson);
        console.log('📋 Parsed settings:', settings);
        setDnsServer(settings.dnsServer || DEFAULT_DNS_SERVER);
        setPreferDnsOverHttps(settings.preferDnsOverHttps ?? false);
        setDnsMethodPreference(settings.dnsMethodPreference ?? 'automatic');
        console.log('✅ Settings loaded - DNS method:', settings.dnsMethodPreference ?? 'automatic');
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error);
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
        dnsMethodPreference,
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
        dnsMethodPreference,
      };
      
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving DNS over HTTPS preference:', error);
      throw error;
    }
  };

  const updateDnsMethodPreference = async (preference: DNSMethodPreference) => {
    try {
      console.log('🔧 Updating DNS method preference:', preference);
      setDnsMethodPreference(preference);
      
      const settings: Settings = {
        dnsServer,
        preferDnsOverHttps,
        dnsMethodPreference: preference,
      };
      
      console.log('💾 Saving settings to storage:', settings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      console.log('✅ DNS method preference saved successfully');
    } catch (error) {
      console.error('❌ Error saving DNS method preference:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      dnsServer, 
      updateDnsServer,
      preferDnsOverHttps,
      updatePreferDnsOverHttps,
      dnsMethodPreference,
      updateDnsMethodPreference,
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