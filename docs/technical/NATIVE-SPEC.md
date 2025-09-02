# Native DNS TXT Query Module Specification

## 1. Overview

This document outlines the plan to create a custom, high-performance native module for React Native (`NativeDns`) to handle raw UDP DNS queries on iOS and Android. This module will replace the existing reliance on the `react-native-udp` library and the flawed DNS-over-HTTPS fallback.

The primary goal is to achieve reliable, low-level DNS communication by mirroring the proven logic in `test-dns.js`, but within a native context, while addressing platform-specific constraints and ensuring maximum performance and stability.

## 2. Guiding Principles

- **Minimal Native Surface Area:** The native modules will be "dumb pipes." Their sole responsibility is to send a pre-constructed byte array via UDP and return the raw response as a byte array. They will not contain any DNS-specific logic.
- **JavaScript-Centric Logic:** All DNS packet construction (`dns.encode`) and response parsing (`dns.decode`) will remain in `dnsService.ts` using the existing `dns-packet` library. This centralizes the protocol logic, reduces native code complexity, and allows for easier updates to the DNS protocol handling.
- **Performance and Responsiveness:** All native networking operations will be executed on background threads to ensure the UI remains fully responsive.
- **Robust Error Handling:** The native modules will handle network-level errors (e.g., timeouts, host unreachable) and pass them cleanly to the JavaScript layer as rejected Promises.

## 3. JavaScript API & Workflow

The native module, registered as `NativeDns`, will expose a single, asynchronous method.

### API Definition

```typescript
// In a new file, e.g., src/types/native.d.ts
declare module "react-native" {
  interface NativeModulesStatic {
    NativeDns: {
      /**
       * Sends a raw DNS query packet over UDP.
       * @param queryBase64 A Base64 encoded string of the DNS query packet.
       * @param server The IP address of the DNS server.
       * @param port The port of the DNS server.
       * @returns A Promise that resolves with the Base64 encoded DNS response packet.
       */
      query(queryBase64: string, server: string, port: number): Promise<string>;
    };
  }
}
```

### Workflow

1.  **`dnsService.ts`**:
    - Constructs the DNS query packet using `dns.encode(dnsQuery)`.
    - Encodes the resulting `Buffer` to a Base64 string.
    - Calls `NativeModules.NativeDns.query(base64Query, server, port)`.
2.  **Native Module (iOS/Android)**:
    - Receives the Base64 query, server, and port.
    - Decodes the Base64 string into a raw byte array.
    - Opens a UDP socket on a background thread.
    - Sends the byte array to the specified server and port from a system-assigned ephemeral port.
    - Listens for a response.
    - Implements a strict 10-second timeout.
    - On receiving a response, encodes the raw response byte array into a Base64 string.
    - Resolves the JavaScript `Promise` with the Base64 response.
    - If any error (timeout, network error) occurs, it rejects the `Promise` with a descriptive error message.
3.  **`dnsService.ts` (cont.)**:
    - Receives the Base64 response from the resolved promise.
    - Decodes the Base64 string back into a `Buffer`.
    - Parses the response `Buffer` using `dns.decode(responseBuffer)`.
    - Processes the TXT records as before.

## 4. iOS Implementation (Swift)

- **Framework:** `Network.framework`. This is Apple's modern, preferred networking API. It is robust, asynchronous by design, and handles network path changes gracefully.
- **Files:**
  - `ios/ChatDNS/NativeDns.swift`: The core Swift implementation.
  - `ios/ChatDNS/NativeDns.m`: The Objective-C bridge file to expose the module and its methods to React Native.

### `NativeDns.swift`

```swift
import Foundation
import Network

@objc(NativeDns)
class NativeDns: NSObject {

  @objc(query:server:port:resolver:rejecter:)
  func query(queryBase64: String, server: String, port: UInt16,
             resolver: @escaping RCTPromiseResolveBlock,
             rejecter: @escaping RCTPromiseRejectBlock) -> Void {

    guard let queryData = Data(base64Encoded: queryBase64) else {
      rejecter("E_QUERY_DECODE", "Failed to decode Base64 query", nil)
      return
    }

    let host = NWEndpoint.Host(server)
    guard let port = NWEndpoint.Port(rawValue: port) else {
      rejecter("E_INVALID_PORT", "Invalid port number", nil)
      return
    }

    let connection = NWConnection(host: host, port: port, using: .udp)
    let queue = DispatchQueue(label: "dev.gemini.dns.queue")

    connection.stateUpdateHandler = { newState in
      switch newState {
      case .failed(let error):
        rejecter("E_CONNECTION_FAILED", "Connection failed: \(error.localizedDescription)", error)
        connection.cancel()
      case .ready:
        // Send the query
        connection.send(content: queryData, completion: .contentProcessed({ sendError in
          if let error = sendError {
            rejecter("E_SEND_FAILED", "Failed to send UDP packet: \(error.localizedDescription)", error)
            connection.cancel()
            return
          }

          // Wait for the response
          connection.receiveMessage { (content, context, isComplete, receiveError) in
            if let error = receiveError {
              rejecter("E_RECEIVE_FAILED", "Failed to receive UDP response: \(error.localizedDescription)", error)
              connection.cancel()
              return
            }

            if let responseData = content {
              let responseBase64 = responseData.base64EncodedString()
              resolver(responseBase64)
            } else {
              rejecter("E_NO_RESPONSE", "Received no data in response", nil)
            }
            connection.cancel()
          }
        }))
      default:
        break
      }
    }

    // Timeout mechanism
    queue.asyncAfter(deadline: .now() + 10) {
      if connection.state != .cancelled {
        connection.cancel()
        rejecter("E_TIMEOUT", "DNS query timed out after 10 seconds", nil)
      }
    }

    connection.start(queue: queue)
  }
}
```

### `NativeDns.m`

```objective-c
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NativeDns, NSObject)

RCT_EXTERN_METHOD(query:(NSString *)queryBase64
                  server:(NSString *)server
                  port:(nonnull NSNumber *)port
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

@end
```

## 5. Android Implementation (Kotlin)

- **Framework:** `DatagramSocket` and Kotlin Coroutines (`kotlinx.coroutines`). This is the standard, non-blocking approach for modern Android development.
- **Files:**
  - `android/app/src/main/java/com/dnschat/NativeDnsModule.kt`: The core Kotlin implementation.
  - `android/app/src/main/java/com/dnschat/NativeDnsPackage.kt`: The package file to register the module.

### `NativeDnsModule.kt`

```kotlin
package com.dnschat // Or your package name

import android.util.Base64
import com.facebook.react.bridge.*
import kotlinx.coroutines.*
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress

class NativeDnsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "NativeDns"
    private val scope = CoroutineScope(Dispatchers.IO)

    @ReactMethod
    fun query(queryBase64: String, server: String, port: Int, promise: Promise) {
        scope.launch {
            var socket: DatagramSocket? = null
            try {
                withTimeout(10000) { // 10-second timeout
                    val queryBytes = Base64.decode(queryBase64, Base64.NO_WRAP)
                    val serverAddress = InetAddress.getByName(server)

                    socket = DatagramSocket() // Uses a system-assigned ephemeral port

                    val sendPacket = DatagramPacket(queryBytes, queryBytes.size, serverAddress, port)
                    socket?.send(sendPacket)

                    val responseBuffer = ByteArray(1024)
                    val receivePacket = DatagramPacket(responseBuffer, responseBuffer.size)
                    socket?.receive(receivePacket)

                    val responseData = receivePacket.data.copyOf(receivePacket.length)
                    val responseBase64 = Base64.encodeToString(responseData, Base64.NO_WRAP)

                    promise.resolve(responseBase64)
                }
            } catch (e: TimeoutCancellationException) {
                promise.reject("E_TIMEOUT", "DNS query timed out after 10 seconds", e)
            } catch (e: Exception) {
                promise.reject("E_QUERY_FAILED", "DNS query failed: ${e.message}", e)
            } finally {
                socket?.close()
            }
        }
    }
}
```

### `NativeDnsPackage.kt`

```kotlin
package com.dnschat // Or your package name

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class NativeDnsPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(NativeDnsModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
```

_Finally, this package needs to be added to the `MainApplication.kt` file._

## 6. Implementation and Verification Steps

1.  **Create `NATIVE-SPEC.md`**: Write this plan to the specified file.
2.  **iOS Implementation**:
    - Create `NativeDns.swift` and `NativeDns.m` in the `ios/ChatDNS/` directory.
    - No Pod install should be needed as `Network.framework` is a system library.
3.  **Android Implementation**:
    - Create the `com/dnschat` package structure if it doesn't exist.
    - Create `NativeDnsModule.kt` and `NativeDnsPackage.kt`.
    - Register `NativeDnsPackage()` in `MainApplication.kt`'s `getPackages()` method.
4.  **Update `dnsService.ts`**:
    - Modify `performNativeUDPQuery` to use the new `NativeDns` module and the Base64 workflow.
    - Remove the DNS-over-HTTPS fallback, as the native implementation is the primary and only desired path.
5.  **Build and Test**:
    - Run `npm run ios` and `npm run android` to build the app with the new native code.
    - Thoroughly test the chat functionality on both platforms to confirm the native module is working correctly.
    - Verify error handling by testing with no internet connection and by querying a non-responsive server.
