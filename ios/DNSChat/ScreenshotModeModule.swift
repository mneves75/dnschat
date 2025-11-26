import Foundation
import React

/// Native module to detect screenshot mode from launch arguments
/// When app is launched with `-SCREENSHOT_MODE 1`, iOS stores this in UserDefaults
@objc(ScreenshotModeModule)
class ScreenshotModeModule: NSObject {

  @objc
  func constantsToExport() -> [AnyHashable: Any]! {
    return [
      "isScreenshotMode": isScreenshotModeEnabled()
    ]
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  /// Check if screenshot mode is enabled via launch arguments or UserDefaults
  private func isScreenshotModeEnabled() -> Bool {
    // Method 1: Check UserDefaults (populated by launch arguments with -KEY format)
    let defaults = UserDefaults.standard
    if let value = defaults.string(forKey: "SCREENSHOT_MODE"), value == "1" {
      return true
    }
    if defaults.bool(forKey: "SCREENSHOT_MODE") {
      return true
    }

    // Method 2: Check ProcessInfo arguments directly
    let args = ProcessInfo.processInfo.arguments
    for (index, arg) in args.enumerated() {
      if arg == "-SCREENSHOT_MODE" && index + 1 < args.count {
        return args[index + 1] == "1"
      }
      if arg == "-SCREENSHOT_MODE=1" {
        return true
      }
    }

    // Method 3: Check environment variable (set by fastlane)
    if ProcessInfo.processInfo.environment["FASTLANE_SNAPSHOT"] == "YES" {
      return true
    }

    return false
  }

  /// Synchronous getter for screenshot mode status
  @objc
  func isScreenshotMode(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(isScreenshotModeEnabled())
  }
}
