import fs from "node:fs";

describe("MessageContent render policy", () => {
  const source = fs.readFileSync("src/components/MessageContent.tsx", "utf8");
  const bubbleSource = fs.readFileSync("src/components/MessageBubble.tsx", "utf8");

  it("covers loading, markdown, plain text, and localized error indicator branches", () => {
    expect(source).toContain('message.status === "sending"');
    expect(source).toContain("<Markdown");
    expect(source).toContain('image: () => null');
    expect(source).toContain("onLinkPress={handleMarkdownLinkPress}");
    expect(source).toContain("Alert.alert");
    expect(source).toContain('t("screen.chat.externalLink.message", { url })');
    expect(source).toContain("openExternalUrl(url)");
    expect(source).toContain("return false");
    expect(source).not.toContain("Linking.openURL");
    expect(source).toContain("{message.content}");
    expect(source).toContain('t("screen.chat.accessibility.errorIndicator")');
    expect(source).toContain("maxFontSizeMultiplier={FIXED_GLYPH_MAX_FONT_SCALE}");
    expect(source).not.toContain("Error indicator");
  });

  it("uses an AA-contrast dark label on the destructive error badge", () => {
    // White-on-red fails WCAG AA; textOnChroma (dark) restores contrast and
    // matches the Toast error variant.
    expect(source).toContain(
      "backgroundColor: palette.destructive, color: palette.textOnChroma",
    );
    expect(source).not.toContain("color: palette.bubbleTextOnBlue }]}");
  });

  it("does not collapse assistant markdown links into one accessible bubble", () => {
    expect(bubbleSource).toContain("MARKDOWN_LINK_PATTERN");
    expect(bubbleSource).toContain("exposesInteractiveMarkdown");
    expect(bubbleSource).toContain("accessible={!exposesInteractiveMarkdown}");
    expect(bubbleSource).toContain('(?:https:\\/\\/|mailto:)');
  });
});
