/**
 * Glass Button Component
 *
 * An interactive button with glass/blur background and press animations.
 * Uses expo-glass-effect with `isInteractive` prop for iOS 26+ liquid glass.
 *
 * PLATFORM RENDERING:
 * - iOS 26+: Interactive UIVisualEffectView (responds to touch)
 * - iOS <26: Animated View with press feedback
 * - Android: Material 3 FilledTonalButton style
 * - Web: CSS backdrop-filter with hover/active states
 *
 * USAGE:
 * ```tsx
 * <GlassButton
 *   onPress={handlePress}
 *   variant="prominent"
 *   disabled={isLoading}
 * >
 *   <Text>Press Me</Text>
 * </GlassButton>
 * ```
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router + Glass Migration)
 */

import React, { ReactNode, useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
  useColorScheme,
  Animated,
} from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { useGlass, useGlassRegistration } from './GlassProvider';
import {
  getGlassTintColor,
  getGlassBackgroundFallback,
} from './utils';

/**
 * Glass Button Props
 */
interface GlassButtonProps {
  /** Button content (usually Text) */
  children: ReactNode;

  /** Press handler */
  onPress: () => void;

  /** Button variant style */
  variant?: 'regular' | 'prominent' | 'interactive';

  /** Disabled state */
  disabled?: boolean;

  /** Additional styles */
  style?: StyleProp<ViewStyle>;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Accessibility hint */
  accessibilityHint?: string;
}

/**
 * Glass Button Component
 *
 * INTERACTION PATTERNS:
 * - iOS 26+: Native press feedback via isInteractive prop
 * - iOS <26: Scale animation on press (0.95x)
 * - Android: Ripple effect (built-in to TouchableOpacity)
 * - Web: Hover and active states via CSS
 *
 * ACCESSIBILITY:
 * - Proper button role and labels
 * - Disabled state with reduced opacity
 * - Minimum touch target size (44x44)
 */
export function GlassButton({
  children,
  onPress,
  variant = 'interactive',
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: GlassButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Glass context
  const { capabilities, shouldRenderGlass } = useGlass();
  useGlassRegistration();

  // Press animation (iOS <26 only)
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isPressed, setIsPressed] = useState(false);

  // Determine if glass should render
  const renderGlass = shouldRenderGlass();

  // Get platform-specific colors
  const tintColor = getGlassTintColor(isDark, variant);
  const fallbackBackground = getGlassBackgroundFallback(isDark, variant);

  /**
   * Press Handlers (iOS <26 only)
   *
   * ANIMATION: Scale down to 0.95 on press, back to 1.0 on release.
   * This provides tactile feedback on platforms without native interactive glass.
   */
  const handlePressIn = () => {
    if (!capabilities.isNativeGlassSupported) {
      setIsPressed(true);
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!capabilities.isNativeGlassSupported) {
      setIsPressed(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  /**
   * Render Native Interactive Glass (iOS 26+)
   *
   * CRITICAL: Uses expo-glass-effect with isInteractive={true}.
   * This enables native press feedback via UIVisualEffectView.
   */
  const renderNativeGlass = () => {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        style={[
          styles.button,
          disabled && styles.disabled,
          style,
        ]}
      >
        <GlassView
          tintColor={tintColor}
          isInteractive={true} // CRITICAL: Enables interactive glass on iOS 26+
          style={styles.glassContent}
        >
          {children}
        </GlassView>
      </TouchableOpacity>
    );
  };

  /**
   * Render Fallback (iOS <26, Android, Web)
   *
   * ANIMATION: Uses Animated.View with scale transform for press feedback.
   */
  const renderFallback = () => {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        style={[
          styles.button,
          disabled && styles.disabled,
          style,
        ]}
      >
        <Animated.View
          style={[
            styles.fallbackButton,
            {
              backgroundColor: fallbackBackground,
              transform: [{ scale: scaleAnim }],
            },
            // Material 3 elevation on Android
            Platform.OS === 'android' && styles.androidElevation,
            isPressed && styles.pressed,
          ]}
        >
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  /**
   * Platform-Specific Rendering
   */
  if (!renderGlass || !capabilities.canRenderGlass) {
    return renderFallback();
  }

  if (capabilities.isNativeGlassSupported) {
    return renderNativeGlass();
  }

  return renderFallback();
}

/**
 * Styles
 *
 * CRITICAL: Use StyleSheet.create for performance.
 * Minimum touch target: 44x44 (iOS HIG / Material Design)
 */
const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  glassContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  fallbackButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    // iOS: Shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
      } as any,
    }),
  },
  androidElevation: {
    elevation: 3, // Material 3 elevation for buttons
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.4,
  },
});
