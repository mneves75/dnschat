import { NativeModules } from 'react-native';

export interface DNSCapabilities {
  available: boolean;
  platform: 'ios' | 'android' | 'web';
  supportsCustomServer: boolean;
  supportsAsyncQuery: boolean;
  apiLevel?: number; // Android only
}

export interface NativeDNSModule {
  /**
   * Query TXT records from a DNS server
   * @param domain - The domain to query (typically ignored, message is used instead)
   * @param message - The message/query to send to the DNS server
   * @returns Promise resolving to array of TXT record strings
   */
  queryTXT(domain: string, message: string): Promise<string[]>;
  
  /**
   * Check if native DNS functionality is available on this platform
   * @returns Promise resolving to platform capabilities
   */
  isAvailable(): Promise<DNSCapabilities>;
}

export enum DNSErrorType {
  PLATFORM_UNSUPPORTED = 'PLATFORM_UNSUPPORTED',
  NETWORK_UNAVAILABLE = 'NETWORK_UNAVAILABLE',
  DNS_SERVER_UNREACHABLE = 'DNS_SERVER_UNREACHABLE', 
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  TIMEOUT = 'TIMEOUT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DNS_QUERY_FAILED = 'DNS_QUERY_FAILED'
}

export class DNSError extends Error {
  constructor(
    public readonly type: DNSErrorType,
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'DNSError';
  }
}

class NativeDNS implements NativeDNSModule {
  private readonly nativeModule: NativeDNSModule | null;
  private capabilities: DNSCapabilities | null = null;

  constructor() {
    // Try to get the native module, but don't crash if it's not available
    console.log('🔧 NativeDNS constructor called');
    console.log('🔧 Available NativeModules keys:', Object.keys(NativeModules));
    console.log('🔧 Looking for RNDNSModule...');
    
    try {
      this.nativeModule = NativeModules.RNDNSModule as NativeDNSModule;
      console.log('✅ RNDNSModule found:', !!this.nativeModule);
      if (this.nativeModule) {
        console.log('✅ RNDNSModule methods:', Object.keys(this.nativeModule));
      }
    } catch (error) {
      console.warn('❌ Native DNS module not available:', error);
      this.nativeModule = null;
    }
  }

  async queryTXT(domain: string, message: string): Promise<string[]> {
    if (!this.nativeModule) {
      throw new DNSError(
        DNSErrorType.PLATFORM_UNSUPPORTED,
        'Native DNS module is not available on this platform'
      );
    }

    if (!message?.trim()) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        'Message cannot be empty'
      );
    }

    try {
      const result = await this.nativeModule.queryTXT(domain, message.trim());
      
      if (!Array.isArray(result) || result.length === 0) {
        throw new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          'No TXT records received from DNS server'
        );
      }

      return result;
    } catch (error: any) {
      // Map native errors to our error types
      if (error?.code === 'DNS_QUERY_FAILED') {
        throw new DNSError(
          DNSErrorType.DNS_QUERY_FAILED,
          error.message || 'DNS query failed',
          error
        );
      }

      if (error?.message?.includes('timeout') || error?.message?.includes('timed out')) {
        throw new DNSError(
          DNSErrorType.TIMEOUT,
          'DNS query timed out',
          error
        );
      }

      if (error?.message?.includes('network') || error?.message?.includes('connectivity')) {
        throw new DNSError(
          DNSErrorType.NETWORK_UNAVAILABLE,
          'Network unavailable for DNS query',
          error
        );
      }

      if (error?.message?.includes('permission') || error?.message?.includes('denied')) {
        throw new DNSError(
          DNSErrorType.PERMISSION_DENIED,
          'DNS query permission denied',
          error
        );
      }

      // Default to DNS query failed
      throw new DNSError(
        DNSErrorType.DNS_QUERY_FAILED,
        error?.message || 'Unknown DNS error occurred',
        error
      );
    }
  }

  async isAvailable(): Promise<DNSCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    if (!this.nativeModule) {
      this.capabilities = {
        available: false,
        platform: 'web',
        supportsCustomServer: false,
        supportsAsyncQuery: false
      };
      return this.capabilities;
    }

    try {
      this.capabilities = await this.nativeModule.isAvailable();
      return this.capabilities;
    } catch (error) {
      console.warn('Failed to check DNS availability:', error);
      this.capabilities = {
        available: false,
        platform: 'web',
        supportsCustomServer: false,
        supportsAsyncQuery: false
      };
      return this.capabilities;
    }
  }

  /**
   * Parse multi-part TXT responses (format: "1/3:", "2/3:", etc.)
   */
  parseMultiPartResponse(txtRecords: string[]): string {
    if (txtRecords.length === 0) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        'No TXT records to parse'
      );
    }

    // Try to parse as multi-part response
    const parts: Array<{ partNumber: number; totalParts: number; content: string }> = [];
    
    for (const record of txtRecords) {
      const match = record.match(/^(\d+)\/(\d+):(.*)$/);
      if (match) {
        parts.push({
          partNumber: parseInt(match[1], 10),
          totalParts: parseInt(match[2], 10),
          content: match[3]
        });
      } else {
        // If no multi-part format detected, treat as single response
        return record;
      }
    }

    if (parts.length === 0) {
      // No multi-part format found, concatenate all records
      return txtRecords.join(' ');
    }

    // Sort parts by part number
    parts.sort((a, b) => a.partNumber - b.partNumber);

    // Validate we have all parts
    const expectedTotal = parts[0]?.totalParts || 1;
    if (parts.length !== expectedTotal) {
      throw new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        `Incomplete multi-part response: got ${parts.length} parts, expected ${expectedTotal}`
      );
    }

    // Combine all parts
    return parts.map(part => part.content).join('');
  }

  /**
   * Reset cached capabilities (useful for testing)
   */
  resetCapabilities(): void {
    this.capabilities = null;
  }
}

// Export singleton instance
export const nativeDNS = new NativeDNS();

// For testing and advanced usage
export { NativeDNS };

// Re-export the native module type for external use
export type { NativeDNSModule };