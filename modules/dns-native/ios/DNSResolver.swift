import Foundation
import Network
import React
import os.lock

@objc(DNSResolver)
final class DNSResolver: NSObject {
    
    // MARK: - Configuration
    // Only the standard DNS port is accepted: JS never sends another port and a
    // hijacked bundle must not be able to aim the allowlisted hosts elsewhere.
    private static let allowedDnsPort: UInt16 = 53
    private static let udpAttemptTimeout: TimeInterval = 3.0
    private static let tcpAttemptTimeout: TimeInterval = 6.0
    // A UDP timeout is non-terminal (udpThenTCP falls through to TCP), so the sub-10s
    // budget takes its slack from UDP and preserves the original 6s TCP window — a TCP
    // timeout IS terminal. Two invariants:
    // 1. queryTimeout > udpAttemptTimeout + tcpAttemptTimeout, so the outer budget can
    //    accommodate one full udpThenTCP attempt (UDP then TCP fallback) plus slack —
    //    the pre-2026-07 8s budget truncated a valid slow TCP fallback mid-flight.
    // 2. queryTimeout < the JS caller's 10s DNSService.TIMEOUT, so the native side always
    //    settles (and cleans up its sockets) BEFORE the JS Promise.race abandons it —
    //    Promise.race cannot cancel native work, and a native-side timeout is classified
    //    correctly (TIMEOUT) by the JS error mapper, unlike a generic JS-side cutoff.
    private static let queryTimeout: TimeInterval = udpAttemptTimeout + tcpAttemptTimeout + 0.5  // 9.5s
    private static let maxNativeAttempts: Int = 3
    private static let maxLabelLength: Int = 63
    private static let maxQNameLength: Int = 255
    private static let dnsFlagQR: UInt16 = 0x8000
    private static let dnsFlagTC: UInt16 = 0x0200
    private static let dnsOpcodeMask: UInt16 = 0x7800
    private static let dnsRcodeMask: UInt16 = 0x000F
    private static let expectedQDCount: Int = 1
    // Deliberately narrower than ALLOWED_DNS_SERVERS in constants.ts: the native
    // transport speaks only to the LLM zones, never to a public recursive resolver.
    // Native narrows by intersection, so this must stay a SUBSET of the TS list
    // (enforced by nativeSecurityPolicy.test.ts).
    private static let defaultAllowedServers: Set<String> = [
        "llm.pieter.com",
        "ch.at",
    ]
    /// Thread-safe storage for allowed servers using actor isolation.
    /// Protects against data races when reading/writing from concurrent tasks.
    @MainActor
    private static var allowedServers: Set<String> = defaultAllowedServers
    // MARK: - State
    @MainActor private var nextOperationId: UInt64 = 0
    @MainActor private var activeQueries: [UInt64: Task<[String], Error>] = [:]

    /// Cancels all active queries and clears the operation registry.
    /// - Note: Must be called from MainActor. Task.cancel() is immediate;
    ///   actual query completion happens asynchronously.
    @MainActor
    func cleanup() {
        _ = cancelActiveQueries()
    }

    /// Cancels all in-flight work while keeping the resolver reusable.
    /// - Returns: Number of query tasks that were active when cancellation began.
    @MainActor
    @discardableResult
    func cancelActiveQueries() -> Int {
        let cancelledCount = activeQueries.count
        for (_, task) in activeQueries {
            task.cancel()
        }
        activeQueries.removeAll()
        return cancelledCount
    }

    @MainActor
    private func registerActiveQuery(_ task: Task<[String], Error>) -> UInt64 {
        repeat {
            nextOperationId &+= 1
        } while activeQueries[nextOperationId] != nil
        activeQueries[nextOperationId] = task
        return nextOperationId
    }

    private struct DnsQuery {
        let payload: Data
        let transactionId: UInt16
        let normalizedName: String
    }

    private enum NativeTransport: String {
        case udpOnly
        case tcpOnly
        case udpThenTCP
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
        deadlineEpochMs: NSNumber,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        queryTXT(
            domain: domain,
            message: message,
            port: port,
            deadlineEpochMs: deadlineEpochMs,
            transport: .udpThenTCP,
            resolver: resolver,
            rejecter: rejecter
        )
    }

    @objc func queryTXTUDP(
        domain: String,
        message: String,
        port: NSNumber,
        deadlineEpochMs: NSNumber,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        queryTXT(
            domain: domain,
            message: message,
            port: port,
            deadlineEpochMs: deadlineEpochMs,
            transport: .udpOnly,
            resolver: resolver,
            rejecter: rejecter
        )
    }

    @objc func queryTXTTCP(
        domain: String,
        message: String,
        port: NSNumber,
        deadlineEpochMs: NSNumber,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        queryTXT(
            domain: domain,
            message: message,
            port: port,
            deadlineEpochMs: deadlineEpochMs,
            transport: .tcpOnly,
            resolver: resolver,
            rejecter: rejecter
        )
    }

    private func queryTXT(
        domain: String,
        message: String,
        port: NSNumber,
        deadlineEpochMs: NSNumber,
        transport: NativeTransport,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        let requestedPort = port.intValue
        guard requestedPort == Int(Self.allowedDnsPort) else {
            rejecter("QUERY_FAILED", "Invalid DNS port: \(requestedPort). Only port \(Self.allowedDnsPort) is allowed.", nil)
            return
        }
        let dnsPort = Self.allowedDnsPort

        // Translate the caller's wall-clock deadline exactly once at the native
        // boundary. The transport chain uses only this monotonic instant, so a
        // later wall-clock adjustment cannot lengthen the query.
        let requestedDeadlineMs = deadlineEpochMs.doubleValue
        let nowEpochMs = Date().timeIntervalSince1970 * 1_000
        guard requestedDeadlineMs.isFinite,
              requestedDeadlineMs == requestedDeadlineMs.rounded(.towardZero),
              requestedDeadlineMs <= 9_007_199_254_740_991 else {
            rejecter("DNS_DEADLINE_INVALID", "Invalid DNS query deadline: expected safe integer epoch milliseconds.", nil)
            return
        }
        guard requestedDeadlineMs > nowEpochMs else {
            rejecter("TIMEOUT", "DNS query deadline has already expired.", nil)
            return
        }
        let requestedBudgetSeconds = (requestedDeadlineMs - nowEpochMs) / 1_000
        let nativeBudgetSeconds = min(requestedBudgetSeconds, Self.queryTimeout)
        let deadline = ContinuousClock().now.advanced(by: .seconds(nativeBudgetSeconds))

        // Pre-validate message format synchronously (doesn't need MainActor)
        let queryName: String
        do {
            // Ensure Unicode input matches JS sanitization (fold accents, enforce ASCII)
            queryName = try normalizeQueryName(message)
        } catch {
            Self.reject(rejecter, error)
            return
        }

        // Use Task with @MainActor to safely access allowedServers and activeQueries
        Task { @MainActor in
            // CRITICAL: Defensive guard for iOS 16+ requirement.
            // isAvailable() should be checked by JS before calling queryTXT,
            // but we add this guard to prevent crashes if that check is bypassed.
            guard #available(iOS 16.0, *) else {
                rejecter("RESOLVER_FAILED", "DNS native module requires iOS 16.0+", nil)
                return
            }

            // Validate server on MainActor where allowedServers is isolated
            let normalizedDomain: String
            do {
                normalizedDomain = try Self.normalizeServerHost(domain)
            } catch {
                Self.reject(rejecter, error)
                return
            }

            // Zone pin: the allowlist fixes the resolver, this fixes the zone. Without
            // it a hijacked bundle could tunnel data as "<chunk>.attacker.tld" through an
            // allowlisted host. Mirrors composeDNSQueryName in dnsService.ts.
            guard Self.isQueryName(queryName, inZone: normalizedDomain) else {
                rejecter("QUERY_FAILED", "DNS query name is outside the allowed zone", nil)
                return
            }

            do {
                try Self.ensureTimeRemaining(until: deadline)
                let queryTask = self.createQueryTask(
                    server: normalizedDomain,
                    queryName: queryName,
                    port: dnsPort,
                    transport: transport,
                    deadline: deadline
                )
                let operationId = self.registerActiveQuery(queryTask)
                defer {
                    self.activeQueries.removeValue(forKey: operationId)
                }

                let result = try await queryTask.value

                resolver(result)

            } catch {
                Self.reject(rejecter, error)
            }
        }
    }

    /// Single reject path: the bridge code is derived from the DNSError case so JS
    /// classifies by code, never by English substrings.
    nonisolated private static func reject(_ rejecter: RCTPromiseRejectBlock, _ error: Error) {
        let code: String
        if let dnsError = error as? DNSError {
            code = dnsError.bridgeCode
        } else if error is CancellationError {
            code = DNSError.cancelled.bridgeCode
        } else {
            code = DNSError.queryFailed("").bridgeCode
        }
        rejecter(code, error.localizedDescription, error)
    }

    nonisolated private static func isQueryName(_ queryName: String, inZone zone: String) -> Bool {
        let suffix = "." + zone
        guard queryName.hasSuffix(suffix) else { return false }
        let label = queryName.dropLast(suffix.count)
        return !label.isEmpty && label.count <= maxLabelLength && !label.contains(".")
    }
    
    // MARK: - Private Implementation
    
    /// Creates an async task to perform the DNS query with retry logic.
    /// - Note: Requires iOS 16.0+ for Network.framework and Task.sleep(for:) APIs.
    @available(iOS 16.0, *)
    nonisolated private func createQueryTask(
        server: String,
        queryName: String,
        port: UInt16,
        transport: NativeTransport,
        deadline: ContinuousClock.Instant
    ) -> Task<[String], Error> {
        Task {
            do {
                return try await withDeadline(deadline: deadline) {
                    for attempt in 0..<Self.maxNativeAttempts {
                        try Self.ensureTimeRemaining(until: deadline)

                        do {
                            return try await self.performQuery(
                                server: server,
                                queryName: queryName,
                                port: port,
                                transport: transport,
                                deadline: deadline
                            )
                        } catch let error as DNSError {
                            if error.isNoRecordsFound, attempt < Self.maxNativeAttempts - 1 {
                                try await Self.sleepBeforeRetry(until: deadline)
                                continue
                            }
                            throw error
                        }
                    }
                    throw DNSError.noRecordsFound
                }
            } catch is CancellationError {
                // Convert Swift's CancellationError to our DNSError.cancelled for consistent error handling
                throw DNSError.cancelled
            }
        }
    }

    @available(iOS 16.0, *)
    nonisolated private func performQuery(
        server: String,
        queryName: String,
        port: UInt16,
        transport: NativeTransport,
        deadline: ContinuousClock.Instant
    ) async throws -> [String] {
        switch transport {
        case .udpOnly:
            let udpDeadline = try Self.stageDeadline(
                overall: deadline,
                maxSeconds: Self.udpAttemptTimeout
            )
            return try await withDeadline(deadline: udpDeadline) {
                try await self.performUDPQuery(
                    server: server,
                    queryName: queryName,
                    port: port,
                    deadline: udpDeadline
                )
            }
        case .tcpOnly:
            let tcpDeadline = try Self.stageDeadline(
                overall: deadline,
                maxSeconds: Self.tcpAttemptTimeout
            )
            return try await withDeadline(deadline: tcpDeadline) {
                try await self.performTCPQuery(
                    server: server,
                    queryName: queryName,
                    port: port,
                    deadline: tcpDeadline
                )
            }
        case .udpThenTCP:
            do {
                let udpDeadline = try Self.stageDeadline(
                    overall: deadline,
                    maxSeconds: Self.udpAttemptTimeout
                )
                return try await withDeadline(deadline: udpDeadline) {
                    try await self.performUDPQuery(
                        server: server,
                        queryName: queryName,
                        port: port,
                        deadline: udpDeadline
                    )
                }
            } catch {
                try Self.ensureTimeRemaining(until: deadline)
                let udpFailure = error.localizedDescription
                let tcpDeadline = try Self.stageDeadline(
                    overall: deadline,
                    maxSeconds: Self.tcpAttemptTimeout
                )
                do {
                    return try await withDeadline(deadline: tcpDeadline) {
                        try await self.performTCPQuery(
                            server: server,
                            queryName: queryName,
                            port: port,
                            deadline: tcpDeadline
                        )
                    }
                } catch is CancellationError {
                    throw DNSError.cancelled
                } catch let dnsError as DNSError {
                    switch dnsError {
                    case .timeout, .cancelled:
                        throw dnsError
                    default:
                        throw DNSError.fallbackFailed(udpFailure: udpFailure, terminal: dnsError)
                    }
                } catch {
                    throw DNSError.fallbackFailed(
                        udpFailure: udpFailure,
                        terminal: .queryFailed(error.localizedDescription)
                    )
                }
            }
        }
    }

    @available(iOS 16.0, *)
    nonisolated private static func ensureTimeRemaining(
        until deadline: ContinuousClock.Instant
    ) throws {
        try Task.checkCancellation()
        guard ContinuousClock().now < deadline else {
            throw DNSError.timeout
        }
    }

    @available(iOS 16.0, *)
    nonisolated private static func stageDeadline(
        overall deadline: ContinuousClock.Instant,
        maxSeconds: TimeInterval
    ) throws -> ContinuousClock.Instant {
        try ensureTimeRemaining(until: deadline)
        let stageCap = ContinuousClock().now.advanced(by: .seconds(maxSeconds))
        return min(deadline, stageCap)
    }

    @available(iOS 16.0, *)
    nonisolated private static func sleepBeforeRetry(
        until deadline: ContinuousClock.Instant
    ) async throws {
        try ensureTimeRemaining(until: deadline)
        let clock = ContinuousClock()
        let wake = min(deadline, clock.now.advanced(by: .milliseconds(200)))
        try await clock.sleep(until: wake)
        try ensureTimeRemaining(until: deadline)
    }

    /// Performs the actual UDP DNS query.
    /// - Note: Marked nonisolated to run off the MainActor in Swift 6.2+.
    ///   For Swift 6.2+ with NonisolatedNonsendingByDefault, add @concurrent.
    @available(iOS 16.0, *)
    nonisolated private func performUDPQuery(
        server: String,
        queryName: String,
        port: UInt16,
        deadline: ContinuousClock.Instant
    ) async throws -> [String] {
        try Self.ensureTimeRemaining(until: deadline)
        // Build DNS query
        let query = try createDNSQuery(queryName: queryName)

        // Prepare UDP connection with dynamic port
        let host = NWEndpoint.Host(server)
        let dnsPort = NWEndpoint.Port(integerLiteral: port)
        let params = NWParameters.udp
        let connection = NWConnection(host: host, port: dnsPort, using: params)

        // Use a dedicated serial queue for NWConnection callbacks.
        // This provides better predictability than global queues and aligns
        // with Swift 6.2+ concurrency best practices.
        let connectionQueue = DispatchQueue(label: "com.dnschat.dns.connection", qos: .userInitiated)
        let connectionReadyGate = ContinuationResumeGate<Void>()

        // CRITICAL: Ensure connection cleanup on cancellation/timeout.
        // When the parent Task is cancelled (e.g., by withDeadline), we MUST cancel
        // the NWConnection to prevent resource leaks. Without this handler,
        // a cancelled Task would orphan the connection.
        return try await withTaskCancellationHandler {
            try await performUDPQueryInternal(
                connection: connection,
                query: query,
                queue: connectionQueue,
                connectionReadyGate: connectionReadyGate,
                deadline: deadline
            )
        } onCancel: {
            // Cancellation can run before the operation installs its continuation.
            // Settle the shared gate first so clearing the Network callback cannot
            // strand the checked continuation.
            connectionReadyGate.resume(throwing: DNSError.cancelled)
            connection.stateUpdateHandler = nil
            connection.cancel()
        }
    }

    @available(iOS 16.0, *)
    nonisolated private func performTCPQuery(
        server: String,
        queryName: String,
        port: UInt16,
        deadline: ContinuousClock.Instant
    ) async throws -> [String] {
        try Self.ensureTimeRemaining(until: deadline)
        let query = try createDNSQuery(queryName: queryName)
        var framedQuery = Data()
        let frameLength = UInt16(query.payload.count)
        framedQuery.append(contentsOf: frameLength.bigEndianBytes)
        framedQuery.append(query.payload)

        let host = NWEndpoint.Host(server)
        let dnsPort = NWEndpoint.Port(integerLiteral: port)
        let connection = NWConnection(host: host, port: dnsPort, using: .tcp)
        let connectionQueue = DispatchQueue(label: "com.dnschat.dns.tcp.connection", qos: .userInitiated)
        let connectionReadyGate = ContinuationResumeGate<Void>()

        return try await withTaskCancellationHandler {
            try await performTCPQueryInternal(
                connection: connection,
                framedQuery: framedQuery,
                query: query,
                queue: connectionQueue,
                connectionReadyGate: connectionReadyGate,
                deadline: deadline
            )
        } onCancel: {
            connectionReadyGate.resume(throwing: DNSError.cancelled)
            connection.stateUpdateHandler = nil
            connection.cancel()
        }
    }

    /// Internal implementation of UDP query, separated for proper cancellation handling.
    @available(iOS 16.0, *)
    nonisolated private func performUDPQueryInternal(
        connection: NWConnection,
        query: DnsQuery,
        queue: DispatchQueue,
        connectionReadyGate: ContinuationResumeGate<Void>,
        deadline: ContinuousClock.Instant
    ) async throws -> [String] {
        defer {
            connection.stateUpdateHandler = nil
            connection.cancel()
        }

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
        // Serial Queue: Using a dedicated serial queue provides more predictable callback ordering
        // than global queues, though rapid state changes can still occur.
        try Self.ensureTimeRemaining(until: deadline)
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            connection.stateUpdateHandler = { state in
                switch state {
                case .ready:
                    connectionReadyGate.resume(returning: ()) {
                        // Clear handler first to prevent retain cycle
                        connection.stateUpdateHandler = nil
                    }
                case .waiting(let error):
                    // Connection cannot be established yet - log but don't fail immediately.
                    // Network.framework may recover automatically. If it doesn't, we'll
                    // eventually hit .failed or timeout.
                    // For transient network issues, we want to give the connection a chance.
                    // However, if this is a definitive error (e.g., no route), fail fast.
                    if Self.isBlockedNetworkError(error) {
                        connectionReadyGate.resume(throwing: Self.classifyNetworkError(error)) {
                            connection.stateUpdateHandler = nil
                            connection.cancel()
                        }
                    }
                    // Otherwise, let it retry or timeout naturally
                case .failed(let error):
                    connectionReadyGate.resume(throwing: Self.classifyNetworkError(error)) {
                        connection.stateUpdateHandler = nil
                    }
                case .cancelled:
                    connectionReadyGate.resume(throwing: DNSError.cancelled) {
                        connection.stateUpdateHandler = nil
                    }
                default:
                    break
                }
            }
            if connectionReadyGate.install(cont) {
                connection.start(queue: queue)
            }
        }

        // Send DNS query packet
        //
        // Race Condition: NWConnection.send completion can fire multiple times:
        // - Success callback + connection cancelled externally
        // - Error callback + connection state change triggering cancellation
        //
        // Gate ensures first completion wins, subsequent calls ignored.
        try Self.ensureTimeRemaining(until: deadline)
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
        // - Timeout from withDeadline wrapper + data arrives simultaneously
        //
        // We call connection.cancel() inside the gate to clean up, but cancellation itself
        // may trigger another callback. Gate ensures we only resume continuation once.
        try Self.ensureTimeRemaining(until: deadline)
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

    @available(iOS 16.0, *)
    nonisolated private func performTCPQueryInternal(
        connection: NWConnection,
        framedQuery: Data,
        query: DnsQuery,
        queue: DispatchQueue,
        connectionReadyGate: ContinuationResumeGate<Void>,
        deadline: ContinuousClock.Instant
    ) async throws -> [String] {
        defer {
            connection.stateUpdateHandler = nil
            connection.cancel()
        }

        try Self.ensureTimeRemaining(until: deadline)
        try await waitForConnectionReady(
            connection: connection,
            queue: queue,
            connectionReadyGate: connectionReadyGate,
            deadline: deadline
        )
        try await sendTCPQuery(
            connection: connection,
            framedQuery: framedQuery,
            deadline: deadline
        )
        let responseData = try await receiveTCPResponse(
            connection: connection,
            deadline: deadline
        )

        let txt = try parseDnsTxtResponse(
            responseData,
            expectedTransactionId: query.transactionId,
            expectedQueryName: query.normalizedName
        )
        if txt.isEmpty { throw DNSError.noRecordsFound }
        return txt
    }

    @available(iOS 16.0, *)
    nonisolated private func waitForConnectionReady(
        connection: NWConnection,
        queue: DispatchQueue,
        connectionReadyGate: ContinuationResumeGate<Void>,
        deadline: ContinuousClock.Instant
    ) async throws {
        try Self.ensureTimeRemaining(until: deadline)
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            connection.stateUpdateHandler = { state in
                switch state {
                case .ready:
                    connectionReadyGate.resume(returning: ()) {
                        connection.stateUpdateHandler = nil
                    }
                case .waiting(let error):
                    if Self.isBlockedNetworkError(error) {
                        connectionReadyGate.resume(throwing: Self.classifyNetworkError(error)) {
                            connection.stateUpdateHandler = nil
                            connection.cancel()
                        }
                    }
                case .failed(let error):
                    connectionReadyGate.resume(throwing: Self.classifyNetworkError(error)) {
                        connection.stateUpdateHandler = nil
                    }
                case .cancelled:
                    connectionReadyGate.resume(throwing: DNSError.cancelled) {
                        connection.stateUpdateHandler = nil
                    }
                default:
                    break
                }
            }
            if connectionReadyGate.install(cont) {
                connection.start(queue: queue)
            }
        }
    }

    @available(iOS 16.0, *)
    nonisolated private func sendTCPQuery(
        connection: NWConnection,
        framedQuery: Data,
        deadline: ContinuousClock.Instant
    ) async throws {
        try Self.ensureTimeRemaining(until: deadline)
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            let gate = ResumeGate()

            connection.send(content: framedQuery, completion: .contentProcessed { error in
                gate.tryResume {
                    if let error = error {
                        cont.resume(throwing: DNSError.queryFailed(error.localizedDescription))
                    } else {
                        cont.resume()
                    }
                }
            })
        }
    }

    @available(iOS 16.0, *)
    nonisolated private func receiveTCPResponse(
        connection: NWConnection,
        deadline: ContinuousClock.Instant
    ) async throws -> Data {
        let lengthBytes = try await receiveTCPChunk(
            connection: connection,
            minimumLength: 2,
            maximumLength: 2,
            deadline: deadline
        )
        let bytes = [UInt8](lengthBytes)
        guard bytes.count == 2 else {
            throw DNSError.queryFailed("DNS TCP response length prefix truncated")
        }
        let expectedLength = Int(UInt16(bytes[0]) << 8 | UInt16(bytes[1]))
        guard expectedLength >= 12 else {
            throw DNSError.queryFailed("DNS TCP response length invalid: \(expectedLength)")
        }

        var response = Data()
        while response.count < expectedLength {
            try Self.ensureTimeRemaining(until: deadline)
            let remaining = expectedLength - response.count
            let chunk = try await receiveTCPChunk(
                connection: connection,
                minimumLength: 1,
                maximumLength: remaining,
                deadline: deadline
            )
            response.append(chunk)
        }
        return response.prefix(expectedLength)
    }

    @available(iOS 16.0, *)
    nonisolated private func receiveTCPChunk(
        connection: NWConnection,
        minimumLength: Int,
        maximumLength: Int,
        deadline: ContinuousClock.Instant
    ) async throws -> Data {
        try Self.ensureTimeRemaining(until: deadline)
        return try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Data, Error>) in
            let gate = ResumeGate()

            connection.receive(
                minimumIncompleteLength: minimumLength,
                maximumLength: maximumLength
            ) { data, _, isComplete, error in
                gate.tryResume {
                    if let error = error {
                        cont.resume(throwing: DNSError.queryFailed(error.localizedDescription))
                        return
                    }
                    guard let data = data, !data.isEmpty else {
                        if isComplete {
                            cont.resume(throwing: DNSError.queryFailed("DNS TCP connection closed before complete response"))
                        } else {
                            cont.resume(throwing: DNSError.noRecordsFound)
                        }
                        return
                    }
                    cont.resume(returning: data)
                }
            }
        }
    }

    private static func isBlockedNetworkError(_ error: NWError) -> Bool {
        if case .posix(let code) = error {
            return code == .ENETUNREACH || code == .EHOSTUNREACH || code == .ECONNREFUSED
        }
        return false
    }

    private static func classifyNetworkError(_ error: NWError) -> DNSError {
        if isBlockedNetworkError(error) {
            return .resolverFailed("Blocked/no route: \(error.localizedDescription)")
        }
        return .resolverFailed(error.localizedDescription)
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
            let (answerName, answerOffset) = try readName(bytes: bytes, offset: offset)
            offset = answerOffset
            guard offset + 10 <= bytes.count else {
                throw DNSError.queryFailed("DNS response answer header truncated")
            }
            let type = Int(bytes[offset]) << 8 | Int(bytes[offset + 1])
            offset += 2 // TYPE
            let answerClass = Int(bytes[offset]) << 8 | Int(bytes[offset + 1])
            offset += 2 // CLASS
            offset += 4 // TTL
            let rdLength = Int(bytes[offset]) << 8 | Int(bytes[offset + 1])
            offset += 2
            guard rdLength <= bytes.count - offset else {
                throw DNSError.queryFailed("DNS response RDATA truncated")
            }
            let end = offset + rdLength

            if type == 16 { // TXT
                guard rdLength > 0 else {
                    throw DNSError.queryFailed("DNS TXT RDATA is empty")
                }

                var recordResults: [String] = []
                var p = offset
                while p < end {
                    let txtLen = Int(bytes[p])
                    p += 1
                    guard txtLen <= end - p else {
                        throw DNSError.queryFailed("DNS TXT character-string truncated")
                    }
                    let sub = bytes[p..<(p + txtLen)]
                    guard let decoded = String(bytes: sub, encoding: .utf8) else {
                        throw DNSError.queryFailed("DNS TXT character-string is not valid UTF-8")
                    }
                    if !decoded.isEmpty {
                        recordResults.append(decoded)
                    }
                    p += txtLen
                }

                if answerClass == 1 && answerName == expectedQueryName {
                    results.append(contentsOf: recordResults)
                }
            }
            offset = end
        }
        return results
    }

    private func readName(bytes: [UInt8], offset: Int) throws -> (String, Int) {
        var labels: [String] = []
        var currentOffset = offset
        var nextOffset = offset
        var jumped = false
        var jumps = 0
        var terminated = false

        while currentOffset < bytes.count {
            let len = Int(bytes[currentOffset])
            if len == 0 {
                terminated = true
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

            guard (len & 0xC0) == 0 else {
                throw DNSError.queryFailed("DNS response name label type is invalid")
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

        guard terminated else {
            throw DNSError.queryFailed("DNS response name truncated")
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
        // IMPORTANT: JS uses \p{M}+ which matches Unicode General Category "Mark" (combining characters).
        // Swift's .isDiacritic is NOT the same - we must check the generalCategory instead.
        let decomposed = value.decomposedStringWithCompatibilityMapping
        let scalars = decomposed.unicodeScalars.filter { scalar in
            // Check if this scalar is in the "Mark" general category (M = Mn, Mc, Me)
            // This matches the JS \p{M} regex
            switch scalar.properties.generalCategory {
            case .nonspacingMark, .spacingMark, .enclosingMark:
                return false  // Filter out combining marks
            default:
                return true   // Keep everything else
            }
        }
        return String(String.UnicodeScalarView(scalars))
    }

    private static func normalizeServerHostInput(_ value: String) -> String {
        var trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        while trimmed.hasSuffix(".") {
            trimmed.removeLast()
        }
        return trimmed
    }

    @MainActor
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

    @MainActor
    static func updateAllowedServers(_ config: [String: Any]) throws -> Bool {
        guard let servers = config["allowedServers"] as? [String] else {
            return false
        }
        let normalized = servers.map { normalizeServerHostInput($0) }
        let filtered = normalized.filter { !$0.isEmpty }
        guard !filtered.isEmpty else {
            throw DNSError.queryFailed("Allowed DNS server list cannot be empty")
        }
        // Subset-only narrowing: the supplied list may only narrow the
        // compiled-in default allowlist, never extend it. This hardens the
        // native layer against a hijacked JS bundle injecting rogue servers.
        let updated = Set(filtered).intersection(defaultAllowedServers)
        guard !updated.isEmpty else {
            throw DNSError.queryFailed("Allowed DNS servers must be a subset of the built-in allowlist")
        }
        if updated == allowedServers {
            return false
        }
        allowedServers = updated
        return true
    }
}

// MARK: - Extensions

extension DNSResolver {
    indirect enum DNSError: LocalizedError {
        case resolverFailed(String)
        case queryFailed(String)
        case noRecordsFound
        case timeout
        case cancelled
        /// UDP failed and the TCP fallback failed too. The terminal (TCP) error keeps
        /// its own case so the bridge code reflects it; the UDP cause is message-only.
        case fallbackFailed(udpFailure: String, terminal: DNSError)

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
            case .fallbackFailed(let udpFailure, let terminal):
                return "Native UDP failed (\(udpFailure)); TCP fallback failed: \(terminal.localizedDescription)"
            }
        }

        /// Promise reject code; shared contract with Android and modules/dns-native/index.ts.
        var bridgeCode: String {
            switch self {
            case .resolverFailed: return "RESOLVER_FAILED"
            case .queryFailed: return "QUERY_FAILED"
            case .noRecordsFound: return "NO_RECORDS_FOUND"
            case .timeout: return "TIMEOUT"
            case .cancelled: return "CANCELLED"
            case .fallbackFailed(_, let terminal): return terminal.bridgeCode
            }
        }

        var isNoRecordsFound: Bool {
            switch self {
            case .noRecordsFound: return true
            case .fallbackFailed(_, let terminal): return terminal.isNoRecordsFound
            default: return false
            }
        }
    }
}

private extension UInt16 {
    var bigEndianBytes: [UInt8] {
        return [UInt8(self >> 8), UInt8(self & 0xFF)]
    }
}

/// Cancellation-aware continuation gate for the NWConnection ready phase.
///
/// `withTaskCancellationHandler` may invoke `onCancel` before its operation
/// installs the continuation, or concurrently with a Network.framework state
/// callback. The gate stores either side until they meet and guarantees that
/// exactly one result resumes the continuation.
@available(iOS 16.0, *)
internal final class ContinuationResumeGate<Value>: @unchecked Sendable {
    private enum State {
        case awaitingContinuation
        case installed(CheckedContinuation<Value, Error>)
        case pending(Result<Value, Error>)
        case finished
    }

    private let lock = OSAllocatedUnfairLock(initialState: State.awaitingContinuation)

    /// Installs the continuation. Returns `true` only when the caller should
    /// start the underlying operation; a pending cancellation resumes inline.
    func install(_ continuation: CheckedContinuation<Value, Error>) -> Bool {
        let outcome: (shouldStart: Bool, pendingResult: Result<Value, Error>?) = lock.withLock { state in
            switch state {
            case .awaitingContinuation:
                state = .installed(continuation)
                return (true, nil)
            case .pending(let result):
                state = .finished
                return (false, result)
            case .installed, .finished:
                // A second install would leave this continuation un-resumed forever;
                // crash loudly instead of hanging the query task.
                preconditionFailure("ContinuationResumeGate.install called more than once")
            }
        }

        if let pendingResult = outcome.pendingResult {
            continuation.resume(with: pendingResult)
        }
        return outcome.shouldStart
    }

    func resume(returning value: Value, beforeResume: () -> Void = {}) {
        resume(with: .success(value), beforeResume: beforeResume)
    }

    func resume(throwing error: Error, beforeResume: () -> Void = {}) {
        resume(with: .failure(error), beforeResume: beforeResume)
    }

    private func resume(with result: Result<Value, Error>, beforeResume: () -> Void) {
        let outcome: (won: Bool, continuation: CheckedContinuation<Value, Error>?) = lock.withLock { state in
            switch state {
            case .awaitingContinuation:
                state = .pending(result)
                return (true, nil)
            case .installed(let continuation):
                state = .finished
                return (true, continuation)
            case .pending, .finished:
                return (false, nil)
            }
        }

        guard outcome.won else { return }
        beforeResume()
        outcome.continuation?.resume(with: result)
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

/// Wraps an async operation with an absolute monotonic deadline.
/// - Parameters:
///   - deadline: Latest monotonic instant at which the operation may run
///   - operation: The async operation to execute
/// - Returns: The result of the operation if it completes before timeout
/// - Throws: DNSError.timeout if the operation exceeds the time limit
/// - Note: Requires iOS 16.0+ for ContinuousClock.sleep(until:) API
@available(iOS 16.0, *)
private func withDeadline<T>(
    deadline: ContinuousClock.Instant,
    operation: @escaping () async throws -> T
) async throws -> T {
    let clock = ContinuousClock()
    guard clock.now < deadline else {
        throw DNSResolver.DNSError.timeout
    }
    return try await withThrowingTaskGroup(of: T.self) { group in
        defer { group.cancelAll() }
        group.addTask {
            try await operation()
        }

        group.addTask {
            try await clock.sleep(until: deadline)
            throw DNSResolver.DNSError.timeout
        }

        // Safe unwrap - we always have exactly 2 tasks, so next() will return a value.
        // The first task to complete (either operation success or timeout) wins.
        guard let result = try await group.next() else {
            // Defensive fallback: should never happen with 2 tasks
            throw DNSResolver.DNSError.timeout
        }
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
        deadlineEpochMs: NSNumber,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        self.resolver.queryTXT(
            domain: domain,
            message: message,
            port: port,
            deadlineEpochMs: deadlineEpochMs,
            resolver: resolver,
            rejecter: rejecter
        )
    }

    @objc func queryTXTUDP(
        _ domain: String,
        message: String,
        port: NSNumber,
        deadlineEpochMs: NSNumber,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        self.resolver.queryTXTUDP(
            domain: domain,
            message: message,
            port: port,
            deadlineEpochMs: deadlineEpochMs,
            resolver: resolver,
            rejecter: rejecter
        )
    }

    @objc func queryTXTTCP(
        _ domain: String,
        message: String,
        port: NSNumber,
        deadlineEpochMs: NSNumber,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        self.resolver.queryTXTTCP(
            domain: domain,
            message: message,
            port: port,
            deadlineEpochMs: deadlineEpochMs,
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

    @objc func cancelActiveQueries(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            resolver(self.resolver.cancelActiveQueries())
        }
    }

    @objc func configureSanitizer(
        _ config: NSDictionary,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        // updateAllowedServers is @MainActor, so dispatch to MainActor
        Task { @MainActor in
            do {
                let updated = try DNSResolver.updateAllowedServers(config as? [String: Any] ?? [:])
                resolver(updated)
            } catch {
                rejecter("SANITIZER_CONFIG_INVALID", error.localizedDescription, error)
            }
        }
    }

    @objc func invalidate() {
        // Dispatch cleanup to MainActor since cleanup() is MainActor-isolated.
        // React Native's invalidate() is synchronous, so we use Task for dispatch.
        // This is safe because Task.cancel() is immediate - actual cleanup is async.
        Task { @MainActor in
            self.resolver.cleanup()
        }
    }
}
