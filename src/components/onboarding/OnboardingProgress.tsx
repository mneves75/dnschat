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
import type { MessageKey } from "../../i18n";

const STEP_TITLE_KEYS: Record<string, MessageKey> = {
  WelcomeScreen: "screen.onboarding.welcome.title",
  DNSMagicScreen: "screen.onboarding.dnsMagic.title",
  NetworkSetupScreen: "screen.onboarding.networkSetup.title",
  FirstChatScreen: "screen.onboarding.firstChat.title",
  FeaturesScreen: "screen.onboarding.ready.title",
};

export function OnboardingProgress() {
  const palette = useImessagePalette();
  const typography = useTypography();
  const { currentStep, steps } = useOnboarding();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const progress = (currentStep + 1) / steps.length;
  const progressWidth = Math.max(0, screenWidth - (LiquidGlassSpacing.md * 2));
  const currentStepData = steps[currentStep];
  const currentStepTitleKey = currentStepData
    ? STEP_TITLE_KEYS[currentStepData.component]
    : undefined;
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
          {t("screen.onboarding.navigation.stepCounter", {
            current: currentStep + 1,
            total: steps.length,
          })}
        </Text>
        <Text
          style={[
            typography.title3,
            styles.titleText,
            { color: palette.textPrimary },
          ]}
        >
          {currentStepTitleKey ? t(currentStepTitleKey) : ""}
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
  titleText: {
    fontWeight: "700",
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
