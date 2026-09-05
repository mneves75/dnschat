import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  makeMutable,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import type { ViewStyle } from "react-native";
import { useMotionReduction } from "../../context/AccessibilityContext";
import { SpringConfig, TimingConfig } from "../../utils/animations";

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
    setPool((prev) =>
      growPool(prev, effectiveCount, hiddenOpacity, hiddenTranslate),
    );
  }

  return pool;
}

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
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}

export function useStaggeredListValues(itemCount: number) {
  const { shouldReduceMotion } = useMotionReduction();
  const effectiveCount = Math.min(itemCount, MAX_ITEMS);
  const { opacities, translates } = useStaggeredSharedValuePool(
    effectiveCount,
    shouldReduceMotion ? 1 : 0,
    shouldReduceMotion ? 0 : 20,
  );

  useEffect(() => {
    for (let i = 0; i < effectiveCount; i++) {
      if (shouldReduceMotion) {
        opacities[i]?.set(1);
        translates[i]?.set(0);
      } else {
        const delay = i * 50;
        opacities[i]?.set(withDelay(delay, withTiming(1, TimingConfig.normal)));
        translates[i]?.set(
          withDelay(delay, withSpring(0, SpringConfig.gentle)),
        );
      }
    }
    // Restart the entrance only when the list size changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCount]);

  return {
    opacities: opacities.slice(0, effectiveCount),
    translates: translates.slice(0, effectiveCount),
  };
}
