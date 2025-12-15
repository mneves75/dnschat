jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    AppState: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
  };
});

import { DNSService } from '../src/services/dnsService';
import * as DNSLogService from '../src/services/dnsLogService';
import {
  nativeDNS,
  DNSError,
  DNSErrorType,
} from '../modules/dns-native';
import { sanitizeDNSMessage, composeDNSQueryName } from "../src/services/dnsService";

jest.mock('../modules/dns-native', () => {
  const actual = jest.requireActual('../modules/dns-native');
  return {
    ...actual,
    nativeDNS: {
      queryTXT: jest.fn(),
      parseMultiPartResponse: jest.fn((records: string[]) => records.join('')),
      isAvailable: jest.fn().mockResolvedValue({
        available: true,
        platform: 'ios',
        supportsCustomServer: true,
        supportsAsyncQuery: true,
      }),
    },
  };
});

const mockedNativeDNS = nativeDNS as jest.Mocked<typeof nativeDNS>;

describe('DNSService native retry integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (DNSLogService as any).startQuery = jest.fn(() => 'query-1');
    (DNSLogService as any).addLog = jest.fn();
    (DNSLogService as any).logMethodFailure = jest.fn();
    (DNSLogService as any).logFallback = jest.fn();
    (DNSLogService as any).endQuery = jest.fn();
  });

  it('falls back to UDP when native DNS reports missing TXT records', async () => {
    mockedNativeDNS.queryTXT
      .mockRejectedValueOnce(new DNSError(DNSErrorType.INVALID_RESPONSE, 'No TXT records found'))
      .mockResolvedValueOnce(['Ignored']);

    const udpSpy = jest
      .spyOn(DNSService as any, 'performNativeUDPQuery')
      .mockResolvedValue(['Hello from UDP']);

    const result = await DNSService.queryLLM(
      'test fallback',
      'ch.at',
      false,
      true,
    );

    expect(mockedNativeDNS.queryTXT).toHaveBeenCalledTimes(1);
    expect(udpSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe('Hello from UDP');
  });

  it("composes the query name in TypeScript and passes it to native as-is", async () => {
    // `jest.clearAllMocks()` does not clear queued `mockResolvedValueOnce` entries,
    // so make this test explicitly independent of prior test setup.
    mockedNativeDNS.queryTXT.mockReset();
    mockedNativeDNS.queryTXT.mockResolvedValueOnce(["Hello from native"]);

    const message = "Hello DNS World";
    const targetServer = "ch.at";
    const label = sanitizeDNSMessage(message);
    const expectedQueryName = composeDNSQueryName(label, targetServer);

    const result = await DNSService.queryLLM(
      message,
      targetServer,
      false,
      false, // native-only (no UDP/TCP)
    );

    expect(result).toBe("Hello from native");
    expect(mockedNativeDNS.queryTXT).toHaveBeenCalledTimes(1);
    expect(mockedNativeDNS.queryTXT).toHaveBeenCalledWith(
      targetServer,
      expectedQueryName,
    );
  });
});
