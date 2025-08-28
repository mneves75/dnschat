/**
 * Unit tests for DNSLogService
 * Run with: npm test -- dnsLogService.test.ts
 */

// Mock AsyncStorage before importing modules that use it
const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

import { DNSLogService, DNSQueryLog, DNSLogEntry } from '../dnsLogService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// (mock defined and applied above)

describe('DNSLogService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset static properties
    DNSLogService['currentQueryLog'] = null;
    DNSLogService['queryLogs'] = [];
    DNSLogService['listeners'] = new Set();
    DNSLogService['debugMode'] = false;
  });

  describe('Debug Mode Management', () => {
    it('should set debug mode correctly', () => {
      DNSLogService.setDebugMode(true);
      expect(DNSLogService['debugMode']).toBe(true);
      
      DNSLogService.setDebugMode(false);
      expect(DNSLogService['debugMode']).toBe(false);
    });

    it('should only capture debug data when debug mode is enabled', () => {
      DNSLogService.setDebugMode(false);
      const queryId = DNSLogService.startQuery('test query');
      
      DNSLogService.logMethodAttempt('native', 'test details', {
        rawRequest: 'test request',
        networkInfo: { server: 'test.server', port: 53, protocol: 'udp' }
      });
      
      const logs = DNSLogService.getLogs();
      expect(logs[0].entries[1].debugData).toBeUndefined();
    });

    it('should capture debug data when debug mode is enabled', () => {
      DNSLogService.setDebugMode(true);
      const queryId = DNSLogService.startQuery('test query');
      
      const debugData = {
        rawRequest: 'test request',
        networkInfo: { server: 'test.server', port: 53, protocol: 'udp' }
      };
      
      DNSLogService.logMethodAttempt('native', 'test details', debugData);
      
      const logs = DNSLogService.getLogs();
      expect(logs[0].entries[1].debugData).toEqual(debugData);
    });
  });

  describe('Query Lifecycle', () => {
    it('should start a query with debug context when debug mode is enabled', () => {
      DNSLogService.setDebugMode(true);
      const debugContext = {
        chatId: 'chat-123',
        messageId: 'msg-456',
        settingsSnapshot: {
          dnsServer: 'ch.at',
          preferDnsOverHttps: false,
          dnsMethodPreference: 'native-first' as const,
          debugMode: true,
        }
      };
      
      const queryId = DNSLogService.startQuery('test query', debugContext);
      
      const logs = DNSLogService.getLogs();
      expect(logs[0].debugContext).toEqual(debugContext);
    });

    it('should not include debug context when debug mode is disabled', () => {
      DNSLogService.setDebugMode(false);
      const debugContext = {
        chatId: 'chat-123',
        messageId: 'msg-456',
      };
      
      const queryId = DNSLogService.startQuery('test query', debugContext);
      
      const logs = DNSLogService.getLogs();
      expect(logs[0].debugContext).toBeUndefined();
    });

    it('should complete query lifecycle correctly', async () => {
      const queryId = DNSLogService.startQuery('test query');
      
      DNSLogService.logMethodAttempt('native', 'Attempting native DNS');
      DNSLogService.logMethodFailure('native', 'Connection failed', 100);
      DNSLogService.logFallback('native', 'udp');
      DNSLogService.logMethodAttempt('udp', 'Attempting UDP DNS');
      DNSLogService.logMethodSuccess('udp', 200, 'Success');
      
      await DNSLogService.endQuery(true, 'Test response', 'udp');
      
      const logs = DNSLogService.getLogs();
      expect(logs[0].finalStatus).toBe('success');
      expect(logs[0].finalMethod).toBe('udp');
      expect(logs[0].response).toBe('Test response');
      expect(logs[0].entries).toHaveLength(7); // start + 5 logs + end
    });
  });

  describe('Export Functionality', () => {
    it('should export log as JSON with correct structure', () => {
      DNSLogService.setDebugMode(true);
      const debugContext = {
        chatId: 'chat-123',
        settingsSnapshot: {
          dnsServer: 'ch.at',
          preferDnsOverHttps: false,
          dnsMethodPreference: 'native-first' as const,
          debugMode: true,
        }
      };
      
      const queryId = DNSLogService.startQuery('test query', debugContext);
      DNSLogService.logMethodSuccess('native', 100, 'Success', {
        rawResponse: 'test response'
      });
      
      const logs = DNSLogService.getLogs();
      const exportedJson = DNSLogService.exportLogAsJSON(logs[0]);
      const exportedData = JSON.parse(exportedJson);
      
      expect(exportedData).toHaveProperty('metadata');
      expect(exportedData).toHaveProperty('query');
      expect(exportedData).toHaveProperty('timeline');
      expect(exportedData).toHaveProperty('statistics');
      expect(exportedData).toHaveProperty('debugContext');
      
      expect(exportedData.metadata.logId).toBe(logs[0].id);
      expect(exportedData.query.text).toBe('test query');
      expect(exportedData.timeline).toHaveLength(2); // start + success
      expect(exportedData.statistics.totalEntries).toBe(2);
      expect(exportedData.statistics.successCount).toBe(1);
    });

    it('should generate appropriate filename', () => {
      const mockLog: DNSQueryLog = {
        id: 'test-id',
        query: 'This is a test query with special chars!@#',
        startTime: new Date('2024-01-15T10:30:00'),
        finalStatus: 'success',
        entries: [],
      };
      
      const filename = DNSLogService.generateExportFilename(mockLog);
      expect(filename).toMatch(/^dns-log-2024-01-15-\d{2}-\d{2}-\d{2}-This_is_a_test_query.json$/);
    });
  });

  describe('Storage and Persistence', () => {
    it('should limit stored logs to MAX_LOGS', async () => {
      // Create more than MAX_LOGS entries
      for (let i = 0; i < 105; i++) {
        const queryId = DNSLogService.startQuery(`query ${i}`);
        await DNSLogService.endQuery(true, `response ${i}`, 'native');
      }
      
      const logs = DNSLogService.getLogs();
      expect(logs.length).toBeLessThanOrEqual(100);
    });

    it('should save logs to AsyncStorage', async () => {
      const queryId = DNSLogService.startQuery('test query');
      await DNSLogService.endQuery(true, 'response', 'native');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@dns_query_logs',
        expect.any(String)
      );
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.setItem as unknown as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const queryId = DNSLogService.startQuery('test query');
      await DNSLogService.endQuery(true, 'response', 'native');
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save DNS logs:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Subscription System', () => {
    it('should notify listeners on log updates', () => {
      const listener = jest.fn();
      const unsubscribe = DNSLogService.subscribe(listener);
      
      DNSLogService.startQuery('test query');
      
      expect(listener).toHaveBeenCalledWith(expect.any(Array));
      
      unsubscribe();
      listener.mockClear();
      
      DNSLogService.startQuery('another query');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle multiple subscribers', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      const unsub1 = DNSLogService.subscribe(listener1);
      const unsub2 = DNSLogService.subscribe(listener2);
      
      DNSLogService.startQuery('test query');
      
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      
      unsub1();
      unsub2();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle logging without active query', () => {
      // No query started
      expect(() => {
        DNSLogService.logMethodAttempt('native', 'test');
      }).not.toThrow();
      
      const logs = DNSLogService.getLogs();
      expect(logs).toHaveLength(0);
    });

    it('should handle malformed debug data gracefully', () => {
      DNSLogService.setDebugMode(true);
      const queryId = DNSLogService.startQuery('test query');
      
      // Pass invalid debug data
      const invalidDebugData: any = {
        networkInfo: 'not an object', // Should be an object
        rawRequest: 123, // Should be a string
      };
      
      expect(() => {
        DNSLogService.logMethodAttempt('native', 'test', invalidDebugData);
      }).not.toThrow();
    });

    it('should export valid JSON with original text content', () => {
      const queryId = DNSLogService.startQuery('<script>alert("xss")</script>');
      DNSLogService.logMethodSuccess('native', 100, 'Success');
      
      const logs = DNSLogService.getLogs();
      const exportedJson = DNSLogService.exportLogAsJSON(logs[0]);
      
      expect(() => JSON.parse(exportedJson)).not.toThrow();
      const obj = JSON.parse(exportedJson);
      expect(obj.query.text).toBe('<script>alert("xss")</script>');
    });
  });

  describe('Performance Considerations', () => {
    it('should truncate very large debug data', () => {
      DNSLogService.setDebugMode(true);
      const queryId = DNSLogService.startQuery('test query');
      
      // Create very large debug data
      const largeData = {
        rawResponse: 'x'.repeat(100000), // 100KB string
      };
      
      DNSLogService.logMethodSuccess('native', 100, 'Success', largeData);
      
      const logs = DNSLogService.getLogs();
      const exportedJson = DNSLogService.exportLogAsJSON(logs[0]);
      
      // Exported JSON should be reasonable size (< 1MB)
      expect(exportedJson.length).toBeLessThan(1000000);
    });
  });
});
