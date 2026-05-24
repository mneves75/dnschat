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

  it("does not make the decorative new-chat badge a nested web button", () => {
    const source = readSource("src/navigation/screens/GlassChatList.tsx");
    const badgeStart = source.indexOf('style={styles.newChatBadge}');
    const badgeEnd = source.indexOf("<PlusIcon", badgeStart);

    expect(badgeStart).toBeGreaterThan(-1);
    expect(badgeEnd).toBeGreaterThan(badgeStart);

    const badgeProps = source.slice(badgeStart, badgeEnd);
    expect(badgeProps).not.toContain("accessibilityRole");
    expect(badgeProps).not.toContain("accessibilityLabel");
    expect(badgeProps).not.toContain("accessibilityHint");
  });

  it("uses style.pointerEvents instead of the deprecated web pointerEvents prop", () => {
    const source = readSource("src/components/ChatInput.tsx");

    expect(source).toContain('pointerEvents: canSend ? "auto" : "none"');
    expect(source).not.toContain('pointerEvents={canSend ? "auto" : "none"}');
  });

  it("does not request the native animated driver on web-only glass sheet animations", () => {
    const source = readSource("src/components/glass/GlassBottomSheet.tsx");

    expect(source).toContain('const useNativeDriver = Platform.OS !== "web"');
    expect(source).not.toContain("useNativeDriver: true");
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
