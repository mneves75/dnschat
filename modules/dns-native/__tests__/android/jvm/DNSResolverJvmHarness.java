package com.dnsnative;

import android.net.ConnectivityManager;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.net.InetAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public final class DNSResolverJvmHarness {
    private interface CheckedRunnable {
        void run() throws Exception;
    }

    private static int failures;

    private DNSResolverJvmHarness() {}

    public static void main(String[] args) throws Exception {
        runCase("parser-transactionality-and-utf8", DNSResolverJvmHarness::testParserBoundaries);
        runCase("doh-body-size-boundaries", DNSResolverJvmHarness::testDohBodyBoundaries);
        runCase(
            "stalled-resolution-deadline-and-cleanup",
            DNSResolverJvmHarness::testStalledResolutionDeadlineAndCleanup
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

    private static void testDohBodyBoundaries() throws Exception {
        Method reader = DNSResolver.class.getDeclaredMethod(
            "readDnsMessageBody",
            java.io.InputStream.class,
            long.class,
            Runnable.class
        );
        reader.setAccessible(true);

        byte[] maximum = new byte[65535];
        AtomicInteger readChecks = new AtomicInteger();
        byte[] accepted = (byte[]) reader.invoke(
            null,
            new ByteArrayInputStream(maximum),
            65535L,
            (Runnable) readChecks::incrementAndGet
        );
        require(accepted.length == maximum.length, "maximum DNS body was not accepted");
        require(readChecks.get() > 1, "read deadline callback positive control did not run");

        expectDnsError(() -> reader.invoke(
            null,
            new ByteArrayInputStream(new byte[0]),
            65536L,
            (Runnable) () -> {}
        ), DNSResolver.DNSError.Type.QUERY_FAILED);

        expectDnsError(() -> reader.invoke(
            null,
            new ByteArrayInputStream(new byte[65536]),
            -1L,
            (Runnable) () -> {}
        ), DNSResolver.DNSError.Type.QUERY_FAILED);
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
                53
            );
            require(entered.await(1, TimeUnit.SECONDS), "stalled resolver seam was not entered");
            expectFutureDnsError(first, DNSResolver.DNSError.Type.TIMEOUT);
            require(
                System.nanoTime() - firstStartedNanos < TimeUnit.MILLISECONDS.toNanos(750),
                "stalled lookup exceeded the injected native deadline"
            );
            awaitNoActiveQueries(resolver);

            Method resolveServerAddress = DNSResolver.class.getDeclaredMethod(
                "resolveServerAddress",
                String.class,
                long.class
            );
            resolveServerAddress.setAccessible(true);
            @SuppressWarnings("unchecked")
            CompletableFuture<InetAddress> numericAddress =
                (CompletableFuture<InetAddress>) resolveServerAddress.invoke(
                    resolver,
                    "1.1.1.1",
                    System.nanoTime() + TimeUnit.SECONDS.toNanos(1)
                );
            require(
                "1.1.1.1".equals(numericAddress.get(1, TimeUnit.SECONDS).getHostAddress()),
                "numeric resolver address was blocked behind hostname lookup"
            );

            long recoveryStartedNanos = System.nanoTime();
            @SuppressWarnings("unchecked")
            CompletableFuture<InetAddress> recoveredAddress =
                (CompletableFuture<InetAddress>) resolveServerAddress.invoke(
                    resolver,
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
        Field activeQueries = DNSResolver.class.getDeclaredField("activeQueries");
        activeQueries.setAccessible(true);
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(1);
        while (System.nanoTime() < deadline) {
            Map<?, ?> queries = (Map<?, ?>) activeQueries.get(resolver);
            if (queries.isEmpty()) {
                return;
            }
            Thread.sleep(5L);
        }
        throw new AssertionError("active query entry survived deadline completion");
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
