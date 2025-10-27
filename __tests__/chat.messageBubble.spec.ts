/**
 * MessageBubble - iOS 26 HIG Compliance Tests
 *
 * Verifies message bubbles follow iOS 26 Human Interface Guidelines:
 * - Message bubbles are CONTENT LAYER (not control/navigation layer)
 * - Use solid backgrounds (NOT Liquid Glass)
 * - Simple iMessage-style design with proper colors
 * - Standard iOS materials (shadows) for depth
 *
 * CRITICAL HIG RULE: "Don't use Liquid Glass in the content layer.
 * Liquid Glass works best when it provides a clear distinction between
 * interactive elements and content."
 */

import fs from "fs";
import path from "path";

describe("MessageBubble - iOS 26 HIG Compliance", () => {
  const messageBubblePath = path.resolve(
    __dirname,
    "../src/components/MessageBubble.tsx"
  );
  let sourceCode: string;

  beforeAll(() => {
    sourceCode = fs.readFileSync(messageBubblePath, "utf8");
  });

  describe("iOS 26 HIG: Content Layer Compliance", () => {
    it("does NOT use LiquidGlassWrapper (content layer violation)", () => {
      // CRITICAL: Message bubbles are content, not controls
      // HIG: "Don't use Liquid Glass in the content layer"
      expect(sourceCode).not.toContain("LiquidGlassWrapper");
      expect(sourceCode).not.toContain("useLiquidGlassCapabilities");
    });

    it("does NOT use glass effects or variants", () => {
      expect(sourceCode).not.toContain("glassVariant");
      expect(sourceCode).not.toContain("glassTint");
      expect(sourceCode).not.toContain("useGlassRendering");
      expect(sourceCode).not.toContain("supportsLiquidGlass");
    });

    it("does NOT use complex overlay layers", () => {
      // Previous implementation had tint/highlight/stroke overlays - WRONG
      expect(sourceCode).not.toContain("glassTintLayer");
      expect(sourceCode).not.toContain("glassHighlightLayer");
      expect(sourceCode).not.toContain("glassStrokeLayer");
      expect(sourceCode).not.toContain("bubbleOverlay");
    });

    it("documents HIG compliance in comments", () => {
      expect(sourceCode).toContain("iOS 26 HIG");
      expect(sourceCode).toContain("Message bubbles are CONTENT");
      expect(sourceCode).toContain("NOT Liquid Glass");
    });
  });

  describe("iOS 26 HIG: iMessage-Style Solid Backgrounds", () => {
    it("uses palette.userBubble for user messages", () => {
      expect(sourceCode).toContain("palette.userBubble");
    });

    it("uses palette.assistantBubble for assistant messages", () => {
      expect(sourceCode).toContain("palette.assistantBubble");
    });

    it("uses palette.destructive for error messages", () => {
      expect(sourceCode).toContain("palette.destructive");
    });

    it("uses palette.bubbleTextOnBlue for text on blue/red bubbles", () => {
      expect(sourceCode).toContain("palette.bubbleTextOnBlue");
    });

    it("uses palette.bubbleTextOnGray for text on gray bubbles", () => {
      expect(sourceCode).toContain("palette.bubbleTextOnGray");
    });
  });

  describe("iOS 26 HIG: Standard Materials (Shadows for Depth)", () => {
    it("uses standard iOS shadows (not glass) for depth", () => {
      expect(sourceCode).toContain("shadowColor");
      expect(sourceCode).toContain("shadowOffset");
      expect(sourceCode).toContain("shadowOpacity");
      expect(sourceCode).toContain("shadowRadius");
    });

    it("has prominent shadow style for user/error messages", () => {
      expect(sourceCode).toContain("prominentShadow");
      const prominentSection = sourceCode.substring(
        sourceCode.indexOf("prominentShadow:"),
        sourceCode.indexOf("prominentShadow:") + 300
      );
      expect(prominentSection).toContain("shadowOpacity: 0.15");
      expect(prominentSection).toContain("shadowRadius: 4");
    });

    it("has subtle shadow style for assistant messages", () => {
      expect(sourceCode).toContain("subtleShadow");
      const subtleSection = sourceCode.substring(
        sourceCode.indexOf("subtleShadow:"),
        sourceCode.indexOf("subtleShadow:") + 300
      );
      expect(subtleSection).toContain("shadowOpacity: 0.08");
      expect(subtleSection).toContain("shadowRadius: 2");
    });
  });

  describe("iMessage-Style Features", () => {
    it("implements message tail with custom corner radius", () => {
      expect(sourceCode).toContain("borderBottomRightRadius");
      expect(sourceCode).toContain("borderBottomLeftRadius");
      expect(sourceCode).toContain("iMessage-style tail");
    });

    it("applies smaller corner radius (6) for tail side", () => {
      const tailSection = sourceCode.substring(
        sourceCode.indexOf("iMessage-style tail"),
        sourceCode.indexOf("iMessage-style tail") + 300
      );
      expect(tailSection).toContain(": 6");
    });

    it("uses messageCornerRadius for non-tail corners", () => {
      expect(sourceCode).toContain("messageCornerRadius");
      expect(sourceCode).toContain("getCornerRadius('message')");
    });
  });

  describe("Simplified Architecture", () => {
    it("has single Pressable wrapper (no conditional glass/non-glass branches)", () => {
      // Old code had: useGlassRendering ? <LiquidGlassWrapper>... : <Pressable>...
      // New code: single <Pressable> always
      const pressableCount = (sourceCode.match(/<Pressable/g) || []).length;
      expect(pressableCount).toBe(1); // Only one Pressable
    });

    it("does NOT have bubbleGlassContainer style", () => {
      expect(sourceCode).not.toContain("bubbleGlassContainer");
    });

    it("does NOT have bubblePressable style", () => {
      expect(sourceCode).not.toContain("bubblePressable");
    });

    it("has simplified bubbleBase style", () => {
      expect(sourceCode).toContain("bubbleBase:");
      expect(sourceCode).toContain("paddingHorizontal");
      expect(sourceCode).toContain("paddingVertical");
      expect(sourceCode).toContain("borderRadius");
      expect(sourceCode).toContain("minWidth");
    });

    it("does NOT have complex bubbleTone system", () => {
      expect(sourceCode).not.toContain("bubbleTone");
      expect(sourceCode).not.toContain("overlayBase");
      expect(sourceCode).not.toContain("highlightOpacity");
    });
  });

  describe("Code Quality", () => {
    it("is under 250 lines (simplified from 440+ lines)", () => {
      const lineCount = sourceCode.split("\n").length;
      expect(lineCount).toBeLessThan(250);
    });

    it("has no console.log statements", () => {
      expect(sourceCode).not.toContain("console.log");
    });

    it("uses proper TypeScript types", () => {
      expect(sourceCode).toContain("MessageBubbleProps");
      expect(sourceCode).toContain("interface MessageBubbleProps");
    });

    it("exports component properly", () => {
      expect(sourceCode).toContain("export function MessageBubble");
    });
  });

  describe("Accessibility", () => {
    it("provides accessibility labels", () => {
      expect(sourceCode).toContain("accessibilityLabel");
      expect(sourceCode).toContain("accessibilityHint");
      expect(sourceCode).toContain("accessibilityRole");
    });

    it("supports long press interaction", () => {
      expect(sourceCode).toContain("onLongPress");
      expect(sourceCode).toContain("handleLongPress");
    });

    it("includes haptic feedback", () => {
      expect(sourceCode).toContain("HapticFeedback");
    });
  });

  describe("Regression Prevention", () => {
    it("prevents reintroduction of LiquidGlassWrapper", () => {
      expect(sourceCode).not.toContain("import { LiquidGlassWrapper");
      expect(sourceCode).not.toContain("<LiquidGlassWrapper");
    });

    it("prevents reintroduction of glass capabilities hook", () => {
      expect(sourceCode).not.toContain("useLiquidGlassCapabilities");
      expect(sourceCode).not.toContain("supportsLiquidGlass");
    });

    it("prevents reintroduction of overlay layers", () => {
      expect(sourceCode).not.toContain("glassLayers");
      expect(sourceCode).not.toContain("pointerEvents=\"none\"");
    });

    it("prevents reintroduction of useGlassRendering logic", () => {
      expect(sourceCode).not.toContain("useGlassRendering");
      expect(sourceCode).not.toContain("Platform.OS === \"ios\" && supportsLiquidGlass");
    });
  });
});
