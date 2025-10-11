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
  const nextRegistrationIdRef = useRef(0);
  const activeRegistrationsRef = useRef<Set<number>>(new Set());
  const pendingUpdateRef = useRef<number | null>(null);

  /**
   * Detect Glass Capabilities - TRULY Stabilized for Reference Equality
   *
   * CRITICAL FIX FOR INFINITE LOOP:
   * Previous implementation: getGlassCapabilities() returned NEW object every call.
   * Even with useMemo and primitive extraction, capabilities changed reference on every render.
   *
   * ROOT CAUSE: useMemo dependencies included derived values that changed when rawCapabilities changed.
   * This created circular dependency: rawCapabilities changes -> primitives change -> capabilities changes -> consumers re-render -> loop.
   *
   * NEW FIX: Use useState with lazy initializer to compute capabilities ONCE on mount.
   * Only update when reduceTransparencyEnabled actually changes via useEffect.
   * This guarantees stable object reference across renders.
   */
  const [capabilities, setCapabilities] = useState<GlassCapabilities>(() =>
    getGlassCapabilities(false)
  );

  /**
   * CRITICAL FIX: effectiveMaxRef for Warning Logic
   *
   * WHY A REF: We need the current limit in updateGlassCount's RAF callback,
   * but adding effectiveMaxGlassElements to deps would recreate updateGlassCount
   * every time the limit changes, which would cascade-recreate registerGlass/unregisterGlass,
   * causing all glass components to re-run their useEffect registrations.
   *
   * SOLUTION: Update ref synchronously (before render completes), read in callback.
   * No race condition because ref update happens BEFORE any RAF callback runs.
   */
  const effectiveMaxRef = useRef<number>(0);

  // Update capabilities only when accessibility setting actually changes
  useEffect(() => {
    const newCapabilities = getGlassCapabilities(reduceTransparencyEnabled);
    setCapabilities(newCapabilities);
  }, [reduceTransparencyEnabled]);

  const effectiveMaxGlassElements = useMemo(() => {
    const overrideValues = Object.values(budgetOverrides).filter(
      (value) => typeof value === 'number' && value > 0,
    );

    if (overrideValues.length === 0) {
      return capabilities.maxGlassElements;
    }

    return Math.min(capabilities.maxGlassElements, ...overrideValues);
  }, [budgetOverrides, capabilities.maxGlassElements]);

  // Update ref synchronously whenever computed value changes
  // This ensures updateGlassCount always reads current value without needing it in deps
  effectiveMaxRef.current = effectiveMaxGlassElements;


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

        // Read from ref - always current, no deps needed
        // Ref is updated synchronously above, so no race condition
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
        } else {
          // CRITICAL: Reset warning ref synchronously when back under limit
          // Previous bug: Separate useEffect caused timing issues
          lastWarningCountRef.current = null;
        }

        return next;
      });
    });
  }, []); // STABLE - never recreates, preventing cascade re-registrations

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
   *
   * CRITICAL FIX: Wrapped in useCallback to prevent contextValue from changing reference
   * on every render. Without this, every consumer re-renders unnecessarily.
   */
  const setScrolling = useCallback((scrolling: boolean) => {
    setIsScrolling(scrolling);
  }, []);

  /**
   * Animation State Management
   *
   * PERFORMANCE: Disable glass during heavy animations to maintain 60fps.
   *
   * USAGE: Call when starting/ending complex animations
   *
   * CRITICAL FIX: Wrapped in useCallback to prevent contextValue from changing reference
   * on every render. Without this, every consumer re-renders unnecessarily.
   */
  const setAnimating = useCallback((animating: boolean) => {
    setIsAnimating(animating);
  }, []);

  /**
   * Check if Glass Should Render
   *
   * PERFORMANCE: Returns false if:
   * - Too many glass elements on screen
   * - User is scrolling (on iOS <26)
   * - Heavy animation in progress
   * - Reduce transparency is enabled
   *
   * CRITICAL FIX: Avoid object spreading which creates new object on every call.
   * Instead, pass individual parameters. This maintains stable function reference.
   *
   * PREVIOUS BUG: { ...capabilities, maxGlassElements: effectiveMaxGlassElements }
   * created a NEW object every time this function was called, even though useCallback
   * was used. Object literals are NEVER equal by reference.
   */
  const checkShouldRenderGlass = useCallback(() => {
    // Inline the shouldRenderGlassUtil logic to avoid object creation
    // Always render solid backgrounds
    if (capabilities.glassType === 'solid') {
      return true;
    }

    // Disable during heavy operations on iOS <26 (JS-based blur is expensive)
    if (capabilities.glassType === 'blur' && (isScrolling || isAnimating)) {
      return false;
    }

    // Enforce max element limit (use effective max, not base max)
    if (glassCount > effectiveMaxGlassElements) {
      return false;
    }

    return capabilities.canRenderGlass;
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

  /**
   * Log capabilities in development (ONCE on mount only)
   *
   * CRITICAL FIX: Previous implementation had capabilities as dependency,
   * causing this to run on every render when capabilities object changed reference.
   * This contributed to the infinite re-render loop.
   *
   * NEW: Only log ONCE on mount, and separately log when accessibility changes.
   */
  useEffect(() => {
    if (__DEV__) {
      console.log('[GlassProvider] Initialized with capabilities:', {
        isNativeGlassSupported: capabilities.isNativeGlassSupported,
        glassType: capabilities.glassType,
        maxGlassElements: capabilities.maxGlassElements,
        reduceTransparency: capabilities.shouldReduceTransparency,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run ONCE on mount only

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
