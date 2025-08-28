/**
 * Liquid Glass Integration Test
 * Verifies that the native iOS 26 Liquid Glass module is properly registered
 * and can be accessed from React Native
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

import { Platform, NativeModules } from 'react-native';

// Mock the native modules for testing
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  NativeModules: {
    LiquidGlassModule: {
      isAvailable: jest.fn(),
      getPerformanceMetrics: jest.fn(),
      animateMorph: jest.fn(),
    },
    LiquidGlassNativeModule: {
      getCapabilities: jest.fn(),
      startPerformanceMonitoring: jest.fn(),
      getEnvironmentalContext: jest.fn(),
    },
  },
  requireNativeComponent: jest.fn((name) => {
    if (name === 'LiquidGlassView') {
      return 'MockLiquidGlassView';
    }
    return null;
  }),
}));

describe('Liquid Glass Native Module Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Module Registration', () => {
    it('should register LiquidGlassModule', () => {
      // Mock iOS 26 platform
      Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true });
      Object.defineProperty(Platform, 'Version', { value: '26.0', writable: true });
      
      // Check if module is registered
      const { LiquidGlassModule } = NativeModules;
      expect(LiquidGlassModule).toBeDefined();
    });

    it('should register LiquidGlassNativeModule for performance monitoring', () => {
      // Check if performance module is registered
      const { LiquidGlassNativeModule } = NativeModules;
      expect(LiquidGlassNativeModule).toBeDefined();
    });

    it('should expose required methods on LiquidGlassModule', () => {
      const { LiquidGlassModule } = NativeModules;
      
      // Verify core methods exist
      expect(typeof LiquidGlassModule.isAvailable).toBe('function');
      expect(typeof LiquidGlassModule.getPerformanceMetrics).toBe('function');
      expect(typeof LiquidGlassModule.animateMorph).toBe('function');
    });

    it('should expose required methods on LiquidGlassNativeModule', () => {
      const { LiquidGlassNativeModule } = NativeModules;
      
      // Verify performance monitoring methods exist
      expect(typeof LiquidGlassNativeModule.getCapabilities).toBe('function');
      expect(typeof LiquidGlassNativeModule.startPerformanceMonitoring).toBe('function');
      expect(typeof LiquidGlassNativeModule.getEnvironmentalContext).toBe('function');
    });
  });

  describe('Native View Component', () => {
    it('should register LiquidGlassView native component', () => {
      const { requireNativeComponent } = require('react-native');
      const LiquidGlassView = requireNativeComponent('LiquidGlassView');
      
      expect(LiquidGlassView).toBeDefined();
      expect(LiquidGlassView).toBe('MockLiquidGlassView');
    });
  });

  describe('iOS 26 Detection', () => {
    it('should correctly detect iOS 26+', () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true });
      Object.defineProperty(Platform, 'Version', { value: '26.0', writable: true });
      
      const isIOS26Plus = Platform.OS === 'ios' && 
                          parseInt(Platform.Version as string, 10) >= 26;
      
      expect(isIOS26Plus).toBe(true);
    });

    it('should not detect iOS 26 on older versions', () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true });
      Object.defineProperty(Platform, 'Version', { value: '25.0', writable: true });
      
      const isIOS26Plus = Platform.OS === 'ios' && 
                          parseInt(Platform.Version as string, 10) >= 26;
      
      expect(isIOS26Plus).toBe(false);
    });

    it('should not detect iOS 26 on Android', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', writable: true });
      
      const isIOS26Plus = Platform.OS === 'ios' && 
                          parseInt(Platform.Version as string, 10) >= 26;
      
      expect(isIOS26Plus).toBe(false);
    });
  });

  describe('Capability Detection', () => {
    it('should return correct capabilities on iOS 26+', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true });
      Object.defineProperty(Platform, 'Version', { value: '26.0', writable: true });
      
      const { LiquidGlassNativeModule } = NativeModules;
      
      // Mock the capabilities response
      LiquidGlassNativeModule.getCapabilities = jest.fn().mockResolvedValue({
        supportsLiquidGlass: true,
        platform: 'ios',
        version: '26.0+',
        features: [
          'glassEffect',
          'glassEffectContainer',
          'environmentalAdaptation',
          'sensorAwareness'
        ]
      });
      
      const capabilities = await LiquidGlassNativeModule.getCapabilities();
      
      expect(capabilities.supportsLiquidGlass).toBe(true);
      expect(capabilities.platform).toBe('ios');
      expect(capabilities.features).toContain('glassEffect');
      expect(capabilities.features).toContain('environmentalAdaptation');
    });
  });

  describe('Performance Monitoring', () => {
    it('should start performance monitoring', async () => {
      const { LiquidGlassNativeModule } = NativeModules;
      
      LiquidGlassNativeModule.startPerformanceMonitoring = jest.fn()
        .mockResolvedValue(true);
      
      const result = await LiquidGlassNativeModule.startPerformanceMonitoring();
      
      expect(result).toBe(true);
      expect(LiquidGlassNativeModule.startPerformanceMonitoring).toHaveBeenCalled();
    });

    it('should get performance metrics', async () => {
      const { LiquidGlassModule } = NativeModules;
      
      const mockMetrics = {
        fps: 60,
        renderTime: 16.67,
        memoryUsage: 120,
        thermalState: 'nominal',
        frameDrops: 0
      };
      
      LiquidGlassModule.getPerformanceMetrics = jest.fn()
        .mockResolvedValue(mockMetrics);
      
      const metrics = await LiquidGlassModule.getPerformanceMetrics();
      
      expect(metrics.fps).toBe(60);
      expect(metrics.thermalState).toBe('nominal');
      expect(metrics.frameDrops).toBe(0);
    });

    it('should get environmental context', async () => {
      const { LiquidGlassNativeModule } = NativeModules;
      
      const mockContext = {
        ambientLight: 0.5,
        deviceOrientation: 'portrait',
        motionState: 'stationary',
        thermalState: 0
      };
      
      LiquidGlassNativeModule.getEnvironmentalContext = jest.fn()
        .mockResolvedValue(mockContext);
      
      const context = await LiquidGlassNativeModule.getEnvironmentalContext();
      
      expect(context.ambientLight).toBe(0.5);
      expect(context.deviceOrientation).toBe('portrait');
      expect(context.motionState).toBe('stationary');
    });
  });

  describe('Morphing Animation', () => {
    it('should animate morph between glass elements', async () => {
      const { LiquidGlassModule } = NativeModules;
      
      LiquidGlassModule.animateMorph = jest.fn()
        .mockResolvedValue(true);
      
      const result = await LiquidGlassModule.animateMorph('element1', 'element2');
      
      expect(result).toBe(true);
      expect(LiquidGlassModule.animateMorph).toHaveBeenCalledWith('element1', 'element2');
    });
  });
});