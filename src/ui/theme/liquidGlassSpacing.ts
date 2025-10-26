import { Platform } from 'react-native';

/**
 * iOS 26 Liquid Glass Spacing System
 * Based on 8px grid for visual harmony
 *
 * Spacing Scale:
 * - xxs (4px): Minimal spacing, tight gaps
 * - xs (8px): Base unit, smallest standard spacing
 * - sm (12px): Small gaps between related elements
 * - md (16px): Standard spacing, default for most UI
 * - lg (20px): Content margins, comfortable spacing
 * - xl (24px): Section spacing, visual separation
 * - xxl (32px): Major sections, strong separation
 * - xxxl (40px): Screen-level spacing
 * - huge (48px): Special cases, extra breathing room
 */

export const LiquidGlassSpacing = {
  xxs: 4,   // Minimal spacing
  xs: 8,    // Base unit
  sm: 12,   // Small gaps
  md: 16,   // Standard spacing
  lg: 20,   // Content margins
  xl: 24,   // Section spacing
  xxl: 32,  // Major sections
  xxxl: 40, // Screen spacing
  huge: 48, // Special cases
} as const;

/**
 * Material Design 3 Spacing System
 * Based on 4dp grid with 8dp increments
 */

export const Material3Spacing = {
  xxs: 4,   // Minimal spacing
  xs: 8,    // Base unit
  sm: 12,   // Small gaps
  md: 16,   // Standard spacing
  lg: 24,   // Content margins (Material uses 24dp vs iOS 20px)
  xl: 32,   // Section spacing
  xxl: 40,  // Major sections
  xxxl: 48, // Screen spacing
  huge: 56, // Special cases
} as const;

/**
 * Get platform-appropriate spacing system
 */
export const getSpacing = () => {
  return Platform.OS === 'ios' ? LiquidGlassSpacing : Material3Spacing;
};

/**
 * Touch Target Specifications
 * Minimum sizes for comfortable interaction
 *
 * iOS 26: 44pt minimum (Apple HIG requirement)
 * Android: 48dp minimum (Material Design 3 requirement)
 */

export const TouchTargets = {
  ios: {
    minimum: 44,      // iOS 26 minimum touch target
    recommended: 48,  // Better for accessibility
    comfortable: 56,  // Extra comfortable for primary actions
  },
  android: {
    minimum: 48,      // Material Design 3 minimum
    recommended: 56,  // Better for accessibility
    comfortable: 64,  // Extra comfortable for primary actions
  },
} as const;

/**
 * Get platform-appropriate touch target size
 */
export const getMinimumTouchTarget = (): number => {
  return Platform.OS === 'ios' ? TouchTargets.ios.minimum : TouchTargets.android.minimum;
};

export const getRecommendedTouchTarget = (): number => {
  return Platform.OS === 'ios' ? TouchTargets.ios.recommended : TouchTargets.android.recommended;
};

/**
 * Corner Radius for Liquid Glass Elements
 * iOS 26 specific radius values for different component types
 *
 * - card: 16px (standard cards and containers)
 * - button: 12px (buttons and interactive elements)
 * - input: 10px (text inputs and form fields)
 * - sheet: 14px (sheets, modals, popovers)
 * - capsule: 999px (fully rounded pill shape)
 */

export const LiquidGlassRadius = {
  card: 16,         // Standard cards
  button: 12,       // Buttons and interactive elements
  input: 10,        // Text inputs
  sheet: 14,        // Sheets and modals
  capsule: 999,     // Fully rounded (pill shape)
  message: 20,      // Message bubbles (iMessage style)
} as const;

/**
 * Material Design 3 Corner Radius
 * Defined shape scale for Android components
 */

export const Material3Radius = {
  none: 0,          // Square corners
  extraSmall: 4,    // Subtle rounding
  small: 8,         // Small components
  medium: 12,       // Default for most components
  large: 16,        // Cards and large surfaces
  extraLarge: 28,   // Extra large components
  full: 999,        // Fully rounded
} as const;

/**
 * Get platform-appropriate corner radius
 */
export const getCornerRadius = (type: keyof typeof LiquidGlassRadius) => {
  if (Platform.OS === 'ios') {
    return LiquidGlassRadius[type];
  }

  // Map iOS types to Material 3 equivalents
  const materialMapping: Record<keyof typeof LiquidGlassRadius, number> = {
    card: Material3Radius.large,
    button: Material3Radius.large,
    input: Material3Radius.small,
    sheet: Material3Radius.extraLarge,
    capsule: Material3Radius.full,
    message: Material3Radius.large,
  };

  return materialMapping[type];
};

/**
 * Safe Area Insets
 * Standard values for different screen regions
 * Note: Use react-native-safe-area-context for dynamic values
 */

export const SafeAreaDefaults = {
  top: {
    statusBar: 44,          // Status bar height (iOS)
    notch: 47,              // Notch height (iPhone X+)
    dynamicIsland: 59,      // Dynamic Island height (iPhone 14 Pro+)
  },
  bottom: {
    homeIndicator: 34,      // Home indicator height
    tabBar: 49,             // iOS tab bar height
    toolbar: 50,            // Toolbar height
  },
  sides: {
    edge: 16,               // Standard edge margin
    safe: 20,               // Safe content margin
  },
} as const;

/**
 * Content Margins
 * Standard margins for different content types
 */

export const ContentMargins = {
  screen: Platform.OS === 'ios' ? 20 : 16,      // Screen edge margins
  card: Platform.OS === 'ios' ? 16 : 16,        // Card internal padding
  section: Platform.OS === 'ios' ? 20 : 24,     // Section spacing
  list: Platform.OS === 'ios' ? 16 : 16,        // List item padding
} as const;

/**
 * Glass Container Spacing
 * Spacing between glass elements in GlassContainer
 * Controls morphing animation behavior
 */

export const GlassContainerSpacing = {
  tight: 8,         // Tight spacing, subtle morphing
  comfortable: 12,  // Standard spacing
  relaxed: 16,      // Loose spacing, clear separation
  spacious: 20,     // Extra space between elements
} as const;

/**
 * Elevation/Shadow System
 * iOS uses shadows, Android uses elevation
 */

export const Elevation = {
  none: 0,
  level1: Platform.OS === 'ios' ? { shadowRadius: 3, shadowOpacity: 0.1, shadowOffset: { width: 0, height: 1 } } : 1,
  level2: Platform.OS === 'ios' ? { shadowRadius: 8, shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 } } : 3,
  level3: Platform.OS === 'ios' ? { shadowRadius: 20, shadowOpacity: 0.12, shadowOffset: { width: 0, height: 8 } } : 8,
  level4: Platform.OS === 'ios' ? { shadowRadius: 24, shadowOpacity: 0.15, shadowOffset: { width: 0, height: 12 } } : 12,
  level5: Platform.OS === 'ios' ? { shadowRadius: 32, shadowOpacity: 0.18, shadowOffset: { width: 0, height: 16 } } : 16,
} as const;

/**
 * Glass Effect Elevation (for interactive/prominent glass)
 * Stronger shadows for glass elements that need to stand out
 */

export const GlassElevation = {
  regular: Platform.OS === 'ios' ? {
    shadowColor: '#000000',
    shadowRadius: 20,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
  } : 3,
  prominent: Platform.OS === 'ios' ? {
    shadowColor: '#0A84FF',
    shadowRadius: 24,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
  } : 8,
  interactive: Platform.OS === 'ios' ? {
    shadowColor: '#0A84FF',
    shadowRadius: 24,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
  } : 8,
} as const;

/**
 * Semantic Spacing Utilities
 * Common spacing patterns for layout
 */

export const Spacing = {
  get base() {
    return Platform.OS === 'ios' ? LiquidGlassSpacing.xs : Material3Spacing.xs;
  },
  get small() {
    return Platform.OS === 'ios' ? LiquidGlassSpacing.sm : Material3Spacing.sm;
  },
  get medium() {
    return Platform.OS === 'ios' ? LiquidGlassSpacing.md : Material3Spacing.md;
  },
  get large() {
    return Platform.OS === 'ios' ? LiquidGlassSpacing.lg : Material3Spacing.lg;
  },
  get section() {
    return Platform.OS === 'ios' ? LiquidGlassSpacing.xl : Material3Spacing.xl;
  },
  get screen() {
    return Platform.OS === 'ios' ? LiquidGlassSpacing.lg : Material3Spacing.lg;
  },
} as const;

export default Spacing;
