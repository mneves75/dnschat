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
} from "./GlassForm";

// Tab Bar Components
export {
  GlassTabBar,
  FloatingGlassTabBar,
  SegmentedGlassTabBar,
  type GlassTab,
  type GlassTabBarProps,
} from "./GlassTabBar";

// Bottom Sheet Components
export {
  GlassBottomSheet,
  GlassActionSheet,
  useGlassBottomSheet,
  type GlassBottomSheetProps,
  type GlassSheetAction,
  type GlassActionSheetProps,
} from "./GlassBottomSheet";

// Core glass utilities/components
export {
  GlassCard,
  GlassButton,
  GlassScreen,
  GlassProvider,
  useGlass,
  useGlassRegistration,
  getGlassCapabilities,
  getGlassBackgroundFallback,
  getGlassTintColor,
  shouldRenderGlass,
  type GlassCapabilities,
} from "../../design-system/glass";

// Glass Component Namespace (alternative import style)
export * as Glass from "./GlassForm";
export * as GlassTabs from "./GlassTabBar";
export * as GlassSheets from "./GlassBottomSheet";
