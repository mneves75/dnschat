import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DNSMethodPreference = 'automatic' | 'prefer-https' | 'udp-only' | 'never-https' | 'native-first';

interface SettingsContextType {
  dnsServer: string;
  updateDnsServer: (server: string) => Promise<void>;
  preferDnsOverHttps: boolean;
  updatePreferDnsOverHttps: (prefer: boolean) => Promise<void>;
  dnsMethodPreference: DNSMethodPreference;
  updateDnsMethodPreference: (preference: DNSMethodPreference) => Promise<void>;
  enableMockDNS: boolean;
  updateEnableMockDNS: (enable: boolean) => Promise<void>;
  debugMode: boolean;
  updateDebugMode: (enable: boolean) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = '@chat_dns_settings';
const DEFAULT_DNS_SERVER = 'ch.at';

interface Settings {
  dnsServer: string;
  preferDnsOverHttps?: boolean;
  dnsMethodPreference?: DNSMethodPreference;
  enableMockDNS?: boolean;
  debugMode?: boolean;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [dnsServer, setDnsServer] = useState<string>(DEFAULT_DNS_SERVER);
  const [preferDnsOverHttps, setPreferDnsOverHttps] = useState<boolean>(false);
  const [dnsMethodPreference, setDnsMethodPreference] = useState<DNSMethodPreference>('native-first');
  const [enableMockDNS, setEnableMockDNS] = useState<boolean>(false);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      console.log('📥 Loading settings from storage:', settingsJson);
      
      if (settingsJson) {
        // Existing settings found
        const settings: Settings = JSON.parse(settingsJson);
        console.log('📋 Parsed settings:', settings);
        setDnsServer(settings.dnsServer || DEFAULT_DNS_SERVER);
        setPreferDnsOverHttps(settings.preferDnsOverHttps ?? false);
        setDnsMethodPreference(settings.dnsMethodPreference ?? 'native-first');
        setEnableMockDNS(settings.enableMockDNS ?? false);
        setDebugMode(settings.debugMode ?? false);
        console.log('✅ Settings loaded - DNS method:', settings.dnsMethodPreference ?? 'native-first', 'MockDNS:', settings.enableMockDNS ?? false, 'Debug:', settings.debugMode ?? false);
      } else {
        // First launch - initialize default settings
        console.log('🆕 First launch detected - initializing default settings');
        const defaultSettings: Settings = {
          dnsServer: DEFAULT_DNS_SERVER,
          preferDnsOverHttps: false,
          dnsMethodPreference: 'native-first',
          enableMockDNS: false,
          debugMode: false,
        };
        
        // Save defaults for future launches
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
        console.log('✅ Default settings initialized and saved');
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
        enableMockDNS,
        debugMode,
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
        enableMockDNS,
        debugMode,
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
        enableMockDNS,
        debugMode,
      };
      
      console.log('💾 Saving settings to storage:', settings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      console.log('✅ DNS method preference saved successfully');
    } catch (error) {
      console.error('❌ Error saving DNS method preference:', error);
      throw error;
    }
  };

  const updateEnableMockDNS = async (enable: boolean) => {
    try {
      console.log('🔧 Updating enable Mock DNS:', enable);
      setEnableMockDNS(enable);
      
      const settings: Settings = {
        dnsServer,
        preferDnsOverHttps,
        dnsMethodPreference,
        enableMockDNS: enable,
        debugMode,
      };
      
      console.log('💾 Saving settings to storage:', settings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      console.log('✅ Enable Mock DNS preference saved successfully');
    } catch (error) {
      console.error('❌ Error saving enable Mock DNS preference:', error);
      throw error;
    }
  };

  const updateDebugMode = async (enable: boolean) => {
    try {
      console.log('🐛 Updating debug mode:', enable);
      setDebugMode(enable);
      
      const settings: Settings = {
        dnsServer,
        preferDnsOverHttps,
        dnsMethodPreference,
        enableMockDNS,
        debugMode: enable,
      };
      
      console.log('💾 Saving settings to storage:', settings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      console.log('✅ Debug mode preference saved successfully');
    } catch (error) {
      console.error('❌ Error saving debug mode preference:', error);
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
      enableMockDNS,
      updateEnableMockDNS,
      debugMode,
      updateDebugMode,
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