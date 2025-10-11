/**
 * Glass Provider - Global Glass Configuration Context
 *
 * Provides glass capabilities and configuration to all child components.
 * Manages accessibility settings, platform detection, and performance monitoring.
 *
 * CRITICAL ARCHITECTURE:
 * - Wraps the entire app in app/_layout.tsx
 * - Detects glass capabilities once on mount
 * - Monitors accessibility settings (Reduce Transparency)
 * - Provides performance context (glass count, scrolling state)
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router + Glass Migration)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { AccessibilityInfo } from 'react-native';
import {
  getGlassCapabilities,
  shouldReduceTransparency,
  GlassCapabilities,
  shouldRenderGlass as shouldRenderGlassUtil,
} from './utils';

/**
 * Glass Context Value Interface
 */
interface GlassContextValue {
  /** Current glass capabilities */
  capabilities: GlassCapabilities;

  /** Number of glass elements currently rendered */
  glassCount: number;

  /** User is currently scrolling */
  isScrolling: boolean;

  /** Heavy animation in progress */
  isAnimating: boolean;

  /** Register a new glass element */
  registerGlass: () => void;

  /** Unregister a glass element */
  unregisterGlass: () => void;

  /** Set scrolling state */
  setScrolling: (scrolling: boolean) => void;

  /** Set animating state */
  setAnimating: (animating: boolean) => void;

  /** Check if glass should render (performance-aware) */
  shouldRenderGlass: () => boolean;
}

/**
 * Glass Context
 *
 * CRITICAL: This context must be provided at the root level (app/_layout.tsx)
 * to ensure all glass components have access to capabilities.
 */
const GlassContext = createContext<GlassContextValue | undefined>(undefined);

/**
 * Glass Provider Props
 */
interface GlassProviderProps {
  children: ReactNode;
}

/**
 * Glass Provider Component
 *
 * USAGE:
 * ```tsx
 * // In app/_layout.tsx
 * <GlassProvider>
 *   <App />
 * </GlassProvider>
 * ```
 *
 * PERFORMANCE NOTES:
 * - Capabilities are detected once on mount
 * - Accessibility listener updates when settings change
 * - Glass count tracks active glass elements for performance limits
 */
export function GlassProvider({ children }: GlassProviderProps) {
  // State
  const [reduceTransparencyEnabled, setReduceTransparencyEnabled] = useState(false);
  const [glassCount, setGlassCount] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  /**
   * Detect Glass Capabilities
   *
   * CRITICAL: This runs once on mount to determine platform support.
   * The result is memoized and only updates when accessibility changes.
   */
  const capabilities = useMemo(() => {
    return getGlassCapabilities(reduceTransparencyEnabled);
  }, [reduceTransparencyEnabled]);

  /**
   * Monitor Reduce Transparency Setting
   *
   * ACCESSIBILITY: Subscribe to accessibility changes and update capabilities
   * when user enables/disables "Reduce Transparency" in system settings.
   */
  useEffect(() => {
    // Initial check
    const checkAccessibility = async () => {
      const enabled = await shouldReduceTransparency();
      setReduceTransparencyEnabled(enabled);
    };
    checkAccessibility();

    // Subscribe to changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      (enabled) => {
        setReduceTransparencyEnabled(enabled);
        console.log('[GlassProvider] Reduce Transparency changed:', enabled);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Glass Element Registration
   *
   * PERFORMANCE: Each glass component calls registerGlass() on mount
   * and unregisterGlass() on unmount. This allows the provider to
   * enforce the max glass element limit.
   */
  const registerGlass = () => {
    setGlassCount((prev) => {
      const newCount = prev + 1;
      if (newCount > capabilities.maxGlassElements) {
        console.warn(
          `[GlassProvider] Glass element limit exceeded: ${newCount}/${capabilities.maxGlassElements}. ` +
          'Performance may degrade. Consider limiting glass elements per screen.'
        );
      }
      return newCount;
    });
  };

  const unregisterGlass = () => {
    setGlassCount((prev) => Math.max(0, prev - 1));
  };

  /**
   * Scrolling State Management
   *
   * PERFORMANCE: Glass components should disable during heavy scrolling
   * on platforms with JS-based blur (iOS <26).
   *
   * USAGE: Call from ScrollView onScrollBeginDrag/onScrollEndDrag
   */
  const setScrolling = (scrolling: boolean) => {
    setIsScrolling(scrolling);
  };

  /**
   * Animation State Management
   *
   * PERFORMANCE: Disable glass during heavy animations to maintain 60fps.
   *
   * USAGE: Call when starting/ending complex animations
   */
  const setAnimating = (animating: boolean) => {
    setIsAnimating(animating);
  };

  /**
   * Check if Glass Should Render
   *
   * PERFORMANCE: Returns false if:
   * - Too many glass elements on screen
   * - User is scrolling (on iOS <26)
   * - Heavy animation in progress
   * - Reduce transparency is enabled
   */
  const checkShouldRenderGlass = () => {
    return shouldRenderGlassUtil(
      glassCount,
      isScrolling,
      isAnimating,
      capabilities
    );
  };

  // Context value
  const contextValue: GlassContextValue = {
    capabilities,
    glassCount,
    isScrolling,
    isAnimating,
    registerGlass,
    unregisterGlass,
    setScrolling,
    setAnimating,
    shouldRenderGlass: checkShouldRenderGlass,
  };

  // Log capabilities in development
  useEffect(() => {
    if (__DEV__) {
      console.log('[GlassProvider] Initialized with capabilities:', {
        isNativeGlassSupported: capabilities.isNativeGlassSupported,
        glassType: capabilities.glassType,
        maxGlassElements: capabilities.maxGlassElements,
        reduceTransparency: capabilities.shouldReduceTransparency,
      });
    }
  }, [capabilities]);

  return (
    <GlassContext.Provider value={contextValue}>
      {children}
    </GlassContext.Provider>
  );
}

/**
 * Use Glass Hook
 *
 * Access glass context from any component.
 *
 * USAGE:
 * ```tsx
 * function MyComponent() {
 *   const { capabilities, shouldRenderGlass } = useGlass();
 *
 *   if (!shouldRenderGlass()) {
 *     return <View>{children}</View>; // Fallback to solid
 *   }
 *
 *   return <GlassView>{children}</GlassView>;
 * }
 * ```
 *
 * CRITICAL: This hook must be used within a GlassProvider.
 * Throws error if used outside provider.
 */
export function useGlass(): GlassContextValue {
  const context = useContext(GlassContext);

  if (context === undefined) {
    throw new Error(
      'useGlass must be used within a GlassProvider. ' +
      'Wrap your app with <GlassProvider> in app/_layout.tsx'
    );
  }

  return context;
}

/**
 * Use Glass Registration Hook
 *
 * Automatically registers/unregisters glass element on mount/unmount.
 *
 * USAGE:
 * ```tsx
 * function GlassCard() {
 *   useGlassRegistration(); // Auto-registers this glass element
 *
 *   return <GlassView>...</GlassView>;
 * }
 * ```
 *
 * PERFORMANCE: Use this in every glass component to enable
 * automatic element counting and limit enforcement.
 */
export function useGlassRegistration() {
  const { registerGlass, unregisterGlass } = useGlass();

  useEffect(() => {
    registerGlass();
    return () => {
      unregisterGlass();
    };
  }, [registerGlass, unregisterGlass]);
}
