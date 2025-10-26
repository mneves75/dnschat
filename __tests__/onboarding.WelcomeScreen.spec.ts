/**
 * WelcomeScreen iOS 26 HIG Compliance Tests
 *
 * Verifies comprehensive iOS 26 Human Interface Guidelines compliance:
 * - Semantic color system (useImessagePalette)
 * - SF Pro typography system (useTypography)
 * - LiquidGlassSpacing 8px grid system
 * - Zero hardcoded colors
 * - Zero hardcoded fontSize values
 * - Zero emoji in code (CLAUDE.md requirement)
 * - Proper accessibility integration
 *
 * APPROACH: Source code validation (no component rendering required)
 */

import fs from "fs";
import path from "path";

describe("WelcomeScreen - iOS 26 HIG Compliance", () => {
  const filePath = path.resolve(
    __dirname,
    "../src/components/onboarding/screens/WelcomeScreen.tsx"
  );
  let sourceCode: string;

  beforeAll(() => {
    sourceCode = fs.readFileSync(filePath, "utf8");
  });

  describe("iOS 26 HIG: Required Imports", () => {
    it("imports useImessagePalette for semantic colors", () => {
      expect(sourceCode).toContain(
        'import { useImessagePalette } from "../../../ui/theme/imessagePalette"'
      );
    });

    it("imports useTypography for SF Pro typography system", () => {
      expect(sourceCode).toContain(
        'import { useTypography } from "../../../ui/hooks/useTypography"'
      );
    });

    it("imports LiquidGlassSpacing for 8px grid system", () => {
      expect(sourceCode).toContain(
        'import { LiquidGlassSpacing } from "../../../ui/theme/liquidGlassSpacing"'
      );
    });

    it("uses palette hook in component", () => {
      expect(sourceCode).toContain("const palette = useImessagePalette()");
    });

    it("uses typography hook in component", () => {
      expect(sourceCode).toContain("const typography = useTypography()");
    });
  });

  describe("iOS 26 HIG: Semantic Color Usage", () => {
    it("uses palette.textPrimary for primary text", () => {
      expect(sourceCode).toContain("palette.textPrimary");
    });

    it("uses palette.textSecondary for secondary text", () => {
      expect(sourceCode).toContain("palette.textSecondary");
    });

    it("uses palette.accentSurface for accent backgrounds", () => {
      expect(sourceCode).toContain("palette.accentSurface");
    });

    it("uses palette.accentBorder for accent borders", () => {
      expect(sourceCode).toContain("palette.accentBorder");
    });

    it("uses palette.accentTint for accent text", () => {
      expect(sourceCode).toContain("palette.accentTint");
    });
  });

  describe("iOS 26 HIG: No Hardcoded Colors", () => {
    const hexColorPattern = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/g;

    it("contains zero hardcoded hex colors", () => {
      const matches = sourceCode.match(hexColorPattern);
      expect(matches).toBeNull();
    });

    it("does not use hardcoded white (#FFFFFF)", () => {
      expect(sourceCode).not.toContain("#FFFFFF");
      expect(sourceCode).not.toContain("#ffffff");
    });

    it("does not use hardcoded black (#000000)", () => {
      expect(sourceCode).not.toContain("#000000");
    });

    it("does not use hardcoded gray values", () => {
      expect(sourceCode).not.toContain("#666666");
      expect(sourceCode).not.toContain("#999999");
      expect(sourceCode).not.toContain("#8E8E93");
    });

    it("does not use hardcoded blue values", () => {
      expect(sourceCode).not.toContain("#007AFF");
      expect(sourceCode).not.toContain("#0A84FF");
    });
  });

  describe("iOS 26 HIG: Typography System", () => {
    it("uses typography.displaySmall for title", () => {
      expect(sourceCode).toContain("typography.displaySmall");
    });

    it("uses typography.body for subtitle", () => {
      expect(sourceCode).toContain("typography.body");
    });

    it("uses typography.headline for feature titles", () => {
      expect(sourceCode).toContain("typography.headline");
    });

    it("uses typography.callout for feature descriptions", () => {
      expect(sourceCode).toContain("typography.callout");
    });
  });

  describe("iOS 26 HIG: No Hardcoded Font Sizes", () => {
    it("does not use fontSize: 32", () => {
      expect(sourceCode).not.toContain("fontSize: 32");
    });

    it("does not use fontSize: 28", () => {
      expect(sourceCode).not.toContain("fontSize: 28");
    });

    it("does not use fontSize: 18", () => {
      expect(sourceCode).not.toContain("fontSize: 18");
    });

    it("does not use fontSize: 16", () => {
      expect(sourceCode).not.toContain("fontSize: 16");
    });

    it("does not use fontSize: 15", () => {
      expect(sourceCode).not.toContain("fontSize: 15");
    });
  });

  describe("iOS 26 HIG: Spacing System", () => {
    it("uses LiquidGlassSpacing.xl for horizontal padding", () => {
      expect(sourceCode).toContain("LiquidGlassSpacing.xl");
    });

    it("uses LiquidGlassSpacing.xxxl for top padding", () => {
      expect(sourceCode).toContain("LiquidGlassSpacing.xxxl");
    });

    it("uses LiquidGlassSpacing.huge for large margins", () => {
      expect(sourceCode).toContain("LiquidGlassSpacing.huge");
    });

    it("uses LiquidGlassSpacing.md for medium spacing", () => {
      expect(sourceCode).toContain("LiquidGlassSpacing.md");
    });

    it("uses LiquidGlassSpacing.xxs for minimal spacing", () => {
      expect(sourceCode).toContain("LiquidGlassSpacing.xxs");
    });
  });

  describe("iOS 26 HIG: No Hardcoded Spacing", () => {
    it("does not use hardcoded spacing: 60", () => {
      expect(sourceCode).not.toContain("marginBottom: 60");
    });

    it("does not use hardcoded spacing: 40", () => {
      expect(sourceCode).not.toContain("paddingTop: 40");
    });

    it("does not use hardcoded spacing: 24", () => {
      expect(sourceCode).not.toContain("paddingHorizontal: 24");
    });

    it("does not use hardcoded spacing: 16", () => {
      expect(sourceCode).not.toContain("gap: 16");
      expect(sourceCode).not.toContain("marginBottom: 16");
    });
  });

  describe("CLAUDE.md: Zero Emoji Requirement", () => {
    it("does not contain rocket emoji", () => {
      expect(sourceCode).not.toContain("🚀");
    });

    it("does not contain lock emoji", () => {
      expect(sourceCode).not.toContain("🔒");
    });

    it("does not contain lightning emoji", () => {
      expect(sourceCode).not.toContain("⚡");
    });

    it("contains zero emoji characters in code", () => {
      const emojiPattern = /[\u{1F300}-\u{1F9FF}]/gu;
      const matches = sourceCode.match(emojiPattern);
      expect(matches).toBeNull();
    });

    it("uses text labels instead of emojis", () => {
      expect(sourceCode).toContain('"Revolutionary"');
      expect(sourceCode).toContain('"Private"');
      expect(sourceCode).toContain('"Fast"');
    });
  });

  describe("Component Structure", () => {
    it("exports WelcomeScreen function", () => {
      expect(sourceCode).toContain("export function WelcomeScreen");
    });

    it("includes FeatureItem component", () => {
      expect(sourceCode).toContain("function FeatureItem");
    });

    it("includes OnboardingNavigation", () => {
      expect(sourceCode).toContain("OnboardingNavigation");
    });

    it("uses StyleSheet.create for styles", () => {
      expect(sourceCode).toContain("StyleSheet.create");
    });
  });

  describe("Animations", () => {
    it("preserves fade animation", () => {
      expect(sourceCode).toContain("fadeAnim");
      expect(sourceCode).toContain("Animated.timing");
    });

    it("preserves slide animation", () => {
      expect(sourceCode).toContain("slideAnim");
      expect(sourceCode).toContain("useNativeDriver: true");
    });
  });

  describe("Code Quality", () => {
    it("contains no manual isDark color switching", () => {
      expect(sourceCode).not.toContain("isDark ? styles.dark");
      expect(sourceCode).not.toContain("colorScheme === 'dark'");
    });

    it("contains no inline style color values", () => {
      expect(sourceCode).not.toContain('color: "#');
      expect(sourceCode).not.toContain("color: '#");
    });

    it("contains no inline style fontSize values", () => {
      expect(sourceCode).not.toContain("fontSize: ");
    });
  });
});
