import type * as ExpoHapticsType from "expo-haptics";

describe("HapticFeedback capability gating", () => {
  const loadModule = () =>
    require("../src/utils/haptics") as typeof import("../src/utils/haptics");

  type ResettableExpoHaptics = typeof ExpoHapticsType & {
    __reset?: () => void;
    isAvailableAsync?: () => Promise<boolean>;
  };
  let ExpoHaptics: ResettableExpoHaptics;

  beforeEach(() => {
    jest.resetModules();
    ExpoHaptics = require("expo-haptics");
    ExpoHaptics.__reset?.();
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
    ExpoHaptics.isAvailableAsync = jest
      .fn<Promise<boolean>, []>()
      .mockResolvedValue(false);
    const { configureHaptics, __hapticsTestHooks } = loadModule();
    configureHaptics({ userEnabled: true, reduceMotion: false });

    await expect(__hapticsTestHooks.shouldPlayCheck()).resolves.toBe(false);
  });

  it("skips when the native availability probe is missing", async () => {
    delete ExpoHaptics.isAvailableAsync;
    const { configureHaptics, __hapticsTestHooks } = loadModule();
    configureHaptics({ userEnabled: true, reduceMotion: false });

    await expect(__hapticsTestHooks.shouldPlayCheck()).resolves.toBe(false);
  });

  it("invokes Expo haptics when enabled and supported", async () => {
    ExpoHaptics.isAvailableAsync = jest
      .fn<Promise<boolean>, []>()
      .mockResolvedValue(true);
    const notificationSpy = jest
      .spyOn(ExpoHaptics, "notificationAsync")
      .mockResolvedValue(undefined);
    const { HapticFeedback, configureHaptics, __hapticsTestHooks } = loadModule();
    configureHaptics({ userEnabled: true, reduceMotion: false });

    await expect(__hapticsTestHooks.shouldPlayCheck()).resolves.toBe(true);

    await HapticFeedback.success();

    expect(notificationSpy).toHaveBeenCalledTimes(1);
    expect(notificationSpy).toHaveBeenCalledWith(
      ExpoHaptics.NotificationFeedbackType.Success,
    );
  });

  it("retries availability after a transient preload failure", async () => {
    ExpoHaptics.isAvailableAsync = jest
      .fn<Promise<boolean>, []>()
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValueOnce(true);

    const { preloadHaptics, HapticFeedback, configureHaptics } = loadModule();
    configureHaptics({ userEnabled: true, reduceMotion: false });

    await expect(preloadHaptics()).resolves.toBe(false);
    await HapticFeedback.light();

    expect(ExpoHaptics.isAvailableAsync).toHaveBeenCalledTimes(2);
    expect(ExpoHaptics.impactAsync).toHaveBeenCalledWith(
      ExpoHaptics.ImpactFeedbackStyle.Light,
    );
  });
});
