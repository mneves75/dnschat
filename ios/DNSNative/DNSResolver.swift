import Foundation
import Network

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
                try await performNetworkFrameworkQuery(domain: domain, message: message)
            }
        }
    }
    
    @available(iOS 12.0, *)
    private func performNetworkFrameworkQuery(domain: String, message: String) async throws -> [String] {
        return try await withCheckedThrowingContinuation { continuation in
            // Create resolver configuration pointing to our DNS server
            let endpoint = NWEndpoint.hostPort(
                host: NWEndpoint.Host(Self.dnsServer),
                port: NWEndpoint.Port(integerLiteral: Self.dnsPort)
            )
            
            // Create resolver with custom configuration
            let resolver = nw_resolver_create_with_endpoint(endpoint, nil)
            
            // Configure the query - use message as the domain to query
            let queryDomain = message.data(using: .utf8) ?? Data()
            
            nw_resolver_set_update_handler(resolver) { status in
                switch status {
                case .ready:
                    // Resolver is ready, perform the query
                    self.executeQuery(resolver: resolver, message: message, continuation: continuation)
                    
                case .failed(let error):
                    continuation.resume(throwing: DNSError.resolverFailed(error.localizedDescription))
                    
                case .cancelled:
                    continuation.resume(throwing: DNSError.cancelled)
                    
                default:
                    break
                }
            }
            
            // Start the resolver
            nw_resolver_start(resolver, DispatchQueue.global(qos: .userInitiated))
        }
    }
    
    @available(iOS 12.0, *)
    private func executeQuery(
        resolver: nw_resolver_t,
        message: String,
        continuation: CheckedContinuation<[String], Error>
    ) {
        // Create DNS query for TXT record
        let queryData = createDNSQuery(message: message)
        
        nw_resolver_query_txt(resolver, queryData) { records, error in
            defer {
                nw_resolver_cancel(resolver)
            }
            
            if let error = error {
                continuation.resume(throwing: DNSError.queryFailed(error.localizedDescription))
                return
            }
            
            guard let records = records else {
                continuation.resume(throwing: DNSError.noRecordsFound)
                return
            }
            
            do {
                let txtRecords = try self.parseTXTRecords(records)
                continuation.resume(returning: txtRecords)
            } catch {
                continuation.resume(throwing: error)
            }
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
    
    private func parseTXTRecords(_ records: nw_txt_record_t) throws -> [String] {
        var txtRecords: [String] = []
        
        // Parse TXT records from Network Framework response
        nw_txt_record_apply(records) { key, value in
            if let valueData = value,
               let txtString = String(data: Data(bytes: valueData, count: Int(strlen(valueData))), encoding: .utf8) {
                txtRecords.append(txtString)
            }
            return true
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
            try await Task.sleep(for: .seconds(seconds))
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