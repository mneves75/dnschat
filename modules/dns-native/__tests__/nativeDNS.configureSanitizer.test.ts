import { NativeModules, Platform } from "react-native";

import { DNSErrorType, NativeDNS } from "../index";
import { getNativeSanitizerConfig } from "../constants";

describe("NativeDNS sanitizer configuration", () => {
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  const originalModule = NativeModules["RNDNSModule"];
  const originalPlatformOS = Platform.OS;
  const nativeModulesRecord = NativeModules as Record<string, unknown>;
  const platformRecord = Platform as unknown as Record<string, unknown>;
  const globalRecord = globalThis as Record<string, unknown>;

  beforeEach(() => {
    console.warn = jest.fn();
    console.log = jest.fn();
    platformRecord["OS"] = "android";
    globalRecord["__DNSCHAT_NATIVE_DEBUG__"] = true;
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
    nativeModulesRecord["RNDNSModule"] = originalModule;
    platformRecord["OS"] = originalPlatformOS;
    delete globalRecord["__DNSCHAT_NATIVE_DEBUG__"];
  });

  it("propagates sanitizer configuration and ignores duplicate payloads", async () => {
    const configureSanitizerMock = jest
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    nativeModulesRecord["RNDNSModule"] = {
      configureSanitizer: configureSanitizerMock,
      queryTXT: jest.fn(),
      isAvailable: jest.fn().mockResolvedValue({ available: true, platform: "android", supportsCustomServer: true, supportsAsyncQuery: true, apiLevel: 34 }),
    };

    const dns = new NativeDNS();
    await Promise.resolve();
    await Promise.resolve();

    expect(configureSanitizerMock).toHaveBeenCalledWith(getNativeSanitizerConfig());

    // Trigger second constructor invocation to ensure duplicate configs short-circuit gracefully.
    new NativeDNS();
    await Promise.resolve();
    await Promise.resolve();

    expect(configureSanitizerMock).toHaveBeenCalledTimes(2);
    expect(console.warn).not.toHaveBeenCalled();
    // prevent linter complaining about unused dns
    expect(dns).toBeInstanceOf(NativeDNS);
  });

  it("returns defensive sanitizer config copies", () => {
    const config = getNativeSanitizerConfig();
    config.allowedServers.pop();
    config.invalidChars.pattern = "mutated";

    const nextConfig = getNativeSanitizerConfig();
    expect(nextConfig.allowedServers).toContain("llm.pieter.com");
    expect(nextConfig.invalidChars.pattern).toBe("[^a-z0-9-]");
  });

  it("marks native DNS unavailable when sanitizer configuration fails", async () => {
    const error = Object.assign(new Error("Invalid regex"), { code: "SANITIZER_CONFIG_REGEX" });
    const queryTXT = jest.fn().mockResolvedValue(["ok"]);
    nativeModulesRecord["RNDNSModule"] = {
      configureSanitizer: jest.fn().mockRejectedValue(error),
      queryTXT,
      isAvailable: jest.fn().mockResolvedValue({ available: true, platform: "android", supportsCustomServer: true, supportsAsyncQuery: true, apiLevel: 34 }),
    };

    const dns = new NativeDNS();
    await Promise.resolve();
    await Promise.resolve();

    expect(console.warn).toHaveBeenCalledWith("[NativeDNS] Failed to configure sanitizer:", error);
    await expect(dns.queryTXT("llm.pieter.com", "hello.llm.pieter.com", 53)).rejects.toMatchObject({
      type: DNSErrorType.PLATFORM_UNSUPPORTED,
      message: "Native DNS sanitizer configuration failed",
    });
    await expect(dns.isAvailable()).resolves.toMatchObject({
      available: false,
      platform: "android",
    });
    expect(queryTXT).not.toHaveBeenCalled();
  });
});
