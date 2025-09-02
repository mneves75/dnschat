import { Platform } from "react-native";

describe("Liquid Glass Capabilities (iOS)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // @ts-ignore - override mocked Platform in tests
    Platform.OS = "ios";
  });

  it("mocks DeviceInfo and Platform correctly", async () => {
    expect(Platform.OS).toBe("ios");
  });

  it("reports supported on iOS 26+", async () => {
    jest.resetModules();
    jest.doMock("react-native-device-info", () => ({
      __esModule: true,
      default: {
        getSystemVersion: jest.fn(async () => "26.1"),
        getModel: jest.fn(async () => "iPhone17,1"),
      },
    }));
    const utils = await import("../src/utils/liquidGlass");
    const caps = await utils.getLiquidGlassCapabilities();
    // Debug log to understand failure in CI
    // eslint-disable-next-line no-console
    console.log("DBG caps (26.1):", caps);
    expect(caps.isSupported).toBe(true);
    expect(caps.apiLevel).toBe(261);
    expect(caps.features.basicGlass).toBe(true);
    expect(caps.performance.tier).toBe("high");
  });

  it("reports not supported on iOS 16.x with fallback features", async () => {
    jest.resetModules();
    jest.doMock("react-native-device-info", () => ({
      __esModule: true,
      default: {
        getSystemVersion: jest.fn(async () => "16.4"),
        getModel: jest.fn(async () => "iPhone14,7"),
      },
    }));
    const utils = await import("../src/utils/liquidGlass");
    const caps = await utils.getLiquidGlassCapabilities();
    expect(caps.isSupported).toBe(false);
    expect(caps.apiLevel).toBe(164);
    expect(caps.features.basicGlass).toBe(false);
    expect(caps.performance.tier).toBe("low");
  });

  it("parses version strings safely and defaults to 160 on error", async () => {
    jest.resetModules();
    jest.doMock("react-native-device-info", () => ({
      __esModule: true,
      default: {
        getSystemVersion: jest.fn(async () => "bogus"),
        getModel: jest.fn(async () => "iPhone14,7"),
      },
    }));
    const utils = await import("../src/utils/liquidGlass");
    const caps = await utils.getLiquidGlassCapabilities();
    expect(caps.apiLevel).toBe(160);
  });

  it("recommends styles and intensities by tier", async () => {
    jest.resetModules();
    jest.doMock("react-native-device-info", () => ({
      __esModule: true,
      default: {
        getSystemVersion: jest.fn(async () => "26.0"),
        getModel: jest.fn(async () => "iPhone17,1"),
      },
    }));
    let utils = await import("../src/utils/liquidGlass");
    let style = await utils.getOptimalGlassStyle();
    let intensity = await utils.getRecommendedIntensity();
    expect(style).toBe("systemMaterial");
    expect(intensity).toBe("regular");

    jest.resetModules();
    jest.doMock("react-native-device-info", () => ({
      __esModule: true,
      default: {
        getSystemVersion: jest.fn(async () => "17.0"),
        getModel: jest.fn(async () => "iPhone15,3"),
      },
    }));
    utils = await import("../src/utils/liquidGlass");
    style = await utils.getOptimalGlassStyle();
    intensity = await utils.getRecommendedIntensity();
    expect(style).toBe("systemThinMaterial");
    expect(intensity).toBe("thin");

    jest.resetModules();
    jest.doMock("react-native-device-info", () => ({
      __esModule: true,
      default: {
        getSystemVersion: jest.fn(async () => "16.0"),
        getModel: jest.fn(async () => "iPhone14,4"),
      },
    }));
    utils = await import("../src/utils/liquidGlass");
    style = await utils.getOptimalGlassStyle();
    intensity = await utils.getRecommendedIntensity();
    expect(style).toBe("systemMaterial");
    expect(intensity).toBe("ultraThin");
  });

  it("validates config with warnings beyond limits", async () => {
    jest.resetModules();
    jest.doMock("react-native-device-info", () => ({
      __esModule: true,
      default: {
        getSystemVersion: jest.fn(async () => "16.0"),
        getModel: jest.fn(async () => "iPhone14,5"),
      },
    }));
    const utils = await import("../src/utils/liquidGlass");
    const result = await utils.validateGlassConfig({
      intensity: "ultraThick",
      style: "hudMaterial",
      elementCount: 10,
    });
    expect(result.isValid).toBe(false);
    expect(result.warnings.length).toBeGreaterThanOrEqual(1);
  });

  it("isLiquidGlassSupported reflects capability", async () => {
    jest.resetModules();
    jest.doMock("react-native-device-info", () => ({
      __esModule: true,
      default: {
        getSystemVersion: jest.fn(async () => "26.0"),
        getModel: jest.fn(async () => "iPhone17,1"),
      },
    }));
    let utils = await import("../src/utils/liquidGlass");
    expect(await utils.isLiquidGlassSupported()).toBe(true);
    jest.resetModules();
    jest.doMock("react-native-device-info", () => ({
      __esModule: true,
      default: {
        getSystemVersion: jest.fn(async () => "16.0"),
        getModel: jest.fn(async () => "iPhone14,5"),
      },
    }));
    utils = await import("../src/utils/liquidGlass");
    expect(await utils.isLiquidGlassSupported()).toBe(false);
  });
});
