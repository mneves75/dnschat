import Foundation
import Network
import React

@objc(DNSResolver)
final class DNSResolver: NSObject {
    
    // MARK: - Configuration
    private static let dnsPort: UInt16 = 53
    private static let queryTimeout: TimeInterval = 10.0
    private static let maxNativeAttempts: Int = 3
    private static let retryDelayNanoseconds: UInt64 = 200_000_000 // 200ms
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
                let existingQuery = await MainActor.run { self.activeQueries[queryId] }
                if let existingQuery {
                    let result = try await existingQuery.value
                    resolver(result)
                    return
                }
                
                // Create new query
                let queryTask = createQueryTask(server: domain, queryName: queryName)
                _ = await MainActor.run { self.activeQueries[queryId] = queryTask }

                let result = try await queryTask.value
                
                // Clean up
                _ = await MainActor.run { self.activeQueries.removeValue(forKey: queryId) }

                resolver(result)
                
            } catch {
                // Clean up on error
                _ = await MainActor.run { self.activeQueries.removeValue(forKey: queryId) }

                rejecter("DNS_QUERY_FAILED", error.localizedDescription, error)
            }
        }
    }
    
    // MARK: - Private Implementation
    
    private func createQueryTask(server: String, queryName: String) -> Task<[String], Error> {
        Task {
            try await withTimeout(seconds: Self.queryTimeout) {
                for attempt in 0..<Self.maxNativeAttempts {
                    do {
                        return try await self.performUDPQuery(server: server, queryName: queryName)
                    } catch let error as DNSError {
                        if case .noRecordsFound = error, attempt < Self.maxNativeAttempts - 1 {
                            try await Task.sleep(nanoseconds: Self.retryDelayNanoseconds)
                            continue
                        }
                        throw error
                    } catch {
                        throw error
                    }
                }
                throw DNSError.noRecordsFound
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

        // CRITICAL: Wait for connection ready state
        // Thread Safety: All callbacks execute on .global(qos: .userInitiated) queue (specified in start()),
        // providing serial execution guarantees. No concurrent access to isResumed is possible.
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            // Guard against double-resume: NWConnection.stateUpdateHandler fires multiple times
            // (e.g., .ready, then later .cancelled when timeout fires or connection is torn down)
            var isResumed = false

            connection.stateUpdateHandler = { state in
                // CRITICAL: CheckedContinuation can only resume ONCE. If stateUpdateHandler fires
                // after we've already resumed (e.g., .ready followed by .cancelled), attempting
                // a second resume triggers EXC_BREAKPOINT crash. This guard prevents that.
                guard !isResumed else { return }

                switch state {
                case .ready:
                    isResumed = true
                    cont.resume()
                case .failed(let error):
                    isResumed = true
                    cont.resume(throwing: DNSError.resolverFailed(error.localizedDescription))
                case .cancelled:
                    isResumed = true
                    cont.resume(throwing: DNSError.cancelled)
                default:
                    break
                }
            }
            connection.start(queue: .global(qos: .userInitiated))
        }

        // Send DNS query packet
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            var isResumed = false

            connection.send(content: queryData, completion: .contentProcessed { error in
                // Defensive: NWConnection.send completion should only fire once, but guard anyway
                guard !isResumed else { return }
                isResumed = true

                if let error = error {
                    cont.resume(throwing: DNSError.queryFailed(error.localizedDescription))
                } else {
                    cont.resume()
                }
            })
        }

        // Receive DNS response packet
        let responseData: Data = try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Data, Error>) in
            var isResumed = false

            connection.receiveMessage { data, _, _, error in
                // CRITICAL ORDER: Set isResumed flag BEFORE calling connection.cancel()
                // Reason: cancel() may synchronously trigger stateUpdateHandler with .cancelled state.
                // If we cancel first, stateUpdateHandler sees isResumed=false and attempts to resume
                // the continuation with .cancelled, then we try to resume with data → double-resume crash.
                guard !isResumed else { return }
                isResumed = true

                // Now safe to cancel: flag is set, preventing stateUpdateHandler from resuming
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
        let domainBytes = try encodeDomainName(queryName)
        query.append(domainBytes)                               // Domain name
        query.append(contentsOf: [0x00, 0x10])                 // Type: TXT (16)
        query.append(contentsOf: [0x00, 0x01])                 // Class: IN (1)

        return query
    }

    private func encodeDomainName(_ domain: String) throws -> Data {
        var data = Data()
        let components = domain
            .trimmingCharacters(in: .whitespacesAndNewlines)
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
        // Skip QNAME
        while offset < bytes.count {
            let len = Int(bytes[offset])
            offset += 1
            if len == 0 { break }
            offset += len
        }
        // Skip QTYPE + QCLASS
        offset += 4
        
        for _ in 0..<anCount {
            if offset + 10 > bytes.count { break }
            // NAME (pointer or labels)
            if (bytes[offset] & 0xC0) == 0xC0 {
                offset += 2
            } else {
                while offset < bytes.count {
                    let len = Int(bytes[offset])
                    offset += 1
                    if len == 0 { break }
                    offset += len
                }
            }
            if offset + 10 > bytes.count { break }
            let type = Int(bytes[offset]) << 8 | Int(bytes[offset + 1])
            offset += 2 // TYPE
            offset += 2 // CLASS
            offset += 4 // TTL
            let rdLength = Int(bytes[offset]) << 8 | Int(bytes[offset + 1])
            offset += 2
            if type == 16 && offset + rdLength <= bytes.count { // TXT
                let end = offset + rdLength
                var p = offset
                while p < end {
                    let txtLen = Int(bytes[p])
                    p += 1
                    if txtLen > 0 && p + txtLen <= end {
                        let sub = bytes[p..<(p+txtLen)]
                        if let s = String(bytes: sub, encoding: .utf8) {
                            results.append(s)
                        }
                        p += txtLen
                    } else { break }
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
    try await withThrowingTaskGroup(of: T.self) { group in
        group.addTask {
            try await operation()
        }
        
        group.addTask {
            let nanoseconds = UInt64((max(seconds, 0) * 1_000_000_000).rounded())
            try await Task.sleep(nanoseconds: nanoseconds)
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
