import Foundation
import UIKit

@objc(LiquidGlassNativeModule)
class LiquidGlassNativeModule: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc func getCapabilities(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let hasNativeBlur: Bool
    if #available(iOS 13.0, *) { hasNativeBlur = true } else { hasNativeBlur = false }
    let supportsSwiftUIGlass: Bool
    if #available(iOS 26.0, *) { supportsSwiftUIGlass = true } else { supportsSwiftUIGlass = false }
    let result: [String: Any] = [
      "isSupported": hasNativeBlur,
      "platform": "ios",
      "supportsLiquidGlass": hasNativeBlur,
      "features": [
        "basicGlass": hasNativeBlur,
        "sensorAware": supportsSwiftUIGlass,
        "depthContainers": supportsSwiftUIGlass,
        "environmentalCues": supportsSwiftUIGlass,
        "hapticsIntegration": true,
        "dynamicIntensity": supportsSwiftUIGlass
      ],
      "performance": [
        "tier": supportsSwiftUIGlass ? "high" : (hasNativeBlur ? "low" : "fallback"),
        "maxGlassElements": supportsSwiftUIGlass ? 50 : (hasNativeBlur ? 8 : 0),
        "supports60fps": true,
        "metalAcceleration": true
      ],
      "device": [
        "family": UIDevice.current.userInterfaceIdiom == .pad ? "iPad" : "iPhone",
        "thermalGuidance": "moderate",
        "memoryProfile": supportsSwiftUIGlass ? "high" : (hasNativeBlur ? "medium" : "low")
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
