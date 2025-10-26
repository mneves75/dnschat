import type * as ExpoHapticsType from "expo-haptics";

describe("HapticFeedback capability gating", () => {
  const loadModule = () =>
    require("../src/utils/haptics") as typeof import("../src/utils/haptics");

  let ExpoHaptics: typeof ExpoHapticsType;

  beforeEach(() => {
    jest.resetModules();
    ExpoHaptics = require("expo-haptics");
    const mock = ExpoHaptics as any;
    mock.__reset?.();
  });

  it("skips when the user disables haptics", async () => {
    const { configureHaptics, __hapticsTestHooks } = loadModule();
    configureHaptics({ userEnabled: false, reduceMotion: false });

    await expect(__hapticsTestHooks.shouldPlayCheck()).resolves.toBe(false);
  });

  it("skips when reduce motion is enabled", async () => {
    const { configureHaptics, __hapticsTestHooks } = loadModule();
    configureHaptics({ userEnabled: true, reduceMotion: true });

    await expect(__hapticsTestHooks.shouldPlayCheck()).resolves.toBe(false);
  });

  it("skips when hardware support is missing", async () => {
    (ExpoHaptics as any).isAvailableAsync.mockResolvedValue(false);
    const { configureHaptics, __hapticsTestHooks } = loadModule();
    configureHaptics({ userEnabled: true, reduceMotion: false });

    await expect(__hapticsTestHooks.shouldPlayCheck()).resolves.toBe(false);
  });

  it("invokes Expo haptics when enabled and supported", async () => {
    (ExpoHaptics as any).isAvailableAsync.mockResolvedValue(true);
    const { HapticFeedback, configureHaptics, __hapticsTestHooks } = loadModule();
    configureHaptics({ userEnabled: true, reduceMotion: false });

    await expect(__hapticsTestHooks.shouldPlayCheck()).resolves.toBe(true);

    await HapticFeedback.success();

    expect(
      (ExpoHaptics.notificationAsync as jest.Mock).mock.calls.length,
    ).toBe(1);
    expect(ExpoHaptics.notificationAsync).toHaveBeenCalledWith(
      ExpoHaptics.NotificationFeedbackType.Success,
    );
  });
});
