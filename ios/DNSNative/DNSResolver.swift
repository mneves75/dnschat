import Foundation
import Network
import React

// MARK: - React Native Bridge Support

@objc(RNDNSModule)
final class RNDNSModule: NSObject {
    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc func queryTXT(
        _ domain: String,
        message: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        // Perform actual DNS TXT query to the specified domain with the message
        performDNSQuery(domain: domain, message: message, resolve: resolve, reject: reject)
    }
    
    private func performDNSQuery(
        domain: String,
        message: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        // Create DNS query for TXT records
        // We'll query the domain with the message as the query parameter
        let queryDomain = message // Use message directly as the query domain
        
        // Create a UDP socket connection to perform DNS query
        let host = NWEndpoint.Host(domain)
        let port = NWEndpoint.Port(integerLiteral: 53)
        let endpoint = NWEndpoint.hostPort(host: host, port: port)
        
        let connection = NWConnection(to: endpoint, using: .udp)
        
        connection.start(queue: .global())
        
        // Create DNS query packet
        let dnsQuery = createDNSQuery(for: queryDomain)
        
        connection.send(content: dnsQuery, completion: .contentProcessed { [weak connection] error in
            if let error = error {
                connection?.cancel()
                reject("DNS_SEND_ERROR", "Failed to send DNS query: \(error.localizedDescription)", error)
                return
            }
            
            // Receive response
            connection?.receive(minimumIncompleteLength: 1, maximumLength: 1024) { data, _, isComplete, error in
                connection?.cancel()
                
                if let error = error {
                    reject("DNS_RECEIVE_ERROR", "Failed to receive DNS response: \(error.localizedDescription)", error)
                    return
                }
                
                guard let responseData = data else {
                    reject("DNS_NO_DATA", "No data received from DNS server", nil)
                    return
                }
                
                // Parse DNS response and extract TXT records
                do {
                    let txtRecords = try self.parseDNSResponse(responseData)
                    resolve(txtRecords)
                } catch {
                    reject("DNS_PARSE_ERROR", "Failed to parse DNS response: \(error.localizedDescription)", error)
                }
            }
        })
        
        // Set timeout
        DispatchQueue.global().asyncAfter(deadline: .now() + 10.0) {
            connection.cancel()
            reject("DNS_TIMEOUT", "DNS query timed out after 10 seconds", nil)
        }
    }
    
    private func createDNSQuery(for domain: String) -> Data {
        var data = Data()
        
        // DNS Header (12 bytes)
        let transactionID: UInt16 = UInt16.random(in: 1...65535)
        data.append(contentsOf: transactionID.bigEndianBytes)
        
        // Flags: Standard query with recursion desired
        let flags: UInt16 = 0x0100
        data.append(contentsOf: flags.bigEndianBytes)
        
        // Questions: 1
        data.append(contentsOf: UInt16(1).bigEndianBytes)
        
        // Answer RRs: 0
        data.append(contentsOf: UInt16(0).bigEndianBytes)
        
        // Authority RRs: 0
        data.append(contentsOf: UInt16(0).bigEndianBytes)
        
        // Additional RRs: 0
        data.append(contentsOf: UInt16(0).bigEndianBytes)
        
        // Question section
        // Encode domain name
        let domainParts = domain.components(separatedBy: ".")
        for part in domainParts {
            data.append(UInt8(part.count))
            data.append(contentsOf: part.utf8)
        }
        data.append(0) // End of domain name
        
        // Query Type: TXT (16)
        data.append(contentsOf: UInt16(16).bigEndianBytes)
        
        // Query Class: IN (1)
        data.append(contentsOf: UInt16(1).bigEndianBytes)
        
        return data
    }
    
    private func parseDNSResponse(_ data: Data) throws -> [String] {
        guard data.count >= 12 else {
            throw DNSError.invalidResponse("Response too short")
        }
        
        // Skip header (12 bytes)
        var offset = 12
        
        // Skip question section
        // Find end of domain name
        while offset < data.count && data[offset] != 0 {
            let labelLength = Int(data[offset])
            offset += 1 + labelLength
        }
        offset += 1 // Skip null terminator
        offset += 4 // Skip type and class
        
        var txtRecords: [String] = []
        
        // Parse answer section
        let answerCount = UInt16(bigEndianBytes: Array(data[6..<8]))
        
        for _ in 0..<answerCount {
            // Skip name (compressed pointer)
            if offset + 2 > data.count { break }
            offset += 2
            
            // Check type
            if offset + 2 > data.count { break }
            let type = UInt16(bigEndianBytes: Array(data[offset..<offset+2]))
            offset += 2
            
            // Skip class
            offset += 2
            
            // Skip TTL
            offset += 4
            
            // Get data length
            if offset + 2 > data.count { break }
            let dataLength = UInt16(bigEndianBytes: Array(data[offset..<offset+2]))
            offset += 2
            
            if type == 16 { // TXT record
                if offset + Int(dataLength) <= data.count {
                    let txtData = data[offset..<offset+Int(dataLength)]
                    if let txtString = String(data: txtData, encoding: .utf8) {
                        txtRecords.append(txtString)
                    }
                }
            }
            
            offset += Int(dataLength)
        }
        
        return txtRecords
    }
}

enum DNSError: Error {
    case invalidResponse(String)
}

extension UInt16 {
    var bigEndianBytes: [UInt8] {
        return [(self >> 8) & 0xFF, self & 0xFF].map { UInt8($0) }
    }
    
    init(bigEndianBytes bytes: [UInt8]) {
        self = (UInt16(bytes[0]) << 8) | UInt16(bytes[1])
    }
}

// Add back the isAvailable method to the RNDNSModule class
extension RNDNSModule {
    @objc func isAvailable(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        let capabilities: [String: Any] = [
            "available": true,
            "platform": "ios", 
            "supportsCustomServer": true,
            "supportsAsyncQuery": true
        ]
        resolve(capabilities)
    }
}