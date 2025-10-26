import { Platform } from "react-native";

jest.mock("expo-glass-effect", () => ({
  isLiquidGlassAvailable: jest.fn(() => true),
}));

import {
  buildFallbackStyle,
  shouldUseGlassEffect,
} from "../src/components/LiquidGlassWrapper";

const { isLiquidGlassAvailable } = require("expo-glass-effect") as {
  isLiquidGlassAvailable: jest.Mock<boolean, []>;
};

const setPlatform = (os: string) => {
  const descriptor = Object.getOwnPropertyDescriptor(Platform, "OS");
  Object.defineProperty(Platform, "OS", {
    configurable: true,
    get: () => os,
  });
  return () => {
    if (descriptor) {
      Object.defineProperty(Platform, "OS", descriptor);
    }
  };
};

  describe("LiquidGlassWrapper helpers", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("computes iMessage-inspired fallback styling for dark interactive elements", () => {
      const style = buildFallbackStyle("interactive", true, "capsule");

      expect(style.backgroundColor.replace(/\s/g, "")).toBe("rgba(10,132,255,0.40)");
      expect(style.borderColor.replace(/\s/g, "")).toBe("rgba(10,132,255,0.55)");
      expect(style.borderRadius).toBe(24);
    });

    it("forces a solid fallback when reduce transparency is enabled", () => {
      const style = buildFallbackStyle(
        "regular",
        true,
        "roundedRect",
        undefined,
        false,
        { forceOpaque: true },
      );

      expect(style.backgroundColor.replace(/\s/g, "")).toBe("rgb(44,44,46)");
      expect(style.borderColor.replace(/\s/g, "")).toBe("rgb(235,235,245)");
    });

    it("forces an opaque accent fallback for interactive variants", () => {
      const style = buildFallbackStyle(
        "interactive",
        false,
        "capsule",
        undefined,
        true,
        { forceOpaque: true },
      );

      expect(style.backgroundColor.replace(/\s/g, "")).toBe("rgb(10,132,255)");
      expect(style.borderColor.replace(/\s/g, "")).toBe("rgb(10,132,255)");
    });

    it("returns true when Liquid Glass is available on iOS", () => {
      const restore = setPlatform("ios");
      isLiquidGlassAvailable.mockReturnValue(true);

    expect(shouldUseGlassEffect(false)).toBe(true);

    restore();
  });

  it("disables glass when reduce transparency is active", () => {
    const restore = setPlatform("ios");
    isLiquidGlassAvailable.mockReturnValue(true);

    expect(shouldUseGlassEffect(true)).toBe(false);

    restore();
  });

  it("falls back on non-iOS platforms", () => {
    const restore = setPlatform("android");
    isLiquidGlassAvailable.mockReturnValue(true);

    expect(shouldUseGlassEffect(false)).toBe(false);

    restore();
  });
});
