/**
 * useStaggeredList - Staggered list item animation hook
 *
 * Provides animated styles for list items that animate in with a stagger effect.
 * Each item animates after a delay based on its index.
 *
 * @example
 * ```tsx
 * export function MyList({ items }: { items: Item[] }) {
 *   const { getItemStyle, triggerAnimation } = useStaggeredList(items.length);
 *
 *   return (
 *     <View>
 *       {items.map((item, index) => (
 *         <Animated.View key={item.id} style={getItemStyle(index)}>
 *           <ListItem item={item} />
 *         </Animated.View>
 *       ))}
 *     </View>
 *   );
 * }
 * ```
 *
 * @see IOS-GUIDELINES.md - Animation durations 0.2-0.35s, max 8 concurrent
 * @see DESIGN-UI-UX-GUIDELINES.md - Stagger delay 50-100ms per item
 */

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';
import { useMotionReduction } from '../../context/AccessibilityContext';
import { SpringConfig, TimingConfig } from '../../utils/animations';

interface UseStaggeredListOptions {
  /**
   * Delay between each item animation (ms)
   * @default 50
   */
  delayPerItem?: number;

  /**
   * Initial X offset for slide animation
   * @default 20
   */
  initialOffset?: number;

  /**
   * Direction of slide animation
   * @default 'right'
   */
  direction?: 'left' | 'right';

  /**
   * Maximum number of concurrent animations (iOS HIG recommends max 8)
   * @default 8
   */
  maxConcurrent?: number;

  /**
   * Whether to animate on mount
   * @default true
   */
  animateOnMount?: boolean;

  /**
   * Callback when all animations complete
   */
  onComplete?: () => void;
}

interface UseStaggeredListResult {
  /**
   * Get animated style for a specific item index
   */
  getItemStyle: (index: number) => ReturnType<typeof useAnimatedStyle>;

  /**
   * Manually trigger the stagger animation
   */
  triggerAnimation: () => void;

  /**
   * Reset all items to initial state
   */
  reset: () => void;
}

// Maximum items we'll create shared values for
const MAX_ITEMS = 50;

export function useStaggeredList(
  itemCount: number,
  options: UseStaggeredListOptions = {}
): UseStaggeredListResult {
  const {
    delayPerItem = 50,
    initialOffset = 20,
    direction = 'right',
    maxConcurrent = 8,
    animateOnMount = true,
    onComplete,
  } = options;

  const { shouldReduceMotion } = useMotionReduction();

  // Create shared values for each possible item (capped at MAX_ITEMS)
  const opacities = useRef(
    Array.from({ length: MAX_ITEMS }, () => useSharedValue(shouldReduceMotion ? 1 : 0))
  ).current;

  const translates = useRef(
    Array.from({ length: MAX_ITEMS }, () =>
      useSharedValue(shouldReduceMotion ? 0 : (direction === 'left' ? -initialOffset : initialOffset))
    )
  ).current;

  const completedCount = useSharedValue(0);

  const triggerAnimation = () => {
    if (shouldReduceMotion) {
      // Instant transition for reduced motion
      for (let i = 0; i < Math.min(itemCount, MAX_ITEMS); i++) {
        opacities[i].value = 1;
        translates[i].value = 0;
      }
      if (onComplete) {
        onComplete();
      }
      return;
    }

    completedCount.value = 0;
    const effectiveCount = Math.min(itemCount, MAX_ITEMS);

    for (let i = 0; i < effectiveCount; i++) {
      // Calculate delay with max concurrent limit
      // Items beyond maxConcurrent start after first batch completes
      const batchIndex = Math.floor(i / maxConcurrent);
      const delay = (i % maxConcurrent) * delayPerItem + batchIndex * (delayPerItem * maxConcurrent);

      opacities[i].value = withDelay(
        delay,
        withTiming(1, TimingConfig.normal, (finished) => {
          if (finished) {
            completedCount.value += 1;
            if (completedCount.value === effectiveCount && onComplete) {
              runOnJS(onComplete)();
            }
          }
        })
      );

      translates[i].value = withDelay(
        delay,
        withSpring(0, SpringConfig.gentle)
      );
    }
  };

  const reset = () => {
    const offset = direction === 'left' ? -initialOffset : initialOffset;
    for (let i = 0; i < Math.min(itemCount, MAX_ITEMS); i++) {
      opacities[i].value = shouldReduceMotion ? 1 : 0;
      translates[i].value = shouldReduceMotion ? 0 : offset;
    }
    completedCount.value = 0;
  };

  // Trigger animation on mount if enabled
  useEffect(() => {
    if (animateOnMount && itemCount > 0) {
      triggerAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCount]);

  return {
    getItemStyle: (index: number) => {
      const safeIndex = Math.min(index, MAX_ITEMS - 1);
      const opacity = opacities[safeIndex];
      const translateX = translates[safeIndex];

      // This is a workaround - in actual usage, the consumer should use
      // AnimatedListItem component or create their own animated style
      return useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
      }));
    },
    triggerAnimation,
    reset,
  };
}

/**
 * AnimatedListItem - Wrapper component for staggered list items
 *
 * Use this when you need to wrap list items with stagger animations.
 * This handles the hook rules properly.
 *
 * @example
 * ```tsx
 * const { opacities, translates } = useStaggeredListValues(items.length);
 *
 * return items.map((item, index) => (
 *   <AnimatedListItem
 *     key={item.id}
 *     opacity={opacities[index]}
 *     translateX={translates[index]}
 *   >
 *     <ListItem item={item} />
 *   </AnimatedListItem>
 * ));
 * ```
 */
interface AnimatedListItemProps {
  children: ReactNode;
  opacity: SharedValue<number>;
  translateX: SharedValue<number>;
  style?: ViewStyle;
}

export function AnimatedListItem({
  children,
  opacity,
  translateX,
  style,
}: AnimatedListItemProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

/**
 * useStaggeredListValues - Lower-level hook returning raw shared values
 *
 * Use this when you need more control over the animation values.
 */
export function useStaggeredListValues(
  itemCount: number,
  options: UseStaggeredListOptions = {}
) {
  const {
    delayPerItem = 50,
    initialOffset = 20,
    direction = 'right',
    maxConcurrent = 8,
    animateOnMount = true,
    onComplete,
  } = options;

  const { shouldReduceMotion } = useMotionReduction();
  const effectiveCount = Math.min(itemCount, MAX_ITEMS);

  // Create shared values
  const opacities = useRef(
    Array.from({ length: MAX_ITEMS }, () => useSharedValue(shouldReduceMotion ? 1 : 0))
  ).current;

  const translates = useRef(
    Array.from({ length: MAX_ITEMS }, () =>
      useSharedValue(shouldReduceMotion ? 0 : (direction === 'left' ? -initialOffset : initialOffset))
    )
  ).current;

  const completedCount = useSharedValue(0);

  const triggerAnimation = () => {
    if (shouldReduceMotion) {
      for (let i = 0; i < effectiveCount; i++) {
        opacities[i].value = 1;
        translates[i].value = 0;
      }
      if (onComplete) {
        onComplete();
      }
      return;
    }

    completedCount.value = 0;

    for (let i = 0; i < effectiveCount; i++) {
      const batchIndex = Math.floor(i / maxConcurrent);
      const delay = (i % maxConcurrent) * delayPerItem + batchIndex * (delayPerItem * maxConcurrent);

      opacities[i].value = withDelay(
        delay,
        withTiming(1, TimingConfig.normal, (finished) => {
          if (finished) {
            completedCount.value += 1;
            if (completedCount.value === effectiveCount && onComplete) {
              runOnJS(onComplete)();
            }
          }
        })
      );

      translates[i].value = withDelay(delay, withSpring(0, SpringConfig.gentle));
    }
  };

  const reset = () => {
    const offset = direction === 'left' ? -initialOffset : initialOffset;
    for (let i = 0; i < effectiveCount; i++) {
      opacities[i].value = shouldReduceMotion ? 1 : 0;
      translates[i].value = shouldReduceMotion ? 0 : offset;
    }
    completedCount.value = 0;
  };

  useEffect(() => {
    if (animateOnMount && itemCount > 0) {
      triggerAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCount]);

  return {
    opacities: opacities.slice(0, effectiveCount),
    translates: translates.slice(0, effectiveCount),
    triggerAnimation,
    reset,
  };
}

export default useStaggeredList;
