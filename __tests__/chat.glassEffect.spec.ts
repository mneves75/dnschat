/**
 * Chat Components - iOS 26 Liquid Glass Effect Tests
 *
 * Verifies glass effect implementation across MessageBubble, MessageList, and ChatInput:
 * - Platform-specific rendering (iOS glass vs Android/Web fallback)
 * - No shadow/glass conflicts on iOS
 * - Proper use of LiquidGlassWrapper and GlassContainer
 * - Glass availability checks and fallbacks
 */

import fs from "fs";
import path from "path";

describe("Chat - iOS 26 Liquid Glass Effect Implementation", () => {
  describe("MessageBubble Glass Effects", () => {
    const messageBubblePath = path.resolve(
      __dirname,
      "../src/components/MessageBubble.tsx"
    );
    let sourceCode: string;

    beforeAll(() => {
      sourceCode = fs.readFileSync(messageBubblePath, "utf8");
    });

    it("imports LiquidGlassWrapper for glass effects", () => {
      expect(sourceCode).toContain(
        'import { LiquidGlassWrapper } from "./LiquidGlassWrapper"'
      );
    });

    it("uses Platform.OS to conditionally render glass on iOS", () => {
      expect(sourceCode).toContain('Platform.OS === "ios"');
    });

    it("wraps bubble content in LiquidGlassWrapper for iOS", () => {
      expect(sourceCode).toContain("<LiquidGlassWrapper");
      expect(sourceCode).toContain("variant={glassVariant}");
      expect(sourceCode).toContain('shape="roundedRect"');
    });

    it("CRITICAL: separates shadow styles from base bubble styles", () => {
      // BUGFIX: Shadow properties must be separate to avoid iOS glass conflicts
      expect(sourceCode).toContain("bubbleBase:");
      expect(sourceCode).toContain("bubbleShadow:");
      expect(sourceCode).not.toContain("styles.bubble:"); // Old combined style removed
    });

    it("CRITICAL: only applies shadows to non-iOS platforms", () => {
      // Verify bubbleShadow style exists and contains shadow properties
      expect(sourceCode).toContain("bubbleShadow: {");
      expect(sourceCode).toContain("shadowColor:");
      expect(sourceCode).toContain("shadowOpacity:");
      expect(sourceCode).toContain("shadowRadius:");
      expect(sourceCode).toContain("elevation:");

      // Verify shadows are NOT applied to iOS glass path in render logic
      const renderStart = sourceCode.indexOf("const bubbleStyles = [");
      const bubbleStylesSection = sourceCode.substring(renderStart, renderStart + 1000);

      // Extract iOS branch of ternary: "? styles.bubbleGlass"
      // Non-iOS branch will have "styles.bubbleShadow"
      const iosPathStart = bubbleStylesSection.indexOf('Platform.OS === "ios"');
      const nonIosPathStart = bubbleStylesSection.indexOf(': [', iosPathStart);
      const iosBranch = bubbleStylesSection.substring(iosPathStart, nonIosPathStart);

      // iOS branch should contain bubbleGlass but NOT bubbleShadow
      expect(iosBranch).toContain("styles.bubbleGlass");
      expect(iosBranch).not.toContain("styles.bubbleShadow");

      // Non-iOS branch should contain bubbleShadow
      const nonIosBranch = bubbleStylesSection.substring(nonIosPathStart);
      expect(nonIosBranch).toContain("styles.bubbleShadow");
    });

    it("uses transparent background for iOS glass (no background conflicts)", () => {
      expect(sourceCode).toContain("bubbleGlass:");
      const glassStyleStart = sourceCode.indexOf("bubbleGlass:");
      const glassStyleSection = sourceCode.substring(
        glassStyleStart,
        glassStyleStart + 300
      );
      expect(glassStyleSection).toContain('backgroundColor: "transparent"');
    });

    it("applies user vs assistant glass variants", () => {
      expect(sourceCode).toContain('glassVariant = isUser ? "prominent" : "regular"');
    });

    it("applies error state tint color", () => {
      expect(sourceCode).toContain(
        "const glassTint = hasError ? palette.destructive : (isUser ? palette.accentTint : undefined)"
      );
    });

    it("documents shadow/glass conflict in comments", () => {
      expect(sourceCode).toContain("BUGFIX: Platform-specific bubble styling");
      expect(sourceCode).toContain("shadows conflict with native glass");
    });
  });

  describe("MessageList Glass Effects", () => {
    const messageListPath = path.resolve(
      __dirname,
      "../src/components/MessageList.tsx"
    );
    let sourceCode: string;

    beforeAll(() => {
      sourceCode = fs.readFileSync(messageListPath, "utf8");
    });

    it("imports LiquidGlassWrapper for glass effects", () => {
      expect(sourceCode).toContain(
        'import { LiquidGlassWrapper } from "./LiquidGlassWrapper"'
      );
    });

    it("imports GlassContainer for message grouping", () => {
      expect(sourceCode).toContain(
        'import { GlassContainer } from "expo-glass-effect"'
      );
    });

    it("CRITICAL: implements message grouping for iOS performance", () => {
      // Message grouping reduces glass element count from 20 to 5-8
      expect(sourceCode).toContain("interface MessageGroup");
      expect(sourceCode).toContain("groupedMessages");
      expect(sourceCode).toContain("GlassContainer");
    });

    it("groups consecutive messages by sender", () => {
      expect(sourceCode).toContain("prevMsg.role === msg.role");
      expect(sourceCode).toContain("groups.push({ id: msg.id, messages: [msg] })");
    });

    it("wraps message groups in GlassContainer for morphing animations", () => {
      expect(sourceCode).toContain(
        "<GlassContainer spacing={LiquidGlassSpacing.xxs}>"
      );
    });

    it("conditionally renders glass for iOS with multiple messages", () => {
      expect(sourceCode).toContain(
        'if (Platform.OS === "ios" && group.messages.length > 1)'
      );
    });

    it("wraps empty state in LiquidGlassWrapper for iOS", () => {
      const emptyStateStart = sourceCode.indexOf("renderEmptyComponent");
      const emptyStateSection = sourceCode.substring(
        emptyStateStart,
        emptyStateStart + 1500
      );

      expect(emptyStateSection).toContain('Platform.OS === "ios"');
      expect(emptyStateSection).toContain("<LiquidGlassWrapper");
      expect(emptyStateSection).toContain('variant="regular"');
      expect(emptyStateSection).toContain("emptyGlassCard");
    });

    it("provides non-glass fallback for empty state on Android/Web", () => {
      expect(sourceCode).toContain("emptyNonGlassCard");
    });

    it("documents glass performance optimizations", () => {
      expect(sourceCode).toContain("CRITICAL: Groups consecutive messages");
      expect(sourceCode).toContain("reduces glass element count");
      expect(sourceCode).toContain("iOS 26 limit of 10");
    });
  });

  describe("ChatInput Glass Effects", () => {
    const chatInputPath = path.resolve(
      __dirname,
      "../src/components/ChatInput.tsx"
    );
    let sourceCode: string;

    beforeAll(() => {
      sourceCode = fs.readFileSync(chatInputPath, "utf8");
    });

    it("imports LiquidGlassWrapper for glass effects", () => {
      expect(sourceCode).toContain(
        'import { LiquidGlassWrapper } from "./LiquidGlassWrapper"'
      );
    });

    it("uses Platform.OS to conditionally render glass on iOS", () => {
      const inputSection = sourceCode.substring(
        sourceCode.indexOf("View style={styles.inputContainer}"),
        sourceCode.indexOf("View style={styles.inputContainer}") + 2000
      );
      expect(inputSection).toContain('Platform.OS === "ios"');
    });

    it("wraps TextInput in LiquidGlassWrapper for iOS", () => {
      expect(sourceCode).toContain("<LiquidGlassWrapper");
      expect(sourceCode).toContain('variant="regular"');
      expect(sourceCode).toContain('shape="roundedRect"');
      expect(sourceCode).toContain("cornerRadius={18}");
      expect(sourceCode).toContain("style={styles.textInputGlassWrapper}");
    });

    it("uses transparent TextInput background for iOS glass", () => {
      expect(sourceCode).toContain("textInputGlass:");
      const glassStyleStart = sourceCode.indexOf("textInputGlass:");
      const glassStyleSection = sourceCode.substring(
        glassStyleStart,
        glassStyleStart + 200
      );
      expect(glassStyleSection).toContain('backgroundColor: "transparent"');
      expect(glassStyleSection).toContain("borderWidth: 0");
    });

    it("preserves keyboard interactions with glass wrapper", () => {
      // Glass wrapper is purely visual, TextInput props preserved
      // Find the iOS conditional rendering section
      const iosConditionStart = sourceCode.indexOf('Platform.OS === "ios" ? (');
      const iosConditionEnd = sourceCode.indexOf(') : (', iosConditionStart);
      const iosSection = sourceCode.substring(iosConditionStart, iosConditionEnd);

      // Verify TextInput props are preserved inside glass wrapper
      expect(iosSection).toContain("onChangeText={setMessage}");
      expect(iosSection).toContain("onSubmitEditing={handleSend}");
      expect(iosSection).toContain('returnKeyType="send"');
      expect(iosSection).toContain("ref={textInputRef}");
    });

    it("preserves haptic feedback with glass wrapper", () => {
      // Haptic feedback handlers unaffected by glass wrapper
      expect(sourceCode).toContain("HapticFeedback.medium()");
      expect(sourceCode).toContain("HapticFeedback.light()");
      expect(sourceCode).toContain("handleSend");
      expect(sourceCode).toContain("handlePressIn");
    });

    it("provides non-glass fallback for Android/Web", () => {
      const inputSection = sourceCode.substring(
        sourceCode.indexOf("View style={styles.inputContainer}"),
        sourceCode.indexOf("View style={styles.inputContainer}") + 3000
      );
      expect(inputSection).toContain("// Android/Web: Standard TextInput");
      expect(inputSection).toContain("lightTextInput");
      expect(inputSection).toContain("darkTextInput");
    });

    it("documents glass wrapper rationale", () => {
      expect(sourceCode).toContain("iOS 26 HIG: Liquid Glass effect for text input");
      expect(sourceCode).toContain("Glass wrapper handles background");
    });
  });

  describe("LiquidGlassWrapper Integration", () => {
    const wrapperPath = path.resolve(
      __dirname,
      "../src/components/LiquidGlassWrapper.tsx"
    );
    let sourceCode: string;

    beforeAll(() => {
      sourceCode = fs.readFileSync(wrapperPath, "utf8");
    });

    it("imports expo-glass-effect components", () => {
      expect(sourceCode).toContain(
        'import {\n  GlassView,\n  GlassContainer,\n  isLiquidGlassAvailable'
      );
    });

    it("provides glass availability checking", () => {
      expect(sourceCode).toContain("shouldUseGlassEffect");
      expect(sourceCode).toContain("isLiquidGlassAvailable");
    });

    it("handles reduce transparency accessibility setting", () => {
      expect(sourceCode).toContain("AccessibilityInfo");
      expect(sourceCode).toContain("reduceTransparency");
    });

    it("provides fallback styles for non-glass environments", () => {
      expect(sourceCode).toContain("buildFallbackStyle");
      expect(sourceCode).toContain("if (!useGlass)");
    });

    it("supports glass variants (regular, prominent, interactive)", () => {
      expect(sourceCode).toContain('type GlassVariant = "regular" | "prominent" | "interactive"');
    });

    it("supports glass shapes (capsule, rect, roundedRect)", () => {
      expect(sourceCode).toContain('type GlassShape = "capsule" | "rect" | "roundedRect"');
    });
  });

  describe("Platform Consistency", () => {
    it("MessageBubble uses consistent glass API across iOS rendering", () => {
      const messageBubbleCode = fs.readFileSync(
        path.resolve(__dirname, "../src/components/MessageBubble.tsx"),
        "utf8"
      );

      // Verify consistent LiquidGlassWrapper usage
      const glassWrapperCount = (messageBubbleCode.match(/<LiquidGlassWrapper/g) || []).length;
      expect(glassWrapperCount).toBeGreaterThan(0);

      // Verify Platform.OS checks are present
      expect(messageBubbleCode).toContain('Platform.OS === "ios"');
    });

    it("MessageList and ChatInput use same glass wrapper component", () => {
      const messageListCode = fs.readFileSync(
        path.resolve(__dirname, "../src/components/MessageList.tsx"),
        "utf8"
      );
      const chatInputCode = fs.readFileSync(
        path.resolve(__dirname, "../src/components/ChatInput.tsx"),
        "utf8"
      );

      // Both should import from same wrapper
      expect(messageListCode).toContain('from "./LiquidGlassWrapper"');
      expect(chatInputCode).toContain('from "./LiquidGlassWrapper"');

      // Both should use same component name
      expect(messageListCode).toContain("<LiquidGlassWrapper");
      expect(chatInputCode).toContain("<LiquidGlassWrapper");
    });
  });
});
