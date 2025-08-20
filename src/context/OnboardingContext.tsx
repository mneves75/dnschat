import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  completed: boolean;
}

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  completeOnboarding: () => Promise<void>;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  markStepCompleted: (stepId: string) => void;
  loading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = '@chat_dns_onboarding';

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to DNS Chat',
    description: 'Chat with AI through the magic of DNS',
    component: 'WelcomeScreen',
    completed: false,
  },
  {
    id: 'dns-magic',
    title: 'See DNS in Action',
    description: 'Watch as your messages travel through DNS queries',
    component: 'DNSMagicScreen',
    completed: false,
  },
  {
    id: 'first-chat',
    title: 'Your First Chat',
    description: 'Send your first message and see the magic happen',
    component: 'FirstChatScreen',
    completed: false,
  },
  {
    id: 'features',
    title: 'Powerful Features',
    description: 'Discover advanced features and customization',
    component: 'FeaturesScreen',
    completed: false,
  },
];

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<OnboardingStep[]>(ONBOARDING_STEPS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      const onboardingData = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (onboardingData) {
        const { completed, stepIndex, completedSteps } = JSON.parse(onboardingData);
        setHasCompletedOnboarding(completed || false);
        setCurrentStep(stepIndex || 0);
        
        if (completedSteps) {
          setSteps(prevSteps => 
            prevSteps.map(step => ({
              ...step,
              completed: completedSteps.includes(step.id)
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOnboardingState = async (completed: boolean, stepIndex: number, completedSteps: string[]) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({
        completed,
        stepIndex,
        completedSteps,
      }));
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  const completeOnboarding = async () => {
    setHasCompletedOnboarding(true);
    const completedSteps = steps.map(step => step.id);
    await saveOnboardingState(true, steps.length - 1, completedSteps);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      const completedSteps = steps.slice(0, newStep).map(step => step.id);
      saveOnboardingState(false, newStep, completedSteps);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      const completedSteps = steps.slice(0, newStep).map(step => step.id);
      saveOnboardingState(false, newStep, completedSteps);
    }
  };

  const skipOnboarding = async () => {
    await completeOnboarding();
  };

  const resetOnboarding = async () => {
    setHasCompletedOnboarding(false);
    setCurrentStep(0);
    setSteps(ONBOARDING_STEPS);
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
  };

  const markStepCompleted = (stepId: string) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  return (
    <OnboardingContext.Provider value={{
      hasCompletedOnboarding,
      currentStep,
      steps,
      completeOnboarding,
      nextStep,
      previousStep,
      skipOnboarding,
      resetOnboarding,
      markStepCompleted,
      loading,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}