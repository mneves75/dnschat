import Foundation
import Network
import React

@objc(DNSResolver)
final class DNSResolver: NSObject, @unchecked Sendable {
    
    // MARK: - Configuration
    private static let dnsServer = "ch.at"
    private static let dnsPort: UInt16 = 53
    private static let queryTimeout: TimeInterval = 10.0
    
    // MARK: - Public Interface
    
    @objc static func isAvailable() -> Bool {
        if #available(iOS 12.0, *) {
            return true
        }
        return false
    }
    
    @objc func queryTXT(
        domain: String,
        message: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        // Send the original message unchanged to match `dig` behavior
        let originalMessage = message
        
        Task {
            do {
                let result = try await performDNSQuery(message: originalMessage)
                resolver(result)
            } catch {
                rejecter("DNS_QUERY_FAILED", error.localizedDescription, error)
            }
        }
    }
    
    // MARK: - Private Implementation
    
    private func performDNSQuery(message: String) async throws -> [String] {
        return try await withCheckedThrowingContinuation { continuation in
            print("🔌 Creating UDP connection to \(Self.dnsServer):\(Self.dnsPort)")
            
            // Create UDP connection to DNS server
            let connection = NWConnection(
                host: NWEndpoint.Host(Self.dnsServer),
                port: NWEndpoint.Port(integerLiteral: Self.dnsPort),
                using: .udp
            )
            
            // Create DNS query packet
            let queryData = createDNSQuery(message: message)
            
            // Flag to prevent double-resume
            var hasResumed = false
            let resumeLock = NSLock()
            
            func safeResume(_ result: Result<[String], Error>) {
                resumeLock.lock()
                defer { resumeLock.unlock() }
                guard !hasResumed else { 
                    print("⚠️ Attempted to resume continuation twice, ignoring")
                    return 
                }
                hasResumed = true
                
                switch result {
                case .success(let value):
                    print("✅ DNS query succeeded with \(value.count) TXT records")
                    continuation.resume(returning: value)
                case .failure(let error):
                    print("❌ DNS query failed: \(error)")
                    continuation.resume(throwing: error)
                }
            }
            
            // Set up connection state handling
            connection.stateUpdateHandler = { state in
                print("🔄 Connection state changed: \(state)")
                
                switch state {
                case .ready:
                    print("✅ Connection ready, sending DNS query...")
                    // Connection established, send DNS query
                    connection.send(content: queryData, completion: .contentProcessed { error in
                        if let error = error {
                            print("❌ Failed to send DNS query: \(error)")
                            connection.cancel()
                            safeResume(.failure(DNSError.queryFailed(error.localizedDescription)))
                            return
                        }
                        
                        print("📤 DNS query sent successfully, waiting for response...")
                        
                        // Wait for response
                        connection.receive(minimumIncompleteLength: 1, maximumLength: 1024) { data, context, isComplete, error in
                            if let error = error {
                                print("❌ Failed to receive DNS response: \(error)")
                                connection.cancel()
                                safeResume(.failure(DNSError.queryFailed(error.localizedDescription)))
                                return
                            }
                            
                            guard let data = data, !data.isEmpty else {
                                print("❌ No data received in DNS response")
                                connection.cancel()
                                safeResume(.failure(DNSError.noRecordsFound))
                                return
                            }
                            
                            print("📥 Received DNS response: \(data.count) bytes")
                            connection.cancel()
                            
                            do {
                                let txtRecords = try self.parseDNSResponse(data)
                                print("✅ Parsed \(txtRecords.count) TXT records")
                                safeResume(.success(txtRecords))
                            } catch {
                                print("❌ Failed to parse DNS response: \(error)")
                                safeResume(.failure(error))
                            }
                        }
                    })
                    
                case .failed(let error):
                    print("❌ Connection failed: \(error)")
                    connection.cancel()
                    safeResume(.failure(DNSError.resolverFailed(error.localizedDescription)))
                    
                case .cancelled:
                    print("⚠️ Connection cancelled")
                    safeResume(.failure(DNSError.cancelled))
                    
                case .preparing:
                    print("🔄 Connection preparing...")
                    
                case .setup:
                    print("🔄 Connection setting up...")
                    
                case .waiting(let error):
                    print("⏳ Connection waiting: \(error)")
                    
                @unknown default:
                    print("❓ Unknown connection state")
                }
            }
            
            // Start connection with timeout
            let queue = DispatchQueue.global(qos: .userInitiated)
            print("🚀 Starting connection...")
            connection.start(queue: queue)
            
            // Set up timeout
            DispatchQueue.global().asyncAfter(deadline: .now() + Self.queryTimeout) {
                if !hasResumed {
                    print("⏱️ DNS query timeout after \(Self.queryTimeout) seconds")
                    connection.cancel()
                    safeResume(.failure(DNSError.timeout))
                }
            }
        }
    }
    
    private func createDNSQuery(message: String) -> Data {
        var packet = Data()
        
        // DNS Header (12 bytes)
        let transactionId = UInt16.random(in: 1...65535)
        packet.append(contentsOf: withUnsafeBytes(of: transactionId.bigEndian) { Array($0) })
        packet.append(contentsOf: withUnsafeBytes(of: UInt16(0x0100).bigEndian) { Array($0) }) // Flags: Standard query
        packet.append(contentsOf: withUnsafeBytes(of: UInt16(1).bigEndian) { Array($0) })     // Questions: 1
        packet.append(contentsOf: withUnsafeBytes(of: UInt16(0).bigEndian) { Array($0) })     // Answer RRs: 0
        packet.append(contentsOf: withUnsafeBytes(of: UInt16(0).bigEndian) { Array($0) })     // Authority RRs: 0
        packet.append(contentsOf: withUnsafeBytes(of: UInt16(0).bigEndian) { Array($0) })     // Additional RRs: 0
        
        // Question section
        // Use the original message, only trim whitespace to match `dig` semantics
        let domainName = message.trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Debug logging
        print("📦 Creating DNS query for message: '\(domainName)'")
        
        // Encode domain name as a single label (matching test-dns.js behavior)
        let labelData = domainName.data(using: .utf8) ?? Data()
        
        // DNS labels have a max length of 63 bytes
        if labelData.count > 63 {
            print("⚠️ Message too long for single DNS label: \(labelData.count) bytes")
            // For longer messages, truncate to 63 bytes
            let truncated = labelData.prefix(63)
            packet.append(UInt8(truncated.count))
            packet.append(truncated)
        } else if labelData.count > 0 {
            packet.append(UInt8(labelData.count))
            packet.append(labelData)
        }
        
        packet.append(0) // End of domain name
        
        // QTYPE: TXT (16)
        packet.append(contentsOf: withUnsafeBytes(of: UInt16(16).bigEndian) { Array($0) })
        
        // QCLASS: IN (1)
        packet.append(contentsOf: withUnsafeBytes(of: UInt16(1).bigEndian) { Array($0) })
        
        // Debug: Log packet details
        print("📊 DNS Query packet size: \(packet.count) bytes")
        print("📊 Transaction ID: \(transactionId)")
        
        return packet
    }
    
    private func parseDNSResponse(_ data: Data) throws -> [String] {
        var txtRecords: [String] = []
        
        guard data.count >= 12 else {
            throw DNSError.invalidResponse("Response too short")
        }
        
        // Skip DNS header (12 bytes)
        var offset = 12
        
        // Skip question section
        // Skip domain name
        while offset < data.count {
            let length = Int(data[offset])
            offset += 1
            if length == 0 {
                break
            }
            offset += length
        }
        
        // Skip QTYPE and QCLASS
        offset += 4
        
        // Parse answer section
        let anCount = data.withUnsafeBytes { bytes in
            bytes.bindMemory(to: UInt16.self)[3].bigEndian // Answer count at offset 6-7
        }
        
        for _ in 0..<anCount {
            // Skip name (compression or full name)
            if data[offset] >= 0xC0 {
                // Compressed name
                offset += 2
            } else {
                // Skip full name
                while offset < data.count && data[offset] != 0 {
                    let length = Int(data[offset])
                    offset += 1 + length
                }
                offset += 1 // Skip the null terminator
            }
            
            guard offset + 10 <= data.count else { break }
            
            let type = UInt16(data[offset]) << 8 | UInt16(data[offset + 1])
            offset += 8 // Skip type, class, TTL
            let rdLength = UInt16(data[offset]) << 8 | UInt16(data[offset + 1])
            offset += 2
            
            if type == 16 && offset + Int(rdLength) <= data.count { // TXT record
                // Parse TXT record data
                var txtOffset = offset
                let txtEnd = offset + Int(rdLength)
                
                while txtOffset < txtEnd {
                    let length = Int(data[txtOffset])
                    txtOffset += 1
                    
                    if txtOffset + length <= txtEnd {
                        let txtData = data.subdata(in: txtOffset..<(txtOffset + length))
                        if let txtString = String(data: txtData, encoding: .utf8) {
                            txtRecords.append(txtString)
                        }
                        txtOffset += length
                    } else {
                        break
                    }
                }
            }
            
            offset += Int(rdLength)
        }
        
        guard !txtRecords.isEmpty else {
            throw DNSError.noRecordsFound
        }
        
        return txtRecords
    }
    
    private func sanitizeMessage(_ message: String) -> String {
        // Preserve the original content; only trim extraneous surrounding whitespace
        return message.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}

// MARK: - Error Types

extension DNSResolver {
    enum DNSError: LocalizedError {
        case resolverFailed(String)
        case queryFailed(String)
        case noRecordsFound
        case timeout
        case cancelled
        case invalidResponse(String)
        
        var errorDescription: String? {
            switch self {
            case .resolverFailed(let message):
                return "DNS resolver failed: \(message)"
            case .queryFailed(let message):
                return "DNS query failed: \(message)"
            case .noRecordsFound:
                return "No TXT records found"
            case .timeout:
                return "DNS query timed out"
            case .cancelled:
                return "DNS query was cancelled"
            case .invalidResponse(let message):
                return "Invalid DNS response: \(message)"
            }
        }
    }
}

// MARK: - React Native Bridge Support

@objc(RNDNSModule)
final class RNDNSModule: NSObject {
    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    private let resolver = DNSResolver()
    
    @objc func queryTXT(
        _ domain: String,
        message: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        self.resolver.queryTXT(
            domain: domain,
            message: message,
            resolver: resolver,
            rejecter: rejecter
        )
    }
    
    @objc func isAvailable(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        let capabilities: [String: Any] = [
            "available": DNSResolver.isAvailable(),
            "platform": "ios",
            "supportsCustomServer": true,
            "supportsAsyncQuery": true
        ]
        resolver(capabilities)
    }
}