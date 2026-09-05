import { Easing } from "react-native-reanimated";
import type {
  WithSpringConfig,
  WithTimingConfig,
} from "react-native-reanimated";

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

  /**
   * Press spring - Tactile, no overshoot
   * Use for: scale-on-press feedback (buttons, icon buttons)
   *
   * Critically damped with overshootClamping so the scale never springs
   * back above 1.0 (the "bounce must be 0" rule for press/icon feedback).
   */
  press: {
    damping: 20,
    stiffness: 300,
    mass: 1,
    overshootClamping: true,
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
 * Scale down to 0.96 with bouncy spring.
 *
 * 0.96 is the canonical tactile-press value: large enough to read as a press,
 * small enough not to feel exaggerated (anything below 0.95 over-shrinks).
 *
 * @example
 * ```typescript
 * const animatedStyle = useAnimatedStyle(() => ({
 *   transform: [{ scale: withSpring(pressed ? 0.96 : 1, SpringConfig.bouncy) }]
 * }));
 * ```
 */
export const buttonPressScale = 0.96;

export const shimmerDuration = 1500;
