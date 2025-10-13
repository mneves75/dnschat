import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type DNSCapabilities = {
  available: boolean;
  platform: 'ios' | 'android' | 'web';
  supportsCustomServer: boolean;
  supportsAsyncQuery: boolean;
  apiLevel?: number;
};

export interface Spec extends TurboModule {
  queryTXT(domain: string, message: string): Promise<string[]>;
  isAvailable(): Promise<DNSCapabilities>;
  configure(options: { timeoutMs?: number; maxConcurrent?: number }): Promise<void>;
}

export function getDNSModule(): Spec | null {
  if ((global as any).__turboModuleProxy == null) {
    return null;
  }

  try {
    return TurboModuleRegistry.getEnforcing<Spec>('RNDNSModule');
  } catch (error) {
    if (__DEV__) {
      console.warn('[dns-native] Failed to load TurboModule RNDNSModule:', error);
    }
    return null;
  }
}
