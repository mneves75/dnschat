type SensorId = "accelerometer" | "gyroscope" | "light";

export interface SensorData {
  id: SensorId;
  value: number;
  timestamp: number;
}

export interface SensorCallbacks {
  onData: (data: SensorData) => void;
}

export interface AdaptationConfig {
  enabled: boolean;
}

export interface LiquidGlassSensorModule {
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  getCurrentData: () => SensorData | null;
}

export class LiquidGlassSensorManager implements LiquidGlassSensorModule {
  async startMonitoring() {
    return;
  }

  async stopMonitoring() {
    return;
  }

  getCurrentData(): SensorData | null {
    return null;
  }
}

export const useLiquidGlassSensorAdaptation = (_config?: Partial<AdaptationConfig>) => ({
  sensorData: null as SensorData | null,
  isActive: false,
});

export const useAmbientLightAdaptation = () => ({
  lightLevel: 1,
  isActive: false,
});

export const useBatteryOptimization = () => ({
  batteryLevel: 1,
  isAvailable: false,
});
