type NativeDnsTransportMock = {
  isAvailable: jest.Mock<Promise<{
    available: boolean;
    platform: "ios";
    supportsCustomServer: boolean;
    supportsAsyncQuery: boolean;
  }>, []>;
  queryTXT: jest.Mock<Promise<string[]>, [string, string, number]>;
  queryTXTUDP: jest.Mock<Promise<string[]>, [string, string, number]>;
  queryTXTTCP: jest.Mock<Promise<string[]>, [string, string, number]>;
  parseMultiPartResponse: jest.Mock<string, [string[]]>;
};

const loadDNSServiceWithTransportMocks = (
  udpFactory: () => unknown,
  tcpFactory: () => unknown,
) => {
  jest.resetModules();
  jest.doMock("react-native-udp", udpFactory);
  jest.doMock("react-native-tcp-socket", tcpFactory);
  jest.doMock("../modules/dns-native", () => {
    const actual = jest.requireActual("../modules/dns-native");
    return {
      ...actual,
      nativeDNS: {
        isAvailable: jest.fn().mockResolvedValue({
          available: true,
          platform: "ios",
          supportsCustomServer: true,
          supportsAsyncQuery: true,
        }),
        queryTXT: jest.fn().mockResolvedValue(["native"]),
        queryTXTUDP: jest.fn().mockResolvedValue(["udp native"]),
        queryTXTTCP: jest.fn().mockResolvedValue(["tcp native"]),
        parseMultiPartResponse: jest.fn((records: string[]) => records.join("")),
      },
    };
  });

  const dnsModule = require("../src/services/dnsService") as typeof import("../src/services/dnsService");
  const nativeModule = require("../modules/dns-native") as typeof import("../modules/dns-native");
  const logModule = require("../src/services/dnsLogService") as typeof import("../src/services/dnsLogService");

  jest.spyOn(logModule.DNSLogService, "startQuery").mockReturnValue("query-1");
  jest.spyOn(logModule.DNSLogService, "addLog").mockImplementation(() => undefined);
  jest.spyOn(logModule.DNSLogService, "logMethodAttempt").mockImplementation(() => undefined);
  jest.spyOn(logModule.DNSLogService, "logMethodSuccess").mockImplementation(() => undefined);
  jest.spyOn(logModule.DNSLogService, "logMethodFailure").mockImplementation(() => undefined);
  jest.spyOn(logModule.DNSLogService, "endQuery").mockResolvedValue(undefined);

  return {
    DNSService: dnsModule.DNSService,
    nativeDNS: nativeModule.nativeDNS as unknown as NativeDnsTransportMock,
  };
};

describe("DNSService iOS native transport fallbacks", () => {
  afterEach(() => {
    jest.dontMock("react-native-udp");
    jest.dontMock("react-native-tcp-socket");
    jest.dontMock("../modules/dns-native");
    jest.restoreAllMocks();
  });

  it("uses native UDP on iOS when react-native-udp cannot load under New Architecture", async () => {
    const { DNSService, nativeDNS } = loadDNSServiceWithTransportMocks(
      () => {
        throw new Error("NativeModules.UdpSockets is undefined");
      },
      () => ({ Socket: class MockSocket {} }),
    );

    const result = await DNSService.testTransport("test", "udp", "llm.pieter.com");

    expect(result).toBe("udp native");
    expect(nativeDNS.queryTXTUDP).toHaveBeenCalledWith(
      "llm.pieter.com",
      "test.llm.pieter.com",
      53,
    );
  });

  it("uses native TCP on iOS instead of the JS socket hostname path that fails with EAI_NONAME", async () => {
    class HostnameFailingSocket {
      on(event: string, handler: (error: unknown) => void): void {
        if (event === "error") {
          setTimeout(() => {
            handler({ code: "EAI_NONAME", message: "nodename nor servname provided, or not known" });
          }, 0);
        }
      }
      removeAllListeners(): void {}
      destroy(): void {}
      connect(): void {}
      write(): boolean {
        return true;
      }
    }

    const { DNSService, nativeDNS } = loadDNSServiceWithTransportMocks(
      () => ({ createSocket: jest.fn() }),
      () => ({ Socket: HostnameFailingSocket }),
    );

    const result = await DNSService.testTransport("test", "tcp", "llm.pieter.com");

    expect(result).toBe("tcp native");
    expect(nativeDNS.queryTXTTCP).toHaveBeenCalledWith(
      "llm.pieter.com",
      "test.llm.pieter.com",
      53,
    );
  });
});
