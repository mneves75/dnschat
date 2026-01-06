/**
 * NativeDNS Capabilities TTL Tests
 *
 * Tests for the capabilities caching mechanism with TTL-based invalidation.
 * SECURITY: TTL prevents stale network configuration from persisting forever.
 * 30 seconds is long enough to avoid repeated native calls but short enough
 * to detect network changes (e.g., WiFi to cellular, VPN connection).
 */

import { NativeModules, Platform } from "react-native";
import { NativeDNS } from "../index";

describe("NativeDNS capabilities TTL", () => {
  const originalModule = NativeModules["RNDNSModule"];
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  const originalDateNow = Date.now;

  let mockIsAvailable: jest.Mock;
  let currentTime: number;

  beforeEach(() => {
    console.warn = jest.fn();
    console.log = jest.fn();
    currentTime = 1000000;
    Date.now = jest.fn(() => currentTime);
    (Platform as any).OS = "ios";
    (globalThis as any).__DNSCHAT_NATIVE_DEBUG__ = true;

    mockIsAvailable = jest.fn().mockResolvedValue({
      available: true,
      platform: "ios",
      supportsCustomServer: true,
      supportsAsyncQuery: true,
    });

    (NativeModules as any)["RNDNSModule"] = {
      queryTXT: jest.fn(),
      isAvailable: mockIsAvailable,
    };
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
    Date.now = originalDateNow;
    NativeModules["RNDNSModule"] = originalModule;
    delete (globalThis as any).__DNSCHAT_NATIVE_DEBUG__;
  });

  it("caches capabilities within TTL window", async () => {
    const dns = new NativeDNS();

    // First call should hit native module
    const result1 = await dns.isAvailable();
    expect(mockIsAvailable).toHaveBeenCalledTimes(1);
    expect(result1.available).toBe(true);

    // Advance time by 10 seconds (within 30s TTL)
    currentTime += 10000;

    // Second call should return cached value
    const result2 = await dns.isAvailable();
    expect(mockIsAvailable).toHaveBeenCalledTimes(1); // Still 1 call
    expect(result2).toEqual(result1);

    // Advance time by another 15 seconds (still within TTL)
    currentTime += 15000;

    // Third call should still return cached value
    const result3 = await dns.isAvailable();
    expect(mockIsAvailable).toHaveBeenCalledTimes(1); // Still 1 call
    expect(result3).toEqual(result1);
  });

  it("refreshes capabilities after TTL expires", async () => {
    const dns = new NativeDNS();

    // First call
    const result1 = await dns.isAvailable();
    expect(mockIsAvailable).toHaveBeenCalledTimes(1);

    // Advance time past TTL (31 seconds)
    currentTime += 31000;

    // Update mock to return different capabilities
    mockIsAvailable.mockResolvedValue({
      available: true,
      platform: "ios",
      supportsCustomServer: false, // Changed
      supportsAsyncQuery: true,
    });

    // Second call should hit native module again
    const result2 = await dns.isAvailable();
    expect(mockIsAvailable).toHaveBeenCalledTimes(2);
    expect(result2.supportsCustomServer).toBe(false);
  });

  it("invalidateCapabilities forces refresh on next call", async () => {
    const dns = new NativeDNS();

    // First call
    await dns.isAvailable();
    expect(mockIsAvailable).toHaveBeenCalledTimes(1);

    // Advance time by only 5 seconds (well within TTL)
    currentTime += 5000;

    // Invalidate cache
    dns.invalidateCapabilities();

    // Update mock
    mockIsAvailable.mockResolvedValue({
      available: false,
      platform: "ios",
      supportsCustomServer: false,
      supportsAsyncQuery: false,
    });

    // Next call should hit native module despite being within TTL
    const result = await dns.isAvailable();
    expect(mockIsAvailable).toHaveBeenCalledTimes(2);
    expect(result.available).toBe(false);
  });

  it("handles native module errors gracefully", async () => {
    mockIsAvailable.mockRejectedValue(new Error("Network unavailable"));

    const dns = new NativeDNS();
    const result = await dns.isAvailable();

    // Should return fallback capabilities
    expect(result.available).toBe(false);
    expect(result.platform).toBe("web");
    expect(console.warn).toHaveBeenCalledWith(
      "Failed to check DNS availability:",
      expect.any(Error)
    );
  });

  it("returns web fallback when native module is unavailable", async () => {
    (NativeModules as any)["RNDNSModule"] = null;

    const dns = new NativeDNS();
    const result = await dns.isAvailable();

    expect(result).toEqual({
      available: false,
      platform: "web",
      supportsCustomServer: false,
      supportsAsyncQuery: false,
    });
  });

  it("resetCapabilities clears cached capabilities", async () => {
    const dns = new NativeDNS();

    // First call caches capabilities
    await dns.isAvailable();
    expect(mockIsAvailable).toHaveBeenCalledTimes(1);

    // Reset capabilities (legacy method, doesn't reset timestamp)
    dns.resetCapabilities();

    // The next call should re-fetch because capabilities is null
    await dns.isAvailable();
    expect(mockIsAvailable).toHaveBeenCalledTimes(2);
  });

  it("TTL is exactly 30 seconds", async () => {
    const dns = new NativeDNS();

    // First call
    await dns.isAvailable();
    expect(mockIsAvailable).toHaveBeenCalledTimes(1);

    // Advance time by exactly 29999ms (just under TTL)
    currentTime += 29999;
    await dns.isAvailable();
    expect(mockIsAvailable).toHaveBeenCalledTimes(1); // Should still be cached

    // Advance by 2ms more (now 30001ms total, past TTL)
    currentTime += 2;
    await dns.isAvailable();
    expect(mockIsAvailable).toHaveBeenCalledTimes(2); // Should refresh
  });
});
