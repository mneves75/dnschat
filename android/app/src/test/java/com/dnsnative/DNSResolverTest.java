package com.dnsnative;

import org.junit.Test;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.atomic.AtomicReference;
import java.util.regex.Pattern;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class DNSResolverTest {
    private static byte[] buildMinimalDnsResponse(int transactionId) {
        byte[] qname = new byte[] { 1, (byte) 'a', 0 };
        ByteBuffer buffer = ByteBuffer.allocate(12 + qname.length + 4);
        buffer.putShort((short) transactionId);
        buffer.putShort((short) 0x8180); // Standard response, recursion available
        buffer.putShort((short) 1); // QDCOUNT
        buffer.putShort((short) 0); // ANCOUNT
        buffer.putShort((short) 0); // NSCOUNT
        buffer.putShort((short) 0); // ARCOUNT
        buffer.put(qname);
        buffer.putShort((short) 16); // QTYPE TXT
        buffer.putShort((short) 1); // QCLASS IN
        return buffer.array();
    }

    @Test
    public void cleanupClearsActiveQueriesAndCompletesPending() throws Exception {
        DNSResolver resolver = new DNSResolver(null);

        Field activeQueriesField = DNSResolver.class.getDeclaredField("activeQueries");
        activeQueriesField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, CompletableFuture<?>> activeQueries =
            (Map<String, CompletableFuture<?>>) activeQueriesField.get(null);

        CompletableFuture<String> pending = new CompletableFuture<>();
        activeQueries.put("test-query", pending);

        resolver.cleanup();

        assertTrue("activeQueries should be empty after cleanup", activeQueries.isEmpty());
        assertTrue("pending query should complete", pending.isDone());
        assertTrue("pending query should be completed exceptionally", pending.isCompletedExceptionally());
    }

    @Test
    public void cleanupRepeatedlyDoesNotLeakActiveQueries() throws Exception {
        DNSResolver resolver = new DNSResolver(null);

        Field activeQueriesField = DNSResolver.class.getDeclaredField("activeQueries");
        activeQueriesField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, CompletableFuture<?>> activeQueries =
            (Map<String, CompletableFuture<?>>) activeQueriesField.get(null);

        for (int i = 0; i < 10; i++) {
            CompletableFuture<String> pending = new CompletableFuture<>();
            activeQueries.put("query-" + i, pending);
            resolver.cleanup();
            assertTrue("activeQueries should remain empty after cleanup", activeQueries.isEmpty());
        }
    }

    @Test
    public void executorUsesBoundedThreadPool() throws Exception {
        DNSResolver resolver = new DNSResolver(null);

        Field executorField = DNSResolver.class.getDeclaredField("executor");
        executorField.setAccessible(true);
        ExecutorService executorService = (ExecutorService) executorField.get(resolver);

        assertTrue("Expected ThreadPoolExecutor", executorService instanceof ThreadPoolExecutor);
        ThreadPoolExecutor executor = (ThreadPoolExecutor) executorService;

        int expectedSize = Math.max(2, Runtime.getRuntime().availableProcessors());
        assertEquals("Core pool size should match expected size", expectedSize, executor.getCorePoolSize());
        assertEquals("Max pool size should match expected size", expectedSize, executor.getMaximumPoolSize());
        assertTrue("Expected bounded LinkedBlockingQueue", executor.getQueue() instanceof LinkedBlockingQueue);
        int totalCapacity = executor.getQueue().remainingCapacity() + executor.getQueue().size();
        assertEquals("Queue capacity should match expected bound", 50, totalCapacity);
    }

    @Test
    public void queryDeduplicationReturnsSameFuture() {
        DNSResolver resolver = new DNSResolver(null);
        CompletableFuture<java.util.List<String>> first =
            resolver.queryTXT("llm.pieter.com", "hello dns", 53);
        CompletableFuture<java.util.List<String>> second =
            resolver.queryTXT("llm.pieter.com", "hello dns", 53);

        assertSame("Expected deduplicated futures for identical query", first, second);
        resolver.cleanup();
    }

    @Test
    public void normalizeServerHostLowercasesAndStripsTrailingDots() throws Exception {
        Method normalizeHost = DNSResolver.class.getDeclaredMethod("normalizeServerHost", String.class);
        normalizeHost.setAccessible(true);

        String normalized = (String) normalizeHost.invoke(null, "Example.COM...");
        assertEquals("example.com", normalized);
    }

    @Test
    public void configureSanitizerRejectsOversizedMaxLabelLength() {
        DNSResolver resolver = new DNSResolver(null);

        Map<String, Object> config = new HashMap<>();
        config.put("spaceReplacement", "-");
        config.put("maxLabelLength", 64);
        config.put("unicodeNormalization", "NFKD");

        Map<String, Object> whitespace = new HashMap<>();
        whitespace.put("pattern", "\\s+");
        whitespace.put("flags", "g");
        config.put("whitespace", whitespace);

        Map<String, Object> invalidChars = new HashMap<>();
        invalidChars.put("pattern", "[^a-z0-9-]");
        invalidChars.put("flags", "g");
        config.put("invalidChars", invalidChars);

        Map<String, Object> dashCollapse = new HashMap<>();
        dashCollapse.put("pattern", "-{2,}");
        dashCollapse.put("flags", "g");
        config.put("dashCollapse", dashCollapse);

        Map<String, Object> edgeDashes = new HashMap<>();
        edgeDashes.put("pattern", "^-+|-+$");
        edgeDashes.put("flags", "g");
        config.put("edgeDashes", edgeDashes);

        Map<String, Object> combiningMarks = new HashMap<>();
        combiningMarks.put("pattern", "\\p{M}+");
        combiningMarks.put("flags", "gu");
        config.put("combiningMarks", combiningMarks);

        try {
            resolver.configureSanitizer(config);
            fail("Expected SanitizerConfigException for oversized maxLabelLength");
        } catch (DNSResolver.SanitizerConfig.SanitizerConfigException error) {
            assertEquals("SANITIZER_CONFIG_RANGE", error.getCode());
        }
    }

    @Test
    public void configureSanitizerAppliesUnicodeCharacterClassFlag() throws Exception {
        DNSResolver resolver = new DNSResolver(null);

        Map<String, Object> config = new HashMap<>();
        config.put("spaceReplacement", "-");
        config.put("maxLabelLength", 63);
        config.put("unicodeNormalization", "NFKD");

        Map<String, Object> whitespace = new HashMap<>();
        whitespace.put("pattern", "\\s+");
        whitespace.put("flags", "g");
        config.put("whitespace", whitespace);

        Map<String, Object> invalidChars = new HashMap<>();
        invalidChars.put("pattern", "[^a-z0-9-]");
        invalidChars.put("flags", "g");
        config.put("invalidChars", invalidChars);

        Map<String, Object> dashCollapse = new HashMap<>();
        dashCollapse.put("pattern", "-{2,}");
        dashCollapse.put("flags", "g");
        config.put("dashCollapse", dashCollapse);

        Map<String, Object> edgeDashes = new HashMap<>();
        edgeDashes.put("pattern", "^-+|-+$");
        edgeDashes.put("flags", "g");
        config.put("edgeDashes", edgeDashes);

        Map<String, Object> combiningMarks = new HashMap<>();
        combiningMarks.put("pattern", "\\p{M}+");
        combiningMarks.put("flags", "gu");
        config.put("combiningMarks", combiningMarks);

        resolver.configureSanitizer(config);

        Field sanitizerField = DNSResolver.class.getDeclaredField("SANITIZER");
        sanitizerField.setAccessible(true);
        @SuppressWarnings("unchecked")
        AtomicReference<DNSResolver.SanitizerConfig> sanitizer =
            (AtomicReference<DNSResolver.SanitizerConfig>) sanitizerField.get(null);

        DNSResolver.SanitizerConfig current = sanitizer.get();

        Field combiningMarksField =
            DNSResolver.SanitizerConfig.class.getDeclaredField("combiningMarksPattern");
        combiningMarksField.setAccessible(true);
        Pattern pattern = (Pattern) combiningMarksField.get(current);

        assertTrue(
            "Expected UNICODE_CHARACTER_CLASS flag to be set",
            (pattern.flags() & Pattern.UNICODE_CHARACTER_CLASS) != 0
        );
    }

    @Test
    public void parseDnsTxtResponseRejectsMismatchedTransactionId() throws Exception {
        DNSResolver resolver = new DNSResolver(null);
        Method parse = DNSResolver.class.getDeclaredMethod(
            "parseDnsTxtResponse",
            byte[].class,
            int.class,
            String.class
        );
        parse.setAccessible(true);

        byte[] response = buildMinimalDnsResponse(0x1234);

        try {
            parse.invoke(resolver, response, 0x5678, "a");
            fail("Expected DNSError for mismatched transaction ID");
        } catch (InvocationTargetException e) {
            assertTrue("Expected DNSError cause", e.getCause() instanceof DNSResolver.DNSError);
            DNSResolver.DNSError error = (DNSResolver.DNSError) e.getCause();
            assertEquals(DNSResolver.DNSError.Type.QUERY_FAILED, error.getType());
        }
    }

    @Test
    public void parseDnsTxtResponseAcceptsMatchingTransactionId() throws Exception {
        DNSResolver resolver = new DNSResolver(null);
        Method parse = DNSResolver.class.getDeclaredMethod(
            "parseDnsTxtResponse",
            byte[].class,
            int.class,
            String.class
        );
        parse.setAccessible(true);

        byte[] response = buildMinimalDnsResponse(0x1234);

        @SuppressWarnings("unchecked")
        java.util.List<String> results =
            (java.util.List<String>) parse.invoke(resolver, response, 0x1234, "a");
        assertTrue("Expected empty TXT results for minimal response", results.isEmpty());
    }

    @Test
    public void parseDnsTxtResponseRejectsMismatchedQuestionName() throws Exception {
        DNSResolver resolver = new DNSResolver(null);
        Method parse = DNSResolver.class.getDeclaredMethod(
            "parseDnsTxtResponse",
            byte[].class,
            int.class,
            String.class
        );
        parse.setAccessible(true);

        byte[] response = buildMinimalDnsResponse(0x1234);

        try {
            parse.invoke(resolver, response, 0x1234, "b");
            fail("Expected DNSError for mismatched question name");
        } catch (InvocationTargetException e) {
            assertTrue("Expected DNSError cause", e.getCause() instanceof DNSResolver.DNSError);
            DNSResolver.DNSError error = (DNSResolver.DNSError) e.getCause();
            assertEquals(DNSResolver.DNSError.Type.QUERY_FAILED, error.getType());
        }
    }
}
