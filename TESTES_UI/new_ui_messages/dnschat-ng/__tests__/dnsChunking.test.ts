import { buildDnsQueryLabel, sortDnsRecords } from '@/utils/dnsLabel';
import type { DNSRecord } from '@/services/DNSTransportService';

describe('DNS TXT chunk handling', () => {
  const toRecord = (id: string, content: string): DNSRecord => ({ id, content });

  test('sorts explicit multi-part responses by numeric id', () => {
    const records: DNSRecord[] = [
      toRecord('2/3', 'world'),
      toRecord('1/3', 'hello '),
      toRecord('3/3', '!'),
    ];

    expect(sortDnsRecords(records)).toBe('hello world!');
  });

  test('assigns sequential fallback when ids are plain numbers', () => {
    const records: DNSRecord[] = [
      toRecord('3', 'rocks'),
      toRecord('1', 'DNS '),
      toRecord('2', 'chat '),
    ];

    expect(sortDnsRecords(records)).toBe('DNS chat rocks');
  });

  test('returns data as-is when ids cannot be parsed', () => {
    const records: DNSRecord[] = [
      toRecord('alpha', 'partial'),
      toRecord('beta', ' response'),
    ];

    expect(sortDnsRecords(records)).toBe('partial response');
  });

  test('concatenates single record without modification', () => {
    const records: DNSRecord[] = [toRecord('id', 'standalone')];

    expect(sortDnsRecords(records)).toBe('standalone');
  });
});

describe('DNS label builder', () => {
  test('produces normalized conversation-prefixed label', () => {
    const label = buildDnsQueryLabel('Hello, world!', 'Conversation #1');

    expect(label).toBe('conversation-1-hello-world');
    expect(label.length).toBeLessThanOrEqual(63 * 4);
  });
});
