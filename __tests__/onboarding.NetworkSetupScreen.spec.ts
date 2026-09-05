import React from "react";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { NetworkSetupScreen } from "../src/components/onboarding/screens/NetworkSetupScreen";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";
import { appAlert } from "../src/utils/appAlert";

const mockApply = jest.fn();
jest.mock("../src/context/SettingsContext", () => ({
  SettingsContext: require("react").createContext(undefined),
  useSettings: () => ({ applyRecommendedNetworkSettings: mockApply }),
}));
jest.mock("../src/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("../src/components/onboarding/OnboardingNavigation", () => ({
  OnboardingNavigation: () => null,
}));
jest.mock("../src/utils/appAlert", () => ({ appAlert: jest.fn() }));

describe("onboarding network recommendation", () => {
  let renderer: ReactTestRenderer;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockApply.mockResolvedValue(undefined);
    act(() => {
      renderer = createWithSuppressedWarnings(
        React.createElement(NetworkSetupScreen),
      );
    });
  });
  afterEach(() => {
    act(() => renderer.unmount());
    jest.useRealTimers();
  });
  const applyButton = () =>
    renderer.root.findAll(
      (node) =>
        node.props["testID"] === "onboarding-network-apply" &&
        typeof node.props["onPress"] === "function",
    )[0];

  it("offers Apply immediately without simulated work and saves the recommended chain", async () => {
    expect(applyButton()).toBeDefined();
    expect(applyButton()!.props["disabled"]).toBe(false);
    expect(mockApply).not.toHaveBeenCalled();
    expect(JSON.stringify(renderer.toJSON())).toContain(
      "screen.onboarding.networkSetup.disclaimer",
    );
    await act(async () => {
      await applyButton()!.props["onPress"]();
    });
    expect(mockApply).toHaveBeenCalledWith(true);
    expect(appAlert).toHaveBeenCalledWith(
      "screen.onboarding.networkSetup.alerts.successTitle",
      "screen.onboarding.networkSetup.alerts.successMessage",
      expect.any(Array),
    );
  });

  it("disables Apply only during persistence and allows retry after failure", async () => {
    let rejectSave: (error: Error) => void = () => {
      throw new Error("save did not start");
    };
    mockApply.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectSave = reject;
        }),
    );
    expect(applyButton()).toBeDefined();
    let pending: Promise<void>;
    await act(async () => {
      pending = applyButton()!.props["onPress"]();
    });
    expect(applyButton()!.props["disabled"]).toBe(true);
    await act(async () => {
      rejectSave(new Error("disk full"));
      await pending;
    });
    expect(applyButton()!.props["disabled"]).toBe(false);
    expect(appAlert).toHaveBeenCalledWith(
      "screen.onboarding.networkSetup.alerts.errorTitle",
      "screen.onboarding.networkSetup.alerts.errorMessage",
    );
    await act(async () => {
      await applyButton()!.props["onPress"]();
    });
    expect(mockApply).toHaveBeenCalledTimes(2);
  });
});
