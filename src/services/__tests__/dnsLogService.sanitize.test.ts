import { DNSLogService } from '../dnsLogService';

describe('DNSLogService.sanitizeDebugData', () => {
  const sanitize = (DNSLogService as any)['sanitizeDebugData'].bind(DNSLogService);

  it('coerces non-string debug fields safely', () => {
    const input = {
      rawRequest: 12345 as any,
      rawResponse: { ok: true } as any,
      stackTrace: ['line1', 'line2'] as any,
    };
    const out = sanitize(input);
    expect(typeof out?.rawRequest).toBe('string');
    expect(typeof out?.rawResponse).toBe('string');
    expect(typeof out?.stackTrace).toBe('string');
  });

  it('handles circular dnsPacket objects without throwing', () => {
    const a: any = { a: 1 };
    a.self = a;
    const out = sanitize({ dnsPacket: a });
    // Either preview object or original object, but no throw
    expect(out).toBeDefined();
  });
});

describe('DNSLogService.generateExportFilename', () => {
  it('sanitizes query into safe filename', () => {
    const log = {
      id: 'x',
      query: 'bad <script>alert(1)</script> name',
      startTime: new Date('2024-01-15T10:30:00Z'),
      finalStatus: 'success',
      entries: [],
    } as any;
    const filename = DNSLogService.generateExportFilename(log);
    expect(filename).toMatch(/^dns-log-2024-01-15-\d{2}-\d{2}-\d{2}-.*\.json$/);
    expect(filename).not.toContain('<');
    expect(filename).not.toContain('>');
  });
});

describe('DNSLogService log limit', () => {
  beforeEach(async () => {
    await DNSLogService.clearLogs();
  });

  it('keeps at most 100 logs after ending', async () => {
    for (let i = 0; i < 105; i++) {
      DNSLogService.startQuery(`q${i}`);
      await DNSLogService.endQuery(true, 'ok', 'native');
    }
    const logs = DNSLogService.getLogs();
    expect(logs.length).toBeLessThanOrEqual(100);
  });
});
