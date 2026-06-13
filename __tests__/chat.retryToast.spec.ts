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

  it("shows compact localized error copy instead of raw DNS diagnostics", () => {
    expect(chatSource).toContain('message={visibleError ? t("screen.chat.errorMessage") : ""}');
    expect(chatSource).not.toContain('message={visibleError ?? ""}');
  });

  it("keeps retry and error copy localized in both supported locales", () => {
    expect(enSource).toContain('errorRetry: "Retry"');
    expect(enSource).toContain(
      'errorMessage: "DNS request failed. Try again or check DNS logs in Settings."',
    );
    expect(ptSource).toContain('errorRetry: "Tentar de novo"');
    expect(ptSource).toContain(
      'errorMessage: "A consulta DNS falhou. Tente de novo ou veja os logs DNS em Ajustes."',
    );
  });
});
