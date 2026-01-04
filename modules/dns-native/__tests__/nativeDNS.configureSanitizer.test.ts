import { NativeModules, Platform } from "react-native";

import { NativeDNS } from "../index";
import { getNativeSanitizerConfig } from "../constants";

describe("NativeDNS sanitizer configuration", () => {
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  const originalModule = NativeModules['RNDNSModule'];

  beforeEach(() => {
    console.warn = jest.fn();
    console.log = jest.fn();
    (Platform as any).OS = "android";
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
    NativeModules['RNDNSModule'] = originalModule;
  });

  it("propagates sanitizer configuration and ignores duplicate payloads", async () => {
    const configureSanitizerMock = jest
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    (NativeModules as any)["RNDNSModule"] = {
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

  it("logs a warning when sanitizer configuration fails", async () => {
    const error = Object.assign(new Error("Invalid regex"), { code: "SANITIZER_CONFIG_REGEX" });
    (NativeModules as any)["RNDNSModule"] = {
      configureSanitizer: jest.fn().mockRejectedValue(error),
      queryTXT: jest.fn(),
      isAvailable: jest.fn().mockResolvedValue({ available: true, platform: "android", supportsCustomServer: true, supportsAsyncQuery: true, apiLevel: 34 }),
    };

    new NativeDNS();
    await Promise.resolve();
    await Promise.resolve();

    expect(console.warn).toHaveBeenCalledWith("[NativeDNS] Failed to configure Android sanitizer:", error);
  });
});
