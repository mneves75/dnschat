import React from "react";

export interface BatteryState {
  level: number;
  isCharging: boolean;
  isLowPowerMode: boolean;
}

export type ThermalLevel = "nominal" | "fair" | "serious" | "critical";

export interface ThermalState {
  level: ThermalLevel;
  temperature: number;
  throttleLevel: number;
}

export interface PowerProfile {
  name: "quality" | "performance" | "balanced" | "battery";
  description: string;
}

export interface UsagePattern {
  sessions: number;
  averageDuration: number;
}

export interface BatteryConfig {
  optimisticMode?: boolean;
  minimumLevelForAnimations?: number;
}

export interface BatteryOptimizationCallbacks {
  onBatteryWarning?: (state: BatteryState) => void;
  onThermalWarning?: (state: ThermalState) => void;
}

const DEFAULT_POWER_PROFILES: Record<PowerProfile["name"], PowerProfile> = {
  quality: {
    name: "quality",
    description: "Maximum fidelity at the cost of additional power usage.",
  },
  performance: {
    name: "performance",
    description: "Balanced performance and thermals for most situations.",
  },
  balanced: {
    name: "balanced",
    description: "Adaptive profile that follows system guidance.",
  },
  battery: {
    name: "battery",
    description: "Aggressive power saving with fewer glass effects.",
  },
};

class LiquidGlassBatteryManager {
  private static instance: LiquidGlassBatteryManager | null = null;

  private constructor(private readonly config: BatteryConfig = {}) {}

  static getInstance(config?: BatteryConfig) {
    if (!this.instance) {
      this.instance = new LiquidGlassBatteryManager(config);
    }
    return this.instance;
  }

  getBatteryState(): BatteryState {
    return {
      level: 0.8,
      isCharging: false,
      isLowPowerMode: false,
    };
  }

  getThermalState(): ThermalState {
    return {
      level: "nominal",
      temperature: 26,
      throttleLevel: 0,
    };
  }

  getCurrentPowerProfile(): PowerProfile {
    return DEFAULT_POWER_PROFILES.balanced;
  }

  getActiveOptimizations(): string[] {
    return [];
  }

  getUsagePattern(): UsagePattern {
    return {
      sessions: 0,
      averageDuration: 0,
    };
  }

  forcePowerProfile(_: PowerProfile["name"]) {
    // no-op stub
  }
}

export const useLiquidGlassBattery = (config?: BatteryConfig) => {
  const manager = React.useMemo(
    () => LiquidGlassBatteryManager.getInstance(config),
    [config],
  );

  const [batteryState, setBatteryState] = React.useState(manager.getBatteryState());
  const [thermalState, setThermalState] = React.useState(manager.getThermalState());
  const [powerProfile, setPowerProfile] = React.useState(
    manager.getCurrentPowerProfile(),
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setBatteryState(manager.getBatteryState());
      setThermalState(manager.getThermalState());
      setPowerProfile(manager.getCurrentPowerProfile());
    }, 20000);

    return () => clearInterval(interval);
  }, [manager]);

  const forcePowerProfile = React.useCallback(
    (profile: PowerProfile["name"]) => {
      manager.forcePowerProfile(profile);
      setPowerProfile(DEFAULT_POWER_PROFILES[profile]);
    },
    [manager],
  );

  return {
    batteryState,
    thermalState,
    powerProfile,
    activeOptimizations: manager.getActiveOptimizations(),
    usagePattern: manager.getUsagePattern(),
    forcePowerProfile,
  };
};

export { LiquidGlassBatteryManager, DEFAULT_POWER_PROFILES };
