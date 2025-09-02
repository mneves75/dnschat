import Foundation
import UIKit
import React

@objc(LiquidGlassNativeModule)
class LiquidGlassNativeModule: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc func constantsToExport() -> [AnyHashable: Any]! {
    return [:]
  }

  @objc func getCapabilities(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    #if compiler(>=6.0)
    // Placeholder – use availability check at runtime
    #endif
    // Runtime glass availability: require iOS 26 and presence of glass class
    var is26 = false
    if #available(iOS 26.0, *) {
      let candidates = ["UIGlassEffectView", "UIGlassView", "_UIGlassEffectView"]
      is26 = candidates.contains { NSClassFromString($0) != nil }
    }

    let result: [String: Any] = [
      "isSupported": is26,
      "platform": "ios",
      "features": [
        "basicGlass": is26,
        "sensorAware": is26,
        "depthContainers": is26,
        "environmentalCues": is26,
        "hapticsIntegration": true,
        "dynamicIntensity": is26
      ],
      "performance": [
        "tier": is26 ? "high" : "low",
        "maxGlassElements": is26 ? 50 : 5,
        "supports60fps": true,
        "metalAcceleration": true
      ],
      "device": [
        "family": UIDevice.current.userInterfaceIdiom == .pad ? "iPad" : "iPhone",
        "thermalGuidance": "moderate",
        "memoryProfile": "medium"
      ]
    ]
    resolve(result)
  }

  @objc func startPerformanceMonitoring(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    resolve(nil)
  }

  @objc func getPerformanceMetrics(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    resolve([
      "averageRenderTime": 12.0,
      "frameDropRate": 0.5,
      "isPerformanceAcceptable": true
    ])
  }

  @objc func getEnvironmentalContext(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    resolve([
      "ambientLight": 0.7,
      "deviceOrientation": "portrait",
      "motionState": "static",
      "thermalState": "nominal"
    ])
  }
}
