import { Platform } from 'react-native';

describe('DNSService method order on iOS', () => {
  beforeEach(() => {
    jest.resetModules();
    // mock Platform iOS
    (Platform as any).OS = 'ios';
  });

  it('excludes tcp by default on iOS for native-first', async () => {
    const mod = await import('../src/services/dnsService');
    const { DNSService } = mod as any;
    DNSService.configure({ enableIosTcp: false });
    // @ts-ignore access private method for test via any
    const order = (DNSService as any).getMethodOrder('native-first', false, false);
    expect(order).toEqual(['native', 'udp', 'https']);
    expect(order.includes('tcp')).toBe(false);
  });

  it('includes tcp when explicitly enabled', async () => {
    const mod = await import('../src/services/dnsService');
    const { DNSService } = mod as any;
    DNSService.configure({ enableIosTcp: true });
    // @ts-ignore
    const order = (DNSService as any).getMethodOrder('native-first', false, false);
    expect(order).toEqual(['native', 'udp', 'tcp', 'https']);
  });
});

