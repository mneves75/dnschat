import fs from "node:fs";
import path from "node:path";

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");

describe("glass modal accessibility policy", () => {
  const bottomSheetSource = readSource("src/components/glass/GlassBottomSheet.tsx");
  const nativeBottomSheetSource = readSource("src/components/platform/NativeBottomSheet.tsx");

  it("treats native bottom sheets as modal accessibility scopes", () => {
    expect(nativeBottomSheetSource).toContain("accessibilityViewIsModal");
  });

  it("delegates backdrop and drag behavior to Expo UI instead of a custom modal layer", () => {
    expect(nativeBottomSheetSource).toContain("@expo/ui/community/bottom-sheet");
    expect(nativeBottomSheetSource).toContain("enablePanDownToClose: canDismissFromSheet");
    expect(bottomSheetSource).not.toContain("TouchableWithoutFeedback");
    expect(bottomSheetSource).not.toContain("PanGestureHandler");
    expect(bottomSheetSource).not.toContain("accessibilityElementsHidden");
  });

  it("gives close and action sheet controls accessible button metadata", () => {
    expect(nativeBottomSheetSource).toContain('accessibilityLabel={t("common.close")}');
    expect(bottomSheetSource).toContain('accessibilityRole="button"');
    expect(bottomSheetSource).toContain("accessibilityLabel={action.accessibilityLabel ?? action.title}");
    expect(bottomSheetSource).toContain("accessibilityState={{ disabled: action.disabled }}");
  });
});

describe("shared interactive control accessibility policy", () => {
  it("localizes the reusable text-input clear button", () => {
    const source = readSource("src/components/ui/LiquidGlassTextInput.tsx");
    expect(source).toContain('accessibilityLabel={t("common.clear")}');
  });

  it("announces text-input error guidance before helper guidance", () => {
    const source = readSource("src/components/ui/LiquidGlassTextInput.tsx");
    expect(source).toContain("textInputProps.accessibilityHint ?? errorText ?? helperText");
  });

  it("does not use placeholder text as the text input accessibility name", () => {
    const source = readSource("src/components/ui/LiquidGlassTextInput.tsx");
    expect(source).toContain("textInputProps.accessibilityLabel ?? label");
    expect(source).not.toContain("textInputProps.placeholder");
  });

  it("announces inline input errors politely instead of interrupting speech", () => {
    const source = readSource("src/components/ui/LiquidGlassTextInput.tsx");
    expect(source).toContain('accessibilityLiveRegion={hasError ? "polite" : undefined}');
    expect(source).not.toContain('accessibilityLiveRegion={hasError ? "assertive"');
  });

  it("labels the error-boundary recovery action", () => {
    const source = readSource("src/components/ErrorBoundary.tsx");
    expect(source).toContain('accessibilityRole="button"');
    expect(source).toContain('accessibilityLabel={t("common.reset")}');
  });

  it("keeps toast actions reachable and reserves assertive live regions for errors", () => {
    const source = readSource("src/components/ui/Toast.tsx");
    expect(source).toContain('const liveRegion = variant === "error" ? "assertive" : "polite"');
    expect(source).toContain("accessibilityRole={variant === \"error\" ? \"alert\" : undefined}");
    expect(source).toContain("accessibilityLiveRegion={liveRegion}");
    expect(source).toContain("importantForAccessibility=\"no-hide-descendants\"");
    expect(source).not.toContain('accessibilityLiveRegion="assertive"');
  });

  it("names forced transport actions by their effect, not just by transport value", () => {
    const source = readSource("src/navigation/screens/GlassSettings.tsx");
    expect(source).toContain("transportTest.forceAccessibilityLabel");
    expect(source).toContain("transportTest.forceHint");
  });
});
