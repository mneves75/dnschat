import { Platform } from "react-native";
import type { TextStyle } from "react-native";

/**
 * iOS 26 Liquid Glass Typography System
 * Based on SF Pro Display/Text with Dynamic Type support
 *
 * Typography Scale:
 * - Display: Large hero text (57-36pt)
 * - Headline: Section headers (34-22pt)
 * - Title: Cards and list items (28-20pt)
 * - Body: Primary content (17-16pt)
 * - Secondary: Supporting text (15-11pt)
 *
 * Letter spacing:
 * - Headings: -0.5px to -0.25px (tighter for larger text)
 * - Body: -0.25px to -0.1px (subtle tightening)
 */

export interface TypographyStyle extends TextStyle {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight:
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
}

export type TypographyKey =
  | "body"
  | "callout"
  | "caption1"
  | "caption2"
  | "displayMedium"
  | "displaySmall"
  | "footnote"
  | "headline"
  | "subheadline"
  | "title1"
  | "title2"
  | "title3";

export type TypographyScale = Record<TypographyKey, TypographyStyle>;

export const LiquidGlassType = {
  // Display (Hero text)
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: -0.5,
    fontWeight: "400",
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.25,
    fontWeight: "400",
  },

  // Titles (Cards, list items)
  title1: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.25,
    fontWeight: "400",
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.25,
    fontWeight: "400",
  },
  title3: {
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.25,
    fontWeight: "400",
  },

  // Body (Primary content)
  headline: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.25,
    fontWeight: "600",
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.25,
    fontWeight: "400",
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.25,
    fontWeight: "400",
  },

  // Secondary (Supporting text)
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.25,
    fontWeight: "400",
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
    fontWeight: "400",
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.1,
    fontWeight: "400",
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: -0.1,
    fontWeight: "400",
  },
} satisfies TypographyScale;

/**
 * Material Design 3 Typography System
 * Based on Roboto/Roboto Flex
 *
 * Typography Scale:
 * - Display: Large hero text (57-36sp)
 * - Headline: Section headers (32-24sp)
 * - Title: Cards and list items (22-14sp)
 * - Body: Primary content (16-12sp)
 * - Label: Labels and buttons (14-11sp)
 *
 * Letter spacing:
 * - Display/Headline: 0 to -0.25sp
 * - Body: 0.25sp to 0.5sp (looser for readability)
 * - Label: 0.1sp to 0.5sp
 */

export const Material3Type = {
  // Display
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
    fontWeight: "400",
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
    fontWeight: "400",
  },

  // iOS-compatible aliases for cross-platform code
  // Maps iOS semantic names to Material Design 3 equivalents
  headline: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: "500",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontWeight: "400",
  },
  callout: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontWeight: "400",
  },
  subheadline: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: "500",
  },
  footnote: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: "400",
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  caption2: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  title1: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
    fontWeight: "400",
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: "400",
  },
  title3: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: "500",
  },
} satisfies TypographyScale;

/**
 * Dynamic Type Support
 * Apply user's preferred text size scaling
 *
 * @param style - Base typography style
 * @param scale - Scale factor (1.0 = 100%, 2.0 = 200%)
 * @returns Scaled typography style
 */
export const applyDynamicType = (
  style: TypographyStyle,
  scale: number = 1.0,
): TypographyStyle => ({
  ...style,
  fontSize: Math.round(style.fontSize * scale),
  lineHeight: Math.round(style.lineHeight * scale),
});

/**
 * Typography Mapping
 * Maps semantic names to platform-specific styles
 *
 * iOS 26 Liquid Glass:
 * - headline -> LiquidGlassType.headline (17pt semibold)
 * - body -> LiquidGlassType.body (17pt regular)
 * - callout -> LiquidGlassType.callout (16pt)
 *
 * Material Design 3:
 * - headline -> Material3Type.headline (16sp medium)
 * - body -> Material3Type.body (16sp regular)
 * - callout -> Material3Type.callout (14sp)
 */
export const getTypographyForPlatform = (): TypographyScale => {
  return Platform.OS === "ios" ? LiquidGlassType : Material3Type;
};
