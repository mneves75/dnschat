import { withSpring, withTiming, Easing } from 'react-native-reanimated';
import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

/**
 * Liquid Glass Animation Configuration
 *
 * Spring-based animations for fluid, responsive feel
 * Follows iOS 26 Liquid Glass design principles
 *
 * Animation Philosophy:
 * - Use springs for organic, natural motion
 * - Timing for precise, controlled animations
 * - 200-300ms for quick, responsive feel
 * - Slight overshoot for playful, dynamic character
 */

/**
 * Spring Configuration Presets
 * Tuned for iOS 26 Liquid Glass feel
 */

export const SpringConfig = {
  /**
   * Default spring - Smooth, responsive
   * Use for: Most UI interactions, transitions
   *
   * Characteristics:
   * - Damping: 15 (moderate bounce)
   * - Stiffness: 150 (responsive)
   * - Mass: 1 (standard weight)
   */
  default: {
    damping: 15,
    stiffness: 150,
    mass: 1,
    overshootClamping: false,
  } as WithSpringConfig,

  /**
   * Gentle spring - Soft, subtle
   * Use for: Subtle hover effects, small animations
   *
   * Characteristics:
   * - Higher damping (20) = less bounce
   * - Lower stiffness (100) = slower, softer
   */
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
    overshootClamping: false,
  } as WithSpringConfig,

  /**
   * Bouncy spring - Playful, dynamic
   * Use for: Button presses, interactive elements
   *
   * Characteristics:
   * - Lower damping (12) = more bounce
   * - Higher stiffness (180) = snappier
   */
  bouncy: {
    damping: 12,
    stiffness: 180,
    mass: 1,
    overshootClamping: false,
  } as WithSpringConfig,

  /**
   * Stiff spring - Precise, mechanical
   * Use for: Modal presentations, sheet animations
   *
   * Characteristics:
   * - High damping (20) = no overshoot
   * - High stiffness (200) = very responsive
   */
  stiff: {
    damping: 20,
    stiffness: 200,
    mass: 1,
    overshootClamping: true,
  } as WithSpringConfig,

  /**
   * Smooth spring - Fluid, elegant
   * Use for: Glass morphing, large transitions
   *
   * Characteristics:
   * - Moderate damping (18)
   * - Moderate stiffness (120)
   * - Slightly heavier mass (1.2) for smoothness
   */
  smooth: {
    damping: 18,
    stiffness: 120,
    mass: 1.2,
    overshootClamping: false,
  } as WithSpringConfig,
};

/**
 * Timing Configuration Presets
 * For precise, controlled animations
 */

export const TimingConfig = {
  /**
   * Quick - Fast transitions
   * Duration: 200ms
   * Use for: Button feedback, quick state changes
   */
  quick: {
    duration: 200,
    easing: Easing.out(Easing.cubic),
  } as WithTimingConfig,

  /**
   * Normal - Standard transitions
   * Duration: 300ms
   * Use for: Most UI transitions
   */
  normal: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  } as WithTimingConfig,

  /**
   * Slow - Deliberate transitions
   * Duration: 500ms
   * Use for: Major state changes, complex animations
   */
  slow: {
    duration: 500,
    easing: Easing.out(Easing.cubic),
  } as WithTimingConfig,

  /**
   * Linear - Constant speed
   * Use for: Loading indicators, progress bars
   */
  linear: {
    duration: 300,
    easing: Easing.linear,
  } as WithTimingConfig,
};

/**
 * Animation Presets for Common UI Patterns
 */

/**
 * Button Press Animation
 * Scale down to 0.95 with bouncy spring
 *
 * @example
 * ```typescript
 * const animatedStyle = useAnimatedStyle(() => ({
 *   transform: [{ scale: withSpring(pressed ? 0.95 : 1, SpringConfig.bouncy) }]
 * }));
 * ```
 */
export const buttonPressScale = 0.95;

/**
 * Create button press animation
 */
export const createButtonPressAnimation = (pressed: boolean) => {
  'worklet';
  return withSpring(pressed ? buttonPressScale : 1, SpringConfig.bouncy);
};

/**
 * Modal Presentation Animation
 * Slide from bottom with smooth spring
 *
 * @example
 * ```typescript
 * const animatedStyle = useAnimatedStyle(() => ({
 *   transform: [{ translateY: withSpring(visible ? 0 : screenHeight, SpringConfig.smooth) }]
 * }));
 * ```
 */
export const createModalAnimation = (visible: boolean, screenHeight: number) => {
  'worklet';
  return withSpring(visible ? 0 : screenHeight, SpringConfig.smooth);
};

/**
 * Toast/Snackbar Animation
 * Slide from top (iOS) or bottom (Android) with spring
 */
export const createToastAnimation = (
  visible: boolean,
  distance: number,
  fromTop: boolean = true
) => {
  'worklet';
  const targetValue = visible ? 0 : (fromTop ? -distance : distance);
  return withSpring(targetValue, SpringConfig.default);
};

/**
 * Fade Animation
 * Smooth opacity transition
 *
 * @example
 * ```typescript
 * const animatedStyle = useAnimatedStyle(() => ({
 *   opacity: withTiming(visible ? 1 : 0, TimingConfig.normal)
 * }));
 * ```
 */
export const createFadeAnimation = (visible: boolean, quick: boolean = false) => {
  'worklet';
  return withTiming(visible ? 1 : 0, quick ? TimingConfig.quick : TimingConfig.normal);
};

/**
 * Scale Animation
 * Grow/shrink element with spring
 *
 * @example
 * ```typescript
 * const animatedStyle = useAnimatedStyle(() => ({
 *   transform: [{ scale: withSpring(visible ? 1 : 0, SpringConfig.bouncy) }]
 * }));
 * ```
 */
export const createScaleAnimation = (visible: boolean, from: number = 0) => {
  'worklet';
  return withSpring(visible ? 1 : from, SpringConfig.bouncy);
};

/**
 * Slide Animation
 * Slide element in/out
 *
 * @param visible - Whether element should be visible
 * @param distance - Distance to slide
 * @param direction - 'left' | 'right' | 'up' | 'down'
 */
export const createSlideAnimation = (
  visible: boolean,
  distance: number,
  direction: 'left' | 'right' | 'up' | 'down' = 'right'
) => {
  'worklet';
  const multiplier = direction === 'left' || direction === 'up' ? -1 : 1;
  return withSpring(visible ? 0 : distance * multiplier, SpringConfig.default);
};

/**
 * Shimmer Animation (for skeleton loading)
 * Continuous loop animation
 *
 * @example
 * ```typescript
 * const shimmer = useSharedValue(0);
 *
 * useEffect(() => {
 *   shimmer.value = withRepeat(
 *     withTiming(1, { duration: 1500, easing: Easing.linear }),
 *     -1,
 *     false
 *   );
 * }, []);
 * ```
 */
export const shimmerDuration = 1500; // 1.5 seconds

/**
 * Shake Animation (for errors)
 * Rapid left-right motion
 *
 * @example
 * ```typescript
 * const shakeValue = useSharedValue(0);
 *
 * const shake = () => {
 *   shakeValue.value = withSequence(
 *     withTiming(10, { duration: 50 }),
 *     withTiming(-10, { duration: 50 }),
 *     withTiming(10, { duration: 50 }),
 *     withTiming(0, { duration: 50 })
 *   );
 * };
 * ```
 */
export const shakeDistance = 10;
export const shakeDuration = 50;

/**
 * Animation Utilities
 */

/**
 * Get animation config for platform
 * iOS: Prefers springs
 * Android: Can use either, but Material Design often uses timing
 */
export const getPlatformAnimationConfig = (useSpring: boolean = true) => {
  return useSpring ? SpringConfig.default : TimingConfig.normal;
};

/**
 * Gesture-driven animation helpers
 */

/**
 * Swipe threshold distance
 * Distance needed to trigger swipe action
 */
export const swipeThreshold = 80;

/**
 * Swipe velocity threshold
 * Velocity needed to trigger swipe action
 */
export const swipeVelocityThreshold = 500;

/**
 * Long press duration
 * Time to hold before long press triggers
 */
export const longPressDuration = 500; // ms

/**
 * Animation Constants
 */

export const AnimationConstants = {
  // Durations
  duration: {
    instant: 0,
    quick: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },

  // Scales
  scale: {
    pressed: 0.95,
    hover: 1.02,
    active: 0.98,
    disabled: 0.95,
  },

  // Opacities
  opacity: {
    hidden: 0,
    disabled: 0.5,
    muted: 0.6,
    visible: 1,
  },

  // Gesture thresholds
  gesture: {
    swipeDistance: swipeThreshold,
    swipeVelocity: swipeVelocityThreshold,
    longPress: longPressDuration,
  },
} as const;

export default {
  SpringConfig,
  TimingConfig,
  AnimationConstants,
  createButtonPressAnimation,
  createModalAnimation,
  createToastAnimation,
  createFadeAnimation,
  createScaleAnimation,
  createSlideAnimation,
};
