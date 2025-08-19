/**
 * LiquidGlassNative React Native Bridge Header
 * 
 * This file exposes the Swift LiquidGlassView module to React Native's
 * Objective-C bridge system for seamless integration.
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTUIManager.h>
#import <React/RCTLog.h>

// Import UIKit for iOS 26+ features
#import <UIKit/UIKit.h>

// Conditional iOS 26+ imports
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 260000
  // iOS 26+ UIGlassEffect headers would be imported here
  // #import <UIKit/UIGlassEffect.h>
#endif

// Performance monitoring imports
#import <QuartzCore/QuartzCore.h>
#import <CoreMotion/CoreMotion.h>