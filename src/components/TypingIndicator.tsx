/**
 * TypingIndicator - iOS Messages-style animated typing indicator
 *
 * Shows three animated dots when the AI is responding.
 * Uses animation constants from the design system.
 *
 * @author DNSChat Team
 * @since 2.0.1
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  useColorScheme,
  Easing,
} from "react-native";
import { COLORS, ANIMATIONS } from "../theme";

export const TypingIndicator: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Create animated values for each dot
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Staggered pulse animation for each dot
    const createPulseAnimation = (animatedValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: ANIMATIONS.duration.medium, // 400ms
            easing: Easing.bezier(...ANIMATIONS.easing.ios.decelerate),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0.3,
            duration: ANIMATIONS.duration.medium,
            easing: Easing.bezier(...ANIMATIONS.easing.ios.accelerate),
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start animations with staggered delays
    const anim1 = createPulseAnimation(dot1, 0);
    const anim2 = createPulseAnimation(dot2, ANIMATIONS.duration.fast); // 100ms delay
    const anim3 = createPulseAnimation(dot3, ANIMATIONS.duration.quick); // 200ms delay

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dotColor = isDark
    ? COLORS.dark.text.tertiary
    : COLORS.light.text.tertiary;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isDark
              ? COLORS.dark.message.assistant
              : COLORS.light.message.assistant,
            borderColor: isDark
              ? COLORS.dark.glass.border
              : COLORS.light.glass.border,
          },
        ]}
      >
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: dotColor, opacity: dot1 },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: dotColor, opacity: dot2 },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: dotColor, opacity: dot3 },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4,
    marginHorizontal: 12,
    justifyContent: "flex-start", // AI messages on left
  },
  bubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderBottomLeftRadius: 4, // ✅ Tail on bottom-left (assistant messages)
    maxWidth: "75%",
    borderWidth: 1,
    // Match MessageBubble shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
