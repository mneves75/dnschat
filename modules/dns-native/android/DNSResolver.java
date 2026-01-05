package com.dnsnative;

import android.net.ConnectivityManager;
import android.net.DnsResolver;
import android.net.Network;
import android.os.Build;
import android.os.CancellationSignal;
import android.util.Log;

import java.net.InetAddress;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.net.UnknownHostException;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.json.JSONArray;
import org.json.JSONObject;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.Objects;
import java.util.regex.Pattern;

import org.xbill.DNS.*;

public class DNSResolver {
    private static final String TAG = "DNSResolver";
    private static final String DNS_SERVER = "ch.at";
    private static final int DNS_PORT = 53;
    private static final int QUERY_TIMEOUT_MS = 10000;
    private static final int DEFAULT_MAX_LABEL_LENGTH = 63;
    private static final int MAX_QNAME_LENGTH = 255;
    private static final int MAX_NATIVE_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 200L;
    private static final AtomicReference<SanitizerConfig> SANITIZER =
        new AtomicReference<>(SanitizerConfig.defaultInstance());
    private static final AtomicBoolean DEFAULT_SANITIZER_NOTICE_EMITTED = new AtomicBoolean(false);
    
    private final ExecutorService executor = Executors.newCachedThreadPool();
    private final ConnectivityManager connectivityManager;
    
    // Query deduplication - prevents multiple identical requests (matches iOS implementation)
    private static final Map<String, CompletableFuture<List<String>>> activeQueries = new ConcurrentHashMap<>();

    public DNSResolver(ConnectivityManager connectivityManager) {
        this.connectivityManager = connectivityManager;
    }

    /**
     * Cleans up the thread pool. Should be called when the module is invalidated
     * to prevent thread leaks on app lifecycle events.
     */
    public void cleanup() {
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

        final String queryId = domain + ":" + dnsPort + "-" + queryName;

        // Check for existing query (deduplication) - matches iOS behavior
        CompletableFuture<List<String>> existingQuery = activeQueries.get(queryId);
        if (existingQuery != null) {
            Log.d(TAG, "DNS: Reusing existing query for: " + queryId);
            return existingQuery;
        }
        
        Log.d(TAG, "DNS: Creating new query for: " + queryId);
        
        // Create new query with automatic cleanup
        CompletableFuture<List<String>> result = new CompletableFuture<>();
        activeQueries.put(queryId, result);
        Log.d(TAG, "DNS: Active queries count: " + activeQueries.size());
        
        // Android internal fallback strategy:
        // Raw UDP -> DNS-over-HTTPS (unless ch.at) -> legacy (dnsjava)
        queryTXTRawUDP(queryName, domain, dnsPort)
            .thenAccept(txtRecords -> {
                activeQueries.remove(queryId);
                Log.d(TAG, "DNS: Query completed, active queries: " + activeQueries.size());
                result.complete(txtRecords);
            })
            .exceptionally(err -> {
                // Gate DoH: disable for ch.at, otherwise try DoH then legacy
                if (domain != null && !domain.equalsIgnoreCase("ch.at")) {
                    Log.d(TAG, "DNS: Trying DNS-over-HTTPS (fallback 1)");
                    queryTXTDNSOverHTTPS(queryName)
                        .thenAccept(txtRecords -> {
                            activeQueries.remove(queryId);
                            Log.d(TAG, "DNS: Query completed (HTTPS), active queries: " + activeQueries.size());
                            result.complete(txtRecords);
                        })
                        .exceptionally(err2 -> {
                            Log.d(TAG, "DNS: Trying legacy DNS (fallback 2)");
                            queryTXTLegacy(domain, queryName, dnsPort)
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
                    queryTXTLegacy(domain, queryName, dnsPort)
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
        return result;
    }


    private CompletableFuture<List<String>> queryTXTLegacy(String domain, String queryName, int port) {
        return CompletableFuture.supplyAsync(() -> {
            DNSError lastError = null;
            for (int attempt = 0; attempt < MAX_NATIVE_ATTEMPTS; attempt++) {
                try {
                    Lookup lookup = new Lookup(queryName, Type.TXT);

                    SimpleResolver resolver = new SimpleResolver(domain);
                    resolver.setPort(port);
                    resolver.setTimeout(QUERY_TIMEOUT_MS / 1000);
                    lookup.setResolver(resolver);

                    Record[] records = lookup.run();

                    if (records == null || records.length == 0) {
                        throw new DNSError(DNSError.Type.NO_RECORDS_FOUND, "No TXT records found in legacy query");
                    }

                    List<String> txtRecords = new ArrayList<>();
                    for (Record record : records) {
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
                    byte[] query = buildDnsQuery(queryName);

                    socket = new DatagramSocket();
                    socket.setSoTimeout(QUERY_TIMEOUT_MS);
                    InetAddress serverAddr = InetAddress.getByName(server);

                    DatagramPacket packet = new DatagramPacket(query, query.length, serverAddr, port);
                    socket.send(packet);

                    byte[] buffer = new byte[2048];
                    DatagramPacket responsePacket = new DatagramPacket(buffer, buffer.length);
                    socket.receive(responsePacket);

                    int length = responsePacket.getLength();
                    byte[] response = new byte[length];
                    System.arraycopy(buffer, 0, response, 0, length);

                    List<String> txtRecords = parseDnsTxtResponse(response);
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

    private byte[] buildDnsQuery(String queryName) throws DNSError {
        byte[] qname = encodeDomainName(queryName);

        // DNS Header (12 bytes) + QNAME + QTYPE + QCLASS
        ByteBuffer buffer = ByteBuffer.allocate(12 + qname.length + 2 + 2);

        int transactionId = (int) (Math.random() * 0xFFFF) & 0xFFFF;
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

        return buffer.array();
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

    private List<String> parseDnsTxtResponse(byte[] data) throws Exception {
        List<String> results = new ArrayList<>();
        if (data == null || data.length < 12) {
            return results;
        }

        // Header
        int anCount = ((data[6] & 0xFF) << 8) | (data[7] & 0xFF);

        int offset = 12;
        // Skip QNAME
        while (offset < data.length) {
            int len = data[offset] & 0xFF;
            offset += 1;
            if (len == 0) break;
            offset += len;
        }
        // Skip QTYPE + QCLASS
        offset += 4;

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

    /**
     * DNS-over-HTTPS query using Cloudflare API (matches iOS implementation)
     */
    private CompletableFuture<List<String>> queryTXTDNSOverHTTPS(String message) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Log.d(TAG, "DNS-over-HTTPS: Querying Cloudflare for: " + message);
                
                // Use Cloudflare DNS-over-HTTPS API (matches iOS implementation)
                String baseURL = "https://cloudflare-dns.com/dns-query";
                String encodedMessage = URLEncoder.encode(message, "UTF-8");
                String urlString = baseURL + "?name=" + encodedMessage + "&type=TXT";
                
                URL url = new URL(urlString);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setRequestProperty("Accept", "application/dns-json");
                connection.setConnectTimeout(QUERY_TIMEOUT_MS);
                connection.setReadTimeout(QUERY_TIMEOUT_MS);
                
                int responseCode = connection.getResponseCode();
                if (responseCode != 200) {
                    throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS-over-HTTPS request failed with code: " + responseCode);
                }
                
                // Read response
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                connection.disconnect();
                
                // Parse Cloudflare DNS JSON response (matches iOS parsing logic)
                return parseDNSOverHTTPSResponse(response.toString());
                
            } catch (DNSError e) {
                throw e; // Re-throw structured errors
            } catch (Exception e) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS-over-HTTPS query failed: " + e.getMessage(), e);
            }
        }, executor);
    }

    private List<String> parseDNSOverHTTPSResponse(String jsonResponse) throws DNSError {
        try {
            JSONObject json = new JSONObject(jsonResponse);
            
            if (!json.has("Answer")) {
                throw new DNSError(DNSError.Type.NO_RECORDS_FOUND, "No Answer section in DNS-over-HTTPS response");
            }
            
            JSONArray answers = json.getJSONArray("Answer");
            List<String> txtRecords = new ArrayList<>();
            
            for (int i = 0; i < answers.length(); i++) {
                JSONObject answer = answers.getJSONObject(i);
                if (answer.has("type") && answer.getInt("type") == 16 && answer.has("data")) {
                    String data = answer.getString("data");
                    // Remove quotes from TXT record data (matches iOS behavior)
                    String cleanData = data.replaceAll("^\"|\"$", "");
                    txtRecords.add(cleanData);
                }
            }
            
            if (txtRecords.isEmpty()) {
                throw new DNSError(DNSError.Type.NO_RECORDS_FOUND, "No TXT records found in DNS-over-HTTPS response");
            }
            
            Log.d(TAG, "[pkg] DNS-over-HTTPS: Found " + txtRecords.size() + " TXT records");
            return txtRecords;
            
        } catch (Exception e) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "Failed to parse DNS-over-HTTPS response: " + e.getMessage(), e);
        }
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
            "[^a-z0-9-]",
            0,
            "-{2,}",
            0,
            "^-+|-+$",
            0,
            "\\p{M}+",
            Pattern.UNICODE_CASE | Pattern.UNICODE_CHARACTER_CLASS,
            "-",
            DEFAULT_MAX_LABEL_LENGTH,
            Normalizer.Form.NFKD,
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
                if (maxLabelLength <= 0 || maxLabelLength > MAX_QNAME_LENGTH) {
                    throw SanitizerConfigException.of(
                        CODE_INVALID_RANGE,
                        "maxLabelLength must be between 1 and " + MAX_QNAME_LENGTH
                    );
                }

                Normalizer.Form normalizationForm = parseNormalizationForm(readString(map, "unicodeNormalization"));

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
                normalizationForm
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
    public static class DNSError extends Exception {
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
