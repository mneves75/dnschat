/**
 * LiquidGlassSensorModule.m - React Native Bridge for iOS Sensor Integration
 * 
 * Objective-C bridge file to expose Swift sensor functionality to React Native.
 * Follows React Native bridge best practices with proper method signatures
 * and promise-based async handling.
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 17 Liquid Glass Support)
 */

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

// ==================================================================================
// SENSOR MODULE BRIDGE
// ==================================================================================

@interface RCT_EXTERN_MODULE(LiquidGlassSensorModule, RCTEventEmitter)

// Ambient Light Sensor Methods
RCT_EXTERN_METHOD(startAmbientLightMonitoring:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopAmbientLightMonitoring:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCurrentAmbientLight:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Motion Sensor Methods
RCT_EXTERN_METHOD(startMotionMonitoring:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopMotionMonitoring:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCurrentMotionState:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Proximity Sensor Methods
RCT_EXTERN_METHOD(startProximityMonitoring:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopProximityMonitoring:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isProximityNear:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Thermal and Battery Methods
RCT_EXTERN_METHOD(getThermalState:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getBatteryState:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Event emitter support
+ (BOOL)requiresMainQueueSetup {
  return NO;
}

@end