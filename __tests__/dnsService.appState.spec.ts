/**
 * DNSService AppState Listener Tests
 *
 * These tests verify that the AppState listener follows the singleton pattern
 * to prevent memory leaks from multiple listener registrations.
 */

import { AppState, Platform } from "react-native";

// Mock react-native before importing DNSService
jest.mock("react-native", () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Platform: {
    OS: "ios",
  },
  NativeModules: {
    ScreenshotModeModule: null,
  },
}));

// Mock dns-packet
jest.mock("dns-packet", () => ({}));

// Mock react-native-udp
jest.mock("react-native-udp", () => null);

// Mock react-native-tcp-socket
jest.mock("react-native-tcp-socket", () => null);

jest.mock("../src/utils/devLog", () => ({
  devLog: jest.fn(),
  devLogArgs: jest.fn(),
  devLogLazy: jest.fn(),
}));

// Mock modules/dns-native
jest.mock("../modules/dns-native", () => ({
  nativeDNS: {
    isAvailable: jest.fn().mockResolvedValue({
      available: true,
      platform: "ios",
      supportsCustomServer: true,
      supportsAsyncQuery: true,
    }),
    queryTXT: jest.fn(),
    queryTXTUDP: jest.fn(),
    queryTXTTCP: jest.fn(),
    cancelActiveQueries: jest.fn().mockResolvedValue(0),
    parseMultiPartResponse: jest.fn((records: string[]) => records.join("")),
  },
  DNSError: class extends Error {},
  DNSErrorType: {},
  parseMultiPartTXTResponse: (records: string[]) => records.join(""),
  sanitizeLLMResponseText: (text: string) => text,
}));

// Import after mocking
import { DNSService } from "../src/services/dnsService";
import { nativeDNS } from "../modules/dns-native";
import { devLog } from "../src/utils/devLog";

const mockAddEventListener = AppState.addEventListener as jest.Mock;
const mockCancelActiveQueries = nativeDNS.cancelActiveQueries as jest.Mock;
const mockIsAvailable = nativeDNS.isAvailable as jest.Mock;
const mockQueryTXT = nativeDNS.queryTXT as jest.Mock;
const mockQueryTXTUDP = nativeDNS.queryTXTUDP as jest.Mock;
const mockQueryTXTTCP = nativeDNS.queryTXTTCP as jest.Mock;

const getAppStateHandler = (): ((state: string) => void) => {
  const handler = mockAddEventListener.mock.calls[0]?.[1] as unknown;
  if (typeof handler !== "function") {
    throw new Error("Expected AppState change handler to be registered");
  }
  return handler as (state: string) => void;
};

describe("DNSService AppState Listener Singleton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton state between tests
    DNSService.destroyBackgroundListener();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("initializes AppState listener only once", () => {
    // Call initialize multiple times
    DNSService.initialize();
    DNSService.initialize();
    DNSService.initialize();

    // Should only register listener once
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("cancels active native queries exactly once when backgrounded", async () => {
    DNSService.initialize();

    getAppStateHandler()("background");
    await Promise.resolve();

    expect(mockCancelActiveQueries).toHaveBeenCalledTimes(1);
  });

  it("does not cancel native queries when returning active", async () => {
    DNSService.initialize();

    getAppStateHandler()("active");
    await Promise.resolve();

    expect(mockCancelActiveQueries).not.toHaveBeenCalled();
  });

  it("contains cancellation rejection without retrying or throwing", async () => {
    mockCancelActiveQueries.mockRejectedValueOnce(
      new Error("sensitive query detail"),
    );
    DNSService.initialize();

    expect(() => getAppStateHandler()("background")).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();

    expect(mockCancelActiveQueries).toHaveBeenCalledTimes(1);
    expect(devLog).toHaveBeenCalledWith(
      "[DNSService] Failed to cancel active DNS queries while backgrounding",
    );
    expect(JSON.stringify((devLog as jest.Mock).mock.calls)).not.toContain(
      "sensitive query detail",
    );
  });

  it("does not fall back after a native query crosses background then active", async () => {
    let resolveNativeQuery!: (records: string[]) => void;
    mockQueryTXT.mockImplementationOnce(
      () =>
        new Promise<string[]>((resolve) => {
          resolveNativeQuery = resolve;
        }),
    );
    mockQueryTXTUDP.mockResolvedValueOnce(["unexpected UDP fallback"]);
    mockQueryTXTTCP.mockResolvedValueOnce(["unexpected TCP fallback"]);
    DNSService.initialize();

    const operation = DNSService.queryLLM(
      "background cancellation",
      "llm.pieter.com",
      false,
      true,
    );
    const outcome = operation.then(
      (value) => ({ status: "resolved" as const, value }),
      (error: unknown) => ({ status: "rejected" as const, error }),
    );
    await Promise.resolve();
    await Promise.resolve();
    expect(mockQueryTXT).toHaveBeenCalledTimes(1);
    expect(resolveNativeQuery).toEqual(expect.any(Function));

    getAppStateHandler()("background");
    getAppStateHandler()("active");
    resolveNativeQuery(["late native response"]);

    await expect(outcome).resolves.toMatchObject({
      status: "rejected",
      error: {
        message:
          "DNS query failed - app was backgrounded during network operation",
      },
    });
    expect(mockQueryTXTUDP).not.toHaveBeenCalled();
    expect(mockQueryTXTTCP).not.toHaveBeenCalled();
  });

  it("does not start queryTXT when capabilities cross background then active", async () => {
    let resolveCapabilities!: (capabilities: {
      available: boolean;
      platform: string;
      supportsCustomServer: boolean;
      supportsAsyncQuery: boolean;
    }) => void;
    mockIsAvailable.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCapabilities = resolve;
        }),
    );
    mockQueryTXT.mockResolvedValueOnce(["must not run"]);

    const operation = DNSService.queryLLM(
      "capabilities cancellation",
      "llm.pieter.com",
      false,
      true,
    );
    const outcome = operation.then(
      (value) => ({ status: "resolved" as const, value }),
      (error: unknown) => ({ status: "rejected" as const, error }),
    );
    await Promise.resolve();
    await Promise.resolve();
    expect(mockIsAvailable).toHaveBeenCalledTimes(1);
    expect(resolveCapabilities).toEqual(expect.any(Function));

    getAppStateHandler()("background");
    getAppStateHandler()("active");
    resolveCapabilities({
      available: true,
      platform: "ios",
      supportsCustomServer: true,
      supportsAsyncQuery: true,
    });

    await expect(outcome).resolves.toMatchObject({
      status: "rejected",
      error: {
        message:
          "DNS query failed - app was backgrounded during network operation",
      },
    });
    expect(mockQueryTXT).not.toHaveBeenCalled();
    expect(mockQueryTXTUDP).not.toHaveBeenCalled();
    expect(mockQueryTXTTCP).not.toHaveBeenCalled();
  });

  it("does not start a forced native query when capabilities cross background then active", async () => {
    let resolveCapabilities!: (capabilities: {
      available: boolean;
      platform: string;
      supportsCustomServer: boolean;
      supportsAsyncQuery: boolean;
    }) => void;
    mockIsAvailable.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCapabilities = resolve;
        }),
    );

    const operation = DNSService.testTransport(
      "forced capabilities cancellation",
      "native",
      "llm.pieter.com",
    );
    const outcome = operation.then(
      (value) => ({ status: "resolved" as const, value }),
      (error: unknown) => ({ status: "rejected" as const, error }),
    );
    await Promise.resolve();
    expect(mockIsAvailable).toHaveBeenCalledTimes(1);

    getAppStateHandler()("background");
    getAppStateHandler()("active");
    resolveCapabilities({
      available: true,
      platform: "ios",
      supportsCustomServer: true,
      supportsAsyncQuery: true,
    });

    await expect(outcome).resolves.toMatchObject({
      status: "rejected",
      error: {
        message:
          "DNS query failed - app was backgrounded during network operation",
      },
    });
    expect(mockQueryTXT).not.toHaveBeenCalled();
  });

  it("does not retry after background during backoff", async () => {
    let enterBackoff!: () => void;
    let releaseBackoff!: () => void;
    const backoffEntered = new Promise<void>((resolve) => {
      enterBackoff = resolve;
    });
    const dnsServiceInternals = DNSService as unknown as {
      sleep(ms: number): Promise<void>;
      tryMethod(...args: unknown[]): Promise<unknown>;
    };
    const sleepSpy = jest
      .spyOn(dnsServiceInternals, "sleep")
      .mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            releaseBackoff = resolve;
            enterBackoff();
          }),
      );
    const tryMethodSpy = jest
      .spyOn(dnsServiceInternals, "tryMethod")
      .mockRejectedValue(new Error("transport unavailable"));

    const operation = DNSService.queryLLM(
      "retry cancellation",
      "llm.pieter.com",
      false,
      true,
    );
    const outcome = operation.then(
      (value) => ({ status: "resolved" as const, value }),
      (error: unknown) => ({ status: "rejected" as const, error }),
    );
    await backoffEntered;
    expect(tryMethodSpy).toHaveBeenCalledTimes(3);

    getAppStateHandler()("background");
    getAppStateHandler()("active");
    releaseBackoff();

    await expect(outcome).resolves.toMatchObject({
      status: "rejected",
      error: {
        message:
          "DNS query failed - app was backgrounded during network operation",
      },
    });
    expect(tryMethodSpy).toHaveBeenCalledTimes(3);
    sleepSpy.mockRestore();
  });

  it("does not start or retry transports while already backgrounded", async () => {
    DNSService.initialize();
    getAppStateHandler()("background");

    await expect(
      DNSService.queryLLM(
        "background cancellation",
        "llm.pieter.com",
        false,
        true,
      ),
    ).rejects.toThrow(
      "DNS query failed - app was backgrounded during network operation",
    );
    expect(mockQueryTXT).not.toHaveBeenCalled();
    expect(mockQueryTXTUDP).not.toHaveBeenCalled();
    expect(mockQueryTXTTCP).not.toHaveBeenCalled();
  });

  it("allows re-initialization after destroy", () => {
    // Initialize
    DNSService.initialize();
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);

    // Destroy
    DNSService.destroyBackgroundListener();

    // Re-initialize
    DNSService.initialize();
    expect(mockAddEventListener).toHaveBeenCalledTimes(2);
  });

  it("destroyBackgroundListener removes the subscription", () => {
    const mockRemove = jest.fn();
    mockAddEventListener.mockReturnValue({ remove: mockRemove });

    DNSService.initialize();
    DNSService.destroyBackgroundListener();

    expect(mockRemove).toHaveBeenCalled();
  });

  it("destroyBackgroundListener is safe to call multiple times", () => {
    const mockRemove = jest.fn();
    mockAddEventListener.mockReturnValue({ remove: mockRemove });

    DNSService.initialize();
    DNSService.destroyBackgroundListener();
    DNSService.destroyBackgroundListener();
    DNSService.destroyBackgroundListener();

    // Should only call remove once (on the first destroy)
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it("destroyBackgroundListener handles remove() throwing", () => {
    const mockRemove = jest.fn(() => {
      throw new Error("Remove failed");
    });
    mockAddEventListener.mockReturnValue({ remove: mockRemove });

    DNSService.initialize();

    // Should not throw
    expect(() => DNSService.destroyBackgroundListener()).not.toThrow();
  });
});

describe("DNSService AppState Listener on Web", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    DNSService.destroyBackgroundListener();
    (Platform as { OS: string }).OS = "web";
  });

  afterEach(() => {
    (Platform as { OS: string }).OS = "ios";
  });

  it("skips AppState listener initialization on web", () => {
    DNSService.initialize();

    // Should not register listener on web (no AppState support)
    expect(mockAddEventListener).not.toHaveBeenCalled();
  });
});
