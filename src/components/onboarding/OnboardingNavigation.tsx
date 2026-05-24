import React from "react";
import {
  Alert,
  BackHandler,
  Platform,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useOnboarding } from "../../context/OnboardingContext";
import { PressableRipple } from "../PressableRipple";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { useTypography } from "../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../../i18n";

interface OnboardingNavigationProps {
  showSkip?: boolean;
  showBack?: boolean;
  nextButtonText?: string;
  onCustomNext?: () => void | Promise<void>;
}

export function OnboardingNavigation({
  showSkip = true,
  showBack = true,
  nextButtonText,
  onCustomNext,
}: OnboardingNavigationProps) {
  const palette = useImessagePalette();
  const typography = useTypography();
  const { t } = useTranslation();
  const {
    currentStep,
    steps,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isSubmittingRef = React.useRef(false);

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const runAction = async (action: () => Promise<void>) => {
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await action();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t("common.unknownError");
      Alert.alert(t("common.errorTitle"), message);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    void runAction(async () => {
      if (onCustomNext) {
        await onCustomNext();
      } else if (isLastStep) {
        await completeOnboarding();
      } else {
        await nextStep();
      }
    });
  };

  // Effect: Android hardware back button — go to previous step instead of popping route.
  React.useEffect(() => {
    if (Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isSubmitting) return true;
        if (!isFirstStep) {
          void runAction(previousStep);
          return true;
        }
        return false; // let the system handle (will exit onboarding)
      },
    );
    return () => subscription.remove();
  }, [isSubmitting, isFirstStep, previousStep]);

  const handleSkip = () => {
    void runAction(skipOnboarding);
  };

  const handleBack = () => {
    void runAction(previousStep);
  };
  const resolvedNextButtonText =
    nextButtonText ??
    (isLastStep
      ? t("screen.onboarding.navigation.getStarted")
      : t("screen.onboarding.navigation.continue"));

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {/* iOS HIG: Skip button allows users to bypass onboarding tutorial */}
        {showSkip && !isLastStep && (
          <PressableRipple
            onPress={handleSkip}
            style={styles.skipButton}
            testID="skip-onboarding"
            disabled={isSubmitting}
            variant="surface"
            pressedOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel={t("screen.onboarding.navigation.skip")}
            accessibilityHint={t("screen.onboarding.navigation.skipHint")}
          >
            <Text
              style={[
                typography.callout,
                styles.skipButtonText,
                { color: palette.textSecondary },
              ]}
            >
              {t("screen.onboarding.navigation.skip")}
            </Text>
          </PressableRipple>
        )}

        {/* iOS HIG: Back button for navigation between onboarding steps */}
        {showBack && !isFirstStep && (
          <PressableRipple
            onPress={handleBack}
            style={styles.backButton}
            disabled={isSubmitting}
            variant="surface"
            pressedOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel={t("screen.onboarding.navigation.back")}
            accessibilityHint={t("screen.onboarding.navigation.backHint")}
          >
            <Text
              style={[
                typography.callout,
                styles.backButtonText,
                { color: palette.accentTint },
              ]}
            >
              {t("screen.onboarding.navigation.back")}
            </Text>
          </PressableRipple>
        )}
      </View>

      {/* iOS HIG: Primary action button - changes label and behavior on last step */}
      <PressableRipple
        onPress={handleNext}
        disabled={isSubmitting}
        style={[
          styles.nextButton,
          { backgroundColor: palette.accentTint },
        ]}
        testID={isLastStep ? "onboarding-complete" : "onboarding-continue"}
        variant="primary"
        pressedOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={resolvedNextButtonText}
        accessibilityHint={
          isLastStep
            ? t("screen.onboarding.navigation.completeHint")
            : t("screen.onboarding.navigation.continueHint")
        }
        accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
      >
        <Text
          style={[
            typography.callout,
            styles.nextButtonText,
            { color: palette.solid },
          ]}
        >
          {resolvedNextButtonText}
        </Text>
      </PressableRipple>
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
