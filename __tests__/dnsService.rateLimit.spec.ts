import { DNSService } from '../src/services/dnsService';

type DNSServiceInternals = {
  requestHistory: number[];
  checkRateLimit: () => boolean;
  MAX_REQUESTS_PER_WINDOW?: number;
  RATE_LIMIT_WINDOW?: number;
};

const dnsServiceInternals = DNSService as unknown as DNSServiceInternals;

const resetRateLimiter = () => {
  dnsServiceInternals.requestHistory = [];
};

describe('DNSService rate limiting', () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it('allows first request and blocks when exceeding MAX_REQUESTS_PER_WINDOW', () => {
    const checkRateLimit = dnsServiceInternals.checkRateLimit.bind(DNSService);

    const maxRequests = dnsServiceInternals.MAX_REQUESTS_PER_WINDOW ?? 30;

    for (let i = 0; i < maxRequests; i++) {
      expect(checkRateLimit()).toBe(true);
    }

    expect(checkRateLimit()).toBe(false);
  });

  it('removes expired requests outside the sliding window', () => {
    const checkRateLimit = dnsServiceInternals.checkRateLimit.bind(DNSService);
    const windowMs = dnsServiceInternals.RATE_LIMIT_WINDOW ?? 60000;

    expect(checkRateLimit()).toBe(true);

    const firstRequest = dnsServiceInternals.requestHistory[0];
    if (typeof firstRequest !== "number") {
      throw new Error("Expected requestHistory[0] to be a number");
    }
    dnsServiceInternals.requestHistory[0] = firstRequest - (windowMs + 1000);

    expect(checkRateLimit()).toBe(true);
  });
});
