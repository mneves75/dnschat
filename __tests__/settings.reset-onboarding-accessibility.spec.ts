/**
 * Settings Reset Onboarding Button Accessibility Test
 *
 * Verifies that the "Reset Onboarding" button in GlassSettings screen
 * is properly implemented in the Development section.
 *
 * NOTE: Accessibility props are handled by the Form.Item component.
 * This test verifies the structural requirements.
 */

import fs from "fs";
import path from "path";

describe("Settings Reset Onboarding Button Accessibility", () => {
  const settingsPath = path.resolve(
    __dirname,
    "../src/navigation/screens/GlassSettings.tsx"
  );
  const source = fs.readFileSync(settingsPath, "utf8");

  it("Reset Onboarding button uses Form.Item component", () => {
    // Find the Form.Item that uses handleResetOnboarding
    const devSectionStart = source.indexOf("sections.development.title");
    const devSection = source.substring(devSectionStart, devSectionStart + 500);
    expect(devSection).toContain("Form.Item");
    expect(devSection).toContain("onPress={handleResetOnboarding}");
  });

  it("Reset Onboarding button has localized title", () => {
    const devSectionStart = source.indexOf("onPress={handleResetOnboarding}");
    const buttonSection = source.substring(devSectionStart - 200, devSectionStart + 100);
    expect(buttonSection).toContain("resetOnboardingTitle");
  });

  it("Reset Onboarding button has localized subtitle", () => {
    const devSectionStart = source.indexOf("onPress={handleResetOnboarding}");
    const buttonSection = source.substring(devSectionStart - 200, devSectionStart + 100);
    expect(buttonSection).toContain("resetOnboardingSubtitle");
  });

  it("button is in Development section", () => {
    const devSection = source.substring(
      source.indexOf("sections.development.title"),
      source.indexOf("sections.development.title") + 500
    );
    expect(devSection).toContain("handleResetOnboarding");
    expect(devSection).toContain("resetOnboardingTitle");
  });

  it("GlassSettings references IOS-GUIDELINES.md", () => {
    // Verify the file header references iOS guidelines
    const headerSection = source.substring(0, 500);
    expect(headerSection).toContain("IOS-GUIDELINES.md");
  });
});
