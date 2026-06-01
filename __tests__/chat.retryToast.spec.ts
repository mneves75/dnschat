import fs from "node:fs";

describe("Chat error toast retry", () => {
  const chatSource = fs.readFileSync("src/navigation/screens/Chat.tsx", "utf8");
  const enSource = fs.readFileSync("src/i18n/messages/en-US.ts", "utf8");
  const ptSource = fs.readFileSync("src/i18n/messages/pt-BR.ts", "utf8");

  it("offers a retry action for the last failed assistant response", () => {
    expect(chatSource).toContain("function getRetryableFailedPrompt");
    expect(chatSource).toContain('message.status === "error"');
    expect(chatSource).toContain('previous?.role === "user"');
    expect(chatSource).toContain('actionLabel: t("screen.chat.errorRetry")');
    expect(chatSource).toContain("onAction: handleRetryLastFailedMessage");
    expect(chatSource).toContain("await handleSendMessage(retryablePrompt);");
  });

  it("keeps retry copy localized in both supported locales", () => {
    expect(enSource).toContain('errorRetry: "Retry"');
    expect(ptSource).toContain('errorRetry: "Tentar de novo"');
  });
});
