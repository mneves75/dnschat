import * as dnsPacket from 'dns-packet';
import {
  sanitizeDNSMessage,
  composeDNSQueryName,
} from '../src/services/dnsService';

describe('DNS pipeline integration', () => {
  const mockServerDecode = (fqdn: string): string => {
    let name = fqdn;
    if (name.endsWith('.')) {
      name = name.slice(0, -1);
    }
    if (name.toLowerCase().endsWith('.ch.at')) {
      name = name.slice(0, -'.ch.at'.length);
    }
    return name.replace(/-/g, ' ');
  };

  it('sanitizes, composes, and encodes within DNS limits', () => {
    const original = 'Hello DNS World';
    const label = sanitizeDNSMessage(original);
    const fqdn = composeDNSQueryName(label, 'ch.at');

    expect(label).toBe('hello-dns-world');
    expect(fqdn.length).toBeLessThanOrEqual(253);

    const encoded = dnsPacket.encode({
      type: 'query',
      id: 12345,
      flags: dnsPacket.RECURSION_DESIRED,
      questions: [
        {
          type: 'TXT',
          name: fqdn,
        },
      ],
    });

    const decoded = dnsPacket.decode(encoded);
    expect(decoded.questions?.[0]?.name).toBe(fqdn);

    const serverView = mockServerDecode(fqdn);
    expect(serverView).toBe('hello dns world');
  });

  it('rejects labels that would overflow DNS limits', () => {
    const tooLong = 'a'.repeat(121);
    expect(() => sanitizeDNSMessage(tooLong)).toThrow(
      'Message too long (maximum 120 characters before sanitization)',
    );
  });
});
