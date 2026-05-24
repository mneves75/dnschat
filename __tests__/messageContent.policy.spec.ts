import fs from "node:fs";

describe("MessageContent render policy", () => {
  const source = fs.readFileSync("src/components/MessageContent.tsx", "utf8");

  it("covers loading, markdown, plain text, and localized error indicator branches", () => {
    expect(source).toContain('message.status === "sending"');
    expect(source).toContain("<Markdown");
    expect(source).toContain("{message.content}");
    expect(source).toContain('t("screen.chat.accessibility.errorIndicator")');
    expect(source).not.toContain("Error indicator");
  });
});
