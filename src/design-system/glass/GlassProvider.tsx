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

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { AccessibilityInfo } from 'react-native';
import {
  getGlassCapabilities,
  shouldReduceTransparency as checkAccessibilitySetting,
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

  /** Register a new glass element and receive cleanup callback */
  registerGlass: () => () => void;

  /** Unregister a glass element (legacy fallback) */
  unregisterGlass: () => void;

  /** Effective max elements after per-screen overrides */
  effectiveMaxGlassElements: number;

  /** Override glass budget for specific screen */
  setGlassBudget: (screenId: string, maxElements: number) => void;

  /** Remove glass budget override */
  clearGlassBudget: (screenId: string) => void;

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
 * Glass Registration Context
 *
 * PERFORMANCE OPTIMIZATION: Separated from GlassContext to prevent unnecessary re-renders.
 * Registration functions (registerGlass, unregisterGlass) are stable and rarely change,
 * so components using useGlassRegistration don't need to re-render when glassCount changes.
 *
 * This separation breaks the infinite loop: when glassCount updates, only components
 * consuming GlassContext re-render, not components that only register/unregister.
 */
const GlassRegistrationContext = createContext<{
  registerGlass: () => () => void;
  unregisterGlass: () => void;
} | undefined>(undefined);

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
  const [budgetOverrides, setBudgetOverrides] = useState<Record<string, number>>({});
  const lastWarningCountRef = useRef<number | null>(null);
  const effectiveMaxRef = useRef<number>(0);
  const nextRegistrationIdRef = useRef(0);
  const activeRegistrationsRef = useRef<Set<number>>(new Set());
  const pendingUpdateRef = useRef<number | null>(null);

  /**
   * Detect Glass Capabilities - Stabilized for Reference Equality
   *
   * CRITICAL FIX FOR INFINITE LOOP:
   * getGlassCapabilities() returns a NEW object every time, even when values are identical.
   * This causes capabilities to change reference on every render, which changes checkShouldRenderGlass
   * reference, which changes contextValue reference, which re-renders all consumers, infinite loop.
   *
   * FIX: Extract each primitive value separately, then reconstruct the object with stable references.
   */
  const rawCapabilities = useMemo(() => {
    return getGlassCapabilities(reduceTransparencyEnabled);
  }, [reduceTransparencyEnabled]);

  // Extract primitive values (these will be stable across renders)
  // IMPORTANT: Renamed shouldReduceTransparency to reduceTransparency to avoid shadowing
  // the imported function shouldReduceTransparency() from utils.ts
  const isNativeGlassSupported = rawCapabilities.isNativeGlassSupported;
  const canRenderGlass = rawCapabilities.canRenderGlass;
  const reduceTransparency = rawCapabilities.shouldReduceTransparency;
  const glassType = rawCapabilities.glassType;
  const maxGlassElements = rawCapabilities.maxGlassElements;

  // Reconstruct capabilities object with stable reference
  // This only changes when primitive values actually change
  const capabilities = useMemo(() => ({
    isNativeGlassSupported,
    canRenderGlass,
    shouldReduceTransparency: reduceTransparency,
    glassType,
    maxGlassElements,
  }), [isNativeGlassSupported, canRenderGlass, reduceTransparency, glassType, maxGlassElements]);

  const effectiveMaxGlassElements = useMemo(() => {
    const overrideValues = Object.values(budgetOverrides).filter(
      (value) => typeof value === 'number' && value > 0,
    );

    if (overrideValues.length === 0) {
      return capabilities.maxGlassElements;
    }

    return Math.min(capabilities.maxGlassElements, ...overrideValues);
  }, [budgetOverrides, capabilities.maxGlassElements]);


  const setGlassBudget = useCallback((screenId: string, maxElements: number) => {
    if (!screenId) {
      return;
    }

    setBudgetOverrides((prev) => {
      if (prev[screenId] === maxElements) {
        return prev;
      }

      return {
        ...prev,
        [screenId]: maxElements,
      };
    });
  }, []);

  const clearGlassBudget = useCallback((screenId: string) => {
    if (!screenId) {
      return;
    }

    setBudgetOverrides((prev) => {
      if (!(screenId in prev)) {
        return prev;
      }

      const next = { ...prev };
      delete next[screenId];
      return next;
    });
  }, []);

  /**
   * Monitor Reduce Transparency Setting
   *
   * ACCESSIBILITY: Subscribe to accessibility changes and update capabilities
   * when user enables/disables "Reduce Transparency" in system settings.
   */
  useEffect(() => {
    // Initial check
    const checkAccessibility = async () => {
      const enabled = await checkAccessibilitySetting();
      setReduceTransparencyEnabled(enabled);
    };
    checkAccessibility();

    // Subscribe to changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      (enabled) => {
        setReduceTransparencyEnabled(enabled);
        // Log accessibility changes in development only
        if (__DEV__) {
          console.log('[GlassProvider] Reduce Transparency changed:', enabled);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Glass Element Registration with Batching
   *
   * PERFORMANCE: Uses requestAnimationFrame to batch multiple registration updates
   * into a single state update. This prevents FlashList from triggering 17+ sequential
   * state updates when rendering many items simultaneously.
   *
   * CRITICAL FIX FOR INFINITE LOOP:
   * Without batching, each registerGlass() call immediately triggers setGlassCount(),
   * which re-renders the provider, which updates contextValue, which causes all
   * consumers to re-render, which triggers useGlassRegistration effects, creating
   * a feedback loop. Batching breaks this cycle by accumulating registrations across
   * a single frame and applying them atomically.
   */
  const updateGlassCount = useCallback((next: number) => {
    // Cancel any pending update
    if (pendingUpdateRef.current !== null) {
      cancelAnimationFrame(pendingUpdateRef.current);
    }

    // Batch updates in next frame
    pendingUpdateRef.current = requestAnimationFrame(() => {
      pendingUpdateRef.current = null;

      setGlassCount((prev) => {
        if (prev === next) {
          return prev;
        }

        const limit = effectiveMaxRef.current;

        if (next > limit) {
          if (lastWarningCountRef.current !== next) {
            // Warn about performance issues in development only
            // CRITICAL: Too many glass elements can cause frame drops
            if (__DEV__) {
              console.warn(
                `[GlassProvider] Glass element limit exceeded: ${next}/${limit}. ` +
                'Performance may degrade. Consider limiting glass elements per screen.'
              );
            }
            lastWarningCountRef.current = next;
          }
        } else if (lastWarningCountRef.current !== null) {
          lastWarningCountRef.current = null;
        }

        return next;
      });
    });
  }, []);

  const registerGlass = useCallback(() => {
    const registrationId = nextRegistrationIdRef.current++;
    activeRegistrationsRef.current.add(registrationId);
    updateGlassCount(activeRegistrationsRef.current.size);

    let released = false;

    return () => {
      if (released) {
        return;
      }
      released = true;

      if (activeRegistrationsRef.current.delete(registrationId)) {
        updateGlassCount(activeRegistrationsRef.current.size);
      }
    };
  }, [updateGlassCount]);

  const unregisterGlass = useCallback(() => {
    if (activeRegistrationsRef.current.size === 0) {
      updateGlassCount(0);
      return;
    }

    // Fallback path for legacy callers without explicit registration IDs.
    const iterator = activeRegistrationsRef.current.values().next();
    if (!iterator.done) {
      activeRegistrationsRef.current.delete(iterator.value);
    }
    updateGlassCount(activeRegistrationsRef.current.size);
  }, [updateGlassCount]);

  useEffect(() => {
    effectiveMaxRef.current = effectiveMaxGlassElements;
    updateGlassCount(activeRegistrationsRef.current.size);
  }, [effectiveMaxGlassElements, updateGlassCount]);

  // Cleanup pending animation frames on unmount
  useEffect(() => {
    return () => {
      if (pendingUpdateRef.current !== null) {
        cancelAnimationFrame(pendingUpdateRef.current);
      }
    };
  }, []);

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
   *
   * CRITICAL: Wrapped in useCallback to prevent infinite re-render loops.
   * With stabilized capabilities object (above), this function now has stable
   * references and only changes when actual values change.
   */
  const checkShouldRenderGlass = useCallback(() => {
    return shouldRenderGlassUtil(
      glassCount,
      isScrolling,
      isAnimating,
      {
        ...capabilities,
        maxGlassElements: effectiveMaxGlassElements,
      }
    );
  }, [glassCount, isScrolling, isAnimating, capabilities, effectiveMaxGlassElements]);

  /**
   * Separate Registration Context Value
   *
   * CRITICAL FIX FOR INFINITE LOOP:
   * Registration functions are extracted into their own context with stable memoization.
   * This prevents components using useGlassRegistration from re-rendering when glassCount
   * changes, breaking the feedback loop.
   *
   * Only registerGlass and unregisterGlass are dependencies, both of which are stable
   * via useCallback with no changing dependencies.
   */
  const registrationContextValue = useMemo(() => ({
    registerGlass,
    unregisterGlass,
  }), [registerGlass, unregisterGlass]);

  // Context value - memoized to prevent unnecessary re-renders
  const contextValue: GlassContextValue = useMemo(() => ({
    capabilities,
    glassCount,
    isScrolling,
    isAnimating,
    registerGlass,
    unregisterGlass,
    setScrolling,
    setAnimating,
    shouldRenderGlass: checkShouldRenderGlass,
    effectiveMaxGlassElements,
    setGlassBudget,
    clearGlassBudget,
  }), [
    capabilities,
    glassCount,
    isScrolling,
    isAnimating,
    registerGlass,
    unregisterGlass,
    checkShouldRenderGlass,
    effectiveMaxGlassElements,
    setGlassBudget,
    clearGlassBudget,
  ]);

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

  useEffect(() => {
    if (glassCount <= effectiveMaxGlassElements) {
      lastWarningCountRef.current = null;
    }
  }, [glassCount, effectiveMaxGlassElements]);

  return (
    <GlassRegistrationContext.Provider value={registrationContextValue}>
      <GlassContext.Provider value={contextValue}>
        {children}
      </GlassContext.Provider>
    </GlassRegistrationContext.Provider>
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
 *
 * CRITICAL FIX FOR INFINITE LOOP:
 * Now uses GlassRegistrationContext instead of GlassContext. This prevents
 * components from re-rendering when glassCount changes, breaking the feedback loop.
 * The registration context only contains stable functions (registerGlass, unregisterGlass),
 * so it never changes reference unless the functions themselves change (which they don't).
 */
export function useGlassRegistration(enabled: boolean = true) {
  const context = useContext(GlassRegistrationContext);

  if (context === undefined) {
    throw new Error(
      'useGlassRegistration must be used within a GlassProvider. ' +
      'Wrap your app with <GlassProvider> in app/_layout.tsx'
    );
  }

  const { registerGlass } = context;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const unregister = registerGlass();
    return () => {
      unregister();
    };
  }, [enabled, registerGlass]); // Now safe to include registerGlass - it's stable
}
