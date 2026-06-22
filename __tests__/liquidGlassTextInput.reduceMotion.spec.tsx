import React from "react";
import { act } from "react-test-renderer";
import type { ReactTestRenderer } from "react-test-renderer";
import { TextInput } from "react-native";
import { LiquidGlassTextInput } from "../src/components/ui/LiquidGlassTextInput";
import { createWithSuppressedWarnings } from "./utils/reactTestRenderer";

// Spy on withTiming so we can assert whether the border animated or snapped.
const mockWithTiming = jest.fn((value: unknown, _config?: unknown) => value);

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  const AnimatedMock = {
    View,
    createAnimatedComponent: <P,>(Component: React.ComponentType<P>) => Component,
    useSharedValue: (value: unknown) => {
      const sv = {
        value,
        get: () => sv.value,
        set: (next: unknown) => {
          sv.value = next;
        },
      };
      return sv;
    },
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
    withTiming: (value: unknown, config?: unknown) => mockWithTiming(value, config),
    withSpring: (value: unknown) => value,
    Easing: { out: (fn: (value: number) => number) => fn, ease: () => null },
    runOnJS: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
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

jest.mock("../src/ui/theme/imessagePalette", () => ({
  useImessagePalette: () => ({
    border: "#cccccc",
    destructive: "#ff3b30",
    accentTint: "#0a84ff",
    textPrimary: "#111111",
    textSecondary: "#444444",
    textTertiary: "#777777",
    solid: "#ffffff",
    accentSurface: "#eef2ff",
    accentBorder: "#b0c4ff",
  }),
}));

jest.mock("../src/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockReduceMotion = jest.fn(() => false);
jest.mock("../src/context/AccessibilityContext", () => ({
  useMotionReduction: () => ({ shouldReduceMotion: mockReduceMotion() }),
}));

function focus(tree: ReactTestRenderer) {
  const input = tree.root.findByType(TextInput);
  act(() => {
    input.props["onFocus"]?.({});
  });
}

describe("LiquidGlassTextInput - reduce motion", () => {
  beforeEach(() => {
    mockWithTiming.mockClear();
    mockReduceMotion.mockReturnValue(false);
  });

  it("animates the focus border when motion is allowed", () => {
    let tree: ReactTestRenderer | null = null;
    act(() => {
      tree = createWithSuppressedWarnings(
        <LiquidGlassTextInput value="hi" onChangeText={() => {}} />,
      );
    });
    if (!tree) throw new Error("Renderer not created");

    mockWithTiming.mockClear();
    focus(tree);

    expect(mockWithTiming).toHaveBeenCalledWith("#0a84ff", expect.anything());
  });

  it("snaps the focus border instantly when Reduce Motion is enabled", () => {
    mockReduceMotion.mockReturnValue(true);

    let tree: ReactTestRenderer | null = null;
    act(() => {
      tree = createWithSuppressedWarnings(
        <LiquidGlassTextInput value="hi" onChangeText={() => {}} />,
      );
    });
    if (!tree) throw new Error("Renderer not created");

    mockWithTiming.mockClear();
    focus(tree);

    // Border color is set directly; withTiming must never run under Reduce Motion.
    expect(mockWithTiming).not.toHaveBeenCalled();
  });
});
