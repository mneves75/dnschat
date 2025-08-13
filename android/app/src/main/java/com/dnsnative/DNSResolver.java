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
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.xbill.DNS.*;

// SYNC WITH iOS: DNS error types matching iOS DNSError enum
class DNSError extends Exception {
    public enum Type {
        RESOLVER_FAILED,
        QUERY_FAILED,
        NO_RECORDS_FOUND,
        TIMEOUT,
        CANCELLED
    }
    
    private final Type errorType;
    
    public DNSError(Type type, String message) {
        super(formatErrorMessage(type, message));
        this.errorType = type;
    }
    
    public DNSError(Type type, String message, Throwable cause) {
        super(formatErrorMessage(type, message), cause);
        this.errorType = type;
    }
    
    public Type getErrorType() {
        return errorType;
    }
    
    // SYNC WITH iOS: Match iOS error message format exactly
    private static String formatErrorMessage(Type type, String message) {
        switch (type) {
            case RESOLVER_FAILED:
                return "DNS resolver failed: " + message;
            case QUERY_FAILED:
                return "DNS query failed: " + message;
            case NO_RECORDS_FOUND:
                return "No TXT records found";
            case TIMEOUT:
                return "DNS query timed out";
            case CANCELLED:
                return "DNS query was cancelled";
            default:
                return "DNS error: " + message;
        }
    }
}

public class DNSResolver {
    private static final String TAG = "DNSResolver";
    private static final String DNS_SERVER = "ch.at";
    private static final int DNS_PORT = 53;
    private static final int QUERY_TIMEOUT_MS = 10000;
    
    private final Executor executor = Executors.newCachedThreadPool();
    private final ConnectivityManager connectivityManager;
    
    // SYNC WITH iOS: Track active queries to prevent duplicates (matches iOS @MainActor activeQueries)
    private final ConcurrentHashMap<String, CompletableFuture<List<String>>> activeQueries = new ConcurrentHashMap<>();

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
        // SYNC WITH iOS: Use sanitized message (spaces→dashes, lowercase, 200 char limit)
        final String sanitizedMessage = sanitizeMessage(message);
        
        // SYNC WITH iOS: Create query ID for deduplication (matches iOS queryId format)
        final String queryId = domain + "-" + sanitizedMessage;
        
        // SYNC WITH iOS: Check for existing query to prevent duplicates
        CompletableFuture<List<String>> existingQuery = activeQueries.get(queryId);
        if (existingQuery != null) {
            return existingQuery;
        }

        // Create new query and store it in activeQueries (matches iOS behavior)
        CompletableFuture<List<String>> newQuery = new CompletableFuture<>();
        
        // Store the query before starting (matches iOS pattern)
        activeQueries.put(queryId, newQuery);
        
        // Try raw UDP first (mirrors iOS and dig), then fallback to dnsjava legacy if needed
        queryTXTRawUDP(sanitizedMessage)
            .thenAccept(result -> {
                // Clean up and complete (matches iOS cleanup pattern)
                activeQueries.remove(queryId);
                newQuery.complete(result);
            })
            .exceptionally(err -> {
                queryTXTLegacy(domain, sanitizedMessage)
                    .thenAccept(result -> {
                        // Clean up and complete (matches iOS cleanup pattern)
                        activeQueries.remove(queryId);
                        newQuery.complete(result);
                    })
                    .exceptionally(err2 -> {
                        // Clean up on error (matches iOS cleanup pattern)
                        activeQueries.remove(queryId);
                        newQuery.completeExceptionally(err2);
                        return null;
                    });
                return null;
            });
        
        return newQuery;
    }

    @androidx.annotation.RequiresApi(api = Build.VERSION_CODES.Q)
    private CompletableFuture<List<String>> queryTXTModern(String domain, String message) {
        CompletableFuture<List<String>> future = new CompletableFuture<>();
        CancellationSignal cancellationSignal = new CancellationSignal();
        
        // Set timeout
        executor.execute(() -> {
            try {
                Thread.sleep(QUERY_TIMEOUT_MS);
                if (!future.isDone()) {
                    cancellationSignal.cancel();
                    future.completeExceptionally(new Exception("DNS query timed out"));
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        Network network = getActiveNetwork();
        if (network == null) {
            future.completeExceptionally(new Exception("No active network available"));
            return future;
        }

        try {
            DnsResolver.getInstance().query(
                network,
                message, // Use message directly as domain to query
                DnsResolver.CLASS_IN,
                16, // TYPE_TXT
                executor,
                cancellationSignal,
                new DnsResolver.Callback<List<InetAddress>>() {
                    @Override
                    public void onAnswer(List<InetAddress> answer, int rcode) {
                        if (rcode == 0) {
                            // This callback is for A/AAAA records, we need TXT records
                            // For TXT records, we need to use a different approach
                            queryTXTWithRawDNS(message, future);
                        } else {
                            future.completeExceptionally(new Exception("DNS query failed with rcode: " + rcode));
                        }
                    }

                    @Override
                    public void onError(DnsResolver.DnsException error) {
                        future.completeExceptionally(error);
                    }
                }
            );
        } catch (Exception e) {
            future.completeExceptionally(e);
        }

        return future;
    }

    private CompletableFuture<List<String>> queryTXTLegacy(String domain, String message) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Use dnsjava for older Android versions
                Lookup lookup = new Lookup(message, Type.TXT);
                
                // Configure custom resolver
                SimpleResolver resolver = new SimpleResolver(DNS_SERVER);
                resolver.setPort(DNS_PORT);
                resolver.setTimeout(QUERY_TIMEOUT_MS / 1000);
                lookup.setResolver(resolver);
                
                org.xbill.DNS.Record[] records = lookup.run();
                
                if (records == null || records.length == 0) {
                    throw new DNSError(DNSError.Type.NO_RECORDS_FOUND, "");
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
                    throw new DNSError(DNSError.Type.NO_RECORDS_FOUND, "");
                }

                return txtRecords;

            } catch (Exception e) {
                Log.e(TAG, "DNS query failed", e);
                if (e instanceof DNSError) {
                    throw new RuntimeException(e);
                }
                throw new RuntimeException(new DNSError(DNSError.Type.QUERY_FAILED, e.getMessage(), e));
            }
        }, executor);
    }

    /**
     * Send a raw UDP DNS TXT query using the entire message as a single DNS label,
     * mirroring the iOS implementation and the user's dig usage.
     */
    private CompletableFuture<List<String>> queryTXTRawUDP(String message) {
        return CompletableFuture.supplyAsync(() -> {
            DatagramSocket socket = null;
            try {
                // Build DNS query packet
                byte[] query = buildDnsQuery(message);

                // Send UDP packet
                socket = new DatagramSocket();
                socket.setSoTimeout(QUERY_TIMEOUT_MS);
                InetAddress serverAddr = InetAddress.getByName(DNS_SERVER);

                DatagramPacket packet = new DatagramPacket(query, query.length, serverAddr, DNS_PORT);
                socket.send(packet);

                // Receive response
                byte[] buffer = new byte[2048];
                DatagramPacket responsePacket = new DatagramPacket(buffer, buffer.length);
                socket.receive(responsePacket);

                int length = responsePacket.getLength();
                byte[] response = new byte[length];
                System.arraycopy(buffer, 0, response, 0, length);

                List<String> txtRecords = parseDnsTxtResponse(response);
                if (txtRecords.isEmpty()) {
                    throw new RuntimeException(new DNSError(DNSError.Type.NO_RECORDS_FOUND, ""));
                }
                return txtRecords;
            } catch (Exception e) {
                if (e.getCause() instanceof DNSError) {
                    throw new RuntimeException(e.getCause());
                }
                throw new RuntimeException(new DNSError(DNSError.Type.QUERY_FAILED, e.getMessage(), e));
            } finally {
                if (socket != null) {
                    socket.close();
                }
            }
        }, executor);
    }

    private byte[] buildDnsQuery(String message) {
        // DNS Header (12 bytes) + QNAME + QTYPE + QCLASS
        byte[] label = message.getBytes(StandardCharsets.UTF_8);
        if (label.length > 63) {
            // Basic guard to avoid invalid label length; truncate conservatively
            byte[] truncated = new byte[63];
            System.arraycopy(label, 0, truncated, 0, 63);
            label = truncated;
        }

        ByteBuffer buffer = ByteBuffer.allocate(12 + 1 + label.length + 1 + 2 + 2);

        int transactionId = (int) (Math.random() * 0xFFFF) & 0xFFFF;
        buffer.putShort((short) transactionId);      // ID
        buffer.putShort((short) 0x0100);             // Flags: standard query, recursion desired
        buffer.putShort((short) 1);                  // QDCOUNT
        buffer.putShort((short) 0);                  // ANCOUNT
        buffer.putShort((short) 0);                  // NSCOUNT
        buffer.putShort((short) 0);                  // ARCOUNT

        // QNAME: single label = message, then 0 terminator
        buffer.put((byte) (label.length & 0xFF));
        buffer.put(label);
        buffer.put((byte) 0x00);

        // QTYPE = TXT (16), QCLASS = IN (1)
        buffer.putShort((short) 16);
        buffer.putShort((short) 1);

        return buffer.array();
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

    private void queryTXTWithRawDNS(String message, CompletableFuture<List<String>> future) {
        executor.execute(() -> {
            try {
                // Create raw DNS query for TXT records
                Message query = new Message();
                Header header = query.getHeader();
                header.setFlag(Flags.RD);
                header.setOpcode(Opcode.QUERY);
                
                Name name = Name.fromString(message + ".");
                org.xbill.DNS.Record question = org.xbill.DNS.Record.newRecord(name, Type.TXT, DClass.IN);
                query.addRecord(question, Section.QUESTION);

                // Send query to custom DNS server
                SimpleResolver resolver = new SimpleResolver(DNS_SERVER);
                resolver.setPort(DNS_PORT);
                resolver.setTimeout(QUERY_TIMEOUT_MS / 1000);
                
                Message response = resolver.send(query);
                
                List<String> txtRecords = new ArrayList<>();
                org.xbill.DNS.Record[] answers = response.getSectionArray(Section.ANSWER);
                
                for (org.xbill.DNS.Record record : answers) {
                    if (record instanceof TXTRecord) {
                        TXTRecord txtRecord = (TXTRecord) record;
                        List<?> strings = txtRecord.getStrings();
                        for (Object str : strings) {
                            txtRecords.add(str.toString());
                        }
                    }
                }

                if (txtRecords.isEmpty()) {
                    future.completeExceptionally(new Exception("No TXT records found"));
                } else {
                    future.complete(txtRecords);
                }

            } catch (Exception e) {
                Log.e(TAG, "Raw DNS query failed", e);
                future.completeExceptionally(e);
            }
        });
    }

    private Network getActiveNetwork() {
        if (connectivityManager != null) {
            return connectivityManager.getActiveNetwork();
        }
        return null;
    }

    private String sanitizeMessage(String message) {
        // SYNC WITH iOS: Match iOS sanitization exactly
        // iOS: message.trimmingCharacters().prefix(200).replacingOccurrences(" ", "-").lowercased()
        String trimmed = message == null ? "" : message.trim();
        
        // Apply 200 character limit (prefix equivalent)
        if (trimmed.length() > 200) {
            trimmed = trimmed.substring(0, 200);
        }
        
        // Replace spaces with dashes (match iOS behavior)
        trimmed = trimmed.replace(" ", "-");
        
        // Convert to lowercase (match iOS behavior)
        trimmed = trimmed.toLowerCase();
        
        return trimmed;
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
}