import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  useColorScheme,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useTypography } from "../../ui/hooks/useTypography";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { LiquidGlassSpacing, getCornerRadius } from "../../ui/theme/liquidGlassSpacing";
import { SpringConfig, TimingConfig } from "../../utils/animations";
import { HapticFeedback } from "../../utils/haptics";

export interface LiquidGlassTextInputProps extends Omit<TextInputProps, "style"> {
  /** Input label */
  label?: string;

  /** Helper text shown below input */
  helperText?: string;

  /** Error message (displays in red, replaces helperText) */
  errorText?: string;

  /** Show character count (requires maxLength prop) */
  showCharacterCount?: boolean;

  /** Enable clear button when input has text */
  showClearButton?: boolean;

  /** Custom container style */
  containerStyle?: ViewStyle;

  /** Custom input style */
  inputStyle?: TextStyle;

  /** Custom label style */
  labelStyle?: TextStyle;

  /** Left icon/component */
  leftIcon?: React.ReactNode;

  /** Right icon/component (overridden by clear button if enabled) */
  rightIcon?: React.ReactNode;

  /** Test ID for testing */
  testID?: string;
}

export function LiquidGlassTextInput({
  label,
  helperText,
  errorText,
  showCharacterCount = false,
  showClearButton = false,
  containerStyle,
  inputStyle,
  labelStyle,
  leftIcon,
  rightIcon,
  value,
  onChangeText,
  maxLength,
  editable = true,
  testID,
  ...textInputProps
}: LiquidGlassTextInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const typography = useTypography();
  const palette = useImessagePalette();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = useSharedValue(palette.border);
  const borderWidth = useSharedValue(1);

  const hasError = !!errorText;
  const hasText = !!value && value.length > 0;
  const characterCount = value?.length || 0;

  // Animated border for focus state
  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    borderWidth: borderWidth.value,
  }));

  // Handle focus
  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderColor.value = withTiming(
      hasError ? palette.destructive : palette.accentTint,
      TimingConfig.quick
    );
    borderWidth.value = withSpring(2, SpringConfig.bouncy);
    HapticFeedback.selection();
    textInputProps.onFocus?.(e);
  };

  // Handle blur
  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderColor.value = withTiming(
      hasError ? palette.destructive : palette.border,
      TimingConfig.quick
    );
    borderWidth.value = withSpring(1, SpringConfig.bouncy);
    textInputProps.onBlur?.(e);
  };

  // Handle clear button
  const handleClear = () => {
    onChangeText?.("");
    HapticFeedback.light();
  };

  // Determine border color
  const getBorderColor = () => {
    if (hasError) return palette.destructive;
    if (isFocused) return palette.accentTint;
    return palette.border;
  };

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {/* Label */}
      {label && (
        <Text
          style={[
            styles.label,
            typography.callout,
            { color: hasError ? palette.destructive : palette.textPrimary },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}

      {/* Input Container */}
      <Animated.View
        style={[
          styles.inputContainer,
          animatedBorderStyle,
          {
            backgroundColor: isDark
              ? "rgba(28, 28, 30, 0.8)"
              : "rgba(242, 242, 247, 0.8)",
          },
          !editable && styles.disabled,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          maxLength={maxLength}
          style={[
            styles.input,
            {
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
              letterSpacing: typography.body.letterSpacing,
              color: palette.textPrimary,
            },
            inputStyle,
          ]}
          placeholderTextColor={palette.textSecondary}
          keyboardAppearance={isDark ? "dark" : "light"}
          accessible={true}
          accessibilityLabel={label || textInputProps.placeholder}
          accessibilityHint={helperText || errorText}
          accessibilityState={{ disabled: !editable }}
          {...textInputProps}
        />

        {/* Right Icon or Clear Button */}
        {showClearButton && hasText && editable ? (
          <Pressable
            onPress={handleClear}
            style={styles.clearButton}
            accessible={true}
            accessibilityLabel="Clear text"
            accessibilityRole="button"
            hitSlop={8}
          >
            <View style={styles.clearButtonIcon}>
              <Text style={styles.clearButtonText}>×</Text>
            </View>
          </Pressable>
        ) : (
          rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </Animated.View>

      {/* Helper Text / Error Text / Character Count */}
      <View style={styles.footer}>
        {/* Helper or Error Text */}
        {(helperText || errorText) && (
          <Text
            style={[
              styles.helperText,
              typography.caption1,
              {
                color: hasError ? palette.destructive : palette.textSecondary,
              },
            ]}
            accessible={true}
            accessibilityLiveRegion={hasError ? "assertive" : "polite"}
          >
            {errorText || helperText}
          </Text>
        )}

        {/* Character Count */}
        {showCharacterCount && maxLength && (
          <Text
            style={[
              styles.characterCount,
              typography.caption1,
              {
                color:
                  characterCount > maxLength * 0.9
                    ? "#FF9500" // Warning color when approaching limit
                    : palette.textSecondary,
              },
            ]}
          >
            {characterCount}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    marginBottom: LiquidGlassSpacing.xs,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: getCornerRadius("input"),
    paddingHorizontal: LiquidGlassSpacing.md,
    minHeight: 44, // iOS minimum touch target
  },
  input: {
    flex: 1,
    paddingVertical: LiquidGlassSpacing.sm,
  },
  leftIcon: {
    marginRight: LiquidGlassSpacing.xs,
  },
  rightIcon: {
    marginLeft: LiquidGlassSpacing.xs,
  },
  clearButton: {
    marginLeft: LiquidGlassSpacing.xs,
    // iOS HIG requires 44pt minimum touch target
    // 20px icon + 12px padding * 2 = 44px
    padding: 12,
  },
  clearButtonIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(142, 142, 147, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    lineHeight: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: LiquidGlassSpacing.xxs,
    paddingHorizontal: LiquidGlassSpacing.xxs,
  },
  helperText: {
    flex: 1,
  },
  characterCount: {
    marginLeft: LiquidGlassSpacing.xs,
  },
});

export default LiquidGlassTextInput;
