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
  Pressable,
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

  /**
   * Skip glass registration for decorative overlays.
   * Still renders glass when available but does not count toward budget.
   */
  register?: boolean;

  /** Force rendering the solid fallback regardless of provider state */
  forceFallback?: boolean;
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
  register = true,
  forceFallback = false,
}: GlassCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Glass context for capabilities and performance
  const { capabilities, shouldRenderGlass } = useGlass();

  // Determine if glass should render based on provider heuristics
  const renderGlass = !forceFallback && shouldRenderGlass();

  // Only register when we expect to render glass; solid fallbacks shouldn't exhaust the budget.
  useGlassRegistration(register && renderGlass);

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
   * Get Material 3 Elevation Level
   *
   * ANDROID ONLY: Returns appropriate elevation based on variant.
   * Material Design 3 elevation levels:
   * - Level 0: Flat surface
   * - Level 1: Subtle raised (regular)
   * - Level 2: Slightly elevated (interactive default)
   * - Level 3: Standard card (prominent)
   *
   * Interactive cards use level 2 by default, level 8 on press.
   */
  const getAndroidElevation = (): number => {
    if (Platform.OS !== 'android') return 0;

    switch (variant) {
      case 'regular':
        return 1; // Subtle raised surface
      case 'prominent':
        return 3; // Standard Material 3 card elevation
      case 'interactive':
        return 2; // Slightly elevated, increases on press
      default:
        return 1;
    }
  };

  /**
   * Render Fallback (iOS <26, Android, Web, or Solid)
   *
   * DESIGN: Uses semi-transparent backgrounds with shadows to
   * simulate glass appearance on platforms without native support.
   *
   * ANDROID: Material Design 3 elevation with dynamic press states.
   * Uses Pressable to avoid layered elevation shadows.
   *
   * CRITICAL FIX: Previous implementation had two elevations (View + wrapper)
   * causing double shadows. Now uses single dynamic elevation value.
   */
  const renderFallback = () => {
    const baseElevation = getAndroidElevation();

    // Interactive card with press-based elevation (Material 3)
    if (onPress) {
      return (
        <Pressable
          onPress={onPress}
          accessibilityRole={accessibilityRole || 'button'}
          accessibilityLabel={accessibilityLabel}
        >
          {({ pressed }) => {
            /**
             * CRITICAL: Calculate elevation based on press state
             * Material 3 Interactive Pattern:
             * - Default state: base elevation (2dp for interactive variant)
             * - Pressed state: raised elevation (8dp for interactive variant)
             * - Only ONE elevation applied to avoid shadow layering
             */
            const dynamicElevation =
              Platform.OS === 'android' && variant === 'interactive' && pressed
                ? 8 // Raised state (pressed)
                : baseElevation; // Base state (regular/prominent/interactive default)

            return (
              <View
                style={[
                  styles.card,
                  styles.fallbackCard,
                  {
                    backgroundColor: fallbackBackground,
                    // iOS/Web: Use opacity for press feedback
                    opacity: pressed && Platform.OS !== 'android' ? 0.7 : 1,
                  },
                  // Material 3 dynamic elevation on Android
                  Platform.OS === 'android' && { elevation: dynamicElevation },
                  style,
                ]}
              >
                {children}
              </View>
            );
          }}
        </Pressable>
      );
    }

    // Non-interactive card (static elevation)
    return (
      <View
        style={[
          styles.card,
          styles.fallbackCard,
          {
            backgroundColor: fallbackBackground,
          },
          // Material 3 static elevation on Android
          Platform.OS === 'android' && { elevation: baseElevation },
          style,
        ]}
      >
        {children}
      </View>
    );
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
      // Android: Material 3 elevation applied dynamically based on variant
      android: {},
      // Web: Box shadow
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      } as any,
    }),
  },
});
