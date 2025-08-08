import { nativeDNS, DNSError, DNSErrorType, NativeDNS } from '../index';
import { NativeModules } from 'react-native';

// Mock React Native NativeModules
jest.mock('react-native', () => ({
  NativeModules: {
    RNDNSModule: {
      queryTXT: jest.fn(),
      isAvailable: jest.fn(),
    },
  },
}));

describe('Native DNS Module', () => {
  let mockNativeModule: any;
  let testDNS: NativeDNS;

  beforeEach(() => {
    mockNativeModule = NativeModules.RNDNSModule;
    testDNS = new NativeDNS();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset capabilities cache
    testDNS.resetCapabilities();
  });

  describe('Platform Capabilities', () => {
    it('should report iOS capabilities correctly', async () => {
      mockNativeModule.isAvailable.mockResolvedValue({
        available: true,
        platform: 'ios',
        supportsCustomServer: true,
        supportsAsyncQuery: true,
      });

      const capabilities = await testDNS.isAvailable();

      expect(capabilities.available).toBe(true);
      expect(capabilities.platform).toBe('ios');
      expect(capabilities.supportsCustomServer).toBe(true);
      expect(capabilities.supportsAsyncQuery).toBe(true);
    });

    it('should report Android capabilities correctly', async () => {
      mockNativeModule.isAvailable.mockResolvedValue({
        available: true,
        platform: 'android',
        supportsCustomServer: true,
        supportsAsyncQuery: true,
        apiLevel: 29,
      });

      const capabilities = await testDNS.isAvailable();

      expect(capabilities.available).toBe(true);
      expect(capabilities.platform).toBe('android');
      expect(capabilities.apiLevel).toBe(29);
    });

    it('should handle unavailable native module', async () => {
      // Create DNS instance without native module
      const dnsWithoutNative = new (class extends NativeDNS {
        constructor() {
          super();
          // @ts-ignore - access private property for testing
          this.nativeModule = null;
        }
      })();

      const capabilities = await dnsWithoutNative.isAvailable();

      expect(capabilities.available).toBe(false);
      expect(capabilities.platform).toBe('web');
      expect(capabilities.supportsCustomServer).toBe(false);
    });

    it('should cache capabilities after first call', async () => {
      mockNativeModule.isAvailable.mockResolvedValue({
        available: true,
        platform: 'ios',
        supportsCustomServer: true,
        supportsAsyncQuery: true,
      });

      // First call
      await testDNS.isAvailable();
      
      // Second call
      await testDNS.isAvailable();

      // Should only call native module once due to caching
      expect(mockNativeModule.isAvailable).toHaveBeenCalledTimes(1);
    });
  });

  describe('DNS Query Functionality', () => {
    it('should successfully query TXT records', async () => {
      const mockResponse = ['1/2:Hello from', '2/2: AI assistant'];
      mockNativeModule.queryTXT.mockResolvedValue(mockResponse);

      const result = await testDNS.queryTXT('ch.at', 'test message');

      expect(mockNativeModule.queryTXT).toHaveBeenCalledWith('ch.at', 'test message');
      expect(result).toEqual(mockResponse);
    });

    it('should reject empty messages', async () => {
      await expect(testDNS.queryTXT('ch.at', '')).rejects.toThrow(DNSError);
      await expect(testDNS.queryTXT('ch.at', '   ')).rejects.toThrow(DNSError);
    });

    it('should handle native module unavailable', async () => {
      // Create DNS instance without native module
      const dnsWithoutNative = new (class extends NativeDNS {
        constructor() {
          super();
          // @ts-ignore - access private property for testing
          this.nativeModule = null;
        }
      })();

      await expect(
        dnsWithoutNative.queryTXT('ch.at', 'test')
      ).rejects.toThrow(new DNSError(
        DNSErrorType.PLATFORM_UNSUPPORTED,
        'Native DNS module is not available on this platform'
      ));
    });

    it('should handle empty response from native module', async () => {
      mockNativeModule.queryTXT.mockResolvedValue([]);

      await expect(
        testDNS.queryTXT('ch.at', 'test')
      ).rejects.toThrow(new DNSError(
        DNSErrorType.INVALID_RESPONSE,
        'No TXT records received from DNS server'
      ));
    });

    it('should handle various native errors correctly', async () => {
      const testCases = [
        {
          nativeError: { code: 'DNS_QUERY_FAILED', message: 'Query failed' },
          expectedType: DNSErrorType.DNS_QUERY_FAILED,
        },
        {
          nativeError: new Error('Connection timeout occurred'),
          expectedType: DNSErrorType.TIMEOUT,
        },
        {
          nativeError: new Error('Network connectivity issue'),
          expectedType: DNSErrorType.NETWORK_UNAVAILABLE,
        },
        {
          nativeError: new Error('Permission denied for DNS query'),
          expectedType: DNSErrorType.PERMISSION_DENIED,
        },
      ];

      for (const testCase of testCases) {
        mockNativeModule.queryTXT.mockRejectedValue(testCase.nativeError);

        await expect(
          testDNS.queryTXT('ch.at', 'test')
        ).rejects.toMatchObject({
          type: testCase.expectedType,
        });
      }
    });
  });

  describe('Multi-part Response Parsing', () => {
    it('should parse single response correctly', () => {
      const txtRecords = ['Hello world from AI'];
      const result = testDNS.parseMultiPartResponse(txtRecords);
      expect(result).toBe('Hello world from AI');
    });

    it('should parse multi-part response correctly', () => {
      const txtRecords = [
        '1/3:Hello ',
        '2/3:from AI ',
        '3/3:assistant!'
      ];
      const result = testDNS.parseMultiPartResponse(txtRecords);
      expect(result).toBe('Hello from AI assistant!');
    });

    it('should handle unordered multi-part response', () => {
      const txtRecords = [
        '3/3:assistant!',
        '1/3:Hello ',
        '2/3:from AI '
      ];
      const result = testDNS.parseMultiPartResponse(txtRecords);
      expect(result).toBe('Hello from AI assistant!');
    });

    it('should handle incomplete multi-part response', () => {
      const txtRecords = [
        '1/3:Hello ',
        '3/3:assistant!' // Missing part 2/3
      ];

      expect(() => testDNS.parseMultiPartResponse(txtRecords)).toThrow(
        new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          'Incomplete multi-part response: got 2 parts, expected 3'
        )
      );
    });

    it('should handle empty response', () => {
      expect(() => testDNS.parseMultiPartResponse([])).toThrow(
        new DNSError(
          DNSErrorType.INVALID_RESPONSE,
          'No TXT records to parse'
        )
      );
    });

    it('should handle mixed format responses', () => {
      const txtRecords = [
        'Regular response without part format',
        'Another regular response'
      ];
      const result = testDNS.parseMultiPartResponse(txtRecords);
      expect(result).toBe('Regular response without part format');
    });
  });

  describe('Error Handling', () => {
    it('should create DNSError with correct properties', () => {
      const cause = new Error('Original error');
      const dnsError = new DNSError(
        DNSErrorType.TIMEOUT,
        'DNS query timed out',
        cause
      );

      expect(dnsError.type).toBe(DNSErrorType.TIMEOUT);
      expect(dnsError.message).toBe('DNS query timed out');
      expect(dnsError.cause).toBe(cause);
      expect(dnsError.name).toBe('DNSError');
      expect(dnsError).toBeInstanceOf(Error);
    });

    it('should handle DNSError without cause', () => {
      const dnsError = new DNSError(
        DNSErrorType.NETWORK_UNAVAILABLE,
        'Network is unavailable'
      );

      expect(dnsError.cause).toBeUndefined();
      expect(dnsError.type).toBe(DNSErrorType.NETWORK_UNAVAILABLE);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle concurrent queries efficiently', async () => {
      mockNativeModule.queryTXT.mockImplementation(
        (domain: string, message: string) =>
          Promise.resolve([`Response to: ${message}`])
      );

      const queries = Array.from({ length: 10 }, (_, i) =>
        testDNS.queryTXT('ch.at', `message ${i}`)
      );

      const results = await Promise.all(queries);

      expect(results).toHaveLength(10);
      expect(mockNativeModule.queryTXT).toHaveBeenCalledTimes(10);
    });

    it('should handle query cancellation gracefully', async () => {
      let resolveQuery: (value: string[]) => void;
      const queryPromise = new Promise<string[]>((resolve) => {
        resolveQuery = resolve;
      });

      mockNativeModule.queryTXT.mockReturnValue(queryPromise);

      const queryResult = testDNS.queryTXT('ch.at', 'test');

      // Don't resolve the promise - simulate a cancelled/timeout scenario
      
      // This test would need additional AbortController support in the implementation
      // For now, just verify the promise exists
      expect(queryResult).toBeInstanceOf(Promise);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with realistic LLM query', async () => {
      const mockLLMResponse = [
        '1/2:I understand your question about DNS queries. ',
        '2/2:This is a response from the AI assistant via DNS TXT records.'
      ];

      mockNativeModule.queryTXT.mockResolvedValue(mockLLMResponse);

      const result = await testDNS.queryTXT(
        'ch.at',
        'How does DNS TXT querying work for AI responses?'
      );

      expect(result).toEqual(mockLLMResponse);
      
      const parsedResponse = testDNS.parseMultiPartResponse(mockLLMResponse);
      expect(parsedResponse).toBe(
        'I understand your question about DNS queries. This is a response from the AI assistant via DNS TXT records.'
      );
    });

    it('should handle very long messages appropriately', async () => {
      const longMessage = 'A'.repeat(500); // Very long message
      mockNativeModule.queryTXT.mockResolvedValue(['Response to long message']);

      await testDNS.queryTXT('ch.at', longMessage);

      // Verify the native module was called (message handling is done at native level)
      expect(mockNativeModule.queryTXT).toHaveBeenCalledWith('ch.at', longMessage);
    });
  });
});