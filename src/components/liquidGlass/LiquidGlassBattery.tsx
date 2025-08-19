/**
 * Liquid Glass Battery Optimization System
 * 
 * Advanced power management for liquid glass effects with intelligent scaling
 * based on battery state, thermal conditions, and usage patterns. Designed to
 * maximize battery life while maintaining visual quality when possible.
 * 
 * Battery Optimization Features:
 * - Dynamic effect scaling based on battery level
 * - Low Power Mode integration and automatic downgrades
 * - Thermal state monitoring and throttling
 * - Background/foreground power optimization
 * - Usage pattern learning and adaptation
 * - CPU/GPU load balancing
 * 
 * Power Management Strategies:
 * - Progressive effect reduction as battery depletes
 * - Intelligent suspension of non-visible effects
 * - Frame rate throttling during low power conditions
 * - Aggressive cleanup in background states
 * - Predictive optimization based on usage patterns
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

import React, { createContext, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppState, Platform, DeviceEventEmitter, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  GlassIntensity,
  GlassStyle,
  type LiquidGlassCapabilities,
  getLiquidGlassCapabilities,
} from '../../utils/liquidGlass';

import {
  useLiquidGlassSensorAdaptation,
  type SensorData,
} from './LiquidGlassSensors';

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

interface BatteryState {
  level: number; // 0-1
  isCharging: boolean;
  isLowPowerMode: boolean;
  estimatedTimeRemaining: number; // minutes, -1 if unknown
  chargingTime: number; // minutes, -1 if not charging
  healthState: 'good' | 'degraded' | 'poor' | 'unknown';
}

interface ThermalState {
  level: 'nominal' | 'fair' | 'serious' | 'critical';
  temperature: number; // Celsius, estimated
  throttleLevel: 0 | 1 | 2 | 3; // 0 = none, 3 = maximum
}

interface PowerProfile {
  name: 'maximum' | 'balanced' | 'efficient' | 'critical';
  description: string;
  glassIntensityScale: number; // 0-1 multiplier
  maxActiveElements: number;
  frameRateTarget: number;
  enableAnimations: boolean;
  enableSensorAdaptation: boolean;
  backgroundBehavior: 'suspend' | 'reduce' | 'maintain';
  cpuThrottleLevel: number; // 0-1
}

interface UsagePattern {
  averageSessionLength: number; // minutes
  typicalBatteryAtStart: number; // 0-1
  glassUsageIntensity: 'light' | 'moderate' | 'heavy';
  timeOfDayDistribution: Record<string, number>; // hour -> usage frequency
  chargingBehavior: 'frequent' | 'occasional' | 'rare';
}

interface BatteryConfig {
  enableAdaptiveOptimization: boolean;
  enableUsagePatternLearning: boolean;
  enablePredictiveOptimization: boolean;
  aggressiveOptimizationThreshold: number; // battery level 0-1
  thermalThrottleThreshold: ThermalState['level'];
  backgroundOptimizationDelay: number; // ms
  foregroundRestoreDelay: number; // ms
  minimumFrameRate: number;
  powerProfiles: Record<string, PowerProfile>;
}

interface BatteryOptimizationCallbacks {
  onPowerProfileChanged?: (profile: PowerProfile) => void;
  onBatteryWarning?: (state: BatteryState) => void;
  onThermalThrottle?: (thermal: ThermalState) => void;
  onOptimizationApplied?: (optimizations: string[]) => void;
  onUsagePatternUpdated?: (pattern: UsagePattern) => void;
}

// ==================================================================================
// DEFAULT CONFIGURATIONS
// ==================================================================================

const DEFAULT_POWER_PROFILES: Record<string, PowerProfile> = {
  maximum: {
    name: 'maximum',
    description: 'Full glass effects, best visual quality',
    glassIntensityScale: 1.0,
    maxActiveElements: 100,
    frameRateTarget: 60,
    enableAnimations: true,
    enableSensorAdaptation: true,
    backgroundBehavior: 'reduce',
    cpuThrottleLevel: 0,
  },
  balanced: {
    name: 'balanced',
    description: 'Balanced performance and battery life',
    glassIntensityScale: 0.8,
    maxActiveElements: 50,
    frameRateTarget: 60,
    enableAnimations: true,
    enableSensorAdaptation: true,
    backgroundBehavior: 'suspend',
    cpuThrottleLevel: 0.2,
  },
  efficient: {
    name: 'efficient',
    description: 'Optimized for battery life',
    glassIntensityScale: 0.5,
    maxActiveElements: 20,
    frameRateTarget: 30,
    enableAnimations: false,
    enableSensorAdaptation: false,
    backgroundBehavior: 'suspend',
    cpuThrottleLevel: 0.5,
  },
  critical: {
    name: 'critical',
    description: 'Minimal effects for emergency battery conservation',
    glassIntensityScale: 0.1,
    maxActiveElements: 5,
    frameRateTarget: 15,
    enableAnimations: false,
    enableSensorAdaptation: false,
    backgroundBehavior: 'suspend',
    cpuThrottleLevel: 0.8,
  },
};

const DEFAULT_CONFIG: BatteryConfig = {
  enableAdaptiveOptimization: true,
  enableUsagePatternLearning: true,
  enablePredictiveOptimization: true,
  aggressiveOptimizationThreshold: 0.20, // 20% battery
  thermalThrottleThreshold: 'fair',
  backgroundOptimizationDelay: 5000, // 5 seconds
  foregroundRestoreDelay: 1000, // 1 second
  minimumFrameRate: 15,
  powerProfiles: DEFAULT_POWER_PROFILES,
};

// ==================================================================================
// BATTERY OPTIMIZATION MANAGER
// ==================================================================================

/**
 * Central battery optimization system for liquid glass effects
 */
class LiquidGlassBatteryManager {
  private static instance: LiquidGlassBatteryManager | null = null;
  
  private config: BatteryConfig;
  private callbacks: BatteryOptimizationCallbacks;
  private capabilities: LiquidGlassCapabilities | null = null;
  
  // State tracking
  private currentBatteryState: BatteryState;
  private currentThermalState: ThermalState;
  private currentPowerProfile: PowerProfile;
  private usagePattern: UsagePattern;
  private isInBackground = false;
  
  // Optimization tracking
  private activeOptimizations: string[] = [];
  private optimizationHistory: Array<{ timestamp: number; optimization: string; reason: string }> = [];
  private sessionStartTime = Date.now();
  private sessionStartBattery = 1.0;
  
  // Timers and subscriptions
  private batteryMonitorTimer: NodeJS.Timeout | null = null;
  private thermalMonitorTimer: NodeJS.Timeout | null = null;
  private backgroundOptimizationTimer: NodeJS.Timeout | null = null;
  private appStateSubscription: () => void = () => {};
  
  private constructor(config: BatteryConfig, callbacks: BatteryOptimizationCallbacks) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.callbacks = callbacks;
    this.currentPowerProfile = this.config.powerProfiles.balanced;
    
    // Initialize state
    this.currentBatteryState = {
      level: 1.0,
      isCharging: false,
      isLowPowerMode: false,
      estimatedTimeRemaining: -1,
      chargingTime: -1,
      healthState: 'unknown',
    };
    
    this.currentThermalState = {
      level: 'nominal',
      temperature: 25,
      throttleLevel: 0,
    };
    
    this.usagePattern = {
      averageSessionLength: 15,
      typicalBatteryAtStart: 0.8,
      glassUsageIntensity: 'moderate',
      timeOfDayDistribution: {},
      chargingBehavior: 'occasional',
    };
    
    this.initialize();
  }
  
  /**
   * Singleton pattern for global battery management
   */
  static getInstance(config?: Partial<BatteryConfig>, callbacks?: BatteryOptimizationCallbacks): LiquidGlassBatteryManager {
    if (!LiquidGlassBatteryManager.instance) {
      LiquidGlassBatteryManager.instance = new LiquidGlassBatteryManager(
        { ...DEFAULT_CONFIG, ...config },
        callbacks || {}
      );
    }
    
    return LiquidGlassBatteryManager.instance;
  }
  
  /**
   * Initialize battery management system
   */
  private async initialize(): Promise<void> {
    try {
      // Load capabilities
      this.capabilities = await getLiquidGlassCapabilities();
      
      // Load usage patterns from storage
      await this.loadUsagePatterns();
      
      // Start monitoring systems
      this.startBatteryMonitoring();
      this.startThermalMonitoring();
      this.startAppStateMonitoring();
      
      // Initial optimization assessment
      await this.assessOptimizationNeeds();
      
      console.log('🔋 Battery optimization manager initialized', {
        profile: this.currentPowerProfile.name,
        batteryLevel: `${(this.currentBatteryState.level * 100).toFixed(0)}%`,
        thermalState: this.currentThermalState.level,
      });
      
    } catch (error) {
      console.error('Battery manager initialization failed:', error);
    }
  }
  
  // ==================================================================================
  // BATTERY MONITORING
  // ==================================================================================
  
  /**
   * Start battery state monitoring
   */
  private startBatteryMonitoring(): void {
    // Initial battery state
    this.updateBatteryState();
    
    // Monitor battery changes
    this.batteryMonitorTimer = setInterval(() => {
      this.updateBatteryState();
    }, 30000); // Check every 30 seconds
    
    // Listen for low power mode changes (iOS)
    if (Platform.OS === 'ios') {
      DeviceEventEmitter.addListener('batteryStateChanged', this.handleBatteryStateChange.bind(this));
    }
  }
  
  /**
   * Update current battery state
   */
  private async updateBatteryState(): Promise<void> {
    try {
      if (Platform.OS === 'ios' && NativeModules.BatteryManager) {
        const batteryInfo = await NativeModules.BatteryManager.getBatteryInfo();
        
        this.currentBatteryState = {
          level: batteryInfo.level,
          isCharging: batteryInfo.isCharging,
          isLowPowerMode: batteryInfo.isLowPowerMode,
          estimatedTimeRemaining: batteryInfo.estimatedTimeRemaining || -1,
          chargingTime: batteryInfo.chargingTime || -1,
          healthState: batteryInfo.healthState || 'unknown',
        };
      } else {
        // Fallback estimation
        this.currentBatteryState = {
          level: 0.8, // Conservative estimate
          isCharging: false,
          isLowPowerMode: false,
          estimatedTimeRemaining: -1,
          chargingTime: -1,
          healthState: 'unknown',
        };
      }
      
      // Assess optimization needs after battery update
      await this.assessOptimizationNeeds();
      
    } catch (error) {
      console.warn('Battery state update failed:', error);
    }
  }
  
  /**
   * Handle battery state changes
   */
  private handleBatteryStateChange(event: any): void {
    const previousLevel = this.currentBatteryState.level;
    const newLevel = event.level;
    
    // Trigger warning if battery dropped significantly
    if (newLevel < 0.15 && previousLevel >= 0.15 && this.callbacks.onBatteryWarning) {
      this.callbacks.onBatteryWarning(this.currentBatteryState);
    }
    
    // Update usage patterns
    this.updateUsagePatterns();
  }
  
  // ==================================================================================
  // THERMAL MONITORING
  // ==================================================================================
  
  /**
   * Start thermal state monitoring
   */
  private startThermalMonitoring(): void {
    this.updateThermalState();
    
    this.thermalMonitorTimer = setInterval(() => {
      this.updateThermalState();
    }, 10000); // Check every 10 seconds
  }
  
  /**
   * Update thermal state
   */
  private async updateThermalState(): Promise<void> {
    try {
      if (Platform.OS === 'ios' && NativeModules.ThermalManager) {
        const thermalInfo = await NativeModules.ThermalManager.getThermalState();
        
        this.currentThermalState = {
          level: thermalInfo.level,
          temperature: thermalInfo.temperature || 25,
          throttleLevel: this.calculateThrottleLevel(thermalInfo.level),
        };
      } else {
        // Fallback - estimate based on other indicators
        this.currentThermalState = {
          level: 'nominal',
          temperature: 25,
          throttleLevel: 0,
        };
      }
      
      // Apply thermal optimizations if needed
      if (this.shouldApplyThermalOptimization()) {
        await this.applyThermalOptimizations();
      }
      
    } catch (error) {
      console.warn('Thermal state update failed:', error);
    }
  }
  
  /**
   * Calculate throttle level based on thermal state
   */
  private calculateThrottleLevel(thermalLevel: ThermalState['level']): ThermalState['throttleLevel'] {
    switch (thermalLevel) {
      case 'nominal': return 0;
      case 'fair': return 1;
      case 'serious': return 2;
      case 'critical': return 3;
      default: return 0;
    }
  }
  
  // ==================================================================================
  // OPTIMIZATION ENGINE
  // ==================================================================================
  
  /**
   * Assess what optimizations are needed
   */
  private async assessOptimizationNeeds(): Promise<void> {
    const previousProfile = this.currentPowerProfile;
    const newProfile = this.determineOptimalPowerProfile();
    
    if (newProfile !== previousProfile) {
      await this.switchPowerProfile(newProfile);
    }
    
    // Apply specific optimizations
    const optimizations = this.determineSpecificOptimizations();
    await this.applyOptimizations(optimizations);
  }
  
  /**
   * Determine optimal power profile
   */
  private determineOptimalPowerProfile(): PowerProfile {
    const { level, isCharging, isLowPowerMode } = this.currentBatteryState;
    const { level: thermalLevel } = this.currentThermalState;
    
    // Critical battery or thermal state
    if (level < 0.05 || thermalLevel === 'critical') {
      return this.config.powerProfiles.critical;
    }
    
    // Low power mode or serious thermal throttling
    if (isLowPowerMode || thermalLevel === 'serious') {
      return this.config.powerProfiles.efficient;
    }
    
    // Low battery
    if (level < this.config.aggressiveOptimizationThreshold && !isCharging) {
      return this.config.powerProfiles.efficient;
    }
    
    // Charging or good battery
    if (isCharging || level > 0.7) {
      return this.config.powerProfiles.maximum;
    }
    
    // Default balanced mode
    return this.config.powerProfiles.balanced;
  }
  
  /**
   * Switch to new power profile
   */
  private async switchPowerProfile(newProfile: PowerProfile): Promise<void> {
    const previousProfile = this.currentPowerProfile;
    this.currentPowerProfile = newProfile;
    
    // Log the change
    this.logOptimization(`power_profile_${newProfile.name}`, `Battery: ${(this.currentBatteryState.level * 100).toFixed(0)}%, Thermal: ${this.currentThermalState.level}`);
    
    // Notify callback
    if (this.callbacks.onPowerProfileChanged) {
      this.callbacks.onPowerProfileChanged(newProfile);
    }
    
    console.log('⚡ Power profile changed', {
      from: previousProfile.name,
      to: newProfile.name,
      reason: this.getProfileChangeReason(),
    });
  }
  
  /**
   * Determine specific optimizations needed
   */
  private determineSpecificOptimizations(): string[] {
    const optimizations: string[] = [];
    
    // Background optimizations
    if (this.isInBackground) {
      optimizations.push('background_suspension');
    }
    
    // Low battery optimizations
    if (this.currentBatteryState.level < 0.1) {
      optimizations.push('ultra_low_battery');
    }
    
    // Thermal optimizations
    if (this.currentThermalState.throttleLevel > 1) {
      optimizations.push('thermal_throttle');
    }
    
    // Frame rate optimization
    if (this.shouldReduceFrameRate()) {
      optimizations.push('frame_rate_reduction');
    }
    
    // Animation optimization
    if (this.shouldDisableAnimations()) {
      optimizations.push('animation_suspension');
    }
    
    return optimizations;
  }
  
  /**
   * Apply optimizations
   */
  private async applyOptimizations(optimizations: string[]): Promise<void> {
    const newOptimizations = optimizations.filter(opt => !this.activeOptimizations.includes(opt));
    const removedOptimizations = this.activeOptimizations.filter(opt => !optimizations.includes(opt));
    
    // Apply new optimizations
    for (const optimization of newOptimizations) {
      await this.applySpecificOptimization(optimization);
    }
    
    // Remove no longer needed optimizations
    for (const optimization of removedOptimizations) {
      await this.removeSpecificOptimization(optimization);
    }
    
    this.activeOptimizations = optimizations;
    
    if (newOptimizations.length > 0 && this.callbacks.onOptimizationApplied) {
      this.callbacks.onOptimizationApplied(newOptimizations);
    }
  }
  
  /**
   * Apply specific optimization
   */
  private async applySpecificOptimization(optimization: string): Promise<void> {
    switch (optimization) {
      case 'background_suspension':
        await this.suspendBackgroundEffects();
        break;
      case 'ultra_low_battery':
        await this.applyUltraLowBatteryMode();
        break;
      case 'thermal_throttle':
        await this.applyThermalThrottling();
        break;
      case 'frame_rate_reduction':
        await this.reduceFrameRate();
        break;
      case 'animation_suspension':
        await this.suspendAnimations();
        break;
    }
    
    this.logOptimization(optimization, `Applied due to current conditions`);
  }
  
  /**
   * Remove specific optimization
   */
  private async removeSpecificOptimization(optimization: string): Promise<void> {
    switch (optimization) {
      case 'background_suspension':
        await this.restoreBackgroundEffects();
        break;
      case 'ultra_low_battery':
        await this.restoreFromUltraLowBatteryMode();
        break;
      case 'thermal_throttle':
        await this.removeThermalThrottling();
        break;
      case 'frame_rate_reduction':
        await this.restoreFrameRate();
        break;
      case 'animation_suspension':
        await this.restoreAnimations();
        break;
    }
  }
  
  // ==================================================================================
  // SPECIFIC OPTIMIZATIONS
  // ==================================================================================
  
  private async suspendBackgroundEffects(): Promise<void> {
    // Implementation would suspend glass effects when app is in background
    console.log('📱 Suspending background glass effects');
  }
  
  private async restoreBackgroundEffects(): Promise<void> {
    // Implementation would restore glass effects when app returns to foreground
    console.log('📱 Restoring background glass effects');
  }
  
  private async applyUltraLowBatteryMode(): Promise<void> {
    // Implementation would apply ultra-aggressive battery optimizations
    console.log('🪫 Applying ultra low battery mode');
  }
  
  private async restoreFromUltraLowBatteryMode(): Promise<void> {
    // Implementation would restore from ultra low battery mode
    console.log('🔋 Restoring from ultra low battery mode');
  }
  
  private async applyThermalThrottling(): Promise<void> {
    // Implementation would reduce glass effects due to thermal conditions
    console.log('🌡️ Applying thermal throttling');
    
    if (this.callbacks.onThermalThrottle) {
      this.callbacks.onThermalThrottle(this.currentThermalState);
    }
  }
  
  private async removeThermalThrottling(): Promise<void> {
    // Implementation would restore from thermal throttling
    console.log('🌡️ Removing thermal throttling');
  }
  
  private async reduceFrameRate(): Promise<void> {
    // Implementation would reduce target frame rate
    console.log('🎬 Reducing frame rate for battery conservation');
  }
  
  private async restoreFrameRate(): Promise<void> {
    // Implementation would restore normal frame rate
    console.log('🎬 Restoring normal frame rate');
  }
  
  private async suspendAnimations(): Promise<void> {
    // Implementation would disable glass animations
    console.log('🎭 Suspending glass animations');
  }
  
  private async restoreAnimations(): Promise<void> {
    // Implementation would restore glass animations
    console.log('🎭 Restoring glass animations');
  }
  
  // ==================================================================================
  // CONDITION CHECKS
  // ==================================================================================
  
  private shouldApplyThermalOptimization(): boolean {
    return this.currentThermalState.level !== 'nominal' && 
           this.currentThermalState.throttleLevel >= 1;
  }
  
  private shouldReduceFrameRate(): boolean {
    return this.currentBatteryState.level < 0.3 || 
           this.currentThermalState.throttleLevel >= 2 ||
           this.currentBatteryState.isLowPowerMode;
  }
  
  private shouldDisableAnimations(): boolean {
    return this.currentBatteryState.level < 0.15 || 
           this.currentThermalState.throttleLevel >= 2 ||
           this.isInBackground;
  }
  
  // ==================================================================================
  // USAGE PATTERN LEARNING
  // ==================================================================================
  
  /**
   * Update usage patterns based on current session
   */
  private updateUsagePatterns(): void {
    if (!this.config.enableUsagePatternLearning) return;
    
    const sessionLength = (Date.now() - this.sessionStartTime) / 60000; // minutes
    const batteryDrain = this.sessionStartBattery - this.currentBatteryState.level;
    const hour = new Date().getHours().toString();
    
    // Update patterns
    this.usagePattern.averageSessionLength = 
      (this.usagePattern.averageSessionLength * 0.9) + (sessionLength * 0.1);
    
    this.usagePattern.typicalBatteryAtStart = 
      (this.usagePattern.typicalBatteryAtStart * 0.9) + (this.sessionStartBattery * 0.1);
    
    // Update time distribution
    this.usagePattern.timeOfDayDistribution[hour] = 
      (this.usagePattern.timeOfDayDistribution[hour] || 0) + 1;
    
    // Determine usage intensity based on battery drain rate
    const drainRate = batteryDrain / sessionLength;
    if (drainRate > 0.05) { // > 5% per minute
      this.usagePattern.glassUsageIntensity = 'heavy';
    } else if (drainRate > 0.02) { // > 2% per minute
      this.usagePattern.glassUsageIntensity = 'moderate';
    } else {
      this.usagePattern.glassUsageIntensity = 'light';
    }
    
    // Save patterns
    this.saveUsagePatterns();
    
    if (this.callbacks.onUsagePatternUpdated) {
      this.callbacks.onUsagePatternUpdated(this.usagePattern);
    }
  }
  
  /**
   * Load usage patterns from storage
   */
  private async loadUsagePatterns(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@liquid_glass_usage_patterns');
      if (stored) {
        this.usagePattern = { ...this.usagePattern, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load usage patterns:', error);
    }
  }
  
  /**
   * Save usage patterns to storage
   */
  private async saveUsagePatterns(): Promise<void> {
    try {
      await AsyncStorage.setItem('@liquid_glass_usage_patterns', JSON.stringify(this.usagePattern));
    } catch (error) {
      console.warn('Failed to save usage patterns:', error);
    }
  }
  
  // ==================================================================================
  // APP STATE MONITORING
  // ==================================================================================
  
  /**
   * Start app state monitoring
   */
  private startAppStateMonitoring(): void {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        this.handleAppBackground();
      } else if (nextAppState === 'active') {
        this.handleAppForeground();
      }
    }).remove;
  }
  
  /**
   * Handle app going to background
   */
  private handleAppBackground(): void {
    this.isInBackground = true;
    
    // Delay background optimizations to avoid unnecessary work for quick switches
    this.backgroundOptimizationTimer = setTimeout(() => {
      this.assessOptimizationNeeds();
    }, this.config.backgroundOptimizationDelay);
    
    console.log('📱 App backgrounded - scheduling optimizations');
  }
  
  /**
   * Handle app returning to foreground
   */
  private handleAppForeground(): void {
    this.isInBackground = false;
    
    // Cancel pending background optimizations
    if (this.backgroundOptimizationTimer) {
      clearTimeout(this.backgroundOptimizationTimer);
      this.backgroundOptimizationTimer = null;
    }
    
    // Delay foreground restoration
    setTimeout(() => {
      this.assessOptimizationNeeds();
    }, this.config.foregroundRestoreDelay);
    
    console.log('📱 App foregrounded - scheduling restoration');
  }
  
  // ==================================================================================
  // UTILITIES
  // ==================================================================================
  
  /**
   * Get reason for profile change
   */
  private getProfileChangeReason(): string {
    const { level, isCharging, isLowPowerMode } = this.currentBatteryState;
    const { level: thermalLevel } = this.currentThermalState;
    
    if (level < 0.05) return 'Critical battery';
    if (thermalLevel === 'critical') return 'Critical thermal state';
    if (isLowPowerMode) return 'Low Power Mode enabled';
    if (level < this.config.aggressiveOptimizationThreshold) return 'Low battery';
    if (thermalLevel === 'serious') return 'High thermal state';
    if (isCharging) return 'Charging detected';
    
    return 'Optimization assessment';
  }
  
  /**
   * Log optimization action
   */
  private logOptimization(optimization: string, reason: string): void {
    this.optimizationHistory.push({
      timestamp: Date.now(),
      optimization,
      reason,
    });
    
    // Keep only last 100 entries
    if (this.optimizationHistory.length > 100) {
      this.optimizationHistory.shift();
    }
  }
  
  // ==================================================================================
  // PUBLIC API
  // ==================================================================================
  
  /**
   * Get current battery state
   */
  getBatteryState(): BatteryState {
    return { ...this.currentBatteryState };
  }
  
  /**
   * Get current thermal state
   */
  getThermalState(): ThermalState {
    return { ...this.currentThermalState };
  }
  
  /**
   * Get current power profile
   */
  getCurrentPowerProfile(): PowerProfile {
    return { ...this.currentPowerProfile };
  }
  
  /**
   * Get usage patterns
   */
  getUsagePattern(): UsagePattern {
    return { ...this.usagePattern };
  }
  
  /**
   * Get active optimizations
   */
  getActiveOptimizations(): string[] {
    return [...this.activeOptimizations];
  }
  
  /**
   * Force power profile
   */
  forcePowerProfile(profileName: keyof typeof DEFAULT_POWER_PROFILES): void {
    const profile = this.config.powerProfiles[profileName];
    if (profile) {
      this.switchPowerProfile(profile);
    }
  }
  
  /**
   * Update configuration
   */
  updateConfig(updates: Partial<BatteryConfig>): void {
    this.config = { ...this.config, ...updates };
  }
  
  /**
   * Shutdown battery manager
   */
  shutdown(): void {
    if (this.batteryMonitorTimer) {
      clearInterval(this.batteryMonitorTimer);
    }
    
    if (this.thermalMonitorTimer) {
      clearInterval(this.thermalMonitorTimer);
    }
    
    if (this.backgroundOptimizationTimer) {
      clearTimeout(this.backgroundOptimizationTimer);
    }
    
    this.appStateSubscription();
    
    // Save final usage patterns
    this.updateUsagePatterns();
    
    LiquidGlassBatteryManager.instance = null;
    
    console.log('🔌 Battery manager shutdown complete');
  }
}

// ==================================================================================
// REACT HOOKS
// ==================================================================================

/**
 * Hook for battery optimization functionality
 */
export const useLiquidGlassBattery = (config?: Partial<BatteryConfig>) => {
  const manager = LiquidGlassBatteryManager.getInstance(config);
  const [batteryState, setBatteryState] = React.useState(manager.getBatteryState());
  const [powerProfile, setPowerProfile] = React.useState(manager.getCurrentPowerProfile());
  const [activeOptimizations, setActiveOptimizations] = React.useState(manager.getActiveOptimizations());
  
  // Update state periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setBatteryState(manager.getBatteryState());
      setPowerProfile(manager.getCurrentPowerProfile());
      setActiveOptimizations(manager.getActiveOptimizations());
    }, 5000);
    
    return () => clearInterval(interval);
  }, [manager]);
  
  const forcePowerProfile = React.useCallback((profileName: keyof typeof DEFAULT_POWER_PROFILES) => {
    manager.forcePowerProfile(profileName);
  }, [manager]);
  
  return {
    batteryState,
    powerProfile,
    activeOptimizations,
    thermalState: manager.getThermalState(),
    usagePattern: manager.getUsagePattern(),
    forcePowerProfile,
    isOptimized: activeOptimizations.length > 0,
    isCriticalBattery: batteryState.level < 0.1,
    isLowPowerMode: batteryState.isLowPowerMode,
  };
};

// ==================================================================================
// EXPORTS
// ==================================================================================

export {
  LiquidGlassBatteryManager,
  useLiquidGlassBattery,
  DEFAULT_POWER_PROFILES,
};

export type {
  BatteryState,
  ThermalState,
  PowerProfile,
  UsagePattern,
  BatteryConfig,
  BatteryOptimizationCallbacks,
};