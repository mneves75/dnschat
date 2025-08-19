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

// Export SwiftUI Glass Effect props
RCT_EXPORT_VIEW_PROPERTY(variant, NSString)              // regular, prominent, interactive
RCT_EXPORT_VIEW_PROPERTY(shape, NSString)               // capsule, rect, roundedRect
RCT_EXPORT_VIEW_PROPERTY(cornerRadius, CGFloat)         // For rect shapes
RCT_EXPORT_VIEW_PROPERTY(glassTintColor, NSString)     // Hex color
RCT_EXPORT_VIEW_PROPERTY(isInteractive, BOOL)           // Interactive response
RCT_EXPORT_VIEW_PROPERTY(sensorAware, BOOL)             // Environmental adaptation
RCT_EXPORT_VIEW_PROPERTY(enableContainer, BOOL)         // Use GlassEffectContainer
RCT_EXPORT_VIEW_PROPERTY(containerSpacing, CGFloat)     // Container merge distance

// Export methods for dynamic updates
RCT_EXTERN_METHOD(setVariant:(nonnull NSNumber *)reactTag variant:(NSString *)variant)
RCT_EXTERN_METHOD(setShape:(nonnull NSNumber *)reactTag shape:(NSString *)shape)
RCT_EXTERN_METHOD(setTintColor:(nonnull NSNumber *)reactTag tintColor:(NSString *)tintColor)
RCT_EXTERN_METHOD(setSensorAware:(nonnull NSNumber *)reactTag sensorAware:(BOOL)sensorAware)
RCT_EXTERN_METHOD(setInteractive:(nonnull NSNumber *)reactTag interactive:(BOOL)interactive)

@end

// ==================================================================================
// NATIVE MODULE REGISTRATION
// ==================================================================================

@interface RCT_EXTERN_MODULE(LiquidGlassNativeModule, NSObject)

// Export capability detection method
RCT_EXTERN_METHOD(getCapabilities:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject)

// Mark as not requiring main queue for better performance
+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

@end