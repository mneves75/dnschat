import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useOnboarding } from "../../context/OnboardingContext";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { useTypography } from "../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../ui/theme/liquidGlassSpacing";

interface OnboardingNavigationProps {
  showSkip?: boolean;
  showBack?: boolean;
  nextButtonText?: string;
  onCustomNext?: () => void;
}

export function OnboardingNavigation({
  showSkip = true,
  showBack = true,
  nextButtonText = "Continue",
  onCustomNext,
}: OnboardingNavigationProps) {
  const palette = useImessagePalette();
  const typography = useTypography();
  const {
    currentStep,
    steps,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboarding();

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (onCustomNext) {
      onCustomNext();
    } else if (isLastStep) {
      completeOnboarding();
    } else {
      nextStep();
    }
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {/* iOS HIG: Skip button allows users to bypass onboarding tutorial */}
        {showSkip && !isLastStep && (
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            testID="skip-onboarding"
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            accessibilityHint="Skips the tutorial and goes directly to the app"
          >
            <Text
              style={[
                typography.callout,
                styles.skipButtonText,
                { color: palette.textSecondary },
              ]}
            >
              Skip
            </Text>
          </TouchableOpacity>
        )}

        {/* iOS HIG: Back button for navigation between onboarding steps */}
        {showBack && !isFirstStep && (
          <TouchableOpacity
            onPress={previousStep}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back to previous step"
            accessibilityHint="Returns to the previous onboarding screen"
          >
            <Text
              style={[
                typography.callout,
                styles.backButtonText,
                { color: palette.accentTint },
              ]}
            >
              Back
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* iOS HIG: Primary action button - changes label and behavior on last step */}
      <TouchableOpacity
        onPress={handleNext}
        style={[
          styles.nextButton,
          { backgroundColor: palette.accentTint },
        ]}
        testID={isLastStep ? "onboarding-complete" : "onboarding-continue"}
        accessibilityRole="button"
        accessibilityLabel={isLastStep ? "Get Started" : nextButtonText}
        accessibilityHint={
          isLastStep
            ? "Completes onboarding and opens the app"
            : "Proceeds to the next onboarding step"
        }
      >
        <Text
          style={[
            typography.callout,
            styles.nextButtonText,
            { color: palette.solid },
          ]}
        >
          {isLastStep ? "Get Started" : nextButtonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.lg,
    paddingBottom: LiquidGlassSpacing.xxxl,
  },
  leftSection: {
    flexDirection: "row",
    gap: LiquidGlassSpacing.md,
  },
  skipButton: {
    paddingVertical: LiquidGlassSpacing.sm,
    paddingHorizontal: LiquidGlassSpacing.md,
  },
  skipButtonText: {
    fontWeight: "500",
  },
  backButton: {
    paddingVertical: LiquidGlassSpacing.sm,
    paddingHorizontal: LiquidGlassSpacing.md,
  },
  backButtonText: {
    fontWeight: "500",
  },
  nextButton: {
    paddingVertical: LiquidGlassSpacing.sm,
    paddingHorizontal: LiquidGlassSpacing.xl,
    borderRadius: LiquidGlassSpacing.xl,
    minWidth: 120,
    alignItems: "center",
  },
  nextButtonText: {
    fontWeight: "600",
  },
});
