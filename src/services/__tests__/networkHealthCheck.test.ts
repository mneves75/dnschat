import NetworkHealthService from '../networkHealthCheck';

describe('NetworkHealthService - health tracking', () => {
  beforeEach(() => {
    NetworkHealthService.reset();
  });

  it('starts healthy and becomes unhealthy after max failures', () => {
    const method = 'UDP';
    expect(NetworkHealthService.isHealthy(method)).toBe(true);

    NetworkHealthService.reportFailure(method, 'err1');
    NetworkHealthService.reportFailure(method, 'err2');
    // Still below threshold
    expect(NetworkHealthService.isHealthy(method)).toBe(true);

    NetworkHealthService.reportFailure(method, 'err3');
    expect(NetworkHealthService.isHealthy(method)).toBe(false);
  });
});

describe('NetworkHealthService - circuit breaker', () => {
  beforeEach(() => {
    NetworkHealthService.reset();
  });

  it('uses fallback when method unhealthy', async () => {
    const method = 'TCP';
    // trip the breaker
    NetworkHealthService.reportFailure(method, 'e1');
    NetworkHealthService.reportFailure(method, 'e2');
    NetworkHealthService.reportFailure(method, 'e3');
    expect(NetworkHealthService.isHealthy(method)).toBe(false);

    const result = await NetworkHealthService.withCircuitBreaker(
      method,
      async () => 'primary',
      async () => 'fallback'
    );
    expect(result).toBe('fallback');
  });

  it('marks unhealthy immediately on critical errors', async () => {
    const method = 'HTTPS';
    await expect(
      NetworkHealthService.withCircuitBreaker(method, async () => {
        throw new Error('Invariant Violation: failing critically');
      })
    ).rejects.toThrow(/Invariant Violation/);

    expect(NetworkHealthService.isHealthy(method)).toBe(false);
  });
});

