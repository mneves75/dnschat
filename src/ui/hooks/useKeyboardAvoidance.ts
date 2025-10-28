import { useAnimatedStyle, AnimatedStyleProp, ViewStyle } from 'react-native-reanimated';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * useKeyboardAvoidance Hook
 *
 * Provides smooth keyboard avoidance with native timing curves using
 * react-native-keyboard-controller for UI thread performance.
 *
 * **Architecture:**
 * - Native keyboard height tracking (no fixed offsets, no guessing)
 * - Reanimated shared values for 60fps UI thread animations
 * - Proper iOS/Android keyboard animation curves (matches system)
 * - Coordinate with SafeAreaView (SafeAreaView should NOT include 'bottom' edge)
 *
 * **Usage:**
 * ```typescript
 * // In Chat.tsx
 * const animatedStyle = useKeyboardAvoidance();
 *
 * <SafeAreaView edges={['left', 'right']}>  // NO 'bottom'!
 *   <Animated.View style={[styles.container, animatedStyle]}>
 *     <MessageList />
 *     <ChatInput />
 *   </Animated.View>
 * </SafeAreaView>
 * ```
 *
 * **Behavior:**
 * - Without keyboard: paddingBottom = safe area inset (e.g., 34px iPhone X+)
 * - With keyboard: paddingBottom = keyboard height + safe area inset
 * - Animations run on UI thread, match native keyboard timing
 *
 * **CRITICAL:** Parent SafeAreaView MUST NOT include 'bottom' in edges array.
 * This hook handles all bottom spacing (safe area + keyboard). Including 'bottom'
 * in SafeAreaView causes double padding.
 *
 * **Platform Differences:**
 * - iOS: Uses UIKeyboard notifications, smooth curves
 * - Android: Uses WindowInsets API, respects windowSoftInputMode
 * - Both: Handled automatically by react-native-keyboard-controller
 *
 * @returns Animated style object with paddingBottom for keyboard avoidance
 */
export const useKeyboardAvoidance = (): AnimatedStyleProp<ViewStyle> => {
  const insets = useSafeAreaInsets();
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';

    // Base padding: safe area inset (home indicator, notch, etc.)
    // This is always present, keyboard or not
    const basePadding = insets.bottom;

    // Keyboard padding: keyboard height when visible, 0 when hidden
    // keyboard-controller provides keyboard height directly from native
    const keyboardPadding = keyboardHeight.value;

    // Total padding: base + keyboard
    // When keyboard hidden: basePadding + 0 = basePadding (e.g., 34px)
    // When keyboard visible: basePadding + keyboardHeight (e.g., 34 + 300 = 334px)
    return {
      paddingBottom: basePadding + keyboardPadding,
    };
  });

  return animatedStyle;
};

export default useKeyboardAvoidance;
