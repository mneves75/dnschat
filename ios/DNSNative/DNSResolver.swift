import Foundation
import Network
import React

// MARK: - React Native Bridge Support

@objc(RNDNSModule)
final class RNDNSModule: NSObject {
    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc func queryTXT(
        _ domain: String,
        message: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        // For now, return a simple test response to verify the module works
        // TODO: Implement actual DNS querying later
        let testResponse = ["Test response from native DNS module: \(message)"]
        resolve(testResponse)
    }
    
    @objc func isAvailable(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        let capabilities: [String: Any] = [
            "available": true,
            "platform": "ios",
            "supportsCustomServer": true,
            "supportsAsyncQuery": true
        ]
        resolve(capabilities)
    }
}