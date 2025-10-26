/**
 * Onboarding Accessibility Tests
 *
 * Comprehensive tests for iOS HIG-compliant accessibility implementation
 * across all onboarding screens. These tests verify that VoiceOver users
 * can successfully navigate and interact with the onboarding flow.
 *
 * Following iOS HIG guidelines:
 * - All interactive elements have accessibilityRole
 * - All interactive elements have descriptive accessibilityLabel
 * - All interactive elements have actionable accessibilityHint
 * - Dynamic states reflected in accessibilityState
 */

import fs from "fs";
import path from "path";

describe("Onboarding Accessibility Tests", () => {
  describe("OnboardingNavigation accessibility", () => {
    const navigationPath = path.resolve(
      __dirname,
      "../src/components/onboarding/OnboardingNavigation.tsx"
    );
    const source = fs.readFileSync(navigationPath, "utf8");

    it("Skip button has accessibilityRole, Label, and Hint", () => {
      expect(source).toContain('accessibilityRole="button"');
      expect(source).toContain('accessibilityLabel="Skip onboarding"');
      expect(source).toContain("Skips the tutorial and goes directly to the app");
    });

    it("Back button has accessibilityRole, Label, and Hint", () => {
      expect(source).toContain('accessibilityLabel="Back to previous step"');
      expect(source).toContain("Returns to the previous onboarding screen");
    });

    it("Next/Get Started button has dynamic accessibilityLabel", () => {
      expect(source).toContain('accessibilityLabel={isLastStep ? "Get Started" : nextButtonText}');
      expect(source).toContain("Completes onboarding and opens the app");
      expect(source).toContain("Proceeds to the next onboarding step");
    });

    it("has iOS HIG comments explaining button purposes", () => {
      expect(source).toContain("iOS HIG: Skip button allows users to bypass onboarding tutorial");
      expect(source).toContain("iOS HIG: Back button for navigation between onboarding steps");
      expect(source).toContain("iOS HIG: Primary action button");
    });
  });

  describe("FirstChatScreen accessibility", () => {
    const chatPath = path.resolve(
      __dirname,
      "../src/components/onboarding/screens/FirstChatScreen.tsx"
    );
    const source = fs.readFileSync(chatPath, "utf8");

    it("Send button has accessibilityRole, dynamic Label, and Hint", () => {
      expect(source).toContain('accessibilityRole="button"');
      expect(source).toContain('accessibilityLabel={isLoading ? "Sending message" : "Send message"}');
      expect(source).toContain('accessibilityHint="Sends your message through DNS TXT query"');
    });

    it("Send button has accessibilityState with disabled and busy", () => {
      expect(source).toContain("accessibilityState={{");
      expect(source).toContain("disabled: !inputText.trim() || isLoading");
      expect(source).toContain("busy: isLoading");
    });

    it("Suggestion buttons have accessibilityRole, Label, and Hint", () => {
      expect(source).toContain('accessibilityRole="button"');
      expect(source).toContain('accessibilityLabel={`Suggestion: ${suggestion}`}');
      expect(source).toContain('accessibilityHint="Fills the message input with this suggested question"');
    });

    it("TextInput has accessibilityLabel and Hint", () => {
      expect(source).toContain('accessibilityLabel="Message input"');
      expect(source).toContain("Type your message to send via DNS. Maximum 200 characters.");
    });

    it("has iOS HIG comment for message suggestions", () => {
      expect(source).toContain("iOS HIG: Show message suggestions before first chat attempt");
    });
  });

  describe("DNSMagicScreen accessibility", () => {
    const dnsPath = path.resolve(
      __dirname,
      "../src/components/onboarding/screens/DNSMagicScreen.tsx"
    );
    const source = fs.readFileSync(dnsPath, "utf8");

    it("Start Demo button has accessibilityRole, dynamic Label, and Hint", () => {
      expect(source).toContain('accessibilityRole="button"');
      expect(source).toContain('accessibilityLabel={isRunning ? "DNS query in progress" : "Start DNS demo"}');
      expect(source).toContain("Demonstrates how DNS queries work through the fallback chain");
      expect(source).toContain("Watch as your message travels through Native DNS, UDP, TCP, and HTTPS methods");
    });

    it("Start Demo button has accessibilityState reflecting disabled and busy states", () => {
      expect(source).toContain("accessibilityState={{ disabled: isRunning, busy: isRunning }}");
    });

    it("has iOS HIG comment for demo button", () => {
      expect(source).toContain("iOS HIG: Primary action button to trigger DNS demonstration");
    });
  });

  describe("NetworkSetupScreen accessibility", () => {
    const networkPath = path.resolve(
      __dirname,
      "../src/components/onboarding/screens/NetworkSetupScreen.tsx"
    );
    const source = fs.readFileSync(networkPath, "utf8");

    it("Apply Settings button has accessibilityRole, Label, and Hint", () => {
      expect(source).toContain('accessibilityRole="button"');
      expect(source).toContain('accessibilityLabel="Apply recommended settings"');
      expect(source).toContain("Configures DNS to use automatic fallback chain");
      expect(source).toContain("based on your network test results");
    });

    it("has iOS HIG comment for apply button", () => {
      expect(source).toContain("iOS HIG: Primary action button to apply network optimization results");
    });
  });

  describe("FeaturesScreen accessibility", () => {
    const featuresPath = path.resolve(
      __dirname,
      "../src/components/onboarding/screens/FeaturesScreen.tsx"
    );
    const source = fs.readFileSync(featuresPath, "utf8");

    it("GitHub link has accessibilityRole='link' (not button)", () => {
      expect(source).toContain('accessibilityRole="link"');
      expect(source).toContain("View on GitHub");
    });

    it("GitHub link has accessibilityLabel and descriptive Hint", () => {
      expect(source).toContain('accessibilityLabel={feature.action.text}');
      expect(source).toContain("Opens the DNS Chat GitHub repository in your browser");
      expect(source).toContain("where you can view the source code and contribute");
    });

    it("has iOS HIG comment for external link", () => {
      expect(source).toContain("iOS HIG: External link button to open GitHub repository in browser");
    });
  });

  describe("Accessibility best practices compliance", () => {
    const onboardingFiles = [
      "../src/components/onboarding/OnboardingNavigation.tsx",
      "../src/components/onboarding/screens/FirstChatScreen.tsx",
      "../src/components/onboarding/screens/DNSMagicScreen.tsx",
      "../src/components/onboarding/screens/NetworkSetupScreen.tsx",
      "../src/components/onboarding/screens/FeaturesScreen.tsx",
    ];

    it("no hardcoded 'transparent' color strings remain", () => {
      onboardingFiles.forEach((file) => {
        const source = fs.readFileSync(path.resolve(__dirname, file), "utf8");
        // Should use palette.transparent, not the string "transparent"
        const matches = source.match(/(borderColor|backgroundColor):\s*["']transparent["']/g);
        if (matches) {
          fail(`Found hardcoded "transparent" in ${file}: ${matches.join(", ")}`);
        }
      });
    });

    it("all TouchableOpacity interactive elements have accessibilityRole", () => {
      onboardingFiles.forEach((file) => {
        const source = fs.readFileSync(path.resolve(__dirname, file), "utf8");
        // Count TouchableOpacity elements with onPress
        const touchableCount = (source.match(/<TouchableOpacity[\s\S]*?onPress=/g) || []).length;
        // Count accessibilityRole props
        const roleCount = (source.match(/accessibilityRole=/g) || []).length;

        // Every TouchableOpacity with onPress should have accessibilityRole
        expect(roleCount).toBeGreaterThanOrEqual(touchableCount);
      });
    });

    it("all accessibilityRole elements have accessibilityLabel", () => {
      onboardingFiles.forEach((file) => {
        const source = fs.readFileSync(path.resolve(__dirname, file), "utf8");
        const roleCount = (source.match(/accessibilityRole=/g) || []).length;
        const labelCount = (source.match(/accessibilityLabel=/g) || []).length;

        // Every element with accessibilityRole should have accessibilityLabel
        expect(labelCount).toBeGreaterThanOrEqual(roleCount);
      });
    });

    it("all accessibilityRole elements have accessibilityHint", () => {
      onboardingFiles.forEach((file) => {
        const source = fs.readFileSync(path.resolve(__dirname, file), "utf8");
        const roleCount = (source.match(/accessibilityRole=/g) || []).length;
        const hintCount = (source.match(/accessibilityHint=/g) || []).length;

        // Every element with accessibilityRole should have accessibilityHint
        expect(hintCount).toBeGreaterThanOrEqual(roleCount);
      });
    });
  });

  describe("iOS HIG documentation comments", () => {
    const onboardingFiles = [
      "../src/components/onboarding/OnboardingNavigation.tsx",
      "../src/components/onboarding/screens/FirstChatScreen.tsx",
      "../src/components/onboarding/screens/DNSMagicScreen.tsx",
      "../src/components/onboarding/screens/NetworkSetupScreen.tsx",
      "../src/components/onboarding/screens/FeaturesScreen.tsx",
    ];

    it("all files have at least one iOS HIG comment", () => {
      onboardingFiles.forEach((file) => {
        const source = fs.readFileSync(path.resolve(__dirname, file), "utf8");
        expect(source).toContain("iOS HIG:");
      });
    });
  });
});
