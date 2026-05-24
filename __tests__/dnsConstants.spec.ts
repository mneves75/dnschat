import { DNS_CONSTANTS, getServerPort, getLLMServers } from '../modules/dns-native/constants';

describe('DNS constants', () => {
  it('includes both ChatDNS endpoints', () => {
    expect(DNS_CONSTANTS.ALLOWED_DNS_SERVERS).toEqual(
      expect.arrayContaining(['ch.at', 'llm.pieter.com']),
    );
  });

  it('uses standard DNS port 53 for UDP/TCP', () => {
    expect(DNS_CONSTANTS.DNS_PORT).toBe(53);
  });

  it('enforces RFC-style message/label limits', () => {
    expect(DNS_CONSTANTS.MAX_MESSAGE_LENGTH).toBe(120);
    expect(DNS_CONSTANTS.MAX_DNS_LABEL_LENGTH).toBe(63);
  });

  it('resolves DNS server ports from registry', () => {
    expect(getServerPort('llm.pieter.com')).toBe(53);
    expect(getServerPort('ch.at')).toBe(53);
    // Unknown servers fall back to the standard DNS port.
    expect(getServerPort('unknown.example')).toBe(53);
  });

  it('returns LLM servers in priority order', () => {
    const servers = getLLMServers();
    expect(servers[0]?.host).toBe('llm.pieter.com');
    expect(servers[1]?.host).toBe('ch.at');
  });
});
