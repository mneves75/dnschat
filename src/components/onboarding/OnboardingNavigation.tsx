import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useOnboarding } from '../../context/OnboardingContext';

interface OnboardingNavigationProps {
  showSkip?: boolean;
  showBack?: boolean;
  nextButtonText?: string;
  onCustomNext?: () => void;
}

export function OnboardingNavigation({
  showSkip = true,
  showBack = true,
  nextButtonText = 'Continue',
  onCustomNext,
}: OnboardingNavigationProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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
        {showSkip && !isLastStep && (
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <Text style={[
              styles.skipButtonText,
              isDark ? styles.darkSkipButtonText : styles.lightSkipButtonText
            ]}>
              Skip
            </Text>
          </TouchableOpacity>
        )}
        
        {showBack && !isFirstStep && (
          <TouchableOpacity
            onPress={previousStep}
            style={styles.backButton}
          >
            <Text style={[
              styles.backButtonText,
              isDark ? styles.darkBackButtonText : styles.lightBackButtonText
            ]}>
              Back
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={handleNext}
        style={[
          styles.nextButton,
          isDark ? styles.darkNextButton : styles.lightNextButton
        ]}
      >
        <Text style={[
          styles.nextButtonText,
          isDark ? styles.darkNextButtonText : styles.lightNextButtonText
        ]}>
          {isLastStep ? 'Get Started' : nextButtonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  leftSection: {
    flexDirection: 'row',
    gap: 16,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  lightSkipButtonText: {
    color: '#666666',
  },
  darkSkipButtonText: {
    color: '#999999',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  lightBackButtonText: {
    color: '#007AFF',
  },
  darkBackButtonText: {
    color: '#0A84FF',
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  lightNextButton: {
    backgroundColor: '#007AFF',
  },
  darkNextButton: {
    backgroundColor: '#0A84FF',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lightNextButtonText: {
    color: '#FFFFFF',
  },
  darkNextButtonText: {
    color: '#FFFFFF',
  },
});