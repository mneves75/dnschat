import { DNS_CONSTANTS } from '../modules/dns-native/constants';

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
});
