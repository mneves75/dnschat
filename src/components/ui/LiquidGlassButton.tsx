import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LiquidGlassWrapper } from '../LiquidGlassWrapper';
import { useTypography } from '../../ui/hooks/useTypography';
import { useImessagePalette } from '../../ui/theme/imessagePalette';
import { getMinimumTouchTarget, getCornerRadius } from '../../ui/theme/liquidGlassSpacing';
import { SpringConfig, buttonPressScale } from '../../utils/animations';
import { HapticFeedback } from '../../utils/haptics';

type ButtonVariant = 'filled' | 'prominent' | 'tinted' | 'plain' | 'outlined';
type ButtonSize = 'small' | 'medium' | 'large';

export interface LiquidGlassButtonProps {
  /** Button label text */
  title: string;

  /** Press handler */
  onPress: () => void | Promise<void>;

  /** Visual style variant */
  variant?: ButtonVariant;

  /** Button size */
  size?: ButtonSize;

  /** Disabled state */
  disabled?: boolean;

  /** Loading state (shows spinner) */
  loading?: boolean;

  /** Full width button */
  fullWidth?: boolean;

  /** Custom style override */
  style?: ViewStyle;

  /** Custom text style override */
  textStyle?: TextStyle;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Accessibility hint */
  accessibilityHint?: string;

  /** Test ID for testing */
  testID?: string;

  /** Icon component (optional, rendered before text) */
  icon?: React.ReactNode;

  /** Disable haptic feedback */
  disableHaptics?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function LiquidGlassButton({
  title,
  onPress,
  variant = 'filled',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
  icon,
  disableHaptics = false,
}: LiquidGlassButtonProps) {
  const typography = useTypography();
  const palette = useImessagePalette();
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSharedValue(1);

  const minimumTouchTarget = getMinimumTouchTarget();
  const isDisabled = disabled || loading;

  // Animated scale for press feedback
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Handle press in with animation and haptics
  const handlePressIn = () => {
    if (!isDisabled) {
      setIsPressed(true);
      scale.value = withSpring(buttonPressScale, SpringConfig.bouncy);

      // Haptic feedback
      if (!disableHaptics) {
        HapticFeedback.light();
      }
    }
  };

  // Handle press out
  const handlePressOut = () => {
    setIsPressed(false);
    scale.value = withSpring(1, SpringConfig.bouncy);
  };

  // Handle actual press
  const handlePress = async () => {
    if (!isDisabled) {
      // Medium haptic for button press
      if (!disableHaptics) {
        HapticFeedback.medium();
      }

      await onPress();
    }
  };

  // Get size-specific dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case 'small':
        // Small buttons must still meet minimum touch target (44pt iOS, 48dp Android)
        // but can have less horizontal padding for compact layouts
        return {
          height: minimumTouchTarget,
          paddingHorizontal: 16,
          fontSize: typography.callout.fontSize,
        };
      case 'large':
        return {
          height: 56,
          paddingHorizontal: 24,
          fontSize: typography.headline.fontSize,
        };
      case 'medium':
      default:
        return {
          height: minimumTouchTarget,
          paddingHorizontal: 20,
          fontSize: typography.headline.fontSize,
        };
    }
  };

  const dimensions = getSizeDimensions();

  // Get variant-specific styles
  const getVariantStyles = () => {
    const baseStyles: ViewStyle = {
      height: dimensions.height,
      paddingHorizontal: dimensions.paddingHorizontal,
      borderRadius: getCornerRadius('button'),
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      minWidth: fullWidth ? undefined : minimumTouchTarget,
    };

    const baseTextStyle: TextStyle = {
      ...typography.headline,
      fontSize: dimensions.fontSize,
      letterSpacing: typography.headline.letterSpacing,
    };

    switch (variant) {
      case 'filled':
        return {
          container: {
            ...baseStyles,
            backgroundColor: palette.accentTint,
          },
          text: {
            ...baseTextStyle,
            color: '#FFFFFF',
          },
        };

      case 'prominent':
        // Use glass wrapper for prominent style
        return {
          container: {
            ...baseStyles,
            backgroundColor: 'transparent',
          },
          text: {
            ...baseTextStyle,
            color: palette.accentTint,
          },
          useGlass: true,
        };

      case 'tinted':
        return {
          container: {
            ...baseStyles,
            backgroundColor: palette.accentSurface,
          },
          text: {
            ...baseTextStyle,
            color: palette.accentTint,
          },
        };

      case 'outlined':
        return {
          container: {
            ...baseStyles,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: palette.accentBorder,
          },
          text: {
            ...baseTextStyle,
            color: palette.accentTint,
          },
        };

      case 'plain':
        return {
          container: {
            ...baseStyles,
            backgroundColor: 'transparent',
          },
          text: {
            ...baseTextStyle,
            color: palette.accentTint,
          },
        };

      default:
        return {
          container: baseStyles,
          text: baseTextStyle,
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Combine all container styles
  const containerStyle: ViewStyle = {
    ...variantStyles.container,
    ...(fullWidth && { width: '100%' }),
    ...(isDisabled && { opacity: 0.5 }),
    ...style,
  };

  // Combine all text styles
  const finalTextStyle: TextStyle = {
    ...variantStyles.text,
    ...textStyle,
  };

  // Render content (text + optional icon + loading spinner)
  const renderContent = () => (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color}
          style={styles.spinner}
        />
      )}
      {!loading && icon && <View style={styles.iconContainer}>{icon}</View>}
      {!loading && <Text style={finalTextStyle}>{title}</Text>}
    </>
  );

  // Use glass wrapper for prominent variant
  if (variantStyles.useGlass) {
    return (
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled }}
        testID={testID}
        style={[animatedStyle, fullWidth && { width: '100%' }]}
        activeOpacity={1} // We handle opacity through animation
      >
        <LiquidGlassWrapper
          variant="interactive"
          shape="roundedRect"
          cornerRadius={getCornerRadius('button')}
          isInteractive={true}
          style={containerStyle}
        >
          {renderContent()}
        </LiquidGlassWrapper>
      </AnimatedTouchable>
    );
  }

  // Standard button (non-glass variants)
  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
      testID={testID}
      style={[animatedStyle, containerStyle]}
      activeOpacity={1} // We handle opacity through animation
    >
      {renderContent()}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginRight: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default LiquidGlassButton;
