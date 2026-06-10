/**
 * useStaggeredList - Staggered list item animation hook
 *
 * Provides animated styles for list items that animate in with a stagger effect.
 * Each item animates after a delay based on its index.
 *
 * @example
 * ```tsx
 * export function MyList({ items }: { items: Item[] }) {
 *   const { opacities, translates } = useStaggeredListValues(items.length);
 *
 *   return (
 *     <View>
 *       {items.map((item, index) => (
 *         <AnimatedListItem
 *           key={item.id}
 *           opacity={opacities[index]}
 *           translateX={translates[index]}
 *         >
 *           <ListItem item={item} />
 *         </AnimatedListItem>
 *       ))}
 *     </View>
 *   );
 * }
 * ```
 *
 * @see IOS-GUIDELINES.md - Animation durations 0.2-0.35s, max 8 concurrent
 * @see DESIGN-UI-UX-GUIDELINES.md - Stagger delay 50-100ms per item
 */

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
  makeMutable,
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

interface StaggeredSharedValuePool {
  opacities: SharedValue<number>[];
  translates: SharedValue<number>[];
}

const allocatePool = (
  count: number,
  hiddenOpacity: number,
  hiddenTranslate: number,
): StaggeredSharedValuePool => ({
  opacities: Array.from({ length: count }, () => makeMutable(hiddenOpacity)),
  translates: Array.from({ length: count }, () => makeMutable(hiddenTranslate)),
});

const growPool = (
  pool: StaggeredSharedValuePool,
  count: number,
  hiddenOpacity: number,
  hiddenTranslate: number,
): StaggeredSharedValuePool => {
  const missing = count - pool.opacities.length;
  if (missing <= 0) {
    return pool;
  }
  const extra = allocatePool(missing, hiddenOpacity, hiddenTranslate);
  return {
    opacities: [...pool.opacities, ...extra.opacities],
    translates: [...pool.translates, ...extra.translates],
  };
};

/**
 * Lazily allocate shared values for `Math.min(itemCount, MAX_ITEMS)` items
 * instead of MAX_ITEMS upfront (2 x 50 makeMutable per mount regardless of list
 * size). The pool only ever grows; each shared value is created exactly once.
 * Growth uses a render-phase state update so new rows have their hidden initial
 * values before commit (no visible flash), mirroring the Toast.tsx
 * derive-during-render pattern that keeps the React Compiler happy.
 * "Create once" values live in a useState initializer per repo convention.
 */
function useStaggeredSharedValuePool(
  effectiveCount: number,
  hiddenOpacity: number,
  hiddenTranslate: number,
): StaggeredSharedValuePool {
  const [pool, setPool] = useState(() =>
    allocatePool(effectiveCount, hiddenOpacity, hiddenTranslate),
  );

  if (pool.opacities.length < effectiveCount) {
    setPool((prev) => growPool(prev, effectiveCount, hiddenOpacity, hiddenTranslate));
  }

  return pool;
}

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
  const effectiveCount = Math.min(itemCount, MAX_ITEMS);

  // Shared values allocated lazily for the items actually rendered (capped at
  // MAX_ITEMS); the pool grows when the list grows and values are created once.
  const { opacities, translates } = useStaggeredSharedValuePool(
    effectiveCount,
    shouldReduceMotion ? 1 : 0,
    shouldReduceMotion ? 0 : (direction === 'left' ? -initialOffset : initialOffset),
  );

  const completedCount = useSharedValue(0);

  const triggerAnimation = () => {
    if (shouldReduceMotion) {
      // Instant transition for reduced motion
      for (let i = 0; i < effectiveCount; i++) {
        opacities[i]?.set(1);
        translates[i]?.set(0);
      }
      if (onComplete) {
        onComplete();
      }
      return;
    }

    completedCount.set(0);

    for (let i = 0; i < effectiveCount; i++) {
      // Calculate delay with max concurrent limit
      // Items beyond maxConcurrent start after first batch completes
      const batchIndex = Math.floor(i / maxConcurrent);
      const delay = (i % maxConcurrent) * delayPerItem + batchIndex * (delayPerItem * maxConcurrent);

      opacities[i]?.set(withDelay(
        delay,
        withTiming(1, TimingConfig.normal, (finished) => {
          if (finished) {
            completedCount.set(completedCount.get() + 1);
            if (completedCount.get() === effectiveCount && onComplete) {
              runOnJS(onComplete)();
            }
          }
        })
      ));

      translates[i]?.set(withDelay(
        delay,
        withSpring(0, SpringConfig.gentle)
      ));
    }
  };

  const reset = () => {
    const offset = direction === 'left' ? -initialOffset : initialOffset;
    for (let i = 0; i < effectiveCount; i++) {
      opacities[i]?.set(shouldReduceMotion ? 1 : 0);
      translates[i]?.set(shouldReduceMotion ? 0 : offset);
    }
    completedCount.set(0);
  };

  // Trigger animation on mount if enabled
  // Effect: trigger stagger animation on mount when enabled.
  useEffect(() => {
    if (animateOnMount && itemCount > 0) {
      triggerAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCount]);

  return {
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
  opacity?: SharedValue<number> | undefined;
  translateX?: SharedValue<number> | undefined;
  style?: ViewStyle;
}

export function AnimatedListItem({
  children,
  opacity,
  translateX,
  style,
}: AnimatedListItemProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity?.get() ?? 1,
    transform: [{ translateX: translateX?.get() ?? 0 }],
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

  // Shared values allocated lazily for the items actually rendered (capped at
  // MAX_ITEMS); the pool grows when the list grows and values are created once.
  const { opacities, translates } = useStaggeredSharedValuePool(
    effectiveCount,
    shouldReduceMotion ? 1 : 0,
    shouldReduceMotion ? 0 : (direction === 'left' ? -initialOffset : initialOffset),
  );

  const completedCount = useSharedValue(0);

  const triggerAnimation = () => {
    if (shouldReduceMotion) {
      for (let i = 0; i < effectiveCount; i++) {
        opacities[i]?.set(1);
        translates[i]?.set(0);
      }
      if (onComplete) {
        onComplete();
      }
      return;
    }

    completedCount.set(0);

    for (let i = 0; i < effectiveCount; i++) {
      const batchIndex = Math.floor(i / maxConcurrent);
      const delay = (i % maxConcurrent) * delayPerItem + batchIndex * (delayPerItem * maxConcurrent);

      opacities[i]?.set(withDelay(
        delay,
        withTiming(1, TimingConfig.normal, (finished) => {
          if (finished) {
            completedCount.set(completedCount.get() + 1);
            if (completedCount.get() === effectiveCount && onComplete) {
              runOnJS(onComplete)();
            }
          }
        })
      ));

      translates[i]?.set(withDelay(delay, withSpring(0, SpringConfig.gentle)));
    }
  };

  const reset = () => {
    const offset = direction === 'left' ? -initialOffset : initialOffset;
    for (let i = 0; i < effectiveCount; i++) {
      opacities[i]?.set(shouldReduceMotion ? 1 : 0);
      translates[i]?.set(shouldReduceMotion ? 0 : offset);
    }
    completedCount.set(0);
  };

  useEffect(() => {
    if (animateOnMount && itemCount > 0) {
      triggerAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCount]);

  return {
    // The pool can be one render ahead of a shrinking list; slice keeps the
    // exposed arrays in lockstep with the rendered item count.
    opacities: opacities.slice(0, effectiveCount),
    translates: translates.slice(0, effectiveCount),
    triggerAnimation,
    reset,
  };
}

export default useStaggeredList;
