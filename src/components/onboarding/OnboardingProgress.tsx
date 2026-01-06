import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { useOnboarding } from "../../context/OnboardingContext";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { useTypography } from "../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../ui/theme/liquidGlassSpacing";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PROGRESS_WIDTH = SCREEN_WIDTH - (LiquidGlassSpacing.md * 2);

export function OnboardingProgress() {
  const palette = useImessagePalette();
  const typography = useTypography();
  const { currentStep, steps } = useOnboarding();

  const progress = (currentStep + 1) / steps.length;
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  // Effect: animate progress bar when onboarding step changes.
  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            typography.footnote,
            styles.stepText,
            { color: palette.textSecondary },
          ]}
        >
          Step {currentStep + 1} of {steps.length}
        </Text>
        <Text
          style={[
            typography.title3,
            styles.titleText,
            { color: palette.textPrimary },
          ]}
        >
          {steps[currentStep]?.title || ""}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBackground,
            { backgroundColor: palette.separator },
          ]}
        >
          <Animated.View
            style={[
              styles.progressBar,
              { backgroundColor: palette.accentTint },
              {
                width: animatedWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, PROGRESS_WIDTH],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.dotsContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index <= currentStep ? palette.accentTint : palette.separator,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.lg,
  },
  header: {
    marginBottom: LiquidGlassSpacing.md,
  },
  stepText: {
    fontWeight: "500",
    marginBottom: LiquidGlassSpacing.xxs,
  },
  titleText: {
    fontWeight: "700",
  },
  progressContainer: {
    position: "relative",
  },
  progressBackground: {
    width: PROGRESS_WIDTH,
    height: LiquidGlassSpacing.xxs,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: -2,
    width: PROGRESS_WIDTH,
    paddingHorizontal: LiquidGlassSpacing.xxs,
  },
  dot: {
    width: LiquidGlassSpacing.xs,
    height: LiquidGlassSpacing.xs,
    borderRadius: LiquidGlassSpacing.xxs,
  },
});
