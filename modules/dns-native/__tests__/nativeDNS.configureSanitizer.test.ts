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

  const flushConfiguration = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  };

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
    const configureSanitizer = jest.fn().mockRejectedValue(error);
    nativeModulesRecord["RNDNSModule"] = {
      configureSanitizer,
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
    expect(configureSanitizer).toHaveBeenCalledTimes(1);
  });

  it("retries transient sanitizer configuration failures on a later query", async () => {
    const transientError = new Error("Native bridge is starting");
    const configureSanitizer = jest
      .fn()
      .mockRejectedValueOnce(transientError)
      .mockResolvedValueOnce(true);
    const queryTXT = jest.fn().mockResolvedValue(["ok"]);
    const dns = new NativeDNS({
      configureSanitizer,
      queryTXT,
      isAvailable: jest.fn().mockResolvedValue({
        available: true,
        platform: "android",
        supportsCustomServer: true,
        supportsAsyncQuery: true,
        apiLevel: 34,
      }),
    });

    await flushConfiguration();

    await expect(dns.queryTXT("llm.pieter.com", "hello.llm.pieter.com", 53)).resolves.toEqual(["ok"]);
    expect(configureSanitizer).toHaveBeenCalledTimes(2);
    expect(queryTXT).toHaveBeenCalledTimes(1);
  });

  it("shares one in-flight retry across concurrent queries", async () => {
    let resolveRetry!: (didUpdate: boolean) => void;
    const retryPromise = new Promise<boolean>((resolve) => {
      resolveRetry = resolve;
    });
    const configureSanitizer = jest
      .fn()
      .mockRejectedValueOnce(new Error("Native bridge is starting"))
      .mockReturnValueOnce(retryPromise);
    const queryTXT = jest.fn().mockResolvedValue(["ok"]);
    const dns = new NativeDNS({
      configureSanitizer,
      queryTXT,
      isAvailable: jest.fn().mockResolvedValue({
        available: true,
        platform: "android",
        supportsCustomServer: true,
        supportsAsyncQuery: true,
        apiLevel: 34,
      }),
    });

    await flushConfiguration();

    const firstQuery = dns.queryTXT("llm.pieter.com", "first.llm.pieter.com", 53);
    const secondQuery = dns.queryTXT("llm.pieter.com", "second.llm.pieter.com", 53);

    expect(configureSanitizer).toHaveBeenCalledTimes(2);
    resolveRetry(true);

    await expect(Promise.all([firstQuery, secondQuery])).resolves.toEqual([["ok"], ["ok"]]);
    expect(queryTXT).toHaveBeenCalledTimes(2);
  });
});
