/**
 * LiquidGlassModule.m
 * Objective-C bridge for Swift LiquidGlass module
 * 
 * This file exposes the Swift LiquidGlass module to React Native's module system.
 * Required for React Native to discover and use our native iOS 26 Liquid Glass implementation.
 */

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>

// MARK: - LiquidGlassNativeModule Bridge (for performance monitoring)
@interface RCT_EXTERN_MODULE(LiquidGlassNativeModule, NSObject)

// Get capabilities
RCT_EXTERN_METHOD(getCapabilities:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Start performance monitoring
RCT_EXTERN_METHOD(startPerformanceMonitoring:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Get environmental context
RCT_EXTERN_METHOD(getEnvironmentalContext:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end

// MARK: - LiquidGlassModule Bridge (for basic functionality)
@interface RCT_EXTERN_MODULE(LiquidGlassModule, NSObject)

// Check if Liquid Glass is available
RCT_EXTERN_METHOD(isAvailable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Get performance metrics
RCT_EXTERN_METHOD(getPerformanceMetrics:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Animate morphing between glass elements
RCT_EXTERN_METHOD(animateMorph:(NSString *)fromId
                  toId:(NSString *)toId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end

// MARK: - LiquidGlassViewManager Bridge
@interface RCT_EXTERN_MODULE(LiquidGlassViewManager, RCTViewManager)

// Props
RCT_EXPORT_VIEW_PROPERTY(variant, NSString)
RCT_EXPORT_VIEW_PROPERTY(sensorAware, BOOL)
RCT_EXPORT_VIEW_PROPERTY(interactive, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onPerformanceUpdate, RCTDirectEventBlock)

// View setup
RCT_EXTERN_METHOD(setVariant:(nonnull NSNumber *)node
                  variant:(NSString *)variant)

RCT_EXTERN_METHOD(setSensorAware:(nonnull NSNumber *)node
                  enabled:(BOOL)enabled)

RCT_EXTERN_METHOD(setInteractive:(nonnull NSNumber *)node
                  enabled:(BOOL)enabled)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
