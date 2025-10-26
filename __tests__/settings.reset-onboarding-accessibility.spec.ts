/**
 * Settings Reset Onboarding Button Accessibility Test
 *
 * Verifies that the "Reset Onboarding" button in Settings screen
 * has proper iOS HIG-compliant accessibility props for VoiceOver users.
 */

import fs from "fs";
import path from "path";

describe("Settings Reset Onboarding Button Accessibility", () => {
  const settingsPath = path.resolve(
    __dirname,
    "../src/navigation/screens/Settings.tsx"
  );
  const source = fs.readFileSync(settingsPath, "utf8");

  it("Reset Onboarding button has accessibilityRole", () => {
    const buttonSection = source.substring(
      source.indexOf("onPress={handleResetOnboarding}"),
      source.indexOf("onPress={handleResetOnboarding}") + 500
    );
    expect(buttonSection).toContain('accessibilityRole="button"');
  });

  it("Reset Onboarding button has accessibilityLabel", () => {
    const buttonSection = source.substring(
      source.indexOf("onPress={handleResetOnboarding}"),
      source.indexOf("onPress={handleResetOnboarding}") + 500
    );
    expect(buttonSection).toContain("accessibilityLabel={t(");
    expect(buttonSection).toContain("resetOnboardingTitle");
  });

  it("Reset Onboarding button has descriptive accessibilityHint", () => {
    const buttonSection = source.substring(
      source.indexOf("onPress={handleResetOnboarding}"),
      source.indexOf("onPress={handleResetOnboarding}") + 500
    );
    expect(buttonSection).toContain("accessibilityHint=");
    expect(buttonSection).toContain("Resets the onboarding tutorial");
    expect(buttonSection).toContain("view it again");
  });

  it("Reset Onboarding button has accessibilityState for disabled state", () => {
    const buttonSection = source.substring(
      source.indexOf("onPress={handleResetOnboarding}"),
      source.indexOf("onPress={handleResetOnboarding}") + 500
    );
    expect(buttonSection).toContain("accessibilityState={{");
    expect(buttonSection).toContain("disabled: saving || loading");
  });

  it("has iOS HIG comment explaining button purpose", () => {
    const buttonSection = source.substring(
      source.indexOf("onPress={handleResetOnboarding}") - 300,
      source.indexOf("onPress={handleResetOnboarding}") + 100
    );
    expect(buttonSection).toContain("iOS HIG:");
    expect(buttonSection).toContain("reset onboarding");
  });

  it("button is in Development section", () => {
    const devSection = source.substring(
      source.indexOf('sections.development.title'),
      source.indexOf('sections.development.title') + 1000
    );
    expect(devSection).toContain("handleResetOnboarding");
    expect(devSection).toContain("resetOnboardingTitle");
  });
});
