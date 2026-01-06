package com.dnsnative;

// NOTE: This file is duplicated in the Expo prebuild output. Keep the copies in sync.

import android.net.ConnectivityManager;
import android.net.Network;
import android.os.Build;
import android.util.Log;

import java.net.InetAddress;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.time.Duration;
import java.security.SecureRandom;
import java.nio.ByteBuffer;
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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.Objects;
import java.util.regex.Pattern;

import org.xbill.DNS.*;

public class DNSResolver {
    private static final String TAG = "DNSResolver";
    private static final int DNS_PORT = 53;  // Default DNS port (RFC 1035)
    private static final int QUERY_TIMEOUT_MS = 10000;
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
    private static final Set<String> DEFAULT_ALLOWED_SERVERS = Collections.unmodifiableSet(
        new HashSet<>(Arrays.asList(
            "llm.pieter.com",
            "ch.at",
            "8.8.8.8",
            "8.8.4.4",
            "1.1.1.1",
            "1.0.0.1"
        ))
    );

    // Thread pool configuration for DNS queries
    // Fixed size prevents thread explosion under load
    // Size equals CPU cores for optimal I/O-bound task performance
    private static final int THREAD_POOL_SIZE = Math.max(2, Runtime.getRuntime().availableProcessors());
    private static final int QUEUE_CAPACITY = 50;

    private final ExecutorService executor = new ThreadPoolExecutor(
        THREAD_POOL_SIZE,                              // Core pool size
        THREAD_POOL_SIZE,                              // Max pool size (fixed)
        60L, TimeUnit.SECONDS,                         // Idle thread timeout
        new LinkedBlockingQueue<>(QUEUE_CAPACITY),     // Bounded queue
        new ThreadPoolExecutor.CallerRunsPolicy()      // Backpressure: run on caller thread
    );
    private final ConnectivityManager connectivityManager;
    
    // Query deduplication - prevents multiple identical requests (matches iOS implementation)
    private static final Map<String, CompletableFuture<List<String>>> activeQueries = new ConcurrentHashMap<>();

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

    public DNSResolver(ConnectivityManager connectivityManager) {
        this.connectivityManager = connectivityManager;
    }

    /**
     * Cleans up resources. Should be called when the module is invalidated
     * to prevent memory leaks on app lifecycle events.
     *
     * This method:
     * 1. Cancels all pending queries with a CANCELLED error
     * 2. Clears the static activeQueries map to prevent memory leaks
     * 3. Shuts down the executor thread pool
     *
     * CRITICAL: This MUST be called from invalidate() to prevent static map leaks.
     */
    public void cleanup() {
        int pendingQueries = activeQueries.size();
        // Phase 1: Cancel all pending queries to prevent dangling futures
        // This is critical for preventing memory leaks through the static activeQueries map
        for (Map.Entry<String, CompletableFuture<List<String>>> entry : activeQueries.entrySet()) {
            CompletableFuture<List<String>> future = entry.getValue();
            if (!future.isDone()) {
                future.completeExceptionally(
                    new DNSError(DNSError.Type.CANCELLED, "DNS resolver is shutting down")
                );
            }
        }
        activeQueries.clear();
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

    public CompletableFuture<List<String>> queryTXT(String domain, String message, int port) {
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

        final int dnsPort = port > 0 ? port : DNS_PORT;
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
        final String queryId = normalizedDomain + ":" + dnsPort + "-" + queryName;

        // Atomic query deduplication using compute() - prevents race conditions
        // If no existing query, create new one and mark it for execution
        AtomicBoolean shouldStartQuery = new AtomicBoolean(false);
        CompletableFuture<List<String>> result = activeQueries.compute(queryId, (key, existing) -> {
            if (existing != null) {
                Log.d(TAG, "DNS: Reusing existing query for: " + key);
                return existing;
            }
            Log.d(TAG, "DNS: Creating new query for: " + key);
            shouldStartQuery.set(true);
            return new CompletableFuture<List<String>>();
        });

        // Only execute if we created it (avoids duplicate execution when reused)
        if (shouldStartQuery.get()) {
            try {
                executeQueryChain(queryName, normalizedDomain, dnsPort, queryId, result);
            } catch (RuntimeException error) {
                activeQueries.remove(queryId);
                result.completeExceptionally(error);
            }
        }

        return result;
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
     * This method is called only once per unique query due to atomic deduplication.
     *
     * Fallback chain: Raw UDP -> DNS-over-HTTPS (unless ch.at) -> Legacy (dnsjava)
     */
    private void executeQueryChain(
        String queryName,
        String normalizedDomain,
        int port,
        String queryId,
        CompletableFuture<List<String>> result
    ) {
        Log.d(TAG, "DNS: Active queries count: " + activeQueries.size());

        // Android internal fallback strategy:
        // Raw UDP -> DNS-over-HTTPS (unless ch.at) -> legacy (dnsjava)
        queryTXTRawUDP(queryName, normalizedDomain, port)
            .thenAccept(txtRecords -> {
                activeQueries.remove(queryId);
                Log.d(TAG, "DNS: Query completed, active queries: " + activeQueries.size());
                result.complete(txtRecords);
            })
            .exceptionally(err -> {
                // Gate DoH: disable for ch.at, otherwise try DoH then legacy
                if (normalizedDomain != null && !normalizedDomain.equalsIgnoreCase("ch.at")) {
                    Log.d(TAG, "DNS: Trying DNS-over-HTTPS (fallback 1)");
                    queryTXTDNSOverHTTPS(queryName)
                        .thenAccept(txtRecords -> {
                            activeQueries.remove(queryId);
                            Log.d(TAG, "DNS: Query completed (HTTPS), active queries: " + activeQueries.size());
                            result.complete(txtRecords);
                        })
                        .exceptionally(err2 -> {
                            Log.d(TAG, "DNS: Trying legacy DNS (fallback 2)");
                            queryTXTLegacy(normalizedDomain, queryName, port)
                                .thenAccept(txtRecords -> {
                                    activeQueries.remove(queryId);
                                    Log.d(TAG, "DNS: Query completed (legacy), active queries: " + activeQueries.size());
                                    result.complete(txtRecords);
                                })
                                .exceptionally(err3 -> {
                                    activeQueries.remove(queryId);
                                    Log.d(TAG, "DNS: All fallback methods failed, active queries: " + activeQueries.size());
                                    result.completeExceptionally(err3);
                                    return null;
                                });
                            return null;
                        });
                } else {
                    Log.d(TAG, "DNS: Skipping DoH for ch.at, trying legacy DNS");
                    queryTXTLegacy(normalizedDomain, queryName, port)
                        .thenAccept(txtRecords -> {
                            activeQueries.remove(queryId);
                            Log.d(TAG, "DNS: Query completed (legacy), active queries: " + activeQueries.size());
                            result.complete(txtRecords);
                        })
                        .exceptionally(err3 -> {
                            activeQueries.remove(queryId);
                            Log.d(TAG, "DNS: All fallback methods failed, active queries: " + activeQueries.size());
                            result.completeExceptionally(err3);
                            return null;
                        });
                }
                return null;
            });
    }


    private CompletableFuture<List<String>> queryTXTLegacy(String domain, String queryName, int port) {
        return CompletableFuture.supplyAsync(() -> {
            DNSError lastError = null;
            for (int attempt = 0; attempt < MAX_NATIVE_ATTEMPTS; attempt++) {
                try {
                    Lookup lookup = new Lookup(queryName, Type.TXT);

                    SimpleResolver resolver = new SimpleResolver(domain);
                    resolver.setPort(port);
                    resolver.setTimeout(Duration.ofMillis(QUERY_TIMEOUT_MS));
                    lookup.setResolver(resolver);

                    org.xbill.DNS.Record[] records = lookup.run();

                    if (records == null || records.length == 0) {
                        throw new DNSError(DNSError.Type.NO_RECORDS_FOUND, "No TXT records found in legacy query");
                    }

                    List<String> txtRecords = new ArrayList<>();
                    for (org.xbill.DNS.Record record : records) {
                        if (record instanceof TXTRecord) {
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
                        try {
                            Thread.sleep((long) (RETRY_DELAY_MS * Math.pow(2, attempt)));
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw e;
                        }
                        continue;
                    }
                    Log.e(TAG, "DNS query failed", e);
                    throw e;
                } catch (Exception e) {
                    Log.e(TAG, "DNS query failed", e);
                    throw new DNSError(DNSError.Type.QUERY_FAILED, "Legacy DNS query failed: " + e.getMessage(), e);
                }
            }
            throw lastError != null
                ? lastError
                : new DNSError(DNSError.Type.NO_RECORDS_FOUND, "No TXT records found in legacy query");
        }, executor);
    }

    /**
     * Send a raw UDP DNS TXT query for the fully-qualified domain name provided by the JS bridge.
     */
    private CompletableFuture<List<String>> queryTXTRawUDP(String queryName, String server, int port) {
        return CompletableFuture.supplyAsync(() -> {
            DNSError lastError = null;
            for (int attempt = 0; attempt < MAX_NATIVE_ATTEMPTS; attempt++) {
                DatagramSocket socket = null;
                try {
                    DnsQuery query = buildDnsQuery(queryName, false);

                    socket = new DatagramSocket();
                    socket.setSoTimeout(QUERY_TIMEOUT_MS);
                    InetAddress serverAddr = InetAddress.getByName(server);

                    DatagramPacket packet = new DatagramPacket(query.payload, query.payload.length, serverAddr, port);
                    socket.send(packet);

                    byte[] buffer = new byte[2048];
                    DatagramPacket responsePacket = new DatagramPacket(buffer, buffer.length);
                    socket.receive(responsePacket);

                    if (!serverAddr.equals(responsePacket.getAddress()) || responsePacket.getPort() != port) {
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
                    return txtRecords;
                } catch (DNSError e) {
                    lastError = e;
                    if (e.getType() == DNSError.Type.NO_RECORDS_FOUND && attempt < MAX_NATIVE_ATTEMPTS - 1) {
                        try {
                            Thread.sleep((long) (RETRY_DELAY_MS * Math.pow(2, attempt)));
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw e;
                        }
                        continue;
                    }
                    throw e;
                } catch (Exception e) {
                    throw new DNSError(DNSError.Type.QUERY_FAILED, "UDP DNS query failed: " + e.getMessage(), e);
                } finally {
                    if (socket != null) {
                        socket.close();
                    }
                }
            }
            throw lastError != null
                ? lastError
                : new DNSError(DNSError.Type.NO_RECORDS_FOUND, "No TXT records found in UDP response");
        }, executor);
    }

    private DnsQuery buildDnsQuery(String queryName) throws DNSError {
        return buildDnsQuery(queryName, false);
    }

    private DnsQuery buildDnsQuery(String queryName, boolean useZeroTransactionId) throws DNSError {
        byte[] qname = encodeDomainName(queryName);

        // DNS Header (12 bytes) + QNAME + QTYPE + QCLASS
        ByteBuffer buffer = ByteBuffer.allocate(12 + qname.length + 2 + 2);

        int transactionId = useZeroTransactionId ? 0 : DNS_SECURE_RANDOM.nextInt(0x10000);
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
                    "DNS label exceeds " + config.maxLabelLength + " bytes: " + label
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
            return results;
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

        for (int i = 0; i < anCount && offset + 10 <= data.length; i++) {
            // Skip NAME (could be pointer or full name)
            if ((data[offset] & 0xC0) == 0xC0) {
                offset += 2;
            } else {
                while (offset < data.length) {
                    int len = data[offset] & 0xFF;
                    offset += 1;
                    if (len == 0) break;
                    offset += len;
                }
            }

            if (offset + 10 > data.length) break;
            int type = ((data[offset] & 0xFF) << 8) | (data[offset + 1] & 0xFF);
            offset += 2; // TYPE
            offset += 2; // CLASS
            offset += 4; // TTL
            int rdLength = ((data[offset] & 0xFF) << 8) | (data[offset + 1] & 0xFF);
            offset += 2;

            if (type == 16 && offset + rdLength <= data.length) { // TXT
                int end = offset + rdLength;
                int p = offset;
                while (p < end) {
                    int txtLen = data[p] & 0xFF;
                    p += 1;
                    if (p + txtLen <= end && txtLen > 0) {
                        String s = new String(data, p, txtLen, StandardCharsets.UTF_8);
                        results.add(s);
                        p += txtLen;
                    } else {
                        break;
                    }
                }
            }

            offset += rdLength;
        }

        return results;
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

        while (currentOffset < data.length) {
            int len = data[currentOffset] & 0xFF;
            if (len == 0) {
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

        return new NameParseResult(name.toString().toLowerCase(Locale.US), nextOffset);
    }

    /**
     * DNS-over-HTTPS query using wireformat (RFC 8484) via Cloudflare.
     */
    private CompletableFuture<List<String>> queryTXTDNSOverHTTPS(String message) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Log.d(TAG, "DNS-over-HTTPS: Querying Cloudflare for: " + message);

                DnsQuery query = buildDnsQuery(message, true);
                String baseURL = "https://cloudflare-dns.com/dns-query";
                HttpURLConnection connection = null;
                try {
                    URL url = URI.create(baseURL).toURL();
                    connection = (HttpURLConnection) url.openConnection();
                    connection.setRequestMethod("POST");
                    connection.setDoOutput(true);
                    connection.setRequestProperty("Content-Type", "application/dns-message");
                    connection.setRequestProperty("Accept", "application/dns-message");
                    connection.setConnectTimeout(QUERY_TIMEOUT_MS);
                    connection.setReadTimeout(QUERY_TIMEOUT_MS);
                    connection.setFixedLengthStreamingMode(query.payload.length);

                    try (OutputStream outputStream = connection.getOutputStream()) {
                        outputStream.write(query.payload);
                        outputStream.flush();
                    }

                    int responseCode = connection.getResponseCode();
                    if (responseCode != 200) {
                        throw new DNSError(
                            DNSError.Type.QUERY_FAILED,
                            "DNS-over-HTTPS request failed with code: " + responseCode
                        );
                    }

                    byte[] responseBytes;
                    try (InputStream inputStream = connection.getInputStream();
                        ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
                        byte[] chunk = new byte[4096];
                        int read;
                        while ((read = inputStream.read(chunk)) != -1) {
                            buffer.write(chunk, 0, read);
                        }
                        responseBytes = buffer.toByteArray();
                    }

                    return parseDnsTxtResponse(responseBytes, query.transactionId, query.queryName);
                } finally {
                    if (connection != null) {
                        connection.disconnect();
                    }
                }
            } catch (DNSError e) {
                throw e; // Re-throw structured errors
            } catch (Exception e) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS-over-HTTPS query failed: " + e.getMessage(), e);
            }
        }, executor);
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

        private static final SanitizerConfig DEFAULT = build(
            "\\s+",
            0,
            Pattern.compile("\\s+"),
            "[^a-z0-9-]",
            0,
            Pattern.compile("[^a-z0-9-]"),
            "-{2,}",
            0,
            Pattern.compile("-{2,}"),
            "^-+|-+$",
            0,
            Pattern.compile("^-+|-+$"),
            "\\p{M}+",
            Pattern.UNICODE_CASE | Pattern.UNICODE_CHARACTER_CLASS,
            Pattern.compile("\\p{M}+", Pattern.UNICODE_CASE | Pattern.UNICODE_CHARACTER_CLASS),
            "-",
            DEFAULT_MAX_LABEL_LENGTH,
            Normalizer.Form.NFKD,
            DEFAULT_ALLOWED_SERVERS,
            true
        );

        final String whitespaceSource;
        final int whitespaceFlags;
        final Pattern whitespacePattern;

        final String invalidCharsSource;
        final int invalidCharsFlags;
        final Pattern invalidCharsPattern;

        final String dashCollapseSource;
        final int dashCollapseFlags;
        final Pattern dashCollapsePattern;

        final String edgeDashesSource;
        final int edgeDashesFlags;
        final Pattern edgeDashesPattern;

        final String combiningMarksSource;
        final int combiningMarksFlags;
        final Pattern combiningMarksPattern;

        final String spaceReplacement;
        final int maxLabelLength;
        final Normalizer.Form normalizationForm;
        final Set<String> allowedServers;
        final boolean defaultConfig;

        private SanitizerConfig(
            String whitespaceSource,
            int whitespaceFlags,
            Pattern whitespacePattern,
            String invalidCharsSource,
            int invalidCharsFlags,
            Pattern invalidCharsPattern,
            String dashCollapseSource,
            int dashCollapseFlags,
            Pattern dashCollapsePattern,
            String edgeDashesSource,
            int edgeDashesFlags,
            Pattern edgeDashesPattern,
            String combiningMarksSource,
            int combiningMarksFlags,
            Pattern combiningMarksPattern,
            String spaceReplacement,
            int maxLabelLength,
            Normalizer.Form normalizationForm,
            Set<String> allowedServers,
            boolean defaultConfig
        ) {
            this.whitespaceSource = whitespaceSource;
            this.whitespaceFlags = whitespaceFlags;
            this.whitespacePattern = whitespacePattern;
            this.invalidCharsSource = invalidCharsSource;
            this.invalidCharsFlags = invalidCharsFlags;
            this.invalidCharsPattern = invalidCharsPattern;
            this.dashCollapseSource = dashCollapseSource;
            this.dashCollapseFlags = dashCollapseFlags;
            this.dashCollapsePattern = dashCollapsePattern;
            this.edgeDashesSource = edgeDashesSource;
            this.edgeDashesFlags = edgeDashesFlags;
            this.edgeDashesPattern = edgeDashesPattern;
            this.combiningMarksSource = combiningMarksSource;
            this.combiningMarksFlags = combiningMarksFlags;
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

                CompiledPattern whitespace = compilePattern(readMap(map, "whitespace"), "whitespace");
                CompiledPattern invalidChars = compilePattern(readMap(map, "invalidChars"), "invalidChars");
                CompiledPattern dashCollapse = compilePattern(readMap(map, "dashCollapse"), "dashCollapse");
                CompiledPattern edgeDashes = compilePattern(readMap(map, "edgeDashes"), "edgeDashes");
                CompiledPattern combiningMarks = compilePattern(readMap(map, "combiningMarks"), "combiningMarks");

                return build(
                    whitespace.source,
                    whitespace.flags,
                    whitespace.pattern,
                    invalidChars.source,
                    invalidChars.flags,
                    invalidChars.pattern,
                    dashCollapse.source,
                    dashCollapse.flags,
                    dashCollapse.pattern,
                    edgeDashes.source,
                    edgeDashes.flags,
                    edgeDashes.pattern,
                    combiningMarks.source,
                    combiningMarks.flags,
                    combiningMarks.pattern,
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
            String whitespaceSource,
            int whitespaceFlags,
            Pattern whitespacePattern,
            String invalidCharsSource,
            int invalidCharsFlags,
            Pattern invalidCharsPattern,
            String dashCollapseSource,
            int dashCollapseFlags,
            Pattern dashCollapsePattern,
            String edgeDashesSource,
            int edgeDashesFlags,
            Pattern edgeDashesPattern,
            String combiningMarksSource,
            int combiningMarksFlags,
            Pattern combiningMarksPattern,
            String spaceReplacement,
            int maxLabelLength,
            Normalizer.Form normalizationForm,
            Set<String> allowedServers,
            boolean defaultConfig
        ) {
            return new SanitizerConfig(
                whitespaceSource,
                whitespaceFlags,
                whitespacePattern,
                invalidCharsSource,
                invalidCharsFlags,
                invalidCharsPattern,
                dashCollapseSource,
                dashCollapseFlags,
                dashCollapsePattern,
                edgeDashesSource,
                edgeDashesFlags,
                edgeDashesPattern,
                combiningMarksSource,
                combiningMarksFlags,
                combiningMarksPattern,
                spaceReplacement,
                maxLabelLength,
                normalizationForm,
                allowedServers,
                defaultConfig
            );
        }

        private static CompiledPattern compilePattern(Map<String, Object> descriptor, String key) {
            String pattern = readString(descriptor, "pattern");
            String flagsValue = readStringOptional(descriptor, "flags");
            int flags = parseFlags(flagsValue);
            try {
                return new CompiledPattern(pattern, flags, Pattern.compile(pattern, flags));
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
            return Collections.unmodifiableSet(normalized);
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
            return whitespaceFlags == other.whitespaceFlags
                && invalidCharsFlags == other.invalidCharsFlags
                && dashCollapseFlags == other.dashCollapseFlags
                && edgeDashesFlags == other.edgeDashesFlags
                && combiningMarksFlags == other.combiningMarksFlags
                && maxLabelLength == other.maxLabelLength
                && normalizationForm == other.normalizationForm
                && Objects.equals(allowedServers, other.allowedServers)
                && whitespaceSource.equals(other.whitespaceSource)
                && invalidCharsSource.equals(other.invalidCharsSource)
                && dashCollapseSource.equals(other.dashCollapseSource)
                && edgeDashesSource.equals(other.edgeDashesSource)
                && combiningMarksSource.equals(other.combiningMarksSource)
                && spaceReplacement.equals(other.spaceReplacement);
        }

        @Override
        public int hashCode() {
            return Objects.hash(
                whitespaceSource,
                whitespaceFlags,
                invalidCharsSource,
                invalidCharsFlags,
                dashCollapseSource,
                dashCollapseFlags,
                edgeDashesSource,
                edgeDashesFlags,
                combiningMarksSource,
                combiningMarksFlags,
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

        private static final class CompiledPattern {
            final String source;
            final int flags;
            final Pattern pattern;

            CompiledPattern(String source, int flags, Pattern pattern) {
                this.source = source;
                this.flags = flags;
                this.pattern = pattern;
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
