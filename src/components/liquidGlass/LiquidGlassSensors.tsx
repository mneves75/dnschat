/**
 * Liquid Glass Sensor-Aware Adaptations
 *
 * Advanced iOS 26 sensor integration for environmental context awareness.
 * Adapts glass effects based on ambient light, device motion, thermal state,
 * and user interaction patterns following Apple's sensor frameworks.
 *
 * Features:
 * - Ambient light adaptation using AVCaptureDevice.lightSensor
 * - Motion-aware glass intensity with CoreMotion integration
 * - Thermal state monitoring for performance scaling
 * - Proximity sensor integration for auto-dimming
 * - Accelerometer-based motion detection
 * - Battery-aware optimization modes
 *
 * Sensor Integration:
 * - CoreMotion: Device motion and orientation detection
 * - AVFoundation: Ambient light sensor readings
 * - ProcessInfo: Thermal state monitoring
 * - UIDevice: Battery state and proximity sensor
 *
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Platform,
  NativeModules,
  NativeEventEmitter,
  DeviceEventEmitter,
  AppState,
  Dimensions,
} from "react-native";

import {
  LiquidGlassCapabilities,
  GlassIntensity,
  EnvironmentalContext,
  getLiquidGlassCapabilities,
} from "../../utils/liquidGlass";

// ==================================================================================
// NATIVE SENSOR INTERFACES
// ==================================================================================

/**
 * Native sensor module interface for iOS 26+ sensor access
 */
interface LiquidGlassSensorModule {
  // Ambient Light Sensor
  startAmbientLightMonitoring(): Promise<void>;
  stopAmbientLightMonitoring(): Promise<void>;
  getCurrentAmbientLight(): Promise<number>; // lux

  // Motion Sensors
  startMotionMonitoring(): Promise<void>;
  stopMotionMonitoring(): Promise<void>;
  getCurrentMotionState(): Promise<{
    isStationary: boolean;
    acceleration: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    orientation: "portrait" | "landscape" | "unknown";
  }>;

  // Thermal Monitoring
  getThermalState(): Promise<"nominal" | "fair" | "serious" | "critical">;

  // Proximity Sensor
  startProximityMonitoring(): Promise<void>;
  stopProximityMonitoring(): Promise<void>;
  isProximityNear(): Promise<boolean>;

  // Battery Monitoring
  getBatteryState(): Promise<{
    level: number; // 0-1
    state: "unknown" | "unplugged" | "charging" | "full";
    lowPowerMode: boolean;
  }>;
}

// Get sensor module with availability check
const SensorModule =
  Platform.OS === "ios"
    ? (NativeModules.LiquidGlassSensorModule as
        | LiquidGlassSensorModule
        | undefined)
    : undefined;

// Event emitter for sensor updates
const sensorEmitter =
  Platform.OS === "ios" && SensorModule
    ? new NativeEventEmitter(NativeModules.LiquidGlassSensorModule)
    : null;

// ==================================================================================
// TYPE DEFINITIONS
// ==================================================================================

interface SensorData {
  ambientLight: number; // lux (0-100000)
  motionState: "stationary" | "walking" | "moving" | "shaking";
  deviceOrientation: "portrait" | "landscape" | "unknown";
  thermalState: "nominal" | "fair" | "serious" | "critical";
  proximityNear: boolean;
  batteryLevel: number; // 0-1
  lowPowerMode: boolean;
  timestamp: Date;
}

interface AdaptationConfig {
  enableAmbientLightAdaptation: boolean;
  enableMotionAdaptation: boolean;
  enableThermalAdaptation: boolean;
  enableProximityAdaptation: boolean;
  enableBatteryOptimization: boolean;
  adaptationSensitivity: "low" | "medium" | "high";
  updateInterval: number; // ms
}

interface SensorCallbacks {
  onSensorUpdate?: (data: SensorData) => void;
  onAdaptationChange?: (intensity: GlassIntensity, reason: string) => void;
  onPerformanceMode?: (
    mode: "quality" | "balanced" | "performance" | "battery",
  ) => void;
  onError?: (error: string) => void;
}

// ==================================================================================
// SENSOR MANAGER CLASS
// ==================================================================================

/**
 * Central sensor management for liquid glass adaptations
 * Following Apple's sensor best practices and power management
 */
class LiquidGlassSensorManager {
  private isMonitoring = false;
  private currentData: SensorData | null = null;
  private config: AdaptationConfig;
  private callbacks: SensorCallbacks;
  private updateTimer: NodeJS.Timeout | null = null;
  private listeners: Array<() => void> = [];

  constructor(config: AdaptationConfig, callbacks: SensorCallbacks) {
    this.config = config;
    this.callbacks = callbacks;

    // Initialize with default sensor data
    this.currentData = {
      ambientLight: 1000, // default indoor lighting
      motionState: "stationary",
      deviceOrientation: "portrait",
      thermalState: "nominal",
      proximityNear: false,
      batteryLevel: 1,
      lowPowerMode: false,
      timestamp: new Date(),
    };
  }

  /**
   * Start sensor monitoring with iOS 26+ native integration
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring || !SensorModule || !sensorEmitter) {
      return;
    }

    try {
      this.isMonitoring = true;

      // Start native sensor monitoring
      if (this.config.enableAmbientLightAdaptation) {
        await SensorModule.startAmbientLightMonitoring();

        const ambientLightListener = sensorEmitter.addListener(
          "AmbientLightChanged",
          this.handleAmbientLightChange.bind(this),
        );
        this.listeners.push(() => ambientLightListener.remove());
      }

      if (this.config.enableMotionAdaptation) {
        await SensorModule.startMotionMonitoring();

        const motionListener = sensorEmitter.addListener(
          "MotionStateChanged",
          this.handleMotionChange.bind(this),
        );
        this.listeners.push(() => motionListener.remove());
      }

      if (this.config.enableProximityAdaptation) {
        await SensorModule.startProximityMonitoring();

        const proximityListener = sensorEmitter.addListener(
          "ProximityStateChanged",
          this.handleProximityChange.bind(this),
        );
        this.listeners.push(() => proximityListener.remove());
      }

      // Start periodic updates for thermal and battery monitoring
      this.updateTimer = setInterval(
        this.updatePeriodicSensors.bind(this),
        this.config.updateInterval,
      );

      // App state monitoring for background optimization
      const appStateListener = AppState.addEventListener(
        "change",
        this.handleAppStateChange.bind(this),
      );
      this.listeners.push(() => appStateListener.remove());

      // Initial sensor data fetch
      await this.updateAllSensors();

      console.log("🌟 LiquidGlass sensor monitoring started");
    } catch (error) {
      console.error("LiquidGlass sensor monitoring failed:", error);
      this.callbacks.onError?.(
        error instanceof Error ? error.message : "Sensor initialization failed",
      );
      this.isMonitoring = false;
    }
  }

  /**
   * Stop sensor monitoring and cleanup resources
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    try {
      this.isMonitoring = false;

      // Stop native sensor monitoring
      if (SensorModule) {
        if (this.config.enableAmbientLightAdaptation) {
          await SensorModule.stopAmbientLightMonitoring();
        }

        if (this.config.enableMotionAdaptation) {
          await SensorModule.stopMotionMonitoring();
        }

        if (this.config.enableProximityAdaptation) {
          await SensorModule.stopProximityMonitoring();
        }
      }

      // Cleanup timers and listeners
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = null;
      }

      this.listeners.forEach((cleanup) => cleanup());
      this.listeners = [];

      console.log("🌟 LiquidGlass sensor monitoring stopped");
    } catch (error) {
      console.error("LiquidGlass sensor cleanup failed:", error);
    }
  }

  /**
   * Get current sensor data
   */
  getCurrentData(): SensorData | null {
    return this.currentData;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AdaptationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // ==================================================================================
  // SENSOR EVENT HANDLERS
  // ==================================================================================

  private handleAmbientLightChange(event: { lux: number }): void {
    if (!this.currentData) return;

    this.currentData = {
      ...this.currentData,
      ambientLight: event.lux,
      timestamp: new Date(),
    };

    this.processAdaptations("ambient_light");
  }

  private handleMotionChange(event: {
    isStationary: boolean;
    acceleration: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    orientation: "portrait" | "landscape" | "unknown";
  }): void {
    if (!this.currentData) return;

    // Determine motion state from acceleration data
    const acceleration = Math.sqrt(
      event.acceleration.x ** 2 +
        event.acceleration.y ** 2 +
        event.acceleration.z ** 2,
    );

    let motionState: SensorData["motionState"] = "stationary";
    if (acceleration > 2.0) {
      motionState = "shaking";
    } else if (acceleration > 1.2) {
      motionState = "moving";
    } else if (acceleration > 0.3) {
      motionState = "walking";
    }

    this.currentData = {
      ...this.currentData,
      motionState,
      deviceOrientation: event.orientation,
      timestamp: new Date(),
    };

    this.processAdaptations("motion");
  }

  private handleProximityChange(event: { isNear: boolean }): void {
    if (!this.currentData) return;

    this.currentData = {
      ...this.currentData,
      proximityNear: event.isNear,
      timestamp: new Date(),
    };

    this.processAdaptations("proximity");
  }

  private handleAppStateChange(nextAppState: string): void {
    if (nextAppState === "background" && this.isMonitoring) {
      // Reduce sensor polling in background
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = setInterval(
          this.updatePeriodicSensors.bind(this),
          this.config.updateInterval * 5, // 5x slower in background
        );
      }
    } else if (nextAppState === "active" && this.isMonitoring) {
      // Resume normal polling
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = setInterval(
          this.updatePeriodicSensors.bind(this),
          this.config.updateInterval,
        );
      }
    }
  }

  // ==================================================================================
  // SENSOR DATA UPDATES
  // ==================================================================================

  private async updatePeriodicSensors(): Promise<void> {
    if (!SensorModule || !this.currentData) return;

    try {
      // Update thermal state
      if (this.config.enableThermalAdaptation) {
        const thermalState = await SensorModule.getThermalState();
        this.currentData.thermalState = thermalState;
      }

      // Update battery state
      if (this.config.enableBatteryOptimization) {
        const batteryState = await SensorModule.getBatteryState();
        this.currentData.batteryLevel = batteryState.level;
        this.currentData.lowPowerMode = batteryState.lowPowerMode;
      }

      this.currentData.timestamp = new Date();
      this.processAdaptations("periodic");
    } catch (error) {
      console.warn("Periodic sensor update failed:", error);
    }
  }

  private async updateAllSensors(): Promise<void> {
    if (!SensorModule) return;

    try {
      // Get all current sensor values
      const [
        ambientLight,
        motionState,
        thermalState,
        proximityNear,
        batteryState,
      ] = await Promise.all([
        this.config.enableAmbientLightAdaptation
          ? SensorModule.getCurrentAmbientLight()
          : Promise.resolve(1000),
        this.config.enableMotionAdaptation
          ? SensorModule.getCurrentMotionState()
          : Promise.resolve({
              isStationary: true,
              acceleration: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              orientation: "portrait" as const,
            }),
        this.config.enableThermalAdaptation
          ? SensorModule.getThermalState()
          : Promise.resolve("nominal" as const),
        this.config.enableProximityAdaptation
          ? SensorModule.isProximityNear()
          : Promise.resolve(false),
        this.config.enableBatteryOptimization
          ? SensorModule.getBatteryState()
          : Promise.resolve({
              level: 1,
              state: "unknown" as const,
              lowPowerMode: false,
            }),
      ]);

      // Determine motion state
      const acceleration = Math.sqrt(
        motionState.acceleration.x ** 2 +
          motionState.acceleration.y ** 2 +
          motionState.acceleration.z ** 2,
      );

      let motionStateValue: SensorData["motionState"] = "stationary";
      if (acceleration > 2.0) {
        motionStateValue = "shaking";
      } else if (acceleration > 1.2) {
        motionStateValue = "moving";
      } else if (acceleration > 0.3) {
        motionStateValue = "walking";
      }

      this.currentData = {
        ambientLight,
        motionState: motionStateValue,
        deviceOrientation: motionState.orientation,
        thermalState,
        proximityNear,
        batteryLevel: batteryState.level,
        lowPowerMode: batteryState.lowPowerMode,
        timestamp: new Date(),
      };

      this.processAdaptations("initial");
    } catch (error) {
      console.warn("Complete sensor update failed:", error);
    }
  }

  // ==================================================================================
  // ADAPTIVE PROCESSING
  // ==================================================================================

  private processAdaptations(trigger: string): void {
    if (!this.currentData) return;

    const adaptedIntensity = this.calculateAdaptiveIntensity();
    const performanceMode = this.calculatePerformanceMode();

    // Notify callbacks with sensor data and adaptations
    this.callbacks.onSensorUpdate?.(this.currentData);
    this.callbacks.onAdaptationChange?.(
      adaptedIntensity,
      `${trigger}_adaptation`,
    );
    this.callbacks.onPerformanceMode?.(performanceMode);
  }

  private calculateAdaptiveIntensity(): GlassIntensity {
    if (!this.currentData) return "regular";

    let baseIntensity: GlassIntensity = "regular";

    // Ambient light adaptation (Apple's recommended thresholds)
    if (this.config.enableAmbientLightAdaptation) {
      if (this.currentData.ambientLight < 50) {
        // Very dark - reduce intensity for OLED efficiency
        baseIntensity = "ultraThin";
      } else if (this.currentData.ambientLight < 200) {
        // Indoor lighting - standard intensity
        baseIntensity = "thin";
      } else if (this.currentData.ambientLight < 1000) {
        // Bright indoor - increase intensity for visibility
        baseIntensity = "regular";
      } else {
        // Outdoor/bright - maximum intensity
        baseIntensity = "thick";
      }
    }

    // Motion adaptation - reduce effects during movement
    if (this.config.enableMotionAdaptation) {
      if (
        this.currentData.motionState === "shaking" ||
        this.currentData.motionState === "moving"
      ) {
        // Reduce effects during motion to prevent motion sickness
        baseIntensity = this.reduceIntensity(baseIntensity);
      }
    }

    // Thermal adaptation - reduce effects when device is hot
    if (this.config.enableThermalAdaptation) {
      if (
        this.currentData.thermalState === "serious" ||
        this.currentData.thermalState === "critical"
      ) {
        baseIntensity = "ultraThin"; // Minimum effects for thermal protection
      } else if (this.currentData.thermalState === "fair") {
        baseIntensity = this.reduceIntensity(baseIntensity);
      }
    }

    // Proximity adaptation - dim effects when user is close
    if (
      this.config.enableProximityAdaptation &&
      this.currentData.proximityNear
    ) {
      baseIntensity = this.reduceIntensity(baseIntensity);
    }

    // Battery optimization
    if (this.config.enableBatteryOptimization) {
      if (
        this.currentData.lowPowerMode ||
        this.currentData.batteryLevel < 0.2
      ) {
        baseIntensity = "ultraThin"; // Minimum effects for battery saving
      } else if (this.currentData.batteryLevel < 0.5) {
        baseIntensity = this.reduceIntensity(baseIntensity);
      }
    }

    return baseIntensity;
  }

  private calculatePerformanceMode():
    | "quality"
    | "balanced"
    | "performance"
    | "battery" {
    if (!this.currentData) return "balanced";

    // Battery mode takes priority
    if (this.currentData.lowPowerMode || this.currentData.batteryLevel < 0.15) {
      return "battery";
    }

    // Thermal protection
    if (
      this.currentData.thermalState === "serious" ||
      this.currentData.thermalState === "critical"
    ) {
      return "performance";
    }

    // Motion optimization
    if (
      this.currentData.motionState === "shaking" ||
      this.currentData.motionState === "moving"
    ) {
      return "performance";
    }

    // High battery and good conditions - enable quality mode
    if (
      this.currentData.batteryLevel > 0.7 &&
      this.currentData.thermalState === "nominal"
    ) {
      return "quality";
    }

    return "balanced";
  }

  private reduceIntensity(intensity: GlassIntensity): GlassIntensity {
    const intensityLevels: GlassIntensity[] = [
      "ultraThin",
      "thin",
      "regular",
      "thick",
      "ultraThick",
    ];
    const currentIndex = intensityLevels.indexOf(intensity);
    const newIndex = Math.max(0, currentIndex - 1);
    return intensityLevels[newIndex];
  }
}

// ==================================================================================
// REACT HOOKS
// ==================================================================================

/**
 * Hook for sensor-aware glass adaptations
 */
export const useLiquidGlassSensorAdaptation = (
  config: Partial<AdaptationConfig> = {},
  callbacks: SensorCallbacks = {},
) => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [adaptiveIntensity, setAdaptiveIntensity] =
    useState<GlassIntensity>("regular");
  const [performanceMode, setPerformanceMode] = useState<
    "quality" | "balanced" | "performance" | "battery"
  >("balanced");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const managerRef = useRef<LiquidGlassSensorManager | null>(null);

  // Default configuration
  const defaultConfig: AdaptationConfig = {
    enableAmbientLightAdaptation: true,
    enableMotionAdaptation: true,
    enableThermalAdaptation: true,
    enableProximityAdaptation: false, // Disabled by default
    enableBatteryOptimization: true,
    adaptationSensitivity: "medium",
    updateInterval: 1000, // 1 second
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Enhanced callbacks with state updates
  const enhancedCallbacks: SensorCallbacks = {
    ...callbacks,
    onSensorUpdate: (data) => {
      setSensorData(data);
      callbacks.onSensorUpdate?.(data);
    },
    onAdaptationChange: (intensity, reason) => {
      setAdaptiveIntensity(intensity);
      callbacks.onAdaptationChange?.(intensity, reason);
    },
    onPerformanceMode: (mode) => {
      setPerformanceMode(mode);
      callbacks.onPerformanceMode?.(mode);
    },
    onError: (errorMessage) => {
      setError(errorMessage);
      callbacks.onError?.(errorMessage);
    },
  };

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    if (managerRef.current || !SensorModule) {
      return;
    }

    try {
      managerRef.current = new LiquidGlassSensorManager(
        finalConfig,
        enhancedCallbacks,
      );
      await managerRef.current.startMonitoring();
      setIsMonitoring(true);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to start sensor monitoring";
      setError(errorMessage);
      enhancedCallbacks.onError?.(errorMessage);
    }
  }, [finalConfig]);

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    if (!managerRef.current) {
      return;
    }

    try {
      await managerRef.current.stopMonitoring();
      managerRef.current = null;
      setIsMonitoring(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to stop sensor monitoring";
      setError(errorMessage);
    }
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<AdaptationConfig>) => {
    if (managerRef.current) {
      managerRef.current.updateConfig(newConfig);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.stopMonitoring();
      }
    };
  }, []);

  return {
    sensorData,
    adaptiveIntensity,
    performanceMode,
    isMonitoring,
    error,
    isAvailable: !!SensorModule,
    startMonitoring,
    stopMonitoring,
    updateConfig,
  };
};

/**
 * Hook for simplified ambient light adaptation
 */
export const useAmbientLightAdaptation = () => {
  const {
    sensorData,
    adaptiveIntensity,
    startMonitoring,
    stopMonitoring,
    isAvailable,
  } = useLiquidGlassSensorAdaptation({
    enableAmbientLightAdaptation: true,
    enableMotionAdaptation: false,
    enableThermalAdaptation: false,
    enableProximityAdaptation: false,
    enableBatteryOptimization: false,
  });

  useEffect(() => {
    if (isAvailable) {
      startMonitoring();
      return () => stopMonitoring();
    }
  }, [isAvailable, startMonitoring, stopMonitoring]);

  return {
    ambientLight: sensorData?.ambientLight ?? 1000,
    adaptiveIntensity,
    isAvailable,
  };
};

/**
 * Hook for battery-aware performance optimization
 */
export const useBatteryOptimization = () => {
  const {
    sensorData,
    performanceMode,
    startMonitoring,
    stopMonitoring,
    isAvailable,
  } = useLiquidGlassSensorAdaptation({
    enableAmbientLightAdaptation: false,
    enableMotionAdaptation: false,
    enableThermalAdaptation: true,
    enableProximityAdaptation: false,
    enableBatteryOptimization: true,
  });

  useEffect(() => {
    if (isAvailable) {
      startMonitoring();
      return () => stopMonitoring();
    }
  }, [isAvailable, startMonitoring, stopMonitoring]);

  return {
    batteryLevel: sensorData?.batteryLevel ?? 1,
    lowPowerMode: sensorData?.lowPowerMode ?? false,
    thermalState: sensorData?.thermalState ?? "nominal",
    performanceMode,
    isAvailable,
  };
};

// ==================================================================================
// EXPORTS
// ==================================================================================

export {
  LiquidGlassSensorManager,
  useLiquidGlassSensorAdaptation,
  useAmbientLightAdaptation,
  useBatteryOptimization,
};

export type {
  SensorData,
  AdaptationConfig,
  SensorCallbacks,
  LiquidGlassSensorModule,
};
