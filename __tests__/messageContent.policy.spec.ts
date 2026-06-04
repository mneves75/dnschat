import fs from "node:fs";

describe("MessageContent render policy", () => {
  const source = fs.readFileSync("src/components/MessageContent.tsx", "utf8");
  const bubbleSource = fs.readFileSync("src/components/MessageBubble.tsx", "utf8");

  it("covers loading, markdown, plain text, and localized error indicator branches", () => {
    expect(source).toContain('message.status === "sending"');
    expect(source).toContain("<Markdown");
    expect(source).toContain('image: () => null');
    expect(source).toContain("onLinkPress={handleMarkdownLinkPress}");
    expect(source).toContain("openExternalUrl(url)");
    expect(source).toContain("return false");
    expect(source).not.toContain("Linking.openURL");
    expect(source).toContain("{message.content}");
    expect(source).toContain('t("screen.chat.accessibility.errorIndicator")');
    expect(source).not.toContain("Error indicator");
  });

  it("does not collapse assistant markdown links into one accessible bubble", () => {
    expect(bubbleSource).toContain("MARKDOWN_LINK_PATTERN");
    expect(bubbleSource).toContain("exposesInteractiveMarkdown");
    expect(bubbleSource).toContain("accessible={!exposesInteractiveMarkdown}");
    expect(bubbleSource).toContain('(?:https:\\/\\/|mailto:)');
  });
});
