import Foundation
import Network
import React

final class AtomicFlag {
    private let lock = NSLock()
    private var value: Bool

    init(initialValue: Bool = false) {
        self.value = initialValue
    }

    func testAndSet() -> Bool {
        lock.lock()
        defer { lock.unlock() }
        if value { return false }
        value = true
        return true
    }
}

@objc(DNSResolver)
final class DNSResolver: NSObject {
    
    // MARK: - Configuration
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
        let queryName = message.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !queryName.isEmpty else {
            rejecter("DNS_QUERY_FAILED", "Query name cannot be empty", nil)
            return
        }

        let queryId = "\(domain)-\(queryName)"
        
        Task {
            do {
                // Check for existing query
                if let existingQuery = await activeQueries[queryId] {
                    let result = try await existingQuery.value
                    resolver(result)
                    return
                }
                
                // Create new query
                let queryTask = createQueryTask(server: domain, queryName: queryName)
                _ = await MainActor.run {
                    activeQueries[queryId] = queryTask
                }
                
                let result = try await queryTask.value
                
                // Clean up
                _ = await MainActor.run {
                    activeQueries.removeValue(forKey: queryId)
                }
                
                resolver(result)
                
            } catch {
                // Clean up on error
                _ = await MainActor.run {
                    activeQueries.removeValue(forKey: queryId)
                }
                
                rejecter("DNS_QUERY_FAILED", error.localizedDescription, error)
            }
        }
    }
    
    // MARK: - Private Implementation
    
    private func createQueryTask(server: String, queryName: String) -> Task<[String], Error> {
        Task { [weak self] in
            guard let self = self else {
                throw DNSError.cancelled
            }
            return try await withTimeout(seconds: Self.queryTimeout) {
                try await self.performUDPQuery(server: server, queryName: queryName)
            }
        }
    }

    @available(iOS 12.0, *)
    private func performUDPQuery(server: String, queryName: String) async throws -> [String] {
        // Build DNS query
        let queryData = try createDNSQuery(queryName: queryName)
        
        // Prepare UDP connection
        let host = NWEndpoint.Host(server)
        let port = NWEndpoint.Port(integerLiteral: Self.dnsPort)
        let params = NWParameters.udp
        let connection = NWConnection(host: host, port: port, using: params)
        
        // Await ready state with atomic protection
        let readyFlag = AtomicFlag()
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            connection.stateUpdateHandler = { state in
                switch state {
                case .ready:
                    if readyFlag.testAndSet() {
                        cont.resume()
                    }
                case .failed(let error):
                    if readyFlag.testAndSet() {
                        cont.resume(throwing: DNSError.resolverFailed(error.localizedDescription))
                    }
                case .cancelled:
                    if readyFlag.testAndSet() {
                        cont.resume(throwing: DNSError.cancelled)
                    }
                default:
                    break
                }
            }
            connection.start(queue: .global(qos: .userInitiated))
        }
        
        // Send content with atomic protection
        let sendFlag = AtomicFlag()
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            connection.send(content: queryData, completion: .contentProcessed { error in
                guard sendFlag.testAndSet() else { return }
                if let error = error {
                    cont.resume(throwing: DNSError.queryFailed(error.localizedDescription))
                } else {
                    cont.resume()
                }
            })
        }
        
        // PERFORMANCE FIX: Create timeout task OUTSIDE continuation for proper lifecycle
        // This ensures timeout task is cancelled immediately when query completes
        let receiveFlag = AtomicFlag()
        let timeoutTask = Task {
            do {
                let nanoseconds = UInt64(max(0, Self.queryTimeout) * 1_000_000_000)
                try await Task.sleep(nanoseconds: nanoseconds)
                // If we reach here without cancellation, trigger timeout
                if receiveFlag.testAndSet() {
                    connection.cancel()
                }
            } catch {
                // Task was cancelled (expected in success case)
                return
            }
        }

        // Receive response with atomic protection
        let responseData: Data
        do {
            responseData = try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Data, Error>) in
                connection.receiveMessage { data, _, _, error in
                    guard receiveFlag.testAndSet() else { return }

                    // Immediately cancel timeout task to free resources
                    timeoutTask.cancel()
                    connection.cancel()

                    if let error = error {
                        cont.resume(throwing: DNSError.queryFailed(error.localizedDescription))
                        return
                    }
                    guard let data = data, data.count >= 12 else {
                        cont.resume(throwing: DNSError.noRecordsFound)
                        return
                    }
                    cont.resume(returning: data)
                }
            }
        } catch {
            // Ensure timeout task is cancelled even if continuation throws
            timeoutTask.cancel()
            throw error
        }

        // Final cleanup
        timeoutTask.cancel()
        
        let txt = try parseDnsTxtResponse(responseData)
        if txt.isEmpty { throw DNSError.noRecordsFound }
        return txt
    }
    
    private func createDNSQuery(queryName: String) throws -> Data {
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
        let domainBytes = try encodeDomainName(
            queryName
                .trimmingCharacters(in: .whitespacesAndNewlines)
                .lowercased()
        )
        query.append(domainBytes)                               // Domain name
        query.append(contentsOf: [0x00, 0x10])                 // Type: TXT (16)
        query.append(contentsOf: [0x00, 0x01])                 // Class: IN (1)

        return query
    }

    private func encodeDomainName(_ domain: String) throws -> Data {
        var data = Data()
        let components = domain
            .split(separator: ".", omittingEmptySubsequences: true)

        guard !components.isEmpty else {
            throw DNSError.queryFailed("Query name is invalid")
        }

        for component in components {
            let label = String(component)
            if label.utf8.count > 63 {
                throw DNSError.queryFailed("DNS label exceeds 63 characters")
            }
            guard let componentData = label.data(using: .utf8) else {
                throw DNSError.queryFailed("Failed to encode DNS label")
            }
            data.append(UInt8(componentData.count))
            data.append(componentData)
        }

        data.append(0x00) // Null terminator
        return data
    }
    
    private func parseDnsTxtResponse(_ data: Data) throws -> [String] {
        var results: [String] = []
        let bytes = [UInt8](data)
        if bytes.count < 12 { return results }
        
        let anCount = Int(bytes[6]) << 8 | Int(bytes[7])
        var offset = 12

        // SECURITY FIX: Skip QNAME with bounds checking to prevent malicious DNS response crashes
        while offset < bytes.count {
            let len = Int(bytes[offset])
            offset += 1
            if len == 0 { break }

            // Validate that len doesn't cause buffer overflow
            guard offset + len <= bytes.count else {
                throw DNSError.queryFailed("Malformed DNS response: QNAME label exceeds packet bounds (offset: \(offset), len: \(len), total: \(bytes.count))")
            }
            offset += len
        }

        // Validate QTYPE + QCLASS bounds
        guard offset + 4 <= bytes.count else {
            throw DNSError.queryFailed("Malformed DNS response: insufficient bytes for QTYPE/QCLASS")
        }
        offset += 4
        
        for answerIndex in 0..<anCount {
            // Validate minimum answer record size
            guard offset + 10 <= bytes.count else {
                // Insufficient bytes for answer record, stop parsing
                break
            }

            // SECURITY FIX: Parse NAME with bounds checking (pointer or labels)
            if (bytes[offset] & 0xC0) == 0xC0 {
                // DNS compression pointer (2 bytes)
                guard offset + 2 <= bytes.count else {
                    throw DNSError.queryFailed("Malformed DNS response: compression pointer exceeds bounds at answer \(answerIndex)")
                }
                offset += 2
            } else {
                // DNS labels
                while offset < bytes.count {
                    let len = Int(bytes[offset])
                    offset += 1
                    if len == 0 { break }

                    // Validate label length doesn't exceed bounds
                    guard offset + len <= bytes.count else {
                        throw DNSError.queryFailed("Malformed DNS response: NAME label exceeds bounds at answer \(answerIndex) (offset: \(offset), len: \(len), total: \(bytes.count))")
                    }
                    offset += len
                }
            }

            // Re-validate after NAME parsing
            guard offset + 10 <= bytes.count else {
                break
            }
            let type = Int(bytes[offset]) << 8 | Int(bytes[offset + 1])
            offset += 2 // TYPE
            offset += 2 // CLASS
            offset += 4 // TTL

            // SECURITY FIX: Validate RDLENGTH bounds before using it
            guard offset + 2 <= bytes.count else {
                throw DNSError.queryFailed("Malformed DNS response: insufficient bytes for RDLENGTH")
            }
            let rdLength = Int(bytes[offset]) << 8 | Int(bytes[offset + 1])
            offset += 2

            // Validate RDATA doesn't exceed packet bounds
            guard offset + rdLength <= bytes.count else {
                throw DNSError.queryFailed("Malformed DNS response: RDATA length \(rdLength) exceeds packet bounds (offset: \(offset), total: \(bytes.count))")
            }

            if type == 16 { // TXT
                let end = offset + rdLength
                var p = offset

                // Parse TXT records with strict bounds validation
                while p < end {
                    // Ensure we can read the length byte
                    guard p < bytes.count && p < end else { break }

                    let txtLen = Int(bytes[p])
                    p += 1

                    // Validate TXT string length doesn't exceed bounds
                    if txtLen > 0 {
                        guard p + txtLen <= end && p + txtLen <= bytes.count else {
                            // Malformed TXT record, skip remaining RDATA
                            break
                        }
                        let sub = bytes[p..<(p+txtLen)]
                        if let s = String(bytes: sub, encoding: .utf8) {
                            results.append(s)
                        }
                        p += txtLen
                    } else if txtLen == 0 {
                        // Empty TXT string is valid, continue
                        continue
                    } else {
                        // Negative length is invalid
                        break
                    }
                }
            }
            offset += rdLength
        }
        return results
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
    // CRITICAL FIX: Proper timeout implementation without race conditions
    let task = Task {
        try await operation()
    }
    
    let timeoutTask = Task {
        let nanoseconds = UInt64(max(0, seconds) * 1_000_000_000)
        try await Task.sleep(nanoseconds: nanoseconds)
        task.cancel()
        throw DNSResolver.DNSError.timeout
    }
    
    do {
        let result = try await task.value
        timeoutTask.cancel()
        return result
    } catch {
        timeoutTask.cancel()
        if task.isCancelled {
            throw DNSResolver.DNSError.timeout
        }
        throw error
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
