package com.dnsnative;

import android.net.ConnectivityManager;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.xbill.DNS.Lookup;

public final class DNSResolverJvmHarness {
    private interface CheckedRunnable {
        void run() throws Exception;
    }

    private static int failures;

    private DNSResolverJvmHarness() {}

    public static void main(String[] args) throws Exception {
        runCase("parser-transactionality-and-utf8", DNSResolverJvmHarness::testParserBoundaries);
        // doh-body-size-boundaries removed with the Cloudflare DoH transport: it drove
        // readDnsMessageBody, which no longer exists. See androidDnsResolver.policy.spec.ts,
        // which now forbids HttpURLConnection in this resolver outright.
        runCase(
            "stalled-resolution-deadline-and-cleanup",
            DNSResolverJvmHarness::testStalledResolutionDeadlineAndCleanup
        );
        runCase(
            "expired-caller-deadline-before-io",
            DNSResolverJvmHarness::testExpiredCallerDeadlineBeforeIo
        );
        runCase(
            "legacy-fallback-observability-positive-control",
            DNSResolverJvmHarness::testLegacyFallbackObservabilityPositiveControl
        );
        runCase(
            "short-caller-deadline-bounds-fallback",
            DNSResolverJvmHarness::testShortCallerDeadlineBoundsFallback
        );
        runCase(
            "cancelled-identical-queries-release-raw-udp-workers",
            DNSResolverJvmHarness::testCancelledIdenticalQueriesReleaseRawUdpWorkers
        );
        runCase(
            "cancel-during-host-resolution-blocks-raw-udp",
            DNSResolverJvmHarness::testCancelDuringHostResolutionBlocksRawUdp
        );
        runCase(
            "cancelled-host-lookups-do-not-retain-query-workers",
            DNSResolverJvmHarness::testCancelledHostLookupsDoNotRetainQueryWorkers
        );
        runCase(
            "platform-resolver-timeout-cancels-signal",
            DNSResolverJvmHarness::testPlatformResolverTimeoutCancelsSignal
        );

        if (failures != 0) {
            throw new AssertionError(failures + " executable DNSResolver case(s) failed");
        }
    }

    private static void runCase(String name, CheckedRunnable test) {
        try {
            test.run();
            System.out.println("PASS " + name);
        } catch (Throwable error) {
            failures++;
            System.out.println("FAIL " + name + ": " + error);
        }
    }

    private static void testParserBoundaries() throws Exception {
        DNSResolver resolver = new DNSResolver(null);
        try {
            Method parser = DNSResolver.class.getDeclaredMethod(
                "parseDnsTxtResponse",
                byte[].class,
                int.class,
                String.class
            );
            parser.setAccessible(true);

            String queryName = "test.llm.pieter.com";
            int transactionId = 0x1234;
            @SuppressWarnings("unchecked")
            List<String> positive = (List<String>) parser.invoke(
                resolver,
                dnsResponse(transactionId, queryName, new byte[][] {
                    new byte[] { 2, 'o', 'k' }
                }),
                transactionId,
                queryName
            );
            require(positive.size() == 1 && "ok".equals(positive.get(0)), "valid TXT control failed");

            expectDnsError(() -> parser.invoke(
                resolver,
                dnsResponse(transactionId, queryName, new byte[][] {
                    new byte[] { 2, 'o', 'k' },
                    new byte[] { 5, 'x' }
                }),
                transactionId,
                queryName
            ), DNSResolver.DNSError.Type.QUERY_FAILED);

            expectDnsError(() -> parser.invoke(
                resolver,
                dnsResponse(transactionId, queryName, new byte[][] {
                    new byte[] { 2, (byte) 0xC3, 0x28 }
                }),
                transactionId,
                queryName
            ), DNSResolver.DNSError.Type.QUERY_FAILED);
        } finally {
            resolver.cleanup();
        }
    }

    private static void testStalledResolutionDeadlineAndCleanup() throws Exception {
        Class<?> hostResolverType = Class.forName("com.dnsnative.DNSResolver$HostResolver");
        CountDownLatch entered = new CountDownLatch(1);
        CountDownLatch release = new CountDownLatch(1);
        AtomicInteger calls = new AtomicInteger();
        Object stalledHostResolver = Proxy.newProxyInstance(
            hostResolverType.getClassLoader(),
            new Class<?>[] { hostResolverType },
            (proxy, method, args) -> {
                if (!"resolve".equals(method.getName())) {
                    if ("toString".equals(method.getName())) {
                        return "StalledHostResolver";
                    }
                    return null;
                }
                int call = calls.incrementAndGet();
                if (call > 1) {
                    return InetAddress.getLoopbackAddress();
                }
                entered.countDown();
                while (true) {
                    try {
                        if (release.await(1, TimeUnit.SECONDS)) {
                            return InetAddress.getLoopbackAddress();
                        }
                    } catch (InterruptedException ignored) {
                        // Simulates a platform resolver that does not honor Future.cancel(true).
                    }
                }
            }
        );

        Constructor<DNSResolver> constructor = DNSResolver.class.getDeclaredConstructor(
            ConnectivityManager.class,
            hostResolverType,
            long.class
        );
        constructor.setAccessible(true);
        DNSResolver resolver = constructor.newInstance(null, stalledHostResolver, 75L);
        try {
            long firstStartedNanos = System.nanoTime();
            CompletableFuture<List<String>> first = resolver.queryTXT(
                "llm.pieter.com",
                "one.llm.pieter.com",
                53,
                System.currentTimeMillis() + 1_000L
            );
            require(entered.await(1, TimeUnit.SECONDS), "stalled resolver seam was not entered");
            expectFutureDnsError(first, DNSResolver.DNSError.Type.TIMEOUT);
            require(
                System.nanoTime() - firstStartedNanos < TimeUnit.MILLISECONDS.toNanos(750),
                "stalled lookup exceeded the injected native deadline"
            );
            awaitNoActiveQueries(resolver);

            // The numeric-literal fast path is gone with isNumericAddressLiteral: the
            // native allowlist no longer admits a bare IP, so every resolvable host now
            // goes through HostResolver. Only the recovery lane is exercised here.
            Method registerActiveQuery = DNSResolver.class.getDeclaredMethod(
                "registerActiveQuery"
            );
            registerActiveQuery.setAccessible(true);

            long recoveryStartedNanos = System.nanoTime();
            Object recoveryOperation = registerActiveQuery.invoke(resolver);
            Method resolveServerAddress = DNSResolver.class.getDeclaredMethod(
                "resolveServerAddress",
                recoveryOperation.getClass(),
                String.class,
                long.class
            );
            resolveServerAddress.setAccessible(true);
            @SuppressWarnings("unchecked")
            CompletableFuture<InetAddress> recoveredAddress =
                (CompletableFuture<InetAddress>) resolveServerAddress.invoke(
                    resolver,
                    recoveryOperation,
                    "llm.pieter.com",
                    System.nanoTime() + TimeUnit.SECONDS.toNanos(1)
                );
            require(
                InetAddress.getLoopbackAddress().equals(
                    recoveredAddress.get(1, TimeUnit.SECONDS)
                ),
                "a stalled lookup blocked the resolver recovery lane"
            );
            require(
                System.nanoTime() - recoveryStartedNanos
                    < TimeUnit.MILLISECONDS.toNanos(750),
                "resolver recovery lane exceeded its deadline"
            );
            require(calls.get() == 2, "resolver recovery did not execute a fresh lookup");
        } finally {
            release.countDown();
            resolver.cleanup();
        }
    }

    private static void testExpiredCallerDeadlineBeforeIo() throws Exception {
        AtomicInteger hostResolverCalls = new AtomicInteger();
        DNSResolver resolver = new DNSResolver(
            null,
            host -> {
                hostResolverCalls.incrementAndGet();
                return InetAddress.getLoopbackAddress();
            },
            9_500L
        );
        try {
            CompletableFuture<List<String>> query = resolver.queryTXT(
                "llm.pieter.com",
                "expired.llm.pieter.com",
                53,
                System.currentTimeMillis() - 1L
            );
            expectFutureDnsError(query, DNSResolver.DNSError.Type.TIMEOUT);
            require(hostResolverCalls.get() == 0, "expired query invoked HostResolver");
            awaitNoActiveQueries(resolver);
        } finally {
            resolver.cleanup();
        }
    }

    private static void testLegacyFallbackObservabilityPositiveControl() throws Exception {
        Lookup.resetRunCount();
        InetAddress loopback = InetAddress.getLoopbackAddress();
        DatagramSocket serverSocket = new DatagramSocket(0, loopback);
        CountDownLatch invalidResponseSent = new CountDownLatch(1);
        Thread responder = new Thread(() -> {
            byte[] payload = new byte[2048];
            try {
                DatagramPacket request = new DatagramPacket(payload, payload.length);
                serverSocket.receive(request);
                byte[] invalidResponse = new byte[12];
                serverSocket.send(new DatagramPacket(
                    invalidResponse,
                    invalidResponse.length,
                    request.getAddress(),
                    request.getPort()
                ));
                invalidResponseSent.countDown();
            } catch (Exception ignored) {
                // The assertions below expose any failure to exercise the raw-UDP control.
            }
        }, "DNSDeadlineHarnessResponder");
        responder.setDaemon(true);
        responder.start();

        DNSResolver resolver = new DNSResolver(null, host -> loopback, 9_500L);
        try {
            CompletableFuture<List<String>> query = resolver.queryTXT(
                "llm.pieter.com",
                "fallback.llm.pieter.com",
                serverSocket.getLocalPort(),
                System.currentTimeMillis() + 3_000L
            );
            require(
                invalidResponseSent.await(1, TimeUnit.SECONDS),
                "fallback positive control did not answer raw UDP"
            );
            expectFutureDnsError(query, DNSResolver.DNSError.Type.NO_RECORDS_FOUND);
            require(Lookup.getRunCount() > 0, "legacy Lookup.run positive control did not fire");
            awaitNoActiveQueries(resolver);
        } finally {
            serverSocket.close();
            responder.join(1_000L);
            resolver.cleanup();
        }
    }

    private static void testShortCallerDeadlineBoundsFallback() throws Exception {
        Lookup.resetRunCount();
        InetAddress loopback = InetAddress.getLoopbackAddress();
        DatagramSocket serverSocket = new DatagramSocket(0, loopback);
        CountDownLatch firstPacketReceived = new CountDownLatch(1);
        AtomicInteger packetCount = new AtomicInteger();
        Thread receiver = new Thread(() -> {
            byte[] payload = new byte[2048];
            while (!serverSocket.isClosed()) {
                try {
                    serverSocket.receive(new DatagramPacket(payload, payload.length));
                    packetCount.incrementAndGet();
                    firstPacketReceived.countDown();
                } catch (Exception ignored) {
                    return;
                }
            }
        }, "DNSDeadlineHarnessReceiver");
        receiver.setDaemon(true);
        receiver.start();

        DNSResolver resolver = new DNSResolver(null, host -> loopback, 9_500L);
        try {
            CompletableFuture<List<String>> query = resolver.queryTXT(
                "llm.pieter.com",
                "short.llm.pieter.com",
                serverSocket.getLocalPort(),
                System.currentTimeMillis() + 200L
            );
            require(
                firstPacketReceived.await(1, TimeUnit.SECONDS),
                "short-budget raw UDP positive control did not send"
            );
            expectFutureDnsError(query, DNSResolver.DNSError.Type.TIMEOUT);
            Thread.sleep(100L);
            require(packetCount.get() == 1, "deadline allowed another DNS packet");
            require(Lookup.getRunCount() == 0, "deadline allowed legacy Lookup.run");
            awaitNoActiveQueries(resolver);
        } finally {
            serverSocket.close();
            receiver.join(1_000L);
            resolver.cleanup();
        }
    }

    private static void testCancelledIdenticalQueriesReleaseRawUdpWorkers() throws Exception {
        Lookup.resetRunCount();
        InetAddress loopback = InetAddress.getLoopbackAddress();
        DatagramSocket serverSocket = new DatagramSocket(0, loopback);
        DNSResolver resolver = new DNSResolver(null, host -> loopback, 9_500L);
        int workerCount = queryExecutor(resolver).getMaximumPoolSize();
        CountDownLatch blockedPacketsReceived = new CountDownLatch(workerCount);
        CountDownLatch freshResponseSent = new CountDownLatch(1);
        AtomicInteger packetCount = new AtomicInteger();
        Thread receiver = new Thread(() -> {
            byte[] payload = new byte[2048];
            while (!serverSocket.isClosed()) {
                try {
                    DatagramPacket request = new DatagramPacket(payload, payload.length);
                    serverSocket.receive(request);
                    int received = packetCount.incrementAndGet();
                    if (received <= workerCount) {
                        blockedPacketsReceived.countDown();
                        continue;
                    }
                    byte[] invalidResponse = new byte[12];
                    serverSocket.send(new DatagramPacket(
                        invalidResponse,
                        invalidResponse.length,
                        request.getAddress(),
                        request.getPort()
                    ));
                    freshResponseSent.countDown();
                    return;
                } catch (Exception ignored) {
                    return;
                }
            }
        }, "DNSCancelHarnessReceiver");
        receiver.setDaemon(true);
        receiver.start();

        try {
            long sharedDeadline = System.currentTimeMillis() + 9_000L;
            @SuppressWarnings("unchecked")
            CompletableFuture<List<String>>[] cancelledQueries =
                new CompletableFuture[workerCount];
            for (int index = 0; index < workerCount; index++) {
                cancelledQueries[index] = resolver.queryTXT(
                    "llm.pieter.com",
                    "identical.llm.pieter.com",
                    serverSocket.getLocalPort(),
                    sharedDeadline
                );
                awaitAtomicCount(
                    packetCount,
                    index + 1,
                    "identical operation did not reach raw UDP independently"
                );
            }
            require(
                blockedPacketsReceived.await(2, TimeUnit.SECONDS),
                "identical operations did not independently occupy every raw-UDP worker"
            );
            require(
                activeQueryCount(resolver) == workerCount,
                "identical operations did not have independent active ownership"
            );
            require(
                resolver.cancelActiveQueries() == workerCount,
                "cancel count did not include every identical operation"
            );
            for (CompletableFuture<List<String>> cancelledQuery : cancelledQueries) {
                expectFutureDnsError(cancelledQuery, DNSResolver.DNSError.Type.CANCELLED);
            }
            awaitNoActiveQueries(resolver);

            CompletableFuture<List<String>> freshQuery = resolver.queryTXT(
                "llm.pieter.com",
                "identical.llm.pieter.com",
                serverSocket.getLocalPort(),
                sharedDeadline
            );
            require(
                freshResponseSent.await(750, TimeUnit.MILLISECONDS),
                "cancelled raw-UDP work retained the query executor"
            );
            expectFutureDnsError(freshQuery, DNSResolver.DNSError.Type.NO_RECORDS_FOUND);
            require(
                packetCount.get() == workerCount + 1,
                "cancelled operations emitted packets after cancellation"
            );
            require(Lookup.getRunCount() > 0, "fresh query did not reach observable legacy fallback");
            awaitNoActiveQueries(resolver);
        } finally {
            serverSocket.close();
            receiver.join(1_000L);
            resolver.cleanup();
        }
    }

    private static void testCancelDuringHostResolutionBlocksRawUdp() throws Exception {
        InetAddress loopback = InetAddress.getLoopbackAddress();
        DatagramSocket serverSocket = new DatagramSocket(0, loopback);
        CountDownLatch hostResolverEntered = new CountDownLatch(1);
        CountDownLatch releaseHostResolver = new CountDownLatch(1);
        AtomicInteger packetCount = new AtomicInteger();
        Thread receiver = new Thread(() -> {
            byte[] payload = new byte[2048];
            try {
                serverSocket.setSoTimeout(500);
                serverSocket.receive(new DatagramPacket(payload, payload.length));
                packetCount.incrementAndGet();
            } catch (Exception ignored) {
                // A timeout is the expected negative-control outcome.
            }
        }, "DNSCancelHostLookupReceiver");
        receiver.setDaemon(true);
        receiver.start();

        DNSResolver resolver = new DNSResolver(
            null,
            host -> {
                hostResolverEntered.countDown();
                releaseHostResolver.await(1, TimeUnit.SECONDS);
                return loopback;
            },
            9_500L
        );
        try {
            CompletableFuture<List<String>> query = resolver.queryTXT(
                "llm.pieter.com",
                "blocked.llm.pieter.com",
                serverSocket.getLocalPort(),
                System.currentTimeMillis() + 3_000L
            );
            require(
                hostResolverEntered.await(1, TimeUnit.SECONDS),
                "blocked HostResolver control was not entered"
            );
            require(activeQueryCount(resolver) == 1, "blocked HostResolver query was not active");
            require(resolver.cancelActiveQueries() == 1, "blocked query was not cancelled");
            expectFutureDnsError(query, DNSResolver.DNSError.Type.CANCELLED);
            awaitNoActiveQueries(resolver);
            releaseHostResolver.countDown();
            receiver.join(1_000L);
            require(packetCount.get() == 0, "raw UDP started after cancellation during host lookup");
        } finally {
            releaseHostResolver.countDown();
            serverSocket.close();
            receiver.join(1_000L);
            resolver.cleanup();
        }
    }

    private static void testCancelledHostLookupsDoNotRetainQueryWorkers() throws Exception {
        InetAddress loopback = InetAddress.getLoopbackAddress();
        DatagramSocket serverSocket = new DatagramSocket(0, loopback);
        CountDownLatch hostResolversEntered = new CountDownLatch(2);
        CountDownLatch releaseHostResolvers = new CountDownLatch(1);
        AtomicInteger hostResolverCalls = new AtomicInteger();
        DNSResolver resolver = new DNSResolver(
            null,
            host -> {
                hostResolverCalls.incrementAndGet();
                hostResolversEntered.countDown();
                while (true) {
                    try {
                        if (releaseHostResolvers.await(1, TimeUnit.SECONDS)) {
                            return loopback;
                        }
                    } catch (InterruptedException ignored) {
                        // Models InetAddress on API levels where interruption is not cooperative.
                    }
                }
            },
            9_500L
        );
        try {
            long deadline = System.currentTimeMillis() + 9_000L;
            CompletableFuture<List<String>> first = resolver.queryTXT(
                "llm.pieter.com",
                "host-one.llm.pieter.com",
                serverSocket.getLocalPort(),
                deadline
            );
            CompletableFuture<List<String>> second = resolver.queryTXT(
                "llm.pieter.com",
                "host-two.llm.pieter.com",
                serverSocket.getLocalPort(),
                deadline
            );
            require(
                hostResolversEntered.await(1, TimeUnit.SECONDS),
                "two uninterruptible HostResolver controls did not enter"
            );
            require(resolver.cancelActiveQueries() == 2, "host operations were not both cancelled");
            expectFutureDnsError(first, DNSResolver.DNSError.Type.CANCELLED);
            expectFutureDnsError(second, DNSResolver.DNSError.Type.CANCELLED);
            awaitNoActiveQueries(resolver);
            awaitQueryExecutorIdle(resolver);

            long failFastStarted = System.nanoTime();
            CompletableFuture<List<String>> saturated = resolver.queryTXT(
                "llm.pieter.com",
                "host-third.llm.pieter.com",
                serverSocket.getLocalPort(),
                deadline
            );
            expectFutureDnsError(saturated, DNSResolver.DNSError.Type.QUERY_FAILED);
            require(
                System.nanoTime() - failFastStarted < TimeUnit.MILLISECONDS.toNanos(750),
                "saturated dedicated host-resolution lane did not fail fast"
            );
            require(hostResolverCalls.get() == 2, "host pool admitted work beyond its two lanes");

            releaseHostResolvers.countDown();
            Thread.sleep(150L);
            serverSocket.setSoTimeout(250);
            try {
                byte[] payload = new byte[2048];
                serverSocket.receive(new DatagramPacket(payload, payload.length));
                throw new AssertionError("raw UDP started after cancelled host resolution");
            } catch (java.net.SocketTimeoutException expected) {
                // Positive negative-control: the live socket observed no post-cancel packet.
            }
            awaitNoActiveQueries(resolver);
        } finally {
            releaseHostResolvers.countDown();
            serverSocket.close();
            resolver.cleanup();
        }
    }

    private static void testPlatformResolverTimeoutCancelsSignal() throws Exception {
        android.net.DnsResolver.reset();
        android.net.DnsResolver.setErrorOnCancel(true);
        Constructor<DNSResolver> constructor = DNSResolver.class.getDeclaredConstructor(
            ConnectivityManager.class,
            DNSResolver.HostResolver.class,
            long.class,
            boolean.class
        );
        constructor.setAccessible(true);
        DNSResolver resolver = constructor.newInstance(
            null,
            (DNSResolver.HostResolver) host -> {
                throw new AssertionError("platform path called the injected HostResolver");
            },
            250L,
            true
        );
        try {
            CompletableFuture<List<String>> timedOut = resolver.queryTXT(
                "llm.pieter.com",
                "platform-timeout.llm.pieter.com",
                53,
                System.currentTimeMillis() + 2_000L
            );
            awaitPlatformQueryCount(1);
            android.os.CancellationSignal timeoutSignal =
                android.net.DnsResolver.getLastCancellationSignal();
            require(timeoutSignal != null, "platform resolver did not receive a cancellation signal");
            require(!timeoutSignal.isCanceled(), "platform signal lacked a live positive control");
            expectFutureDnsError(timedOut, DNSResolver.DNSError.Type.TIMEOUT);
            require(timeoutSignal.isCanceled(), "platform timeout did not cancel its signal");
            awaitNoActiveQueries(resolver);

            android.net.DnsResolver.reset();
            android.net.DnsResolver.setThrowOnQuery(true);
            CompletableFuture<List<String>> setupFailure = resolver.queryTXT(
                "llm.pieter.com",
                "platform-setup.llm.pieter.com",
                53,
                System.currentTimeMillis() + 2_000L
            );
            expectFutureDnsError(setupFailure, DNSResolver.DNSError.Type.QUERY_FAILED);
            require(
                android.net.DnsResolver.getLastCancellationSignal().isCanceled(),
                "platform setup failure did not release its cancellation signal"
            );
            awaitNoActiveQueries(resolver);
        } finally {
            android.net.DnsResolver.reset();
            resolver.cleanup();
        }
    }

    private static void awaitPlatformQueryCount(int expected) throws Exception {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(1);
        while (System.nanoTime() < deadline) {
            if (android.net.DnsResolver.getQueryCount() >= expected) {
                return;
            }
            Thread.sleep(5L);
        }
        throw new AssertionError("platform DNS resolver positive control did not run");
    }

    private static void expectFutureDnsError(
        CompletableFuture<?> future,
        DNSResolver.DNSError.Type expectedType
    ) throws Exception {
        try {
            future.get(1, TimeUnit.SECONDS);
            throw new AssertionError("expected future to fail with " + expectedType);
        } catch (ExecutionException error) {
            assertDnsError(rootCause(error), expectedType);
        }
    }

    private static void awaitNoActiveQueries(DNSResolver resolver) throws Exception {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(1);
        while (System.nanoTime() < deadline) {
            if (activeQueryCount(resolver) == 0) {
                return;
            }
            Thread.sleep(5L);
        }
        throw new AssertionError("active query entry survived deadline completion");
    }

    private static int activeQueryCount(DNSResolver resolver) throws Exception {
        Field activeQueries = DNSResolver.class.getDeclaredField("activeQueries");
        activeQueries.setAccessible(true);
        return ((Map<?, ?>) activeQueries.get(resolver)).size();
    }

    private static ThreadPoolExecutor queryExecutor(DNSResolver resolver) throws Exception {
        Field executor = DNSResolver.class.getDeclaredField("executor");
        executor.setAccessible(true);
        return (ThreadPoolExecutor) executor.get(resolver);
    }

    private static void awaitQueryExecutorIdle(DNSResolver resolver) throws Exception {
        ThreadPoolExecutor executor = queryExecutor(resolver);
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(1);
        while (System.nanoTime() < deadline) {
            if (executor.getActiveCount() == 0 && executor.getQueue().isEmpty()) {
                return;
            }
            Thread.sleep(5L);
        }
        throw new AssertionError(
            "cancelled host resolution retained general query executor work"
        );
    }

    private static void awaitAtomicCount(
        AtomicInteger value,
        int expected,
        String failureMessage
    ) throws Exception {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(1);
        while (System.nanoTime() < deadline) {
            if (value.get() >= expected) {
                return;
            }
            Thread.sleep(5L);
        }
        throw new AssertionError(failureMessage + ": expected " + expected + ", got " + value.get());
    }

    private static void expectDnsError(
        CheckedRunnable action,
        DNSResolver.DNSError.Type expectedType
    ) throws Exception {
        try {
            action.run();
            throw new AssertionError("expected " + expectedType);
        } catch (Throwable error) {
            assertDnsError(rootCause(error), expectedType);
        }
    }

    private static void assertDnsError(
        Throwable error,
        DNSResolver.DNSError.Type expectedType
    ) {
        require(error instanceof DNSResolver.DNSError, "expected DNSError but got " + error);
        DNSResolver.DNSError dnsError = (DNSResolver.DNSError) error;
        require(dnsError.getType() == expectedType, "expected " + expectedType + " but got " + dnsError);
    }

    private static Throwable rootCause(Throwable error) {
        Throwable current = error;
        while (
            (current instanceof InvocationTargetException ||
                current instanceof ExecutionException ||
                current instanceof java.util.concurrent.CompletionException) &&
            current.getCause() != null
        ) {
            current = current.getCause();
        }
        return current;
    }

    private static byte[] dnsResponse(
        int transactionId,
        String queryName,
        byte[][] answerRdatas
    ) throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        writeU16(output, transactionId);
        writeU16(output, 0x8180);
        writeU16(output, 1);
        writeU16(output, answerRdatas.length);
        writeU16(output, 0);
        writeU16(output, 0);
        writeName(output, queryName);
        writeU16(output, 16);
        writeU16(output, 1);

        for (byte[] rdata : answerRdatas) {
            writeU16(output, 0xC00C);
            writeU16(output, 16);
            writeU16(output, 1);
            writeU32(output, 60);
            writeU16(output, rdata.length);
            output.write(rdata);
        }
        return output.toByteArray();
    }

    private static void writeName(ByteArrayOutputStream output, String name) throws Exception {
        for (String label : name.split("\\.")) {
            byte[] bytes = label.getBytes(StandardCharsets.US_ASCII);
            output.write(bytes.length);
            output.write(bytes);
        }
        output.write(0);
    }

    private static void writeU16(ByteArrayOutputStream output, int value) {
        output.write((value >>> 8) & 0xFF);
        output.write(value & 0xFF);
    }

    private static void writeU32(ByteArrayOutputStream output, long value) {
        output.write((int) ((value >>> 24) & 0xFF));
        output.write((int) ((value >>> 16) & 0xFF));
        output.write((int) ((value >>> 8) & 0xFF));
        output.write((int) (value & 0xFF));
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }
}
