/**
 * FeaturesScreen iOS 26 HIG Compliance Tests
 * Verifies zero emojis, semantic systems, and updated feature list
 */

import fs from "fs";
import path from "path";

describe("FeaturesScreen - iOS 26 HIG Compliance", () => {
  const filePath = path.resolve(
    __dirname,
    "../src/components/onboarding/screens/FeaturesScreen.tsx"
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

    it("imports Linking for GitHub action", () => {
      expect(sourceCode).toContain("Linking");
    });
  });

  describe("Zero Emoji Requirement", () => {
    it("does not contain sparkles emoji", () => {
      expect(sourceCode).not.toContain(String.fromCodePoint(0x2728));
    });

    it("does not contain chart emoji", () => {
      expect(sourceCode).not.toContain(String.fromCodePoint(0x1F4CA));
    });

    it("does not contain gear emoji", () => {
      expect(sourceCode).not.toContain("\u2699\uFE0F");
    });

    it("does not contain moon emoji", () => {
      expect(sourceCode).not.toContain(String.fromCodePoint(0x1F319));
    });

    it("does not contain floppy disk emoji", () => {
      expect(sourceCode).not.toContain(String.fromCodePoint(0x1F4BE));
    });

    it("does not contain recycling emoji", () => {
      expect(sourceCode).not.toContain(String.fromCodePoint(0x1F504));
    });

    it("does not contain globe emoji", () => {
      expect(sourceCode).not.toContain(String.fromCodePoint(0x1F310));
    });

    it("does not contain party emoji", () => {
      expect(sourceCode).not.toContain(String.fromCodePoint(0x1F389));
    });

    it("contains zero emoji characters", () => {
      const emojiPattern = /[\u{1F300}-\u{1F9FF}]/gu;
      expect(sourceCode.match(emojiPattern)).toBeNull();
    });

    it("uses translation keys instead of hardcoded labels", () => {
      expect(sourceCode).toContain('t("screen.onboarding.features.logs.label")');
      expect(sourceCode).toContain('t("screen.onboarding.features.customize.label")');
      expect(sourceCode).toContain('t("screen.onboarding.features.liquidGlass.label")');
      expect(sourceCode).toContain('t("screen.onboarding.features.i18n.label")');
      expect(sourceCode).toContain('t("screen.onboarding.features.haptics.label")');
      expect(sourceCode).toContain('t("screen.onboarding.features.themes.label")');
      expect(sourceCode).toContain('t("screen.onboarding.features.storage.label")');
      expect(sourceCode).toContain('t("screen.onboarding.features.fallbacks.label")');
      expect(sourceCode).toContain('t("screen.onboarding.features.opensource.label")');
    });
  });

  describe("Updated Feature List", () => {
    it("includes DNS Query Logs feature", () => {
      expect(sourceCode).toContain('t("screen.onboarding.features.logs.title")');
      expect(sourceCode).toContain('t("screen.onboarding.features.logs.description")');
    });

    it("includes Customizable Settings feature", () => {
      expect(sourceCode).toContain('t("screen.onboarding.features.customize.title")');
      expect(sourceCode).toContain('t("screen.onboarding.features.customize.description")');
    });

    it("includes iOS 26 Liquid Glass Design feature", () => {
      expect(sourceCode).toContain('t("screen.onboarding.features.liquidGlass.title")');
      expect(sourceCode).toContain('t("screen.onboarding.features.liquidGlass.description")');
    });

    it("includes Multilingual Support feature", () => {
      expect(sourceCode).toContain('t("screen.onboarding.features.i18n.title")');
      expect(sourceCode).toContain('t("screen.onboarding.features.i18n.description")');
    });

    it("includes Haptic Feedback feature", () => {
      expect(sourceCode).toContain('t("screen.onboarding.features.haptics.title")');
      expect(sourceCode).toContain('t("screen.onboarding.features.haptics.description")');
    });

    it("includes Dark and Light Themes feature", () => {
      expect(sourceCode).toContain('t("screen.onboarding.features.themes.title")');
      expect(sourceCode).toContain('t("screen.onboarding.features.themes.description")');
    });

    it("includes Local Storage feature", () => {
      expect(sourceCode).toContain('t("screen.onboarding.features.storage.title")');
      expect(sourceCode).toContain('t("screen.onboarding.features.storage.description")');
    });

    it("includes Smart Fallbacks feature", () => {
      expect(sourceCode).toContain('t("screen.onboarding.features.fallbacks.title")');
      expect(sourceCode).toContain('t("screen.onboarding.features.fallbacks.description")');
    });

    it("includes Open Source feature with GitHub link", () => {
      expect(sourceCode).toContain('t("screen.onboarding.features.opensource.title")');
      expect(sourceCode).toContain('t("screen.onboarding.features.opensource.action")');
      expect(sourceCode).toContain("github.com/mvneves/chat-dns");
    });
  });

  describe("Feature Card Structure", () => {
    it("defines Feature interface", () => {
      expect(sourceCode).toContain("interface Feature");
      expect(sourceCode).toContain("label: string");
      expect(sourceCode).toContain("title: string");
      expect(sourceCode).toContain("description: string");
    });

    it("defines FeatureCard component", () => {
      expect(sourceCode).toContain("function FeatureCard");
    });

    it("includes label container with semantic styling", () => {
      expect(sourceCode).toContain("featureLabelContainer");
      const labelSection = sourceCode.substring(
        sourceCode.indexOf("featureLabelContainer"),
        sourceCode.indexOf("featureLabelContainer") + 300
      );
      expect(labelSection).toContain("palette.accentSurface");
      expect(labelSection).toContain("palette.accentBorder");
    });

    it("includes optional action button", () => {
      expect(sourceCode).toContain("feature.action");
      expect(sourceCode).toContain("featureAction");
    });
  });

  describe("Ready Section", () => {
    it("includes 'You're All Set' section", () => {
      expect(sourceCode).toContain('t("screen.onboarding.ready.title")');
      expect(sourceCode).toContain("readySection");
    });

    it("includes encouraging completion message", () => {
      expect(sourceCode).toContain('t("screen.onboarding.ready.description")');
      expect(sourceCode).toContain('t("screen.onboarding.ready.button")');
    });

    it("applies semantic styling to ready section", () => {
      const readySection = sourceCode.substring(
        sourceCode.indexOf("readySection"),
        sourceCode.indexOf("readySection") + 400
      );
      expect(readySection).toContain("palette.accentSurface");
      expect(readySection).toContain("palette.accentBorder");
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
      expect(sourceCode.match(/LiquidGlassSpacing\./g)!.length).toBeGreaterThanOrEqual(20);
    });

    it("does not use hardcoded numeric spacing", () => {
      const styles = sourceCode.substring(sourceCode.indexOf("const styles"));
      // Allow only 0, 1, 2, 21, 24 for specific props (borderRadius, lineHeight, etc.)
      const numericSpacingPattern = /(?:padding|margin|gap|top|bottom|left|right)(?:Horizontal|Vertical)?:\s*(?!0\b|1\b|2\b)\d+/g;
      expect(styles.match(numericSpacingPattern)).toBeNull();
    });
  });

  describe("Semantic Color Usage", () => {
    it("uses semantic surface colors", () => {
      expect(sourceCode).toContain("palette.surface");
      expect(sourceCode).toContain("palette.accentSurface");
    });

    it("uses semantic border colors", () => {
      expect(sourceCode).toContain("palette.border");
      expect(sourceCode).toContain("palette.accentBorder");
    });

    it("uses semantic text colors", () => {
      expect(sourceCode).toContain("palette.textPrimary");
      expect(sourceCode).toContain("palette.textSecondary");
    });

    it("uses semantic accent colors", () => {
      expect(sourceCode).toContain("palette.accentTint");
      expect(sourceCode).toContain("palette.solid");
    });
  });

  describe("Typography Usage", () => {
    it("uses displayMedium for header", () => {
      expect(sourceCode).toContain("typography.displayMedium");
    });

    it("uses title1 for main title", () => {
      expect(sourceCode).toContain("typography.title1");
    });

    it("uses title3 for ready section title", () => {
      expect(sourceCode).toContain("typography.title3");
    });

    it("uses headline for feature titles", () => {
      expect(sourceCode).toContain("typography.headline");
    });

    it("uses callout for descriptions", () => {
      expect(sourceCode).toContain("typography.callout");
    });

    it("uses caption1 for labels", () => {
      expect(sourceCode).toContain("typography.caption1");
    });

    it("uses footnote for action buttons", () => {
      expect(sourceCode).toContain("typography.footnote");
    });
  });

  describe("Component Structure", () => {
    it("includes header section", () => {
      expect(sourceCode).toContain("headerSection");
      expect(sourceCode).toContain('t("screen.onboarding.header.title")');
      expect(sourceCode).toContain('t("screen.onboarding.header.subtitle")');
    });

    it("includes features grid", () => {
      expect(sourceCode).toContain("featuresGrid");
      expect(sourceCode).toContain("features.map");
    });

    it("uses ScrollView for content", () => {
      expect(sourceCode).toContain("ScrollView");
      expect(sourceCode).toContain("showsVerticalScrollIndicator={false}");
    });

    it("includes OnboardingNavigation with translation", () => {
      expect(sourceCode).toContain("OnboardingNavigation");
      expect(sourceCode).toContain('nextButtonText={t("screen.onboarding.ready.button")}');
      expect(sourceCode).toContain("showSkip={false}");
      expect(sourceCode).toContain("showBack={false}");
    });
  });

  describe("Code Quality", () => {
    it("uses StyleSheet.create for performance", () => {
      expect(sourceCode).toContain("StyleSheet.create");
    });

    it("applies styles with array syntax for composition", () => {
      expect(sourceCode.match(/style=\{\[/g)!.length).toBeGreaterThan(12);
    });

    it("passes palette and typography to FeatureCard", () => {
      expect(sourceCode).toContain("palette={palette}");
      expect(sourceCode).toContain("typography={typography}");
    });

    it("handles GitHub link properly", () => {
      expect(sourceCode).toContain("Linking.openURL");
    });
  });

  describe("Accessibility", () => {
    it("uses appropriate activeOpacity for touch feedback", () => {
      expect(sourceCode).toContain("activeOpacity={0.7}");
    });

    it("applies proper text alignment for readability", () => {
      const styles = sourceCode.substring(sourceCode.indexOf("const styles"));
      expect(styles).toContain('textAlign: "center"');
    });

    it("uses semantic fontWeight values", () => {
      expect(sourceCode).toContain('"600"');
      expect(sourceCode).toContain('"700"');
    });
  });
});
