import React, { createContext, use, useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isScreenshotMode } from "../utils/screenshotMode";
import { devWarn } from "../utils/devLog";

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
  nextStep: () => Promise<void>;
  previousStep: () => Promise<void>;
  skipOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  markStepCompleted: (stepId: string) => void;
  loading: boolean;
}

interface PersistedOnboardingState {
  completed: boolean;
  stepIndex: number;
  completedSteps: string[];
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

const ONBOARDING_STORAGE_KEY = "@chat_dns_onboarding";

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to DNS Chat",
    description: "Chat with AI through the magic of DNS",
    component: "WelcomeScreen",
    completed: false,
  },
  {
    id: "dns-magic",
    title: "See DNS in Action",
    description: "Watch as your messages travel through DNS queries",
    component: "DNSMagicScreen",
    completed: false,
  },
  {
    id: "network-setup",
    title: "Network Optimization",
    description: "Let us optimize your DNS settings",
    component: "NetworkSetupScreen",
    completed: false,
  },
  {
    id: "first-chat",
    title: "Your First Chat",
    description: "Send your first message and see the magic happen",
    component: "FirstChatScreen",
    completed: false,
  },
  {
    id: "features",
    title: "Powerful Features",
    description: "Discover advanced features and customization",
    component: "FeaturesScreen",
    completed: false,
  },
];

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] =
    useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<OnboardingStep[]>(ONBOARDING_STEPS);
  const [loading, setLoading] = useState(true);
  const onboardingStateRef = useRef<PersistedOnboardingState>({
    completed: false,
    stepIndex: 0,
    completedSteps: [],
  });
  const persistQueueRef = useRef<Promise<void>>(Promise.resolve());

  // Effect: load persisted onboarding state once on mount.
  useEffect(() => {
    loadOnboardingState();
  }, []);

  const applySnapshot = (snapshot: PersistedOnboardingState) => {
    onboardingStateRef.current = snapshot;
    setHasCompletedOnboarding(snapshot.completed);
    setCurrentStep(snapshot.stepIndex);
    setSteps(
      ONBOARDING_STEPS.map((step) => ({
        ...step,
        completed: snapshot.completedSteps.includes(step.id),
      })),
    );
  };

  const loadOnboardingState = async () => {
    try {
      // Skip onboarding in screenshot mode so snapshot tooling can capture main app screens.
      if (isScreenshotMode()) {
        applySnapshot({
          completed: true,
          stepIndex: ONBOARDING_STEPS.length - 1,
          completedSteps: ONBOARDING_STEPS.map((step) => step.id),
        });
        setLoading(false);
        return;
      }

      const onboardingData = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (onboardingData) {
        const { completed, stepIndex, completedSteps } =
          JSON.parse(onboardingData);
        applySnapshot({
          completed: completed || false,
          stepIndex: stepIndex || 0,
          completedSteps: Array.isArray(completedSteps) ? completedSteps : [],
        });
      }
    } catch (error) {
      devWarn("[OnboardingContext] Error loading onboarding state", error);
    } finally {
      setLoading(false);
    }
  };

  const persistSnapshot = async (
    snapshot: PersistedOnboardingState,
    options?: { remove?: boolean },
  ) => {
    const run = persistQueueRef.current.then(async () => {
      if (options?.remove) {
        await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(
          ONBOARDING_STORAGE_KEY,
          JSON.stringify(snapshot),
        );
      }
      applySnapshot(snapshot);
    });

    persistQueueRef.current = run.catch(() => {});

    try {
      await run;
    } catch (error) {
      devWarn("[OnboardingContext] Error saving onboarding state", error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    await persistSnapshot({
      completed: true,
      stepIndex: ONBOARDING_STEPS.length - 1,
      completedSteps: ONBOARDING_STEPS.map((step) => step.id),
    });
  };

  const nextStep = async () => {
    const current = onboardingStateRef.current;
    if (current.stepIndex < ONBOARDING_STEPS.length - 1) {
      const newStep = current.stepIndex + 1;
      await persistSnapshot({
        completed: false,
        stepIndex: newStep,
        completedSteps: ONBOARDING_STEPS.slice(0, newStep).map((step) => step.id),
      });
    }
  };

  const previousStep = async () => {
    const current = onboardingStateRef.current;
    if (current.stepIndex > 0) {
      const newStep = current.stepIndex - 1;
      await persistSnapshot({
        completed: false,
        stepIndex: newStep,
        completedSteps: ONBOARDING_STEPS.slice(0, newStep).map((step) => step.id),
      });
    }
  };

  const skipOnboarding = async () => {
    await completeOnboarding();
  };

  const resetOnboarding = async () => {
    await persistSnapshot(
      {
        completed: false,
        stepIndex: 0,
        completedSteps: [],
      },
      { remove: true },
    );
  };

  const markStepCompleted = (stepId: string) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step,
      ),
    );
  };

  return (
    <OnboardingContext
      value={{
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
      }}
    >
      {children}
    </OnboardingContext>
  );
}

export function useOnboarding() {
  const context = use(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
