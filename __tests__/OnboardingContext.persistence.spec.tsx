import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act } from "react-test-renderer";
import {
  OnboardingProvider,
  useOnboarding,
} from "../src/context/OnboardingContext";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../src/utils/screenshotMode", () => ({
  isScreenshotMode: jest.fn(() => false),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
let latestOnboarding: ReturnType<typeof useOnboarding> | null = null;

function Harness() {
  latestOnboarding = useOnboarding();
  return null;
}

describe("OnboardingProvider persistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latestOnboarding = null;
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  const renderProvider = async () => {
    await act(async () => {
      createWithSuppressedWarnings(
        <OnboardingProvider>
          <Harness />
        </OnboardingProvider>,
      );
      await Promise.resolve();
    });

    if (!latestOnboarding) {
      throw new Error("Onboarding context failed to initialize");
    }

    return latestOnboarding;
  };

  it("does not complete onboarding in memory when persistence fails", async () => {
    const onboarding = await renderProvider();
    mockAsyncStorage.setItem.mockRejectedValueOnce(new Error("disk full"));

    await expect(onboarding.completeOnboarding()).rejects.toThrow("disk full");
    expect(latestOnboarding?.hasCompletedOnboarding).toBe(false);
    expect(latestOnboarding?.currentStep).toBe(0);
  });

  it("does not advance to the next step in memory when progress persistence fails", async () => {
    const onboarding = await renderProvider();
    mockAsyncStorage.setItem.mockRejectedValueOnce(new Error("disk full"));

    await expect(onboarding.nextStep()).rejects.toThrow("disk full");
    expect(latestOnboarding?.currentStep).toBe(0);
    expect(latestOnboarding?.steps[0]?.completed).toBe(false);
  });

  it.each([
    [
      "an out-of-range step",
      { completed: false, stepIndex: 99, completedSteps: [] },
    ],
    [
      "a non-boolean completion flag",
      { completed: "yes", stepIndex: 0, completedSteps: [] },
    ],
    [
      "an unknown completed step",
      { completed: false, stepIndex: 0, completedSteps: ["missing"] },
    ],
    [
      "a completed state on the first step",
      { completed: true, stepIndex: 0, completedSteps: [] },
    ],
    [
      "a final incomplete step without its prefix",
      { completed: false, stepIndex: 4, completedSteps: [] },
    ],
  ])(
    "resets %s instead of hydrating a blank onboarding route",
    async (_label, payload) => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(payload));

      await renderProvider();

      expect(latestOnboarding?.currentStep).toBe(0);
      expect(latestOnboarding?.hasCompletedOnboarding).toBe(false);
      expect(latestOnboarding?.steps[0]?.id).toBe("welcome");
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        "@chat_dns_onboarding",
      );
    },
  );

  it("removes malformed JSON instead of retrying the same corrupt state on every launch", async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce('{"completed":');

    await renderProvider();

    expect(latestOnboarding?.currentStep).toBe(0);
    expect(latestOnboarding?.hasCompletedOnboarding).toBe(false);
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
      "@chat_dns_onboarding",
    );
  });
});
