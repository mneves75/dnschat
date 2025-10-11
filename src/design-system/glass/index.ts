/**
 * Glass UI Components - Evan Bacon Glass UI Demo Implementation
 *
 * Complete glass component system inspired by Evan Bacon's glass UI demo,
 * providing iOS Settings app style components with translucent backgrounds.
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support + Evan Bacon Glass UI)
 */

// Form Components
export {
  GlassForm,
  GlassFormSection,
  GlassFormItem,
  GlassFormLink,
  Form, // Namespace export
} from './GlassForm';

// Tab Bar Components
export {
  GlassTabBar,
  FloatingGlassTabBar,
  SegmentedGlassTabBar,
  type GlassTab,
  type GlassTabBarProps,
} from './GlassTabBar';

// Bottom Sheet Components
export {
  GlassBottomSheet,
  GlassActionSheet,
  useGlassBottomSheet,
  type GlassBottomSheetProps,
  type GlassSheetAction,
  type GlassActionSheetProps,
} from './GlassBottomSheet';

// Core glass components
export { GlassCard } from './GlassCard';
export { GlassButton } from './GlassButton';
export { GlassScreen } from './GlassScreen';

// Provider and hooks
export { GlassProvider, useGlass, useGlassRegistration } from './GlassProvider';

// Utilities
export {
  getGlassCapabilities,
  isNativeGlassSupported,
  shouldReduceTransparency,
  getGlassTintColor,
  getGlassBackgroundFallback,
  shouldRenderGlass,
  getIOSVersion,
  shouldForceGlassInDev,
} from './utils';

// Types
export type { GlassCapabilities } from './utils';

// Backwards compatibility warning wrappers
export {
  LegacyLiquidGlassWrapper,
  LegacyLiquidGlassCard,
  LegacyLiquidGlassButton,
  LegacyLiquidGlassNavBar,
  useLegacyLiquidGlassCapabilities,
} from './legacy-liquid-glass';
