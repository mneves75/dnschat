import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Text,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTypography } from "../ui/hooks/useTypography";
import { useImessagePalette } from "../ui/theme/imessagePalette";
import { LiquidGlassSpacing, getMinimumTouchTarget } from "../ui/theme/liquidGlassSpacing";
import { SpringConfig, buttonPressScale } from "../utils/animations";
import { HapticFeedback } from "../utils/haptics";
import { SendIcon } from "./icons/SendIcon";
import { useTranslation } from "../i18n";

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
  const textInputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const typography = useTypography();
  const palette = useImessagePalette();
  const scale = useSharedValue(1);
  const { t } = useTranslation();

  const minimumTouchTarget = getMinimumTouchTarget();
  const resolvedPlaceholder = placeholder ?? t("screen.chatInput.placeholder");

  // Animated scale for send button press feedback
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <View style={styles.inputContainer}>
        <TextInput
          ref={textInputRef}
          style={[
            styles.textInput,
            {
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
              letterSpacing: typography.body.letterSpacing,
              color: palette.textPrimary,
            },
            isDark ? styles.darkTextInput : styles.lightTextInput,
          ]}
          value={message}
          onChangeText={setMessage}
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
          autoCorrect={false}
          spellCheck={false}
          autoComplete="off"
          contextMenuHidden={true}
          keyboardAppearance={isDark ? "dark" : "light"}
          onSubmitEditing={handleSend}
          accessible={true}
          accessibilityLabel={t("components.chatInput.accessibilityLabel")}
          accessibilityHint={t("components.chatInput.accessibilityHint")}
        />

        <AnimatedTouchable
          style={[
            animatedStyle,
            styles.sendButton,
            {
              width: minimumTouchTarget,
              height: minimumTouchTarget,
              borderRadius: minimumTouchTarget / 2, // Perfectly circular on all platforms
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
          {/* iOS 26 HIG-compliant send icon using semantic colors */}
          {isLoading ? (
            <Text style={[styles.sendButtonText, { color: palette.textPrimary }]}>...</Text>
          ) : (
            <SendIcon
              size={20}
              isActive={canSend}
            />
          )}
        </AnimatedTouchable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm,
    // Remove borders and backgrounds for glass compatibility
  },
  lightContainer: {
    backgroundColor: "transparent", // Glass wrapper handles background
  },
  darkContainer: {
    backgroundColor: "transparent", // Glass wrapper handles background
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: LiquidGlassSpacing.sm,
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 36,
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.xs,
    borderRadius: 18,
    borderWidth: 1,
    // fontSize, lineHeight, letterSpacing applied inline from typography
  },
  lightTextInput: {
    backgroundColor: "rgba(242, 242, 247, 0.8)", // Semi-transparent for glass effect
    borderColor: "rgba(229, 229, 234, 0.6)", // Keep for glass compatibility
    // color applied from palette.textPrimary inline
  },
  darkTextInput: {
    backgroundColor: "rgba(28, 28, 30, 0.8)", // Semi-transparent for glass effect
    borderColor: "rgba(56, 56, 58, 0.6)", // Keep for glass compatibility
    // color applied from palette.textPrimary inline
  },
  sendButton: {
    // width, height, borderRadius, and backgroundColor set inline
    // backgroundColor from palette: accentTint (active) or tint (inactive)
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    // Color applied inline from palette
  },
});
