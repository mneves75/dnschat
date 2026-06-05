import fs from "node:fs";

describe("Toast reduce-motion policy", () => {
  const source = fs.readFileSync("src/components/ui/Toast.tsx", "utf8");

  it("uses the shared accessibility hook and bypasses spring/timing animation when motion is reduced", () => {
    expect(source).toContain('useMotionReduction');
    expect(source).toContain('const { shouldReduceMotion } = useMotionReduction();');
    expect(source).toContain('if (shouldReduceMotion) {');
    expect(source).toContain('translateY.set(hiddenTranslateY);');
    expect(source).toContain('opacity.set(0);');
    expect(source).toContain('translateY.set(0);');
    expect(source).toContain('opacity.set(1);');
  });

  it("keeps error toasts persistent and untruncated", () => {
    expect(source).toContain('const autoDismissDuration = variant === "error" ? 0 : duration;');
    expect(source).toContain('variant === "error" ? {} : ({ numberOfLines: 1 } as const)');
    expect(source).toContain('variant === "error" ? {} : ({ numberOfLines: 2 } as const)');
    expect(source).toContain("{...titleTruncationProps}");
    expect(source).toContain("{...messageTruncationProps}");
  });

  it("bounds scaling for fixed-size toast glyph controls", () => {
    expect(source).toContain("FIXED_GLYPH_MAX_FONT_SCALE");
    expect(source).toContain("maxFontSizeMultiplier={FIXED_GLYPH_MAX_FONT_SCALE}");
  });

  it("draws chroma-fill labels from the palette token instead of a hardcoded literal", () => {
    expect(source).not.toContain("#000000");
    expect(source).toContain("palette.textOnChroma");
  });
});
