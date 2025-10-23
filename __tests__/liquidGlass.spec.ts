/**
 * Comprehensive tests for iOS 26 Liquid Glass integration with expo-glass-effect
 *
 * Tests verify:
 * - Official expo-glass-effect API integration
 * - Platform detection and graceful fallbacks
 * - Accessibility support (reduce transparency)
 * - Capability detection with memoization
 * - Performance limits per device tier
 * - Type safety with official GlassStyle types
 *
 * @author DNSChat Team
 * @since 2.2.0 (Migrated to expo-glass-effect)
 */

import { Platform } from "react-native";

describe("Liquid Glass with expo-glass-effect (iOS)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Override Platform.OS for iOS-specific tests
    // @ts-ignore - necessary for test environment
    Platform.OS = "ios";
  });

  describe("iOS 26+ Full Support", () => {
    it("should report full support on iOS 26.0+", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "26.0"),
          getModel: jest.fn(async () => "iPhone17,1"),
        },
      }));
      // Mock expo-glass-effect as available
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => true),
        GlassView: "GlassView",
        GlassContainer: "GlassContainer",
      }));

      const utils = await import("../src/utils/liquidGlass");
      const caps = await utils.getLiquidGlassCapabilities();

      // Core capabilities
      expect(caps.isSupported).toBe(true);
      expect(caps.apiLevel).toBe(260);
      expect(caps.platform).toBe("ios");

      // Feature availability
      expect(caps.features.basicGlass).toBe(true);
      expect(caps.features.interactiveGlass).toBe(true);
      expect(caps.features.glassContainer).toBe(true);
      expect(caps.features.reduceTransparency).toBe(true);

      // Performance tier
      expect(caps.performance.tier).toBe("high");
      expect(caps.performance.maxGlassElements).toBe(10); // Conservative Apple limit
      expect(caps.performance.supports60fps).toBe(true);

      // Device info
      expect(caps.device.family).toBe("iPhone");
      expect(caps.device.memoryProfile).toBe("high");
    });

    it("should detect iOS 26.1 correctly", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "26.1"),
          getModel: jest.fn(async () => "iPhone17,1"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => true),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const caps = await utils.getLiquidGlassCapabilities();

      expect(caps.apiLevel).toBe(261);
      expect(caps.isSupported).toBe(true);
    });

    it("should use expo-glass-effect isLiquidGlassAvailable for detection", async () => {
      jest.resetModules();
      const mockIsAvailable = jest.fn(() => true);
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "26.0"),
          getModel: jest.fn(async () => "iPhone17,1"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: mockIsAvailable,
      }));

      const utils = await import("../src/utils/liquidGlass");
      const caps = await utils.getLiquidGlassCapabilities();

      // Should call expo-glass-effect for detection
      expect(mockIsAvailable).toHaveBeenCalled();
      expect(caps.isSupported).toBe(true);
    });
  });

  describe("iOS < 26 Fallback Behavior", () => {
    it("should gracefully handle iOS 17.x without Liquid Glass", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "17.0"),
          getModel: jest.fn(async () => "iPhone15,3"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => false),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const caps = await utils.getLiquidGlassCapabilities();

      expect(caps.isSupported).toBe(false);
      expect(caps.apiLevel).toBe(170);
      expect(caps.features.basicGlass).toBe(false);
      expect(caps.performance.tier).toBe("medium");
      expect(caps.performance.maxGlassElements).toBe(5);
      expect(caps.features.reduceTransparency).toBe(true); // Always available
    });

    it("should handle iOS 16.x with minimal glass support", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "16.4"),
          getModel: jest.fn(async () => "iPhone14,7"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => false),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const caps = await utils.getLiquidGlassCapabilities();

      expect(caps.isSupported).toBe(false);
      expect(caps.apiLevel).toBe(164);
      expect(caps.features.basicGlass).toBe(false);
      expect(caps.performance.tier).toBe("low");
      expect(caps.performance.maxGlassElements).toBe(3); // Strict limit
      expect(caps.performance.supports60fps).toBe(false);
    });
  });

  describe("Official expo-glass-effect GlassStyle Types", () => {
    it("should return official expo-glass-effect GlassStyle values", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "26.0"),
          getModel: jest.fn(async () => "iPhone17,1"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => true),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const style = await utils.getOptimalGlassStyle();

      // expo-glass-effect only supports 'clear' | 'regular'
      expect(style).toBe("regular");
      expect(["clear", "regular"]).toContain(style);
    });

    it("should NOT return deprecated custom material types", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "26.0"),
          getModel: jest.fn(async () => "iPhone17,1"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => true),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const style = await utils.getOptimalGlassStyle();

      // These types are deprecated and should NOT be returned
      expect(style).not.toBe("systemMaterial");
      expect(style).not.toBe("systemThinMaterial");
      expect(style).not.toBe("hudMaterial");
    });
  });

  describe("Capability Validation", () => {
    it("should validate configs within device limits", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "26.0"),
          getModel: jest.fn(async () => "iPhone17,1"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => true),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const result = await utils.validateGlassConfig({
        style: "regular",
        elementCount: 8, // Within iOS 26+ limit of 10
      });

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
      expect(result.recommendations).toHaveLength(0);
    });

    it("should warn when exceeding device glass element limits", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "16.0"),
          getModel: jest.fn(async () => "iPhone14,5"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => false),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const result = await utils.validateGlassConfig({
        style: "regular",
        elementCount: 10, // Exceeds iOS 16 limit of 3
      });

      expect(result.isValid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain("exceeds device limit");
      expect(result.recommendations[0]).toContain("Reduce glass elements");
    });

    it("should provide recommendations for unsupported platforms", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "16.0"),
          getModel: jest.fn(async () => "iPhone14,5"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => false),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const result = await utils.validateGlassConfig({
        style: "regular",
        elementCount: 5,
      });

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(
        "Liquid Glass not supported, will fall back to standard styling"
      );
      expect(result.recommendations).toContain(
        "Test fallback appearance on iOS < 26 and other platforms"
      );
    });
  });

  describe("Device Family Detection", () => {
    it("should detect iPad with high memory profile", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "26.0"),
          getModel: jest.fn(async () => "iPad Pro"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => true),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const caps = await utils.getLiquidGlassCapabilities();

      expect(caps.device.family).toBe("iPad");
      expect(caps.device.memoryProfile).toBe("high");
    });

    it("should detect Mac with high memory profile", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "26.0"),
          getModel: jest.fn(async () => "MacBook Pro"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => true),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const caps = await utils.getLiquidGlassCapabilities();

      expect(caps.device.family).toBe("Mac");
      expect(caps.device.memoryProfile).toBe("high");
    });

    it("should detect Apple Watch with low memory profile", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "26.0"),
          getModel: jest.fn(async () => "Apple Watch"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => true),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const caps = await utils.getLiquidGlassCapabilities();

      expect(caps.device.family).toBe("AppleWatch");
      expect(caps.device.memoryProfile).toBe("low");
    });
  });

  describe("Version Parsing Edge Cases", () => {
    it("should safely parse malformed version strings", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "bogus"),
          getModel: jest.fn(async () => "iPhone14,7"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => false),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const caps = await utils.getLiquidGlassCapabilities();

      // Should fall back to iOS 16.0
      expect(caps.apiLevel).toBe(160);
    });

    it("should handle empty version strings", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => ""),
          getModel: jest.fn(async () => "iPhone14,7"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => false),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const caps = await utils.getLiquidGlassCapabilities();

      // Should fall back to iOS 16.0
      expect(caps.apiLevel).toBe(160);
    });

    it("should handle DeviceInfo API errors gracefully", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn().mockRejectedValue(new Error("API Error")),
          getModel: jest.fn().mockRejectedValue(new Error("API Error")),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => false),
      }));

      const utils = await import("../src/utils/liquidGlass");
      const caps = await utils.getLiquidGlassCapabilities();

      // Should still return valid capabilities
      expect(caps).toBeDefined();
      expect(caps.platform).toBe("ios");
      // Should fall back to Platform.Version
      expect(caps.apiLevel).toBeGreaterThanOrEqual(160);
    });
  });

  describe("isLiquidGlassSupported Wrapper", () => {
    it("should return true for iOS 26+ with expo-glass-effect available", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "26.0"),
          getModel: jest.fn(async () => "iPhone17,1"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => true),
      }));

      const utils = await import("../src/utils/liquidGlass");
      expect(utils.isLiquidGlassSupported()).toBe(true);
    });

    it("should return false for iOS < 26", async () => {
      jest.resetModules();
      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: jest.fn(async () => "16.0"),
          getModel: jest.fn(async () => "iPhone14,5"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => false),
      }));

      const utils = await import("../src/utils/liquidGlass");
      expect(utils.isLiquidGlassSupported()).toBe(false);
    });

    it("should return false for non-iOS platforms", async () => {
      // @ts-ignore - override for test
      Platform.OS = "android";
      jest.resetModules();
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => false),
      }));

      const utils = await import("../src/utils/liquidGlass");
      expect(utils.isLiquidGlassSupported()).toBe(false);
    });
  });

  describe("Performance and Caching", () => {
    it("should cache capabilities for performance", async () => {
      jest.resetModules();
      const mockGetSystemVersion = jest.fn(async () => "26.0");
      const mockGetModel = jest.fn(async () => "iPhone17,1");

      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: mockGetSystemVersion,
          getModel: mockGetModel,
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => true),
      }));

      const utils = await import("../src/utils/liquidGlass");

      // First call
      const first = await utils.getLiquidGlassCapabilities();
      // Second call should use cache
      const second = await utils.getLiquidGlassCapabilities();

      // Should be the same object (cached)
      expect(first).toBe(second);

      // DeviceInfo should only be called once (for first call)
      expect(mockGetSystemVersion).toHaveBeenCalledTimes(1);
      expect(mockGetModel).toHaveBeenCalledTimes(1);
    });

    it("should refresh capabilities on demand", async () => {
      jest.resetModules();
      const mockGetSystemVersion = jest.fn(async () => "26.0");

      jest.doMock("react-native-device-info", () => ({
        __esModule: true,
        default: {
          getSystemVersion: mockGetSystemVersion,
          getModel: jest.fn(async () => "iPhone17,1"),
        },
      }));
      jest.doMock("expo-glass-effect", () => ({
        isLiquidGlassAvailable: jest.fn(() => true),
      }));

      const utils = await import("../src/utils/liquidGlass");

      // First call
      await utils.getLiquidGlassCapabilities();
      // Refresh should re-detect
      await utils.refreshLiquidGlassCapabilities();

      // Should be called twice (original + refresh)
      expect(mockGetSystemVersion).toHaveBeenCalledTimes(2);
    });
  });
});
