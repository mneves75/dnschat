import Foundation
import Network
import React
import Darwin

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
                    _ = activeQueries.removeValue(forKey: queryId)
                }
                
                resolver(result)
                
            } catch {
                // Clean up on error
                await MainActor.run {
                    _ = activeQueries.removeValue(forKey: queryId)
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
            
            connection.stateUpdateHandler = { state in
                switch state {
                case .ready:
                    // Connection is ready, send DNS query
                    self.sendDNSQuery(connection: connection, message: message, continuation: continuation)
                    
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
    
    @available(iOS 12.0, *)
    private func sendDNSQuery(
        connection: NWConnection,
        message: String,
        continuation: CheckedContinuation<[String], Error>
    ) {
        // Create DNS query for TXT record
        let queryData = createDNSQuery(message: message)
        
        connection.send(content: queryData, completion: .contentProcessed { error in
            if let error = error {
                continuation.resume(throwing: DNSError.queryFailed(error.localizedDescription))
                return
            }
            
            // Receive response
            connection.receive(minimumIncompleteLength: 1, maximumLength: 1024) { data, context, isComplete, error in
                defer {
                    connection.cancel()
                }
                
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
        // Skip DNS header (12 bytes) and query section
        var offset = 12
        
        // Skip query section - find the end of the domain name
        while offset < responseData.count {
            let length = Int(responseData[offset])
            if length == 0 {
                offset += 1 // Skip null terminator
                offset += 4 // Skip QTYPE and QCLASS
                break
            }
            offset += length + 1
        }
        
        // Parse answer section
        while offset < responseData.count - 10 {
            // Skip name (compressed format - 2 bytes)
            if responseData[offset] >= 0xC0 {
                offset += 2
            } else {
                // Skip uncompressed name
                while offset < responseData.count && responseData[offset] != 0 {
                    let length = Int(responseData[offset])
                    offset += length + 1
                }
                offset += 1 // Skip null terminator
            }
            
            // Check TYPE (should be 16 for TXT)
            guard offset + 8 < responseData.count else { break }
            let type = UInt16(responseData[offset]) << 8 | UInt16(responseData[offset + 1])
            offset += 8 // Skip TYPE, CLASS, TTL
            
            // Get RDLENGTH
            let rdLength = Int(UInt16(responseData[offset]) << 8 | UInt16(responseData[offset + 1]))
            offset += 2
            
            if type == 16 && offset + rdLength <= responseData.count {
                // Parse TXT record data
                let txtData = responseData.subdata(in: offset..<offset + rdLength)
                if let txtString = String(data: txtData, encoding: .utf8) {
                    txtRecords.append(txtString)
                }
            }
            
            offset += rdLength
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