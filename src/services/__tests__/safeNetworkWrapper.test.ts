import { SafeFetchWrapper } from '../safeNetworkWrapper';
import NetworkHealthService from '../networkHealthCheck';

describe('SafeFetchWrapper', () => {
  beforeEach(() => {
    // Reset circuit breaker health
    NetworkHealthService.reset();
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('aborts long-running fetch after timeout and rejects', async () => {
    // Mock fetch that rejects when the AbortController aborts
    const fetchSpy = jest.spyOn(global, 'fetch' as any).mockImplementation(
      (_url: string, init?: any) =>
        new Promise((_resolve, reject) => {
          if (init && init.signal) {
            init.signal.addEventListener('abort', () => {
              reject(new Error('AbortError'));
            });
          }
        }) as any
    );

    const promise = SafeFetchWrapper.fetch('https://example.com/slow');

    // Fast-forward just over 10s to trigger AbortController
    jest.advanceTimersByTime(10001);

    await expect(promise).rejects.toBeDefined();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('marks HTTPS unhealthy after repeated failures', async () => {
    // Mock fetch to always throw synchronously
    jest.spyOn(global, 'fetch' as any).mockImplementation(() => {
      return Promise.reject(new Error('Network down')) as any;
    });

    // Trigger three failing calls
    await expect(SafeFetchWrapper.fetch('https://api.test/1')).rejects.toBeDefined();
    await expect(SafeFetchWrapper.fetch('https://api.test/2')).rejects.toBeDefined();
    await expect(SafeFetchWrapper.fetch('https://api.test/3')).rejects.toBeDefined();

    expect(NetworkHealthService.isHealthy('HTTPS')).toBe(false);
  });
});
