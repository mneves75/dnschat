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

// Mock modules/dns-native
jest.mock("../modules/dns-native", () => ({
  nativeDNS: { queryTXT: jest.fn() },
  DNSError: class extends Error {},
  DNSErrorType: {},
}));

// Import after mocking
import { DNSService } from "../src/services/dnsService";

const mockAddEventListener = AppState.addEventListener as jest.Mock;

describe("DNSService AppState Listener Singleton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton state between tests
    DNSService.destroyBackgroundListener();
  });

  it("initializes AppState listener only once", () => {
    // Call initialize multiple times
    DNSService.initialize();
    DNSService.initialize();
    DNSService.initialize();

    // Should only register listener once
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
    expect(mockAddEventListener).toHaveBeenCalledWith("change", expect.any(Function));
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
