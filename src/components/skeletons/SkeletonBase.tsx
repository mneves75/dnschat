/**
 * SkeletonBase - Base skeleton shimmer animation component
 *
 * Provides reusable skeleton building blocks with shimmer animation.
 * Respects reduce motion accessibility setting.
 *
 * @see DESIGN-UI-UX-GUIDELINES.md - Skeleton loading patterns
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useImessagePalette } from '../../ui/theme/imessagePalette';
import { useMotionReduction } from '../../context/AccessibilityContext';
import { shimmerDuration } from '../../utils/animations';

interface SkeletonBoxProps {
  /**
   * Width of the skeleton (number for fixed, string for percentage)
   */
  width: number | `${number}%`;

  /**
   * Height of the skeleton
   */
  height: number;

  /**
   * Border radius
   * @default 4
   */
  borderRadius?: number;

  /**
   * Delay before shimmer starts (ms)
   * @default 0
   */
  delay?: number;

  /**
   * Additional styles
   */
  style?: ViewStyle;
}

export function SkeletonBox({
  width,
  height,
  borderRadius = 4,
  delay = 0,
  style,
}: SkeletonBoxProps) {
  const palette = useImessagePalette();
  const { shouldReduceMotion } = useMotionReduction();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      shimmer.value = 0.5; // Static mid-opacity for reduced motion
      return;
    }

    shimmer.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: shimmerDuration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
  }, [shouldReduceMotion, delay, shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shouldReduceMotion ? 0.5 : 0.3 + shimmer.value * 0.4,
  }));

  const isDark = palette.textPrimary === '#FFFFFF';
  const backgroundColor = isDark
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(0, 0, 0, 0.08)';

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        shimmerStyle,
        style,
      ]}
    />
  );
}

interface SkeletonTextProps {
  /**
   * Width of the text skeleton
   * @default '100%'
   */
  width?: number | `${number}%`;

  /**
   * Number of lines
   * @default 1
   */
  lines?: number;

  /**
   * Line height
   * @default 17
   */
  lineHeight?: number;

  /**
   * Gap between lines
   * @default 8
   */
  lineGap?: number;

  /**
   * Delay for stagger effect (ms per line)
   * @default 50
   */
  staggerDelay?: number;

  /**
   * Whether the last line should be shorter
   * @default true
   */
  shortLastLine?: boolean;

  /**
   * Additional styles for the container
   */
  style?: ViewStyle;
}

export function SkeletonText({
  width = '100%',
  lines = 1,
  lineHeight = 17,
  lineGap = 8,
  staggerDelay = 50,
  shortLastLine = true,
  style,
}: SkeletonTextProps) {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => {
        const isLastLine = index === lines - 1;
        const lineWidth = isLastLine && shortLastLine && lines > 1 ? '60%' : width;

        return (
          <SkeletonBox
            key={index}
            width={lineWidth}
            height={lineHeight}
            delay={index * staggerDelay}
            style={index < lines - 1 ? { marginBottom: lineGap } : undefined}
          />
        );
      })}
    </View>
  );
}

interface SkeletonCardProps {
  /**
   * Children skeleton content
   */
  children: React.ReactNode;

  /**
   * Delay before animations start
   * @default 0
   */
  delay?: number;

  /**
   * Additional styles
   */
  style?: ViewStyle;
}

export function SkeletonCard({ children, delay = 0, style }: SkeletonCardProps) {
  const palette = useImessagePalette();
  const { shouldReduceMotion } = useMotionReduction();
  const opacity = useSharedValue(shouldReduceMotion ? 1 : 0);

  useEffect(() => {
    if (shouldReduceMotion) return;

    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
  }, [shouldReduceMotion, delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: Platform.OS === 'android' ? palette.solid : palette.surface },
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    flexDirection: 'column',
  },
  card: {
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    // iOS shadows
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
  },
});

export default { SkeletonBox, SkeletonText, SkeletonCard };
