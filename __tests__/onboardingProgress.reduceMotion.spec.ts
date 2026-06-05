import fs from "fs";
import path from "path";

describe("OnboardingProgress reduce motion policy", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../src/components/onboarding/OnboardingProgress.tsx"),
    "utf8",
  );

  it("snaps progress changes when Reduce Motion is enabled", () => {
    expect(source).toContain("useMotionReduction");
    expect(source).toContain("shouldReduceMotion");
    expect(source).toContain("animatedWidth.setValue(progress)");
    expect(source).toContain("duration: 300");
  });
});
