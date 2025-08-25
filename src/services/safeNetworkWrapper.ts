/**
 * Safe Network Wrapper
 * 
 * Provides safe wrappers around potentially unstable network libraries
 * for SDK 54 compatibility with React Native 0.81 and New Architecture.
 */

import { Platform } from 'react-native';
import NetworkHealthService from './networkHealthCheck';

/**
 * Safe wrapper for react-native-udp operations
 */
export class SafeUDPWrapper {
  private static udpModule: any = null;
  private static initialized = false;

  static async initialize(): Promise<boolean> {
    if (this.initialized) {
      return this.udpModule !== null;
    }

    try {
      // Dynamically import to avoid crashes if module is broken
      const dgram = await import('react-native-udp');
      this.udpModule = dgram;
      this.initialized = true;
      console.log('✅ UDP module loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to load UDP module:', error);
      this.initialized = true;
      this.udpModule = null;
      NetworkHealthService.reportFailure('UDP', 'Module failed to load');
      return false;
    }
  }

  static async createSocket(type: string): Promise<any> {
    if (!await this.initialize()) {
      throw new Error('UDP module not available');
    }

    return NetworkHealthService.withCircuitBreaker(
      'UDP',
      async () => {
        if (!this.udpModule) {
          throw new Error('UDP module not initialized');
        }
        return this.udpModule.createSocket(type);
      }
    );
  }
}

/**
 * Safe wrapper for react-native-tcp-socket operations
 */
export class SafeTCPWrapper {
  private static tcpModule: any = null;
  private static initialized = false;

  static async initialize(): Promise<boolean> {
    if (this.initialized) {
      return this.tcpModule !== null;
    }

    try {
      // Dynamically import to avoid crashes if module is broken
      const TcpSocket = await import('react-native-tcp-socket');
      this.tcpModule = TcpSocket.default || TcpSocket;
      this.initialized = true;
      console.log('✅ TCP module loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to load TCP module:', error);
      this.initialized = true;
      this.tcpModule = null;
      NetworkHealthService.reportFailure('TCP', 'Module failed to load');
      return false;
    }
  }

  static async createConnection(options: any): Promise<any> {
    if (!await this.initialize()) {
      throw new Error('TCP module not available');
    }

    return NetworkHealthService.withCircuitBreaker(
      'TCP',
      async () => {
        if (!this.tcpModule) {
          throw new Error('TCP module not initialized');
        }
        return this.tcpModule.createConnection(options);
      }
    );
  }
}

/**
 * Enhanced fetch wrapper with retry and fallback
 */
export class SafeFetchWrapper {
  static async fetch(url: string, options?: RequestInit): Promise<Response> {
    return NetworkHealthService.withCircuitBreaker(
      'HTTPS',
      async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          return response;
        } finally {
          clearTimeout(timeout);
        }
      }
    );
  }
}

/**
 * Platform-specific network capability detection
 */
export class NetworkCapabilities {
  static hasUDP(): boolean {
    // UDP might not work on SDK 54 with New Architecture
    if (Platform.OS === 'web') return false;
    
    // Check if the module is healthy
    return NetworkHealthService.isHealthy('UDP');
  }

  static hasTCP(): boolean {
    // TCP might not work on SDK 54 with New Architecture
    if (Platform.OS === 'web') return false;
    
    // Check if the module is healthy
    return NetworkHealthService.isHealthy('TCP');
  }

  static hasHTTPS(): boolean {
    // HTTPS should always work
    return true;
  }

  static hasNative(): boolean {
    // Native DNS should work on iOS and Android
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Get the recommended DNS method based on current health
   */
  static getRecommendedMethod(): string {
    if (this.hasNative()) {
      return 'NATIVE';
    }
    if (this.hasHTTPS()) {
      return 'HTTPS';
    }
    if (this.hasUDP() && NetworkHealthService.isHealthy('UDP')) {
      return 'UDP';
    }
    if (this.hasTCP() && NetworkHealthService.isHealthy('TCP')) {
      return 'TCP';
    }
    return 'MOCK';
  }
}

export default {
  SafeUDPWrapper,
  SafeTCPWrapper,
  SafeFetchWrapper,
  NetworkCapabilities
};