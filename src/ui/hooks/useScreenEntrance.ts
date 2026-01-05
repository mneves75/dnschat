/**
 * useScreenEntrance - Screen entrance animation hook
 *
 * Provides a smooth fade-in + translateY animation for screen content.
 * Respects reduce motion accessibility setting.
 *
 * @example
 * ```tsx
 * export function MyScreen() {
 *   const { animatedStyle } = useScreenEntrance();
 *
 *   return (
 *     <Animated.View style={animatedStyle}>
 *       <ScreenContent />
 *     </Animated.View>
 *   );
 * }
 * ```
 *
 * @see IOS-GUIDELINES.md - Animation durations 0.2-0.35s
 * @see DESIGN-UI-UX-GUIDELINES.md - Screen entrance patterns
 */

import { useCallback, useEffect, useState } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';
import { useMotionReduction } from '../../context/AccessibilityContext';
import { SpringConfig, TimingConfig } from '../../utils/animations';

interface UseScreenEntranceOptions {
  /**
   * Initial Y offset for slide animation
   * @default 20
   */
  initialOffset?: number;

  /**
   * Delay before animation starts (ms)
   * @default 0
   */
  delay?: number;

  /**
   * Callback when animation completes
   */
  onComplete?: () => void;

  /**
   * Use spring animation instead of timing
   * @default true
   */
  useSpring?: boolean;
}

interface UseScreenEntranceResult {
  /**
   * Animated style to apply to the screen container
   */
  animatedStyle: ReturnType<typeof useAnimatedStyle>;

  /**
   * Whether the entrance animation has completed
   */
  isReady: boolean;

  /**
   * Manually trigger the entrance animation (useful for re-entry)
   */
  animate: () => void;
}

export function useScreenEntrance(
  options: UseScreenEntranceOptions = {}
): UseScreenEntranceResult {
  const {
    initialOffset = 20,
    delay = 0,
    onComplete,
    useSpring: useSpringAnimation = true,
  } = options;

  const { shouldReduceMotion } = useMotionReduction();

  // Shared values for animation
  const opacity = useSharedValue(shouldReduceMotion ? 1 : 0);
  const translateY = useSharedValue(shouldReduceMotion ? 0 : initialOffset);
  const [isReady, setIsReady] = useState(shouldReduceMotion);

  const markReady = useCallback(() => {
    setIsReady(true);
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  const animate = () => {
    'worklet';

    if (shouldReduceMotion) {
      // Instant transition for reduced motion
      opacity.value = 1;
      translateY.value = 0;
      runOnJS(markReady)();
      return;
    }

    // Opacity: timing animation (0.3s)
    opacity.value = withTiming(1, TimingConfig.normal, (finished) => {
      if (finished) {
        runOnJS(markReady)();
      }
    });

    // TranslateY: spring or timing based on preference
    if (useSpringAnimation) {
      translateY.value = withSpring(0, SpringConfig.gentle);
    } else {
      translateY.value = withTiming(0, TimingConfig.normal);
    }
  };

  // Trigger animation on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      animate();
    }, delay);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return {
    animatedStyle,
    isReady,
    animate,
  };
}

export default useScreenEntrance;
