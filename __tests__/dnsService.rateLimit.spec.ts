import { DNSService } from '../src/services/dnsService';

const resetRateLimiter = () => {
  (DNSService as any).requestHistory = [];
};

describe('DNSService rate limiting', () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it('allows first request and blocks when exceeding MAX_REQUESTS_PER_WINDOW', () => {
    const checkRateLimit = (DNSService as any).checkRateLimit.bind(DNSService);

    const maxRequests = (DNSService as any).MAX_REQUESTS_PER_WINDOW ?? 30;

    for (let i = 0; i < maxRequests; i++) {
      expect(checkRateLimit()).toBe(true);
    }

    expect(checkRateLimit()).toBe(false);
  });

  it('removes expired requests outside the sliding window', () => {
    const checkRateLimit = (DNSService as any).checkRateLimit.bind(DNSService);
    const windowMs = (DNSService as any).RATE_LIMIT_WINDOW ?? 60000;

    expect(checkRateLimit()).toBe(true);

    (DNSService as any).requestHistory[0] -= windowMs + 1000;

    expect(checkRateLimit()).toBe(true);
  });
});
