/**
 * FirstChatScreen iOS 26 HIG Compliance Tests
 * Verifies zero emojis, semantic systems, and interactive chat functionality
 */

import fs from "fs";
import path from "path";

describe("FirstChatScreen - iOS 26 HIG Compliance", () => {
  const filePath = path.resolve(
    __dirname,
    "../src/components/onboarding/screens/FirstChatScreen.tsx"
  );
  let sourceCode: string;

  beforeAll(() => {
    sourceCode = fs.readFileSync(filePath, "utf8");
  });

  describe("Required Imports", () => {
    it("imports useImessagePalette", () => {
      expect(sourceCode).toContain("useImessagePalette");
    });

    it("imports useTypography", () => {
      expect(sourceCode).toContain("useTypography");
    });

    it("imports LiquidGlassSpacing", () => {
      expect(sourceCode).toContain("LiquidGlassSpacing");
    });

    it("imports DNSService", () => {
      expect(sourceCode).toContain("DNSService");
    });
  });

  describe("Zero Emoji Requirement", () => {
    it("does not contain chat bubble emoji", () => {
      expect(sourceCode).not.toContain(String.fromCodePoint(0x1F4AC));
    });

    it("does not contain sparkles emoji", () => {
      expect(sourceCode).not.toContain(String.fromCodePoint(0x1F31F));
    });

    it("does not contain rocket emoji", () => {
      expect(sourceCode).not.toContain(String.fromCodePoint(0x1F680));
    });

    it("does not contain hourglass emoji", () => {
      expect(sourceCode).not.toContain(String.fromCodePoint(0x23F3));
    });

    it("contains zero emoji characters", () => {
      const emojiPattern = /[\u{1F300}-\u{1F9FF}]/gu;
      expect(sourceCode.match(emojiPattern)).toBeNull();
    });

    it("uses text 'Chat' instead of emoji", () => {
      expect(sourceCode).toContain("Chat");
    });

    it("uses text status 'Sending via DNS...' instead of emoji", () => {
      expect(sourceCode).toContain('t("screen.onboarding.firstChat.input.sendingVia")');
    });
  });

  describe("Chat Functionality", () => {
    it("defines Message interface with required fields", () => {
      expect(sourceCode).toContain("interface Message");
      expect(sourceCode).toContain("id: string");
      expect(sourceCode).toContain("text: string");
      expect(sourceCode).toContain("isUser: boolean");
    });

    it("includes message state management", () => {
      expect(sourceCode).toContain("useState<Message[]>");
      expect(sourceCode).toContain("messages");
      expect(sourceCode).toContain("setMessages");
    });

    it("includes input text state", () => {
      expect(sourceCode).toContain("inputText");
      expect(sourceCode).toContain("setInputText");
    });

    it("includes loading state", () => {
      expect(sourceCode).toContain("isLoading");
      expect(sourceCode).toContain("setIsLoading");
    });

    it("includes hasTriedChat state", () => {
      expect(sourceCode).toContain("hasTriedChat");
      expect(sourceCode).toContain("setHasTriedChat");
    });

    it("implements sendMessage function", () => {
      expect(sourceCode).toContain("const sendMessage");
      expect(sourceCode).toContain("DNSService.queryLLM");
    });
  });

  describe("Message Bubble Component", () => {
    it("defines MessageBubble component", () => {
      expect(sourceCode).toContain("function MessageBubble");
    });

    it("applies different colors for user vs assistant messages", () => {
      const bubbleSection = sourceCode.substring(
        sourceCode.indexOf("function MessageBubble"),
        sourceCode.indexOf("const styles")
      );
      expect(bubbleSection).toContain("message.isUser");
      expect(bubbleSection).toContain("palette.accentTint");
      expect(bubbleSection).toContain("palette.surface");
      expect(bubbleSection).toContain("palette.solid");
      expect(bubbleSection).toContain("palette.textPrimary");
    });

    it("displays status for sending messages", () => {
      expect(sourceCode).toContain('status === "sending"');
    });
  });

  describe("Suggested Messages", () => {
    it("includes suggested messages array", () => {
      expect(sourceCode).toContain("suggestedMessages");
      expect(sourceCode).toContain('t("screen.onboarding.firstChat.suggestions.option1")');
      expect(sourceCode).toContain('t("screen.onboarding.firstChat.suggestions.option2")');
    });

    it("renders suggestions conditionally", () => {
      expect(sourceCode).toContain("!hasTriedChat");
      expect(sourceCode).toContain("suggestionsContainer");
    });

    it("applies semantic styling to suggestion buttons", () => {
      const suggestionsSection = sourceCode.substring(
        sourceCode.indexOf("suggestionButton"),
        sourceCode.indexOf("suggestionButton") + 500
      );
      expect(suggestionsSection).toContain("palette.surface");
      expect(suggestionsSection).toContain("palette.border");
    });
  });

  describe("No Hardcoded Colors", () => {
    it("contains zero hardcoded hex colors", () => {
      const hexPattern = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/g;
      expect(sourceCode.match(hexPattern)).toBeNull();
    });

    it("uses palette for all colors", () => {
      expect(sourceCode.match(/palette\./g)!.length).toBeGreaterThan(15);
    });
  });

  describe("No Hardcoded Font Sizes", () => {
    it("does not contain fontSize declarations", () => {
      expect(sourceCode).not.toContain("fontSize:");
    });

    it("uses typography system throughout", () => {
      expect(sourceCode.match(/typography\./g)!.length).toBeGreaterThan(8);
    });
  });

  describe("Spacing System", () => {
    it("uses LiquidGlassSpacing throughout", () => {
      expect(sourceCode.match(/LiquidGlassSpacing\./g)!.length).toBeGreaterThan(15);
    });

    it("does not use hardcoded numeric spacing", () => {
      const styles = sourceCode.substring(sourceCode.indexOf("const styles"));
      // Allow only 0, 1, 2, 18, 20, 21, 22, 24, 40, 100 for specific props (borderRadius, lineHeight, maxHeight, etc.)
      const numericSpacingPattern = /(?:padding|margin|gap|top|bottom|left|right)(?:Horizontal|Vertical)?:\s*(?!0\b|1\b|2\b)\d+/g;
      expect(styles.match(numericSpacingPattern)).toBeNull();
    });
  });

  describe("Semantic Color Usage", () => {
    it("uses semantic surface colors", () => {
      expect(sourceCode).toContain("palette.surface");
    });

    it("uses semantic border colors", () => {
      expect(sourceCode).toContain("palette.border");
    });

    it("uses semantic text colors", () => {
      expect(sourceCode).toContain("palette.textPrimary");
      expect(sourceCode).toContain("palette.textSecondary");
      expect(sourceCode).toContain("palette.textTertiary");
    });

    it("uses semantic accent colors", () => {
      expect(sourceCode).toContain("palette.accentTint");
      expect(sourceCode).toContain("palette.solid");
    });
  });

  describe("Component Structure", () => {
    it("uses KeyboardAvoidingView for iOS keyboard handling", () => {
      expect(sourceCode).toContain("KeyboardAvoidingView");
      expect(sourceCode).toContain('behavior={Platform.OS === "ios" ? "padding" : "height"}');
    });

    it("includes header section with title and subtitle", () => {
      expect(sourceCode).toContain("headerSection");
      expect(sourceCode).toContain('t("screen.onboarding.firstChat.title")');
      expect(sourceCode).toContain('t("screen.onboarding.firstChat.subtitle")');
    });

    it("includes messages container with ScrollView", () => {
      expect(sourceCode).toContain("messagesContainer");
      expect(sourceCode).toContain("ScrollView");
    });

    it("includes input container with TextInput", () => {
      expect(sourceCode).toContain("inputContainer");
      expect(sourceCode).toContain("TextInput");
      expect(sourceCode).toContain("multiline");
      expect(sourceCode).toContain("maxLength={200}");
    });

    it("includes send button", () => {
      expect(sourceCode).toContain("sendButton");
      expect(sourceCode).toContain("onPress={sendMessage}");
    });
  });

  describe("Code Quality", () => {
    it("uses StyleSheet.create for performance", () => {
      expect(sourceCode).toContain("StyleSheet.create");
    });

    it("applies styles with array syntax for composition", () => {
      expect(sourceCode.match(/style=\{\[/g)!.length).toBeGreaterThan(13);
    });

    it("passes palette and typography to MessageBubble", () => {
      expect(sourceCode).toContain("palette={palette}");
      expect(sourceCode).toContain("typography={typography}");
    });

    it("handles async operations properly", () => {
      expect(sourceCode).toContain("async () =>");
      expect(sourceCode).toContain("await DNSService.queryLLM");
      expect(sourceCode).toContain("try");
      expect(sourceCode).toContain("catch");
      expect(sourceCode).toContain("finally");
    });
  });

  describe("Accessibility", () => {
    it("provides placeholder text for input", () => {
      expect(sourceCode).toContain('placeholder={t("screen.onboarding.firstChat.input.placeholder")}');
    });

    it("uses appropriate activeOpacity for touch feedback", () => {
      expect(sourceCode).toContain("activeOpacity={0.7}");
    });

    it("disables send button when input is empty", () => {
      expect(sourceCode).toContain("disabled={!inputText.trim() || isLoading}");
    });
  });
});
