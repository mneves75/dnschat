/**
 * DNSChat Design System - Typography Tokens
 *
 * Type scale based on iOS Human Interface Guidelines and Material Design 3.
 * All text sizes support Dynamic Type on iOS and sp scaling on Android.
 *
 * @version 2.0.1
 * @author DNSChat Mobile Platform Team
 */

// ============================================================================
// FONT FAMILIES
// ============================================================================

export const FONT_FAMILY = {
  /**
   * System font stacks for each platform
   * iOS: SF Pro, Android: Roboto, Web: System UI
   */
  default: undefined, // Use system default
  mono: 'Menlo, Monaco, Courier New, monospace', // For code blocks
} as const;

// ============================================================================
// FONT WEIGHTS
// ============================================================================

export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// ============================================================================
// TYPE SCALE
// ============================================================================

export const FONT_SIZE = {
  /**
   * Display sizes (large hero text)
   */
  display: {
    large: 48,    // Hero headings
    medium: 40,   // Page titles
    small: 34,    // Section titles (iOS large title)
  },

  /**
   * Heading sizes
   */
  heading: {
    h1: 28,       // Main headings
    h2: 22,       // Section headers
    h3: 18,       // Subsection headers
  },

  /**
   * Body text sizes
   */
  body: {
    large: 17,    // iOS default body (accessibility baseline)
    regular: 16,  // Standard body text
    small: 15,    // Compact body text
  },

  /**
   * UI component text
   */
  ui: {
    label: 14,    // Form labels, buttons
    caption: 12,  // Captions, helper text
    overline: 11, // Timestamps, metadata (iOS footnote)
  },

  /**
   * Code text
   */
  code: {
    inline: 14,   // Inline code spans
    block: 14,    // Code blocks
  },
} as const;

// ============================================================================
// LINE HEIGHTS
// ============================================================================

export const LINE_HEIGHT = {
  /**
   * Line height multipliers for readability
   * Based on iOS text styles and Material Design recommendations
   */
  tight: 1.2,     // Headings, compact UI
  normal: 1.25,   // Body text (default)
  relaxed: 1.4,   // Long-form content
  loose: 1.6,     // Code blocks, accessibility

  /**
   * Fixed line heights for specific use cases
   */
  fixed: {
    display: 52,  // Display text
    h1: 34,       // H1 headings
    h2: 28,       // H2 headings
    h3: 24,       // H3 headings
    body: 20,     // Body text (16px * 1.25)
    bodyLarge: 22, // Large body (17px * 1.29)
    caption: 16,  // Caption text
    overline: 14, // Timestamp text
  },
} as const;

// ============================================================================
// LETTER SPACING
// ============================================================================

export const LETTER_SPACING = {
  /**
   * Letter spacing for different text styles
   * Values in pixels (converted to em internally)
   */
  tight: -0.5,    // Large display text
  normal: 0,      // Body text (default)
  wide: 0.5,      // Small caps, overlines
  wider: 1.0,     // Button text (Material Design)
} as const;

// ============================================================================
// TEXT STYLES (Pre-composed)
// ============================================================================

export const TEXT_STYLES = {
  /**
   * Display text styles
   */
  displayLarge: {
    fontSize: FONT_SIZE.display.large,
    lineHeight: LINE_HEIGHT.fixed.display,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: LETTER_SPACING.tight,
  },

  displayMedium: {
    fontSize: FONT_SIZE.display.medium,
    lineHeight: LINE_HEIGHT.fixed.display,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: LETTER_SPACING.tight,
  },

  displaySmall: {
    fontSize: FONT_SIZE.display.small,
    lineHeight: LINE_HEIGHT.fixed.h1,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: LETTER_SPACING.normal,
  },

  /**
   * Heading styles
   */
  h1: {
    fontSize: FONT_SIZE.heading.h1,
    lineHeight: LINE_HEIGHT.fixed.h1,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: LETTER_SPACING.normal,
  },

  h2: {
    fontSize: FONT_SIZE.heading.h2,
    lineHeight: LINE_HEIGHT.fixed.h2,
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: LETTER_SPACING.normal,
  },

  h3: {
    fontSize: FONT_SIZE.heading.h3,
    lineHeight: LINE_HEIGHT.fixed.h3,
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: LETTER_SPACING.normal,
  },

  /**
   * Body text styles
   */
  bodyLarge: {
    fontSize: FONT_SIZE.body.large,
    lineHeight: LINE_HEIGHT.fixed.bodyLarge,
    fontWeight: FONT_WEIGHT.regular,
    letterSpacing: LETTER_SPACING.normal,
  },

  body: {
    fontSize: FONT_SIZE.body.regular,
    lineHeight: LINE_HEIGHT.fixed.body,
    fontWeight: FONT_WEIGHT.regular,
    letterSpacing: LETTER_SPACING.normal,
  },

  bodySmall: {
    fontSize: FONT_SIZE.body.small,
    lineHeight: LINE_HEIGHT.normal,
    fontWeight: FONT_WEIGHT.regular,
    letterSpacing: LETTER_SPACING.normal,
  },

  /**
   * UI component styles
   */
  button: {
    fontSize: FONT_SIZE.ui.label,
    lineHeight: LINE_HEIGHT.normal,
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: LETTER_SPACING.wider,
  },

  label: {
    fontSize: FONT_SIZE.ui.label,
    lineHeight: LINE_HEIGHT.normal,
    fontWeight: FONT_WEIGHT.medium,
    letterSpacing: LETTER_SPACING.normal,
  },

  caption: {
    fontSize: FONT_SIZE.ui.caption,
    lineHeight: LINE_HEIGHT.fixed.caption,
    fontWeight: FONT_WEIGHT.regular,
    letterSpacing: LETTER_SPACING.normal,
  },

  overline: {
    fontSize: FONT_SIZE.ui.overline,
    lineHeight: LINE_HEIGHT.fixed.overline,
    fontWeight: FONT_WEIGHT.regular,
    letterSpacing: LETTER_SPACING.wide,
  },

  /**
   * Code styles
   */
  codeInline: {
    fontSize: FONT_SIZE.code.inline,
    lineHeight: LINE_HEIGHT.normal,
    fontFamily: FONT_FAMILY.mono,
    letterSpacing: LETTER_SPACING.normal,
  },

  codeBlock: {
    fontSize: FONT_SIZE.code.block,
    lineHeight: LINE_HEIGHT.loose,
    fontFamily: FONT_FAMILY.mono,
    letterSpacing: LETTER_SPACING.normal,
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get text style with optional overrides
 * @param style - Base text style from TEXT_STYLES
 * @param overrides - Optional style overrides
 * @returns Combined text style object
 */
export function getTextStyle(
  style: keyof typeof TEXT_STYLES,
  overrides?: Partial<{
    fontSize: number;
    lineHeight: number;
    fontWeight: string;
    letterSpacing: number;
  }>
) {
  return {
    ...TEXT_STYLES[style],
    ...overrides,
  };
}

/**
 * Calculate line height from font size and multiplier
 * @param fontSize - Font size in pixels
 * @param multiplier - Line height multiplier (default 1.25)
 * @returns Line height in pixels
 */
export function calculateLineHeight(
  fontSize: number,
  multiplier: number = LINE_HEIGHT.normal
): number {
  return Math.round(fontSize * multiplier);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const TYPOGRAPHY = {
  fontFamily: FONT_FAMILY,
  fontWeight: FONT_WEIGHT,
  fontSize: FONT_SIZE,
  lineHeight: LINE_HEIGHT,
  letterSpacing: LETTER_SPACING,
  textStyles: TEXT_STYLES,

  // Helper functions
  getTextStyle,
  calculateLineHeight,
} as const;

export default TYPOGRAPHY;
