import Foundation
import UIKit

@objc(LiquidGlassNativeModule)
class LiquidGlassNativeModule: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc func getCapabilities(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let is17: Bool
    if #available(iOS 17.0, *) { is17 = true } else { is17 = false }
    let result: [String: Any] = [
      "isSupported": is17,
      "platform": "ios",
      "features": [
        "basicGlass": is17,
        "sensorAware": is17,
        "depthContainers": is17,
        "environmentalCues": is17,
        "hapticsIntegration": true,
        "dynamicIntensity": is17
      ],
      "performance": [
        "tier": is17 ? "high" : "low",
        "maxGlassElements": is17 ? 50 : 5,
        "supports60fps": true,
        "metalAcceleration": true
      ],
      "device": [
        "family": UIDevice.current.userInterfaceIdiom == .pad ? "iPad" : "iPhone",
        "thermalGuidance": "moderate",
        "memoryProfile": is17 ? "high" : "medium"
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
