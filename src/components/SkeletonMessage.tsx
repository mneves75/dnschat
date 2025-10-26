import React, { useEffect } from "react";
import { View, StyleSheet, useColorScheme } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useImessagePalette } from "../ui/theme/imessagePalette";
import { LiquidGlassSpacing, getCornerRadius } from "../ui/theme/liquidGlassSpacing";
import { shimmerDuration } from "../utils/animations";

interface SkeletonMessageProps {
  /**
   * Whether this is a user message (aligned right) or assistant message (aligned left)
   */
  isUser?: boolean;
}

export function SkeletonMessage({ isUser = false }: SkeletonMessageProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = useImessagePalette();
  const shimmer = useSharedValue(0);

  // Start shimmer animation on mount
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: shimmerDuration,
        easing: Easing.linear,
      }),
      -1, // Infinite loop
      false // Don't reverse
    );
  }, []);

  // Animated shimmer style
  const shimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.3 + shimmer.value * 0.4, // Animate opacity from 0.3 to 0.7
    };
  });

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
      accessible={true}
      accessibilityLabel="Loading message"
      accessibilityRole="progressbar"
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          isDark ? styles.darkBubble : styles.lightBubble,
          isUser && isDark ? styles.darkUserBubble : {},
          !isUser && isDark ? styles.darkAssistantBubble : {},
        ]}
      >
        {/* First line skeleton (80% width) */}
        <Animated.View
          style={[
            styles.textLine,
            styles.textLineLong,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.1)",
            },
            shimmerStyle,
          ]}
        />

        {/* Second line skeleton (60% width) */}
        <Animated.View
          style={[
            styles.textLine,
            styles.textLineMedium,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.1)",
            },
            shimmerStyle,
          ]}
        />

        {/* Timestamp skeleton */}
        <Animated.View
          style={[
            styles.timestamp,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(0, 0, 0, 0.08)",
            },
            shimmerStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: LiquidGlassSpacing.xxs,
    marginHorizontal: LiquidGlassSpacing.md,
    maxWidth: "75%",
  },
  userContainer: {
    alignSelf: "flex-end",
  },
  assistantContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm,
    borderRadius: getCornerRadius("message"),
    minWidth: 120,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: "#F0F0F0",
    borderBottomLeftRadius: 6,
  },
  darkBubble: {
    // Handled by specific bubble types
  },
  lightBubble: {
    // Handled by specific bubble types
  },
  darkUserBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 6,
  },
  darkAssistantBubble: {
    backgroundColor: "#2C2C2E",
    borderBottomLeftRadius: 6,
  },
  textLine: {
    height: 17, // Matches body text height
    borderRadius: 4,
    marginBottom: LiquidGlassSpacing.xxs,
  },
  textLineLong: {
    width: "80%",
  },
  textLineMedium: {
    width: "60%",
  },
  timestamp: {
    height: 12, // Matches caption1 height
    width: 40,
    borderRadius: 4,
    marginTop: LiquidGlassSpacing.xxs,
  },
});
