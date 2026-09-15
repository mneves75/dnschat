import React from "react";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

type TimingConfig = {
  toValue: number;
  duration: number;
  useNativeDriver: boolean;
};

const mockAnimation = {
  setValueCalls: [] as number[],
  timingCalls: [] as TimingConfig[],
  startCount: 0,
};

jest.mock("react-native", () => {
  const actual = jest.requireActual("./mocks/react-native");
  class AnimatedValue {
    constructor(public value: number) {}
    setValue(next: number) {
      mockAnimation.setValueCalls.push(next);
    }
    interpolate() {
      return 0;
    }
  }
  return {
    ...actual,
    Animated: {
      ...actual.Animated,
      Value: AnimatedValue,
      View: actual.View,
      timing: (_value: unknown, config: TimingConfig) => {
        mockAnimation.timingCalls.push(config);
        return {
          start: () => {
            mockAnimation.startCount += 1;
          },
          stop: () => undefined,
        };
      },
    },
  };
});

let mockReduceMotion = false;
let mockOnboarding = { currentStep: 0, steps: [{}, {}, {}, {}] };

jest.mock("../src/context/AccessibilityContext", () => ({
  useMotionReduction: () => ({ shouldReduceMotion: mockReduceMotion }),
}));
jest.mock("../src/context/OnboardingContext", () => ({
  useOnboarding: () => mockOnboarding,
}));
jest.mock("../src/i18n", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
  }),
}));
jest.mock("../src/ui/theme/imessagePalette", () => ({
  useImessagePalette: () => ({
    textSecondary: "#444444",
    separator: "#c6c6c8",
    userBubble: "#007aff",
  }),
}));
jest.mock("../src/ui/hooks/useTypography", () => ({
  useTypography: () => ({ footnote: { fontSize: 13 } }),
}));

const { OnboardingProgress } =
  require("../src/components/onboarding/OnboardingProgress") as typeof import("../src/components/onboarding/OnboardingProgress");

describe("OnboardingProgress reduce motion behavior", () => {
  let tree: ReactTestRenderer | undefined;

  const render = () => {
    act(() => {
      tree = createWithSuppressedWarnings(
        React.createElement(OnboardingProgress),
      );
    });
    return tree!;
  };

  const resetAnimation = () => {
    mockAnimation.setValueCalls.length = 0;
    mockAnimation.timingCalls.length = 0;
    mockAnimation.startCount = 0;
  };

  beforeEach(() => {
    mockReduceMotion = false;
    mockOnboarding = { currentStep: 0, steps: [{}, {}, {}, {}] };
    resetAnimation();
  });

  afterEach(() => {
    act(() => tree?.unmount());
    tree = undefined;
  });

  it("snaps the bar to the new progress without a timing animation when Reduce Motion is on", () => {
    mockReduceMotion = true;
    const rendered = render();

    expect(mockAnimation.setValueCalls).toEqual([0.25]);
    expect(mockAnimation.timingCalls).toHaveLength(0);
    expect(mockAnimation.startCount).toBe(0);

    resetAnimation();
    mockOnboarding = { ...mockOnboarding, currentStep: 1 };
    act(() => rendered.update(React.createElement(OnboardingProgress)));

    expect(mockAnimation.setValueCalls).toEqual([0.5]);
    expect(mockAnimation.timingCalls).toHaveLength(0);
  });

  it("animates progress changes over 300ms when Reduce Motion is off", () => {
    const rendered = render();

    expect(mockAnimation.setValueCalls).toHaveLength(0);
    expect(mockAnimation.timingCalls).toEqual([
      { toValue: 0.25, duration: 300, useNativeDriver: false },
    ]);
    expect(mockAnimation.startCount).toBe(1);

    resetAnimation();
    mockOnboarding = { ...mockOnboarding, currentStep: 2 };
    act(() => rendered.update(React.createElement(OnboardingProgress)));

    expect(mockAnimation.timingCalls).toEqual([
      { toValue: 0.75, duration: 300, useNativeDriver: false },
    ]);
    expect(mockAnimation.startCount).toBe(1);
  });

  it("announces the current step out of the total", () => {
    mockOnboarding = { ...mockOnboarding, currentStep: 2 };
    const rendered = render();

    expect(JSON.stringify(rendered.toJSON())).toContain(
      'screen.onboarding.navigation.stepCounter:{\\"current\\":3,\\"total\\":4}',
    );
  });
});
