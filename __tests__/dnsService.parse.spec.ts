import { parseTXTResponse } from '../src/services/dnsService';

describe('parseTXTResponse', () => {
  it('returns plain records when multipart prefix absent', () => {
    const result = parseTXTResponse(['Hello world']);
    expect(result).toBe('Hello world');
  });

  it('reassembles multipart responses in order', () => {
    const records = ['1/3:Hel', '2/3:lo ', '3/3:DNS'];
    const result = parseTXTResponse(records);
    expect(result).toBe('Hello DNS');
  });

  it('throws on duplicate multipart part numbers', () => {
    const records = ['1/2:Hel', '1/2:lo'];
    expect(() => parseTXTResponse(records)).toThrow(/Conflicting content for part/);
  });

  it('throws on incomplete multipart sequence', () => {
    const records = ['1/3:Hel', '3/3:lo'];
    expect(() => parseTXTResponse(records)).toThrow(/Incomplete multi-part response/);
  });
});
