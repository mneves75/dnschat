import type { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { BlurView } from 'expo-blur';

import { useReduceTransparency } from '@/components/useReduceTransparency';

type Props = PropsWithChildren<{
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
  fallbackColor?: string;
  style?: StyleProp<ViewStyle>;
}>;

/**
 * Provides a Liquid Glass-like surface when permitted by accessibility settings,
 * falling back to a solid surface when Reduce Transparency is enabled.
 */
export function GlassContainer({
  children,
  blurIntensity = 40,
  blurTint = 'default',
  fallbackColor = 'rgba(28,28,30,0.92)',
  style
}: Props) {
  const reduceTransparency = useReduceTransparency();

  if (reduceTransparency) {
    return (
      <View style={[styles.fallback, { backgroundColor: fallbackColor }, style]}>{children}</View>
    );
  }

  return (
    <BlurView intensity={blurIntensity} tint={blurTint} style={[styles.blur, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    borderRadius: 24,
    overflow: 'hidden'
  },
  fallback: {
    borderRadius: 24
  }
});
