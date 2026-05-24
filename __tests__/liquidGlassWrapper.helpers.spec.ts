import { Platform } from "react-native";

jest.mock("expo-glass-effect", () => ({
  isLiquidGlassAvailable: jest.fn(() => true),
}));

import {
  buildFallbackStyle,
  shouldUseGlassEffect,
} from "../src/components/LiquidGlassWrapper";
import { splitGlassStyles } from "../src/components/glass/glassStyleUtils";

const { isLiquidGlassAvailable } = require("expo-glass-effect") as {
  isLiquidGlassAvailable: jest.Mock<boolean, []>;
};

const setPlatform = (os: string, version?: string | number) => {
  const osDescriptor = Object.getOwnPropertyDescriptor(Platform, "OS");
  const versionDescriptor = Object.getOwnPropertyDescriptor(Platform, "Version");

  Object.defineProperty(Platform, "OS", {
    configurable: true,
    get: () => os,
  });

  if (typeof version !== "undefined") {
    Object.defineProperty(Platform, "Version", {
      configurable: true,
      get: () => version,
    });
  }

  return () => {
    if (osDescriptor) {
      Object.defineProperty(Platform, "OS", osDescriptor);
    }

    if (typeof version !== "undefined") {
      if (versionDescriptor) {
        Object.defineProperty(Platform, "Version", versionDescriptor);
      } else {
        delete (Platform as unknown as Record<string, unknown>)["Version"];
      }
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

  it("enables glass heuristically on iOS 26 when Expo API returns false", () => {
    const restore = setPlatform("ios", "26.1");
    isLiquidGlassAvailable.mockReturnValue(false);

    expect(shouldUseGlassEffect(false)).toBe(true);

    restore();
  });

  it("keeps glass disabled on pre-iOS 26 when Expo API returns false", () => {
    const restore = setPlatform("ios", "25.4");
    isLiquidGlassAvailable.mockReturnValue(false);

    expect(shouldUseGlassEffect(false)).toBe(false);

    restore();
  });

  it("splits border and shadow styles away from the native glass view", () => {
    const { containerStyle, glassStyle } = splitGlassStyles({
      margin: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: "#fff",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      borderRadius: 20,
      height: 120,
      flexGrow: 1,
    });

    expect(containerStyle.margin).toBe(12);
    expect(containerStyle.borderWidth).toBe(2);
    expect(containerStyle.shadowColor).toBe("#000");
    expect(containerStyle.borderRadius).toBe(20);
    expect(containerStyle.height).toBe(120);
    expect(containerStyle.flexGrow).toBe(1);

    expect(glassStyle.padding).toBe(16);
    expect(glassStyle.borderWidth).toBeUndefined();
    expect(glassStyle.shadowColor).toBeUndefined();
    expect(glassStyle.borderRadius).toBe(20);
    expect(glassStyle.height).toBe(120);
    expect(glassStyle.flexGrow).toBe(1);
  });
});
