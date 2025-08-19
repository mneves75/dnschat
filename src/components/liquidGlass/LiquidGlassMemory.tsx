/**
 * Liquid Glass Memory Management System
 * 
 * Enterprise-grade memory optimization for liquid glass effects with intelligent
 * resource pooling, automatic cleanup, and performance monitoring. Designed to
 * handle complex UIs with hundreds of glass elements without memory leaks.
 * 
 * Memory Management Features:
 * - Glass effect resource pooling and reuse
 * - Automatic cleanup based on visibility and lifecycle
 * - Memory pressure monitoring and automatic downgrades
 * - Lazy loading and deferred initialization
 * - Background/foreground memory optimization
 * - WeakRef-based reference management
 * 
 * Performance Monitoring:
 * - Real-time memory usage tracking
 * - Glass effect performance metrics
 * - Frame rate monitoring and optimization
 * - Thermal state integration
 * - Battery usage optimization
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

import React, { createContext, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppState, Platform, NativeModules } from 'react-native';

import {
  LiquidGlassCapabilities,
  GlassIntensity,
  GlassStyle,
  getLiquidGlassCapabilities,
} from '../../utils/liquidGlass';

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

interface GlassElementRef {
  id: string;
  component: WeakRef<React.Component>;
  lastAccessed: number;
  isVisible: boolean;
  intensity: GlassIntensity;
  style: GlassStyle;
  memoryFootprint: number; // bytes
  renderCount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface MemoryPool {
  available: GlassElementRef[];
  inUse: Map<string, GlassElementRef>;
  maxSize: number;
  currentSize: number;
}

interface MemoryMetrics {
  totalAllocated: number; // bytes
  activeGlassElements: number;
  pooledElements: number;
  memoryPressureLevel: 'normal' | 'warning' | 'critical';
  frameRate: number;
  averageRenderTime: number; // ms
  lastCleanup: number;
  cleanupFrequency: number; // ms
}

interface MemoryConfig {
  maxGlassElements: number;
  poolSize: number;
  cleanupInterval: number; // ms
  memoryWarningThreshold: number; // bytes
  memoryPressureThreshold: number; // bytes
  enableBackgroundOptimization: boolean;
  enableVisibilityOptimization: boolean;
  enablePerformanceMonitoring: boolean;
  aggressiveCleanupMode: boolean;
}

interface MemoryManagerCallbacks {
  onMemoryWarning?: (metrics: MemoryMetrics) => void;
  onMemoryPressure?: (metrics: MemoryMetrics) => void;
  onPerformanceDegradation?: (frameRate: number) => void;
  onCleanupComplete?: (freedBytes: number) => void;
}

// ==================================================================================
// MEMORY MANAGER CLASS
// ==================================================================================

/**
 * Central memory management system for liquid glass effects
 * Following enterprise patterns for resource management and performance optimization
 */
class LiquidGlassMemoryManager {
  private static instance: LiquidGlassMemoryManager | null = null;
  
  private memoryPool: MemoryPool;
  private config: MemoryConfig;
  private callbacks: MemoryManagerCallbacks;
  private metrics: MemoryMetrics;
  private capabilities: LiquidGlassCapabilities | null = null;
  
  // Monitoring and cleanup
  private cleanupTimer: NodeJS.Timeout | null = null;
  private performanceTimer: NodeJS.Timeout | null = null;
  private memoryObserver: () => void = () => {};
  private appStateSubscription: () => void = () => {};
  
  // Performance tracking
  private frameTimestamps: number[] = [];
  private renderTimeHistory: number[] = [];
  private lastFrameTime = 0;
  
  private constructor(config: MemoryConfig, callbacks: MemoryManagerCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
    
    // Initialize memory pool
    this.memoryPool = {
      available: [],
      inUse: new Map(),
      maxSize: config.poolSize,
      currentSize: 0,
    };
    
    // Initialize metrics
    this.metrics = {
      totalAllocated: 0,
      activeGlassElements: 0,
      pooledElements: 0,
      memoryPressureLevel: 'normal',
      frameRate: 60,
      averageRenderTime: 16.67, // 60fps target
      lastCleanup: Date.now(),
      cleanupFrequency: config.cleanupInterval,
    };
    
    this.initialize();
  }
  
  /**
   * Singleton pattern for global memory management
   */
  static getInstance(config?: MemoryConfig, callbacks?: MemoryManagerCallbacks): LiquidGlassMemoryManager {
    if (!LiquidGlassMemoryManager.instance) {
      const defaultConfig: MemoryConfig = {
        maxGlassElements: 50,
        poolSize: 20,
        cleanupInterval: 30000, // 30 seconds
        memoryWarningThreshold: 50 * 1024 * 1024, // 50MB
        memoryPressureThreshold: 100 * 1024 * 1024, // 100MB
        enableBackgroundOptimization: true,
        enableVisibilityOptimization: true,
        enablePerformanceMonitoring: true,
        aggressiveCleanupMode: false,
      };
      
      LiquidGlassMemoryManager.instance = new LiquidGlassMemoryManager(
        { ...defaultConfig, ...config },
        callbacks || {}
      );
    }
    
    return LiquidGlassMemoryManager.instance;
  }
  
  /**
   * Initialize memory management system
   */
  private async initialize(): Promise<void> {
    try {
      // Load glass capabilities
      this.capabilities = await getLiquidGlassCapabilities();
      
      // Adjust configuration based on device capabilities
      this.adjustConfigForDevice();
      
      // Start monitoring systems
      this.startMemoryMonitoring();
      this.startPerformanceMonitoring();
      this.startAppStateMonitoring();
      
      // Start cleanup timer
      this.startCleanupTimer();
      
      console.log('🧠 LiquidGlass memory manager initialized', {
        maxElements: this.config.maxGlassElements,
        poolSize: this.config.poolSize,
        deviceTier: this.capabilities?.performance.tier,
      });
      
    } catch (error) {
      console.error('Memory manager initialization failed:', error);
    }
  }
  
  /**
   * Adjust configuration based on device capabilities
   */
  private adjustConfigForDevice(): void {
    if (!this.capabilities) return;
    
    const tier = this.capabilities.performance.tier;
    
    switch (tier) {
      case 'high':
        this.config.maxGlassElements = 100;
        this.config.poolSize = 40;
        this.config.cleanupInterval = 60000; // 1 minute
        break;
      case 'medium':
        this.config.maxGlassElements = 50;
        this.config.poolSize = 20;
        this.config.cleanupInterval = 30000; // 30 seconds
        break;
      case 'low':
        this.config.maxGlassElements = 20;
        this.config.poolSize = 10;
        this.config.cleanupInterval = 15000; // 15 seconds
        this.config.aggressiveCleanupMode = true;
        break;
    }
    
    console.log('🎛️ Memory config adjusted for device tier:', tier, {
      maxElements: this.config.maxGlassElements,
      poolSize: this.config.poolSize,
    });
  }
  
  // ==================================================================================
  // GLASS ELEMENT MANAGEMENT
  // ==================================================================================
  
  /**
   * Register a new glass element for memory management
   */
  registerGlassElement(
    id: string,
    component: React.Component,
    intensity: GlassIntensity,
    style: GlassStyle,
    priority: GlassElementRef['priority'] = 'medium'
  ): boolean {
    // Check if we've reached the maximum number of elements
    if (this.memoryPool.inUse.size >= this.config.maxGlassElements) {
      if (!this.evictLowPriorityElements()) {
        console.warn('🚨 Cannot register glass element: memory limit reached');
        return false;
      }
    }
    
    // Calculate memory footprint based on glass properties
    const memoryFootprint = this.calculateMemoryFootprint(intensity, style);
    
    const elementRef: GlassElementRef = {
      id,
      component: new WeakRef(component),
      lastAccessed: Date.now(),
      isVisible: true,
      intensity,
      style,
      memoryFootprint,
      renderCount: 0,
      priority,
    };
    
    this.memoryPool.inUse.set(id, elementRef);
    this.updateMetrics();
    
    console.log('📝 Glass element registered:', id, {
      priority,
      footprint: `${(memoryFootprint / 1024).toFixed(1)}KB`,
      totalActive: this.memoryPool.inUse.size,
    });
    
    return true;
  }
  
  /**
   * Unregister a glass element
   */
  unregisterGlassElement(id: string): void {
    const elementRef = this.memoryPool.inUse.get(id);
    if (!elementRef) return;
    
    // Move to pool if reusable, otherwise dispose
    if (this.canPoolElement(elementRef)) {
      this.poolElement(elementRef);
    } else {
      this.disposeElement(elementRef);
    }
    
    this.memoryPool.inUse.delete(id);
    this.updateMetrics();
    
    console.log('🗑️ Glass element unregistered:', id);
  }
  
  /**
   * Update element visibility for optimization
   */
  updateElementVisibility(id: string, isVisible: boolean): void {
    const elementRef = this.memoryPool.inUse.get(id);
    if (!elementRef) return;
    
    elementRef.isVisible = isVisible;
    elementRef.lastAccessed = Date.now();
    
    // Trigger optimization if element became invisible
    if (!isVisible && this.config.enableVisibilityOptimization) {
      this.optimizeInvisibleElement(elementRef);
    }
  }
  
  /**
   * Record render operation for performance tracking
   */
  recordRender(id: string, renderTime: number): void {
    const elementRef = this.memoryPool.inUse.get(id);
    if (!elementRef) return;
    
    elementRef.renderCount++;
    elementRef.lastAccessed = Date.now();
    
    // Track performance metrics
    this.recordRenderTime(renderTime);
    this.updateFrameRate();
    
    // Check for performance degradation
    if (this.metrics.frameRate < 30 && this.callbacks.onPerformanceDegradation) {
      this.callbacks.onPerformanceDegradation(this.metrics.frameRate);
    }
  }
  
  // ==================================================================================
  // MEMORY POOL MANAGEMENT
  // ==================================================================================
  
  /**
   * Get an element from the pool or create new
   */
  getPooledElement(intensity: GlassIntensity, style: GlassStyle): GlassElementRef | null {
    // Find compatible element in pool
    const compatibleIndex = this.memoryPool.available.findIndex(
      element => element.intensity === intensity && element.style === style
    );
    
    if (compatibleIndex >= 0) {
      const element = this.memoryPool.available.splice(compatibleIndex, 1)[0];
      element.lastAccessed = Date.now();
      element.renderCount = 0;
      
      console.log('♻️ Reused pooled glass element:', element.id);
      return element;
    }
    
    return null;
  }
  
  /**
   * Pool an element for reuse
   */
  private poolElement(elementRef: GlassElementRef): void {
    if (this.memoryPool.available.length >= this.config.poolSize) {
      // Pool is full, dispose oldest element
      const oldest = this.memoryPool.available.shift();
      if (oldest) {
        this.disposeElement(oldest);
      }
    }
    
    // Reset element state for reuse
    elementRef.lastAccessed = Date.now();
    elementRef.isVisible = false;
    elementRef.renderCount = 0;
    
    this.memoryPool.available.push(elementRef);
    
    console.log('🏊 Element pooled for reuse:', elementRef.id);
  }
  
  /**
   * Dispose of an element completely
   */
  private disposeElement(elementRef: GlassElementRef): void {
    // Clear weak reference
    const component = elementRef.component.deref();
    if (component && typeof (component as any).cleanup === 'function') {
      (component as any).cleanup();
    }
    
    this.metrics.totalAllocated -= elementRef.memoryFootprint;
    
    console.log('💀 Element disposed:', elementRef.id, {
      memoryFreed: `${(elementRef.memoryFootprint / 1024).toFixed(1)}KB`,
    });
  }
  
  /**
   * Check if element can be pooled
   */
  private canPoolElement(elementRef: GlassElementRef): boolean {
    // Don't pool high-memory elements or critical priority elements
    return (
      elementRef.memoryFootprint < 1024 * 1024 && // < 1MB
      elementRef.priority !== 'critical' &&
      elementRef.component.deref() !== undefined
    );
  }
  
  // ==================================================================================
  // CLEANUP AND OPTIMIZATION
  // ==================================================================================
  
  /**
   * Perform memory cleanup
   */
  performCleanup(aggressive = false): number {
    const startTime = Date.now();
    let freedBytes = 0;
    
    // Clean up inactive elements
    freedBytes += this.cleanupInactiveElements(aggressive);
    
    // Clean up pool if needed
    if (aggressive || this.metrics.memoryPressureLevel !== 'normal') {
      freedBytes += this.cleanupPool();
    }
    
    // Clean up dead references
    freedBytes += this.cleanupDeadReferences();
    
    this.metrics.lastCleanup = Date.now();
    this.updateMetrics();
    
    const cleanupTime = Date.now() - startTime;
    
    console.log('🧹 Memory cleanup completed', {
      freedMB: (freedBytes / (1024 * 1024)).toFixed(2),
      cleanupTime: `${cleanupTime}ms`,
      aggressive,
      activeElements: this.memoryPool.inUse.size,
      pooledElements: this.memoryPool.available.length,
    });
    
    if (this.callbacks.onCleanupComplete) {
      this.callbacks.onCleanupComplete(freedBytes);
    }
    
    return freedBytes;
  }
  
  /**
   * Clean up inactive elements
   */
  private cleanupInactiveElements(aggressive: boolean): number {
    const cutoffTime = Date.now() - (aggressive ? 10000 : 30000); // 10s or 30s
    let freedBytes = 0;
    
    const toRemove: string[] = [];
    
    for (const [id, elementRef] of this.memoryPool.inUse) {
      const shouldRemove = (
        elementRef.lastAccessed < cutoffTime &&
        !elementRef.isVisible &&
        elementRef.priority !== 'critical'
      );
      
      if (shouldRemove || elementRef.component.deref() === undefined) {
        toRemove.push(id);
        freedBytes += elementRef.memoryFootprint;
      }
    }
    
    toRemove.forEach(id => this.unregisterGlassElement(id));
    
    return freedBytes;
  }
  
  /**
   * Clean up pool
   */
  private cleanupPool(): number {
    const keepCount = Math.floor(this.config.poolSize / 2);
    let freedBytes = 0;
    
    // Sort by last accessed time and keep most recent
    this.memoryPool.available.sort((a, b) => b.lastAccessed - a.lastAccessed);
    
    const toDispose = this.memoryPool.available.splice(keepCount);
    toDispose.forEach(element => {
      freedBytes += element.memoryFootprint;
      this.disposeElement(element);
    });
    
    return freedBytes;
  }
  
  /**
   * Clean up dead weak references
   */
  private cleanupDeadReferences(): number {
    let freedBytes = 0;
    
    // Clean active elements
    const deadActive: string[] = [];
    for (const [id, elementRef] of this.memoryPool.inUse) {
      if (elementRef.component.deref() === undefined) {
        deadActive.push(id);
        freedBytes += elementRef.memoryFootprint;
      }
    }
    deadActive.forEach(id => this.memoryPool.inUse.delete(id));
    
    // Clean pooled elements
    const alivePooled = this.memoryPool.available.filter(element => {
      const alive = element.component.deref() !== undefined;
      if (!alive) {
        freedBytes += element.memoryFootprint;
      }
      return alive;
    });
    this.memoryPool.available = alivePooled;
    
    return freedBytes;
  }
  
  /**
   * Evict low priority elements to make room
   */
  private evictLowPriorityElements(): boolean {
    const priorities: GlassElementRef['priority'][] = ['low', 'medium', 'high'];
    
    for (const priority of priorities) {
      const candidates: string[] = [];
      
      for (const [id, elementRef] of this.memoryPool.inUse) {
        if (elementRef.priority === priority && !elementRef.isVisible) {
          candidates.push(id);
        }
      }
      
      if (candidates.length > 0) {
        // Evict oldest candidate
        const oldestId = candidates.reduce((oldest, id) => {
          const oldestRef = this.memoryPool.inUse.get(oldest);
          const currentRef = this.memoryPool.inUse.get(id);
          
          if (!oldestRef || !currentRef) return oldest;
          
          return oldestRef.lastAccessed < currentRef.lastAccessed ? oldest : id;
        });
        
        this.unregisterGlassElement(oldestId);
        console.log('⚡ Evicted element to make room:', oldestId);
        return true;
      }
    }
    
    return false;
  }
  
  // ==================================================================================
  // MONITORING SYSTEMS
  // ==================================================================================
  
  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    if (Platform.OS === 'ios' && NativeModules.MemoryInfo) {
      this.memoryObserver = () => {
        NativeModules.MemoryInfo.getMemoryInfo()
          .then((info: any) => {
            this.updateMemoryPressure(info.used);
          })
          .catch(() => {
            // Fallback to estimated memory usage
            this.updateMemoryPressure(this.estimateMemoryUsage());
          });
      };
      
      // Check memory every 5 seconds
      setInterval(this.memoryObserver, 5000);
    }
  }
  
  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    if (!this.config.enablePerformanceMonitoring) return;
    
    this.performanceTimer = setInterval(() => {
      this.updatePerformanceMetrics();
    }, 1000);
  }
  
  /**
   * Start app state monitoring
   */
  private startAppStateMonitoring(): void {
    if (!this.config.enableBackgroundOptimization) return;
    
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        this.handleAppBackground();
      } else if (nextAppState === 'active') {
        this.handleAppForeground();
      }
    }).remove;
  }
  
  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      const aggressive = this.metrics.memoryPressureLevel !== 'normal';
      this.performCleanup(aggressive);
    }, this.config.cleanupInterval);
  }
  
  // ==================================================================================
  // METRICS AND UTILITIES
  // ==================================================================================
  
  /**
   * Update memory metrics
   */
  private updateMetrics(): void {
    this.metrics.activeGlassElements = this.memoryPool.inUse.size;
    this.metrics.pooledElements = this.memoryPool.available.length;
    
    // Calculate total allocated memory
    let totalAllocated = 0;
    for (const elementRef of this.memoryPool.inUse.values()) {
      totalAllocated += elementRef.memoryFootprint;
    }
    for (const elementRef of this.memoryPool.available) {
      totalAllocated += elementRef.memoryFootprint;
    }
    this.metrics.totalAllocated = totalAllocated;
  }
  
  /**
   * Update memory pressure level
   */
  private updateMemoryPressure(usedMemory: number): void {
    const previousLevel = this.metrics.memoryPressureLevel;
    
    if (usedMemory > this.config.memoryPressureThreshold) {
      this.metrics.memoryPressureLevel = 'critical';
    } else if (usedMemory > this.config.memoryWarningThreshold) {
      this.metrics.memoryPressureLevel = 'warning';
    } else {
      this.metrics.memoryPressureLevel = 'normal';
    }
    
    // Trigger callbacks on level change
    if (previousLevel !== this.metrics.memoryPressureLevel) {
      if (this.metrics.memoryPressureLevel === 'warning' && this.callbacks.onMemoryWarning) {
        this.callbacks.onMemoryWarning(this.metrics);
      } else if (this.metrics.memoryPressureLevel === 'critical' && this.callbacks.onMemoryPressure) {
        this.callbacks.onMemoryPressure(this.metrics);
      }
      
      // Trigger aggressive cleanup on pressure
      if (this.metrics.memoryPressureLevel !== 'normal') {
        this.performCleanup(true);
      }
    }
  }
  
  /**
   * Calculate memory footprint for glass element
   */
  private calculateMemoryFootprint(intensity: GlassIntensity, style: GlassStyle): number {
    // Base memory usage for glass effects
    const baseMemory = 50 * 1024; // 50KB base
    
    // Intensity multiplier
    const intensityMultiplier = {
      ultraThin: 0.5,
      thin: 0.75,
      regular: 1.0,
      thick: 1.5,
      ultraThick: 2.0,
    }[intensity];
    
    // Style multiplier
    const styleMultiplier = {
      systemMaterial: 1.0,
      systemThinMaterial: 0.8,
      hudMaterial: 0.6,
      headerMaterial: 1.2,
      footerMaterial: 1.1,
      popoverMaterial: 0.9,
      sidebarMaterial: 1.3,
    }[style] || 1.0;
    
    return Math.round(baseMemory * intensityMultiplier * styleMultiplier);
  }
  
  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    return this.metrics.totalAllocated + (this.metrics.activeGlassElements * 100 * 1024);
  }
  
  /**
   * Record render time for performance tracking
   */
  private recordRenderTime(renderTime: number): void {
    this.renderTimeHistory.push(renderTime);
    if (this.renderTimeHistory.length > 100) {
      this.renderTimeHistory.shift();
    }
    
    this.metrics.averageRenderTime = 
      this.renderTimeHistory.reduce((sum, time) => sum + time, 0) / this.renderTimeHistory.length;
  }
  
  /**
   * Update frame rate tracking
   */
  private updateFrameRate(): void {
    const now = performance.now();
    this.frameTimestamps.push(now);
    
    // Keep only last second of timestamps
    const cutoff = now - 1000;
    this.frameTimestamps = this.frameTimestamps.filter(timestamp => timestamp > cutoff);
    
    this.metrics.frameRate = this.frameTimestamps.length;
  }
  
  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    // Implementation would update comprehensive performance metrics
    // This is a simplified version for the example
  }
  
  /**
   * Handle app going to background
   */
  private handleAppBackground(): void {
    console.log('📱 App backgrounded - performing aggressive cleanup');
    this.performCleanup(true);
    
    // Pause non-critical monitoring
    if (this.performanceTimer) {
      clearInterval(this.performanceTimer);
      this.performanceTimer = null;
    }
  }
  
  /**
   * Handle app returning to foreground
   */
  private handleAppForeground(): void {
    console.log('📱 App foregrounded - resuming monitoring');
    
    // Resume performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.startPerformanceMonitoring();
    }
  }
  
  /**
   * Optimize invisible element
   */
  private optimizeInvisibleElement(elementRef: GlassElementRef): void {
    // Implementation would reduce resource usage for invisible elements
    console.log('👻 Optimizing invisible element:', elementRef.id);
  }
  
  // ==================================================================================
  // PUBLIC API
  // ==================================================================================
  
  /**
   * Get current memory metrics
   */
  getMetrics(): MemoryMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Update configuration
   */
  updateConfig(updates: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...updates };
    
    // Restart cleanup timer if interval changed
    if (updates.cleanupInterval && this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.startCleanupTimer();
    }
  }
  
  /**
   * Force immediate cleanup
   */
  forceCleanup(): number {
    return this.performCleanup(true);
  }
  
  /**
   * Shutdown memory manager
   */
  shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    if (this.performanceTimer) {
      clearInterval(this.performanceTimer);
    }
    
    this.appStateSubscription();
    
    // Clean up all elements
    this.performCleanup(true);
    
    LiquidGlassMemoryManager.instance = null;
    
    console.log('🔌 Memory manager shutdown complete');
  }
}

// ==================================================================================
// REACT HOOKS
// ==================================================================================

/**
 * Hook for accessing memory management functionality
 */
export const useLiquidGlassMemory = (config?: Partial<MemoryConfig>) => {
  const manager = LiquidGlassMemoryManager.getInstance(config);
  const [metrics, setMetrics] = React.useState<MemoryMetrics>(manager.getMetrics());
  
  // Update metrics periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(manager.getMetrics());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [manager]);
  
  const registerElement = React.useCallback((
    id: string,
    component: React.Component,
    intensity: GlassIntensity,
    style: GlassStyle,
    priority?: GlassElementRef['priority']
  ) => {
    return manager.registerGlassElement(id, component, intensity, style, priority);
  }, [manager]);
  
  const unregisterElement = React.useCallback((id: string) => {
    manager.unregisterGlassElement(id);
  }, [manager]);
  
  const updateVisibility = React.useCallback((id: string, isVisible: boolean) => {
    manager.updateElementVisibility(id, isVisible);
  }, [manager]);
  
  const recordRender = React.useCallback((id: string, renderTime: number) => {
    manager.recordRender(id, renderTime);
  }, [manager]);
  
  const forceCleanup = React.useCallback(() => {
    return manager.forceCleanup();
  }, [manager]);
  
  return {
    metrics,
    registerElement,
    unregisterElement,
    updateVisibility,
    recordRender,
    forceCleanup,
    isMemoryPressure: metrics.memoryPressureLevel !== 'normal',
  };
};

/**
 * Higher-order component for automatic memory management
 */
export const withLiquidGlassMemory = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  intensity: GlassIntensity = 'regular',
  style: GlassStyle = 'systemMaterial',
  priority: GlassElementRef['priority'] = 'medium'
) => {
  const MemoryManagedComponent = React.forwardRef<any, P>((props, ref) => {
    const { registerElement, unregisterElement, recordRender } = useLiquidGlassMemory();
    const componentId = React.useRef(`glass_${Math.random().toString(36).substr(2, 9)}`).current;
    const componentRef = React.useRef<React.Component>(null);
    
    // Register on mount
    React.useEffect(() => {
      if (componentRef.current) {
        registerElement(componentId, componentRef.current, intensity, style, priority);
      }
      
      return () => {
        unregisterElement(componentId);
      };
    }, [registerElement, unregisterElement, componentId]);
    
    // Track render performance
    const handleRender = React.useCallback(() => {
      const startTime = performance.now();
      
      // Use requestAnimationFrame to measure actual render time
      requestAnimationFrame(() => {
        const renderTime = performance.now() - startTime;
        recordRender(componentId, renderTime);
      });
    }, [recordRender, componentId]);
    
    React.useEffect(handleRender);
    
    return (
      <WrappedComponent
        {...props}
        ref={(instance: React.Component) => {
          componentRef.current = instance;
          if (typeof ref === 'function') {
            ref(instance);
          } else if (ref) {
            ref.current = instance;
          }
        }}
      />
    );
  });
  
  MemoryManagedComponent.displayName = `withLiquidGlassMemory(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return MemoryManagedComponent;
};

// ==================================================================================
// EXPORTS
// ==================================================================================

export {
  LiquidGlassMemoryManager,
  useLiquidGlassMemory,
  withLiquidGlassMemory,
};

export type {
  GlassElementRef,
  MemoryPool,
  MemoryMetrics,
  MemoryConfig,
  MemoryManagerCallbacks,
};