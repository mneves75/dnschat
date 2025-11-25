const {
  parseAdbDevices,
  resolveMetroPort,
  DEFAULT_PORT,
} = require("../scripts/utils/adbReverse");

describe("adbReverse utilities", () => {
  describe("parseAdbDevices", () => {
    it("returns an empty array when no devices are connected", () => {
      const output = "List of devices attached\n\n";
      expect(parseAdbDevices(output)).toEqual([]);
    });

    it("filters and returns connected devices only", () => {
      const output = [
        "List of devices attached",
        "emulator-5554\tdevice",
        "emulator-5556\toffline",
        "FAKE123456\tdevice",
        "",
      ].join("\n");

      expect(parseAdbDevices(output)).toEqual([
        "emulator-5554",
        "FAKE123456",
      ]);
    });
  });

  describe("resolveMetroPort", () => {
    it("prefers RCT_METRO_PORT when provided", () => {
      expect(resolveMetroPort({ RCT_METRO_PORT: "9090" })).toBe("9090");
    });

    it("falls back to EXPO_DEV_SERVER_PORT", () => {
      expect(resolveMetroPort({ EXPO_DEV_SERVER_PORT: "8083" })).toBe("8083");
    });

    it("defaults to 8081 when no env vars are set", () => {
      expect(resolveMetroPort({})).toBe(DEFAULT_PORT);
    });
  });
});
