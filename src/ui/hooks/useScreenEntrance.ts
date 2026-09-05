import { useEffect } from "react";
import type { ViewStyle } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useMotionReduction } from "../../context/AccessibilityContext";
import { SpringConfig, TimingConfig } from "../../utils/animations";

export function useScreenEntrance() {
  const { shouldReduceMotion } = useMotionReduction();
  const opacity = useSharedValue(shouldReduceMotion ? 1 : 0);
  const translateY = useSharedValue(shouldReduceMotion ? 0 : 20);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (shouldReduceMotion) {
        opacity.set(1);
        translateY.set(0);
        return;
      }
      opacity.set(withTiming(1, TimingConfig.normal));
      translateY.set(withSpring(0, SpringConfig.gentle));
    }, 0);

    return () => clearTimeout(timeout);
    // Entrance runs once; accessibility preferences are resolved before mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle<ViewStyle>(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: translateY.get() }],
  }));

  return { animatedStyle };
}
