import { AndroidStartupDiagnostics } from "../src/utils/androidStartupDiagnostics";

describe("AndroidStartupDiagnostics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  describe("runDiagnostics", () => {
    it("should return empty results for non-Android platforms", async () => {
      const originalPlatform = require("react-native").Platform;
      require("react-native").Platform = { OS: "ios" };

      const results = await AndroidStartupDiagnostics.runDiagnostics();
      expect(results).toEqual([]);

      require("react-native").Platform = originalPlatform;
    });

    it("should run diagnostics on Android", async () => {
      const originalPlatform = require("react-native").Platform;
      const originalNativeModules = require("react-native").NativeModules;

      require("react-native").Platform = { OS: "android" };
      require("react-native").NativeModules = {
        RNDNSModule: {
          queryTXT: jest.fn(),
          isAvailable: jest.fn(),
        },
        RNGestureHandlerModule: {},
        RNCSafeAreaProvider: {},
      };

      const results = await AndroidStartupDiagnostics.runDiagnostics();

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.name === "DNS Native Module")).toBe(true);

      require("react-native").Platform = originalPlatform;
      require("react-native").NativeModules = originalNativeModules;
    });

    it("should detect missing DNS module", async () => {
      const originalPlatform = require("react-native").Platform;
      const originalNativeModules = require("react-native").NativeModules;

      require("react-native").Platform = { OS: "android" };
      require("react-native").NativeModules = {};

      const results = await AndroidStartupDiagnostics.runDiagnostics();

      const dnsCheck = results.find((r) => r.name === "DNS Native Module");
      expect(dnsCheck).toBeDefined();
      expect(dnsCheck?.status).toBe("fail");

      require("react-native").Platform = originalPlatform;
      require("react-native").NativeModules = originalNativeModules;
    });
  });

  describe("logging", () => {
    it("should log messages with prefix", () => {
      AndroidStartupDiagnostics.log("Test message");
      expect(console.log).toHaveBeenCalledWith(
        "[AndroidStartupDiagnostics] Test message",
        "",
      );
    });

    it("should error log with prefix", () => {
      AndroidStartupDiagnostics.error("Test error");
      expect(console.error).toHaveBeenCalledWith(
        "[AndroidStartupDiagnostics] ❌ Test error",
        "",
      );
    });

    it("should warn log with prefix", () => {
      AndroidStartupDiagnostics.warn("Test warning");
      expect(console.warn).toHaveBeenCalledWith(
        "[AndroidStartupDiagnostics] ⚠️ Test warning",
        "",
      );
    });
  });

  describe("printSummary", () => {
    it("should print summary of results", () => {
      AndroidStartupDiagnostics.runDiagnostics().then(() => {
        AndroidStartupDiagnostics.printSummary();
        expect(console.log).toHaveBeenCalled();
      });
    });
  });
});

