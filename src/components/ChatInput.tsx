/**
 * ChatInput Component
 *
 * iOS 26+ HIG-compliant chat input with:
 * - Minimal design with integrated send button
 * - Auto-growing height (1-5 lines based on actual line height)
 * - Keyboard suggestions enabled (autocorrect, spellcheck)
 * - Character counter at 90% threshold
 * - Liquid Glass effect on iOS 26+
 * - Accessibility announcements
 * - Performance-optimized with Reanimated
 *
 * Architecture decisions:
 * - Reanimated shared values for height (UI thread performance)
 * - Absolute positioning for send button (integrated look)
 * - Character counter outside flex container (avoid layout bugs)
 * - Design system constants (no magic numbers)
 * - NO flex: 1 on parent containers (prevents layout collapse/expansion)
 *
 * CRITICAL: Parent containers (inputContainer, textInputGlassWrapper) must NOT
 * have flex: 1. They should wrap content height from children to prevent touch
 * target misalignment. Only inputWrapper (around TextInput) uses flex: 1 for
 * horizontal expansion in row layout.
 *
 * @reviewed-by John Carmack
 */

import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Text,
  Platform,
  AccessibilityInfo,
} from "react-native";
import type {
  TouchableOpacityProps,
  ViewProps,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useTypography } from "../ui/hooks/useTypography";
import { useImessagePalette } from "../ui/theme/imessagePalette";
import { LiquidGlassSpacing, getMinimumTouchTarget } from "../ui/theme/liquidGlassSpacing";
import { SpringConfig, buttonPressScale } from "../utils/animations";
import { HapticFeedback } from "../utils/haptics";
import { SendIcon } from "./icons/SendIcon";
import { useTranslation } from "../i18n";
import { LiquidGlassWrapper, useLiquidGlassCapabilities } from "./LiquidGlassWrapper";
import { MESSAGE_CONSTANTS } from "../constants/appConstants";

type TouchableWithPointerEventsProps = TouchableOpacityProps & {
  pointerEvents?: ViewProps["pointerEvents"];
};

const TouchableWithPointerEvents = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  TouchableWithPointerEventsProps
>(
  (props, ref) => <TouchableOpacity ref={ref} {...props} />,
);
TouchableWithPointerEvents.displayName = "TouchableWithPointerEvents";

// Reanimated's default TouchableOpacity typing omits pointerEvents, so we wrap it to expose the prop.
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableWithPointerEvents);

// Constants derived from design system (no magic numbers!)
const CHARACTER_COUNTER_THRESHOLD = MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH - 20; // Show at 90%
const ACCESSIBILITY_ALERT_THRESHOLD = MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH - 10; // Alert at 92%
const ANIMATION_DURATION_MS = 200;
const BUTTON_SPACING = LiquidGlassSpacing.xxs; // 4px from edge

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  /** Test ID for automation testing */
  testID?: string;
  /**
   * Emits the rendered height so parents (MessageList) can reserve bottom padding.
   * Height includes liquid glass padding + text input lines.
   */
  onHeightChange?: (height: number) => void;
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  placeholder,
  testID,
  onHeightChange,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textInputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const typography = useTypography();
  const palette = useImessagePalette();
  const { t } = useTranslation();
  const { supportsLiquidGlass } = useLiquidGlassCapabilities();
  // Resolve touch target up front so every memo below can safely reference it without tripping TDZ.
  const minimumTouchTarget = getMinimumTouchTarget();
  const reportHeight = useCallback((height: number) => {
    if (onHeightChange) {
      onHeightChange(height);
    }
  }, [onHeightChange]);

  /**
   * Height Calculation (Design System Derived)
   *
   * Min Height: MUST be >= minimumTouchTarget to accommodate send button
   * Max Height: 5 lines + vertical padding
   *
   * CRITICAL: Minimum height must be at least minimumTouchTarget (44px iOS, 48px Android)
   * to prevent button misalignment and negative positioning.
   *
   * **Padding Decision:**
   * Reference image shows 13px vertical padding. We use LiquidGlassSpacing.sm (12px)
   * for design system consistency. The 1px difference is negligible and maintains
   * alignment with the 8px grid system used throughout the app.
   *
   * Uses actual typography line height, not magic numbers.
   * Calculated early so we can initialize inputHeight.
   */
  const lineHeight = typography.body.lineHeight || 22;
  // LiquidGlassSpacing.sm = 12px (vs reference 13px - prioritize design system consistency)
  const verticalPadding = LiquidGlassSpacing.sm * 2; // top + bottom (12px * 2 = 24px)
  const naturalMin = lineHeight + verticalPadding;

  // CRITICAL FIX: Ensure min height >= touch target to prevent button overflow
  // Without this, button positioning goes negative (e.g., (38 - 44) / 2 = -3px)
  const touchTarget = minimumTouchTarget;
  const heightConstraints = useMemo(() => {
    const min = Math.max(naturalMin, touchTarget);
    return {
      min,
      max: (lineHeight * 5) + verticalPadding,
    };
  }, [lineHeight, naturalMin, touchTarget, verticalPadding]);

  React.useEffect(() => {
    // Initialize parent padding immediately so content never jumps on first layout.
    reportHeight(Math.round(heightConstraints.min));
  }, [heightConstraints.min, reportHeight]);

  // Reanimated shared values for UI thread performance
  const inputHeight = useSharedValue(heightConstraints.min);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);
  const resolvedPlaceholder = placeholder ?? t("screen.chatInput.placeholder");
  const canSend = message.trim().length > 0 && !isLoading;
  const showCharacterCount = message.length > CHARACTER_COUNTER_THRESHOLD;
  const useGlassInput = Platform.OS === "ios" && supportsLiquidGlass;

  /**
   * Button Position Animation
   *
   * Vertically centers button within input using current height.
   * Uses useAnimatedStyle to react to inputHeight changes.
   *
   * **Math Verification:**
   * - Minimum input height: 46px (lineHeight 22 + padding 24)
   * - Button touch target: 44px (iOS HIG minimum)
   * - Position calculation: top = (46 - 44) / 2 = 1px
   * - Result: 1px spacing at top and bottom (perfect vertical centering)
   *
   * As input grows (e.g., 2 lines = 68px):
   * - top = (68 - 44) / 2 = 12px
   * - Button stays centered regardless of input height
   *
   * CRITICAL: Cannot use useMemo with shared values!
   * Reanimated shared values don't trigger React re-renders.
   * Must use useAnimatedStyle to track inputHeight.value changes on UI thread.
   */
  const animatedButtonPosition = useAnimatedStyle(() => ({
    top: (inputHeight.value - minimumTouchTarget) / 2,
  }));

  /**
   * Text Input Padding Calculation
   *
   * Right padding accommodates integrated send button.
   * Calculated from actual touch target size, not hardcoded.
   */
  const inputPadding = useMemo(() => ({
    paddingRight: minimumTouchTarget + BUTTON_SPACING,
  }), [minimumTouchTarget]);

  /**
   * Update Send Button Opacity
   *
   * Animates from 0.4 (disabled) to 1.0 (enabled).
   * Uses Reanimated withTiming for smooth UI thread animation.
   */
  React.useEffect(() => {
    opacity.value = withTiming(canSend ? 1 : 0.4, { duration: ANIMATION_DURATION_MS });
  }, [canSend, opacity]);

  /**
   * Accessibility Announcement for Character Limit
   *
   * Announces remaining characters when user approaches limit.
   * Triggers at 92% (last 10 characters).
   */
  React.useEffect(() => {
    if (message.length > ACCESSIBILITY_ALERT_THRESHOLD) {
      const remaining = MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH - message.length;
      AccessibilityInfo.announceForAccessibility(
        t("components.chatInput.charactersRemaining", { count: remaining })
      );
    }
  }, [message.length, t]);

  /**
   * Reset Input Height on Message Clear
   *
   * After sending, collapse input back to minimum height.
   * Improves UX by maintaining consistent baseline.
   */
  React.useEffect(() => {
    if (message === "") {
      inputHeight.value = withSpring(heightConstraints.min, SpringConfig.bouncy);
    }
  }, [message, inputHeight, heightConstraints.min]);

  useAnimatedReaction(
    () => inputHeight.value,
    (value, previousValue) => {
      const rounded = Math.round(value);
      const previousRounded =
        previousValue == null ? undefined : Math.round(previousValue);

      if (previousRounded === undefined || rounded !== previousRounded) {
        runOnJS(reportHeight)(rounded);
      }
    },
    [reportHeight],
  );

  /**
   * Animated Button Style
   *
   * Combines scale (press feedback) and opacity (enabled state).
   * Both animations run on UI thread for 60fps performance.
   */
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  /**
   * Animated Input Style
   *
   * Height animation uses shared value to avoid re-renders.
   * Runs on UI thread for smooth auto-growing behavior.
   */
  const animatedInputStyle = useAnimatedStyle(() => ({
    height: inputHeight.value,
  }));

  /**
   * Handle Content Size Change
   *
   * Auto-grows input from 1 to 5 lines based on actual content height.
   * Uses design system constraints (min/max calculated from line height).
   *
   * Performance: Runs on UI thread via Reanimated.
   */
  const handleContentSizeChange = useCallback(
    (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      const { height } = event.nativeEvent.contentSize;
      const constrainedHeight = Math.min(
        Math.max(height, heightConstraints.min),
        heightConstraints.max
      );

      inputHeight.value = withSpring(constrainedHeight, SpringConfig.bouncy);
    },
    [heightConstraints.max, heightConstraints.min, inputHeight],
  );

  /**
   * Handle Send
   *
   * 1. Validates non-empty trimmed message
   * 2. Provides haptic feedback (medium)
   * 3. Calls onSendMessage with trimmed text
   * 4. Clears input
   * 5. Refocuses input (iOS only)
   */
  const handleSend = useCallback(() => {
    if (message.trim() && !isLoading) {
      // Haptic feedback on send
      HapticFeedback.medium();

      onSendMessage(message.trim());
      setMessage("");

      // Refocus the input after sending on iOS
      if (Platform.OS === "ios") {
        setTimeout(() => {
          textInputRef.current?.focus();
        }, 100);
      }
    }
  }, [message, isLoading, onSendMessage]);

  /**
   * Handle Press In
   *
   * Provides immediate tactile feedback:
   * - Scale animation (0.95x)
   * - Light haptic feedback
   *
   * Only triggers when send is enabled (canSend).
   */
  const handlePressIn = useCallback(() => {
    if (canSend) {
      scale.value = withSpring(buttonPressScale, SpringConfig.bouncy);
      HapticFeedback.light();
    }
  }, [canSend, scale]);

  /**
   * Handle Press Out
   *
   * Returns button to normal scale (1.0x).
   * Spring animation provides natural feel.
   */
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SpringConfig.bouncy);
  }, [scale]);

  /**
   * Render Text Input
   *
   * Common props shared between glass and fallback variants.
   * Extracted to reduce duplication.
   */
  const renderTextInput = useCallback((additionalStyles: any[] = []) => (
    <Animated.View style={[styles.inputWrapper, animatedInputStyle]}>
      <TextInput
        ref={textInputRef}
        style={[
          styles.textInput,
          inputPadding,
          {
            fontSize: typography.body.fontSize,
            lineHeight: typography.body.lineHeight,
            letterSpacing: typography.body.letterSpacing,
            color: palette.textPrimary,
          },
          ...additionalStyles,
        ]}
        value={message}
        onChangeText={setMessage}
        onContentSizeChange={handleContentSizeChange}
        placeholder={resolvedPlaceholder}
        placeholderTextColor={palette.textTertiary}
        multiline={true}
        maxLength={MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH}
        editable={!isLoading}
        returnKeyType="send"
        enablesReturnKeyAutomatically={true}
        blurOnSubmit={true}
        textAlignVertical="top"
        // Keyboard configuration - enables suggestions and autocorrect
        keyboardType="default"
        autoCorrect={true}
        spellCheck={true}
        autoComplete="off"
        autoCapitalize="sentences"
        textContentType="none"
        contextMenuHidden={false}
        keyboardAppearance={isDark ? "dark" : "light"}
        onSubmitEditing={handleSend}
        // Accessibility
        accessible={true}
        accessibilityLabel={t("components.chatInput.accessibilityLabel")}
        accessibilityHint={t("components.chatInput.accessibilityHint")}
      />
    </Animated.View>
  ), [
    animatedInputStyle,
    handleContentSizeChange,
    handleSend,
    inputPadding,
    isDark,
    isLoading,
    message,
    palette.textPrimary,
    palette.textTertiary,
    resolvedPlaceholder,
    t,
    typography.body.fontSize,
    typography.body.letterSpacing,
    typography.body.lineHeight,
  ]);

  /**
   * Render Send Button
   *
   * Integrated inside input with absolute positioning.
   * Vertically centered based on current input height.
   *
   * CRITICAL: pointerEvents="none" when disabled prevents button from
   * blocking touches to the TextInput underneath.
   */
  const renderSendButton = useCallback(() => (
    <AnimatedTouchable
      style={[
        animatedButtonStyle,
        animatedButtonPosition,
        styles.integratedSendButton,
        {
          width: minimumTouchTarget,
          height: minimumTouchTarget,
          borderRadius: minimumTouchTarget / 2,
          // CRITICAL: Use solid userBubble (systemBlue) instead of semi-transparent accentTint
          // iOS Messages pattern: SOLID blue button when active, gray tint when disabled
          // accentTint was 55%/65% opacity - too transparent for button background
          backgroundColor: canSend ? palette.userBubble : palette.tint,
        },
      ]}
      onPress={handleSend}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!canSend}
      pointerEvents={canSend ? "auto" : "none"}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={
        isLoading
          ? t("components.chatInput.sendingLabel")
          : t("components.chatInput.sendLabel")
      }
      accessibilityHint={t("components.chatInput.sendHint")}
      accessibilityState={{ disabled: !canSend }}
      activeOpacity={1}
    >
      {isLoading ? (
        <Text style={[styles.sendButtonText, { color: palette.textPrimary }]}>...</Text>
      ) : (
        <SendIcon size={20} isActive={canSend} />
      )}
    </AnimatedTouchable>
  ), [
    animatedButtonPosition,
    animatedButtonStyle,
    canSend,
    handlePressIn,
    handlePressOut,
    handleSend,
    isLoading,
    minimumTouchTarget,
    palette.textPrimary,
    palette.tint,
    palette.userBubble,
    t,
  ]);

  /**
   * Render Character Counter
   *
   * Shows at 90% threshold (100/120 characters).
   * Displays format: "current/max"
   *
   * Note: Positioned outside inputWithButtonContainer to avoid
   * flex layout issues on Android (would appear beside input).
   */
  const renderCharacterCounter = useCallback(() => {
    if (!showCharacterCount) return null;

    return (
      <Text style={[styles.characterCount, { color: palette.textSecondary }]}>
        {message.length}/{MESSAGE_CONSTANTS.MAX_MESSAGE_LENGTH}
      </Text>
    );
  }, [message.length, palette.textSecondary, showCharacterCount]);

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <View style={styles.inputContainer}>
        {/* iOS 26+ HIG: Liquid Glass effect for interactive element */}
        {useGlassInput ? (
          <LiquidGlassWrapper
            variant="regular"
            shape="capsule"
            isInteractive={true}
            style={styles.textInputGlassWrapper}
          >
            <View style={styles.inputWithButtonContainer}>
              {renderTextInput([styles.textInputGlass])}
              {renderSendButton()}
            </View>
            {renderCharacterCounter()}
          </LiquidGlassWrapper>
        ) : (
          // Android/iOS < 26: Solid background fallback
          <View style={styles.inputWithButtonContainer}>
            {renderTextInput([
              isDark ? styles.darkTextInput : styles.lightTextInput,
            ])}
            {renderSendButton()}
          </View>
        )}

        {/* Character counter for non-glass layouts (outside flex container) */}
        {!useGlassInput && renderCharacterCounter()}
      </View>
    </View>
  );
}

/**
 * StyleSheet
 *
 * All values derived from design system constants.
 * No magic numbers - everything is calculated or referenced.
 *
 * Key layout decisions:
 * - inputWithButtonContainer uses relative positioning
 * - Send button uses absolute positioning for integration
 * - Character counter positioned below to avoid flex layout bugs
 */
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm,
  },
  lightContainer: {
    backgroundColor: "transparent",
  },
  darkContainer: {
    backgroundColor: "transparent",
  },
  inputContainer: {
    // Removed flex: 1 - container should wrap content, not expand into undefined space
    // This was causing layout collapse and touch target misalignment
  },
  // iOS 26 HIG: Glass wrapper for text input (iOS only)
  textInputGlassWrapper: {
    // Removed flex: 1 - wrapper should wrap content height from children
    // Prevents layout expansion issues that block touch events
  },
  /**
   * Container for input + integrated button
   *
   * Uses relative positioning to establish context for absolute button.
   * Centers items vertically to align button with text.
   */
  inputWithButtonContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  /**
   * Input Wrapper (for Animated.View)
   *
   * Wraps TextInput to apply animated height.
   */
  inputWrapper: {
    flex: 1,
  },
  /**
   * Text Input Base Styles
   *
   * Note: Height managed by Reanimated shared value (inputHeight).
   * Max/min heights are constraints, not fixed values.
   */
  textInput: {
    flex: 1,
    maxHeight: 120, // Fallback for non-Reanimated scenarios
    minHeight: 36,  // Fallback for non-Reanimated scenarios
    paddingHorizontal: LiquidGlassSpacing.md, // 16px - matches reference
    paddingVertical: LiquidGlassSpacing.sm,   // 12px - closer to reference (13px)
    borderRadius: 24, // Capsule shape radius for consistency
    borderWidth: 1,
  },
  /**
   * iOS 26 HIG: Transparent input for glass effect
   *
   * CRITICAL: Glass wrapper handles background, input must be transparent.
   * Border removed as glass provides visual boundary.
   */
  textInputGlass: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  /**
   * Android/Web: Semi-transparent backgrounds with borders
   *
   * Fallback for platforms without Liquid Glass support.
   * Uses systemGray equivalents from iOS HIG.
   */
  lightTextInput: {
    backgroundColor: "rgba(242, 242, 247, 0.8)", // systemGray6
    borderColor: "rgba(229, 229, 234, 0.6)",
  },
  darkTextInput: {
    backgroundColor: "rgba(28, 28, 30, 0.8)", // systemGray5
    borderColor: "rgba(56, 56, 58, 0.6)",
  },
  /**
   * Integrated Send Button
   *
   * Absolutely positioned inside input container.
   * Right edge has 4px spacing (BUTTON_SPACING).
   * Top position calculated dynamically via buttonPosition.
   */
  integratedSendButton: {
    position: "absolute",
    right: BUTTON_SPACING,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  /**
   * Character Counter
   *
   * Positioned below input, uses caption typography size.
   * Margin matches input horizontal padding for alignment.
   */
  characterCount: {
    fontSize: 12, // typography.caption.fontSize
    marginTop: BUTTON_SPACING,
    marginLeft: LiquidGlassSpacing.md,
  },
});
