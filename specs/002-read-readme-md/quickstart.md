# DNSChat Quickstart Guide

**Date**: 2025-09-28
**Feature**: DNS-Based AI Communication App

## Prerequisites

- Node.js 18+ and npm
- iOS: Xcode 15+ with iOS 16+ simulator
- Android: Android Studio with API 21+ emulator
- Java 17 (automatically configured by build scripts)

## Quick Setup

### 1. Install Dependencies
```bash
cd /Users/mvneves/dev/MOBILE/chat-dns
npm install
```

### 2. Set Up iOS (macOS only)
```bash
npm run fix-pods  # Fix CocoaPods if needed
```

### 3. Start Development Server
```bash
npm start
```

### 4. Run on Platform
```bash
# iOS
npm run ios

# Android
npm run android
```

## Core User Journey Validation

### Test 1: Send First Message
**Objective**: Verify basic DNS-based messaging works

1. **Launch app** on simulator/emulator
2. **Expected**: App loads within 3 seconds, shows chat interface
3. **Type message**: "Hello, can you help me test DNS messaging?"
4. **Tap send button**
5. **Expected**:
   - Message appears in chat history immediately
   - "Sending..." indicator shows
   - AI response received within 10 seconds
   - Response appears in chat interface

**Success Criteria**:
- ✅ Message sent successfully via DNS
- ✅ AI response received and displayed
- ✅ No errors in DNS query logs
- ✅ Message marked as "sent" → "received"

### Test 2: DNS Fallback Mechanism
**Objective**: Verify automatic fallback when primary DNS method fails

1. **Enable developer logs** in settings
2. **Send message**: "Test fallback mechanisms"
3. **Watch logs section** for fallback attempts
4. **Expected**:
   - Primary method tried first (native iOS/Android)
   - If primary fails, UDP fallback attempted
   - If UDP fails, TCP fallback attempted
   - If TCP fails, DoH fallback attempted
   - Message eventually succeeds or shows clear error

**Success Criteria**:
- ✅ Fallback chain executes in correct order
- ✅ User sees progress during fallback attempts
- ✅ Message eventually delivers successfully
- ✅ DNS logs show all attempted methods

### Test 3: Rate Limiting
**Objective**: Verify rate limiting prevents spam and shows user feedback

1. **Send 5 messages quickly** in succession
2. **Continue sending messages** rapidly
3. **Expected**:
   - First 60 messages within a minute succeed
   - 61st message shows rate limit warning
   - User sees countdown timer until rate limit resets
   - Messages queue for retry after cooldown

**Success Criteria**:
- ✅ Rate limit enforced at 60 messages/minute
- ✅ Clear user feedback when rate limited
- ✅ Messages queue and retry automatically
- ✅ No messages lost during rate limiting

### Test 4: Conversation History
**Objective**: Verify persistent storage and conversation management

1. **Send several messages** in a conversation
2. **Create new conversation**
3. **Switch between conversations**
4. **Close and reopen app**
5. **Expected**:
   - All conversations persist across app restarts
   - Message history preserved correctly
   - Timestamps and delivery status maintained
   - Search/navigation works smoothly

**Success Criteria**:
- ✅ Conversations persist across app restarts
- ✅ Message history complete and accurate
- ✅ Conversation metadata (title, timestamp) correct
- ✅ No data loss or corruption

### Test 5: Network Resilience
**Objective**: Verify app handles network interruptions gracefully

1. **Start sending a message**
2. **Disable WiFi during send process**
3. **Enable cellular data**
4. **Expected**:
   - App detects network change
   - Message retry automatically with new connection
   - User informed of retry attempts
   - Message eventually succeeds

**Success Criteria**:
- ✅ Network changes detected automatically
- ✅ Messages retry on network restoration
- ✅ User feedback during connectivity issues
- ✅ No messages lost during network transitions

## Configuration Testing

### DNS Server Configuration
**Test custom server behavior**:
1. **Go to Settings** → DNS Configuration
2. **Attempt to add custom server**
3. **Expected**: Custom servers blocked per security policy (FR-015)
4. **Verify**: Only whitelisted servers (ch.at, Google DNS, Cloudflare) available

### Theme and Accessibility
**Test UI adaptability**:
1. **Switch between light/dark themes**
2. **Change font sizes**
3. **Enable high contrast mode**
4. **Expected**: UI adapts smoothly, remains usable

## Performance Validation

### App Launch Performance
- **Target**: App ready for input within 3 seconds
- **Test**: Time from tap to first interaction capability
- **Measure**: Use Xcode/Android Studio profiler

### DNS Query Performance
- **Target**: Queries complete within 10 seconds
- **Test**: Send messages and monitor response times
- **Measure**: Check DNS logs for timing data

### Memory Usage
- **Monitor**: App memory usage during extended chat sessions
- **Target**: Stable memory usage, no significant leaks
- **Test**: Long chat sessions with periodic memory checks

## Troubleshooting Quick Tests

### iOS Build Issues
```bash
npm run fix-pods
npm run clean-ios
npm run ios
```

### Android Build Issues
```bash
# Ensure Java 17
npm run android

# Or try system Java
npm run android:java24
```

### DNS Connectivity Issues
```bash
# Test basic DNS functionality
node test-dns-simple.js "test message"

# Test with fallback logging
node test-dns-simple.js --experimental

# Run comprehensive DNS tests
npm run dns:harness
```

### TypeScript Issues
```bash
npm run typecheck
```

## Acceptance Criteria Validation

This quickstart guide validates all functional requirements:

- ✅ **FR-001**: DNS TXT queries to AI services
- ✅ **FR-002**: Conversational chat interface
- ✅ **FR-003**: Multi-method DNS fallback
- ✅ **FR-004**: Input sanitization and injection prevention
- ✅ **FR-005**: Cross-platform deployment (iOS 16+, Android API 21+)
- ✅ **FR-006**: Encrypted local storage with indefinite retention
- ✅ **FR-007**: Real-time DNS logging with 30-day retention
- ✅ **FR-008**: User-configurable DNS preferences
- ✅ **FR-009**: Rate limiting (60 messages/minute)
- ✅ **FR-010**: Network transition handling
- ✅ **FR-011**: Light/dark theme support
- ✅ **FR-012**: Platform accessibility compliance
- ✅ **FR-013**: 10-second DNS query timeout
- ✅ **FR-014**: Background/foreground state preservation
- ✅ **FR-015**: DNS server whitelist enforcement

## Next Steps

After successful quickstart validation:

1. **Run full test suite**: `npm test`
2. **Test on physical devices**: Deploy to actual iOS/Android devices
3. **Performance profiling**: Use platform tools for detailed analysis
4. **Security testing**: Validate input sanitization and encryption
5. **Accessibility testing**: Test with screen readers and accessibility tools

## Support

- **DNS Issues**: Check logs in Settings → DNS Logs
- **Build Issues**: See CLAUDE.md troubleshooting section
- **Performance Issues**: Use platform profiling tools
- **General Issues**: Check existing documentation in `/docs/`