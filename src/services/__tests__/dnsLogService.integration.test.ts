/**
 * Integration tests for DNSLogService debug functionality
 * These tests verify the complete flow without mocks
 */

import { DNSLogService } from '../dnsLogService';

// Helper to create test data
const createTestDebugData = () => ({
  rawRequest: 'A'.repeat(15000), // Test truncation
  rawResponse: 'B'.repeat(15000),
  networkInfo: {
    server: 'test.server',
    port: 53,
    protocol: 'udp' as const,
  },
  dnsPacket: { // Test object, not array
    questions: [{ name: 'test.com', type: 'TXT' }],
    answers: [],
  },
  stackTrace: 'Error'.repeat(2000),
});

describe('DNSLogService Integration Tests', () => {
  beforeEach(() => {
    // Reset service state
    DNSLogService['currentQueryLog'] = null;
    DNSLogService['queryLogs'] = [];
    DNSLogService['debugMode'] = false;
  });

  describe('Critical Bug Prevention', () => {
    it('should handle dnsPacket as object without crashing', () => {
      DNSLogService.setDebugMode(true);
      const queryId = DNSLogService.startQuery('test');
      
      // This would crash with .slice() on object
      expect(() => {
        DNSLogService.logMethodAttempt('native', 'test', {
          dnsPacket: { type: 'object', data: 'test' } as any,
        });
      }).not.toThrow();
    });

    it('should handle undefined conversation history safely', () => {
      DNSLogService.setDebugMode(true);
      
      // This would crash with undefined.slice()
      expect(() => {
        DNSLogService.startQuery('test', {
          conversationHistory: undefined,
        });
      }).not.toThrow();
    });

    it('should truncate extremely large data', () => {
      DNSLogService.setDebugMode(true);
      const queryId = DNSLogService.startQuery('test');
      
      const hugeData = createTestDebugData();
      DNSLogService.logMethodAttempt('native', 'test', hugeData);
      
      const logs = DNSLogService.getLogs();
      const entry = logs[0].entries[1];
      
      // Verify truncation worked
      expect(entry.debugData?.rawRequest).toContain('[TRUNCATED]');
      expect(entry.debugData?.rawResponse).toContain('[TRUNCATED]');
      expect(entry.debugData?.rawRequest?.length).toBeLessThan(11000);
    });

    it('should export without circular reference issues', () => {
      DNSLogService.setDebugMode(true);
      const queryId = DNSLogService.startQuery('test');
      
      // Create circular reference
      const circularObj: any = { a: 1 };
      circularObj.self = circularObj;
      
      DNSLogService.logMethodAttempt('native', 'test', {
        dnsPacket: circularObj,
      });
      
      const logs = DNSLogService.getLogs();
      
      // Should not throw on export
      expect(() => {
        const json = DNSLogService.exportLogAsJSON(logs[0]);
        JSON.parse(json); // Verify it's valid JSON
      }).not.toThrow();
    });
  });

  describe('Debug Mode State Management', () => {
    it('should only capture debug data when explicitly enabled', () => {
      // Start with debug OFF
      DNSLogService.setDebugMode(false);
      let queryId = DNSLogService.startQuery('test1');
      DNSLogService.logMethodAttempt('native', 'test', createTestDebugData());
      
      let logs = DNSLogService.getLogs();
      expect(logs[0].entries[1].debugData).toBeUndefined();
      
      // Enable debug
      DNSLogService.setDebugMode(true);
      queryId = DNSLogService.startQuery('test2');
      DNSLogService.logMethodAttempt('native', 'test', createTestDebugData());
      
      logs = DNSLogService.getLogs();
      expect(logs[0].entries[1].debugData).toBeDefined();
    });

    it('should handle rapid debug mode toggling', async () => {
      for (let i = 0; i < 10; i++) {
        DNSLogService.setDebugMode(i % 2 === 0);
        const queryId = DNSLogService.startQuery(`test${i}`);
        DNSLogService.logMethodAttempt('native', 'test', createTestDebugData());
        await DNSLogService.endQuery(true, 'ok', 'native');
      }
      
      const logs = DNSLogService.getLogs();
      expect(logs.length).toBe(10);
    });
  });

  describe('Memory Management', () => {
    it('should limit conversation history to MAX items', () => {
      DNSLogService.setDebugMode(true);
      
      const longHistory = Array.from({ length: 20 }, (_, i) => ({
        role: 'user' as const,
        message: `Message ${i}`,
        timestamp: new Date(),
      }));
      
      DNSLogService.startQuery('test', {
        conversationHistory: longHistory,
      });
      
      const logs = DNSLogService.getLogs();
      expect(logs[0].debugContext?.conversationHistory?.length).toBeLessThanOrEqual(10);
    });

    it('should not exceed MAX_LOGS limit', async () => {
      DNSLogService.setDebugMode(true);
      
      for (let i = 0; i < 150; i++) {
        const queryId = DNSLogService.startQuery(`query${i}`);
        await DNSLogService.endQuery(true, 'response', 'native');
      }
      
      const logs = DNSLogService.getLogs();
      expect(logs.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Export Functionality', () => {
    it('should generate valid JSON export', () => {
      DNSLogService.setDebugMode(true);
      const queryId = DNSLogService.startQuery('test query');
      DNSLogService.logMethodAttempt('native', 'test');
      DNSLogService.logMethodSuccess('native', 100, 'success');
      DNSLogService.endQuery(true, 'response', 'native');
      
      const logs = DNSLogService.getLogs();
      const exported = DNSLogService.exportLogAsJSON(logs[0]);
      
      expect(() => JSON.parse(exported)).not.toThrow();
      
      const data = JSON.parse(exported);
      expect(data.metadata).toBeDefined();
      expect(data.query).toBeDefined();
      expect(data.timeline).toBeDefined();
      expect(data.statistics).toBeDefined();
    });

    it('should sanitize filenames properly', () => {
      const log = {
        id: 'test',
        query: 'Test <script>alert("xss")</script> Query!!!',
        startTime: new Date('2024-01-15T10:30:00'),
        finalStatus: 'success' as const,
        entries: [],
      };
      
      const filename = DNSLogService.generateExportFilename(log);
      expect(filename).not.toContain('<');
      expect(filename).not.toContain('>');
      expect(filename).toMatch(/^dns-log-.*\.json$/);
    });
  });

  describe('Thread Safety', () => {
    it('should handle sequential operations safely', async () => {
      DNSLogService.setDebugMode(true);
      
      for (let i = 0; i < 10; i++) {
        const queryId = DNSLogService.startQuery(`concurrent${i}`);
        DNSLogService.logMethodAttempt('native', `attempt${i}`);
        await DNSLogService.endQuery(true, `response${i}`, 'native');
      }
      
      const logs = DNSLogService.getLogs();
      expect(logs.length).toBe(10);
      
      // Verify no data corruption
      logs.forEach((log) => {
        expect(log.entries).toBeDefined();
        expect(log.finalStatus).toBe('success');
      });
    });
  });
});
