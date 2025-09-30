# Security Documentation

DNSChat implements production-grade security measures to protect user data and prevent common vulnerabilities. This document describes the security architecture, threat model, and best practices.

## Table of Contents

- [Security Overview](#security-overview)
- [Threat Model](#threat-model)
- [Encryption Architecture](#encryption-architecture)
- [DNS Security](#dns-security)
- [Known Security Issues](#known-security-issues)
- [Security Best Practices](#security-best-practices)
- [Incident Response](#incident-response)
- [Security Testing](#security-testing)

## Security Overview

DNSChat provides multiple layers of security:

1. **End-to-End Encryption**: All conversation data encrypted with AES-256-GCM
2. **Secure Key Storage**: iOS Keychain and Android Keystore for encryption keys
3. **DNS Injection Protection**: Input validation and server whitelisting
4. **Thread Safety**: Race condition prevention in native modules
5. **Resource Management**: Proper cleanup to prevent leaks and DoS
6. **Fail-Fast Cryptography**: App refuses to start without working crypto

### Security Version History

- **v2.1.0** (Current): Production-grade encryption with real Keychain/Keystore
- **v2.0.1**: DNS injection protection, thread safety fixes, resource management
- **v1.x**: Basic AsyncStorage (unencrypted) - **DEPRECATED**

## Threat Model

### Assets to Protect

1. **User Conversations**: Chat messages and conversation history
2. **Encryption Keys**: Master password and conversation-specific keys
3. **DNS Queries**: Message content transmitted via DNS
4. **App Configuration**: DNS server settings and preferences

### Threat Actors

1. **Network Attackers**: Intercept DNS queries, perform man-in-the-middle attacks
2. **Malicious DNS Servers**: Return crafted responses to exploit parsing vulnerabilities
3. **Physical Device Access**: Extract data from stolen or compromised devices
4. **Malicious Apps**: Access shared storage or memory on the device

### Attack Vectors

#### High Priority

- **DNS Response Injection**: Malformed TXT records causing buffer overflows
- **DNS Query Manipulation**: Control characters in queries to exploit resolvers
- **Key Extraction**: Attempt to read encryption keys from device storage
- **Conversation Decryption**: Access encrypted data without proper keys

#### Medium Priority

- **Network Eavesdropping**: Intercept plaintext DNS queries over UDP/TCP
- **Rate Limiting Bypass**: Flood DNS servers with excessive queries
- **Resource Exhaustion**: Trigger memory leaks or thread pool exhaustion
- **Race Conditions**: Exploit concurrent access to shared resources

#### Lower Priority

- **UI Spoofing**: Display misleading content in the app interface
- **Configuration Tampering**: Modify DNS server preferences
- **Log Exposure**: Access detailed debugging logs

## Encryption Architecture

### Overview

DNSChat uses **AES-256-GCM** for conversation encryption with per-conversation encryption keys derived from a master password using PBKDF2.

### Key Management

#### Master Password Generation

- **Location**: `src/utils/encryption.ts:291-301`
- **Algorithm**: Cryptographically secure random string generation
- **Length**: 32 characters
- **Storage**: iOS Keychain / Android Keystore (via `react-native-keychain`)
- **Access Control**: `WHEN_UNLOCKED_THIS_DEVICE_ONLY` + `DEVICE_PASSCODE`

```typescript
// iOS Keychain configuration
{
  service: 'com.dnschat.secure.master_password',
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE
}
```

#### Conversation Key Derivation

- **Location**: `src/utils/encryption.ts:268-286`
- **Algorithm**: PBKDF2-SHA256
- **Iterations**: 100,000
- **Salt**: 32 bytes (cryptographically random per conversation)
- **Output**: 256-bit AES key

```typescript
// Key derivation process
master_password → PBKDF2(password, salt, 100000, SHA-256) → AES-256 key
```

### Encryption Process

#### Encryption (`src/utils/encryption.ts:320-354`)

1. Import conversation key from secure storage
2. Generate random 96-bit IV (nonce)
3. Encrypt data using AES-256-GCM
4. Prepend IV to ciphertext
5. Base64 encode the result

**Format**: `base64(IV || ciphertext || auth_tag)`

#### Decryption (`src/utils/encryption.ts:359-393`)

1. Base64 decode the encrypted data
2. Extract IV (first 12 bytes)
3. Extract ciphertext (remaining bytes)
4. Import conversation key from secure storage
5. Decrypt using AES-256-GCM with IV
6. Verify authentication tag (GCM provides authentication)

### Backup Encryption

**SECURITY FIX (v2.1.0)**: Backups are now encrypted, not plaintext.

- **Location**: `src/services/storageService.ts:49-66`
- **Key ID**: `__backup_master__`
- **Purpose**: Recovery when conversation keys are lost
- **Format**: Same as conversation encryption (AES-256-GCM)

```typescript
// Backup encryption workflow
plaintext_snapshot → AES-256-GCM(backup_key) → AsyncStorage
```

### Migration from Legacy Storage

Both iOS and Android support automatic migration from AsyncStorage to secure storage:

- **iOS**: `src/utils/encryption.ts:109-135`
- **Android**: `src/utils/encryption.ts:186-213`
- **Test Coverage**: `__tests__/storageService.migration.spec.ts`

Migration process:
1. Check if key exists in Keychain/Keystore
2. If not, look for legacy key in AsyncStorage
3. Move key to secure storage
4. Delete from AsyncStorage
5. Log migration success

### Fail-Fast Cryptography

**Location**: `src/utils/encryption.ts:18-50`

The app validates Web Crypto API availability at module load time:

```typescript
// CRITICAL: Fail-fast if crypto is unavailable
if (!global.crypto || !global.crypto.subtle) {
  throw new Error('FATAL SECURITY ERROR: Web Crypto API not available');
}
```

If cryptography fails to initialize, the app **MUST NOT START**. This prevents running with broken or missing encryption.

**Test Coverage**: `__tests__/encryptionService.crypto.spec.ts:12-20`

## DNS Security

### Input Validation

All DNS queries undergo strict sanitization to prevent injection attacks.

#### Message Sanitization (`modules/dns-native/constants.ts`)

**Requirements**:
- Maximum length: 63 characters (DNS label limit)
- Character set: `a-z`, `0-9`, `-` (dash)
- Transformation: Lowercase + replace spaces with dashes
- Validation: Must match `/^[a-z0-9-]+$/`

**Implementation**:
```typescript
// Sanitize user input before DNS query
const sanitized = message
  .toLowerCase()
  .trim()
  .slice(0, 63)
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');
```

#### Server Whitelisting

**Location**: `src/services/dnsService.ts`

Only approved DNS servers are allowed:
- `ch.at` (primary LLM service)
- `8.8.8.8` / `8.8.4.4` (Google DNS)
- `1.1.1.1` / `1.0.0.1` (Cloudflare DNS)

Any other server triggers a security warning and rejection.

### DNS Response Parsing

**Location**: `ios/DNSNative/DNSResolver.swift` and `modules/dns-native/android/`

#### Protection Against Malformed Responses

1. **Bounds Checking**: All array accesses validated
2. **Length Validation**: Response size limits enforced
3. **Format Validation**: TXT record structure verified
4. **Error Handling**: Graceful degradation on parse failure

```swift
// iOS bounds checking example
guard index < records.count else {
  throw DNSError.malformedResponse
}
```

### DNS Query Security

#### Method Priority

1. **Native DNS**: Uses platform-specific APIs with OS-level protections
2. **UDP/TCP**: Direct socket queries with timeout enforcement
3. **DNS-over-HTTPS**: Encrypted transport (Cloudflare only)
4. **Mock**: Development mode only (never in production)

#### Rate Limiting

- **Location**: `src/services/dnsLogService.ts`
- **Limit**: Configurable queries per minute
- **Purpose**: Prevent DoS attacks against DNS servers
- **Test Coverage**: `__tests__/dnsService.rateLimit.spec.ts`

### Network Security

#### Transport Encryption

- **UDP/TCP**: Plaintext (DNS protocol limitation)
- **DNS-over-HTTPS**: TLS 1.3 (Cloudflare endpoints)
- **Recommendation**: Use DoH when privacy is critical

#### Man-in-the-Middle Protection

DNS queries over UDP/TCP are **NOT encrypted** by default. Attackers with network access can:
- Read message content
- Modify responses
- Inject false data

**Mitigation**: Use DNS-over-HTTPS transport for sensitive queries.

**Limitation**: DoH cannot reach ch.at's custom TXT responses (resolver architecture). Native/UDP/TCP are preferred for ch.at queries.

## Known Security Issues

### Critical (P0)

#### iOS CheckedContinuation Race Condition

**Status**: ⚠️ KNOWN ISSUE - Fix in progress

**Location**: `ios/DNSNative/DNSResolver.swift:91-132`

**Description**: Multiple concurrent DNS queries can cause double-resume of continuation, leading to app crash (SIGTERM).

**Impact**: Denial of service (app crash)

**Proof of Concept**:
```swift
// Vulnerable pattern
continuation.resume(returning: result)
// ... later in error path ...
continuation.resume(throwing: error)  // CRASH!
```

**Fix**: Add atomic boolean flag to prevent double-resume:
```swift
private var hasResumed = AtomicBool(false)
if !hasResumed.swap(true) {
  continuation.resume(returning: result)
}
```

**Workaround**: Avoid sending multiple rapid DNS queries in parallel until fixed.

### High Priority (P1)

#### Cross-Platform Sanitization Inconsistencies

**Status**: 🔍 Under Review

**Description**: Message sanitization differs between iOS and Android native modules, potentially allowing platform-specific exploits.

**Location**:
- iOS: `ios/DNSNative/DNSResolver.swift`
- Android: `modules/dns-native/android/`
- Shared: `modules/dns-native/constants.ts`

**Fix**: Standardize sanitization logic across all platforms using shared TypeScript function before native calls.

### Medium Priority (P2)

#### Resource Leaks on Network Failure

**Status**: 🔍 Under Review

**Description**: `NWConnection` objects not properly disposed when queries fail, leading to gradual memory leaks.

**Location**: `ios/DNSNative/DNSResolver.swift`

**Fix**: Ensure cleanup in all error paths:
```swift
defer {
  connection.cancel()
}
```

## Security Best Practices

### For Users

1. **Enable Device Passcode**: Required for iOS Keychain access control
2. **Keep App Updated**: Security fixes released regularly
3. **Avoid Sensitive Data**: DNS queries may be logged by network operators
4. **Use Trusted Networks**: Public WiFi can intercept DNS traffic
5. **Enable DoH**: Use DNS-over-HTTPS when privacy is critical

### For Developers

#### When Modifying DNS Code

1. **Always Sanitize Input**: Use `sanitizeMessage()` before DNS queries
2. **Validate Server Addresses**: Only allow whitelisted DNS servers
3. **Bounds Check Arrays**: Prevent buffer overflows in response parsing
4. **Handle Errors Gracefully**: Never crash on malformed responses
5. **Test Edge Cases**: Empty strings, special chars, maximum lengths

#### When Modifying Encryption Code

1. **Never Store Keys Plaintext**: Always use Keychain/Keystore
2. **Use Cryptographic RNG**: `crypto.getRandomValues()` for all random data
3. **Fail Fast on Errors**: Throw exceptions for crypto failures
4. **Test Migration Paths**: Ensure existing users don't lose data
5. **Validate Key Length**: Enforce 256-bit keys for AES-256

#### Code Review Checklist

- [ ] Input validation for all user-provided data
- [ ] Bounds checking for array/buffer access
- [ ] Error handling in all code paths
- [ ] Resource cleanup (connections, timers, threads)
- [ ] Thread safety for concurrent operations
- [ ] No hardcoded secrets or keys
- [ ] Appropriate logging (no sensitive data in logs)
- [ ] Test coverage for security-critical paths

## Incident Response

### Reporting Security Vulnerabilities

**DO NOT** open public GitHub issues for security vulnerabilities.

**Contact**: [@mneves75](https://x.com/mneves75) via X/Twitter DM

**Include**:
1. Vulnerability description
2. Steps to reproduce
3. Proof of concept (if applicable)
4. Impact assessment
5. Suggested fix (optional)

**Response Time**: 48-72 hours for initial acknowledgment

### Security Update Process

1. **Vulnerability Reported** → Triage within 72 hours
2. **Fix Developed** → Private testing and code review
3. **Release Prepared** → Version bump, changelog, migration guide
4. **Disclosure** → Public announcement with fix availability
5. **Post-Mortem** → Document lessons learned

### Emergency Response

For actively exploited vulnerabilities:

1. **Immediate Disclosure**: Warn users via GitHub and X/Twitter
2. **Hotfix Release**: Emergency patch within 24-48 hours
3. **Rollback Option**: Provide previous stable version if needed
4. **Incident Report**: Detailed timeline and remediation steps

## Security Testing

### Automated Testing

#### Test Coverage

- **Encryption**: `__tests__/encryptionService.crypto.spec.ts`
- **Storage Migration**: `__tests__/storageService.migration.spec.ts`
- **DNS Validation**: `__tests__/dnsService.spec.ts`
- **Rate Limiting**: `__tests__/dnsService.rateLimit.spec.ts`

#### Running Security Tests

```bash
# Run all tests
npm test

# Run specific security test suite
npm test -- encryptionService.crypto.spec.ts
npm test -- storageService.migration.spec.ts

# Run with coverage
npm test -- --coverage
```

### Manual Security Testing

#### Encryption Validation

```bash
# Test key generation and storage
1. Clear app data
2. Create new conversation
3. Verify key exists in Keychain/Keystore (not AsyncStorage)
4. Verify conversation data is encrypted in AsyncStorage

# Test migration
1. Downgrade to v1.x
2. Create conversations (stored plaintext)
3. Upgrade to v2.1.0+
4. Verify automatic encryption migration
5. Verify keys moved to Keychain/Keystore
```

#### DNS Security Testing

```bash
# Test input sanitization
node test-dns-simple.js "Test' OR '1'='1"  # Should sanitize
node test-dns-simple.js "$(rm -rf /)"       # Should sanitize
node test-dns-simple.js "A".repeat(100)     # Should truncate

# Test server whitelisting
# Modify code to use unauthorized server
# Verify rejection with security warning

# Test malformed responses
# Proxy DNS queries through intercepting tool
# Send malformed TXT records
# Verify graceful error handling (no crash)
```

#### Resource Leak Testing

```bash
# iOS memory profiling
1. Open project in Xcode
2. Run with Instruments (Leaks tool)
3. Send 100+ DNS queries rapidly
4. Verify no memory leaks
5. Check NWConnection cleanup

# Android memory profiling
1. Open project in Android Studio
2. Run with Profiler
3. Send 100+ DNS queries rapidly
4. Verify no memory growth
5. Check DnsResolver cleanup
```

### Penetration Testing

Consider periodic professional security audits:

1. **Static Analysis**: Code review for vulnerabilities
2. **Dynamic Analysis**: Runtime vulnerability testing
3. **Cryptographic Review**: Validate encryption implementation
4. **Network Analysis**: Test DNS query security
5. **Mobile Security**: iOS/Android platform-specific issues

### Security Metrics

Track these metrics over time:

- **Encryption Coverage**: % of conversations encrypted
- **Key Migration Success**: % of users successfully migrated
- **DNS Validation Failures**: # of rejected queries
- **Crash Rate**: SIGTERM crashes per 1000 sessions
- **Memory Usage**: Peak memory during DNS operations
- **Test Coverage**: % of security-critical code tested

---

## Security Changelog

### v2.1.0 (Current)

**Added**:
- Real iOS Keychain and Android Keystore integration
- Fail-fast Web Crypto validation
- Encrypted backup snapshots (no more plaintext exposure)
- Automatic migration from legacy AsyncStorage

**Fixed**:
- Plaintext backup vulnerability
- Key storage in unencrypted AsyncStorage

### v2.0.1

**Added**:
- DNS injection protection (input validation)
- DNS server whitelisting
- Thread safety in iOS native module (NSLock)
- Bounded thread pools in Android
- Proper resource cleanup

**Fixed**:
- DNS injection vulnerabilities
- Race conditions in CheckedContinuation (partial - P0 remains)
- Resource leaks on network errors (partial - P2 remains)

### v1.x (Deprecated)

**Security Issues**:
- ❌ No encryption (plaintext storage)
- ❌ No DNS input validation
- ❌ No thread safety
- ❌ Resource leaks
- ❌ No server whitelisting

**Migration**: All v1.x users automatically migrated to v2.1.0 encryption on first app launch.

---

**Last Updated**: 2025-09-29
**Security Contact**: [@mneves75](https://x.com/mneves75)
**License**: MIT (see LICENSE file)