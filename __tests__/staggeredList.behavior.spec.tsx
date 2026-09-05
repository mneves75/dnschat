import React from "react";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import * as Reanimated from "react-native-reanimated";
import {
  AnimatedListItem,
  useStaggeredListValues,
} from "../src/ui/hooks/useStaggeredList";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

let mockReduceMotion = false;
jest.mock("../src/context/AccessibilityContext", () => ({
  useMotionReduction: () => ({ shouldReduceMotion: mockReduceMotion }),
}));

describe("staggered list behavior", () => {
  let renderer: ReactTestRenderer;
  let values: ReturnType<typeof useStaggeredListValues>;
  function Harness({ count }: { count: number }) {
    values = useStaggeredListValues(count);
    return null;
  }
  beforeEach(() => {
    mockReduceMotion = false;
  });
  afterEach(() => {
    act(() => renderer.unmount());
    jest.restoreAllMocks();
  });

  it("keeps the default stagger across batches and reuses values through growth and shrink", () => {
    const delay = jest.spyOn(Reanimated, "withDelay");
    act(() => {
      renderer = createWithSuppressedWarnings(<Harness count={9} />);
    });
    expect(delay.mock.calls.map(([ms]) => ms)).toEqual(
      Array.from({ length: 9 }, (_, index) => [index * 50, index * 50]).flat(),
    );
    expect(values.opacities.map((value) => value.get())).toEqual(
      Array(9).fill(1),
    );
    expect(values.translates.map((value) => value.get())).toEqual(
      Array(9).fill(0),
    );
    const firstOpacity = values.opacities[0];
    act(() => {
      renderer.update(<Harness count={55} />);
    });
    expect(values.opacities).toHaveLength(50);
    expect(values.translates).toHaveLength(50);
    expect(values.opacities[0]).toBe(firstOpacity);
    act(() => {
      renderer.update(<Harness count={2} />);
    });
    expect(values.opacities).toHaveLength(2);
    expect(values.opacities[0]).toBe(firstOpacity);
  });

  it("shows reduced-motion rows immediately and leaves rows beyond the animation cap visible", () => {
    mockReduceMotion = true;
    const timing = jest.spyOn(Reanimated, "withTiming");
    act(() => {
      renderer = createWithSuppressedWarnings(<Harness count={2} />);
    });
    expect(values.opacities.map((value) => value.get())).toEqual([1, 1]);
    expect(values.translates.map((value) => value.get())).toEqual([0, 0]);
    expect(timing).not.toHaveBeenCalled();
    act(() => {
      renderer.update(
        <AnimatedListItem>
          <Reanimated.default.View />
        </AnimatedListItem>,
      );
    });
    const row = renderer.root
      .findByType(AnimatedListItem)
      .findAll((node) => Array.isArray(node.props["style"]))[0];
    expect(row?.props["style"]).toContainEqual({
      opacity: 1,
      transform: [{ translateX: 0 }],
    });
  });
});
