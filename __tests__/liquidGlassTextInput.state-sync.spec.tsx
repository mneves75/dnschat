import React from "react";
import renderer, { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { StyleSheet } from "react-native";
import { LiquidGlassTextInput } from "../src/components/ui/LiquidGlassTextInput";

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  const AnimatedMock = {
    View,
    createAnimatedComponent: (Component: any) => Component,
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: (fn: () => Record<string, unknown>) =>
      new Proxy(
        {},
        {
          get: (_target, prop) => fn()[prop as keyof ReturnType<typeof fn>],
          ownKeys: () => Reflect.ownKeys(fn()),
          getOwnPropertyDescriptor: (_target, prop) => ({
            configurable: true,
            enumerable: true,
            value: fn()[prop as keyof ReturnType<typeof fn>],
          }),
        }
      ),
    withTiming: (value: unknown) => value,
    withSpring: (value: unknown) => value,
    Easing: { out: (fn: any) => fn, ease: () => null },
    runOnJS: (fn: any) => fn,
  };
  return { __esModule: true, default: AnimatedMock, ...AnimatedMock };
});

jest.mock("../src/ui/hooks/useTypography", () => ({
  useTypography: () => ({
    body: { fontSize: 16, lineHeight: 20, letterSpacing: 0 },
    callout: { fontSize: 15, lineHeight: 19, letterSpacing: 0 },
    caption1: { fontSize: 12, lineHeight: 16, letterSpacing: 0 },
    headline: { fontSize: 17, lineHeight: 22, letterSpacing: 0 },
  }),
}));

const palettes = {
  light: {
    border: "#cccccc",
    destructive: "#ff3b30",
    accentTint: "#0a84ff",
    textPrimary: "#111111",
    textSecondary: "#444444",
    textTertiary: "#777777",
    solid: "#ffffff",
    accentSurface: "#eef2ff",
    accentBorder: "#b0c4ff",
  },
  dark: {
    border: "#505050",
    destructive: "#ff453a",
    accentTint: "#64d2ff",
    textPrimary: "#f2f2f2",
    textSecondary: "#c7c7c7",
    textTertiary: "#8a8a8a",
    solid: "#000000",
    accentSurface: "#123456",
    accentBorder: "#345678",
  },
};

const paletteMock = jest.fn(() => palettes.light);

jest.mock("../src/ui/theme/imessagePalette", () => ({
  useImessagePalette: () => paletteMock(),
}));

function borderColor(tree: ReactTestRenderer) {
  const container = tree.root.findByProps({
    testID: "liquid-glass-input-container",
  });
  const flat = StyleSheet.flatten(container.props.style);
  return flat?.borderColor;
}

describe("LiquidGlassTextInput - border synchronization", () => {
  it("renders destructive border when errorText is provided on mount", () => {
    let tree: ReactTestRenderer | null = null;
    act(() => {
      tree = renderer.create(
        <LiquidGlassTextInput value="hi" onChangeText={() => {}} errorText="Required" />
      );
    });

    if (!tree) throw new Error("Renderer not created");
    expect(borderColor(tree)).toBe(palettes.light.destructive);
  });

  it("switches border to destructive when errorText appears while blurred", () => {
    let tree: ReactTestRenderer | null = null;
    act(() => {
      tree = renderer.create(
        <LiquidGlassTextInput value="hi" onChangeText={() => {}} />
      );
    });

    if (!tree) throw new Error("Renderer not created");
    expect(borderColor(tree)).toBe(palettes.light.border);

    act(() => {
      tree!.update(
        <LiquidGlassTextInput value="hi" onChangeText={() => {}} errorText="Required" />
      );
    });

    expect(borderColor(tree)).toBe(palettes.light.destructive);
  });

  it("updates border when palette changes without focus", () => {
    let tree: ReactTestRenderer | null = null;
    act(() => {
      tree = renderer.create(
        <LiquidGlassTextInput value="hi" onChangeText={() => {}} />
      );
    });

    if (!tree) throw new Error("Renderer not created");
    expect(borderColor(tree)).toBe(palettes.light.border);

    paletteMock.mockReturnValue(palettes.dark);

    act(() => {
      tree!.update(
        <LiquidGlassTextInput value="hi" onChangeText={() => {}} />
      );
    });

    expect(borderColor(tree)).toBe(palettes.dark.border);
  });
});
