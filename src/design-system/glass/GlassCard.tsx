/**
 * Glass Card Component
 *
 * A card component with glass/blur background effect.
 * Uses expo-glass-effect on iOS 26+, with graceful fallbacks for other platforms.
 *
 * PLATFORM RENDERING:
 * - iOS 26+: Native UIVisualEffectView (liquid glass)
 * - iOS <26: Semi-transparent View with shadow
 * - Android: Material 3 elevated Card
 * - Web: CSS backdrop-filter blur
 *
 * USAGE:
 * ```tsx
 * <GlassCard variant="prominent" onPress={handlePress}>
 *   <Text>Card Content</Text>
 * </GlassCard>
 * ```
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router + Glass Migration)
 */

import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  Platform,
  useColorScheme,
} from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { useGlass, useGlassRegistration } from './GlassProvider';
import {
  getGlassTintColor,
  getGlassBackgroundFallback,
} from './utils';

/**
 * Glass Card Props
 */
interface GlassCardProps {
  /** Card content */
  children: ReactNode;

  /** Glass variant style */
  variant?: 'regular' | 'prominent' | 'interactive';

  /** Additional styles */
  style?: StyleProp<ViewStyle>;

  /** Make card pressable */
  onPress?: () => void;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Accessibility role */
  accessibilityRole?: 'button' | 'none';
}

/**
 * Glass Card Component
 *
 * PERFORMANCE NOTES:
 * - Automatically registers with GlassProvider for element counting
 * - Respects performance limits (max 5-10 glass elements per screen)
 * - Falls back to solid View when limits exceeded or during scrolling
 *
 * ACCESSIBILITY:
 * - Respects "Reduce Transparency" setting
 * - Provides solid background fallback when needed
 * - Proper ARIA labels for interactive cards
 */
export function GlassCard({
  children,
  variant = 'regular',
  style,
  onPress,
  accessibilityLabel,
  accessibilityRole,
}: GlassCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Glass context for capabilities and performance
  const { capabilities, shouldRenderGlass } = useGlass();

  // Auto-register this glass element
  useGlassRegistration();

  // Determine if glass should render based on performance
  const renderGlass = shouldRenderGlass();

  // Get platform-specific colors
  const tintColor = getGlassTintColor(isDark, variant);
  const fallbackBackground = getGlassBackgroundFallback(isDark, variant);

  /**
   * Render Native Glass (iOS 26+)
   *
   * CRITICAL: Uses expo-glass-effect's GlassView which wraps
   * UIVisualEffectView for native iOS 26 liquid glass rendering.
   */
  const renderNativeGlass = () => {
    const content = (
      <GlassView
        tintColor={tintColor}
        style={[styles.card, style]}
      >
        {children}
      </GlassView>
    );

    // Wrap in TouchableOpacity if pressable
    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          accessibilityRole={accessibilityRole || 'button'}
          accessibilityLabel={accessibilityLabel}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return content;
  };

  /**
   * Render Fallback (iOS <26, Android, Web, or Solid)
   *
   * DESIGN: Uses semi-transparent backgrounds with shadows to
   * simulate glass appearance on platforms without native support.
   */
  const renderFallback = () => {
    const content = (
      <View
        style={[
          styles.card,
          styles.fallbackCard,
          {
            backgroundColor: fallbackBackground,
          },
          // Material 3 elevation on Android
          Platform.OS === 'android' && styles.androidElevation,
          style,
        ]}
      >
        {children}
      </View>
    );

    // Wrap in TouchableOpacity if pressable
    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          accessibilityRole={accessibilityRole || 'button'}
          accessibilityLabel={accessibilityLabel}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return content;
  };

  /**
   * Platform-Specific Rendering Logic
   *
   * 1. Check if glass should render (performance/accessibility)
   * 2. If native glass supported (iOS 26+), use GlassView
   * 3. Otherwise, use fallback with styled View
   */
  if (!renderGlass || !capabilities.canRenderGlass) {
    // Fallback to solid background
    return renderFallback();
  }

  // iOS 26+: Native glass
  if (capabilities.isNativeGlassSupported) {
    return renderNativeGlass();
  }

  // All other platforms: Fallback
  return renderFallback();
}

/**
 * Styles
 *
 * CRITICAL: Use StyleSheet.create for performance.
 * Base card styles apply to both glass and fallback variants.
 */
const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden', // Required for glass clip radius
  },
  fallbackCard: {
    // iOS <26: Shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      // Android: Material 3 elevation is applied via androidElevation style
      android: {},
      // Web: Box shadow
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      } as any,
    }),
  },
  androidElevation: {
    elevation: 4, // Material 3 elevation level 2
  },
});
