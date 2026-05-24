import React from "react";
import { Platform } from "react-native";
import TestRenderer, { act } from "react-test-renderer";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

const globalWithAct = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
globalWithAct.IS_REACT_ACT_ENVIRONMENT = true;

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
    Platform.OS = "ios";
  });

  it("does nothing while settings are loading", async () => {
    mockUseSettings.mockReturnValue({ enableHaptics: true, loading: true });
    mockUseAccessibility.mockReturnValue({ config: { reduceMotion: false } });

    await act(async () => {
      createWithSuppressedWarnings(<HapticsConfigurator />);
    });

    expect(configureHaptics).not.toHaveBeenCalled();
    expect(preloadHaptics).not.toHaveBeenCalled();
  });

  it("does nothing on non-iOS platforms", async () => {
    Platform.OS = "android";
    mockUseSettings.mockReturnValue({ enableHaptics: true, loading: false });
    mockUseAccessibility.mockReturnValue({ config: { reduceMotion: false } });

    await act(async () => {
      createWithSuppressedWarnings(<HapticsConfigurator />);
    });

    expect(configureHaptics).not.toHaveBeenCalled();
    expect(preloadHaptics).not.toHaveBeenCalled();
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

  it("propagates reduce-motion changes into the haptics configuration", async () => {
    mockUseSettings.mockReturnValue({ enableHaptics: true, loading: false });
    mockUseAccessibility
      .mockReturnValueOnce({ config: { reduceMotion: false } })
      .mockReturnValue({ config: { reduceMotion: true } });

    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = createWithSuppressedWarnings(<HapticsConfigurator />);
    });

    await act(async () => {
      renderer!.update(<HapticsConfigurator />);
    });

    expect(configureHaptics).toHaveBeenNthCalledWith(1, {
      userEnabled: true,
      reduceMotion: false,
    });
    expect(configureHaptics).toHaveBeenNthCalledWith(2, {
      userEnabled: true,
      reduceMotion: true,
    });
  });
});
