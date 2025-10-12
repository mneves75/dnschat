import { useEffect, useMemo } from 'react';
import { useGlass } from '../design-system/glass';

interface GlassBudgetOptions {
  /** Optional override for max glass elements this screen should use */
  maxElements?: number;
}

interface GlassBudgetResult {
  /** Remaining glass elements before exceeding the budget */
  remaining: number;
  /** True when budget is exhausted and new glass should fallback */
  isOverBudget: boolean;
  /** Effective max elements enforced by provider */
  effectiveMax: number;
  /** Helper to check if a requested number of elements fits the budget */
  canAllocate: (requested?: number) => boolean;
}

/**
 * useGlassBudget
 *
 * Screen-level helper for coordinating glass budgets.
 * Ensures we respect platform/documented limits while giving
 * components a simple API to decide between glass and fallback UI.
 */
export function useGlassBudget(
  screenId: string,
  options: GlassBudgetOptions = {},
): GlassBudgetResult {
  const { maxElements } = options;
  const {
    glassCount,
    effectiveMaxGlassElements,
    setGlassBudget,
    clearGlassBudget,
  } = useGlass();

  useEffect(() => {
    if (!screenId || !maxElements) {
      return;
    }

    // Screens opt-in to explicit budgets; provider automatically reverts on unmount.
    setGlassBudget(screenId, maxElements);
    return () => {
      clearGlassBudget(screenId);
    };
  }, [screenId, maxElements, setGlassBudget, clearGlassBudget]);

  const remaining = useMemo(() => {
    return Math.max(0, effectiveMaxGlassElements - glassCount);
  }, [effectiveMaxGlassElements, glassCount]);

  const canAllocate = (requested: number = 1) => remaining >= requested;

  return {
    remaining,
    isOverBudget: remaining === 0,
    effectiveMax: effectiveMaxGlassElements,
    canAllocate,
  };
}
