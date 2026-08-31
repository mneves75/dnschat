/**
 * Regression: resolving Reduce Transparency asynchronously used to swap the
 * root element between View and GlassView, remounting every child. Keep one
 * GlassView on supported systems and toggle its native style between `none`
 * and `regular`; the conservative first render remains accessibility-safe.
 */
import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
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

jest
  .spyOn(AccessibilityInfo, "addEventListener")
  .mockReturnValue({ remove: jest.fn() } as never);

const getGlassView = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.find(
    (node) => typeof node.type === "string" && node.props?.["testID"] === "glass-view",
  );

describe("LiquidGlassWrapper reduce-transparency resolution", () => {
  it("keeps the content mounted while the accessibility value resolves", async () => {
    let tree!: TestRenderer.ReactTestRenderer;
    const onMount = jest.fn();

    const Content = () => {
      useEffect(() => {
        onMount();
      }, []);
      return <Text>content</Text>;
    };

    act(() => {
      tree = TestRenderer.create(
        <LiquidGlassWrapper>
          <Content />
        </LiquidGlassWrapper>,
      );
    });

    expect(getGlassView(tree).props["glassEffectStyle"]).toBe("none");

    await act(async () => {});
    expect(getGlassView(tree).props["glassEffectStyle"]).toBe("regular");
    expect(onMount).toHaveBeenCalledTimes(1);

    act(() => tree.unmount());
  });

  it("keeps an opaque no-glass surface when Reduce Transparency is enabled", async () => {
    isReduceTransparencyEnabled.mockResolvedValueOnce(true);

    let tree!: TestRenderer.ReactTestRenderer;

    await act(async () => {
      tree = TestRenderer.create(
        <LiquidGlassWrapper>
          <Text>content</Text>
        </LiquidGlassWrapper>,
      );
    });

    const glassView = getGlassView(tree);
    const opaqueContainers = tree.root.findAll(
      (node) =>
        StyleSheet.flatten(node.props["style"])?.backgroundColor ===
        "rgb(255, 255, 255)",
      { deep: true },
    );

    expect(glassView.props["glassEffectStyle"]).toBe("none");
    expect(opaqueContainers.length).toBeGreaterThan(0);

    act(() => tree.unmount());
  });
});
