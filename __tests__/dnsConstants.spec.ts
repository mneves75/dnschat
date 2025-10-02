import { DNS_CONSTANTS } from '../modules/dns-native/constants';

describe('DNS constants', () => {
  it('includes both ChatDNS endpoints', () => {
    expect(DNS_CONSTANTS.ALLOWED_DNS_SERVERS).toEqual(
      expect.arrayContaining(['ch.at', 'llm.pieter.com']),
    );
  });
});
