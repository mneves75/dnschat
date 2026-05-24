/**
 * Onboarding Screens i18n Integration Tests
 *
 * Verifies that all onboarding screens properly use the i18n translation system
 * and that all translation keys are defined in both en-US and pt-BR locales.
 *
 * Tests cover:
 * 1. WelcomeScreen - Basic welcome with features
 * 2. FirstChatScreen - Interactive chat demo with suggestions
 * 3. DNSMagicScreen - DNS fallback chain demonstration
 * 4. NetworkSetupScreen - Network optimization simulation
 * 5. FeaturesScreen - Full feature list and completion
 *
 * CRITICAL: All onboarding screens MUST respect user's system language (pt-BR/en-US).
 * This test suite validates the fix for the bug where screens only showed English.
 */

import fs from "fs";
import path from "path";
import { enUS as enUSMessages } from "../src/i18n/messages/en-US";
import { ptBR as ptBRMessages } from "../src/i18n/messages/pt-BR";

type NestedMessages = Record<string, unknown>;

describe("Onboarding i18n Integration", () => {
  const screensDir = path.resolve(__dirname, "../src/components/onboarding/screens");

  const screens = [
    { name: "WelcomeScreen", file: "WelcomeScreen.tsx" },
    { name: "FirstChatScreen", file: "FirstChatScreen.tsx" },
    { name: "DNSMagicScreen", file: "DNSMagicScreen.tsx" },
    { name: "NetworkSetupScreen", file: "NetworkSetupScreen.tsx" },
    { name: "FeaturesScreen", file: "FeaturesScreen.tsx" },
  ];

  describe("Translation Hook Integration", () => {
    screens.forEach(({ name, file }) => {
      describe(name, () => {
        let sourceCode: string;

        beforeAll(() => {
          const filePath = path.join(screensDir, file);
          sourceCode = fs.readFileSync(filePath, "utf8");
        });

        it("imports useTranslation hook", () => {
          expect(sourceCode).toContain('import { useTranslation } from "../../../i18n"');
        });

        it("calls useTranslation hook", () => {
          expect(sourceCode).toContain("const { t } = useTranslation()");
        });

        it("uses t() function for translations", () => {
          expect(sourceCode).toContain('t("screen.onboarding.');
        });

        it("does NOT contain hardcoded English text in JSX", () => {
          // Check for common hardcoded patterns that should be translated
          const hardcodedPatterns = [
            /<Text[^>]*>Welcome to DNS Chat</,
            /<Text[^>]*>Try Your First Chat</,
            /<Text[^>]*>DNS Magic in Action</,
            /<Text[^>]*>Network Optimization</,
            /<Text[^>]*>Powerful Features</,
          ];

          hardcodedPatterns.forEach((pattern) => {
            expect(sourceCode).not.toMatch(pattern);
          });
        });
      });
    });
  });

  describe("Translation Key Coverage - WelcomeScreen", () => {
    const requiredKeys = [
      "screen.onboarding.welcome.title",
      "screen.onboarding.welcome.subtitle",
      "screen.onboarding.welcome.features.revolutionary.label",
      "screen.onboarding.welcome.features.revolutionary.title",
      "screen.onboarding.welcome.features.revolutionary.description",
      "screen.onboarding.welcome.features.private.label",
      "screen.onboarding.welcome.features.private.title",
      "screen.onboarding.welcome.features.private.description",
      "screen.onboarding.welcome.features.fast.label",
      "screen.onboarding.welcome.features.fast.title",
      "screen.onboarding.welcome.features.fast.description",
    ];

    it("en-US has all required keys", () => {
      requiredKeys.forEach((key) => {
        expect(getNestedValue(enUSMessages, key)).toBeDefined();
        expect(typeof getNestedValue(enUSMessages, key)).toBe("string");
      });
    });

    it("pt-BR has all required keys", () => {
      requiredKeys.forEach((key) => {
        expect(getNestedValue(ptBRMessages, key)).toBeDefined();
        expect(typeof getNestedValue(ptBRMessages, key)).toBe("string");
      });
    });

    it("en-US and pt-BR translations are different", () => {
      expect(getNestedValue(enUSMessages, "screen.onboarding.welcome.title")).not.toBe(
        getNestedValue(ptBRMessages, "screen.onboarding.welcome.title")
      );
    });
  });

  describe("Translation Key Coverage - FirstChatScreen", () => {
    const requiredKeys = [
      "screen.onboarding.firstChat.label",
      "screen.onboarding.firstChat.title",
      "screen.onboarding.firstChat.subtitle",
      "screen.onboarding.firstChat.welcomeMessage",
      "screen.onboarding.firstChat.successMessage",
      "screen.onboarding.firstChat.suggestions.title",
      "screen.onboarding.firstChat.suggestions.option1",
      "screen.onboarding.firstChat.suggestions.option2",
      "screen.onboarding.firstChat.suggestions.option3",
      "screen.onboarding.firstChat.suggestions.option4",
      "screen.onboarding.firstChat.input.placeholder",
      "screen.onboarding.firstChat.input.send",
      "screen.onboarding.firstChat.input.sending",
      "screen.onboarding.firstChat.input.sendingVia",
      "screen.onboarding.firstChat.navigation.continue",
      "screen.onboarding.firstChat.navigation.skip",
    ];

    it("en-US has all required keys", () => {
      requiredKeys.forEach((key) => {
        expect(getNestedValue(enUSMessages, key)).toBeDefined();
        expect(typeof getNestedValue(enUSMessages, key)).toBe("string");
      });
    });

    it("pt-BR has all required keys", () => {
      requiredKeys.forEach((key) => {
        expect(getNestedValue(ptBRMessages, key)).toBeDefined();
        expect(typeof getNestedValue(ptBRMessages, key)).toBe("string");
      });
    });

    it("suggestions are translated differently", () => {
      expect(
        getNestedValue(enUSMessages, "screen.onboarding.firstChat.suggestions.option1")
      ).not.toBe(
        getNestedValue(ptBRMessages, "screen.onboarding.firstChat.suggestions.option1")
      );
    });
  });

  describe("Translation Key Coverage - DNSMagicScreen", () => {
    const requiredKeys = [
      "screen.onboarding.dnsMagic.label",
      "screen.onboarding.dnsMagic.title",
      "screen.onboarding.dnsMagic.subtitle",
      "screen.onboarding.dnsMagic.demoButton",
      "screen.onboarding.dnsMagic.demoButtonRunning",
      "screen.onboarding.dnsMagic.responseLabel",
      "screen.onboarding.dnsMagic.fallbackMethods.native.name",
      "screen.onboarding.dnsMagic.fallbackMethods.native.pending",
      "screen.onboarding.dnsMagic.fallbackMethods.native.active",
      "screen.onboarding.dnsMagic.fallbackMethods.native.success",
      "screen.onboarding.dnsMagic.fallbackMethods.native.failed",
      "screen.onboarding.dnsMagic.fallbackMethods.udp.name",
      "screen.onboarding.dnsMagic.fallbackMethods.tcp.name",
      "screen.onboarding.dnsMagic.fallbackMethods.https.name",
      "screen.onboarding.dnsMagic.status.pending",
      "screen.onboarding.dnsMagic.status.active",
      "screen.onboarding.dnsMagic.status.success",
      "screen.onboarding.dnsMagic.status.failed",
      "screen.onboarding.dnsMagic.demoResponse",
    ];

    it("en-US has all required keys", () => {
      requiredKeys.forEach((key) => {
        expect(getNestedValue(enUSMessages, key)).toBeDefined();
        expect(typeof getNestedValue(enUSMessages, key)).toBe("string");
      });
    });

    it("pt-BR has all required keys", () => {
      requiredKeys.forEach((key) => {
        expect(getNestedValue(ptBRMessages, key)).toBeDefined();
        expect(typeof getNestedValue(ptBRMessages, key)).toBe("string");
      });
    });

    it("DNS method names are translated", () => {
      expect(
        getNestedValue(enUSMessages, "screen.onboarding.dnsMagic.fallbackMethods.native.name")
      ).not.toBe(
        getNestedValue(ptBRMessages, "screen.onboarding.dnsMagic.fallbackMethods.native.name")
      );
    });

    it("status labels are translated", () => {
      expect(
        getNestedValue(enUSMessages, "screen.onboarding.dnsMagic.status.success")
      ).not.toBe(
        getNestedValue(ptBRMessages, "screen.onboarding.dnsMagic.status.success")
      );
    });
  });

  describe("Translation Key Coverage - NetworkSetupScreen", () => {
    const requiredKeys = [
      "screen.onboarding.networkSetup.label",
      "screen.onboarding.networkSetup.title",
      "screen.onboarding.networkSetup.subtitle",
      "screen.onboarding.networkSetup.disclaimer",
      "screen.onboarding.networkSetup.tests.native.name",
      "screen.onboarding.networkSetup.tests.native.description",
      "screen.onboarding.networkSetup.tests.udp.name",
      "screen.onboarding.networkSetup.tests.udp.description",
      "screen.onboarding.networkSetup.tests.tcp.name",
      "screen.onboarding.networkSetup.tests.tcp.description",
      "screen.onboarding.networkSetup.status.testing",
      "screen.onboarding.networkSetup.status.waiting",
      "screen.onboarding.networkSetup.status.success",
      "screen.onboarding.networkSetup.status.failed",
      "screen.onboarding.networkSetup.status.skipped",
      "screen.onboarding.networkSetup.optimization.title",
      "screen.onboarding.networkSetup.optimization.description",
      "screen.onboarding.networkSetup.optimization.applyButton",
      "screen.onboarding.networkSetup.optimization.loading",
      "screen.onboarding.networkSetup.navigation.continue",
      "screen.onboarding.networkSetup.navigation.skip",
      "screen.onboarding.networkSetup.alerts.errorTitle",
      "screen.onboarding.networkSetup.alerts.errorMessage",
      "screen.onboarding.networkSetup.alerts.successTitle",
      "screen.onboarding.networkSetup.alerts.successMessage",
      "screen.onboarding.networkSetup.alerts.successButton",
    ];

    it("en-US has all required keys", () => {
      requiredKeys.forEach((key) => {
        expect(getNestedValue(enUSMessages, key)).toBeDefined();
        expect(typeof getNestedValue(enUSMessages, key)).toBe("string");
      });
    });

    it("pt-BR has all required keys", () => {
      requiredKeys.forEach((key) => {
        expect(getNestedValue(ptBRMessages, key)).toBeDefined();
        expect(typeof getNestedValue(ptBRMessages, key)).toBe("string");
      });
    });

    it("Alert messages are translated", () => {
      expect(
        getNestedValue(enUSMessages, "screen.onboarding.networkSetup.alerts.successTitle")
      ).not.toBe(
        getNestedValue(ptBRMessages, "screen.onboarding.networkSetup.alerts.successTitle")
      );
    });
  });

  describe("Translation Key Coverage - FeaturesScreen", () => {
    const requiredKeys = [
      "screen.onboarding.header.label",
      "screen.onboarding.header.title",
      "screen.onboarding.header.subtitle",
      "screen.onboarding.features.logs.label",
      "screen.onboarding.features.logs.title",
      "screen.onboarding.features.logs.description",
      "screen.onboarding.features.customize.label",
      "screen.onboarding.features.customize.title",
      "screen.onboarding.features.customize.description",
      "screen.onboarding.features.liquidGlass.label",
      "screen.onboarding.features.liquidGlass.title",
      "screen.onboarding.features.liquidGlass.description",
      "screen.onboarding.features.i18n.label",
      "screen.onboarding.features.i18n.title",
      "screen.onboarding.features.i18n.description",
      "screen.onboarding.features.haptics.label",
      "screen.onboarding.features.haptics.title",
      "screen.onboarding.features.haptics.description",
      "screen.onboarding.features.themes.label",
      "screen.onboarding.features.themes.title",
      "screen.onboarding.features.themes.description",
      "screen.onboarding.features.storage.label",
      "screen.onboarding.features.storage.title",
      "screen.onboarding.features.storage.description",
      "screen.onboarding.features.fallbacks.label",
      "screen.onboarding.features.fallbacks.title",
      "screen.onboarding.features.fallbacks.description",
      "screen.onboarding.features.opensource.label",
      "screen.onboarding.features.opensource.title",
      "screen.onboarding.features.opensource.description",
      "screen.onboarding.features.opensource.action",
      "screen.onboarding.ready.title",
      "screen.onboarding.ready.description",
      "screen.onboarding.ready.button",
    ];

    it("en-US has all required keys", () => {
      requiredKeys.forEach((key) => {
        expect(getNestedValue(enUSMessages, key)).toBeDefined();
        expect(typeof getNestedValue(enUSMessages, key)).toBe("string");
      });
    });

    it("pt-BR has all required keys", () => {
      requiredKeys.forEach((key) => {
        expect(getNestedValue(ptBRMessages, key)).toBeDefined();
        expect(typeof getNestedValue(ptBRMessages, key)).toBe("string");
      });
    });

    it("feature descriptions are translated", () => {
      expect(
        getNestedValue(enUSMessages, "screen.onboarding.features.liquidGlass.description")
      ).not.toBe(
        getNestedValue(ptBRMessages, "screen.onboarding.features.liquidGlass.description")
      );
    });

    it("final button text is translated", () => {
      expect(
        getNestedValue(enUSMessages, "screen.onboarding.ready.button")
      ).not.toBe(
        getNestedValue(ptBRMessages, "screen.onboarding.ready.button")
      );
    });
  });

  describe("Translation Structure Consistency", () => {
    it("en-US and pt-BR have matching onboarding key structures", () => {
      const enKeys = getAllKeys(enUSMessages.screen.onboarding, "screen.onboarding");
      const ptKeys = getAllKeys(ptBRMessages.screen.onboarding, "screen.onboarding");

      // Both should have same keys
      expect(enKeys.sort()).toEqual(ptKeys.sort());
    });

    it("no missing translations in pt-BR", () => {
      const enKeys = getAllKeys(enUSMessages.screen.onboarding, "screen.onboarding");
      const ptKeys = getAllKeys(ptBRMessages.screen.onboarding, "screen.onboarding");

      const missingInPtBR = enKeys.filter((key) => !ptKeys.includes(key));
      expect(missingInPtBR).toEqual([]);
    });

    it("no extra translations in pt-BR", () => {
      const enKeys = getAllKeys(enUSMessages.screen.onboarding, "screen.onboarding");
      const ptKeys = getAllKeys(ptBRMessages.screen.onboarding, "screen.onboarding");

      const extraInPtBR = ptKeys.filter((key) => !enKeys.includes(key));
      expect(extraInPtBR).toEqual([]);
    });
  });

  describe("Dynamic Content Translation", () => {
    it("FirstChatScreen uses translated suggestions array", () => {
      const filePath = path.join(screensDir, "FirstChatScreen.tsx");
      const sourceCode = fs.readFileSync(filePath, "utf8");

      // Should build suggestions from translation keys
      expect(sourceCode).toContain('t("screen.onboarding.firstChat.suggestions.option1")');
      expect(sourceCode).toContain('t("screen.onboarding.firstChat.suggestions.option2")');
      expect(sourceCode).toContain('t("screen.onboarding.firstChat.suggestions.option3")');
      expect(sourceCode).toContain('t("screen.onboarding.firstChat.suggestions.option4")');
    });

    it("DNSMagicScreen initializes DNS steps with translations", () => {
      const filePath = path.join(screensDir, "DNSMagicScreen.tsx");
      const sourceCode = fs.readFileSync(filePath, "utf8");

      // Should initialize state with translated method names
      expect(sourceCode).toContain('t("screen.onboarding.dnsMagic.fallbackMethods.native.name")');
      expect(sourceCode).toContain('t("screen.onboarding.dnsMagic.fallbackMethods.udp.name")');
      expect(sourceCode).toContain('t("screen.onboarding.dnsMagic.fallbackMethods.tcp.name")');
    });

    it("NetworkSetupScreen initializes network tests with translations", () => {
      const filePath = path.join(screensDir, "NetworkSetupScreen.tsx");
      const sourceCode = fs.readFileSync(filePath, "utf8");

      // Should initialize state with translated test names
      expect(sourceCode).toContain('t("screen.onboarding.networkSetup.tests.native.name")');
      expect(sourceCode).toContain('t("screen.onboarding.networkSetup.tests.udp.name")');
      expect(sourceCode).toContain('t("screen.onboarding.networkSetup.tests.tcp.name")');
    });

    it("FeaturesScreen builds features array from translations", () => {
      const filePath = path.join(screensDir, "FeaturesScreen.tsx");
      const sourceCode = fs.readFileSync(filePath, "utf8");

      // Should build entire features array from translations
      expect(sourceCode).toContain('t("screen.onboarding.features.logs.label")');
      expect(sourceCode).toContain('t("screen.onboarding.features.customize.label")');
      expect(sourceCode).toContain('t("screen.onboarding.features.liquidGlass.label")');
      expect(sourceCode).toContain('t("screen.onboarding.features.opensource.action")');
    });
  });

  describe("Code Quality", () => {
    screens.forEach(({ name, file }) => {
      describe(name, () => {
        let sourceCode: string;

        beforeAll(() => {
          const filePath = path.join(screensDir, file);
          sourceCode = fs.readFileSync(filePath, "utf8");
        });

        it("does not contain hardcoded translation fallbacks", () => {
          // Should not have fallback English text like: t("key") || "English Fallback"
          expect(sourceCode).not.toMatch(/t\([^)]+\)\s*\|\|\s*["']/);
        });

        it("does not use conditional locale rendering", () => {
          // Should not have: locale === 'en-US' ? "English" : "Portuguese"
          expect(sourceCode).not.toMatch(/locale\s*===\s*["']en-US["']/);
          expect(sourceCode).not.toMatch(/locale\s*===\s*["']pt-BR["']/);
        });
      });
    });
  });

  describe("Translation Quality", () => {
    it("pt-BR translations are not just English text", () => {
      // Sample check - pt-BR should not be identical to en-US
      const enTitle = getNestedValue(enUSMessages, "screen.onboarding.welcome.title");
      const ptTitle = getNestedValue(ptBRMessages, "screen.onboarding.welcome.title");

      expect(enTitle).toBe("Welcome to DNS Chat");
      expect(ptTitle).not.toBe("Welcome to DNS Chat");
      expect(ptTitle).toBe("Bem-vindo ao DNS Chat");
    });

    it("pt-BR translations use Portuguese words", () => {
      const ptSubtitle = getNestedValue(ptBRMessages, "screen.onboarding.welcome.subtitle");

      // Check for common Portuguese words
      expect(ptSubtitle).toMatch(/aplicativo|comunicar|mundo/i);
    });
  });
});

// Helper Functions

function getNestedValue(obj: NestedMessages, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && !Array.isArray(current)) {
      const record = current as Record<string, unknown>;
      return record[key];
    }
    return undefined;
  }, obj);

  return typeof value === "string" ? value : undefined;
}

function getAllKeys(obj: NestedMessages, prefix: string = ""): string[] {
  const keys: string[] = [];

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (isNestedMessages(value)) {
      // Recurse into nested objects
      keys.push(...getAllKeys(value, fullKey));
    } else if (typeof value === "string") {
      // It's a translation string
      keys.push(fullKey);
    }
  });

  return keys;
}

function isNestedMessages(value: unknown): value is NestedMessages {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
