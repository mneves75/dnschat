/**
 * Regression: every LiquidGlassWrapper instance used to query
 * AccessibilityInfo.isReduceTransparencyEnabled() and register its own
 * `reduceTransparencyChanged` listener. The settings screen mounts about seven
 * wrappers, so one accessibility setting cost seven native round trips and
 * seven listeners. One shared subscription must serve all of them.
 */
import React from "react";
import { Text } from "react-native";
import TestRenderer, { act } from "react-test-renderer";

jest.mock("expo-glass-effect", () => {
  const { View } = require("react-native");
  return {
    isGlassEffectAPIAvailable: jest.fn(() => true),
    isLiquidGlassAvailable: jest.fn(() => true),
    GlassView: ({ children, ...rest }: { children?: React.ReactNode }) => (
      <View {...rest} testID="glass-view">
        {children}
      </View>
    ),
    GlassContainer: ({ children }: { children?: React.ReactNode }) => (
      <View testID="glass-container">{children}</View>
    ),
  };
});

import { AccessibilityInfo } from "react-native";
import { LiquidGlassWrapper } from "../src/components/LiquidGlassWrapper";

const isReduceTransparencyEnabled = jest
  .spyOn(AccessibilityInfo, "isReduceTransparencyEnabled")
  .mockResolvedValue(false);

const remove = jest.fn();
const addEventListener = jest
  .spyOn(AccessibilityInfo, "addEventListener")
  .mockReturnValue({ remove } as never);

describe("LiquidGlassWrapper reduce-transparency subscription sharing", () => {
  it("registers one native listener and one query for many wrappers", async () => {
    let tree!: TestRenderer.ReactTestRenderer;

    await act(async () => {
      tree = TestRenderer.create(
        <>
          {[0, 1, 2, 3, 4].map((index) => (
            <LiquidGlassWrapper key={index}>
              <Text>{`glass-${index}`}</Text>
            </LiquidGlassWrapper>
          ))}
        </>,
      );
    });

    expect(
      addEventListener.mock.calls.filter(
        ([event]) => String(event) === "reduceTransparencyChanged",
      ),
    ).toHaveLength(1);
    expect(isReduceTransparencyEnabled).toHaveBeenCalledTimes(1);

    act(() => tree.unmount());
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
