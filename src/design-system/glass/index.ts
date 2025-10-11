/**
 * Glass Design System - Barrel Exports
 *
 * Centralized exports for all glass-related components and utilities.
 *
 * USAGE:
 * ```tsx
 * import { GlassCard, GlassButton, GlassProvider, useGlass } from '@/design-system/glass';
 * ```
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router + Glass Migration)
 */

// Provider and Hooks
export { GlassProvider, useGlass, useGlassRegistration } from './GlassProvider';

// Components
export { GlassCard } from './GlassCard';
export { GlassButton } from './GlassButton';
export { GlassScreen } from './GlassScreen';

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
