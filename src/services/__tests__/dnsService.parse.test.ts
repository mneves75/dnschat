import { DNSService } from '../dnsService';

// Ensure react-native imports are mocked via moduleNameMapper

describe('DNSService.parseResponse', () => {
  const parseResponse = (DNSService as any)['parseResponse'].bind(DNSService);

  it('combines single record and trims', () => {
    expect(parseResponse(['  Hello world  '])).toBe('Hello world');
  });

  it('combines multi-part in order', () => {
    const records = ['1/3:Hello ', '2/3:from ', '3/3:DNS'];
    expect(parseResponse(records)).toBe('Hello from DNS');
  });

  it('combines multi-part when unordered', () => {
    const records = ['2/3:from ', '1/3:Hello ', '3/3:DNS'];
    expect(parseResponse(records)).toBe('Hello from DNS');
  });

  it('throws when no records', () => {
    expect(() => parseResponse([])).toThrow('No response received');
  });

  it('throws when combined is empty', () => {
    const records = ['1/2:   ', '2/2:   '];
    expect(() => parseResponse(records)).toThrow('Received empty response');
  });
});

describe('DNSService.sanitizeMessage & validateMessage', () => {
  const validateMessage = (DNSService as any)['validateMessage'].bind(DNSService);
  const sanitizeMessage = (DNSService as any)['sanitizeMessage'].bind(DNSService);

  it('rejects non-string or empty message', () => {
    expect(() => validateMessage('')).toThrow(/non-empty/);
    // @ts-expect-error
    expect(() => validateMessage(null)).toThrow(/non-empty/);
  });

  it('rejects too long message (>255 chars)', () => {
    const long = 'a'.repeat(256);
    expect(() => validateMessage(long)).toThrow(/too long/);
  });

  it('rejects control characters and HTML-like characters', () => {
    expect(() => validateMessage('bad\x01char')).toThrow(/invalid/);
    expect(() => validateMessage('<script>alert(1)</script>')).toThrow(/invalid/);
  });

  it('sanitizes message to RFC-1035 friendly label (<=63 chars)', () => {
    const raw = 'Hello..  DNS   Chat with unicode'; // no forbidden <>"'& chars
    const sanitized = sanitizeMessage(raw);
    expect(sanitized).not.toMatch(/[.;\\]/);
    expect(sanitized).not.toMatch(/[\x00-\x1F\x7F-\x9F]/);
    expect(sanitized.length).toBeLessThanOrEqual(63);
    expect(sanitized).toBe('Hello__ DNS Chat with unicode');
  });
});
