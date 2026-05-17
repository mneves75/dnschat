import fs from "node:fs";

describe("GlassFormItem contract", () => {
  const source = fs.readFileSync("src/components/glass/GlassForm.tsx", "utf8");

  it("forwards testID and accessibility metadata for non-pressable items", () => {
    expect(source).toContain("testID={onPress ? undefined : testID}");
    expect(source).toContain("accessible={!onPress && Boolean(accessibilityLabel || accessibilityHint)}");
    expect(source).toContain("accessibilityLabel={!onPress ? accessibilityLabel : undefined}");
    expect(source).toContain("accessibilityHint={!onPress ? accessibilityHint : undefined}");
  });
});
