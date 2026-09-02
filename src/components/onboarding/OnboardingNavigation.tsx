import React from "react";
import { BackHandler, Platform, View, Text, StyleSheet } from "react-native";
import { useOnboarding } from "../../context/OnboardingContext";
import { PressableRipple } from "../PressableRipple";
import { useImessagePalette } from "../../ui/theme/imessagePalette";
import { useTypography } from "../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../../i18n";
import { appAlert } from "../../utils/appAlert";

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
      appAlert(t("common.errorTitle"), message);
    }
    isSubmittingRef.current = false;
    setIsSubmitting(false);
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
  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup
  /* oxlint-disable react-hooks/exhaustive-deps -- The handler intentionally tracks the listed state; runAction has a render-time identity. */
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
  /* oxlint-enable react-hooks/exhaustive-deps */

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
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          borderTopColor: palette.separator,
        },
      ]}
    >
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
                { color: palette.accentText },
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
          { backgroundColor: palette.userBubble },
          isSubmitting && styles.nextButtonDisabled,
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
            { color: palette.textOnChroma },
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
    paddingTop: LiquidGlassSpacing.sm,
    paddingBottom: LiquidGlassSpacing.md,
    gap: LiquidGlassSpacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  leftSection: {
    flexDirection: "row",
    gap: LiquidGlassSpacing.md,
    flexShrink: 1,
  },
  skipButton: {
    paddingVertical: LiquidGlassSpacing.sm,
    paddingHorizontal: LiquidGlassSpacing.md,
    minHeight: 44,
    justifyContent: "center",
  },
  skipButtonText: {
    fontWeight: "500",
  },
  backButton: {
    paddingVertical: LiquidGlassSpacing.sm,
    paddingHorizontal: LiquidGlassSpacing.md,
    minHeight: 44,
    justifyContent: "center",
  },
  backButtonText: {
    fontWeight: "500",
  },
  nextButton: {
    paddingVertical: LiquidGlassSpacing.xs,
    paddingHorizontal: LiquidGlassSpacing.lg,
    borderRadius: 14,
    minHeight: 48,
    minWidth: 132,
    maxWidth: 240,
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    opacity: 0.55,
  },
  nextButtonText: {
    fontWeight: "600",
    textAlign: "center",
  },
});
