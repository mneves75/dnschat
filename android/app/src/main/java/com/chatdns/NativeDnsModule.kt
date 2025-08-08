package com.chatdns

import android.os.Build
import android.util.Base64
import com.facebook.react.bridge.*
import kotlinx.coroutines.*
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.nio.ByteBuffer
import android.util.Log
import kotlin.random.Random

class NativeDnsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "RNDNSModule"
    private val scope = CoroutineScope(Dispatchers.IO)

    @ReactMethod
    fun isAvailable(promise: Promise) {
        try {
            val capabilities = WritableNativeMap().apply {
                putBoolean("available", true)
                putString("platform", "android")
                putBoolean("supportsCustomServer", true)
                putBoolean("supportsAsyncQuery", true)
                putInt("apiLevel", Build.VERSION.SDK_INT)
            }
            promise.resolve(capabilities)
        } catch (e: Exception) {
            promise.reject("E_AVAILABILITY_CHECK_FAILED", "Failed to check DNS availability: ${e.message}", e)
        }
    }

    @ReactMethod
    fun queryTXT(domain: String, message: String, promise: Promise) {
        Log.d("NativeDNS", "🔌 Starting DNS query for message: '$message' to server: $domain")
        scope.launch {
            var socket: DatagramSocket? = null
            try {
                withTimeout(10000) { // 10-second timeout
                    Log.d("NativeDNS", "📦 Creating DNS query packet...")
                    // Create DNS query packet for TXT record
                    val queryPacket = createDNSQuery(message, domain)
                    val serverAddress = InetAddress.getByName(domain)
                    Log.d("NativeDNS", "📡 Resolved server address: ${serverAddress.hostAddress}")

                    socket = DatagramSocket()
                    Log.d("NativeDNS", "🔄 Socket created, sending query packet (${queryPacket.size} bytes)...")
                    
                    val sendPacket = DatagramPacket(queryPacket, queryPacket.size, serverAddress, 53)
                    socket?.send(sendPacket)
                    Log.d("NativeDNS", "📤 DNS query sent successfully, waiting for response...")

                    val responseBuffer = ByteArray(1024)
                    val receivePacket = DatagramPacket(responseBuffer, responseBuffer.size)
                    socket?.receive(receivePacket)
                    Log.d("NativeDNS", "📥 Received DNS response: ${receivePacket.length} bytes from ${receivePacket.address}")

                    val responseData = receivePacket.data.copyOf(receivePacket.length)
                    val txtRecords = parseDNSResponse(responseData)
                    Log.d("NativeDNS", "✅ Parsed ${txtRecords.size} TXT records")
                    
                    val resultArray = WritableNativeArray()
                    txtRecords.forEach { record ->
                        Log.d("NativeDNS", "📄 TXT Record: $record")
                        resultArray.pushString(record)
                    }
                    
                    Log.d("NativeDNS", "🎉 DNS query successful")
                    promise.resolve(resultArray)
                }
            } catch (e: TimeoutCancellationException) {
                Log.e("NativeDNS", "⏱️ DNS query timeout after 10 seconds", e)
                promise.reject("E_TIMEOUT", "DNS query timed out after 10 seconds", e)
            } catch (e: Exception) {
                Log.e("NativeDNS", "❌ DNS query failed: ${e.message}", e)
                promise.reject("E_QUERY_FAILED", "DNS query failed: ${e.message}", e)
            } finally {
                socket?.close()
            }
        }
    }

    @ReactMethod
    fun query(queryBase64: String, server: String, port: Int, promise: Promise) {
        Log.d("NativeDNS", "🔌 Starting base64 DNS query to $server:$port")
        scope.launch {
            var socket: DatagramSocket? = null
            try {
                withTimeout(10000) { // 10-second timeout
                    val queryBytes = Base64.decode(queryBase64, Base64.NO_WRAP)
                    val serverAddress = InetAddress.getByName(server)
                    Log.d("NativeDNS", "📡 Resolved server: ${serverAddress.hostAddress}")

                    socket = DatagramSocket() // Uses a system-assigned ephemeral port
                    Log.d("NativeDNS", "🔄 Sending query (${queryBytes.size} bytes)...")
                    
                    val sendPacket = DatagramPacket(queryBytes, queryBytes.size, serverAddress, port)
                    socket?.send(sendPacket)
                    Log.d("NativeDNS", "📤 Query sent, waiting for response...")

                    val responseBuffer = ByteArray(1024)
                    val receivePacket = DatagramPacket(responseBuffer, responseBuffer.size)
                    socket?.receive(receivePacket)
                    Log.d("NativeDNS", "📥 Received response: ${receivePacket.length} bytes")

                    val responseData = receivePacket.data.copyOf(receivePacket.length)
                    val responseBase64 = Base64.encodeToString(responseData, Base64.NO_WRAP)
                    
                    Log.d("NativeDNS", "🎉 Query successful")
                    promise.resolve(responseBase64)
                }
            } catch (e: TimeoutCancellationException) {
                Log.e("NativeDNS", "⏱️ DNS query timeout after 10 seconds", e)
                promise.reject("E_TIMEOUT", "DNS query timed out after 10 seconds", e)
            } catch (e: Exception) {
                Log.e("NativeDNS", "❌ DNS query failed: ${e.message}", e)
                promise.reject("E_QUERY_FAILED", "DNS query failed: ${e.message}", e)
            } finally {
                socket?.close()
            }
        }
    }

    private fun createDNSQuery(message: String, server: String): ByteArray {
        // DNS Header (12 bytes)
        val transactionId = Random.nextInt(1, 65536).toShort()
        Log.d("NativeDNS", "📊 Creating DNS query with transaction ID: $transactionId")
        
        val header = ByteBuffer.allocate(12).apply {
            putShort(transactionId) // Random Transaction ID
            putShort(0x0100.toShort()) // Flags: Standard query, recursion desired
            putShort(1.toShort())      // QDCOUNT: 1 question
            putShort(0.toShort())      // ANCOUNT: 0 answers
            putShort(0.toShort())      // NSCOUNT: 0 authority records
            putShort(0.toShort())      // ARCOUNT: 0 additional records
        }.array()

        // DNS Question Section
        val question = createDNSQuestion(message)
        
        return header + question
    }
    
    private fun createDNSQuestion(message: String): ByteArray {
        val buffer = mutableListOf<Byte>()

        // Use the original message unchanged (trim only) to mirror `dig` semantics
        val queryString = message.trim()
        Log.d("NativeDNS", "📝 Encoding DNS question for: '$queryString'")

        // Encode as a single DNS label when possible (UTF-8), respecting 63-byte label limit
        val labelBytes = queryString.toByteArray(Charsets.UTF_8)
        Log.d("NativeDNS", "📏 Message byte length: ${labelBytes.size}")

        if (labelBytes.size <= 63) {
            buffer.add(labelBytes.size.toByte())
            buffer.addAll(labelBytes.toList())
            Log.d("NativeDNS", "✅ Encoded as single DNS label")
        } else {
            // For longer messages, truncate to 63 bytes (matching iOS behavior)
            Log.w("NativeDNS", "⚠️ Message too long for single DNS label: ${labelBytes.size} bytes, truncating to 63")
            val truncated = labelBytes.take(63)
            buffer.add(truncated.size.toByte())
            buffer.addAll(truncated.toList())
        }

        // End of domain name
        buffer.add(0)

        // QTYPE: TXT (16)
        buffer.add(0)
        buffer.add(16)

        // QCLASS: IN (1)
        buffer.add(0)
        buffer.add(1)

        val result = buffer.toByteArray()
        Log.d("NativeDNS", "📊 DNS Question packet size: ${result.size} bytes")
        return result
    }
    
    private fun parseDNSResponse(responseData: ByteArray): List<String> {
        val txtRecords = mutableListOf<String>()
        
        try {
            val buffer = ByteBuffer.wrap(responseData)
            
            // Skip DNS header (12 bytes)
            buffer.position(12)
            
            // Skip question section
            skipDNSName(buffer)
            buffer.position(buffer.position() + 4) // QTYPE + QCLASS
            
            // Parse answer section
            val header = ByteBuffer.wrap(responseData)
            val anCount = header.getShort(6).toInt() and 0xFFFF
            
            for (i in 0 until anCount) {
                // Skip name (could be compressed)
                skipDNSName(buffer)
                
                val type = buffer.getShort().toInt() and 0xFFFF
                buffer.getShort() // CLASS
                buffer.getInt()   // TTL
                val rdLength = buffer.getShort().toInt() and 0xFFFF
                
                if (type == 16) { // TXT record
                    val txtData = ByteArray(rdLength)
                    buffer.get(txtData)
                    
                    // Parse TXT record data (length-prefixed strings)
                    var offset = 0
                    val txtStrings = mutableListOf<String>()
                    
                    while (offset < txtData.size) {
                        val length = txtData[offset].toInt() and 0xFF
                        offset++

                        if (length > 0 && offset + length <= txtData.size) {
                            val txtString = String(txtData, offset, length, Charsets.UTF_8)
                            txtStrings.add(txtString)
                            offset += length
                        } else {
                            break
                        }
                    }
                    
                    txtRecords.addAll(txtStrings)
                } else {
                    // Skip non-TXT records
                    buffer.position(buffer.position() + rdLength)
                }
            }
        } catch (e: Exception) {
            // If parsing fails, return empty list
            return emptyList()
        }
        
        return txtRecords
    }
    
    private fun skipDNSName(buffer: ByteBuffer) {
        while (buffer.hasRemaining()) {
            val length = buffer.get().toInt() and 0xFF
            
            if (length == 0) {
                break // End of name
            } else if ((length and 0xC0) == 0xC0) {
                // Compressed name, skip next byte
                buffer.get()
                break
            } else {
                // Regular label, skip length bytes
                buffer.position(buffer.position() + length)
            }
        }
    }
}