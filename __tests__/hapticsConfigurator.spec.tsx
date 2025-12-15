import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native");
  return {
    ...actual,
    Platform: { ...actual.Platform, OS: "ios" },
  };
});

const mockUseSettings = jest.fn();
const mockUseAccessibility = jest.fn();

jest.mock("../src/context/SettingsContext", () => ({
  useSettings: () => mockUseSettings(),
}));

jest.mock("../src/context/AccessibilityContext", () => ({
  useAccessibility: () => mockUseAccessibility(),
}));

const configureHaptics = jest.fn();
const preloadHaptics = jest.fn().mockResolvedValue(undefined);

jest.mock("../src/utils/haptics", () => ({
  configureHaptics,
  preloadHaptics,
}));

const { HapticsConfigurator } = require("../src/components/HapticsConfigurator");

describe("HapticsConfigurator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSettings.mockReset();
    mockUseAccessibility.mockReset();
  });

  it("configures and preloads when settings are ready", async () => {
    mockUseSettings.mockReturnValue({ enableHaptics: true, loading: false });
    mockUseAccessibility.mockReturnValue({ config: { reduceMotion: false } });

    await act(async () => {
      createWithSuppressedWarnings(<HapticsConfigurator />);
    });

    expect(configureHaptics).toHaveBeenCalledWith({
      userEnabled: true,
      reduceMotion: false,
    });
    expect(preloadHaptics).toHaveBeenCalledTimes(1);
  });

  it("only preloads once while reconfiguring on subsequent preference changes", async () => {
    mockUseSettings
      .mockReturnValueOnce({ enableHaptics: true, loading: false })
      .mockReturnValue({ enableHaptics: false, loading: false });
    mockUseAccessibility.mockReturnValue({ config: { reduceMotion: false } });

    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = createWithSuppressedWarnings(<HapticsConfigurator />);
    });

    await act(async () => {
      renderer!.update(<HapticsConfigurator />);
    });

    expect(configureHaptics).toHaveBeenCalledTimes(2);
    expect(preloadHaptics).toHaveBeenCalledTimes(1);
  });
});
