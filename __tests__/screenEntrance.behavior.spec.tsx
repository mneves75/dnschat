import React from "react";
import { act } from "react-test-renderer";
import * as Reanimated from "react-native-reanimated";
import { useScreenEntrance } from "../src/ui/hooks/useScreenEntrance";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

let mockReduceMotion = false;
jest.mock("../src/context/AccessibilityContext", () => ({
  useMotionReduction: () => ({ shouldReduceMotion: mockReduceMotion }),
}));

describe("screen entrance", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockReduceMotion = false;
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("finishes the entrance without rerendering screen content", () => {
    const renderScreen = jest.fn();
    const timing = jest
      .spyOn(Reanimated, "withTiming")
      .mockImplementation((target, _config, onComplete) => {
        onComplete?.(true);
        return target;
      });
    function Screen() {
      useScreenEntrance();
      renderScreen();
      return null;
    }
    let renderer: ReturnType<typeof createWithSuppressedWarnings>;
    act(() => {
      renderer = createWithSuppressedWarnings(<Screen />);
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(timing).toHaveBeenCalled();
    expect(renderScreen).toHaveBeenCalledTimes(1);
    act(() => renderer!.unmount());
  });

  it("starts visible with reduced motion and cancels an unmounted entrance", () => {
    mockReduceMotion = true;
    const timing = jest.spyOn(Reanimated, "withTiming");
    let style: ReturnType<typeof useScreenEntrance>["animatedStyle"];
    function Screen() {
      style = useScreenEntrance().animatedStyle;
      return null;
    }
    let renderer: ReturnType<typeof createWithSuppressedWarnings>;
    act(() => {
      renderer = createWithSuppressedWarnings(<Screen />);
    });
    expect(style!).toMatchObject({
      opacity: 1,
      transform: [{ translateY: 0 }],
    });
    act(() => renderer!.unmount());
    act(() => jest.runOnlyPendingTimers());
    expect(timing).not.toHaveBeenCalled();
  });
});
