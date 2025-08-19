/**
 * LiquidGlassNative React Native Module Registration
 * 
 * This file handles the Objective-C side of the React Native bridge,
 * registering the Swift LiquidGlassView components with React Native.
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

// ==================================================================================
// VIEW MANAGER REGISTRATION
// ==================================================================================

@interface RCT_EXTERN_MODULE(LiquidGlassViewManager, RCTViewManager)

// Export React Native props
RCT_EXPORT_VIEW_PROPERTY(intensity, NSString)
RCT_EXPORT_VIEW_PROPERTY(style, NSString)
RCT_EXPORT_VIEW_PROPERTY(sensorAware, BOOL)
RCT_EXPORT_VIEW_PROPERTY(environmentalAdaptation, BOOL)
RCT_EXPORT_VIEW_PROPERTY(dynamicIntensity, BOOL)
RCT_EXPORT_VIEW_PROPERTY(hapticsEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(performanceMode, NSString)

// Export methods for dynamic updates
RCT_EXTERN_METHOD(setIntensity:(nonnull NSNumber *)reactTag intensity:(NSString *)intensity)
RCT_EXTERN_METHOD(setStyle:(nonnull NSNumber *)reactTag style:(NSString *)style)
RCT_EXTERN_METHOD(setSensorAware:(nonnull NSNumber *)reactTag sensorAware:(BOOL)sensorAware)

@end

// ==================================================================================
// NATIVE MODULE REGISTRATION
// ==================================================================================

@interface RCT_EXTERN_MODULE(LiquidGlassNativeModule, NSObject)

// Export capability detection method
RCT_EXTERN_METHOD(getCapabilities:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject)

// Export performance monitoring methods
RCT_EXTERN_METHOD(startPerformanceMonitoring:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getPerformanceMetrics:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject)

// Export environmental context methods
RCT_EXTERN_METHOD(getEnvironmentalContext:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject)

@end