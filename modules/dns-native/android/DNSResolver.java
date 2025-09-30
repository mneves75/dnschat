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
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import org.xbill.DNS.*;

public class DNSResolver {
    private static final String TAG = "DNSResolver";
    private static final String DNS_SERVER = "ch.at";
    private static final int DNS_PORT = 53;
    private static final int QUERY_TIMEOUT_MS = 10000;
    private static final int MAX_LABEL_LENGTH = 63;
    private static final int MAX_QNAME_LENGTH = 255;
    private static final int MAX_NATIVE_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 200L;
    
    private final Executor executor = Executors.newCachedThreadPool();
    private final ConnectivityManager connectivityManager;
    
    // Query deduplication - prevents multiple identical requests (matches iOS implementation)
    private static final Map<String, CompletableFuture<List<String>>> activeQueries = new ConcurrentHashMap<>();

    public DNSResolver(ConnectivityManager connectivityManager) {
        this.connectivityManager = connectivityManager;
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

    public CompletableFuture<List<String>> queryTXT(String domain, String message) {
        // Normalize the fully-qualified query name provided by the JS bridge
        final String queryName;
        try {
            queryName = normalizeQueryName(message);
        } catch (DNSError error) {
            CompletableFuture<List<String>> failed = new CompletableFuture<>();
            failed.completeExceptionally(error);
            return failed;
        }

        final String queryId = domain + "-" + queryName;

        // Check for existing query (deduplication) - matches iOS behavior
        CompletableFuture<List<String>> existingQuery = activeQueries.get(queryId);
        if (existingQuery != null) {
            Log.d(TAG, "🔄 DNS: Reusing existing query for: " + queryId);
            return existingQuery;
        }
        
        Log.d(TAG, "🆕 DNS: Creating new query for: " + queryId);
        
        // Create new query with automatic cleanup
        CompletableFuture<List<String>> result = new CompletableFuture<>();
        activeQueries.put(queryId, result);
        Log.d(TAG, "📊 DNS: Active queries count: " + activeQueries.size());
        
        // 3-tier fallback strategy (matches iOS): Raw UDP → DNS-over-HTTPS → Legacy
        queryTXTRawUDP(queryName, domain)
            .thenAccept(txtRecords -> {
                activeQueries.remove(queryId);
                Log.d(TAG, "🧹 DNS: Query completed, active queries: " + activeQueries.size());
                result.complete(txtRecords);
            })
            .exceptionally(err -> {
                // Gate DoH: disable for ch.at, otherwise try DoH then legacy
                if (domain != null && !domain.equalsIgnoreCase("ch.at")) {
                    Log.d(TAG, "🥈 DNS: Trying DNS-over-HTTPS (fallback 1)");
                    queryTXTDNSOverHTTPS(queryName)
                        .thenAccept(txtRecords -> {
                            activeQueries.remove(queryId);
                            Log.d(TAG, "🧹 DNS: Query completed (HTTPS), active queries: " + activeQueries.size());
                            result.complete(txtRecords);
                        })
                        .exceptionally(err2 -> {
                            Log.d(TAG, "🥉 DNS: Trying legacy DNS (fallback 2)");
                            queryTXTLegacy(domain, queryName)
                                .thenAccept(txtRecords -> {
                                    activeQueries.remove(queryId);
                                    Log.d(TAG, "🧹 DNS: Query completed (legacy), active queries: " + activeQueries.size());
                                    result.complete(txtRecords);
                                })
                                .exceptionally(err3 -> {
                                    activeQueries.remove(queryId);
                                    Log.d(TAG, "❌ DNS: All fallback methods failed, active queries: " + activeQueries.size());
                                    result.completeExceptionally(err3);
                                    return null;
                                });
                            return null;
                        });
                } else {
                    Log.d(TAG, "🥈 DNS: Skipping DoH for ch.at, trying legacy DNS");
                    queryTXTLegacy(domain, queryName)
                        .thenAccept(txtRecords -> {
                            activeQueries.remove(queryId);
                            Log.d(TAG, "🧹 DNS: Query completed (legacy), active queries: " + activeQueries.size());
                            result.complete(txtRecords);
                        })
                        .exceptionally(err3 -> {
                            activeQueries.remove(queryId);
                            Log.d(TAG, "❌ DNS: All fallback methods failed, active queries: " + activeQueries.size());
                            result.completeExceptionally(err3);
                            return null;
                        });
                }
                return null;
            });
        return result;
    }


    private CompletableFuture<List<String>> queryTXTLegacy(String domain, String queryName) {
        return CompletableFuture.supplyAsync(() -> {
            DNSError lastError = null;
            for (int attempt = 0; attempt < MAX_NATIVE_ATTEMPTS; attempt++) {
                try {
                    Lookup lookup = new Lookup(queryName, Type.TXT);

                    SimpleResolver resolver = new SimpleResolver(domain);
                    resolver.setPort(DNS_PORT);
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
    private CompletableFuture<List<String>> queryTXTRawUDP(String queryName, String server) {
        return CompletableFuture.supplyAsync(() -> {
            DNSError lastError = null;
            for (int attempt = 0; attempt < MAX_NATIVE_ATTEMPTS; attempt++) {
                DatagramSocket socket = null;
                try {
                    byte[] query = buildDnsQuery(queryName);

                    socket = new DatagramSocket();
                    socket.setSoTimeout(QUERY_TIMEOUT_MS);
                    InetAddress serverAddr = InetAddress.getByName(server);

                    DatagramPacket packet = new DatagramPacket(query, query.length, serverAddr, DNS_PORT);
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
        String[] rawLabels = fqdn.split("\\.");
        if (rawLabels.length == 0) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "Query name is invalid");
        }

        List<byte[]> labelBytes = new ArrayList<>();
        int totalLength = 1; // null terminator

        for (String rawLabel : rawLabels) {
            String label = rawLabel.trim();
            if (label.isEmpty()) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "Query name contains empty label");
            }

            String normalizedLabel = label.toLowerCase(Locale.US);
            if (!isLabelSafe(normalizedLabel)) {
                throw new DNSError(
                    DNSError.Type.QUERY_FAILED,
                    "Invalid characters in DNS label: " + label
                );
            }

            byte[] bytes = normalizedLabel.getBytes(StandardCharsets.US_ASCII);
            if (bytes.length > MAX_LABEL_LENGTH) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS label exceeds 63 bytes: " + label);
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

        String normalizedInput = trimmed.toLowerCase(Locale.US);

        // Validate structure and labels (same rules as encodeDomainName)
        String[] labels = normalizedInput.split("\\.");
        if (labels.length == 0) {
            throw new DNSError(DNSError.Type.QUERY_FAILED, "Query name is invalid");
        }

        int totalLength = 1; // null terminator
        StringBuilder normalized = new StringBuilder();
        for (int i = 0; i < labels.length; i++) {
            String label = labels[i].trim();
            if (label.isEmpty()) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "Query name contains empty label");
            }

            if (!isLabelSafe(label)) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "Invalid characters in DNS label: " + label);
            }

            if (label.length() > MAX_LABEL_LENGTH) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS label exceeds 63 bytes: " + label);
            }

            if (normalized.length() > 0) {
                normalized.append('.');
            }
            normalized.append(label);

            totalLength += 1 + label.length();
            if (totalLength > MAX_QNAME_LENGTH) {
                throw new DNSError(DNSError.Type.QUERY_FAILED, "DNS query name exceeds 255 characters");
            }
        }

        return normalized.toString();
    }

    private boolean isLabelSafe(String label) {
        for (int i = 0; i < label.length(); i++) {
            char ch = label.charAt(i);
            if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '-') {
                continue;
            }
            return false;
        }
        return true;
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
                Log.d(TAG, "🌐 DNS-over-HTTPS: Querying Cloudflare for: " + message);
                
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
            
            Log.d(TAG, "📦 DNS-over-HTTPS: Found " + txtRecords.size() + " TXT records");
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
