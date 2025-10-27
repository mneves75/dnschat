import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Text,
  Platform,
  LayoutChangeEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useTypography } from "../ui/hooks/useTypography";
import { useImessagePalette } from "../ui/theme/imessagePalette";
import { LiquidGlassSpacing, getMinimumTouchTarget } from "../ui/theme/liquidGlassSpacing";
import { SpringConfig, buttonPressScale } from "../utils/animations";
import { HapticFeedback } from "../utils/haptics";
import { SendIcon } from "./icons/SendIcon";
import { useTranslation } from "../i18n";
import { LiquidGlassWrapper, useLiquidGlassCapabilities } from "./LiquidGlassWrapper";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  placeholder,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [inputHeight, setInputHeight] = useState(36);
  const textInputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const typography = useTypography();
  const palette = useImessagePalette();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const { t } = useTranslation();
  const { supportsLiquidGlass } = useLiquidGlassCapabilities();

  const minimumTouchTarget = getMinimumTouchTarget();
  const resolvedPlaceholder = placeholder ?? t("screen.chatInput.placeholder");
  const showCharacterCount = message.length > 900;

  // Update send button opacity based on message content
  React.useEffect(() => {
    opacity.value = withTiming(canSend ? 1 : 0.4, { duration: 200 });
  }, [canSend, opacity]);

  // Animated scale and opacity for send button
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Handle content size change for auto-growing input
  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const minHeight = 36;
    const maxHeight = 120; // ~5 lines
    const newHeight = Math.min(Math.max(height, minHeight), maxHeight);
    setInputHeight(newHeight);
  };

  const handleSend = () => {
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
  };

  // Handle press in with animation and haptics
  const handlePressIn = () => {
    if (canSend) {
      scale.value = withSpring(buttonPressScale, SpringConfig.bouncy);
      HapticFeedback.light();
    }
  };

  // Handle press out
  const handlePressOut = () => {
    scale.value = withSpring(1, SpringConfig.bouncy);
  };

  const canSend = message.trim().length > 0 && !isLoading;
  const useGlassInput = Platform.OS === "ios" && supportsLiquidGlass;

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <View style={styles.inputContainer}>
        {/* iOS 26+ HIG: Liquid Glass effect for text input when available */}
        {useGlassInput ? (
          <LiquidGlassWrapper
            variant="regular"
            shape="roundedRect"
            cornerRadius={12}
            isInteractive={false}
            style={styles.textInputGlassWrapper}
          >
            <View style={styles.inputWithButtonContainer}>
              <TextInput
                ref={textInputRef}
                style={[
                  styles.textInput,
                  styles.textInputGlass,
                  styles.textInputWithButton,
                  {
                    height: inputHeight,
                    fontSize: typography.body.fontSize,
                    lineHeight: typography.body.lineHeight,
                    letterSpacing: typography.body.letterSpacing,
                    color: palette.textPrimary,
                  },
                ]}
                value={message}
                onChangeText={setMessage}
                onContentSizeChange={handleContentSizeChange}
                placeholder={resolvedPlaceholder}
                placeholderTextColor={palette.textTertiary}
                multiline={true}
                maxLength={1000}
                editable={!isLoading}
                returnKeyType="send"
                enablesReturnKeyAutomatically={true}
                blurOnSubmit={true}
                textAlignVertical="top"
                keyboardType="default"
                autoCorrect={true}
                spellCheck={true}
                autoComplete="off"
                autoCapitalize="sentences"
                textContentType="none"
                contextMenuHidden={false}
                keyboardAppearance={isDark ? "dark" : "light"}
                onSubmitEditing={handleSend}
                accessible={true}
                accessibilityLabel={t("components.chatInput.accessibilityLabel")}
                accessibilityHint={t("components.chatInput.accessibilityHint")}
              />

              {/* Send button integrated inside input */}
              <AnimatedTouchable
                style={[
                  animatedButtonStyle,
                  styles.integratedSendButton,
                  {
                    width: minimumTouchTarget,
                    height: minimumTouchTarget,
                    borderRadius: minimumTouchTarget / 2,
                    backgroundColor: canSend ? palette.accentTint : palette.tint,
                  },
                ]}
                onPress={handleSend}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={!canSend}
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
            </View>

            {/* Character counter */}
            {showCharacterCount && (
              <Text style={[styles.characterCount, { color: palette.textSecondary }]}>
                {message.length}/1000
              </Text>
            )}
          </LiquidGlassWrapper>
        ) : (
          // Android/Web: Standard TextInput with semantic colors
          <View style={styles.inputWithButtonContainer}>
            <TextInput
              ref={textInputRef}
              style={[
                styles.textInput,
                styles.textInputWithButton,
                {
                  height: inputHeight,
                  fontSize: typography.body.fontSize,
                  lineHeight: typography.body.lineHeight,
                  letterSpacing: typography.body.letterSpacing,
                  color: palette.textPrimary,
                },
                isDark ? styles.darkTextInput : styles.lightTextInput,
              ]}
              value={message}
              onChangeText={setMessage}
              onContentSizeChange={handleContentSizeChange}
              placeholder={resolvedPlaceholder}
              placeholderTextColor={palette.textTertiary}
              multiline={true}
              maxLength={1000}
              editable={!isLoading}
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={true}
              textAlignVertical="top"
              keyboardType="default"
              autoCorrect={true}
              spellCheck={true}
              autoComplete="off"
              autoCapitalize="sentences"
              textContentType="none"
              contextMenuHidden={false}
              keyboardAppearance={isDark ? "dark" : "light"}
              onSubmitEditing={handleSend}
              accessible={true}
              accessibilityLabel={t("components.chatInput.accessibilityLabel")}
              accessibilityHint={t("components.chatInput.accessibilityHint")}
            />

            {/* Send button integrated inside input */}
            <AnimatedTouchable
              style={[
                animatedButtonStyle,
                styles.integratedSendButton,
                {
                  width: minimumTouchTarget,
                  height: minimumTouchTarget,
                  borderRadius: minimumTouchTarget / 2,
                  backgroundColor: canSend ? palette.accentTint : palette.tint,
                },
              ]}
              onPress={handleSend}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={!canSend}
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

            {/* Character counter */}
            {showCharacterCount && (
              <Text style={[styles.characterCount, { color: palette.textSecondary }]}>
                {message.length}/1000
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

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
    flex: 1,
  },
  // iOS 26 HIG: Glass wrapper for text input (iOS only)
  textInputGlassWrapper: {
    flex: 1,
  },
  // Container for input + integrated button
  inputWithButtonContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 36,
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.xs,
    borderRadius: 12, // Reduced from 18 for minimal look
    borderWidth: 1,
  },
  // Text input with integrated button needs right padding
  textInputWithButton: {
    paddingRight: 48, // Make room for send button (44pt touch target + 4pt spacing)
  },
  // iOS 26 HIG: Transparent input for glass effect (iOS only)
  textInputGlass: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  // Android/Web: Semi-transparent backgrounds with borders
  lightTextInput: {
    backgroundColor: "rgba(242, 242, 247, 0.8)",
    borderColor: "rgba(229, 229, 234, 0.6)",
  },
  darkTextInput: {
    backgroundColor: "rgba(28, 28, 30, 0.8)",
    borderColor: "rgba(56, 56, 58, 0.6)",
  },
  // Send button integrated inside input
  integratedSendButton: {
    position: "absolute",
    right: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  // Character counter below input
  characterCount: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: LiquidGlassSpacing.md,
  },
});
