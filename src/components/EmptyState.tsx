/**
 * EmptyState - Reusable empty state component with icons and animations
 *
 * Displays a visually appealing empty state with:
 * - Icon based on context type
 * - Title and description
 * - Optional action button
 * - Entrance animation (respects reduce motion)
 *
 * @see IOS-GUIDELINES.md - iOS 26 empty state patterns
 * @see DESIGN-UI-UX-GUIDELINES.md - Empty state design guidelines
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useImessagePalette } from '../ui/theme/imessagePalette';
import { LiquidGlassSpacing, getCornerRadius } from '../ui/theme/liquidGlassSpacing';
import { useMotionReduction } from '../context/AccessibilityContext';
import { LiquidGlassWrapper } from './glass';
import { TimingConfig, SpringConfig } from '../utils/animations';

export type EmptyStateIconType =
  | 'chat'
  | 'logs'
  | 'search'
  | 'error'
  | 'profile'
  | 'home'
  | 'generic';

interface EmptyStateProps {
  /**
   * Title text for the empty state
   */
  title: string;

  /**
   * Description text (supports multiple lines)
   */
  description: string;

  /**
   * Icon type to display
   * @default 'generic'
   */
  iconType?: EmptyStateIconType;

  /**
   * Custom icon color (overrides palette)
   */
  iconColor?: string;

  /**
   * Action button label
   */
  actionLabel?: string;

  /**
   * Callback when action button is pressed
   */
  onAction?: () => void;

  /**
   * Whether to use glass wrapper for the container
   * @default false
   */
  useGlass?: boolean;

  /**
   * Test ID for automated testing
   */
  testID?: string;
}

// Icon components for different empty state types
function ChatIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Chat bubble */}
      <Path
        d="M40 10C23.4 10 10 21.2 10 35c0 7.4 4 14 10.4 18.6L18 65l13.2-7.2c2.8.8 5.7 1.2 8.8 1.2 16.6 0 30-11.2 30-25S56.6 10 40 10z"
        fill={color}
        opacity={0.15}
      />
      <Path
        d="M40 10C23.4 10 10 21.2 10 35c0 7.4 4 14 10.4 18.6L18 65l13.2-7.2c2.8.8 5.7 1.2 8.8 1.2 16.6 0 30-11.2 30-25S56.6 10 40 10z"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
      />
      {/* Dots */}
      <Circle cx="28" cy="35" r="3" fill={color} />
      <Circle cx="40" cy="35" r="3" fill={color} />
      <Circle cx="52" cy="35" r="3" fill={color} />
    </Svg>
  );
}

function LogsIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Document */}
      <Rect
        x="15"
        y="10"
        width="50"
        height="60"
        rx="6"
        fill={color}
        opacity={0.15}
      />
      <Rect
        x="15"
        y="10"
        width="50"
        height="60"
        rx="6"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
      />
      {/* Lines */}
      <Path d="M25 28h30" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M25 40h25" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M25 52h20" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function SearchIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Circle */}
      <Circle
        cx="35"
        cy="35"
        r="20"
        fill={color}
        opacity={0.15}
      />
      <Circle
        cx="35"
        cy="35"
        r="20"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
      />
      {/* Handle */}
      <Path
        d="M50 50l18 18"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ErrorIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Triangle */}
      <Path
        d="M40 12L70 62H10L40 12z"
        fill={color}
        opacity={0.15}
      />
      <Path
        d="M40 12L70 62H10L40 12z"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinejoin="round"
      />
      {/* Exclamation */}
      <Path
        d="M40 30v16"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Circle cx="40" cy="52" r="2.5" fill={color} />
    </Svg>
  );
}

function ProfileIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Head */}
      <Circle
        cx="40"
        cy="28"
        r="14"
        fill={color}
        opacity={0.15}
      />
      <Circle
        cx="40"
        cy="28"
        r="14"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
      />
      {/* Body */}
      <Path
        d="M16 68c0-13.3 10.7-24 24-24s24 10.7 24 24"
        fill={color}
        opacity={0.15}
      />
      <Path
        d="M16 68c0-13.3 10.7-24 24-24s24 10.7 24 24"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function HomeIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* House */}
      <Path
        d="M40 12L10 36v32h60V36L40 12z"
        fill={color}
        opacity={0.15}
      />
      <Path
        d="M40 12L10 36v32h60V36L40 12z"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinejoin="round"
      />
      {/* Door */}
      <Rect
        x="32"
        y="48"
        width="16"
        height="20"
        rx="2"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
      />
    </Svg>
  );
}

function GenericIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Box */}
      <Rect
        x="15"
        y="20"
        width="50"
        height="45"
        rx="6"
        fill={color}
        opacity={0.15}
      />
      <Rect
        x="15"
        y="20"
        width="50"
        height="45"
        rx="6"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
      />
      {/* Lid */}
      <Path
        d="M10 20h60"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Handle */}
      <Path
        d="M30 20V15c0-2.8 2.2-5 5-5h10c2.8 0 5 2.2 5 5v5"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
      />
    </Svg>
  );
}

const iconComponents: Record<EmptyStateIconType, React.FC<{ size: number; color: string }>> = {
  chat: ChatIcon,
  logs: LogsIcon,
  search: SearchIcon,
  error: ErrorIcon,
  profile: ProfileIcon,
  home: HomeIcon,
  generic: GenericIcon,
};

export function EmptyState({
  title,
  description,
  iconType = 'generic',
  iconColor,
  actionLabel,
  onAction,
  useGlass = false,
  testID,
}: EmptyStateProps) {
  const palette = useImessagePalette();
  const { shouldReduceMotion } = useMotionReduction();

  // Animation values
  const opacity = useSharedValue(shouldReduceMotion ? 1 : 0);
  const scale = useSharedValue(shouldReduceMotion ? 1 : 0.9);
  const iconScale = useSharedValue(shouldReduceMotion ? 1 : 0.8);

  // Trigger entrance animation on mount
  useEffect(() => {
    if (shouldReduceMotion) return;

    // Icon animates first
    iconScale.value = withSpring(1, SpringConfig.bouncy);

    // Content follows with delay
    opacity.value = withDelay(100, withTiming(1, TimingConfig.normal));
    scale.value = withDelay(100, withSpring(1, SpringConfig.gentle));
  }, [shouldReduceMotion, opacity, scale, iconScale]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const IconComponent = iconComponents[iconType];
  const effectiveIconColor = iconColor || palette.userBubble;

  const content = (
    <View
      style={styles.content}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${description}`}
    >
      {/* Icon */}
      <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
        <IconComponent size={80} color={effectiveIconColor} />
      </Animated.View>

      {/* Text */}
      <Text style={[styles.title, { color: palette.textPrimary }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: palette.textSecondary }]}>
        {description}
      </Text>

      {/* Action Button */}
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.actionButton, { backgroundColor: palette.userBubble }]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (useGlass) {
    return (
      <Animated.View style={containerStyle} testID={testID}>
        <LiquidGlassWrapper
          variant="regular"
          shape="roundedRect"
          cornerRadius={getCornerRadius('card')}
          style={styles.glassContainer}
        >
          {content}
        </LiquidGlassWrapper>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: Platform.OS === 'android' ? palette.solid : palette.surface },
        containerStyle,
      ]}
      testID={testID}
    >
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: LiquidGlassSpacing.lg,
    padding: LiquidGlassSpacing.xl,
    borderRadius: getCornerRadius('card'),
    // iOS shadows
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
  },
  glassContainer: {
    marginHorizontal: LiquidGlassSpacing.lg,
    padding: LiquidGlassSpacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: LiquidGlassSpacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: LiquidGlassSpacing.sm,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: LiquidGlassSpacing.lg,
  },
  actionButton: {
    paddingHorizontal: LiquidGlassSpacing.lg,
    paddingVertical: LiquidGlassSpacing.sm,
    borderRadius: 22,
    // iOS 26 HIG: Minimum 44pt touch target
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default EmptyState;
