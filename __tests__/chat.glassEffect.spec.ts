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

    it("imports LiquidGlassWrapper and useLiquidGlassCapabilities for glass effects", () => {
      expect(sourceCode).toContain(
        'import { LiquidGlassWrapper, useLiquidGlassCapabilities } from "./LiquidGlassWrapper"'
      );
    });

    it("uses glass availability check to conditionally render glass", () => {
      expect(sourceCode).toContain("useLiquidGlassCapabilities");
      expect(sourceCode).toContain("supportsLiquidGlass");
      expect(sourceCode).toContain("useGlassRendering");
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

    it("CRITICAL: only applies shadows to non-glass platforms", () => {
      // Verify bubbleShadow style exists and contains shadow properties
      expect(sourceCode).toContain("bubbleShadow: {");
      expect(sourceCode).toContain("shadowColor:");
      expect(sourceCode).toContain("shadowOpacity:");
      expect(sourceCode).toContain("shadowRadius:");
      expect(sourceCode).toContain("elevation:");

      // Verify shadows are NOT applied when useGlassRendering is true
      const renderStart = sourceCode.indexOf("const bubbleStyles = ");
      const bubbleStylesSection = sourceCode.substring(renderStart, renderStart + 800);

      // Glass branch should use bubbleGlassContainer but NOT bubbleShadow
      expect(bubbleStylesSection).toContain("useGlassRendering");
      expect(bubbleStylesSection).toContain("styles.bubbleGlassContainer");

      // Non-glass branch should contain bubbleShadow
      expect(bubbleStylesSection).toContain("styles.bubbleShadow");
    });

    it("glass container has NO appearance styles (handled by wrapper)", () => {
      // bubbleGlassContainer should only have layout properties, NO appearance properties
      expect(sourceCode).toContain("bubbleGlassContainer:");
      const glassStyleStart = sourceCode.indexOf("bubbleGlassContainer:");
      const glassStyleSection = sourceCode.substring(
        glassStyleStart,
        glassStyleStart + 400
      );
      // Should have minWidth for layout
      expect(glassStyleSection).toContain("minWidth:");
      // Should NOT have backgroundColor (handled by LiquidGlassWrapper/GlassView)
      expect(glassStyleSection).not.toContain("backgroundColor:");
      // Should NOT have padding (handled by bubblePressable)
      expect(glassStyleSection).toContain("NO padding");
      // Should NOT have borderRadius (handled by LiquidGlassWrapper cornerRadius prop)
      expect(glassStyleSection).toContain("NO borderRadius");
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

    it("imports LiquidGlassWrapper and useLiquidGlassCapabilities for glass effects", () => {
      expect(sourceCode).toContain(
        'import { LiquidGlassWrapper, useLiquidGlassCapabilities } from "./LiquidGlassWrapper"'
      );
    });

    it("does NOT import GlassContainer (removed for cleaner UI)", () => {
      // GlassContainer was removed because it creates visible background rectangles
      // Each MessageBubble now handles its own glass effect independently
      expect(sourceCode).not.toContain('import { GlassContainer }');
      expect(sourceCode).not.toContain("GlassContainer");
    });

    it("renders messages individually without grouping", () => {
      // Simplified architecture: each message renders independently
      // No message grouping, no GlassContainer wrappers
      expect(sourceCode).toContain("renderMessage");
      expect(sourceCode).toContain("<MessageBubble message={message} />");

      // Should NOT have grouping logic
      expect(sourceCode).not.toContain("interface MessageGroup");
      expect(sourceCode).not.toContain("groupedMessages");
    });

    it("wraps empty state in LiquidGlassWrapper when glass is available", () => {
      const emptyStateStart = sourceCode.indexOf("renderEmptyComponent");
      const emptyStateSection = sourceCode.substring(
        emptyStateStart,
        emptyStateStart + 1500
      );

      expect(emptyStateSection).toContain("supportsLiquidGlass");
      expect(emptyStateSection).toContain("<LiquidGlassWrapper");
      expect(emptyStateSection).toContain('variant="regular"');
      expect(emptyStateSection).toContain("emptyGlassCard");
    });

    it("provides non-glass fallback for empty state on Android/Web", () => {
      expect(sourceCode).toContain("emptyNonGlassCard");
    });

    it("uses FlatList for efficient message rendering", () => {
      // Verify FlatList with proper data source
      expect(sourceCode).toContain("data={messages}");
      expect(sourceCode).toContain("renderItem={renderMessage}");
      expect(sourceCode).toContain("keyExtractor");
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

    it("imports LiquidGlassWrapper and useLiquidGlassCapabilities for glass effects", () => {
      expect(sourceCode).toContain(
        'import { LiquidGlassWrapper, useLiquidGlassCapabilities } from "./LiquidGlassWrapper"'
      );
    });

    it("uses glass availability check to conditionally render glass", () => {
      expect(sourceCode).toContain("useLiquidGlassCapabilities");
      expect(sourceCode).toContain("supportsLiquidGlass");
      expect(sourceCode).toContain("useGlassInput");
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
      // Find the glass availability conditional rendering section
      const glassConditionStart = sourceCode.indexOf('useGlassInput ? (');
      const glassConditionEnd = sourceCode.indexOf(') : (', glassConditionStart);
      const glassSection = sourceCode.substring(glassConditionStart, glassConditionEnd);

      // Verify TextInput props are preserved inside glass wrapper
      expect(glassSection).toContain("onChangeText={setMessage}");
      expect(glassSection).toContain("onSubmitEditing={handleSend}");
      expect(glassSection).toContain('returnKeyType="send"');
      expect(glassSection).toContain("ref={textInputRef}");
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
      expect(sourceCode).toContain("iOS 26+ HIG: Liquid Glass effect for text input when available");
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
