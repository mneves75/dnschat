import Foundation
import Network
import React
import os.lock

@objc(DNSResolver)
final class DNSResolver: NSObject {
    
    // MARK: - Configuration
    // NOTE: Port is now dynamic - passed as parameter to support non-standard ports.
    private static let defaultDnsPort: UInt16 = 53
    private static let queryTimeout: TimeInterval = 10.0
    private static let maxNativeAttempts: Int = 3
    private static let retryDelayNanoseconds: UInt64 = 200_000_000 // 200ms
    private static let maxLabelLength: Int = 63
    private static let maxQNameLength: Int = 255
    private static let dnsFlagQR: UInt16 = 0x8000
    private static let dnsFlagTC: UInt16 = 0x0200
    private static let dnsOpcodeMask: UInt16 = 0x7800
    private static let dnsRcodeMask: UInt16 = 0x000F
    private static let expectedQDCount: Int = 1
    private static let defaultAllowedServers: Set<String> = [
        "llm.pieter.com",
        "ch.at",
        "8.8.8.8",
        "8.8.4.4",
        "1.1.1.1",
        "1.0.0.1",
    ]
    private static var allowedServers: Set<String> = defaultAllowedServers
    // MARK: - State
    @MainActor private var activeQueries: [String: Task<[String], Error>] = [:]

    func cleanup() {
        Task { @MainActor in
            for (_, task) in activeQueries {
                task.cancel()
            }
            activeQueries.removeAll()
        }
    }

    private struct DnsQuery {
        let payload: Data
        let transactionId: UInt16
        let normalizedName: String
    }
    
    // MARK: - Public Interface
    
    @objc static func isAvailable() -> Bool {
        // Network.framework available since iOS 12.0, but ResumeGate (OSAllocatedUnfairLock)
        // requires iOS 16.0+, so that's our effective minimum.
        if #available(iOS 16.0, *) {
            return true
        }
        return false
    }
    
    @objc func queryTXT(
        domain: String,
        message: String,
        port: NSNumber,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        let dnsPort = port.uint16Value > 0 ? port.uint16Value : Self.defaultDnsPort
        let normalizedDomain: String
        do {
            normalizedDomain = try Self.normalizeServerHost(domain)
        } catch {
            rejecter("DNS_QUERY_FAILED", error.localizedDescription, error)
            return
        }
        let queryName: String
        do {
            // Ensure Unicode input matches JS sanitization (fold accents, enforce ASCII)
            queryName = try normalizeQueryName(message)
        } catch {
            rejecter("DNS_QUERY_FAILED", error.localizedDescription, error)
            return
        }

        let queryId = "\(normalizedDomain):\(dnsPort)-\(queryName)"
        
        Task {
            do {
                // Check for existing query
                let existingQuery = await MainActor.run { self.activeQueries[queryId] }
                if let existingQuery {
                    let result = try await existingQuery.value
                    resolver(result)
                    return
                }
                
                // Create new query with dynamic port
                let queryTask = createQueryTask(server: normalizedDomain, queryName: queryName, port: dnsPort)
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
    
    private func createQueryTask(server: String, queryName: String, port: UInt16) -> Task<[String], Error> {
        Task {
            try await withTimeout(seconds: Self.queryTimeout) {
                for attempt in 0..<Self.maxNativeAttempts {
                    do {
                        return try await self.performUDPQuery(server: server, queryName: queryName, port: port)
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

    @available(iOS 16.0, *)
    private func performUDPQuery(server: String, queryName: String, port: UInt16) async throws -> [String] {
        // Build DNS query
        let query = try createDNSQuery(queryName: queryName)

        // Prepare UDP connection with dynamic port
        let host = NWEndpoint.Host(server)
        let dnsPort = NWEndpoint.Port(integerLiteral: port)
        let params = NWParameters.udp
        let connection = NWConnection(host: host, port: dnsPort, using: params)

        // CRITICAL: Wait for connection ready state
        //
        // Race Condition: Network.framework's stateUpdateHandler can fire multiple times:
        // - ready → waiting → ready (network fluctuation, DNS server temporarily unreachable)
        // - ready + cancelled (if connection.cancel() called externally)
        // - failed + cancelled (multiple error paths racing)
        //
        // Without ResumeGate, we'd crash with "Continuation already resumed" if state transitions
        // rapidly or error paths race. Gate ensures cont.resume() called exactly once.
        //
        // Serial Queue: connection.start(queue:) specifies execution queue, but does NOT
        // prevent rapid state changes - a single-threaded queue can still deliver
        // ready → failed → cancelled in quick succession, each trying to resume.
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            let gate = ResumeGate()

            connection.stateUpdateHandler = { state in
                switch state {
                case .ready:
                    gate.tryResume {
                        connection.stateUpdateHandler = nil
                        cont.resume()
                    }
                case .failed(let error):
                    gate.tryResume {
                        connection.stateUpdateHandler = nil
                        cont.resume(throwing: DNSError.resolverFailed(error.localizedDescription))
                    }
                case .cancelled:
                    gate.tryResume {
                        connection.stateUpdateHandler = nil
                        cont.resume(throwing: DNSError.cancelled)
                    }
                default:
                    break
                }
            }
            connection.start(queue: .global(qos: .userInitiated))
        }

        // Send DNS query packet
        //
        // Race Condition: NWConnection.send completion can fire multiple times:
        // - Success callback + connection cancelled externally
        // - Error callback + connection state change triggering cancellation
        //
        // Gate ensures first completion wins, subsequent calls ignored.
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            let gate = ResumeGate()

            connection.send(content: query.payload, completion: .contentProcessed { error in
                gate.tryResume {
                    if let error = error {
                        cont.resume(throwing: DNSError.queryFailed(error.localizedDescription))
                    } else {
                        cont.resume()
                    }
                }
            })
        }

        // Receive DNS response packet
        //
        // Race Condition: NWConnection.receiveMessage can deliver multiple callbacks:
        // - Data received + connection error (partial read then socket error)
        // - Data received + connection.cancel() triggers cancellation callback
        // - Timeout from withTimeout wrapper + data arrives simultaneously
        //
        // We call connection.cancel() inside the gate to clean up, but cancellation itself
        // may trigger another callback. Gate ensures we only resume continuation once.
        let responseData: Data = try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Data, Error>) in
            let gate = ResumeGate()

            connection.receiveMessage { data, _, _, error in
                gate.tryResume {
                    // Cancel connection inside gate to prevent races with cancellation callback
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
        }

        let txt = try parseDnsTxtResponse(
            responseData,
            expectedTransactionId: query.transactionId,
            expectedQueryName: query.normalizedName
        )
        if txt.isEmpty { throw DNSError.noRecordsFound }
        return txt
    }

    private func createDNSQuery(queryName: String) throws -> DnsQuery {
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

        return DnsQuery(payload: query, transactionId: transactionId, normalizedName: queryName)
    }

    private func encodeDomainName(_ domain: String) throws -> Data {
        var data = Data()
        let normalizedDomain = try normalizeQueryName(domain)
        let components = normalizedDomain.split(separator: ".", omittingEmptySubsequences: true)

        guard !components.isEmpty else {
            throw DNSError.queryFailed("Query name is invalid")
        }

        for component in components {
            let label = String(component)
            if label.utf8.count > DNSResolver.maxLabelLength {
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
    
    private func parseDnsTxtResponse(
        _ data: Data,
        expectedTransactionId: UInt16,
        expectedQueryName: String
    ) throws -> [String] {
        var results: [String] = []
        let bytes = [UInt8](data)

        // DNS header is 12 bytes - reject malformed responses explicitly
        guard bytes.count >= 12 else {
            throw DNSError.queryFailed("Response too short: \(bytes.count) bytes, minimum 12 required")
        }

        let responseId = (UInt16(bytes[0]) << 8) | UInt16(bytes[1])
        if responseId != expectedTransactionId {
            throw DNSError.queryFailed("DNS response ID mismatch - possible spoofing attempt")
        }

        let flags = (UInt16(bytes[2]) << 8) | UInt16(bytes[3])
        if (flags & Self.dnsFlagQR) == 0 {
            throw DNSError.queryFailed("DNS response missing QR flag")
        }
        let opcode = (flags & Self.dnsOpcodeMask) >> 11
        if opcode != 0 {
            throw DNSError.queryFailed("DNS response opcode not standard query")
        }
        if (flags & Self.dnsFlagTC) != 0 {
            throw DNSError.queryFailed("DNS response truncated (TC=1)")
        }
        let rcode = flags & Self.dnsRcodeMask
        if rcode != 0 {
            throw DNSError.queryFailed("DNS response rcode=\(rcode)")
        }

        let qdCount = Int(bytes[4]) << 8 | Int(bytes[5])
        let anCount = Int(bytes[6]) << 8 | Int(bytes[7])
        if qdCount != Self.expectedQDCount {
            throw DNSError.queryFailed("DNS response QDCOUNT=\(qdCount)")
        }

        var offset = 12
        // Skip QNAME
        for _ in 0..<qdCount {
            let (questionName, nextOffset) = try readName(bytes: bytes, offset: offset)
            offset = nextOffset
            if questionName != expectedQueryName {
                throw DNSError.queryFailed("DNS response question name mismatch")
            }
            guard offset + 4 <= bytes.count else {
                throw DNSError.queryFailed("DNS response question truncated")
            }
            let qtype = (UInt16(bytes[offset]) << 8) | UInt16(bytes[offset + 1])
            offset += 2
            let qclass = (UInt16(bytes[offset]) << 8) | UInt16(bytes[offset + 1])
            offset += 2
            if qtype != 16 || qclass != 1 {
                throw DNSError.queryFailed("DNS response question type/class mismatch")
            }
        }
        
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

    private func readName(bytes: [UInt8], offset: Int) throws -> (String, Int) {
        var labels: [String] = []
        var currentOffset = offset
        var nextOffset = offset
        var jumped = false
        var jumps = 0

        while currentOffset < bytes.count {
            let len = Int(bytes[currentOffset])
            if len == 0 {
                currentOffset += 1
                if !jumped {
                    nextOffset = currentOffset
                }
                break
            }

            if (len & 0xC0) == 0xC0 {
                guard currentOffset + 1 < bytes.count else {
                    throw DNSError.queryFailed("DNS response name pointer truncated")
                }
                let pointer = ((len & 0x3F) << 8) | Int(bytes[currentOffset + 1])
                guard pointer < bytes.count else {
                    throw DNSError.queryFailed("DNS response name pointer out of range")
                }
                if !jumped {
                    nextOffset = currentOffset + 2
                }
                currentOffset = pointer
                jumped = true
                jumps += 1
                if jumps > 10 {
                    throw DNSError.queryFailed("DNS response name pointer loop")
                }
                continue
            }

            currentOffset += 1
            guard currentOffset + len <= bytes.count else {
                throw DNSError.queryFailed("DNS response name truncated")
            }
            let labelBytes = bytes[currentOffset..<(currentOffset + len)]
            guard let label = String(bytes: labelBytes, encoding: .utf8) else {
                throw DNSError.queryFailed("DNS response name decode failed")
            }
            labels.append(label)
            currentOffset += len
            if !jumped {
                nextOffset = currentOffset
            }
        }

        let name = labels.joined(separator: ".").lowercased()
        return (name, nextOffset)
    }

    // MARK: - Sanitization helpers

    /// Enforces the exact same DNS label sanitization contract as the JS reference implementation.
    private func normalizeQueryName(_ rawValue: String) throws -> String {
        let trimmed = rawValue.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            throw DNSError.queryFailed("Query name cannot be empty")
        }

        let labels = trimmed.split(separator: ".", omittingEmptySubsequences: true)
        guard !labels.isEmpty else {
            throw DNSError.queryFailed("Query name is invalid")
        }

        var normalizedLabels: [String] = []
        normalizedLabels.reserveCapacity(labels.count)

        var totalLength = 1 // account for the root terminator

        for label in labels {
            let sanitized = try sanitizeLabel(label)
            normalizedLabels.append(sanitized)
            totalLength += sanitized.count + 1
            if totalLength > DNSResolver.maxQNameLength {
                throw DNSError.queryFailed("DNS query name exceeds 255 characters")
            }
        }

        return normalizedLabels.joined(separator: ".")
    }

    /// Mirrors sanitizeDNSMessageReference from the TypeScript implementation so all platforms agree.
    /// Steps: Unicode NFKD decomposition → strip combining marks → lowercase ASCII + dash rules.
    private func sanitizeLabel(_ rawLabel: Substring) throws -> String {
        let asciiFolded = foldUnicode(String(rawLabel))
        var label = asciiFolded.lowercased()

        label = label.replacingOccurrences(of: "\\s+", with: "-", options: .regularExpression)
        label = label.replacingOccurrences(of: "[^a-z0-9-]", with: "", options: .regularExpression)
        label = label.replacingOccurrences(of: "-{2,}", with: "-", options: .regularExpression)
        label = label.replacingOccurrences(of: "^-+|-+$", with: "", options: .regularExpression)

        guard !label.isEmpty else {
            throw DNSError.queryFailed("DNS label must contain at least one alphanumeric character after sanitization")
        }

        if label.count > DNSResolver.maxLabelLength {
            throw DNSError.queryFailed("DNS label exceeds 63 characters after sanitization")
        }

        return label
    }

    private func foldUnicode(_ value: String) -> String {
        // Match JS sanitizeDNSMessageReference: compatibility decomposition (NFKD) then strip combining marks.
        let decomposed = value.decomposedStringWithCompatibilityMapping
        let scalars = decomposed.unicodeScalars.filter { !$0.properties.isDiacritic }
        return String(String.UnicodeScalarView(scalars))
    }

    private static func normalizeServerHostInput(_ value: String) -> String {
        var trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        while trimmed.hasSuffix(".") {
            trimmed.removeLast()
        }
        return trimmed
    }

    private static func normalizeServerHost(_ value: String) throws -> String {
        let trimmed = normalizeServerHostInput(value)
        guard !trimmed.isEmpty else {
            throw DNSError.queryFailed("DNS domain cannot be empty")
        }
        if !allowedServers.contains(trimmed) {
            throw DNSError.queryFailed("DNS server not allowed")
        }
        return trimmed
    }

    static func updateAllowedServers(_ config: [String: Any]) throws -> Bool {
        guard let servers = config["allowedServers"] as? [String] else {
            return false
        }
        let normalized = servers.map { normalizeServerHostInput($0) }
        let filtered = normalized.filter { !$0.isEmpty }
        guard !filtered.isEmpty else {
            throw DNSError.queryFailed("Allowed DNS server list cannot be empty")
        }
        let updated = Set(filtered)
        if updated == allowedServers {
            return false
        }
        allowedServers = updated
        return true
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

/// Thread-safe gate ensuring a continuation resumes exactly once.
///
/// ## Problem
/// Network.framework callbacks (`stateUpdateHandler`, `send completion`, `receiveMessage`)
/// can fire multiple times or race on concurrent queues:
/// - `stateUpdateHandler` may fire: ready → waiting → ready (network fluctuation)
/// - Multiple error paths can trigger simultaneously (cancel + timeout)
/// - Calling `CheckedContinuation.resume()` twice crashes with "already resumed"
///
/// ## Solution
/// This gate ensures exactly-once execution semantics. First thread to call `tryResume`
/// executes the action; subsequent calls are no-ops.
///
/// ## Thread Safety
/// Uses `OSAllocatedUnfairLock` (iOS 16+) for optimal performance:
/// - Unfair scheduling (no FIFO guarantee) - acceptable since only one winner needed
/// - No heap allocation (inline storage) - faster than NSLock
/// - Modern Swift idiom with `withLock` closure
///
/// ## Sendable Conformance
/// Marked `@unchecked Sendable` because:
/// - Contains mutable state (`hasResumed`) protected by lock
/// - Lock guarantees serial access across concurrent callers
/// - Cannot express "lock-protected mutable state" in Swift type system
/// - Manual verification: all access to `hasResumed` occurs within `lock.withLock`
///
/// Reference: Swift Concurrency - Sendable Types (SE-0302)
@available(iOS 16.0, *)
internal final class ResumeGate: @unchecked Sendable {
    private let lock = OSAllocatedUnfairLock()
    private var hasResumed = false

    /// Executes `action` exactly once in a thread-safe manner.
    ///
    /// - Parameter action: Closure to execute. Called outside lock to avoid holding
    ///   lock during potentially long-running continuation resume.
    /// - Note: Safe to call concurrently from multiple threads. First caller wins.
    func tryResume(_ action: () -> Void) {
        // Determine winner inside lock, execute outside lock
        let shouldRun = lock.withLock {
            let should = !hasResumed
            if should {
                hasResumed = true
            }
            return should
        }

        // Execute action outside lock to prevent deadlock if action acquires other locks
        if shouldRun {
            action()
        }
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
final class RNDNSModule: NSObject, RCTInvalidating {
    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    private let resolver = DNSResolver()
    
    @objc func queryTXT(
        _ domain: String,
        message: String,
        port: NSNumber,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        self.resolver.queryTXT(
            domain: domain,
            message: message,
            port: port,
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

    @objc func configureSanitizer(
        _ config: NSDictionary,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        do {
            let updated = try DNSResolver.updateAllowedServers(config as? [String: Any] ?? [:])
            resolver(updated)
        } catch {
            rejecter("SANITIZER_CONFIG_INVALID", error.localizedDescription, error)
        }
    }

    @objc func invalidate() {
        resolver.cleanup()
    }
}
