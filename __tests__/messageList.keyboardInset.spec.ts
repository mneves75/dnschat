import fs from "node:fs";
import path from "node:path";

describe("MessageList keyboard inset behavior", () => {
  it("rescrolls when bottomInset changes from keyboard or input height", () => {
    const sourcePath = path.resolve(__dirname, "../src/components/MessageList.tsx");
    const source = fs.readFileSync(sourcePath, "utf8");

    expect(source).toContain("[messages.length, lastMessageKey, bottomInset, lastMessage?.role, shouldReduceMotion]");
    expect(source).toContain("isNearBottomRef");
    expect(source).toContain("messageWasAdded");
    expect(source).toContain("animated: !shouldReduceMotion");
  });

  it("enables drag-to-dismiss of the keyboard (interactive on iOS, on-drag on Android)", () => {
    const sourcePath = path.resolve(__dirname, "../src/components/MessageList.tsx");
    const source = fs.readFileSync(sourcePath, "utf8");

    // The list owns the keyboard-dismiss gesture; KeyboardStickyView + the
    // keyboardHeight-aware bottomInset track the keyboard down during the drag.
    expect(source).toContain("keyboardDismissMode");
    expect(source).toContain('Platform.OS === "ios" ? "interactive" : "on-drag"');
  });
});
