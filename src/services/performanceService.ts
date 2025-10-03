/**
 * Performance Monitoring Service
 * 
 * Tracks app performance metrics for Phase 3 profiling:
 * - TTI (Time to Interactive)
 * - FPS (Frames Per Second)
 * - Memory usage
 * - Component render times
 * 
 * Uses React Native Performance API (global.performance)
 */

import { Platform } from 'react-native';

export interface PerformanceMetrics {
  tti?: number; // Time to Interactive (ms)
  fps?: number; // Current FPS
  memory?: {
    used: number; // MB
    limit: number; // MB
    percentage: number;
  };
  renders: {
    [componentName: string]: {
      count: number;
      avgDuration: number;
      maxDuration: number;
    };
  };
}

export interface PerformanceMark {
  name: string;
  timestamp: number;
}

class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number[]> = new Map();
  private renderMetrics: Map<string, { durations: number[]; count: number }> = new Map();
  private fpsFrames: number[] = [];
  private lastFrameTime: number = 0;
  private rafId: number | null = null;

  /**
   * Mark a performance point in time
   */
  mark(name: string): void {
    if (typeof global.performance?.now === 'function') {
      this.marks.set(name, global.performance.now());
    }
  }

  /**
   * Measure duration between two marks
   */
  measure(name: string, startMark: string, endMark?: string): number | null {
    const start = this.marks.get(startMark);
    if (!start) return null;

    const end = endMark ? this.marks.get(endMark) : (global.performance?.now() ?? Date.now());
    if (!end) return null;

    const duration = typeof end === 'number' ? end - start : 0;
    
    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)!.push(duration);

    return duration;
  }

  /**
   * Record component render duration
   */
  recordRender(componentName: string, duration: number): void {
    if (!this.renderMetrics.has(componentName)) {
      this.renderMetrics.set(componentName, { durations: [], count: 0 });
    }
    
    const metric = this.renderMetrics.get(componentName)!;
    metric.durations.push(duration);
    metric.count++;

    // Keep only last 100 renders to prevent memory growth
    if (metric.durations.length > 100) {
      metric.durations.shift();
    }
  }

  /**
   * Start FPS monitoring
   */
  startFPSMonitoring(): void {
    if (this.rafId !== null) return;

    const measureFrame = (timestamp: number) => {
      if (this.lastFrameTime > 0) {
        const delta = timestamp - this.lastFrameTime;
        const fps = delta > 0 ? 1000 / delta : 60;
        
        this.fpsFrames.push(fps);
        
        // Keep only last 60 frames (~1 second at 60fps)
        if (this.fpsFrames.length > 60) {
          this.fpsFrames.shift();
        }
      }
      
      this.lastFrameTime = timestamp;
      this.rafId = requestAnimationFrame(measureFrame);
    };

    this.rafId = requestAnimationFrame(measureFrame);
  }

  /**
   * Stop FPS monitoring
   */
  stopFPSMonitoring(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Get current FPS (average of last 60 frames)
   */
  getCurrentFPS(): number {
    if (this.fpsFrames.length === 0) return 0;
    
    const sum = this.fpsFrames.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsFrames.length);
  }

  /**
   * Get memory usage (iOS/Android specific)
   */
  getMemoryUsage(): PerformanceMetrics['memory'] | undefined {
    // React Native doesn't expose memory API directly
    // This would require a native module for accurate readings
    // For now, we'll document the need and return undefined
    
    // iOS: could use performance.memory (non-standard)
    // Android: would need native module accessing Runtime.getRuntime()
    
    if (typeof (global.performance as any)?.memory === 'object') {
      const mem = (global.performance as any).memory;
      return {
        used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
        limit: Math.round(mem.jsHeapSizeLimit / 1024 / 1024),
        percentage: Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100),
      };
    }

    return undefined;
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetrics {
    const renders: PerformanceMetrics['renders'] = {};

    this.renderMetrics.forEach((metric, componentName) => {
      const durations = metric.durations;
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const max = Math.max(...durations);

      renders[componentName] = {
        count: metric.count,
        avgDuration: Math.round(avg * 100) / 100,
        maxDuration: Math.round(max * 100) / 100,
      };
    });

    // Calculate TTI (Time to Interactive) if both marks exist
    const appStartTime = this.marks.get('app-start');
    const interactiveTime = this.marks.get('app-interactive');
    const tti = appStartTime && interactiveTime ? interactiveTime - appStartTime : undefined;

    return {
      tti,
      fps: this.getCurrentFPS(),
      memory: this.getMemoryUsage(),
      renders,
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    const metrics = this.getMetrics();
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      version: Platform.Version,
      metrics,
    }, null, 2);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.marks.clear();
    this.measures.clear();
    this.renderMetrics.clear();
    this.fpsFrames = [];
  }
}

// Singleton instance
export const PerformanceService = new PerformanceMonitor();

// Auto-mark app start
PerformanceService.mark('app-start');
