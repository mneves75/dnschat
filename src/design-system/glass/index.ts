/**
 * Glass Design System - Barrel Exports
 *
 * Centralized exports for core glass components, providers, and utilities.
 */

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
