/**
 * Shared module factories for accessibility behavior specs that render real
 * screens. Call them from inside `jest.mock` factories, e.g.
 * `jest.mock("../src/i18n", () => require("./utils/accessibilityHarness").englishI18nModule())`.
 */
import React from "react";
import TestRenderer from "react-test-renderer";
import type { ReactElement } from "react";

/** Real en-US copy, so assertions read what a screen reader would announce. */
export function englishI18nModule() {
  const actual =
    jest.requireActual<typeof import("../../src/i18n")>("../../src/i18n");
  const t = actual.createTranslator("en-US");
  return { ...actual, useTranslation: () => ({ locale: "en-US", t }) };
}

/**
 * Palette whose every token resolves to `token:<name>`, so a rendered color can
 * be traced back to the palette token that produced it.
 */
export function tokenPaletteModule() {
  const palette = new Proxy(
    {},
    {
      get: (_target, key) =>
        typeof key === "string" ? `token:${key}` : undefined,
    },
  );
  return { useImessagePalette: () => palette };
}

export function accessibilityContextModule() {
  return {
    useMotionReduction: () => ({
      shouldReduceMotion: false,
      animationDuration: undefined,
    }),
    useAccessibility: () => ({
      isReduceMotionEnabled: false,
      isReduceTransparencyEnabled: false,
      highContrastEnabled: false,
    }),
    useHighContrast: () => ({ isHighContrast: false }),
    useScreenReader: () => ({ isEnabled: false, announce: () => undefined }),
    useFontSize: () => ({ scale: 1 }),
  };
}

type Children = { children?: React.ReactNode };

/** Host-element stand-ins for GlassForm that keep item right content rendered. */
export function glassFormModule() {
  const host =
    (name: string) =>
    ({ children, ...props }: Children & Record<string, unknown>) =>
      React.createElement(name, props, children);
  const FormItem = ({
    children,
    rightContent,
    ...props
  }: Children & { rightContent?: React.ReactNode }) =>
    React.createElement("FormItem", props, children, rightContent);
  return {
    Form: {
      List: host("FormList"),
      Section: host("FormSection"),
      Item: FormItem,
      Link: FormItem,
    },
  };
}

/** Pass-through wrapper so glass chrome does not hide its children. */
export function liquidGlassWrapperModule() {
  return {
    LiquidGlassWrapper: ({ children }: Children) =>
      React.createElement(React.Fragment, null, children),
    useLiquidGlassCapabilities: () => ({ supportsLiquidGlass: false }),
  };
}

/**
 * react-test-renderer create() with host refs, filtering only the React 19
 * deprecation warning (same policy as createWithSuppressedWarnings).
 */
export function createWithNodeMock(
  element: ReactElement,
  createNodeMock: (element: ReactElement) => unknown,
): TestRenderer.ReactTestRenderer {
  const original = console.error;
  console.error = (...args: unknown[]) => {
    const first = args[0];
    if (
      typeof first === "string" &&
      first.includes("react-test-renderer is deprecated")
    ) {
      return;
    }
    original(...(args as Parameters<typeof console.error>));
  };
  try {
    return TestRenderer.create(element, { createNodeMock });
  } finally {
    console.error = original;
  }
}
