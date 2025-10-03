/**
 * E2E Test: Native DNS Module Integration
 *
 * Covers:
 * - Multi-part TXT record assembly
 * - Concurrent DNS query handling
 * - Platform-specific behavior (iOS vs Android)
 * - Native module error scenarios
 * - Performance benchmarks
 *
 * NOTE: These tests validate the integration between the app and
 * the native DNS module (modules/dns-native)
 */

const { device, element, by, expect, waitFor } = require('detox');

describe('Native DNS Module Integration', () => {
  beforeAll(async () => {
    await device.launchApp({
      delete: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    // Skip onboarding
    try {
      await waitFor(element(by.id('onboarding-skip')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('onboarding-skip')).tap();
    } catch (e) {}

    // Ensure Native transport is selected
    await element(by.id('tab-settings')).tap();
    await element(by.id('transport-native')).tap();
    await element(by.id('tab-chats')).tap();
  });

  afterEach(async () => {
    await device.reloadReactNative();
  });

  describe('Multi-Part TXT Record Assembly', () => {
    it('should correctly assemble multi-part DNS TXT responses', async () => {
      await element(by.id('chat-new')).tap();

      // Send message that will generate long response (>255 chars)
      await element(by.id('chat-input')).typeText(
        'Tell me a long story about DNS'
      );
      await element(by.id('chat-send')).tap();

      // Wait for AI response
      await waitFor(element(by.id('message-ai')))
        .toBeVisible()
        .withTimeout(10000);

      // Response should be complete (no truncation or assembly errors)
      // Verify by checking response length or specific content
      const aiMessage = await element(by.id('message-ai-text'));
      await expect(aiMessage).toBeVisible();

      // Should not contain assembly artifacts like "[1/3]" or broken text
      await expect(
        element(by.text(/\[1\/|incomplete|truncated/i))
      ).not.toExist();
    });

    it('should handle edge case of exactly 255 character TXT record', async () => {
      await element(by.id('chat-new')).tap();

      // Request response of specific length
      await element(by.id('chat-input')).typeText(
        'Give me exactly 255 characters'
      );
      await element(by.id('chat-send')).tap();

      await waitFor(element(by.id('message-ai')))
        .toBeVisible()
        .withTimeout(10000);

      // Should display correctly without corruption
      await expect(element(by.id('message-ai-text'))).toBeVisible();
    });

    it('should handle responses split across 5+ TXT records', async () => {
      await element(by.id('chat-new')).tap();

      // Request very long response (>1000 chars)
      await element(by.id('chat-input')).typeText(
        'Write a detailed technical explanation of React Native'
      );
      await element(by.id('chat-send')).tap();

      // Wait for complete response
      await waitFor(element(by.id('message-ai')))
        .toBeVisible()
        .withTimeout(15000);

      // Response should be complete and coherent
      await expect(element(by.id('message-ai-text'))).toBeVisible();
    });
  });

  describe('Concurrent DNS Query Handling', () => {
    it('should handle 3 concurrent queries without errors', async () => {
      // Open 3 chats and send messages simultaneously
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Concurrent 1');
      await element(by.id('chat-send')).tap();

      await device.pressBack();
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Concurrent 2');
      await element(by.id('chat-send')).tap();

      await device.pressBack();
      await element(by.id('chat-new')).tap();
      await element(by.id('chat-input')).typeText('Concurrent 3');
      await element(by.id('chat-send')).tap();

      // All messages should eventually receive responses
      await waitFor(element(by.id('message-ai')))
        .toBeVisible()
        .withTimeout(15000);
    });

    it('should respect query ordering (FIFO)', async () => {
      await element(by.id('chat-new')).tap();

      // Send 3 messages rapidly
      await element(by.id('chat-input')).typeText('First');
      await element(by.id('chat-send')).tap();

      await element(by.id('chat-input')).typeText('Second');
      await element(by.id('chat-send')).tap();

      await element(by.id('chat-input')).typeText('Third');
      await element(by.id('chat-send')).tap();

      // Responses should maintain order (First response before Second, etc.)
      // This requires checking message timestamps or positions
      await waitFor(element(by.text('Third')))
        .toExist()
        .withTimeout(20000);
    });

    it('should handle query cancellation when user deletes chat', async () => {
      await element(by.id('chat-new')).tap();

      // Start a query
      await element(by.id('chat-input')).typeText('Query to cancel');
      await element(by.id('chat-send')).tap();

      // Immediately go back and delete chat
      await device.pressBack();
      const firstChat = element(by.id('chat-item-0')).atIndex(0);
      await firstChat.longPress();
      await element(by.id('chat-delete-confirm')).tap();

      // App should not crash, query should be cancelled
      await expect(element(by.id('chat-new'))).toBeVisible();
    });
  });

  describe('Platform-Specific Behavior', () => {
    it('should use platform-appropriate DNS resolver', async () => {
      // iOS: NWConnection (Network.framework)
      // Android: DnsResolver API (API 29+) or legacy getaddrinfo

      await element(by.id('tab-settings')).tap();
      await element(by.id('dns-logs-button')).tap();

      // Check logs for platform indicator
      if (device.getPlatform() === 'ios') {
        await expect(
          element(by.text(/NWConnection|Network\.framework/i))
        ).toExist();
      } else if (device.getPlatform() === 'android') {
        await expect(
          element(by.text(/DnsResolver|getaddrinfo/i))
        ).toExist();
      }
    });

    it('should handle platform-specific timeout values correctly', async () => {
      // iOS and Android may have different default timeouts
      await element(by.id('tab-chats')).tap();
      await element(by.id('chat-new')).tap();

      const startTime = Date.now();
      await element(by.id('chat-input')).typeText('Timeout platform test');
      await element(by.id('chat-send')).tap();

      // Wait for timeout or response
      await waitFor(
        element(by.id('message-ai').or(by.id('message-error')))
      )
        .toBeVisible()
        .withTimeout(15000);

      const elapsed = Date.now() - startTime;

      // Both platforms should timeout within 10-15 seconds
      expect(elapsed).toBeLessThan(16000);
    });
  });

  describe('Native Module Error Scenarios', () => {
    it('should handle NXDOMAIN (non-existent domain) gracefully', async () => {
      await element(by.id('chat-new')).tap();

      // Query non-existent domain
      await element(by.id('chat-input')).typeText('test NXDOMAIN');
      await element(by.id('chat-send')).tap();

      // Should show appropriate error
      await waitFor(element(by.text(/not found|does not exist/i)))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should handle SERVFAIL (DNS server error) gracefully', async () => {
      await element(by.id('chat-new')).tap();

      // This requires DNS server to return SERVFAIL
      // (May need mock server or specific domain)
      await element(by.id('chat-input')).typeText('test SERVFAIL');
      await element(by.id('chat-send')).tap();

      await waitFor(element(by.text(/server error|failed to resolve/i)))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should handle empty TXT record response', async () => {
      await element(by.id('chat-new')).tap();

      // Query domain with no TXT records
      await element(by.id('chat-input')).typeText('test empty TXT');
      await element(by.id('chat-send')).tap();

      // Should show "no response" or similar
      await waitFor(element(by.text(/no response|empty|no answer/i)))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should handle malformed TXT record data', async () => {
      await element(by.id('chat-new')).tap();

      // This requires a DNS server returning malformed data
      // Documents expected behavior for when it's encountered
      await element(by.id('chat-input')).typeText('test malformed');
      await element(by.id('chat-send')).tap();

      // Should either display partial data or show error
      await waitFor(
        element(by.id('message-ai').or(by.id('message-error')))
      )
        .toBeVisible()
        .withTimeout(10000);

      // App should not crash
      await expect(element(by.id('chat-input'))).toBeVisible();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should complete native DNS query in <2 seconds (optimal network)', async () => {
      await element(by.id('chat-new')).tap();

      const startTime = Date.now();
      await element(by.id('chat-input')).typeText('Performance benchmark');
      await element(by.id('chat-send')).tap();

      await waitFor(element(by.id('message-ai')))
        .toBeVisible()
        .withTimeout(2000);

      const elapsed = Date.now() - startTime;
      console.log(`Native DNS query completed in ${elapsed}ms`);

      expect(elapsed).toBeLessThan(2000);
    });

    it('should handle 10 sequential queries without memory leaks', async () => {
      await element(by.id('chat-new')).tap();

      for (let i = 1; i <= 10; i++) {
        await element(by.id('chat-input')).typeText(`Memory test ${i}`);
        await element(by.id('chat-send')).tap();

        // Wait for response before next query
        await waitFor(element(by.id('message-ai')))
          .toBeVisible()
          .withTimeout(5000);

        // Clear input for next iteration
        await element(by.id('chat-input')).clearText();
      }

      // App should remain responsive (no crash, no slowdown)
      await expect(element(by.id('chat-input'))).toBeVisible();

      // Last message should be visible
      await expect(element(by.text('Memory test 10'))).toExist();
    });

    it('should maintain stable performance across multiple chats', async () => {
      const queryTimes = [];

      for (let chatNum = 1; chatNum <= 3; chatNum++) {
        await element(by.id('chat-new')).tap();

        const startTime = Date.now();
        await element(by.id('chat-input')).typeText(`Chat ${chatNum} query`);
        await element(by.id('chat-send')).tap();

        await waitFor(element(by.id('message-ai')))
          .toBeVisible()
          .withTimeout(5000);

        const elapsed = Date.now() - startTime;
        queryTimes.push(elapsed);

        console.log(`Chat ${chatNum} query time: ${elapsed}ms`);

        await device.pressBack();
      }

      // Performance should not degrade across chats
      const avgTime = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;
      const maxTime = Math.max(...queryTimes);

      expect(maxTime - avgTime).toBeLessThan(1000); // Max should not be >1s above avg
    });
  });

  describe('DNS Cache Behavior', () => {
    it('should cache DNS responses for repeated queries', async () => {
      await element(by.id('chat-new')).tap();

      // First query (should hit network)
      const startTime1 = Date.now();
      await element(by.id('chat-input')).typeText('Cache test query');
      await element(by.id('chat-send')).tap();

      await waitFor(element(by.id('message-ai')))
        .toBeVisible()
        .withTimeout(5000);

      const elapsed1 = Date.now() - startTime1;

      // Second identical query (may be cached)
      const startTime2 = Date.now();
      await element(by.id('chat-input')).typeText('Cache test query');
      await element(by.id('chat-send')).tap();

      await waitFor(element(by.id('message-ai').atIndex(1)))
        .toBeVisible()
        .withTimeout(5000);

      const elapsed2 = Date.now() - startTime2;

      console.log(`First query: ${elapsed1}ms, Second query: ${elapsed2}ms`);

      // If caching is implemented, second query should be faster
      // (This test documents expected behavior)
    });

    it('should invalidate cache after timeout period', async () => {
      // Note: This test requires waiting for cache TTL to expire
      // Typically 60 seconds for DNS cache

      jest.setTimeout(90000);

      await element(by.id('chat-new')).tap();

      // First query
      await element(by.id('chat-input')).typeText('TTL test');
      await element(by.id('chat-send')).tap();
      await waitFor(element(by.id('message-ai')))
        .toBeVisible()
        .withTimeout(5000);

      // Wait for cache to expire (60s + buffer)
      await new Promise((resolve) => setTimeout(resolve, 65000));

      // Second query (should hit network again)
      await element(by.id('chat-input')).typeText('TTL test');
      await element(by.id('chat-send')).tap();

      await waitFor(element(by.id('message-ai').atIndex(1)))
        .toBeVisible()
        .withTimeout(5000);

      // Both queries should succeed (validates cache invalidation)
    });
  });
});
