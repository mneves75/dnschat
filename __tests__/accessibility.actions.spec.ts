import fs from "node:fs";

describe("accessibility action coverage", () => {
  it("exposes settings switches, message actions, chat list actions, and log summaries to assistive tech", () => {
    const settings = fs.readFileSync("src/navigation/screens/GlassSettings.tsx", "utf8");
    const messageBubble = fs.readFileSync("src/components/MessageBubble.tsx", "utf8");
    const chatList = fs.readFileSync("src/navigation/screens/GlassChatList.tsx", "utf8");
    const logs = fs.readFileSync("src/navigation/screens/Logs.tsx", "utf8");

    expect(settings).toContain('testID="settings-mock-dns-switch"');
    expect(settings).toContain('accessibilityLabel={t("screen.glassSettings.sections.dnsConfig.mockTitle")}');
    expect(settings).toContain('testID="settings-haptics-switch"');
    expect(settings).toContain('accessibilityLabel={t("screen.settings.sections.appBehavior.enableHaptics.label")}');

    expect(messageBubble).toContain("accessibilityActions: messageAccessibilityActions");
    expect(messageBubble).toContain("onAccessibilityAction: isLoading ? undefined : handleAccessibilityAction");
    expect(messageBubble).toContain("accessible={!exposesInteractiveMarkdown}");

    expect(chatList).toContain("accessibilityActions={chatAccessibilityActions}");
    expect(chatList).toContain("onAccessibilityAction={handleAccessibilityAction}");
    expect(chatList).toContain('t("screen.glassChatList.itemAccessibilityHint")');
    expect(chatList).toContain("ShareService.shareConversation");
    expect(chatList).not.toContain('devLog("Sharing chat"');

    expect(logs).toContain('t("screen.logs.accessibility.rowLabel"');
    expect(logs).toContain("statusLabel");
    expect(logs).toContain("durationLabel");
  });
});
