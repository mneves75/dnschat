import fs from "node:fs";
import path from "node:path";

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");

describe("web runtime policy", () => {
  it("passes image tint through the Image prop instead of deprecated web style tintColor", () => {
    const source = readSource("app/(tabs)/_layout.web.tsx");
    expect(source).toContain("tintColor={color}");
    expect(source).not.toContain("style={{ width: 22, height: 22, tintColor: color }}");
  });

  it("renders the new-chat icon inside one accessible primary control", () => {
    const source = readSource("src/navigation/screens/GlassChatList.tsx");
    const controlStart = source.indexOf('<PressableRipple\n          testID="chat-list-new-chat"');
    const controlEnd = source.indexOf("</PressableRipple>", controlStart);

    expect(controlStart).toBeGreaterThan(-1);
    expect(controlEnd).toBeGreaterThan(controlStart);

    const control = source.slice(controlStart, controlEnd);
    expect(control).toContain('<PlusIcon size={18} color={palette.textOnChroma} />');
    expect(control).toContain("{ color: palette.textOnChroma }");
    expect(control).toContain('accessibilityRole="button"');
    expect(control).not.toContain("<Form.Item");
  });

  it("uses style.pointerEvents instead of the deprecated web pointerEvents prop", () => {
    const source = readSource("src/components/ChatInput.tsx");

    expect(source).toContain('pointerEvents: canSend ? "auto" : "none"');
    expect(source).not.toContain('pointerEvents={canSend ? "auto" : "none"}');
  });

  it("does not import native Expo UI bottom sheets on the startup settings path", () => {
    const source = readSource("src/components/glass/GlassBottomSheet.tsx");

    expect(source).toContain("Modal");
    expect(source).not.toContain("NativeBottomSheet");
    expect(source).not.toContain("@expo/ui/community/bottom-sheet");
    expect(source).not.toContain("PanGestureHandler");
  });

  it("constrains form and chat content width on desktop web", () => {
    const formSource = readSource("src/components/glass/GlassForm.tsx");
    const chatSource = readSource("src/navigation/screens/Chat.tsx");

    expect(formSource).toContain("webContentWidth");
    expect(formSource).toContain("maxWidth: 860");
    expect(chatSource).toContain("webContent");
    expect(chatSource).toContain("maxWidth: 860");
  });

  it("does not render empty string guards as raw View text on onboarding web", () => {
    const source = readSource("src/components/onboarding/screens/DNSMagicScreen.tsx");

    expect(source).toContain("response.length > 0 &&");
    expect(source).toContain("step.timing !== undefined &&");
    expect(source).not.toContain("response && (");
    expect(source).not.toContain("step.timing && (");
  });

  it("documents browser key storage as a Web preview-only fallback", () => {
    const readme = readSource("README.md");
    const security = readSource("SECURITY.md");
    const dataInventory = readSource("docs/data-inventory.md");

    for (const source of [readme, security, dataInventory]) {
      expect(source).toContain("Web preview");
      expect(source).toContain("same-origin browser storage");
      expect(source).toContain("local-only preview key");
    }
  });
});
