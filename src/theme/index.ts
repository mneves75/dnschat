/**
 * DNSChat Design System - Theme Index
 *
 * Central export for all design tokens: colors, typography, spacing, and utilities.
 * Import from here to use the design system throughout the app.
 *
 * @example
 * ```tsx
 * import { COLORS, TYPOGRAPHY, SPACING } from '@/theme';
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: COLORS.light.background.primary,
 *     padding: SPACING.lg,
 *   },
 *   heading: {
 *     ...TYPOGRAPHY.textStyles.h1,
 *     color: COLORS.light.text.primary,
 *   },
 * });
 * ```
 *
 * @version 2.0.1
 * @author DNSChat Mobile Platform Team
 */

// ============================================================================
// CORE EXPORTS
// ============================================================================

export * from './colors';
export * from './typography';
export * from './spacing';

// ============================================================================
// DEFAULT EXPORTS
// ============================================================================

export { default as COLORS } from './colors';
export { default as TYPOGRAPHY } from './typography';
export { default as SPACING } from './spacing';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Color scheme type
 */
export type ColorScheme = 'light' | 'dark';

/**
 * Platform type
 */
export type Platform = 'ios' | 'android' | 'web';

/**
 * Text emphasis levels
 */
export type TextEmphasis = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

/**
 * Semantic color types
 */
export type SemanticType = 'success' | 'error' | 'warning' | 'info';
