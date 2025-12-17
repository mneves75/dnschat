import { Platform, TextStyle } from 'react-native';

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
  fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
}

export const LiquidGlassType: Record<string, TypographyStyle> = {
  // Display (Hero text)
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.5,
    fontWeight: '400',
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: -0.5,
    fontWeight: '400',
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.25,
    fontWeight: '400',
  },

  // Headlines (Section headers)
  headlineLarge: {
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.5,
    fontWeight: '400',
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.25,
    fontWeight: '400',
  },
  headlineSmall: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.25,
    fontWeight: '600',
  },

  // Titles (Cards, list items)
  title1: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.25,
    fontWeight: '400',
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.25,
    fontWeight: '400',
  },
  title3: {
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.25,
    fontWeight: '400',
  },

  // Body (Primary content)
  headline: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.25,
    fontWeight: '600',
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.25,
    fontWeight: '400',
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.25,
    fontWeight: '400',
  },

  // Secondary (Supporting text)
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.25,
    fontWeight: '400',
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
    fontWeight: '400',
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.1,
    fontWeight: '400',
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: -0.1,
    fontWeight: '400',
  },
};

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

export const Material3Type: Record<string, TypographyStyle> = {
  // Display
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
    fontWeight: '400',
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
    fontWeight: '400',
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
    fontWeight: '400',
  },

  // Headline
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
    fontWeight: '400',
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
    fontWeight: '400',
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    fontWeight: '400',
  },

  // Title
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: '400',
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '500',
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500',
  },

  // Body
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: '400',
  },

  // Label
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500',
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500',
  },

  // iOS-compatible aliases for cross-platform code
  // Maps iOS semantic names to Material Design 3 equivalents
  headline: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '500',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontWeight: '400',
  },
  callout: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontWeight: '400',
  },
  subheadline: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500',
  },
  footnote: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: '400',
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  caption2: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
};

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
  scale: number = 1.0
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
 * - headline -> Material3Type.titleMedium (16sp medium)
 * - body -> Material3Type.bodyLarge (16sp regular)
 * - callout -> Material3Type.bodyMedium (14sp)
 */
export const getTypographyForPlatform = () => {
  return Platform.OS === 'ios' ? LiquidGlassType : Material3Type;
};

/**
 * Semantic Typography Aliases
 * Common semantic names that map to the appropriate platform style
 */
export const Typography = {
  // iOS: title1 (28pt), Android: headlineMedium (28sp)
  get screenTitle() {
    return Platform.OS === 'ios' ? LiquidGlassType.title1 : Material3Type.headlineMedium;
  },

  // iOS: headline (17pt semibold), Android: titleMedium (16sp medium)
  get sectionHeader() {
    return Platform.OS === 'ios' ? LiquidGlassType.headline : Material3Type.titleMedium;
  },

  // iOS: title3 (20pt), Android: titleLarge (22sp)
  get cardTitle() {
    return Platform.OS === 'ios' ? LiquidGlassType.title3 : Material3Type.titleLarge;
  },

  // iOS: body (17pt), Android: bodyLarge (16sp)
  get body() {
    return Platform.OS === 'ios' ? LiquidGlassType.body : Material3Type.bodyLarge;
  },

  // iOS: callout (16pt), Android: bodyMedium (14sp)
  get callout() {
    return Platform.OS === 'ios' ? LiquidGlassType.callout : Material3Type.bodyMedium;
  },

  // iOS: footnote (13pt), Android: bodySmall (12sp)
  get footnote() {
    return Platform.OS === 'ios' ? LiquidGlassType.footnote : Material3Type.bodySmall;
  },

  // iOS: caption1 (12pt), Android: labelMedium (12sp medium)
  get caption() {
    return Platform.OS === 'ios' ? LiquidGlassType.caption1 : Material3Type.labelMedium;
  },

  // iOS: headline (17pt semibold), Android: labelLarge (14sp medium)
  get button() {
    return Platform.OS === 'ios' ? LiquidGlassType.headline : Material3Type.labelLarge;
  },
};

export default Typography;
