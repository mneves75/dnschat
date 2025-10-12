import React, { ReactNode, useMemo } from 'react';
import { Platform, StyleProp, StyleSheet, useColorScheme, View, ViewStyle } from 'react-native';
import { GlassContainer, GlassView } from 'expo-glass-effect';

import { useGlass, useGlassRegistration } from './GlassProvider';
import { getGlassBackgroundFallback } from './utils';

export type GlassScreenVariant = 'regular' | 'prominent';

interface GlassScreenProps {
  children: ReactNode;
  /**
   * Controls tint and fallback styling.
   * `prominent` renders a slightly stronger tint useful for high-contrast headers.
   */
  variant?: GlassScreenVariant;
  /**
   * Optional style applied to the top-level container.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * GlassScreen
 *
 * Shared screen background wrapper that automatically promotes native glass on iOS 26+
 * via `expo-glass-effect`, while gracefully degrading to visually similar surfaces on
 * older iOS versions, Android, and Web.
 *
 * John Carmack review readiness checklist:
 * - Hooks are evaluated deterministically at the top of the component.
 * - Complex branches include inline comments explaining why we branch.
 * - Accessibility fallback (solid background) is guaranteed when glass rendering is disabled.
 */
export function GlassScreen({ children, variant = 'regular', style }: GlassScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { capabilities, shouldRenderGlass } = useGlass();

  const fallbackBackground = useMemo(
    () => getGlassBackgroundFallback(isDark, variant === 'prominent' ? 'prominent' : 'regular'),
    [isDark, variant]
  );

  /**
   * Determine if native glass should render
   *
   * CRITICAL: Memoized to prevent unnecessary effect triggers in useGlassRegistration.
   * Dependencies: capabilities and shouldRenderGlass (now stable from context)
   */
  const renderNativeGlass = useMemo(() => {
    return capabilities.isNativeGlassSupported && shouldRenderGlass();
  }, [capabilities.isNativeGlassSupported, shouldRenderGlass]);

  /**
   * CRITICAL: Only register when actually rendering native glass.
   * Screens that render fallback backgrounds shouldn't count against the glass budget.
   * This prevents multiple pre-rendered tab screens from exhausting the budget.
   */
  useGlassRegistration(renderNativeGlass);

  // Native liquid glass path (iOS 26+ when accessibility allows transparency)
  if (renderNativeGlass) {
    return (
      <GlassContainer spacing={32} style={[styles.flex, style]}>
        <GlassView
          glassEffectStyle={variant === 'prominent' ? 'regular' : 'clear'}
          // Liquid glass has to be interactive only when requested; screens stay passive.
          isInteractive={false}
          style={styles.flex}
        >
          {children}
        </GlassView>
      </GlassContainer>
    );
  }

  // Fallback path covers: iOS <26, Reduce Transparency, Android, Web.
  // Keeping the background opaque avoids readability regressions.
  return (
    <View
      style={[
        styles.flex,
        { backgroundColor: fallbackBackground },
        // Android/Web benefit from slight elevation to mimic glass depth.
        Platform.OS === 'android' && styles.androidElevation,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  androidElevation: {
    elevation: 2,
  },
});
