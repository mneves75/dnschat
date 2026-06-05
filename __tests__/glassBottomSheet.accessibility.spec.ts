import fs from "node:fs";
import path from "node:path";

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");

describe("glass modal accessibility policy", () => {
  const bottomSheetSource = readSource("src/components/glass/GlassBottomSheet.tsx");

  it("treats native bottom sheets as modal accessibility scopes", () => {
    expect(bottomSheetSource).toContain("accessibilityViewIsModal");
  });

  it("traps and restores web dialog focus", () => {
    expect(bottomSheetSource).toContain('role: "dialog"');
    expect(bottomSheetSource).toContain('"aria-modal": true');
    expect(bottomSheetSource).toContain("restoreFocusRef");
    expect(bottomSheetSource).toContain("onCloseRef.current = onClose");
    expect(bottomSheetSource).toContain("onCloseRef.current()");
    expect(bottomSheetSource).toContain('event.key === "Escape"');
    expect(bottomSheetSource).toContain('event.key !== "Tab"');
    expect(bottomSheetSource).toContain("document.addEventListener(\"keydown\", handleKeyDown)");
    expect(bottomSheetSource).toContain("document.removeEventListener(\"keydown\", handleKeyDown)");
    expect(bottomSheetSource).toContain("}, [visible]);");
  });

  it("keeps constrained sheet content reachable by scrolling", () => {
    expect(bottomSheetSource).toContain("ScrollView");
    expect(bottomSheetSource).toContain('keyboardShouldPersistTaps="handled"');
    expect(bottomSheetSource).toContain("contentContainerStyle={styles.contentContainer}");
    expect(bottomSheetSource).toContain("paddingBottom: 20");
  });

  it("keeps bottom-sheet control callbacks stable across parent rerenders", () => {
    expect(bottomSheetSource).toContain("const show = React.useCallback");
    expect(bottomSheetSource).toContain("const hide = React.useCallback");
    expect(bottomSheetSource).toContain("const toggle = React.useCallback");
  });

  it("does not mount Expo UI bottom sheets before a user opens a sheet", () => {
    expect(bottomSheetSource).not.toContain("@expo/ui/community/bottom-sheet");
    expect(bottomSheetSource).not.toContain("NativeBottomSheet");
    expect(bottomSheetSource).not.toContain("PanGestureHandler");
    expect(bottomSheetSource).toContain("TouchableWithoutFeedback");
    expect(bottomSheetSource).toContain("accessibilityElementsHidden");
  });

  it("gives close and action sheet controls accessible button metadata", () => {
    expect(bottomSheetSource).toContain('accessibilityLabel={t("common.close")}');
    expect(bottomSheetSource).toContain('accessibilityRole="button"');
    expect(bottomSheetSource).toContain("accessibilityLabel={action.accessibilityLabel ?? action.title}");
    expect(bottomSheetSource).toContain("accessibilityState={{ disabled: action.disabled }}");
  });

  it("caps Dynamic Type scaling on the fixed-size close glyph", () => {
    expect(bottomSheetSource).toContain("FIXED_GLYPH_MAX_FONT_SCALE = 1.2");
    expect(bottomSheetSource).toContain("maxFontSizeMultiplier={FIXED_GLYPH_MAX_FONT_SCALE}");
  });

  it("uses shared palette tokens for sheet text and action colors", () => {
    expect(bottomSheetSource).toContain("useImessagePalette");
    expect(bottomSheetSource).toContain("textPrimary: palette.textPrimary");
    expect(bottomSheetSource).toContain("actionDefault: palette.userBubble");
    expect(bottomSheetSource).not.toContain('actionDefault: "#007AFF"');
    expect(bottomSheetSource).not.toContain('textPrimary: isDark ? "#F9FAFB"');
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
    expect(source).toContain("FALLBACK_COPY");
    expect(source).toContain("accessibilityLabel={FALLBACK_COPY.reset}");
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

  it("announces settings transport test results and errors", () => {
    const source = readSource("src/navigation/screens/GlassSettings.tsx");
    expect(source).toContain('accessibilityLiveRegion="polite"');
    expect(source).toContain('accessibilityRole="alert"');
    expect(source).toContain('accessibilityLiveRegion="assertive"');
  });

  it("hides log status pills after merging status into the row label", () => {
    const source = readSource("src/navigation/screens/Logs.tsx");
    expect(source).toContain("status: statusLabel");
    expect(source).toContain("accessible={false}");
    expect(source).toContain("importantForAccessibility=\"no-hide-descendants\"");
    expect(source).not.toContain('accessibilityRole="image"');
  });

  it("marks web tab icons decorative because tab labels provide the names", () => {
    const source = readSource("app/(tabs)/_layout.web.tsx");
    expect(source).toContain("accessible={false}");
    expect(source).toContain("accessibilityElementsHidden");
    expect(source).toContain("importantForAccessibility=\"no-hide-descendants\"");
  });
});
