import fs from "node:fs";

describe("Toast reduce-motion policy", () => {
  const source = fs.readFileSync("src/components/ui/Toast.tsx", "utf8");

  it("uses the shared accessibility hook and bypasses spring/timing animation when motion is reduced", () => {
    expect(source).toContain('useMotionReduction');
    expect(source).toContain('const { shouldReduceMotion } = useMotionReduction();');
    expect(source).toContain('if (shouldReduceMotion) {');
    expect(source).toContain('translateY.value = hiddenTranslateY;');
    expect(source).toContain('opacity.value = 0;');
    expect(source).toContain('translateY.value = 0;');
    expect(source).toContain('opacity.value = 1;');
  });
});
