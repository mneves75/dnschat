import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useOnboarding } from "../../context/OnboardingContext";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { useTypography } from "../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../../i18n";
import { useMotionReduction } from "../../context/AccessibilityContext";

export function OnboardingProgress() {
  const palette = useImessagePalette();
  const typography = useTypography();
  const { currentStep, steps } = useOnboarding();
  const { t } = useTranslation();
  const { shouldReduceMotion } = useMotionReduction();
  const { width: screenWidth } = useWindowDimensions();

  const progress = (currentStep + 1) / steps.length;
  const progressWidth = Math.max(0, screenWidth - (LiquidGlassSpacing.md * 2));
  // useState initializer creates the value once and is safe to read during
  // render (unlike a ref, whose `.current` cannot be accessed while rendering).
  const [animatedWidth] = React.useState(() => new Animated.Value(0));

  // Effect: animate progress bar when onboarding step changes.
  React.useEffect(() => {
    if (shouldReduceMotion) {
      animatedWidth.setValue(progress);
      return;
    }

    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [animatedWidth, progress, shouldReduceMotion]);

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
          {t("screen.onboarding.navigation.stepCounter", {
            current: currentStep + 1,
            total: steps.length,
          })}
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
                  outputRange: [0, progressWidth],
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
  progressContainer: {
    position: "relative",
  },
  progressBackground: {
    width: "100%",
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
    width: "100%",
    paddingHorizontal: LiquidGlassSpacing.xxs,
  },
  dot: {
    width: LiquidGlassSpacing.xs,
    height: LiquidGlassSpacing.xs,
    borderRadius: LiquidGlassSpacing.xxs,
  },
});
