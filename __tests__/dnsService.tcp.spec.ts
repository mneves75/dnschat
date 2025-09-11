import * as dnsServiceModule from '../src/services/dnsService';

describe('DNSService TCP lazy loading', () => {
  const originalRequire = require;

  beforeEach(() => {
    jest.resetModules();
  });

  it('gracefully handles TCP library import failure', async () => {
    // Mock require to throw when loading react-native-tcp-socket
    jest.doMock('react-native-tcp-socket', () => {
      throw new Error('Invariant Violation: new NativeEventEmitter() requires a non-null argument.');
    });

    const { DNSService } = await import('../src/services/dnsService');
    await expect(DNSService.testTransport('hello', 'tcp')).rejects.toBeDefined();
  });
});
