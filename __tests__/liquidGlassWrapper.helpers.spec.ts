jest.mock("expo-glass-effect", () => ({
  isGlassEffectAPIAvailable: jest.fn(() => true),
  isLiquidGlassAvailable: jest.fn(() => true),
}));

import { buildFallbackStyle } from "../src/components/LiquidGlassWrapper";
import { splitGlassStyles } from "../src/components/glass/glassStyleUtils";

describe("LiquidGlassWrapper helpers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("computes iMessage-inspired fallback styling for dark interactive elements", () => {
    const style = buildFallbackStyle("interactive", true, "capsule");

    expect(style.backgroundColor.replace(/\s/g, "")).toBe(
      "rgba(10,132,255,0.40)",
    );
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
