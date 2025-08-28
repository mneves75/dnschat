import { DNSService } from '../dnsService';

describe('DNSService.performDNSOverHTTPS', () => {
  it('throws error indicating incompatibility with ch.at custom TXT', async () => {
    const fn = (DNSService as any)['performDNSOverHTTPS'].bind(DNSService);
    await expect(fn('hello', 'ch.at')).rejects.toThrow(/DNS-over-HTTPS cannot access/);
  });
});

