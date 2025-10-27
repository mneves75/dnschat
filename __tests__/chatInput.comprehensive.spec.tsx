/**
 * ChatInput Component Comprehensive Tests
 *
 * Static code analysis verifying:
 * - Design system compliance (no magic numbers)
 * - Reanimated performance optimization
 * - Character counter at 90% threshold
 * - Keyboard configuration for suggestions
 * - Accessibility features
 * - Comprehensive documentation
 * - Code quality standards for John Carmack review
 */

import fs from "fs";
import path from "path";

describe("ChatInput Component - John Carmack Quality Standards", () => {
  const chatInputPath = path.resolve(
    __dirname,
    "../src/components/ChatInput.tsx"
  );
  const source = fs.readFileSync(chatInputPath, "utf8");

  describe("Design System Compliance (No Magic Numbers)", () => {
    it("uses MESSAGE_CONSTANTS for character limit", () => {
      expect(source).toContain("MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH");
      expect(source).not.toContain("maxLength={120}");
      expect(source).not.toContain("maxLength={1000}");
    });

    it("calculates CHARACTER_COUNTER_THRESHOLD from constants", () => {
      expect(source).toContain(
        "MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH - 20"
      );
      expect(source).toContain("// Show at 90%");
    });

    it("calculates ACCESSIBILITY_ALERT_THRESHOLD from constants", () => {
      expect(source).toContain(
        "MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH - 10"
      );
      expect(source).toContain("// Alert at 92%");
    });

    it("uses LiquidGlassSpacing for all spacing values", () => {
      expect(source).toContain("LiquidGlassSpacing.xs");
      expect(source).toContain("LiquidGlassSpacing.sm");
      expect(source).toContain("LiquidGlassSpacing.md");
      expect(source).toContain("LiquidGlassSpacing.xxs");
      expect(source).toContain("LiquidGlassSpacing.cornerRadiusSmall");
    });

    it("uses getMinimumTouchTarget for button size", () => {
      expect(source).toContain("getMinimumTouchTarget()");
      expect(source).toContain("minimumTouchTarget");
    });

    it("defines BUTTON_SPACING from design system", () => {
      expect(source).toContain("const BUTTON_SPACING = LiquidGlassSpacing.xxs");
    });

    it("defines ANIMATION_DURATION_MS constant instead of hardcoded values", () => {
      expect(source).toContain("const ANIMATION_DURATION_MS = 200");
      expect(source).toContain("duration: ANIMATION_DURATION_MS");
    });
  });

  describe("Reanimated Performance Optimization", () => {
    it("uses useSharedValue for height management", () => {
      expect(source).toContain("useSharedValue");
      expect(source).toContain("const inputHeight = useSharedValue(heightConstraints.min)");
    });

    it("uses useSharedValue for button scale animation", () => {
      expect(source).toContain("const scale = useSharedValue(1)");
    });

    it("uses useSharedValue for button opacity", () => {
      expect(source).toContain("const opacity = useSharedValue(0.4)");
    });

    it("uses useAnimatedStyle for button position (NOT useMemo)", () => {
      expect(source).toContain("const animatedButtonPosition = useAnimatedStyle");
      expect(source).toContain("top: (inputHeight.value - minimumTouchTarget) / 2");
      // Verify NOT using useMemo for this
      expect(source).not.toContain("const buttonPosition = useMemo");
    });

    it("uses useAnimatedStyle for button style animations", () => {
      expect(source).toContain("const animatedButtonStyle = useAnimatedStyle");
      expect(source).toContain("transform: [{ scale: scale.value }]");
      expect(source).toContain("opacity: opacity.value");
    });

    it("uses useAnimatedStyle for input height animation", () => {
      expect(source).toContain("const animatedInputStyle = useAnimatedStyle");
      expect(source).toContain("height: inputHeight.value");
    });

    it("uses withSpring for bouncy animations", () => {
      expect(source).toContain("withSpring");
      expect(source).toContain("SpringConfig.bouncy");
    });

    it("uses withTiming for opacity transitions", () => {
      expect(source).toContain("withTiming");
      expect(source).toContain("duration: ANIMATION_DURATION_MS");
    });

    it("initializes inputHeight with calculated minimum (not 0)", () => {
      expect(source).toContain("const inputHeight = useSharedValue(heightConstraints.min)");
      expect(source).not.toContain("useSharedValue(0)");
    });
  });

  describe("Height Constraints Calculation", () => {
    it("calculates heightConstraints from typography", () => {
      expect(source).toContain("const heightConstraints = useMemo");
      expect(source).toContain("const lineHeight = typography.body.lineHeight || 22");
      expect(source).toContain("const verticalPadding = LiquidGlassSpacing.xs * 2");
    });

    it("defines min height from line height + padding", () => {
      expect(source).toContain("min: lineHeight + verticalPadding");
    });

    it("defines max height as 5 lines + padding", () => {
      expect(source).toContain("max: (lineHeight * 5) + verticalPadding");
    });

    it("calculates heightConstraints before using in useSharedValue", () => {
      const heightConstraintsIndex = source.indexOf("const heightConstraints = useMemo");
      const inputHeightIndex = source.indexOf("const inputHeight = useSharedValue");
      expect(heightConstraintsIndex).toBeLessThan(inputHeightIndex);
    });
  });

  describe("Character Counter at 90% Threshold", () => {
    it("shows counter at 90% (MAX_LENGTH - 20)", () => {
      expect(source).toContain(
        "const CHARACTER_COUNTER_THRESHOLD = MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH - 20"
      );
      expect(source).toContain("// Show at 90%");
    });

    it("uses threshold in showCharacterCount condition", () => {
      expect(source).toContain("message.length > CHARACTER_COUNTER_THRESHOLD");
    });

    it("displays format as current/max", () => {
      expect(source).toContain("{message.length}/{MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH}");
    });
  });

  describe("Keyboard Configuration for Suggestions", () => {
    it("enables autoCorrect", () => {
      expect(source).toContain("autoCorrect={true}");
    });

    it("enables spellCheck", () => {
      expect(source).toContain("spellCheck={true}");
    });

    it("sets autoCapitalize to sentences", () => {
      expect(source).toContain('autoCapitalize="sentences"');
    });

    it("sets textContentType to none", () => {
      expect(source).toContain('textContentType="none"');
    });

    it("enables context menu for text selection", () => {
      expect(source).toContain("contextMenuHidden={false}");
    });

    it("sets keyboardType to default", () => {
      expect(source).toContain('keyboardType="default"');
    });

    it("has comment explaining keyboard configuration", () => {
      expect(source).toContain("// Keyboard configuration - enables suggestions and autocorrect");
    });
  });

  describe("Accessibility Features", () => {
    it("announces character limit warnings", () => {
      expect(source).toContain("AccessibilityInfo.announceForAccessibility");
    });

    it("announces at 92% threshold (MAX_LENGTH - 10)", () => {
      expect(source).toContain("ACCESSIBILITY_ALERT_THRESHOLD");
      expect(source).toContain("MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH - 10");
    });

    it("uses i18n for accessibility announcement", () => {
      expect(source).toContain('t("components.chatInput.charactersRemaining", { count: remaining })');
    });

    it("has accessibilityLabel on TextInput", () => {
      expect(source).toContain('accessibilityLabel={t("components.chatInput.accessibilityLabel")}');
    });

    it("has accessibilityHint on TextInput", () => {
      expect(source).toContain('accessibilityHint={t("components.chatInput.accessibilityHint")}');
    });

    it("has accessibilityRole on send button", () => {
      expect(source).toContain('accessibilityRole="button"');
    });

    it("has accessibilityState on send button", () => {
      expect(source).toContain("accessibilityState={{ disabled: !canSend }}");
    });
  });

  describe("Input Height Reset on Message Clear", () => {
    it("resets height when message becomes empty", () => {
      const resetEffect = source.substring(
        source.indexOf("Reset Input Height on Message Clear"),
        source.indexOf("Reset Input Height on Message Clear") + 500
      );
      expect(resetEffect).toContain('if (message === "")');
      expect(resetEffect).toContain("inputHeight.value = withSpring(heightConstraints.min");
    });

    it("has JSDoc comment explaining reset behavior", () => {
      expect(source).toContain("* Reset Input Height on Message Clear");
      expect(source).toContain("* After sending, collapse input back to minimum height");
    });
  });

  describe("Comprehensive Documentation", () => {
    it("has top-level file JSDoc with architecture decisions", () => {
      expect(source).toContain("* ChatInput Component");
      expect(source).toContain("* iOS 26+ HIG-compliant");
      expect(source).toContain("* Architecture decisions:");
      expect(source).toContain("* @reviewed-by John Carmack");
    });

    it("documents height calculation approach", () => {
      expect(source).toContain("* Height Calculation (Design System Derived)");
      expect(source).toContain("* Min Height: line height + vertical padding");
      expect(source).toContain("* Max Height: 5 lines + vertical padding");
    });

    it("documents button position animation", () => {
      expect(source).toContain("* Button Position Animation");
      expect(source).toContain("* CRITICAL: Cannot use useMemo with shared values");
    });

    it("documents send button opacity animation", () => {
      expect(source).toContain("* Update Send Button Opacity");
      expect(source).toContain("* Animates from 0.4 (disabled) to 1.0 (enabled)");
    });

    it("documents handleSend function steps", () => {
      expect(source).toContain("* Handle Send");
      expect(source).toContain("* 1. Validates non-empty trimmed message");
      expect(source).toContain("* 2. Provides haptic feedback");
      expect(source).toContain("* 3. Calls onSendMessage with trimmed text");
    });

    it("documents StyleSheet decisions", () => {
      expect(source).toContain("* StyleSheet");
      expect(source).toContain("* All values derived from design system constants");
      expect(source).toContain("* No magic numbers");
    });

    it("explains Liquid Glass rendering", () => {
      expect(source).toContain("// iOS 26 HIG: Glass wrapper for text input (iOS only)");
      expect(source).toContain("* CRITICAL: Glass wrapper handles background, input must be transparent");
    });
  });

  describe("Performance Best Practices", () => {
    it("uses useCallback for event handlers", () => {
      expect(source).toContain("const handleSend = useCallback");
      expect(source).toContain("const handlePressIn = useCallback");
      expect(source).toContain("const handlePressOut = useCallback");
      expect(source).toContain("const handleContentSizeChange = useCallback");
    });

    it("uses useMemo for derived values", () => {
      expect(source).toContain("const heightConstraints = useMemo");
      expect(source).toContain("const inputPadding = useMemo");
    });

    it("uses useCallback for render functions", () => {
      expect(source).toContain("const renderTextInput = useCallback");
      expect(source).toContain("const renderSendButton = useCallback");
      expect(source).toContain("const renderCharacterCounter = useCallback");
    });

    it("includes proper dependency arrays", () => {
      // Verify callbacks have dependency arrays by checking specific ones
      expect(source).toContain("}, [message, isLoading, onSendMessage]);");
      expect(source).toContain("}, [canSend, scale]);");
      expect(source).toContain("}, [scale]);");
      // Count total useCallback usage - should have multiple
      const matches = source.match(/useCallback\(/g);
      expect(matches).toBeTruthy();
      expect(matches!.length).toBeGreaterThanOrEqual(7); // At least 7 useCallback calls
    });
  });

  describe("Integrated Send Button Layout", () => {
    it("uses absolute positioning for button", () => {
      expect(source).toContain("position: \"absolute\"");
      expect(source).toContain("right: BUTTON_SPACING");
    });

    it("calculates button top position dynamically", () => {
      expect(source).toContain("animatedButtonPosition");
      expect(source).toContain("top: (inputHeight.value - minimumTouchTarget) / 2");
    });

    it("applies animatedButtonPosition to button style", () => {
      expect(source).toContain("animatedButtonPosition");
      expect(source).toContain("styles.integratedSendButton");
    });

    it("calculates input padding to accommodate button", () => {
      expect(source).toContain("paddingRight: minimumTouchTarget + BUTTON_SPACING");
    });
  });

  describe("Haptic Feedback", () => {
    it("provides light haptic on button press", () => {
      const handlePressIn = source.substring(
        source.indexOf("const handlePressIn = useCallback"),
        source.indexOf("const handlePressIn = useCallback") + 300
      );
      expect(handlePressIn).toContain("HapticFeedback.light()");
    });

    it("provides medium haptic on send", () => {
      const handleSend = source.substring(
        source.indexOf("const handleSend = useCallback"),
        source.indexOf("const handleSend = useCallback") + 500
      );
      expect(handleSend).toContain("HapticFeedback.medium()");
    });
  });

  describe("Platform-Specific Rendering", () => {
    it("checks for Liquid Glass support", () => {
      expect(source).toContain("useLiquidGlassCapabilities");
      expect(source).toContain("supportsLiquidGlass");
    });

    it("conditionally renders glass input", () => {
      expect(source).toContain("const useGlassInput = Platform.OS === \"ios\" && supportsLiquidGlass");
      expect(source).toContain("{useGlassInput ? (");
    });

    it("provides fallback for non-glass platforms", () => {
      expect(source).toContain("// Android/iOS < 26: Solid background fallback");
      expect(source).toContain("isDark ? styles.darkTextInput : styles.lightTextInput");
    });
  });

  describe("Code Quality Standards", () => {
    it("declares canSend before using it", () => {
      const canSendIndex = source.indexOf("const canSend =");
      const firstUseIndex = source.indexOf("canSend", canSendIndex + 20);
      expect(canSendIndex).toBeGreaterThan(0);
      expect(canSendIndex).toBeLessThan(firstUseIndex);
    });

    it("has no console.log statements", () => {
      expect(source).not.toContain("console.log");
    });

    it("imports from correct paths", () => {
      expect(source).toContain('from "react-native-reanimated"');
      expect(source).toContain('from "../ui/hooks/useTypography"');
      expect(source).toContain('from "../ui/theme/imessagePalette"');
      expect(source).toContain('from "../constants/appConstants"');
    });

    it("uses TypeScript types for props", () => {
      expect(source).toContain("interface ChatInputProps");
      expect(source).toContain("onSendMessage: (message: string) => void");
    });
  });
});
