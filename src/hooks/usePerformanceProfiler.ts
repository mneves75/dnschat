/**
 * React hook for component-level performance profiling
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   usePerformanceProfiler('MyComponent');
 *   // ... rest of component
 * }
 * ```
 */

import { useEffect, useRef } from 'react';
import { PerformanceService } from '../services/performanceService';

export function usePerformanceProfiler(componentName: string): void {
  const renderStartRef = useRef<number>(0);
  const isFirstRenderRef = useRef(true);

  // Measure render start
  renderStartRef.current = global.performance?.now() ?? Date.now();

  useEffect(() => {
    // Measure render end (after commit to DOM)
    const renderEnd = global.performance?.now() ?? Date.now();
    const duration = renderEnd - renderStartRef.current;

    // Skip first render (includes initial mount overhead)
    if (!isFirstRenderRef.current) {
      PerformanceService.recordRender(componentName, duration);
    } else {
      isFirstRenderRef.current = false;
    }
  });
}

/**
 * Hook for tracking Time to Interactive
 * Use once in root App component
 */
export function useTimeToInteractive(): void {
  useEffect(() => {
    // Mark app as interactive after first render completes
    PerformanceService.mark('app-interactive');

    // Log TTI to console in development
    if (__DEV__) {
      const metrics = PerformanceService.getMetrics();
      if (metrics.tti) {
        console.log(`[Performance] TTI: ${Math.round(metrics.tti)}ms`);
      }
    }
  }, []);
}

/**
 * Hook for FPS monitoring (use sparingly, only when needed)
 */
export function useFPSMonitor(enabled: boolean = true): number {
  useEffect(() => {
    if (!enabled) return;

    PerformanceService.startFPSMonitoring();

    return () => {
      PerformanceService.stopFPSMonitoring();
    };
  }, [enabled]);

  return PerformanceService.getCurrentFPS();
}
