import fs from "node:fs";

describe("MessageContent render policy", () => {
  const source = fs.readFileSync("src/components/MessageContent.tsx", "utf8");
  const safeMarkdownSource = fs.readFileSync(
    "src/components/SafeMarkdown.tsx",
    "utf8",
  );
  const bubbleSource = fs.readFileSync(
    "src/components/MessageBubble.tsx",
    "utf8",
  );

  it("covers loading, markdown, plain text, and localized error indicator branches", () => {
    expect(source).toContain('message.status === "sending"');
    expect(source).toContain("<SafeMarkdown");
    expect(safeMarkdownSource).toContain("<Markdown");
    expect(safeMarkdownSource).toContain("image: () => null");
    expect(safeMarkdownSource).toContain("onLinkPress={handleLinkPress}");
    expect(safeMarkdownSource).toContain("appAlert(");
    // The dialog must show the resolved target, never the raw href: this text
    // is model output, and a userinfo URL reads as a trusted host while
    // pointing elsewhere. Asserting the call shape keeps the raw form from
    // creeping back.
    expect(safeMarkdownSource).toContain(
      "url: describeExternalUrlTarget(url),",
    );
    expect(safeMarkdownSource).not.toContain(
      't("screen.chat.externalLink.message", { url })',
    );
    expect(safeMarkdownSource).toContain("openExternalLink(url)");
    expect(safeMarkdownSource).toContain("return false");
    expect(safeMarkdownSource).not.toContain("Linking.openURL");
    expect(source).toContain('t("screen.chat.errorMessage")');
    expect(source).toContain("hasError ? (");
    expect(source).toContain("{displayContent}");
    expect(source).toContain('t("screen.chat.accessibility.errorIndicator")');
    expect(source).toContain(
      "maxFontSizeMultiplier={FIXED_GLYPH_MAX_FONT_SCALE}",
    );
    expect(source).not.toContain("Error indicator");
  });

  it("uses an AA-contrast dark label on the destructive error badge", () => {
    // White-on-red fails WCAG AA; textOnChroma (dark) restores contrast and
    // matches the Toast error variant.
    expect(source).toMatch(
      /backgroundColor:\s*palette\.destructive,\s*color:\s*palette\.textOnChroma/,
    );
    expect(source).not.toContain("color: palette.bubbleTextOnBlue }]}");
  });

  it("does not collapse assistant markdown links into one accessible bubble", () => {
    expect(bubbleSource).toContain("MARKDOWN_LINK_PATTERN");
    expect(bubbleSource).toContain("exposesInteractiveMarkdown");
    expect(bubbleSource).toContain("accessible={!exposesInteractiveMarkdown}");
    expect(bubbleSource).toContain("(?:https:\\/\\/|mailto:)");
  });
});
