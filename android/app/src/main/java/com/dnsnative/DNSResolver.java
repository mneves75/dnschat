package com.dnsnative;

// NOTE: This file is duplicated in the Expo prebuild output. Keep the copies in sync.

import android.net.ConnectivityManager;
import android.net.Network;
import android.os.Build;
import android.os.CancellationSignal;
import android.os.SystemClock;
import android.util.Log;

import java.net.InetAddress;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketTimeoutException;
import java.time.Duration;
import java.security.SecureRandom;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.concurrent.Future;
import java.util.concurrent.FutureTask;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Supplier;
import java.util.Objects;
import java.util.regex.Pattern;

import org.xbill.DNS.*;

public class DNSResolver {
    private static final String TAG = "DNSResolver";
    private static final int DNS_PORT = 53;  // Default DNS port (RFC 1035)
    // Upper bound on one native invocation. The caller passes an explicit absolute
    // deadline (and can cancel), so this only caps a caller that grants more than
    // the JS 10 s per-rung budget; 500 ms is left for bridge/JS scheduling.
    private static final int QUERY_TIMEOUT_MS = 9500;
    // Only the standard DNS port is reachable from the JS bridge (RNDNSModule).
    // DNSResolver.queryTXT itself stays port-agnostic so the JVM harness can drive
    // loopback resolvers on ephemeral ports.
    static final int ALLOWED_DNS_PORT = 53;
    private static final int MAX_DNS_MESSAGE_BYTES = 65535;
    private static final int DEFAULT_MAX_LABEL_LENGTH = 63;
    private static final int MAX_QNAME_LENGTH = 255;
    private static final int MAX_NATIVE_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 200L;
    private static final int DNS_FLAG_QR = 0x8000;
    private static final int DNS_FLAG_TC = 0x0200;
    private static final int DNS_OPCODE_MASK = 0x7800;
    private static final int DNS_RCODE_MASK = 0x000F;
    private static final int DNS_POINTER_MASK = 0xC0;
    private static final int DNS_POINTER_OFFSET_MASK = 0x3F;
    private static final int EXPECTED_QDCOUNT = 1;
    private static final int MAX_POINTER_JUMPS = 10;
    private static final SecureRandom DNS_SECURE_RANDOM = new SecureRandom();
    private static final AtomicReference<SanitizerConfig> SANITIZER =
        new AtomicReference<>(SanitizerConfig.defaultInstance());
    private static final AtomicBoolean DEFAULT_SANITIZER_NOTICE_EMITTED = new AtomicBoolean(false);
    // Deliberately narrower than ALLOWED_DNS_SERVERS in constants.ts: the native
    // transport speaks only to the LLM zones, never to a public recursive resolver.
    // Native narrows by intersection, so this must stay a SUBSET of the TS list
    // (enforced by nativeSecurityPolicy.test.ts).
    private static final Set<String> DEFAULT_ALLOWED_SERVERS = Collections.unmodifiableSet(
        new HashSet<>(Arrays.asList(
            "llm.pieter.com",
            "ch.at"
        ))
    );

    // Thread pool configuration for DNS queries
    // Fixed size prevents thread explosion under load
    // Size equals CPU cores for optimal I/O-bound task performance
    private static final int THREAD_POOL_SIZE = Math.max(2, Runtime.getRuntime().availableProcessors());
    private static final int QUEUE_CAPACITY = 50;
    // InetAddress has no timeout/cancellation API on the app's API 24 floor. Keep one
    // bounded recovery lane so an uncooperative lookup cannot poison every later query.
    // With no queue, two stuck legacy calls saturate the pool and later callers fail
    // fast instead of leaking more threads or waiting behind work that may never finish.
    private static final int MAX_HOST_RESOLVER_THREADS = 2;
    private static final Executor DIRECT_CALLBACK_EXECUTOR = Runnable::run;
    private static final ThreadPoolExecutor HOST_RESOLVER_EXECUTOR = new ThreadPoolExecutor(
        0,
        MAX_HOST_RESOLVER_THREADS,
        30L,
        TimeUnit.SECONDS,
        new SynchronousQueue<>(),
        runnable -> {
            Thread thread = new Thread(runnable, "DNSHostResolver");
            thread.setDaemon(true);
            return thread;
        },
        new ThreadPoolExecutor.AbortPolicy()
    );

    private final ThreadPoolExecutor executor = new ThreadPoolExecutor(
        THREAD_POOL_SIZE,                              // Core pool size
        THREAD_POOL_SIZE,                              // Max pool size (fixed)
        60L, TimeUnit.SECONDS,                         // Idle thread timeout
        new LinkedBlockingQueue<>(QUEUE_CAPACITY),     // Bounded queue
        new ThreadPoolExecutor.AbortPolicy()           // Never run blocking DNS work on caller thread
    );
    private final ScheduledThreadPoolExecutor deadlineExecutor = new ScheduledThreadPoolExecutor(
        1,
        runnable -> {
            Thread thread = new Thread(runnable, "DNSDeadline");
            thread.setDaemon(true);
            return thread;
        },
        new ThreadPoolExecutor.AbortPolicy()
    );
    private final ConnectivityManager connectivityManager;
    private final HostResolver hostResolver;
    private final boolean usePlatformDnsResolver;
    private final long queryTimeoutMillis;

    private final Object activeQueriesLock = new Object();
    private final AtomicLong nextOperationId = new AtomicLong();
    private final Map<Long, ActiveQuery> activeQueries = new ConcurrentHashMap<>();

    private static final class ActiveQuery {
        final long id;
        final CompletableFuture<List<String>> result = new CompletableFuture<>();

        private final Object ownershipLock = new Object();
        private final AtomicBoolean cancelled = new AtomicBoolean(false);
        private final Set<Future<?>> submittedWork = new HashSet<>();
        private final Set<CompletableFuture<?>> stageCompletions = new HashSet<>();
        private final AtomicReference<DatagramSocket> datagramSocket = new AtomicReference<>();
        private final AtomicReference<CancellationSignal> hostnameCancellation =
            new AtomicReference<>();

        ActiveQuery(long id) {
            this.id = id;
        }

        boolean isCancelled() {
            return cancelled.get();
        }

        boolean own(Future<?> future) {
            synchronized (ownershipLock) {
                if (cancelled.get()) {
                    future.cancel(true);
                    return false;
                }
                submittedWork.add(future);
                return true;
            }
        }

        void release(Future<?> future) {
            synchronized (ownershipLock) {
                submittedWork.remove(future);
            }
        }

        boolean own(CompletableFuture<?> completion) {
            synchronized (ownershipLock) {
                if (!cancelled.get()) {
                    stageCompletions.add(completion);
                    return true;
                }
            }
            completion.completeExceptionally(cancelledError());
            return false;
        }

        void release(CompletableFuture<?> completion) {
            synchronized (ownershipLock) {
                stageCompletions.remove(completion);
            }
        }

        void attach(DatagramSocket socket) {
            if (!datagramSocket.compareAndSet(null, socket)) {
                socket.close();
                throw new IllegalStateException("DNS operation already owns a datagram socket");
            }
            if (cancelled.get() && datagramSocket.compareAndSet(socket, null)) {
                socket.close();
            }
        }

        void release(DatagramSocket socket) {
            datagramSocket.compareAndSet(socket, null);
            socket.close();
        }

        void attach(CancellationSignal cancellationSignal) {
            if (!hostnameCancellation.compareAndSet(null, cancellationSignal)) {
                cancellationSignal.cancel();
                throw new IllegalStateException("DNS operation already owns hostname resolution");
            }
            if (cancelled.get() && hostnameCancellation.compareAndSet(cancellationSignal, null)) {
                cancellationSignal.cancel();
            }
        }

        void release(CancellationSignal cancellationSignal) {
            hostnameCancellation.compareAndSet(cancellationSignal, null);
        }

        void cancelHostnameResolution(CancellationSignal cancellationSignal) {
            hostnameCancellation.compareAndSet(cancellationSignal, null);
            cancellationSignal.cancel();
        }

        void cancel() {
            List<Future<?>> futures;
            List<CompletableFuture<?>> completions;
            synchronized (ownershipLock) {
                if (!cancelled.compareAndSet(false, true)) {
                    return;
                }
                futures = new ArrayList<>(submittedWork);
                completions = new ArrayList<>(stageCompletions);
                submittedWork.clear();
                stageCompletions.clear();
            }

            result.completeExceptionally(cancelledError());

            DatagramSocket socket = datagramSocket.getAndSet(null);
            if (socket != null) {
                socket.close();
            }
            CancellationSignal cancellationSignal = hostnameCancellation.getAndSet(null);
            if (cancellationSignal != null) {
                cancellationSignal.cancel();
            }

            for (CompletableFuture<?> completion : completions) {
                completion.completeExceptionally(cancelledError());
            }
            for (Future<?> future : futures) {
                future.cancel(true);
            }
        }

        private static DNSError cancelledError() {
            return new DNSError(DNSError.Type.CANCELLED, "DNS query was cancelled");
        }
    }

    private static final class DnsQuery {
        final byte[] payload;
        final int transactionId;
        final String queryName;

        DnsQuery(byte[] payload, int transactionId, String queryName) {
            this.payload = payload;
            this.transactionId = transactionId;
            this.queryName = queryName;
        }
    }

    interface HostResolver {
        InetAddress resolve(String host) throws Exception;
    }

    public DNSResolver(ConnectivityManager connectivityManager) {
        this(connectivityManager, InetAddress::getByName, QUERY_TIMEOUT_MS, true);
    }

    DNSResolver(
        ConnectivityManager connectivityManager,
        HostResolver hostResolver,
        long queryTimeoutMillis
    ) {
        this(connectivityManager, hostResolver, queryTimeoutMillis, false);
    }

    private DNSResolver(
        ConnectivityManager connectivityManager,
        HostResolver hostResolver,
        long queryTimeoutMillis,
        boolean usePlatformDnsResolver
    ) {
        if (queryTimeoutMillis <= 0) {
            throw new IllegalArgumentException("queryTimeoutMillis must be positive");
        }
        this.connectivityManager = connectivityManager;
        this.hostResolver = Objects.requireNonNull(hostResolver, "hostResolver");
        this.usePlatformDnsResolver = usePlatformDnsResolver;
        this.queryTimeoutMillis = queryTimeoutMillis;
        this.deadlineExecutor.setRemoveOnCancelPolicy(true);
    }

    private <T> CompletableFuture<T> newOwnedCompletion(ActiveQuery operation) {
        CompletableFuture<T> completion = new CompletableFuture<>();
        operation.own(completion);
        completion.whenComplete((ignoredValue, ignoredError) -> operation.release(completion));
        return completion;
    }

    private <T> CompletableFuture<T> submitDnsAsync(
        ActiveQuery operation,
        Supplier<T> supplier
    ) {
        CompletableFuture<T> completion = newOwnedCompletion(operation);
        if (completion.isDone()) {
            return completion;
        }

        FutureTask<Void> task = new FutureTask<Void>(() -> {
            try {
                requireQueryCanContinue(operation, Long.MAX_VALUE);
                completion.complete(supplier.get());
            } catch (Throwable error) {
                completion.completeExceptionally(error);
            }
            return null;
        }) {
            @Override
            protected void done() {
                operation.release(this);
            }
        };
        if (!operation.own(task)) {
            return completion;
        }
        try {
            executor.execute(task);
        } catch (RejectedExecutionException error) {
            task.cancel(false);
            completion.completeExceptionally(
                new DNSError(DNSError.Type.QUERY_FAILED, "DNS resolver is busy; retry shortly", error)
            );
        }
        return completion;
    }

    /**
     * Cleans up resources. Should be called when the module is invalidated
     * to prevent memory leaks on app lifecycle events.
     *
     * This method:
     * 1. Cancels all pending queries with a CANCELLED error
     * 2. Clears the activeQueries map to prevent memory leaks
     * 3. Shuts down the executor thread pool
     *
     * CRITICAL: This MUST be called from invalidate() to prevent query-map leaks.
     */
    public void cleanup() {
        int pendingQueries = cancelActiveQueries();
        try {
            Log.d(TAG, "DNS: Cleanup complete - cleared " + pendingQueries + " active queries");
        } catch (RuntimeException ignored) {
            // Avoid crashing local JVM unit tests that use android.jar stubs.
        }

        // Phase 2: Shutdown executor thread pool
        if (!executor.isShutdown()) {
            executor.shutdown();
            try {
                // Wait up to 5 seconds for active tasks to complete
                if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
        deadlineExecutor.shutdownNow();
    }

    public int cancelActiveQueries() {
        List<ActiveQuery> operations;
        synchronized (activeQueriesLock) {
            operations = new ArrayList<>(activeQueries.values());
            activeQueries.clear();
        }
        for (ActiveQuery operation : operations) {
            operation.cancel();
        }
        return operations.size();
    }

    /**
     * Update the in-memory sanitizer rules. Returns true when the runtime configuration changed
     * and downstream caches should be invalidated. The call is idempotent but avoids rebuilding
     * regex patterns if the supplied config matches what we already have.
     */
    public boolean configureSanitizer(Map<String, Object> configMap) {
        SanitizerConfig incoming = SanitizerConfig.fromMap(configMap);
        SanitizerConfig current = SANITIZER.get();
        if (current.equals(incoming)) {
            return false;
        }
        SANITIZER.set(incoming);
        if (!incoming.isDefault()) {
            // Allow us to warn again should we ever fall back to defaults in a future session.
            DEFAULT_SANITIZER_NOTICE_EMITTED.set(false);
        }
        return true;
    }

    public String debugNormalizeQueryName(String message) throws DNSError {
        return normalizeQueryName(message);
    }

    public static boolean isAvailable() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q || isDnsJavaAvailable();
    }

    public static boolean isDnsJavaAvailable() {
        try {
            Class.forName("org.xbill.DNS.Lookup");
            return true;
        } catch (ClassNotFoundException e) {
            return false;
        }
    }

    public CompletableFuture<List<String>> queryTXT(
        String domain,
        String message,
        int port,
        long callerDeadlineEpochMillis
    ) {
        final long deadlineNanos;
        try {
            deadlineNanos = deadlineNanosFromEpochMillis(callerDeadlineEpochMillis);
        } catch (DNSError error) {
            return failedFuture(error);
        }

        // Validate and normalize domain parameter
        if (domain == null) {
            CompletableFuture<List<String>> failed = new CompletableFuture<>();
            failed.completeExceptionally(
                new DNSError(DNSError.Type.QUERY_FAILED, "DNS domain cannot be null or empty")
            );
            return failed;
        }

        String trimmedDomain = domain.trim();
        if (trimmedDomain.isEmpty()) {
            CompletableFuture<List<String>> failed = new CompletableFuture<>();
            failed.completeExceptionally(
                new DNSError(DNSError.Type.QUERY_FAILED, "DNS domain cannot be null or empty")
            );
            return failed;
        }

        // Normalize the fully-qualified query name provided by the JS bridge
        final String queryName;
        try {
            queryName = normalizeQueryName(message);
        } catch (DNSError error) {
            CompletableFuture<List<String>> failed = new CompletableFuture<>();
            failed.completeExceptionally(error);
            return failed;
        }

        final int dnsPort = port;
        if (dnsPort < 1 || dnsPort > 65535) {
            CompletableFuture<List<String>> failed = new CompletableFuture<>();
            failed.completeExceptionally(
                new DNSError(DNSError.Type.QUERY_FAILED,
                    "Invalid DNS port: " + dnsPort + ". Must be between 1 and 65535.")
            );
            return failed;
        }

        final String normalizedDomain;
        try {
            normalizedDomain = normalizeServerHost(trimmedDomain);
        } catch (DNSError error) {
            CompletableFuture<List<String>> failed = new CompletableFuture<>();
            failed.completeExceptionally(error);
            return failed;
        }
        try {
            requireQueryNameInZone(queryName, normalizedDomain);
        } catch (DNSError error) {
            return failedFuture(error);
        }
        ActiveQuery operation = registerActiveQuery();
        Log.d(TAG, "DNS: Creating independent query operation");
        try {
            executeQueryChain(
                queryName,
                normalizedDomain,
                dnsPort,
                deadlineNanos,
                operation
            );
        } catch (RuntimeException error) {
            activeQueries.remove(operation.id, operation);
            operation.result.completeExceptionally(error);
        }

        return operation.result;
    }

    private ActiveQuery registerActiveQuery() {
        synchronized (activeQueriesLock) {
            while (true) {
                long operationId = nextOperationId.incrementAndGet();
                if (!activeQueries.containsKey(operationId)) {
                    ActiveQuery operation = new ActiveQuery(operationId);
                    activeQueries.put(operationId, operation);
                    return operation;
                }
            }
        }
    }

    /**
     * The JS layer composes every query as "<label>.<selected server>". Enforcing the
     * same shape natively means an allowlisted resolver can only ever be asked about
     * one label under its own zone: a compromised JS bundle cannot tunnel data to an
     * arbitrary zone through the resolver.
     */
    static void requireQueryNameInZone(String queryName, String zone) {
        String suffix = "." + zone;
        int labelLength = queryName.length() - suffix.length();
        if (labelLength < 1
            || !queryName.endsWith(suffix)
            || queryName.lastIndexOf('.', labelLength - 1) >= 0) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS query name is outside the allowed zone");
        }
    }

    static void requireAllowedPort(int port) {
        if (port != ALLOWED_DNS_PORT) {
            throw new DNSError(
                DNSError.Type.QUERY_FAILED,
                "Invalid DNS port: " + port + ". Only port " + ALLOWED_DNS_PORT + " is allowed."
            );
        }
    }

    private static String normalizeServerHostInput(String domain) {
        String trimmed = domain.trim().toLowerCase(Locale.US);
        int end = trimmed.length();
        while (end > 0 && trimmed.charAt(end - 1) == '.') {
            end--;
        }
        return end == 0 ? "" : trimmed.substring(0, end);
    }

    private static String normalizeServerHost(String domain) throws DNSError {
        String normalized = normalizeServerHostInput(domain);
        if (normalized.isEmpty()) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS domain cannot be empty");
        }
        SanitizerConfig config = SANITIZER.get();
        if (config.allowedServers != null
            && !config.allowedServers.isEmpty()
            && !config.allowedServers.contains(normalized)) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS server not allowed");
        }
        return normalized;
    }

    /**
     * Executes the DNS query chain with fallback strategies.
     * Fallback chain: Raw UDP -> Legacy (dnsjava on the same resolver)
     */
    private void executeQueryChain(
        String queryName,
        String normalizedDomain,
        int port,
        long deadlineNanos,
        ActiveQuery operation
    ) {
        Log.d(TAG, "DNS: Active queries count: " + activeQueries.size());
        requireQueryCanContinue(operation, deadlineNanos);
        CompletableFuture<InetAddress> serverAddressFuture = resolveServerAddress(
            operation,
            normalizedDomain,
            deadlineNanos
        );

        // Every fallback stays on the selected resolver so the app never lies
        // about which resolver answered.
        CompletableFuture<List<String>> chain = serverAddressFuture
            .thenCompose(serverAddress -> {
                requireQueryCanContinue(operation, deadlineNanos);
                return queryTXTRawUDP(operation, queryName, serverAddress, port, deadlineNanos);
            })
            .handle((txtRecords, rawError) -> {
                if (rawError == null) {
                    return CompletableFuture.completedFuture(txtRecords);
                }
                return startFallbackChain(
                    queryName,
                    port,
                    deadlineNanos,
                    operation,
                    serverAddressFuture
                );
            })
            .thenCompose(future -> future);

        chain.whenComplete((txtRecords, error) -> {
            try {
                if (error == null) {
                    operation.result.complete(txtRecords);
                } else {
                    operation.result.completeExceptionally(unwrapCompletionError(error));
                }
            } finally {
                activeQueries.remove(operation.id, operation);
            }
        });
    }

    private CompletableFuture<List<String>> startFallbackChain(
        String queryName,
        int port,
        long deadlineNanos,
        ActiveQuery operation,
        CompletableFuture<InetAddress> serverAddressFuture
    ) {
        requireQueryCanContinue(operation, deadlineNanos);
        Log.d(TAG, "DNS: Trying legacy DNS on the selected resolver");
        return serverAddressFuture.thenCompose(serverAddress -> {
            requireQueryCanContinue(operation, deadlineNanos);
            return queryTXTLegacy(operation, serverAddress, queryName, port, deadlineNanos);
        });
    }

    private long deadlineNanosFromEpochMillis(long callerDeadlineEpochMillis) {
        if (callerDeadlineEpochMillis < 1L
            || callerDeadlineEpochMillis > 9_007_199_254_740_991L) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS query deadline is invalid");
        }
        long remainingCallerMillis = callerDeadlineEpochMillis - System.currentTimeMillis();
        if (remainingCallerMillis <= 0) {
            throw new DNSError(DNSError.Type.TIMEOUT, "DNS query deadline has expired");
        }
        long remainingMillis = Math.min(queryTimeoutMillis, remainingCallerMillis);
        return SystemClock.elapsedRealtimeNanos() + TimeUnit.MILLISECONDS.toNanos(remainingMillis);
    }

    private static void requireQueryCanContinue(
        ActiveQuery operation,
        long deadlineNanos
    ) {
        if (operation.isCancelled() || Thread.currentThread().isInterrupted()) {
            throw new DNSError(DNSError.Type.CANCELLED, "DNS query is no longer active");
        }
        remainingTimeoutMillis(deadlineNanos);
    }

    private static Throwable unwrapCompletionError(Throwable error) {
        Throwable current = error;
        while (current.getCause() != null && (
            current instanceof java.util.concurrent.CompletionException
                || current instanceof ExecutionException
        )) {
            current = current.getCause();
        }
        return current;
    }

    private static <T> CompletableFuture<T> failedFuture(Throwable error) {
        CompletableFuture<T> failed = new CompletableFuture<>();
        failed.completeExceptionally(error);
        return failed;
    }

    private static int remainingTimeoutMillis(long deadlineNanos) {
        long remainingNanos = deadlineNanos - SystemClock.elapsedRealtimeNanos();
        if (remainingNanos <= 0) {
            throw new DNSError(DNSError.Type.TIMEOUT, "Native DNS query budget exhausted");
        }
        long remainingMillis = TimeUnit.NANOSECONDS.toMillis(remainingNanos);
        return (int) Math.min(Integer.MAX_VALUE, Math.max(1L, remainingMillis));
    }

    private static void sleepBeforeRetry(
        ActiveQuery operation,
        long delayMillis,
        long deadlineNanos
    ) {
        requireQueryCanContinue(operation, deadlineNanos);
        int remainingMillis = remainingTimeoutMillis(deadlineNanos);
        if (delayMillis >= remainingMillis) {
            // The retry could not complete inside the budget; fail now instead of
            // sleeping the caller's remaining time away first.
            throw new DNSError(DNSError.Type.TIMEOUT, "Native DNS query budget exhausted");
        }
        try {
            Thread.sleep(delayMillis);
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw new DNSError(DNSError.Type.CANCELLED, "DNS query was cancelled", error);
        }
        requireQueryCanContinue(operation, deadlineNanos);
    }

    private CompletableFuture<InetAddress> resolveServerAddress(
        ActiveQuery operation,
        String server,
        long deadlineNanos
    ) {
        if (usePlatformDnsResolver && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return resolveServerAddressWithPlatformDns(operation, server, deadlineNanos);
        }
        return resolveServerAddressAsync(operation, server, deadlineNanos);
    }

    private CompletableFuture<InetAddress> resolveServerAddressAsync(
        ActiveQuery operation,
        String server,
        long deadlineNanos
    ) {
        CompletableFuture<InetAddress> completion = newOwnedCompletion(operation);
        if (completion.isDone()) {
            return completion;
        }

        FutureTask<Void> lookupTask = new FutureTask<Void>(() -> {
            try {
                requireQueryCanContinue(operation, deadlineNanos);
                InetAddress address = hostResolver.resolve(server);
                requireQueryCanContinue(operation, deadlineNanos);
                completion.complete(address);
            } catch (Throwable error) {
                if (
                    operation.isCancelled()
                        || Thread.currentThread().isInterrupted()
                        || error instanceof InterruptedException
                ) {
                    completion.completeExceptionally(
                        new DNSError(DNSError.Type.CANCELLED, "DNS query was cancelled", error)
                    );
                } else {
                    try {
                        remainingTimeoutMillis(deadlineNanos);
                        completion.completeExceptionally(
                            new DNSError(
                                DNSError.Type.QUERY_FAILED,
                                "DNS server address lookup failed",
                                error
                            )
                        );
                    } catch (DNSError deadlineError) {
                        completion.completeExceptionally(deadlineError);
                    }
                }
            }
            return null;
        }) {
            @Override
            protected void done() {
                operation.release(this);
            }
        };
        if (!operation.own(lookupTask)) {
            return completion;
        }

        final ScheduledFuture<?> timeoutTask;
        try {
            timeoutTask = deadlineExecutor.schedule(
                () -> {
                    if (completion.completeExceptionally(
                        new DNSError(
                            DNSError.Type.TIMEOUT,
                            "DNS server address lookup timed out"
                        )
                    )) {
                        lookupTask.cancel(true);
                    }
                },
                remainingTimeoutMillis(deadlineNanos),
                TimeUnit.MILLISECONDS
            );
        } catch (RejectedExecutionException error) {
            lookupTask.cancel(false);
            completion.completeExceptionally(
                new DNSError(DNSError.Type.QUERY_FAILED, "DNS deadline scheduler is unavailable", error)
            );
            return completion;
        }
        operation.own(timeoutTask);
        completion.whenComplete((ignoredAddress, ignoredError) -> {
            timeoutTask.cancel(false);
            operation.release(timeoutTask);
        });

        try {
            HOST_RESOLVER_EXECUTOR.execute(lookupTask);
        } catch (RejectedExecutionException error) {
            lookupTask.cancel(false);
            completion.completeExceptionally(
                new DNSError(
                    DNSError.Type.QUERY_FAILED,
                    "DNS host resolver is busy; retry shortly",
                    error
                )
            );
        }
        return completion;
    }

    private CompletableFuture<InetAddress> resolveServerAddressWithPlatformDns(
        ActiveQuery operation,
        String server,
        long deadlineNanos
    ) {
        CompletableFuture<InetAddress> completion = newOwnedCompletion(operation);
        if (completion.isDone()) {
            return completion;
        }

        CancellationSignal cancellationSignal = new CancellationSignal();
        operation.attach(cancellationSignal);
        AtomicBoolean lookupSettled = new AtomicBoolean(false);

        final ScheduledFuture<?> timeoutTask;
        try {
            timeoutTask = deadlineExecutor.schedule(
                () -> {
                    if (lookupSettled.compareAndSet(false, true)) {
                        operation.cancelHostnameResolution(cancellationSignal);
                        completion.completeExceptionally(
                            new DNSError(
                                DNSError.Type.TIMEOUT,
                                "DNS server address lookup timed out"
                            )
                        );
                    }
                },
                remainingTimeoutMillis(deadlineNanos),
                TimeUnit.MILLISECONDS
            );
        } catch (RejectedExecutionException error) {
            if (lookupSettled.compareAndSet(false, true)) {
                operation.cancelHostnameResolution(cancellationSignal);
                completion.completeExceptionally(
                    new DNSError(DNSError.Type.QUERY_FAILED, "DNS deadline scheduler is unavailable", error)
                );
            }
            return completion;
        }
        operation.own(timeoutTask);
        completion.whenComplete((ignoredAddress, ignoredError) -> {
            timeoutTask.cancel(false);
            operation.release(timeoutTask);
            operation.release(cancellationSignal);
        });

        try {
            requireQueryCanContinue(operation, deadlineNanos);
            android.net.DnsResolver.getInstance().query(
                getActiveNetwork(),
                server,
                android.net.DnsResolver.FLAG_EMPTY,
                DIRECT_CALLBACK_EXECUTOR,
                cancellationSignal,
                new android.net.DnsResolver.Callback<List<InetAddress>>() {
                    @Override
                    public void onAnswer(List<InetAddress> addresses, int responseCode) {
                        if (lookupSettled.compareAndSet(false, true)) {
                            completePlatformAddressLookup(
                                operation,
                                completion,
                                addresses,
                                deadlineNanos
                            );
                        }
                    }

                    @Override
                    public void onError(android.net.DnsResolver.DnsException error) {
                        if (lookupSettled.compareAndSet(false, true)) {
                            failPlatformAddressLookup(
                                operation,
                                completion,
                                error,
                                deadlineNanos
                            );
                        }
                    }
                }
            );
        } catch (Throwable error) {
            if (lookupSettled.compareAndSet(false, true)) {
                operation.cancelHostnameResolution(cancellationSignal);
                failPlatformAddressLookup(
                    operation,
                    completion,
                    error,
                    deadlineNanos
                );
            }
        }
        return completion;
    }

    private static void completePlatformAddressLookup(
        ActiveQuery operation,
        CompletableFuture<InetAddress> completion,
        List<InetAddress> addresses,
        long deadlineNanos
    ) {
        try {
            requireQueryCanContinue(operation, deadlineNanos);
            if (addresses == null || addresses.isEmpty()) {
                throw new DNSError(
                    DNSError.Type.QUERY_FAILED,
                    "DNS server address lookup returned no addresses"
                );
            }
            completion.complete(addresses.get(0));
        } catch (Throwable error) {
            completion.completeExceptionally(error);
        }
    }

    private static void failPlatformAddressLookup(
        ActiveQuery operation,
        CompletableFuture<InetAddress> completion,
        Throwable error,
        long deadlineNanos
    ) {
        if (operation.isCancelled()) {
            completion.completeExceptionally(
                new DNSError(DNSError.Type.CANCELLED, "DNS query was cancelled", error)
            );
            return;
        }
        try {
            remainingTimeoutMillis(deadlineNanos);
            completion.completeExceptionally(
                new DNSError(
                    DNSError.Type.QUERY_FAILED,
                    "DNS server address lookup failed",
                    error
                )
            );
        } catch (DNSError deadlineError) {
            completion.completeExceptionally(deadlineError);
        }
    }

    private CompletableFuture<List<String>> queryTXTLegacy(
        ActiveQuery operation,
        InetAddress serverAddress,
        String queryName,
        int port,
        long deadlineNanos
    ) {
        return submitDnsAsync(operation, () -> {
            DNSError lastError = null;
            for (int attempt = 0; attempt < MAX_NATIVE_ATTEMPTS; attempt++) {
                try {
                    requireQueryCanContinue(operation, deadlineNanos);
                    int timeoutMillis = remainingTimeoutMillis(deadlineNanos);
                    Lookup lookup = new Lookup(queryName, Type.TXT);

                    SimpleResolver resolver = new SimpleResolver(serverAddress);
                    resolver.setPort(port);
                    resolver.setTimeout(Duration.ofMillis(timeoutMillis));
                    lookup.setResolver(resolver);

                    org.xbill.DNS.Record[] records = lookup.run();
                    requireQueryCanContinue(operation, deadlineNanos);

                    if (records == null || records.length == 0) {
                        throw new DNSError(DNSError.Type.NO_RECORDS_FOUND, "No TXT records found in legacy query");
                    }

                    List<String> txtRecords = new ArrayList<>();
                    for (org.xbill.DNS.Record record : records) {
                        if (record instanceof TXTRecord && isExpectedLegacyTxtRecord(record, queryName)) {
                            TXTRecord txtRecord = (TXTRecord) record;
                            List<?> strings = txtRecord.getStrings();
                            for (Object str : strings) {
                                txtRecords.add(str.toString());
                            }
                        }
                    }

                    if (txtRecords.isEmpty()) {
                        throw new DNSError(DNSError.Type.NO_RECORDS_FOUND, "No valid TXT records found in legacy query");
                    }

                    return txtRecords;

                } catch (DNSError e) {
                    lastError = e;
                    if (e.getType() == DNSError.Type.NO_RECORDS_FOUND && attempt < MAX_NATIVE_ATTEMPTS - 1) {
                        sleepBeforeRetry(
                            operation,
                            (long) (RETRY_DELAY_MS * Math.pow(2, attempt)),
                            deadlineNanos
                        );
                        continue;
                    }
                    Log.e(TAG, "DNS query failed: " + e.getType().name());
                    throw e;
                } catch (Exception e) {
                    if (operation.isCancelled() || Thread.currentThread().isInterrupted()) {
                        throw new DNSError(
                            DNSError.Type.CANCELLED,
                            "DNS query was cancelled",
                            e
                        );
                    }
                    remainingTimeoutMillis(deadlineNanos);
                    // Never log the throwable: dnsjava messages can embed the prompt-derived name.
                    Log.e(TAG, "DNS query failed: " + e.getClass().getSimpleName());
                    throw new DNSError(DNSError.Type.QUERY_FAILED, "Legacy DNS query failed: " + e.getMessage(), e);
                }
            }
            throw lastError != null
                ? lastError
                : new DNSError(DNSError.Type.NO_RECORDS_FOUND, "No TXT records found in legacy query");
        });
    }

    private static boolean isExpectedLegacyTxtRecord(org.xbill.DNS.Record record, String queryName) {
        return record.getType() == Type.TXT
            && record.getDClass() == DClass.IN
            && normalizeDnsName(record.getName().toString()).equals(normalizeDnsName(queryName));
    }

    private static String normalizeDnsName(String name) {
        String normalized = name == null ? "" : name.trim().toLowerCase(Locale.ROOT);
        while (normalized.endsWith(".")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    /**
     * Send a raw UDP DNS TXT query for the fully-qualified domain name provided by the JS bridge.
     */
    private CompletableFuture<List<String>> queryTXTRawUDP(
        ActiveQuery operation,
        String queryName,
        InetAddress serverAddress,
        int port,
        long deadlineNanos
    ) {
        return submitDnsAsync(operation, () -> {
            DNSError lastError = null;
            for (int attempt = 0; attempt < MAX_NATIVE_ATTEMPTS; attempt++) {
                DatagramSocket socket = null;
                try {
                    requireQueryCanContinue(operation, deadlineNanos);
                    DnsQuery query = buildDnsQuery(queryName);

                    socket = new DatagramSocket();
                    operation.attach(socket);
                    requireQueryCanContinue(operation, deadlineNanos);
                    // Connected socket: the kernel drops datagrams from any other
                    // source, so a stray or spoofed packet cannot end the query.
                    socket.connect(serverAddress, port);
                    socket.setSoTimeout(remainingTimeoutMillis(deadlineNanos));

                    DatagramPacket packet = new DatagramPacket(
                        query.payload,
                        query.payload.length,
                        serverAddress,
                        port
                    );
                    socket.send(packet);
                    requireQueryCanContinue(operation, deadlineNanos);

                    // DatagramSocket.receive silently discards bytes past the buffer;
                    // size it for the largest DNS message so oversized replies are
                    // parsed rather than mistaken for malformed ones.
                    byte[] buffer = new byte[MAX_DNS_MESSAGE_BYTES];
                    DatagramPacket responsePacket = new DatagramPacket(buffer, buffer.length);
                    socket.receive(responsePacket);
                    requireQueryCanContinue(operation, deadlineNanos);

                    if (!serverAddress.equals(responsePacket.getAddress()) || responsePacket.getPort() != port) {
                        throw new DNSError(
                            DNSError.Type.QUERY_FAILED,
                            "DNS response from unexpected source: " +
                                responsePacket.getAddress().getHostAddress() + ":" + responsePacket.getPort()
                        );
                    }

                    int length = responsePacket.getLength();
                    byte[] response = new byte[length];
                    System.arraycopy(buffer, 0, response, 0, length);

                    List<String> txtRecords = parseDnsTxtResponse(response, query.transactionId, query.queryName);
                    if (txtRecords.isEmpty()) {
                        throw new DNSError(DNSError.Type.NO_RECORDS_FOUND, "No TXT records found in UDP response");
                    }
                    remainingTimeoutMillis(deadlineNanos);
                    return txtRecords;
                } catch (DNSError e) {
                    lastError = e;
                    if (e.getType() == DNSError.Type.NO_RECORDS_FOUND && attempt < MAX_NATIVE_ATTEMPTS - 1) {
                        sleepBeforeRetry(
                            operation,
                            (long) (RETRY_DELAY_MS * Math.pow(2, attempt)),
                            deadlineNanos
                        );
                        continue;
                    }
                    throw e;
                } catch (SocketTimeoutException e) {
                    throw new DNSError(DNSError.Type.TIMEOUT, "Raw UDP DNS query timed out", e);
                } catch (Exception e) {
                    if (operation.isCancelled() || Thread.currentThread().isInterrupted()) {
                        throw new DNSError(
                            DNSError.Type.CANCELLED,
                            "DNS query was cancelled",
                            e
                        );
                    }
                    remainingTimeoutMillis(deadlineNanos);
                    throw new DNSError(DNSError.Type.QUERY_FAILED, "UDP DNS query failed: " + e.getMessage(), e);
                } finally {
                    if (socket != null) {
                        operation.release(socket);
                    }
                }
            }
            throw lastError != null
                ? lastError
                : new DNSError(DNSError.Type.NO_RECORDS_FOUND, "No TXT records found in UDP response");
        });
    }

    private DnsQuery buildDnsQuery(String queryName) throws DNSError {
        byte[] qname = encodeDomainName(queryName);

        // DNS Header (12 bytes) + QNAME + QTYPE + QCLASS
        ByteBuffer buffer = ByteBuffer.allocate(12 + qname.length + 2 + 2);

        int transactionId = DNS_SECURE_RANDOM.nextInt(0x10000);
        buffer.putShort((short) transactionId);      // ID
        buffer.putShort((short) 0x0100);             // Flags: standard query, recursion desired
        buffer.putShort((short) 1);                  // QDCOUNT
        buffer.putShort((short) 0);                  // ANCOUNT
        buffer.putShort((short) 0);                  // NSCOUNT
        buffer.putShort((short) 0);                  // ARCOUNT

        buffer.put(qname);                          // Encoded domain name

        // QTYPE = TXT (16), QCLASS = IN (1)
        buffer.putShort((short) 16);
        buffer.putShort((short) 1);

        return new DnsQuery(buffer.array(), transactionId, queryName);
    }

    private byte[] encodeDomainName(String fqdn) throws DNSError {
        String normalizedFqdn = normalizeQueryName(fqdn);
        String[] labels = normalizedFqdn.split("\\.");
        SanitizerConfig config = SANITIZER.get();

        List<byte[]> labelBytes = new ArrayList<>();
        int totalLength = 1; // null terminator

        for (String label : labels) {
            byte[] bytes = label.getBytes(StandardCharsets.US_ASCII);
            if (bytes.length > config.maxLabelLength) {
                throw new DNSError(
                    DNSError.Type.QUERY_FAILED,
                    "DNS label exceeds " + config.maxLabelLength + " bytes"
                );
            }

            labelBytes.add(bytes);
            totalLength += 1 + bytes.length;
            if (totalLength > MAX_QNAME_LENGTH) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS query name exceeds 255 bytes");
            }
        }

        ByteBuffer buffer = ByteBuffer.allocate(totalLength);
        for (byte[] label : labelBytes) {
            buffer.put((byte) (label.length & 0xFF));
            buffer.put(label);
        }
        buffer.put((byte) 0x00);

        return buffer.array();
    }

    private String normalizeQueryName(String message) throws DNSError {
        if (message == null) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "Query name cannot be null");
        }

        String trimmed = message.trim();
        if (trimmed.isEmpty()) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "Query name cannot be empty");
        }

        String[] labels = trimmed.split("\\.");
        if (labels.length == 0) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "Query name is invalid");
        }

        int totalLength = 1; // null terminator
        StringBuilder normalized = new StringBuilder();
        for (int i = 0; i < labels.length; i++) {
            // Drop empty tokens (leading/trailing/consecutive dots) to match iOS
            // split(separator: ".", omittingEmptySubsequences: true); sanitizeLabel("") throws.
            if (labels[i].isEmpty()) {
                continue;
            }
            String sanitized = sanitizeLabel(labels[i]);

            if (normalized.length() > 0) {
                normalized.append('.');
            }
            normalized.append(sanitized);

            totalLength += 1 + sanitized.length();
            if (totalLength > MAX_QNAME_LENGTH) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS query name exceeds 255 characters");
            }
        }

        return normalized.toString();
    }

    // Mirrors sanitizeDNSMessageReference from the TypeScript reference: fold diacritics,
    // enforce lowercase ASCII, and collapse stray punctuation so iOS/Android stay in sync.
    private String sanitizeLabel(String rawLabel) throws DNSError {
        SanitizerConfig config = SANITIZER.get();
        if (config.isDefault() && DEFAULT_SANITIZER_NOTICE_EMITTED.compareAndSet(false, true)) {
            Log.w(
                TAG,
                "Using default DNS sanitizer rules; ensure the JS bridge supplies shared constants early in app startup."
            );
        }
        String working = rawLabel == null ? "" : rawLabel.trim();
        if (working.isEmpty()) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS label cannot be empty");
        }

        working = foldUnicode(working, config).toLowerCase(Locale.US);
        working = config.whitespacePattern.matcher(working).replaceAll(config.spaceReplacement);
        working = config.invalidCharsPattern.matcher(working).replaceAll("");
        working = config.dashCollapsePattern.matcher(working).replaceAll(config.spaceReplacement);
        working = config.edgeDashesPattern.matcher(working).replaceAll("");

        if (working.isEmpty()) {
            throw new DNSError(
                DNSError.Type.QUERY_FAILED,
                "DNS label must contain at least one alphanumeric character after sanitization"
            );
        }

        if (working.length() > config.maxLabelLength) {
            throw new DNSError(
                DNSError.Type.QUERY_FAILED,
                "DNS label exceeds " + config.maxLabelLength + " characters after sanitization"
            );
        }

        return working;
    }

    private String foldUnicode(String value, SanitizerConfig config) {
        String normalized = Normalizer.normalize(value, config.normalizationForm);
        return config.combiningMarksPattern.matcher(normalized).replaceAll("");
    }

    private List<String> parseDnsTxtResponse(
        byte[] data,
        int expectedTransactionId,
        String expectedQueryName
    ) throws Exception {
        List<String> results = new ArrayList<>();
        if (data == null || data.length < 12) {
            throw new DNSError(
                DNSError.Type.QUERY_FAILED,
                "Response too short: " + (data == null ? 0 : data.length) + " bytes, minimum 12 required"
            );
        }

        // Header
        int responseId = ((data[0] & 0xFF) << 8) | (data[1] & 0xFF);
        if (responseId != expectedTransactionId) {
            throw new DNSError(
                DNSError.Type.QUERY_FAILED,
                "DNS response ID mismatch - possible spoofing attempt"
            );
        }
        int flags = ((data[2] & 0xFF) << 8) | (data[3] & 0xFF);
        if ((flags & DNS_FLAG_QR) == 0) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response missing QR flag");
        }
        int opcode = (flags & DNS_OPCODE_MASK) >>> 11;
        if (opcode != 0) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response opcode not standard query");
        }
        if ((flags & DNS_FLAG_TC) != 0) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response truncated (TC=1)");
        }
        int rcode = flags & DNS_RCODE_MASK;
        if (rcode != 0) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response rcode=" + rcode);
        }
        int qdCount = ((data[4] & 0xFF) << 8) | (data[5] & 0xFF);
        int anCount = ((data[6] & 0xFF) << 8) | (data[7] & 0xFF);
        if (qdCount != EXPECTED_QDCOUNT) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response QDCOUNT=" + qdCount);
        }

        int offset = 12;
        // Skip QNAME
        for (int q = 0; q < qdCount; q++) {
            NameParseResult questionName = readName(data, offset);
            offset = questionName.nextOffset;
            if (!questionName.name.equals(expectedQueryName)) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response question name mismatch");
            }
            if (offset + 4 > data.length) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response question truncated");
            }
            int qtype = ((data[offset] & 0xFF) << 8) | (data[offset + 1] & 0xFF);
            offset += 2;
            int qclass = ((data[offset] & 0xFF) << 8) | (data[offset + 1] & 0xFF);
            offset += 2;
            if (qtype != 16 || qclass != 1) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response question type/class mismatch");
            }
        }

        for (int i = 0; i < anCount; i++) {
            NameParseResult answerName = readName(data, offset);
            offset = answerName.nextOffset;

            if (offset + 10 > data.length) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response answer header truncated");
            }
            int type = ((data[offset] & 0xFF) << 8) | (data[offset + 1] & 0xFF);
            offset += 2;
            int answerClass = ((data[offset] & 0xFF) << 8) | (data[offset + 1] & 0xFF);
            offset += 2;
            offset += 4; // TTL
            int rdLength = ((data[offset] & 0xFF) << 8) | (data[offset + 1] & 0xFF);
            offset += 2;
            if (rdLength > data.length - offset) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response RDATA truncated");
            }
            int end = offset + rdLength;

            // Only decode records that belong to our question; a foreign malformed
            // record must not abort an otherwise valid response.
            if (type == 16 && answerClass == 1 && answerName.name.equals(expectedQueryName)) {
                if (rdLength == 0) {
                    throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS TXT RDATA is empty");
                }

                int p = offset;
                while (p < end) {
                    int txtLen = data[p] & 0xFF;
                    p += 1;
                    if (txtLen > end - p) {
                        throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS TXT character-string truncated");
                    }
                    String decoded = decodeUtf8Strict(data, p, txtLen);
                    if (!decoded.isEmpty()) {
                        results.add(decoded);
                    }
                    p += txtLen;
                }
            }

            offset = end;
        }

        return results;
    }

    private static String decodeUtf8Strict(byte[] data, int offset, int length) throws DNSError {
        try {
            return StandardCharsets.UTF_8
                .newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT)
                .decode(ByteBuffer.wrap(data, offset, length))
                .toString();
        } catch (CharacterCodingException error) {
            throw new DNSError(
                DNSError.Type.QUERY_FAILED,
                "DNS TXT character-string is not valid UTF-8",
                error
            );
        }
    }

    private static final class NameParseResult {
        final String name;
        final int nextOffset;

        NameParseResult(String name, int nextOffset) {
            this.name = name;
            this.nextOffset = nextOffset;
        }
    }

    private NameParseResult readName(byte[] data, int offset) throws DNSError {
        StringBuilder name = new StringBuilder();
        int currentOffset = offset;
        int nextOffset = offset;
        boolean jumped = false;
        int jumps = 0;
        boolean terminated = false;

        while (currentOffset < data.length) {
            int len = data[currentOffset] & 0xFF;
            if (len == 0) {
                terminated = true;
                currentOffset += 1;
                if (!jumped) {
                    nextOffset = currentOffset;
                }
                break;
            }

            if ((len & DNS_POINTER_MASK) == DNS_POINTER_MASK) {
                if (currentOffset + 1 >= data.length) {
                    throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response name pointer truncated");
                }
                int pointer =
                    ((len & DNS_POINTER_OFFSET_MASK) << 8) | (data[currentOffset + 1] & 0xFF);
                if (pointer >= data.length) {
                    throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response name pointer out of range");
                }
                if (!jumped) {
                    nextOffset = currentOffset + 2;
                }
                currentOffset = pointer;
                jumped = true;
                jumps++;
                if (jumps > MAX_POINTER_JUMPS) {
                    throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response name pointer loop");
                }
                continue;
            }

            if ((len & DNS_POINTER_MASK) != 0) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response name label type is invalid");
            }

            currentOffset += 1;
            if (currentOffset + len > data.length) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response name truncated");
            }
            if (name.length() > 0) {
                name.append('.');
            }
            String label = new String(data, currentOffset, len, StandardCharsets.US_ASCII);
            name.append(label);
            currentOffset += len;
            if (!jumped) {
                nextOffset = currentOffset;
            }
        }

        if (!terminated) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS response name truncated");
        }

        return new NameParseResult(name.toString().toLowerCase(Locale.US), nextOffset);
    }

    private Network getActiveNetwork() {
        if (connectivityManager != null) {
            return connectivityManager.getActiveNetwork();
        }
        return null;
    }

    public static final class SanitizerConfig {
        private static final String CODE_NULL = "SANITIZER_CONFIG_NULL";
        private static final String CODE_MISSING_KEY = "SANITIZER_CONFIG_MISSING_KEY";
        private static final String CODE_INVALID_TYPE = "SANITIZER_CONFIG_INVALID_TYPE";
        private static final String CODE_INVALID_RANGE = "SANITIZER_CONFIG_RANGE";
        private static final String CODE_INVALID_REGEX = "SANITIZER_CONFIG_REGEX";
        private static final String CODE_UNEXPECTED = "SANITIZER_CONFIG_UNEXPECTED";

        // Combining marks Unicode ranges (portable alternative to \p{M} which requires UNICODE_CHARACTER_CLASS):
        // \u0300-\u036f = Combining Diacritical Marks
        // \u1ab0-\u1aff = Combining Diacritical Marks Extended
        // \u1dc0-\u1dff = Combining Diacritical Marks Supplement
        // \u20d0-\u20ff = Combining Diacritical Marks for Symbols
        // \ufe20-\ufe2f = Combining Half Marks
        private static final String COMBINING_MARKS_PATTERN =
            "[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]+";

        private static final SanitizerConfig DEFAULT = build(
            Pattern.compile("\\s+"),
            Pattern.compile("[^a-z0-9-]"),
            Pattern.compile("-{2,}"),
            Pattern.compile("^-+|-+$"),
            Pattern.compile(COMBINING_MARKS_PATTERN),
            "-",
            DEFAULT_MAX_LABEL_LENGTH,
            Normalizer.Form.NFKD,
            DEFAULT_ALLOWED_SERVERS,
            true
        );

        final Pattern whitespacePattern;
        final Pattern invalidCharsPattern;
        final Pattern dashCollapsePattern;
        final Pattern edgeDashesPattern;
        final Pattern combiningMarksPattern;

        final String spaceReplacement;
        final int maxLabelLength;
        final Normalizer.Form normalizationForm;
        final Set<String> allowedServers;
        final boolean defaultConfig;

        private SanitizerConfig(
            Pattern whitespacePattern,
            Pattern invalidCharsPattern,
            Pattern dashCollapsePattern,
            Pattern edgeDashesPattern,
            Pattern combiningMarksPattern,
            String spaceReplacement,
            int maxLabelLength,
            Normalizer.Form normalizationForm,
            Set<String> allowedServers,
            boolean defaultConfig
        ) {
            this.whitespacePattern = whitespacePattern;
            this.invalidCharsPattern = invalidCharsPattern;
            this.dashCollapsePattern = dashCollapsePattern;
            this.edgeDashesPattern = edgeDashesPattern;
            this.combiningMarksPattern = combiningMarksPattern;
            this.spaceReplacement = spaceReplacement;
            this.maxLabelLength = maxLabelLength;
            this.normalizationForm = normalizationForm;
            this.allowedServers = allowedServers;
            this.defaultConfig = defaultConfig;
        }

        static SanitizerConfig defaultInstance() {
            return DEFAULT;
        }

        boolean isDefault() {
            return defaultConfig;
        }

        static SanitizerConfig fromMap(Map<String, Object> map) {
            if (map == null) {
                throw SanitizerConfigException.of(CODE_NULL, "Sanitizer config map cannot be null");
            }

            try {
                String spaceReplacement = readString(map, "spaceReplacement");
                if (spaceReplacement.isEmpty()) {
                    throw SanitizerConfigException.of(
                        CODE_INVALID_RANGE,
                        "spaceReplacement must be present and non-empty"
                    );
                }

                int maxLabelLength = readInt(map, "maxLabelLength");
                if (maxLabelLength <= 0 || maxLabelLength > DEFAULT_MAX_LABEL_LENGTH) {
                    throw SanitizerConfigException.of(
                        CODE_INVALID_RANGE,
                        "maxLabelLength must be between 1 and " + DEFAULT_MAX_LABEL_LENGTH
                    );
                }

                Normalizer.Form normalizationForm = parseNormalizationForm(readString(map, "unicodeNormalization"));
                Set<String> allowedServers = readAllowedServers(map);

                Pattern whitespacePattern = compilePattern(readMap(map, "whitespace"), "whitespace");
                Pattern invalidCharsPattern = compilePattern(readMap(map, "invalidChars"), "invalidChars");
                Pattern dashCollapsePattern = compilePattern(readMap(map, "dashCollapse"), "dashCollapse");
                Pattern edgeDashesPattern = compilePattern(readMap(map, "edgeDashes"), "edgeDashes");
                Pattern combiningMarksPattern = compilePattern(readMap(map, "combiningMarks"), "combiningMarks");

                return build(
                    whitespacePattern,
                    invalidCharsPattern,
                    dashCollapsePattern,
                    edgeDashesPattern,
                    combiningMarksPattern,
                    spaceReplacement,
                    maxLabelLength,
                    normalizationForm,
                    allowedServers,
                    false
                );
            } catch (SanitizerConfigException error) {
                throw error;
            } catch (Exception error) {
                throw SanitizerConfigException.of(CODE_UNEXPECTED, "Unexpected sanitizer configuration error", error);
            }
        }

        private static SanitizerConfig build(
            Pattern whitespacePattern,
            Pattern invalidCharsPattern,
            Pattern dashCollapsePattern,
            Pattern edgeDashesPattern,
            Pattern combiningMarksPattern,
            String spaceReplacement,
            int maxLabelLength,
            Normalizer.Form normalizationForm,
            Set<String> allowedServers,
            boolean defaultConfig
        ) {
            return new SanitizerConfig(
                whitespacePattern,
                invalidCharsPattern,
                dashCollapsePattern,
                edgeDashesPattern,
                combiningMarksPattern,
                spaceReplacement,
                maxLabelLength,
                normalizationForm,
                allowedServers,
                defaultConfig
            );
        }

        private static Pattern compilePattern(Map<String, Object> descriptor, String key) {
            String pattern = readString(descriptor, "pattern");
            String flagsValue = readStringOptional(descriptor, "flags");
            int flags = parseFlags(flagsValue);
            try {
                return Pattern.compile(pattern, flags);
            } catch (Exception error) {
                throw SanitizerConfigException.of(CODE_INVALID_REGEX, "Invalid regex for " + key + ": " + pattern, error);
            }
        }

        private static int parseFlags(String flagsValue) {
            if (flagsValue == null || flagsValue.isEmpty()) {
                return 0;
            }
            int flags = 0;
            for (char flag : flagsValue.toCharArray()) {
                switch (flag) {
                    case 'i':
                        flags |= Pattern.CASE_INSENSITIVE;
                        break;
                    case 'm':
                        flags |= Pattern.MULTILINE;
                        break;
                    case 's':
                        flags |= Pattern.DOTALL;
                        break;
                    case 'u':
                        // UNICODE_CHARACTER_CLASS enables Unicode-aware character classes
                        // This makes \d, \w, \s match Unicode characters, not just ASCII
                        // Reference: https://stackoverflow.com/questions/72236081/different-java-regex-matching-behavior-when-using-unicode-character-class-flag
                        flags |= Pattern.UNICODE_CASE | Pattern.UNICODE_CHARACTER_CLASS;
                        break;
                    case 'g':
                        // Global flag is implied by Java's matcher iteration; ignore silently.
                        break;
                    default:
                        throw SanitizerConfigException.of(
                            CODE_INVALID_RANGE,
                            "Unsupported regex flag '" + flag + "'"
                        );
                }
            }
            return flags;
        }

        private static Normalizer.Form parseNormalizationForm(String value) {
            if (value == null || value.isEmpty()) {
                return Normalizer.Form.NFKD;
            }
            switch (value.toUpperCase(Locale.US)) {
                case "NFC":
                    return Normalizer.Form.NFC;
                case "NFD":
                    return Normalizer.Form.NFD;
                case "NFKC":
                    return Normalizer.Form.NFKC;
                case "NFKD":
                    return Normalizer.Form.NFKD;
                default:
                    throw SanitizerConfigException.of(
                        CODE_INVALID_RANGE,
                        "Unsupported unicodeNormalization: " + value
                    );
            }
        }

        @SuppressWarnings("unchecked")
        private static Map<String, Object> readMap(Map<String, Object> map, String key) {
            Object value = map.get(key);
            if (value instanceof Map) {
                return (Map<String, Object>) value;
            }
            throw SanitizerConfigException.of(
                value == null ? CODE_MISSING_KEY : CODE_INVALID_TYPE,
                value == null
                    ? "Missing key '" + key + "' in sanitizer config"
                    : "Expected map for key '" + key + "'"
            );
        }

        private static String readString(Map<String, Object> map, String key) {
            Object value = map.get(key);
            if (value == null) {
                throw SanitizerConfigException.of(CODE_MISSING_KEY, "Missing key '" + key + "' in sanitizer config");
            }
            if (value instanceof String) {
                return (String) value;
            }
            throw SanitizerConfigException.of(CODE_INVALID_TYPE, "Expected string for key '" + key + "'");
        }

        private static String readStringOptional(Map<String, Object> map, String key) {
            Object value = map.get(key);
            if (value == null) {
                return null;
            }
            if (value instanceof String) {
                return (String) value;
            }
            throw SanitizerConfigException.of(CODE_INVALID_TYPE, "Expected string for key '" + key + "'");
        }

        private static int readInt(Map<String, Object> map, String key) {
            Object value = map.get(key);
            if (value instanceof Number) {
                return ((Number) value).intValue();
            }
            throw SanitizerConfigException.of(
                value == null ? CODE_MISSING_KEY : CODE_INVALID_TYPE,
                value == null
                    ? "Missing key '" + key + "' in sanitizer config"
                    : "Expected numeric value for key '" + key + "'"
            );
        }

        private static Set<String> readAllowedServers(Map<String, Object> map) {
            Object value = map.get("allowedServers");
            if (value == null) {
                return DEFAULT_ALLOWED_SERVERS;
            }
            if (!(value instanceof List)) {
                throw SanitizerConfigException.of(
                    CODE_INVALID_TYPE,
                    "Expected array for key 'allowedServers'"
                );
            }
            List<?> rawList = (List<?>) value;
            Set<String> normalized = new HashSet<>();
            for (Object item : rawList) {
                if (!(item instanceof String)) {
                    throw SanitizerConfigException.of(
                        CODE_INVALID_TYPE,
                        "Expected string entries in 'allowedServers'"
                    );
                }
                String normalizedHost = normalizeServerHostInput((String) item);
                if (!normalizedHost.isEmpty()) {
                    normalized.add(normalizedHost);
                }
            }
            if (normalized.isEmpty()) {
                throw SanitizerConfigException.of(
                    CODE_INVALID_RANGE,
                    "allowedServers must contain at least one entry"
                );
            }
            // Subset-only narrowing: the supplied list may only narrow the
            // compiled-in default allowlist, never extend it. This hardens the
            // native layer against a hijacked JS bundle injecting rogue servers.
            normalized.retainAll(DEFAULT_ALLOWED_SERVERS);
            if (normalized.isEmpty()) {
                throw SanitizerConfigException.of(
                    CODE_INVALID_RANGE,
                    "allowedServers must be a subset of the built-in allowlist"
                );
            }
            return Collections.unmodifiableSet(normalized);
        }

        private static boolean patternEquals(Pattern first, Pattern second) {
            return first.pattern().equals(second.pattern()) && first.flags() == second.flags();
        }

        private static int patternHash(Pattern pattern) {
            return Objects.hash(pattern.pattern(), pattern.flags());
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (!(obj instanceof SanitizerConfig)) {
                return false;
            }
            SanitizerConfig other = (SanitizerConfig) obj;
            return maxLabelLength == other.maxLabelLength
                && normalizationForm == other.normalizationForm
                && Objects.equals(allowedServers, other.allowedServers)
                && patternEquals(whitespacePattern, other.whitespacePattern)
                && patternEquals(invalidCharsPattern, other.invalidCharsPattern)
                && patternEquals(dashCollapsePattern, other.dashCollapsePattern)
                && patternEquals(edgeDashesPattern, other.edgeDashesPattern)
                && patternEquals(combiningMarksPattern, other.combiningMarksPattern)
                && spaceReplacement.equals(other.spaceReplacement);
        }

        @Override
        public int hashCode() {
            return Objects.hash(
                patternHash(whitespacePattern),
                patternHash(invalidCharsPattern),
                patternHash(dashCollapsePattern),
                patternHash(edgeDashesPattern),
                patternHash(combiningMarksPattern),
                spaceReplacement,
                maxLabelLength,
                normalizationForm,
                allowedServers
            );
        }

        public static final class SanitizerConfigException extends IllegalArgumentException {
            private final String code;

            private SanitizerConfigException(String code, String message, Throwable cause) {
                super(message, cause);
                this.code = code;
            }

            private SanitizerConfigException(String code, String message) {
                super(message);
                this.code = code;
            }

            static SanitizerConfigException of(String code, String message) {
                return new SanitizerConfigException(code, message);
            }

            static SanitizerConfigException of(String code, String message, Throwable cause) {
                return new SanitizerConfigException(code, message, cause);
            }

            public String getCode() {
                return code;
            }
        }

    }

    public static class DNSCapabilities {
        public final boolean available;
        public final String platform;
        public final boolean supportsCustomServer;
        public final boolean supportsAsyncQuery;
        public final int apiLevel;

        public DNSCapabilities() {
            this.available = isAvailable();
            this.platform = "android";
            this.supportsCustomServer = true;
            this.supportsAsyncQuery = true;
            this.apiLevel = Build.VERSION.SDK_INT;
        }
    }

    /**
     * Structured DNS error types matching iOS DNSError enum for cross-platform consistency
     */
    public static class DNSError extends RuntimeException {
        public enum Type {
            RESOLVER_FAILED,
            QUERY_FAILED,
            NO_RECORDS_FOUND,
            TIMEOUT,
            CANCELLED
        }
        
        private final Type type;
        private final String details;
        
        public DNSError(Type type, String details) {
            super(type.name() + ": " + details);
            this.type = type;
            this.details = details;
        }
        
        public DNSError(Type type, String details, Throwable cause) {
            super(type.name() + ": " + details, cause);
            this.type = type;
            this.details = details;
        }
        
        public Type getType() {
            return type;
        }
        
        public String getDetails() {
            return details;
        }
        
        @Override
        public String toString() {
            return "DNSError{type=" + type + ", details='" + details + "'}";
        }
    }
}
