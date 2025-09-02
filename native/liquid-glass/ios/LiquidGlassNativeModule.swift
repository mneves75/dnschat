import Foundation
import UIKit

@objc(LiquidGlassNativeModule)
class LiquidGlassNativeModule: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc func getCapabilities(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let is26: Bool
    if #available(iOS 26.0, *) { is26 = true } else { is26 = false }
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
        "memoryProfile": is26 ? "high" : "medium"
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

