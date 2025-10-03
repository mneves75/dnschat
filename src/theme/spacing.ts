/**
 * DNSChat Design System - Spacing Tokens
 *
 * 8px base grid system following iOS and Material Design principles.
 * All spacing values are multiples of 8 for visual harmony and consistency.
 *
 * @version 2.0.1
 * @author DNSChat Mobile Platform Team
 */

// ============================================================================
// BASE UNIT
// ============================================================================

/**
 * Base spacing unit (8px)
 * All spacing derives from this value
 */
export const BASE_UNIT = 8;

// ============================================================================
// SPACING SCALE
// ============================================================================

export const SPACING = {
  /**
   * Core spacing scale (8px increments)
   */
  none: 0,       // 0px - No spacing
  xxs: 2,        // 2px - Fine details, borders
  xs: 4,         // 4px - Inline spacing, tight groups
  sm: 8,         // 8px - Compact spacing (1 unit)
  md: 12,        // 12px - Default spacing (1.5 units)
  lg: 16,        // 16px - Comfortable spacing (2 units)
  xl: 20,        // 20px - Section spacing (2.5 units)
  xxl: 24,       // 24px - Major sections (3 units)
  xxxl: 32,      // 32px - Screen padding (4 units)
  huge: 40,      // 40px - Large gaps (5 units)
  massive: 48,   // 48px - Hero sections (6 units)

  /**
   * Component-specific spacing
   */
  messageBubble: {
    horizontal: 16,   // Horizontal padding inside bubbles
    vertical: 10,     // Vertical padding inside bubbles
    gap: 2,           // Gap between consecutive messages
    groupGap: 8,      // Gap between message groups
  },

  chatInput: {
    horizontal: 16,   // Horizontal padding
    vertical: 12,     // Vertical padding
    gap: 8,           // Gap between input and button
  },

  card: {
    padding: 16,      // Default card padding
    paddingLarge: 20, // Large card padding
    gap: 12,          // Gap between card elements
  },

  list: {
    itemGap: 8,       // Gap between list items
    sectionGap: 16,   // Gap between list sections
    horizontal: 16,   // List item horizontal padding
  },

  glass: {
    padding: 20,      // Glass container padding
    gap: 16,          // Gap between glass elements
  },

  screen: {
    horizontal: 16,   // Screen horizontal padding (iOS default)
    vertical: 16,     // Screen vertical padding
    top: 8,           // Top safe area adjustment
    bottom: 16,       // Bottom safe area adjustment
  },

  tab: {
    height: 49,       // iOS tab bar height
    iconSize: 24,     // Tab icon size
    gap: 4,           // Gap between icon and label
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const RADIUS = {
  /**
   * Border radius scale
   */
  none: 0,          // 0px - No rounding
  xs: 4,            // 4px - Subtle rounding
  sm: 8,            // 8px - Buttons, inputs, tags
  md: 12,           // 12px - Cards
  lg: 16,           // 16px - Large cards
  xl: 20,           // 20px - Glass containers, message bubbles
  xxl: 24,          // 24px - Hero cards
  round: 999,       // Full rounding (pill buttons, capsules)
  circle: '50%',    // Circle (avatars, icon buttons)

  /**
   * Component-specific radius
   */
  messageBubble: {
    default: 20,      // Standard bubble rounding
    tail: 6,          // iMessage-style tail radius
  },

  glass: {
    regular: 20,      // Glass container rounding
    prominent: 24,    // Prominent glass elements
  },

  button: {
    small: 8,         // Small buttons
    medium: 12,       // Medium buttons
    large: 16,        // Large buttons
    pill: 999,        // Pill-shaped buttons
  },

  input: {
    default: 12,      // Text inputs
    capsule: 999,     // Search fields
  },

  card: {
    default: 12,      // Standard cards
    large: 16,        // Large feature cards
  },
} as const;

// ============================================================================
// SIZES (Common component dimensions)
// ============================================================================

export const SIZES = {
  /**
   * Touch target sizes (iOS HIG: 44x44pt minimum, Material: 48x48dp minimum)
   */
  touchTarget: {
    ios: 44,          // iOS minimum touch target
    android: 48,      // Material Design minimum touch target
    comfortable: 56,  // Comfortable touch target
  },

  /**
   * Icon sizes
   */
  icon: {
    xs: 16,           // Tiny icons
    sm: 20,           // Small icons
    md: 24,           // Default icon size
    lg: 32,           // Large icons
    xl: 40,           // Extra large icons
    xxl: 48,          // Hero icons
  },

  /**
   * Avatar sizes
   */
  avatar: {
    xs: 24,           // Tiny avatar
    sm: 32,           // Small avatar
    md: 40,           // Medium avatar
    lg: 56,           // Large avatar
    xl: 80,           // Profile avatar
  },

  /**
   * Button heights
   */
  button: {
    small: 32,        // Small button (< 44pt, needs larger touch area)
    medium: 44,       // Medium button (iOS minimum)
    large: 56,        // Large button (prominent actions)
  },

  /**
   * Input heights
   */
  input: {
    default: 44,      // iOS standard input height
    large: 52,        // Large input height
    multiline: 88,    // Multiline input minimum height
  },

  /**
   * Navigation bar heights
   */
  navigation: {
    header: 44,       // iOS navigation bar height
    tabBar: 49,       // iOS tab bar height (safe area excluded)
    searchBar: 36,    // iOS search bar height
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate spacing from base unit
 * @param multiplier - Multiplier of base unit (8px)
 * @returns Spacing value in pixels
 */
export function spacing(multiplier: number): number {
  return BASE_UNIT * multiplier;
}

/**
 * Get responsive spacing based on screen size
 * @param base - Base spacing value
 * @param isLargeScreen - Whether the screen is large (tablets)
 * @param scaleFactor - Scale factor for large screens (default 1.5)
 * @returns Scaled spacing value
 */
export function responsiveSpacing(
  base: number,
  isLargeScreen: boolean,
  scaleFactor: number = 1.5
): number {
  return isLargeScreen ? base * scaleFactor : base;
}

/**
 * Get touch target size for platform
 * @param platform - Platform ('ios' | 'android' | 'web')
 * @returns Minimum touch target size
 */
export function getTouchTargetSize(platform: 'ios' | 'android' | 'web'): number {
  switch (platform) {
    case 'ios':
      return SIZES.touchTarget.ios;
    case 'android':
      return SIZES.touchTarget.android;
    case 'web':
      return SIZES.touchTarget.comfortable;
    default:
      return SIZES.touchTarget.ios;
  }
}

/**
 * Ensure a component meets minimum touch target size
 * @param currentSize - Current size
 * @param platform - Platform
 * @returns Size that meets platform minimum
 */
export function ensureTouchTarget(
  currentSize: number,
  platform: 'ios' | 'android' | 'web' = 'ios'
): number {
  const minSize = getTouchTargetSize(platform);
  return Math.max(currentSize, minSize);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const SPACING_SYSTEM = {
  baseUnit: BASE_UNIT,
  spacing: SPACING,
  radius: RADIUS,
  sizes: SIZES,

  // Helper functions
  spacing: spacing,
  responsiveSpacing,
  getTouchTargetSize,
  ensureTouchTarget,
} as const;

export default SPACING_SYSTEM;
