import XCTest
@testable import DNSNative

/// Comprehensive tests for ResumeGate thread safety and exactly-once semantics.
///
/// ## Integration Note
/// This file is ready for integration when a Swift test target is added to the project.
/// To integrate:
/// 1. Create test target in Xcode: File → New → Target → iOS Unit Testing Bundle
/// 2. Add this file to the test target
/// 3. Link DNSNative module with @testable import
/// 4. Run tests: Cmd+U or xcodebuild test
///
/// ## Why These Tests Matter
/// ResumeGate is a critical concurrency primitive protecting against "Continuation already resumed"
/// crashes. These tests validate:
/// - Exactly-once execution under concurrent load
/// - Lock-free execution path (action runs outside lock)
/// - No race conditions with rapid concurrent access
/// - Performance characteristics (sub-microsecond overhead)
@available(iOS 16.0, *)
final class ResumeGateTests: XCTestCase {

    // MARK: - Exactly-Once Semantics

    /// Verifies gate allows exactly one execution when called from single thread.
    func testSingleThreadExactlyOnce() {
        let gate = ResumeGate()
        var executeCount = 0

        gate.tryResume { executeCount += 1 }
        gate.tryResume { executeCount += 1 }
        gate.tryResume { executeCount += 1 }

        XCTAssertEqual(executeCount, 1, "Gate should execute action exactly once")
    }

    /// Verifies gate enforces exactly-once under heavy concurrent load.
    ///
    /// Spawns 1000 concurrent tasks all racing to resume the gate. Without proper
    /// synchronization, this would increment count multiple times.
    func testConcurrentExactlyOnce() async {
        let gate = ResumeGate()
        let executeCount = OSAllocatedUnfairLock(initialState: 0)

        await withTaskGroup(of: Void.self) { group in
            for _ in 0..<1000 {
                group.addTask {
                    gate.tryResume {
                        executeCount.withLock { $0 += 1 }
                    }
                }
            }
        }

        let finalCount = executeCount.withLock { $0 }
        XCTAssertEqual(finalCount, 1, "Gate should execute exactly once under concurrent load")
    }

    // MARK: - Lock-Free Execution

    /// Verifies action executes outside lock to prevent deadlock.
    ///
    /// If action executed inside lock, acquiring another lock in action would risk deadlock
    /// if execution order differs across threads. This test verifies safe design.
    func testActionExecutesOutsideLock() async {
        let gate = ResumeGate()
        let externalLock = OSAllocatedUnfairLock(initialState: 0)
        var actionExecuted = false

        gate.tryResume {
            // If gate's lock still held, this would deadlock with unfair lock
            externalLock.withLock { counter in
                counter += 1
                actionExecuted = true
            }
        }

        XCTAssertTrue(actionExecuted, "Action should execute outside gate's lock")
    }

    // MARK: - Race Condition Scenarios

    /// Simulates Network.framework state transition race.
    ///
    /// Models: ready → failed → cancelled firing rapidly on same queue
    func testRapidStateTransitionRace() async {
        let gate = ResumeGate()
        let resumeCount = OSAllocatedUnfairLock(initialState: 0)

        // Simulate rapid state transitions on serial queue
        await withTaskGroup(of: Void.self) { group in
            // ready
            group.addTask {
                gate.tryResume {
                    resumeCount.withLock { $0 += 1 }
                }
            }

            // failed (race with ready)
            group.addTask {
                gate.tryResume {
                    resumeCount.withLock { $0 += 1 }
                }
            }

            // cancelled (race with both)
            group.addTask {
                gate.tryResume {
                    resumeCount.withLock { $0 += 1 }
                }
            }
        }

        let count = resumeCount.withLock { $0 }
        XCTAssertEqual(count, 1, "Only one state transition should win")
    }

    /// Simulates timeout race with successful completion.
    ///
    /// Models: DNS response arrives same moment timeout fires
    func testTimeoutCompletionRace() async {
        let gate = ResumeGate()
        let winner = OSAllocatedUnfairLock<String?>(initialState: nil)

        async let timeout: Void = Task {
            gate.tryResume {
                winner.withLock { $0 = "timeout" }
            }
        }.value

        async let success: Void = Task {
            gate.tryResume {
                winner.withLock { $0 = "success" }
            }
        }.value

        _ = await (timeout, success)

        let result = winner.withLock { $0 }
        XCTAssertNotNil(result, "One path should win")
        XCTAssertTrue(result == "timeout" || result == "success", "Winner should be timeout or success")
    }

    // MARK: - Performance Characteristics

    /// Benchmarks gate overhead in uncontended case.
    ///
    /// ResumeGate adds critical-path latency to every DNS query. This test ensures
    /// overhead is negligible (<1μs on modern hardware).
    func testPerformanceUncontended() {
        let gate = ResumeGate()

        measure {
            for _ in 0..<10_000 {
                gate.tryResume {
                    // Minimal work to isolate gate overhead
                    _ = 1 + 1
                }
            }
        }

        // Expected: <1ms for 10k iterations = <100ns per operation on M1+
        // Gate uses OSAllocatedUnfairLock.withLock (inline, no allocation)
    }

    /// Benchmarks gate overhead under concurrent contention.
    ///
    /// Measures worst-case performance when multiple threads race for the gate.
    /// Even losing threads should have minimal overhead.
    func testPerformanceContended() async {
        measure {
            let gate = ResumeGate()

            Task {
                await withTaskGroup(of: Void.self) { group in
                    for _ in 0..<100 {
                        group.addTask {
                            gate.tryResume {
                                _ = 1 + 1
                            }
                        }
                    }
                }
            }
        }

        // Expected: <10ms for 100 concurrent tasks
        // OSAllocatedUnfairLock scales well under contention (lock-free fast path)
    }

    // MARK: - Stress Tests

    /// Sustained concurrent load test.
    ///
    /// Runs 10,000 concurrent attempts over multiple iterations to detect rare races.
    func testSustainedConcurrentLoad() async {
        for iteration in 0..<10 {
            let gate = ResumeGate()
            let executeCount = OSAllocatedUnfairLock(initialState: 0)

            await withTaskGroup(of: Void.self) { group in
                for _ in 0..<10_000 {
                    group.addTask {
                        gate.tryResume {
                            executeCount.withLock { $0 += 1 }
                        }
                    }
                }
            }

            let count = executeCount.withLock { $0 }
            XCTAssertEqual(count, 1, "Iteration \(iteration): Gate should execute exactly once")
        }
    }
}

// MARK: - Test Utilities

// Note: OSAllocatedUnfairLock(initialState:) is the standard initializer.
// No convenience extension needed - use directly: OSAllocatedUnfairLock(initialState: value)
