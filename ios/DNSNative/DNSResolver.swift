import Foundation
import Network
import React

@objc(DNSResolver)
final class DNSResolver: NSObject {
    
    // MARK: - Configuration
    private static let dnsServer = "ch.at"
    private static let dnsPort: UInt16 = 53
    private static let queryTimeout: TimeInterval = 10.0
    
    // MARK: - State
    @MainActor private var activeQueries: [String: Task<[String], Error>] = [:]
    
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
        // Sanitize input
        let sanitizedMessage = sanitizeMessage(message)
        let queryId = "\(domain)-\(sanitizedMessage)"
        
        Task {
            do {
                // Check for existing query
                if let existingQuery = await activeQueries[queryId] {
                    let result = try await existingQuery.value
                    resolver(result)
                    return
                }
                
                // Create new query
                let queryTask = createQueryTask(domain: domain, message: sanitizedMessage)
                await MainActor.run {
                    activeQueries[queryId] = queryTask
                }
                
                let result = try await queryTask.value
                
                // Clean up
                await MainActor.run {
                    activeQueries.removeValue(forKey: queryId)
                }
                
                resolver(result)
                
            } catch {
                // Clean up on error
                await MainActor.run {
                    activeQueries.removeValue(forKey: queryId)
                }
                
                rejecter("DNS_QUERY_FAILED", error.localizedDescription, error)
            }
        }
    }
    
    // MARK: - Private Implementation
    
    private func createQueryTask(domain: String, message: String) -> Task<[String], Error> {
        Task {
            try await withTimeout(seconds: Self.queryTimeout) {
                try await self.performNetworkFrameworkQuery(domain: domain, message: message)
            }
        }
    }
    
    @available(iOS 12.0, *)
    private func performNetworkFrameworkQuery(domain: String, message: String) async throws -> [String] {
        return try await withCheckedThrowingContinuation { continuation in
            // Create endpoint for DNS server
            let endpoint = NWEndpoint.hostPort(
                host: NWEndpoint.Host(Self.dnsServer),
                port: NWEndpoint.Port(integerLiteral: Self.dnsPort)
            )
            
            // Create UDP connection to DNS server
            let connection = NWConnection(to: endpoint, using: .udp)
            
            // Create DNS query packet
            let queryData = createDNSQuery(message: message)
            
            // Set up state change handler
            connection.stateUpdateHandler = { [weak self] state in
                guard let self = self else { return }
                
                switch state {
                case .ready:
                    // Send DNS query
                    connection.send(content: queryData, completion: .contentProcessed { error in
                        if let error = error {
                            continuation.resume(throwing: DNSError.queryFailed(error.localizedDescription))
                            return
                        }
                        
                        // Wait for response
                        connection.receive(minimumIncompleteLength: 1, maximumLength: 512) { data, _, isComplete, error in
                            connection.cancel()
                            
                            if let error = error {
                                continuation.resume(throwing: DNSError.queryFailed(error.localizedDescription))
                                return
                            }
                            
                            guard let responseData = data else {
                                continuation.resume(throwing: DNSError.noRecordsFound)
                                return
                            }
                            
                            do {
                                let txtRecords = try self.parseDNSResponse(responseData)
                                continuation.resume(returning: txtRecords)
                            } catch {
                                continuation.resume(throwing: error)
                            }
                        }
                    })
                    
                case .failed(let error):
                    continuation.resume(throwing: DNSError.resolverFailed(error.localizedDescription))
                    
                case .cancelled:
                    continuation.resume(throwing: DNSError.cancelled)
                    
                default:
                    break
                }
            }
            
            // Start the connection
            connection.start(queue: DispatchQueue.global(qos: .userInitiated))
        }
    }
    
    private func createDNSQuery(message: String) -> Data {
        // Create a basic DNS query packet for TXT record
        var query = Data()
        
        // DNS Header (12 bytes)
        let transactionId = UInt16.random(in: 1...65535)
        query.append(contentsOf: transactionId.bigEndianBytes)  // Transaction ID
        query.append(contentsOf: [0x01, 0x00])                 // Flags: Standard query
        query.append(contentsOf: [0x00, 0x01])                 // Questions: 1
        query.append(contentsOf: [0x00, 0x00])                 // Answer RRs: 0
        query.append(contentsOf: [0x00, 0x00])                 // Authority RRs: 0
        query.append(contentsOf: [0x00, 0x00])                 // Additional RRs: 0
        
        // Question section
        let domainBytes = encodeDomainName(message)
        query.append(domainBytes)                               // Domain name
        query.append(contentsOf: [0x00, 0x10])                 // Type: TXT (16)
        query.append(contentsOf: [0x00, 0x01])                 // Class: IN (1)
        
        return query
    }
    
    private func encodeDomainName(_ domain: String) -> Data {
        var data = Data()
        let components = domain.components(separatedBy: ".")
        
        for component in components {
            let componentData = component.data(using: .utf8) ?? Data()
            data.append(UInt8(componentData.count))
            data.append(componentData)
        }
        
        data.append(0x00) // Null terminator
        return data
    }
    
    private func parseDNSResponse(_ responseData: Data) throws -> [String] {
        var txtRecords: [String] = []
        
        // Basic DNS response parsing
        guard responseData.count >= 12 else {
            throw DNSError.queryFailed("Response too short")
        }
        
        let data = Array(responseData)
        
        // Parse header
        let answerCount = UInt16(data[6]) << 8 | UInt16(data[7])
        
        guard answerCount > 0 else {
            throw DNSError.noRecordsFound
        }
        
        // Skip header (12 bytes) and question section
        var offset = 12
        
        // Skip question section
        while offset < data.count && data[offset] != 0 {
            let labelLength = Int(data[offset])
            offset += labelLength + 1
        }
        offset += 5 // Skip null terminator, type, and class
        
        // Parse answer section
        for _ in 0..<answerCount {
            guard offset + 10 < data.count else { break }
            
            // Skip name (assume compression)
            if data[offset] & 0xC0 == 0xC0 {
                offset += 2
            } else {
                while offset < data.count && data[offset] != 0 {
                    let labelLength = Int(data[offset])
                    offset += labelLength + 1
                }
                offset += 1
            }
            
            guard offset + 10 <= data.count else { break }
            
            let recordType = UInt16(data[offset]) << 8 | UInt16(data[offset + 1])
            offset += 8 // Skip type, class, TTL
            
            let dataLength = UInt16(data[offset]) << 8 | UInt16(data[offset + 1])
            offset += 2
            
            guard offset + Int(dataLength) <= data.count else { break }
            
            if recordType == 16 { // TXT record
                var txtOffset = offset
                while txtOffset < offset + Int(dataLength) {
                    let txtLength = Int(data[txtOffset])
                    txtOffset += 1
                    
                    if txtOffset + txtLength <= offset + Int(dataLength) {
                        let txtData = Data(data[txtOffset..<txtOffset + txtLength])
                        if let txtString = String(data: txtData, encoding: .utf8) {
                            txtRecords.append(txtString)
                        }
                        txtOffset += txtLength
                    } else {
                        break
                    }
                }
            }
            
            offset += Int(dataLength)
        }
        
        guard !txtRecords.isEmpty else {
            throw DNSError.noRecordsFound
        }
        
        return txtRecords
    }
    
    private func sanitizeMessage(_ message: String) -> String {
        return message
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .prefix(200)
            .replacingOccurrences(of: " ", with: "-")
            .lowercased()
    }
}

// MARK: - Extensions

extension DNSResolver {
    enum DNSError: LocalizedError {
        case resolverFailed(String)
        case queryFailed(String)
        case noRecordsFound
        case timeout
        case cancelled
        
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
            }
        }
    }
}

private extension UInt16 {
    var bigEndianBytes: [UInt8] {
        return [UInt8(self >> 8), UInt8(self & 0xFF)]
    }
}

// MARK: - Timeout Utility

private func withTimeout<T>(
    seconds: TimeInterval,
    operation: @escaping () async throws -> T
) async throws -> T {
    try await withThrowingTaskGroup(of: T.self) { group in
        group.addTask {
            try await operation()
        }
        
        group.addTask {
            try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
            throw DNSResolver.DNSError.timeout
        }
        
        let result = try await group.next()!
        group.cancelAll()
        return result
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